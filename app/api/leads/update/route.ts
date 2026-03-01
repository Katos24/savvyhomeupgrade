import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { sendQuoteToCustomer, sendScheduleConfirmation } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 Incoming request:', { action: body.action, id: body.id });
    
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
    } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // 🔍 DEBUG: Log the extracted values immediately
    console.log('🔍 EXTRACTED FROM BODY:');
    console.log('   action:', action);
    console.log('   scheduled_date:', scheduled_date);
    console.log('   scheduled_time:', scheduled_time);
    console.log('   scheduled_time type:', typeof scheduled_time);

    // 🔥 Helper function to add activity to projects.notes
    const addActivityToProject = async (leadId: number, activityEntry: any) => {
      const lead = await sql`SELECT project_id FROM leads WHERE id = ${leadId}`;
      
      if (!lead[0]?.project_id) {
        console.warn('⚠️ No project found for lead', leadId);
        return;
      }

      const projectId = lead[0].project_id;
      console.log('📌 Project ID:', projectId);

      // Get existing notes from projects table
      const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
      
      console.log('📖 Raw notes from DB:', project[0]?.notes);
      console.log('📖 Notes type:', typeof project[0]?.notes);
      
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

      console.log('📝 Existing notes count:', existingNotes.length);
      console.log('➕ Adding new entry:', activityEntry.type);
      
      existingNotes.push(activityEntry);
      
      console.log('📊 Total notes after push:', existingNotes.length);

      // Update projects.notes
      await sql`
        UPDATE projects 
        SET notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${projectId}
      `;
      
      console.log('✅ Activity added to project notes');
    };

    // ==================== UPDATE STATUS ====================
    if (action === 'update_status') {
      console.log('🔄 Updating status');
      
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

      console.log('✅ Status updated');
      return NextResponse.json({ success: true });
    } 
    
    // ==================== ADD NOTE ====================
    else if (action === 'add_note') {
      console.log('📝 Adding note');
      
      const newNote = {
        type: 'note',
        text: notes,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      await addActivityToProject(id, newNote);

      console.log('✅ Note added');
      return NextResponse.json({ success: true });
    }

    // ==================== CREATE PROJECT ====================
    else if (action === 'create_project') {
      console.log('🎯 Creating project');
      
      // Get complete lead data
      const leadCheck = await sql`SELECT * FROM leads WHERE id = ${id}`;

      if (!leadCheck[0]) {
        throw new Error('Lead not found');
      }

      if (leadCheck[0].project_id) {
        console.log('⚠️ Project already exists');
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
        console.log(`📋 Creating ${leadCategory.task_templates.length} tasks from template`);
        
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
        
        console.log(`✅ Created ${sortedTasks.length} tasks`);
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

      console.log(`✅ Created project ${projectId} (#${projectNumber}) for lead ${id}`);
      
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
      console.log('📋 Updating project');
      
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

      console.log('✅ Project updated');
      return NextResponse.json({ success: true });
    }

    // ==================== SAVE QUOTE ====================
    else if (action === 'save_quote') {
      console.log('💰 Saving quote');
      
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
          quote_data = ${JSON.stringify(quote_data)},
          quote_total = ${quote_total},
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

      console.log('✅ Quote saved');
      return NextResponse.json({ success: true });
    }

    // ==================== SEND QUOTE ====================
    else if (action === 'send_quote') {
      console.log('📤 Sending quote');
      
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

      console.log('✅ Quote sent');
      return NextResponse.json({ success: true });
    }

    // ==================== SEND QUOTE TO CUSTOMER 📧 ====================
    else if (action === 'send_quote_to_customer') {
      console.log('📧 Sending quote to customer via email');
      
      const leadCheck = await sql`
        SELECT l.*, p.quote_data, p.quote_total, c.name as company_name, c.phone as company_phone, c.id as company_id
        FROM leads l
        LEFT JOIN projects p ON l.project_id = p.id
        LEFT JOIN companies c ON l.company_id = c.id
        WHERE l.id = ${id}
      `;

      if (!leadCheck[0]) {
        return NextResponse.json({ 
          success: false, 
          error: 'Lead not found' 
        }, { status: 404 });
      }

      const lead = leadCheck[0];

      if (!lead.project_id || !lead.quote_data || !lead.quote_total) {
        return NextResponse.json({ 
          success: false, 
          error: 'No quote exists. Please create a quote first.' 
        }, { status: 400 });
      }

      let quoteItems = [];
      try {
        quoteItems = typeof lead.quote_data === 'string' 
          ? JSON.parse(lead.quote_data) 
          : lead.quote_data;
      } catch (error) {
        console.error('Failed to parse quote data:', error);
        quoteItems = [];
      }

      try {
        await sendQuoteToCustomer({
          customerEmail: lead.email,
          customerName: lead.name,
          companyName: lead.company_name || 'Your Service Provider',
          companyPhone: lead.company_phone,
          companyId: lead.company_id,
          quoteTotal: parseFloat(lead.quote_total),
          quoteItems: quoteItems,
          projectDescription: lead.category || 'Your project',
        });

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



        console.log('✅ Quote email sent to customer');
        return NextResponse.json({ success: true, message: 'Quote sent to customer!' });
      } catch (emailError) {
        console.error('❌ Failed to send quote email:', emailError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to send email. Please try again.' 
        }, { status: 500 });
      }
    }

    

    // ==================== SEND SCHEDULE TO CUSTOMER 📅 ====================
    else if (action === 'send_schedule_to_customer') {
      console.log('📅 Sending schedule confirmation to customer');
      
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
          c.id as company_id
        FROM leads l
        JOIN projects p ON l.project_id = p.id
        JOIN companies c ON l.company_id = c.id
        WHERE l.id = ${id}
      `;

      if (!result[0]) {
        return NextResponse.json({ 
          success: false, 
          error: 'Lead not found' 
        }, { status: 404 });
      }

      const lead = result[0];

      if (!lead.project_id || !lead.scheduled_date) {
        return NextResponse.json({ 
          success: false, 
          error: 'No schedule exists. Please set a schedule date first.' 
        }, { status: 400 });
      }

      // Build service address (now includes zip_code)
      let serviceAddress = lead.address_line_1 || '';
      if (lead.address_line_2) serviceAddress += `, ${lead.address_line_2}`;
      if (lead.city) serviceAddress += `, ${lead.city}`;
      if (lead.zip_code) serviceAddress += ` ${lead.zip_code}`;

      console.log('📧 Email data:', {
        scheduledDate: lead.scheduled_date,
        scheduledTime: lead.scheduled_time,
        assignedTo: lead.assigned_to,
        email: lead.email,
        companyId: lead.company_id
      });

      try {
        await sendScheduleConfirmation({
          customerEmail: lead.email,
          customerName: lead.name,
          companyName: lead.company_name || 'Your Service Provider',
          companyPhone: lead.company_phone,
          companyId: lead.company_id,
          scheduledDate: lead.scheduled_date,
          scheduledTime: lead.scheduled_time || undefined,
          serviceAddress: serviceAddress || undefined,
          assignedTo: lead.assigned_to || undefined,
        });

        const scheduleEntry = {
          type: 'schedule_sent',
          text: `Schedule confirmation emailed to customer (${lead.scheduled_date}${lead.scheduled_time ? ' at ' + lead.scheduled_time : ''})`,
          user_name: user_name,
          user_email: user_email,
          timestamp: new Date().toISOString()
        };

await addActivityToProject(id, scheduleEntry);

// ✅ Save to schedule_emails log
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

console.log('✅ Schedule email sent to customer');
return NextResponse.json({ success: true, message: 'Schedule confirmation sent!' });

      } catch (emailError) {
        console.error('❌ Failed to send schedule email:', emailError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to send email. Please try again.' 
        }, { status: 500 });
      }
    }

    // ==================== UPDATE PAYMENT 💳 ====================
    else if (action === 'update_payment') {
      console.log('💳 Updating payment');
      
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

      console.log('✅ Payment updated');
      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE DETAILS 📝 ====================
    else if (action === 'update_details') {
      console.log('📝 Updating lead/project details');
      
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

      console.log('✅ Details updated');
      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE TASKS ====================
    else if (action === 'update_tasks') {
      console.log('✓ Updating tasks');
      
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

      console.log('✅ Tasks updated');
      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE LEAD STEP 2 (from public form) ====================
else if (action === 'update_lead_step2') {
  console.log('📋 Updating lead with step 2 details, lead ID:', id);

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

  console.log('✅ Lead step 2 updated');
  return NextResponse.json({ success: true });
}

    // ==================== LEGACY ====================
    else {
      console.log('⚠️ Legacy update');
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