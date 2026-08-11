import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { sendQuoteToCustomer, sendScheduleConfirmation, sendInvoiceToCustomer } from '@/lib/email';
import { can, type PlanTier } from '@/lib/permissions';
import { formatPhone } from '@/lib/emailTemplates';
import { stripe } from '@/lib/stripe'
import { autoAdvanceStatus } from '@/lib/statusAutomation';
import { getOrCreateCheckoutSession } from '@/lib/stripe/getOrCreateCheckoutSession';
import { getSchedulingConfig } from '@/lib/schedulingConfig';


export async function POST(request: Request) {
  try {
    const body = await request.json();

    // ── Auth check (public actions bypass) ─────────────────
  const publicActions = ['update_lead_step2'];
if (!publicActions.includes(body.action)) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  let decoded: any;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
  }

  const checkSql = neon(process.env.DATABASE_URL!);
  const ownerCheck = await checkSql`SELECT company_id FROM leads WHERE id = ${body.id} LIMIT 1`;
  if (ownerCheck.length === 0 || ownerCheck[0].company_id !== decoded.companyId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
  }
}

    const { 
      id,
      status, 
      notes, 
      action,
      user_name,
      user_email,
      old_status,
     // Project fields
      payment_status,
      payment_amount,
      scheduled_date,
      scheduled_time,
     scheduled_end_time,
      event_location,
      assigned_to,
      additional_assignees,
      estimated_hours,
      actual_hours,
      quote_data,
      quote_total,
      quote_tax_rate,
      follow_up_date,  
      follow_up_notes,
      internal_notes,
      payment_due_date, 
      due_date, 
    } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // 🔍 DEBUG: Log the extracted values immediately

    // 🔥 Helper function to add activity to projects.notes
    const addActivityToProject = async (leadId: number, activityEntry: any) => {
      const lead = await sql`SELECT project_id FROM leads WHERE id = ${leadId}`;
      
      if (!lead[0]?.project_id) {
        console.warn('⚠️ No project found for lead', leadId);
        return;
      }

      const projectId = lead[0].project_id;

      // Get existing notes from projects table
      const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
      
      
      let existingNotes = [];
      try {
        const rawNotes = project[0]?.notes;
        
        if (!rawNotes) {
          existingNotes = [];
        } else if (typeof rawNotes === 'string') {
          existingNotes = JSON.parse(rawNotes);
        } else if (Array.isArray(rawNotes)) {
          existingNotes = rawNotes;
        } else {
          console.warn('⚠️ Unexpected notes format:', typeof rawNotes);
          existingNotes = [];
        }
      } catch (e) {
        console.error('❌ Failed to parse existing notes:', e);
        existingNotes = [];
      }

      
      existingNotes.push(activityEntry);
      

      // Update projects.notes
      await sql`
        UPDATE projects 
        SET notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${projectId}
      `;
      
    };

   // ==================== UPDATE STATUS ====================
