import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { sendQuoteToCustomer, sendScheduleConfirmation, sendInvoiceToCustomer } from '@/lib/email';
import { can, type PlanTier } from '@/lib/permissions';
import { formatPhone } from '@/lib/emailTemplates';

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
      try {
        jwt.verify(token, process.env.JWT_SECRET!);
      } catch {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
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
      assigned_to,
      estimated_hours,
      actual_hours,
      quote_data,
      quote_total,
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
if (action === 'update_status') {

  await sql`
    UPDATE leads 
    SET status = ${status},
        updated_at = NOW()
    WHERE id = ${id}
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

  if (status === 'completed' && old_status !== 'completed') {
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
'scheduled',
${leadData.company_id || null},
${'INV-' + String(nextProjectNumber).padStart(3, '0')},
          ${JSON.stringify(leadNotes)},
          '[]'::jsonb,
          '[]'::jsonb,
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
          status = 'scheduled',
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

      await sql`
        UPDATE projects 
        SET 
          scheduled_date = ${scheduled_date || null},
          scheduled_time = ${scheduled_time || null},
          assigned_to = ${assigned_to || null},
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

   // Get current payment amount before updating
const currentProject = await sql`
  SELECT payment_amount FROM projects WHERE id = ${projectId}
`;
const paid = parseFloat(currentProject[0]?.payment_amount || '0');
const newTotal = parseFloat(quote_total || '0');

let newPaymentStatus = 'unpaid';
if (paid > 0 && newTotal > 0) {
  if (paid >= newTotal) newPaymentStatus = 'paid';
  else newPaymentStatus = 'partial';
}



await sql`
  UPDATE projects 
  SET 
quote_data = ${JSON.stringify(quote_data)},
    quote_total = ${quote_total},
    payment_status = ${newPaymentStatus},
    updated_at = NOW()
  WHERE id = ${projectId}
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
    SELECT l.*, p.quote_data, p.quote_total, 
           c.name as company_name, c.phone as company_phone, 
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
  contractorEmail: user_email,
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
      l.id,
      l.name,
      l.email,
      l.address_line_1,
      l.address_line_2,
      l.city,
      l.zip_code,
      l.project_id,
      p.scheduled_date::text as scheduled_date,
      p.scheduled_time::text as scheduled_time,
      p.assigned_to,
      c.name as company_name,
      c.phone as company_phone,
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
  serviceAddress: serviceAddress || undefined,
  assignedTo: lead.assigned_to || undefined,
  contractorEmail: user_email,
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
    
    // ==================== UPDATE PAYMENT 💳 ====================
    else if (action === 'update_payment') {
      
      const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${id}`;
      const projectId = leadCheck[0]?.project_id;

      if (!projectId) {
        return NextResponse.json({ 
          success: false, 
          error: 'No project exists. Please create a project first.' 
        }, { status: 400 });
      }

      const paidAt = payment_status === 'paid' ? new Date().toISOString() : null;

      await sql`
        UPDATE projects 
        SET 
          payment_status = ${payment_status},
          payment_amount = ${payment_amount || null},
          payment_method = ${body.payment_method || null},
          payment_date = ${body.payment_date || null},
          payment_notes = ${body.payment_notes || null},
          payment_due_date = ${payment_due_date || null},
          paid_at = ${paidAt},
          updated_at = NOW()
        WHERE id = ${projectId}
      `;

      const paymentMethodText = body.payment_method ? ` via ${body.payment_method}` : '';
      const paymentEntry = {
        type: 'payment_updated',
        text: `Payment: ${payment_status}${payment_amount ? ` - $${payment_amount}` : ''}${paymentMethodText}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      await addActivityToProject(id, paymentEntry);

      return NextResponse.json({ success: true });
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
else if (action === 'send_invoice_to_customer') {
  const leadCheck = await sql`
   SELECT l.*, p.invoice_data, p.invoice_number, p.quote_data, p.quote_total,
           p.payment_amount, p.payment_status,
           c.name as company_name, c.phone as company_phone,
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

  const invoiceTotal = invoiceItems.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const invoiceNumber = body.invoice_number || lead.invoice_number || 'INV-001';

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
      contractorEmail: user_email,
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