// ==================== UPDATE STATUS ====================
if (action === 'update_status') {

  await sql`
    UPDATE leads 
    SET status = ${status},
        updated_at = NOW()
    WHERE id = ${id}
  `;

  // Keep projects.status in sync with leads.status for converted leads.
  // No-op if this lead has no project yet (WHERE clause matches zero rows).
  await sql`
    UPDATE projects
    SET status = ${status},
        updated_at = NOW()
    WHERE lead_id = ${id}
  `;

  const statusChangeEntry = {
    type: 'status_change',
    old_status: old_status,
    new_status: status,
    user_name: user_name,
    user_email: user_email,
    timestamp: new Date().toISOString()
  };

  await addActivityToProject(id, statusChangeEntry);

 // Opt-out rather than opt-in: anything else calling this route without the
  // flag keeps the old automatic behaviour.
  if (status === 'completed' && old_status !== 'completed' && body.send_review_request !== false) {
    const projectData = await sql`
      SELECT p.id, p.review_request_sent_at, l.email as customer_email, l.name as customer_name, l.category, p.company_id
      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      WHERE l.id = ${id}
      LIMIT 1
    `;
    const proj = projectData[0];
    if (proj?.company_id && proj?.customer_email && !proj?.review_request_sent_at) {
      try {
        const { sendGoogleReviewRequestEmail } = await import('@/lib/email');
        await sendGoogleReviewRequestEmail({
          customerEmail: proj.customer_email,
          customerName: proj.customer_name,
          companyId: proj.company_id,
          jobCategory: proj.category,
        });
       if (proj.id) {
  await sql`
    UPDATE projects
    SET review_request_sent_at = NOW()
    WHERE id = ${proj.id}
  `;
  await addActivityToProject(id, {
    type: 'review_request_sent',
    text: `Google review request sent to ${proj.customer_email}`,
    user_name: 'System',
    user_email: '',
    timestamp: new Date().toISOString(),
  });
}
      } catch (reviewErr) {
        console.error('Review email failed (non-blocking):', reviewErr);
      }
    }
  }

  return NextResponse.json({ success: true });
}
    // ==================== ADD NOTE ====================
    else if (action === 'add_note') {
      
      const newNote = {
        type: 'note',
        text: notes,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      await addActivityToProject(id, newNote);

      return NextResponse.json({ success: true });
    }

    // ==================== CREATE PROJECT ====================
    else if (action === 'create_project') {
      
      // Get complete lead data
      const leadCheck = await sql`SELECT * FROM leads WHERE id = ${id}`;

      if (!leadCheck[0]) {
        throw new Error('Lead not found');
      }

      if (leadCheck[0].project_id) {
        return NextResponse.json({ 
          success: false, 
          error: 'Project already exists for this lead',
          project_id: leadCheck[0].project_id 
        });
      }

      const leadData = leadCheck[0];

      // Get company data including form_categories for task templates
      const companyResult = await sql`
        SELECT form_categories 
        FROM companies 
        WHERE id = ${leadData.company_id}
      `;
      const formCategories = companyResult[0]?.form_categories || [];

      // Get next project number for this company
      const maxProjectNumber = await sql`
        SELECT COALESCE(MAX(p.project_number), 0) as max_num
        FROM projects p
        JOIN leads l ON p.lead_id = l.id
        WHERE l.company_id = ${leadData.company_id}
      `;
      
      const nextProjectNumber = (maxProjectNumber[0]?.max_num || 0) + 1;

      // Parse lead notes to copy to project
      let leadNotes = [];
      try {
        leadNotes = leadData.notes ? JSON.parse(leadData.notes) : [];
      } catch {
        leadNotes = [];
      }

      // Create project with lead data (including zip_code)
      const projectResult = await sql`
        INSERT INTO projects (
          lead_id,
          project_number,
          customer_name,
          customer_email,
          customer_phone,
          service_address,
          address_line_2,
          city,
          zip_code,
          category,
          status,
          company_id,
          invoice_number,
          notes,
          before_photos,
          after_photos,
          scheduled_date,
          scheduled_time,
          scheduled_end_time,
          created_at,
          updated_at
        ) VALUES (
          ${id},
          ${nextProjectNumber},
          ${leadData.name},
          ${leadData.email},
          ${leadData.phone},
          ${leadData.address_line_1 || null},
          ${leadData.address_line_2 || null},
          ${leadData.city || null},
          ${leadData.zip_code || null},
         ${leadData.category || null},
          'active',
${leadData.company_id || null},
${'INV-' + String(nextProjectNumber).padStart(3, '0')},
          ${JSON.stringify(leadNotes)},
          '[]'::jsonb,
          '[]'::jsonb,
          ${leadData.preferred_date || null},
          ${leadData.preferred_time || null},
          ${leadData.preferred_end_time || null},
          NOW(),
          NOW()
        )
        RETURNING id, project_number
      `;

      const projectId = projectResult[0].id;
      const projectNumber = projectResult[0].project_number;

      // AUTO-CREATE TASKS FROM CATEGORY TEMPLATES
      const leadCategory = formCategories.find((cat: any) => cat.value === leadData.category);

      if (leadCategory?.task_templates && leadCategory.task_templates.length > 0) {
        
        const sortedTasks = [...leadCategory.task_templates].sort((a: any, b: any) => a.order - b.order);
        
        for (const taskTemplate of sortedTasks) {
          await sql`
            INSERT INTO tasks (
              project_id,
              company_id,
              label,
              completed,
              task_order,
              created_at
            ) VALUES (
              ${projectId},
              ${leadData.company_id},
              ${taskTemplate.label},
              false,
              ${taskTemplate.order},
              NOW()
            )
          `;
        }
        
      }

      // Update lead with project_id
      await sql`
  UPDATE leads 
  SET 
    project_id = ${projectId},
    updated_at = NOW()
  WHERE id = ${id}
`;

      // Add creation note to project
      const projectNotes = [...leadNotes, {
        type: 'project_created',
        text: `Project #${projectNumber} created from Lead #${id} by ${user_name}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      }];

      await sql`
        UPDATE projects 
        SET notes = ${JSON.stringify(projectNotes)}
        WHERE id = ${projectId}
      `;

      
   const movedTo = await autoAdvanceStatus(sql, id, 'lead_converted');
      if (movedTo) {
        await addActivityToProject(id, {
          type: 'status_change',
          text: `Moved to ${movedTo} automatically — converted to a project`,
          user_name: 'System',
          user_email: '',
          timestamp: new Date().toISOString(),
        });
      }

    

      return NextResponse.json({ 
        success: true, 
        project_id: projectId,
        project_number: projectNumber,
        message: `Project #${projectNumber} created successfully`
      });
    }

    // ==================== UPDATE INTERNAL NOTES ====================
    if (action === 'update_internal_notes') {
      const projects = await sql`
        SELECT id FROM projects WHERE lead_id = ${id}
      `;

      if (projects.length === 0) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      const projectId = projects[0].id;

      await sql`
        UPDATE projects
        SET 
          internal_notes = ${internal_notes},
          updated_at = NOW()
        WHERE id = ${projectId}
      `;

      await sql`
        UPDATE leads
        SET notes = COALESCE(notes::jsonb, '[]'::jsonb) || ${JSON.stringify([{
          type: 'internal_notes_updated',
          text: 'Updated internal notes',
          user_name,
          user_email,
          timestamp: new Date().toISOString()
        }])}::jsonb
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    }

   // ==================== UPDATE PROJECT ====================
    else if (action === 'update_project') {
      
      const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${id}`;
      const projectId = leadCheck[0]?.project_id;

      if (!projectId) {
        return NextResponse.json({ 
          success: false, 
          error: 'No project exists for this lead. Please create a project first.' 
        }, { status: 400 });
      }

      // ── Buffer conflict check (industry-gated) ──────────────────
      // Only runs when SCHEDULING_CONFIG has a buffer > 0 for this company's
      // business_type. Reads it server-side rather than trusting the client
      // to send it — the buffer value is a business rule, not user input.
     if (assigned_to && scheduled_date && scheduled_time) {
        const companyRow = await sql`
          SELECT c.business_type, p.company_id
          FROM projects p
          JOIN companies c ON c.id = p.company_id
          WHERE p.id = ${projectId}
        `;
        const companyId = companyRow[0]?.company_id;
        const { bufferMinutes: defaultBufferMinutes } = getSchedulingConfig(companyRow[0]?.business_type);

        if (defaultBufferMinutes > 0) {
          const sameDay = await sql`
            SELECT id, scheduled_time, scheduled_end_time
            FROM projects
            WHERE company_id = ${companyId}
              AND assigned_to = ${assigned_to}
              AND id != ${projectId}
              AND scheduled_date::date = ${scheduled_date}::date
              AND status != 'cancelled'
          `;

          const toMinutes = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
          };

          const newStart = toMinutes(scheduled_time);
          const newEnd = scheduled_end_time ? toMinutes(scheduled_end_time) : newStart;

          const conflict = sameDay.find((row: any) => {
            const existingStart = toMinutes(row.scheduled_time);
            const existingEnd = row.scheduled_end_time ? toMinutes(row.scheduled_end_time) : existingStart;
            return (
              newStart < existingEnd + defaultBufferMinutes &&
              newEnd + defaultBufferMinutes > existingStart
            );
          });

          if (conflict) {
            return NextResponse.json({
              success: false,
              error: `${assigned_to} already has a booking too close to this time (needs a ${defaultBufferMinutes}-minute buffer).`,
              conflict_project_id: conflict.id,
            }, { status: 409 });
          }
        }
      }

    await sql`
        UPDATE projects 
        SET 
          scheduled_date = ${scheduled_date || null},
          scheduled_time = ${scheduled_time || null},
         scheduled_end_time = ${scheduled_end_time || null},
          event_location = ${event_location || null},
          assigned_to = ${assigned_to || null},
          additional_assignees = ${JSON.stringify(additional_assignees || [])}::jsonb,
          estimated_hours = ${estimated_hours || null},
          actual_hours = ${actual_hours || null},
          follow_up_date = ${body.follow_up_date !== undefined ? body.follow_up_date : sql`follow_up_date`},
          follow_up_notes = ${body.follow_up_notes !== undefined ? body.follow_up_notes : sql`follow_up_notes`},
          updated_at = NOW()
        WHERE id = ${projectId}
      `;

      let noteText = 'Project updated';
      if (scheduled_date) noteText += ` - Scheduled: ${scheduled_date}`;
      if (assigned_to) noteText += `, Assigned to: ${assigned_to}`;
      if (body.follow_up_date) noteText += `, Reminder set: ${body.follow_up_date}`;

      const projectUpdateEntry = {
        type: 'project_updated',
        text: noteText,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      await addActivityToProject(id, projectUpdateEntry);

      if (scheduled_date) {
        const movedTo = await autoAdvanceStatus(sql, id, 'job_scheduled');
        if (movedTo) {
          await addActivityToProject(id, {
            type: 'status_change',
            text: `Moved to ${movedTo} automatically — job scheduled`,
            user_name: 'System',
            user_email: '',
            timestamp: new Date().toISOString(),
          });
        }
      }

      return NextResponse.json({ success: true });
    }
    
    // ==================== SAVE QUOTE ====================
    else if (action === 'save_quote') {
      
     const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${id}`;
      const projectId = leadCheck[0]?.project_id;

      if (!projectId) {
        return NextResponse.json({ 
          success: false, 
          error: 'No project exists. Please create a project first.' 
        }, { status: 400 });
      }

      // Pull deposit terms from the category's pricing template, but only onto
      // a job that has none yet and hasn't collected anything. After the first
      // quote save the project owns its terms — otherwise a contractor who
      // overrode 50% to 30% in Billing would lose it on the next quote edit.
      // Consequence: changing a category template later doesn't propagate to
      // existing jobs. Same rule tax rates already follow.
      const depositCheck = await sql`
        SELECT category, deposit_type, COALESCE(payment_amount, 0) AS collected, company_id
        FROM projects WHERE id = ${projectId} LIMIT 1
      `;
      const dep = depositCheck[0];

      if (dep && !dep.deposit_type && parseFloat(dep.collected || '0') === 0 && dep.category) {
        const tpl = await sql`
          SELECT deposit_type, deposit_value
          FROM quote_templates
          WHERE company_id = ${dep.company_id} AND category = ${dep.category}
          LIMIT 1
        `;
        const t = tpl[0];
        if (t?.deposit_type && Number(t.deposit_value) > 0) {
          await sql`
            UPDATE projects
            SET deposit_type = ${t.deposit_type},
                deposit_value = ${Number(t.deposit_value)}
            WHERE id = ${projectId}
          `;
        }
      }

console.log('save_quote tax rate received:', quote_tax_rate, typeof quote_tax_rate);

   // Get current payment amount before updating
await sql`

  UPDATE projects
  SET
    quote_data     = ${JSON.stringify(quote_data)},
    quote_total    = ${quote_total},
    quote_tax_rate = ${quote_tax_rate ?? 0},
    updated_at     = NOW()
  WHERE id = ${projectId}
`;

// quote_total changed, so payment_status may be stale. Nudge the trigger
// instead of writing the column here — sync_project_payment_totals owns it,
// and the old manual write clobbered the 'refunded' states the trigger
// deliberately preserves. No-op when the job has no payments yet.
await sql`
  UPDATE payments
  SET amount = amount
  WHERE id = (
    SELECT id FROM payments WHERE project_id = ${projectId} ORDER BY id DESC LIMIT 1
  )
`;

      const quoteEntry = {
        type: 'quote_created',
        text: `Quote created - Total: $${quote_total}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      await addActivityToProject(id, quoteEntry);

      return NextResponse.json({ success: true });
    }


    // ==================== MARK QUOTE ACCEPTED ====================
else if (action === 'mark_quote_accepted') {
  const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${id}`;
  const projectId = leadCheck[0]?.project_id;

  if (!projectId) {
    return NextResponse.json({ success: false, error: 'No project exists.' }, { status: 400 });
  }

  // Clears the token so the emailed Accept link can't fire a second time,
  // and clears any prior decline — the customer changed their mind.
  await sql`
    UPDATE projects
    SET quote_accepted_at = COALESCE(quote_accepted_at, NOW()),
        quote_declined_at = NULL,
        quote_token = NULL,
        updated_at = NOW()
    WHERE id = ${projectId}
  `;

  await addActivityToProject(id, {
    type: 'quote_accepted',
    text: 'Quote marked accepted manually',
    user_name,
    user_email,
    timestamp: new Date().toISOString(),
  });

  const movedTo = await autoAdvanceStatus(sql, id, 'quote_accepted');
  if (movedTo) {
    await addActivityToProject(id, {
      type: 'status_change',
      text: `Moved to ${movedTo} automatically — quote accepted`,
      user_name: 'System',
      user_email: '',
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}

    // ==================== SEND QUOTE ====================
    else if (action === 'send_quote') {
      
      const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${id}`;
      const projectId = leadCheck[0]?.project_id;

      if (!projectId) {
        return NextResponse.json({ 
          success: false, 
          error: 'No project exists. Please create a project first.' 
        }, { status: 400 });
      }

      await sql`
        UPDATE projects 
        SET 
          quote_sent_at = NOW(),
          updated_at = NOW()
        WHERE id = ${projectId}
      `;

      const quoteSentEntry = {
        type: 'quote_sent',
        text: 'Quote sent to customer',
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      await addActivityToProject(id, quoteSentEntry);

      return NextResponse.json({ success: true });
    }
// ==================== SEND QUOTE TO CUSTOMER 📧 ====================
   else if (action === 'send_quote_to_customer') {
  
 const leadCheck = await sql`
  SELECT l.*, p.quote_data, p.quote_total, p.quote_tax_rate,
         p.deposit_type, p.deposit_value,
         c.name as company_name, c.phone as company_phone,
         c.email as company_email,
         c.id as company_id, c.plan_tier
  FROM leads l
  LEFT JOIN projects p ON l.project_id = p.id
  LEFT JOIN companies c ON l.company_id = c.id
  WHERE l.id = ${id}
`;

  if (!leadCheck[0]) {
    return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
  }

  const lead = leadCheck[0];

  // Server-side plan check
  if (!can((lead.plan_tier ?? 'basic') as PlanTier, 'send_quote_email')) {
    return NextResponse.json({
      success: false,
      error: 'One-click emails are available on the Pro plan',
      upgrade_required: true,
    }, { status: 403 });
  }

      if (!lead.project_id || !lead.quote_data || !lead.quote_total) {
        return NextResponse.json({ success: false, error: 'No quote exists. Please create a quote first.' }, { status: 400 });
      }

      let quoteItems = [];
      try {
        quoteItems = typeof lead.quote_data === 'string' ? JSON.parse(lead.quote_data) : lead.quote_data;
      } catch (error) {
        console.error('Failed to parse quote data:', error);
        quoteItems = [];
      }

      try {
        const crypto = await import('crypto');
        const quoteToken = crypto.randomBytes(32).toString('hex');

await sql`UPDATE projects
  SET quote_token = ${quoteToken},
      quote_declined_at = NULL,
      quote_accepted_at = NULL,
      updated_at = NOW()
  WHERE id = ${lead.project_id}`;

  const emailResult = await sendQuoteToCustomer({
  customerEmail: lead.email,
  customerName: lead.name,
  companyName: lead.company_name || 'Your Service Provider',
  companyPhone: formatPhone(lead.company_phone),
  companyId: lead.company_id,
  quoteTotal: parseFloat(lead.quote_total),
  quoteItems: quoteItems,
  projectDescription: lead.category || 'Your project',
  quoteToken: quoteToken,
  contractorEmail: lead.company_email,
  taxRate: lead.quote_tax_rate ? parseFloat(lead.quote_tax_rate) : undefined,
  // Computed here so the email doesn't reimplement the percent/fixed rule.
  // Same formula as depositFor() in getOrCreateCheckoutSession — capped at
  // the total so a fixed deposit larger than the job reads honestly.
  depositAmount: (() => {
    const t = parseFloat(lead.quote_total || '0');
    const v = parseFloat(lead.deposit_value || '0');
    if (!lead.deposit_type || v <= 0 || t <= 0) return undefined;
    const raw = lead.deposit_type === 'percent' ? (t * v) / 100 : v;
    return Math.min(Math.round(raw * 100) / 100, t);
  })(),
  depositLabel: lead.deposit_type === 'percent' && parseFloat(lead.deposit_value || '0') > 0
    ? `${parseFloat(lead.deposit_value)}%`
    : undefined,
});
        // Log to outbox
        try {
          await sql`
            INSERT INTO email_outbox (company_id, project_id, lead_id, type, to_email, to_name, subject, html_body, status, sent_by_email, sent_by_name, metadata)
            VALUES (
              ${lead.company_id}, ${lead.project_id}, ${id}, 'quote',
              ${lead.email}, ${lead.name},
              ${emailResult?.subject || 'Quote'}, ${emailResult?.html || ''},
              'sent', ${user_email}, ${user_name},
              ${JSON.stringify({ quote_total: lead.quote_total, resend_id: emailResult?.resendId })}::jsonb
            )
          `;
        } catch (outboxErr) {
          console.error('⚠️ Failed to log to outbox (email still sent):', outboxErr);
        }

        // Keep existing quote_emails log
        await sql`
          UPDATE projects 
          SET quote_sent_at = NOW(),
              quote_emails = COALESCE(quote_emails, '[]'::jsonb) || ${JSON.stringify([{
                sent_at: new Date().toISOString(),
                sent_by_name: user_name,
                sent_by_email: user_email,
                quote_total: parseFloat(lead.quote_total),
                quote_data: quoteItems
              }])}::jsonb,
              updated_at = NOW()
          WHERE id = ${lead.project_id}
        `;

        const quoteSentEntry = {
          type: 'quote_sent',
          text: `Quote emailed to customer ($${lead.quote_total})`,
          user_name: user_name,
          user_email: user_email,
          timestamp: new Date().toISOString()
        };

       await addActivityToProject(id, quoteSentEntry);

        const movedTo = await autoAdvanceStatus(sql, id, 'quote_sent');
        if (movedTo) {
          await addActivityToProject(id, {
            type: 'status_change',
            text: `Moved to ${movedTo} automatically — quote sent`,
            user_name: 'System',
            user_email: '',
            timestamp: new Date().toISOString(),
          });
        }

        return NextResponse.json({ success: true, message: 'Quote sent to customer!' });
      } catch (emailError: any) {
        // Log failed attempt to outbox
        try {
          await sql`
            INSERT INTO email_outbox (company_id, project_id, lead_id, type, to_email, to_name, status, error_message, sent_by_email, sent_by_name, metadata)
            VALUES (
              ${lead.company_id}, ${lead.project_id}, ${id}, 'quote',
              ${lead.email}, ${lead.name},
              'failed', ${emailError.message || 'Unknown error'},
              ${user_email}, ${user_name},
              ${JSON.stringify({ quote_total: lead.quote_total })}::jsonb
            )
          `;
        } catch {}
        console.error('❌ Failed to send quote email:', emailError);
        return NextResponse.json({ success: false, error: 'Failed to send email. Please try again.' }, { status: 500 });
      }
    }

    // ==================== SEND SCHEDULE TO CUSTOMER 📅 ====================
    else if (action === 'send_schedule_to_customer') {
  
const result = await sql`
  SELECT 
    l.id, l.name, l.email, l.address_line_1, l.address_line_2, l.city, l.zip_code, l.project_id,
    p.scheduled_date::text as scheduled_date,
    p.scheduled_time::text as scheduled_time,
    p.scheduled_end_time::text as scheduled_end_time,
    p.assigned_to,
    c.name as company_name,
    c.phone as company_phone,
    c.email as company_email,
    c.id as company_id,
    c.plan_tier
  FROM leads l
  JOIN projects p ON l.project_id = p.id
  JOIN companies c ON l.company_id = c.id
  WHERE l.id = ${id}
`;

  if (!result[0]) {
    return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
  }

  const lead = result[0];

  // Server-side plan check
  if (!can((lead.plan_tier ?? 'basic') as PlanTier, 'send_schedule_email')) {
    return NextResponse.json({
      success: false,
      error: 'One-click emails are available on the Pro plan',
      upgrade_required: true,
    }, { status: 403 });
  }

      if (!lead.project_id || !lead.scheduled_date) {
        return NextResponse.json({ success: false, error: 'No schedule exists. Please set a schedule date first.' }, { status: 400 });
      }

      let serviceAddress = lead.address_line_1 || '';
      if (lead.address_line_2) serviceAddress += `, ${lead.address_line_2}`;
      if (lead.city) serviceAddress += `, ${lead.city}`;
      if (lead.zip_code) serviceAddress += ` ${lead.zip_code}`;

      try {
        // AFTER
const emailResult = await sendScheduleConfirmation({
  customerEmail: lead.email,
  customerName: lead.name,
  companyName: lead.company_name || 'Your Service Provider',
  companyPhone: formatPhone(lead.company_phone),
  companyId: lead.company_id,
  scheduledDate: lead.scheduled_date,
  scheduledTime: lead.scheduled_time || undefined,
  scheduledEndTime: lead.scheduled_end_time || undefined,
  serviceAddress: serviceAddress || undefined,
  assignedTo: lead.assigned_to || undefined,
  contractorEmail: lead.company_email,
});

        // Log to outbox
        try {
          await sql`
            INSERT INTO email_outbox (company_id, project_id, lead_id, type, to_email, to_name, subject, html_body, status, sent_by_email, sent_by_name, metadata)
            VALUES (
              ${lead.company_id}, ${lead.project_id}, ${id}, 'schedule',
              ${lead.email}, ${lead.name},
              ${emailResult?.subject || 'Schedule Confirmation'}, ${emailResult?.html || ''},
              'sent', ${user_email}, ${user_name},
              ${JSON.stringify({ scheduled_date: lead.scheduled_date, scheduled_time: lead.scheduled_time, assigned_to: lead.assigned_to, resend_id: emailResult?.resendId })}::jsonb
            )
          `;
        } catch (outboxErr) {
          console.error('⚠️ Failed to log to outbox (email still sent):', outboxErr);
        }

        const scheduleEntry = {
          type: 'schedule_sent',
          text: `Schedule confirmation emailed to customer (${lead.scheduled_date}${lead.scheduled_time ? ' at ' + lead.scheduled_time : ''})`,
          user_name: user_name,
          user_email: user_email,
          timestamp: new Date().toISOString()
        };

        await addActivityToProject(id, scheduleEntry);

        // Keep existing schedule_emails log
        await sql`
          UPDATE projects 
          SET schedule_emails = COALESCE(schedule_emails, '[]'::jsonb) || ${JSON.stringify([{
            sent_at: new Date().toISOString(),
            sent_by_name: user_name,
            sent_by_email: user_email,
            scheduled_date: lead.scheduled_date,
            scheduled_time: lead.scheduled_time || null,
          }])}::jsonb,
          updated_at = NOW()
          WHERE id = ${lead.project_id}
        `;

        return NextResponse.json({ success: true, message: 'Schedule confirmation sent!' });
      } catch (emailError: any) {
        // Log failed attempt to outbox
        try {
          await sql`
            INSERT INTO email_outbox (company_id, project_id, lead_id, type, to_email, to_name, status, error_message, sent_by_email, sent_by_name, metadata)
            VALUES (
              ${lead.company_id}, ${lead.project_id}, ${id}, 'schedule',
              ${lead.email}, ${lead.name},
              'failed', ${emailError.message || 'Unknown error'},
              ${user_email}, ${user_name},
              ${JSON.stringify({ scheduled_date: lead.scheduled_date, scheduled_time: lead.scheduled_time })}::jsonb
            )
          `;
        } catch {}
        console.error('❌ Failed to send schedule email:', emailError);
        return NextResponse.json({ success: false, error: 'Failed to send email. Please try again.' }, { status: 500 });
      }
    }
    
   
    // ==================== UPDATE DETAILS 📝 ====================
    else if (action === 'update_details') {
      
      const {
        name,
        email,
        phone,
        address_line_1,
        address_line_2,
        city,
        zip_code,
        category,
        description
      } = body;

      // Update lead table (including zip_code)
      await sql`
        UPDATE leads 
        SET 
          name = ${name},
          email = ${email},
          phone = ${phone},
          address_line_1 = ${address_line_1 || null},
          address_line_2 = ${address_line_2 || null},
          city = ${city || null},
          zip_code = ${zip_code || null},
          category = ${category || null},
          description = ${description || null},
          updated_at = NOW()
        WHERE id = ${id}
      `;

      // If project exists, also update project customer info (including zip_code)
      const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${id}`;
      const projectId = leadCheck[0]?.project_id;

      if (projectId) {
        await sql`
          UPDATE projects 
          SET 
            customer_name = ${name},
            customer_email = ${email},
            customer_phone = ${phone},
            service_address = ${address_line_1 || null},
            address_line_2 = ${address_line_2 || null},
            city = ${city || null},
            zip_code = ${zip_code || null},
            category = ${category || null},
            updated_at = NOW()
          WHERE id = ${projectId}
        `;
      }

      const detailsEntry = {
        type: 'details_updated',
        text: 'Customer details updated',
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      if (projectId) {
        await addActivityToProject(id, detailsEntry);
      }

      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE TASKS ====================
    else if (action === 'update_tasks') {
      
      const { tasks } = body;
      
      const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${id}`;
      const projectId = leadCheck[0]?.project_id;

      if (!projectId) {
        return NextResponse.json({ 
          success: false, 
          error: 'No project exists. Please create a project first.' 
        }, { status: 400 });
      }
      
      await sql`
        UPDATE projects 
        SET tasks = ${tasks},
            updated_at = NOW()
        WHERE id = ${projectId}
      `;

      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE LEAD STEP 2 (from public form) ====================
else if (action === 'update_lead_step2') {

  const {
    address_line_1,
    address_line_2,
    city,
    zip_code,
    lead_source,
    preferred_date,
    preferred_time,
    preferred_end_time,
    custom_answers,
    file_urls,
  } = body;

  // Merge new file_urls with any existing ones
  const existingLead = await sql`SELECT file_urls FROM leads WHERE id = ${id}`;
  let existingFiles = [];
  try {
    const raw = existingLead[0]?.file_urls;
    existingFiles = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
  } catch {
    existingFiles = [];
  }
  const mergedFiles = [...existingFiles, ...(file_urls || [])];

  await sql`
    UPDATE leads
    SET
      address_line_1 = COALESCE(${address_line_1 || null}, address_line_1),
      address_line_2 = COALESCE(${address_line_2 || null}, address_line_2),
      city           = COALESCE(${city || null}, city),
      zip_code       = COALESCE(${zip_code || null}, zip_code),
      lead_source    = COALESCE(${lead_source || null}, lead_source),
      preferred_date = COALESCE(${preferred_date || null}, preferred_date),
      preferred_time = COALESCE(${preferred_time || null}, preferred_time),
      preferred_end_time = COALESCE(${preferred_end_time || null}, preferred_end_time),
      custom_answers = COALESCE(${custom_answers ? JSON.stringify(custom_answers) : null}::jsonb, custom_answers),
      file_urls      = ${JSON.stringify(mergedFiles)},
      updated_at     = NOW()
    WHERE id = ${id}
  `;

  return NextResponse.json({ success: true });
}

// ==================== SAVE INVOICE ====================
else if (action === 'save_invoice') {
  const { invoice_number, invoice_data, invoice_status } = body;

  const projects = await sql`
    SELECT id FROM projects WHERE lead_id = ${id}
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const projectId = projects[0].id;

  await sql`
  UPDATE projects
  SET
    invoice_number = ${invoice_number},
    invoice_data = ${JSON.stringify(invoice_data)},
    invoice_status = ${invoice_status || 'draft'},
    payment_due_date = ${due_date || null},
    invoice_sent_at = ${invoice_status === 'sent' ? new Date().toISOString() : null},
    updated_at = NOW()
  WHERE id = ${projectId}
`;

  const invoiceEntry = {
    type: 'invoice_saved',
    text: `Invoice ${invoice_number} saved`,
    user_name: user_name,
    user_email: user_email,
    timestamp: new Date().toISOString()
  };

  await addActivityToProject(id, invoiceEntry);

  return NextResponse.json({ success: true });
}



// ==================== SEND INVOICE TO CUSTOMER 📧 ====================
// ==================== SEND INVOICE TO CUSTOMER 📧 ====================
else if (action === 'send_invoice_to_customer') {
const leadCheck = await sql`
   SELECT l.*, p.invoice_data, p.invoice_number, p.quote_data, p.quote_total, p.quote_tax_rate,
         p.payment_amount, p.payment_status, p.stripe_checkout_session_id,
         c.name as company_name, c.phone as company_phone,
         c.email as company_email,
         c.id as company_id, c.slug as company_slug, c.plan_tier,
         c.stripe_connect_account_id, c.stripe_connect_onboarded, c.stripe_payment_status
  FROM leads l
    LEFT JOIN projects p ON l.project_id = p.id
    LEFT JOIN companies c ON l.company_id = c.id
    WHERE l.id = ${id}
  `;

  if (!leadCheck[0]) {
    return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
  }

  const lead = leadCheck[0];

  if (!can((lead.plan_tier ?? 'basic') as PlanTier, 'send_invoice_email')) {
    return NextResponse.json({
      success: false,
      error: 'Sending invoices is available on the Pro plan',
      upgrade_required: true,
    }, { status: 403 });
  }

  if (!lead.project_id) {
    return NextResponse.json({ success: false, error: 'No project exists.' }, { status: 400 });
  }

  const invoiceItems = (() => {
    try {
      const raw = body.invoice_data || lead.invoice_data || lead.quote_data;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  })();

  if (invoiceItems.length === 0) {
    return NextResponse.json({ success: false, error: 'No line items found.' }, { status: 400 });
  }

  const invoiceTaxRate = lead.quote_tax_rate ? parseFloat(lead.quote_tax_rate) : 0;
  // quote_total is stored tax-inclusive and is what the PDF and the customer's
  // payment link both use. Recomputing from items drifted when the stored tax
  // rate had been rounded — the emailed total and the charged total differed.
  const invoiceTotal = parseFloat(lead.quote_total || '0');
  const invoiceNumber = body.invoice_number || lead.invoice_number || 'INV-001';

  // ── Generate or reuse a Stripe Connect payment link ──
  // ── Generate or reuse a Stripe Connect payment link ──
  let paymentLinkUrl: string | undefined;
  let paymentLinkType: string | undefined;
  // What the link actually charges. Without these the email showed the full
  // total on a button that collected only the deposit.
  let collectionKind: 'deposit' | 'balance' | undefined;
  let chargeAmount: number | undefined;

  // The amount is derived inside the helper from what the ledger says has
  // been collected. The old inline version charged the full invoiceTotal
  // whenever status wasn't 'paid' — so after a deposit, the balance link
  // asked for the whole job again.
  if (lead.stripe_payment_status === 'active' && invoiceTotal > 0) {
    try {
      const checkout = await getOrCreateCheckoutSession({
        projectId: lead.project_id,
        connectedAccountId: lead.stripe_connect_account_id,
        customerName: lead.name,
        customerEmail: lead.email,
        companySlug: lead.company_slug,
        contractTotal: invoiceTotal,
        collect: body.collect === 'full' ? 'full' : undefined,
      });
     if (checkout.url) {
        paymentLinkUrl = checkout.url;
        paymentLinkType = 'stripe';
        collectionKind = checkout.kind ?? undefined;
        chargeAmount = checkout.amount;
      }
    } catch (stripeErr: any) {
      console.error('Failed to create Stripe Checkout session:', stripeErr.message);
      if (stripeErr.code === 'account_invalid' || stripeErr.message?.includes('not enabled')) {
        return NextResponse.json({
          success: false,
          error: 'Your Stripe account needs attention before you can send payment links. Check your Stripe dashboard or reconnect in Settings.',
        }, { status: 400 });
      }
      // other errors: fall through — email sends without a pay-now button
    }
  }

  try {
    const emailResult = await sendInvoiceToCustomer({
      customerEmail: lead.email,
      customerName: lead.name,
      companyName: lead.company_name || '',
      companyPhone: lead.company_phone || undefined,
      companyId: lead.company_id,
      invoiceNumber,
      invoiceTotal,
      amountPaid: lead.payment_amount ? parseFloat(lead.payment_amount) : undefined,
      invoiceItems,
      dueDate: body.due_date || undefined,
      notes: body.notes || undefined,
      contractorEmail: lead.company_email,
 paymentLinkUrl,
  paymentLinkType,
  taxRate: invoiceTaxRate > 0 ? invoiceTaxRate : undefined,
  depositAmount: chargeAmount,
  collectionKind,
    });

    // Log to outbox
    try {
      await sql`
        INSERT INTO email_outbox (company_id, project_id, lead_id, type, to_email, to_name, subject, html_body, status, sent_by_email, sent_by_name, metadata)
        VALUES (
          ${lead.company_id}, ${lead.project_id}, ${id}, 'invoice',
          ${lead.email}, ${lead.name},
          ${emailResult?.subject || 'Invoice'}, ${emailResult?.html || ''},
          'sent', ${user_email}, ${user_name},
          ${JSON.stringify({ invoice_number: invoiceNumber, invoice_total: invoiceTotal, resend_id: emailResult?.resendId })}::jsonb
        )
      `;
    } catch (outboxErr) {
      console.error('⚠️ Failed to log to outbox:', outboxErr);
    }

    await sql`
      UPDATE projects
      SET invoice_status = 'sent',
          invoice_sent_at = NOW(),
          invoice_pdf_url = ${emailResult?.pdfUrl || null},
          payment_due_date = ${body.due_date || null},
          updated_at = NOW()
      WHERE id = ${lead.project_id}
    `;

    await addActivityToProject(id, {
      type: 'invoice_sent',
      text: `Invoice ${invoiceNumber} emailed to customer`,
      user_name,
      user_email,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Invoice sent!' });
  } catch (emailError: any) {
    try {
      await sql`
        INSERT INTO email_outbox (company_id, project_id, lead_id, type, to_email, to_name, status, error_message, sent_by_email, sent_by_name, metadata)
        VALUES (
          ${lead.company_id}, ${lead.project_id}, ${id}, 'invoice',
          ${lead.email}, ${lead.name},
          'failed', ${emailError.message || 'Unknown error'},
          ${user_email}, ${user_name},
          ${JSON.stringify({ invoice_number: invoiceNumber })}::jsonb
        )
      `;
    } catch {}
    return NextResponse.json({ success: false, error: 'Failed to send email.' }, { status: 500 });
  }
}


// ==================== SAVE DEPOSIT TERMS 💰 ====================
else if (action === 'save_deposit_terms') {
  const { deposit_type, deposit_value } = body;

  const projectRows = await sql`
    SELECT id, COALESCE(payment_amount, 0) AS collected, quote_total
    FROM projects WHERE lead_id = ${id} LIMIT 1
  `;

  if (projectRows.length === 0) {
    return NextResponse.json(
      { success: false, error: 'No project exists. Please create a project first.' },
      { status: 404 }
    );
  }

  const project = projectRows[0];

  // Editable only before money lands. Once a deposit is collected the terms
  // are part of what the customer agreed to — refund it to change them.
  // Checked here and not just in the UI, because a stale tab is exactly how
  // terms would otherwise change after a payment.
  if (parseFloat(project.collected || '0') > 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'Payments have already been collected. Refund them before changing deposit terms.',
      },
      { status: 400 }
    );
  }

  // Clearing terms means collect the full amount — both columns go null
  // together so the CHECK constraint can't fire.
  const clearing =
    !deposit_type || deposit_value === null || deposit_value === undefined || Number(deposit_value) <= 0;

  let nextType: string | null = null;
  let nextValue: number | null = null;

  if (!clearing) {
    if (!['percent', 'fixed'].includes(deposit_type)) {
      return NextResponse.json(
        { success: false, error: 'Deposit type must be percent or fixed.' },
        { status: 400 }
      );
    }
    const parsed = parseFloat(String(deposit_value));
    if (Number.isNaN(parsed) || parsed <= 0) {
      return NextResponse.json(
        { success: false, error: 'Enter a deposit amount greater than zero.' },
        { status: 400 }
      );
    }
    if (deposit_type === 'percent' && parsed > 100) {
      return NextResponse.json(
        { success: false, error: 'A percent deposit can\u2019t exceed 100.' },
        { status: 400 }
      );
    }
    nextType = deposit_type;
    nextValue = parsed;
  }

  await sql`
    UPDATE projects
    SET deposit_type  = ${nextType},
        deposit_value = ${nextValue},
        updated_at    = NOW()
    WHERE id = ${project.id}
  `;

  // What the customer will actually be asked for, capped at the total so a
  // fixed deposit larger than the job reads honestly in the log.
  const contractTotal = parseFloat(project.quote_total || '0');
  const depositAmount = clearing
    ? 0
    : Math.min(
        nextType === 'percent' ? (contractTotal * (nextValue as number)) / 100 : (nextValue as number),
        contractTotal
      );

  await addActivityToProject(id, {
    type: 'deposit_terms_updated',
    text: clearing
      ? 'Deposit removed \u2014 full amount due'
      : `Deposit set to ${nextType === 'percent' ? `${nextValue}%` : `$${nextValue}`}` +
        (contractTotal > 0 ? ` ($${depositAmount.toFixed(2)} of $${contractTotal.toFixed(2)})` : ''),
    user_name,
    user_email,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    deposit_type: nextType,
    deposit_value: nextValue,
    deposit_amount: Math.round(depositAmount * 100) / 100,
  });
}


// ==================== SAVE AI BRIEF ====================
else if (action === 'save_ai_brief') {

  const projects = await sql`
    SELECT id FROM projects WHERE lead_id = ${id}
  `;

  if (projects.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const projectId = projects[0].id;

  await sql`
    UPDATE projects
    SET
      ai_brief = ${JSON.stringify(body.ai_brief)},
      updated_at = NOW()
    WHERE id = ${projectId}
  `;

  return NextResponse.json({ success: true });
}

    // ==================== LEGACY ====================
    else {
      await sql`
        UPDATE leads 
        SET status = ${status},
            updated_at = NOW()
        WHERE id = ${id}
      `;
      return NextResponse.json({ success: true });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 });
  }
}