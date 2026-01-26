import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

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
      job_status,
      scheduled_date,
      scheduled_time,
      assigned_to,
      estimated_hours,
      actual_hours,
      quote_data,
      quote_total
    } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // ==================== UPDATE STATUS ====================
    if (action === 'update_status') {
      const lead = await sql`SELECT notes FROM leads WHERE id = ${id}`;
      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      const statusChangeEntry = {
        type: 'status_change',
        old_status: old_status,
        new_status: status,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(statusChangeEntry);

      await sql`
        UPDATE leads 
        SET status = ${status},
            notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      console.log('✅ Status updated');
      return NextResponse.json({ success: true });
    } 
    
    // ==================== ADD NOTE ====================
    else if (action === 'add_note') {
      // Check if lead has a project
      const leadCheck = await sql`
        SELECT project_id FROM leads WHERE id = ${id}
      `;
      const projectId = leadCheck[0]?.project_id;

      if (projectId) {
        // Add note to project
        const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
        let existingNotes = [];
        try {
          existingNotes = project[0]?.notes ? JSON.parse(project[0].notes) : [];
        } catch {
          existingNotes = [];
        }

        const newNote = {
          type: 'note',
          text: notes,
          user_name: user_name,
          user_email: user_email,
          timestamp: new Date().toISOString()
        };

        existingNotes.push(newNote);

        await sql`
          UPDATE projects 
          SET notes = ${JSON.stringify(existingNotes)},
              updated_at = NOW()
          WHERE id = ${projectId}
        `;
      } else {
        // Add note to lead
        const lead = await sql`SELECT notes FROM leads WHERE id = ${id}`;
        let existingNotes = [];
        try {
          existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
        } catch {
          existingNotes = [];
        }

        const newNote = {
          type: 'note',
          text: notes,
          user_name: user_name,
          user_email: user_email,
          timestamp: new Date().toISOString()
        };

        existingNotes.push(newNote);

        await sql`
          UPDATE leads 
          SET notes = ${JSON.stringify(existingNotes)},
              updated_at = NOW()
          WHERE id = ${id}
        `;
      }

      console.log('✅ Note added');
      return NextResponse.json({ success: true });
    }

  // ==================== 🆕 CREATE PROJECT (EXPLICIT) - WITH FULL DATA MIGRATION ====================
    else if (action === 'create_project') {
      console.log('🎯 EXPLICIT PROJECT CREATION');
      
      // Get complete lead data including description, category, photos, notes
      const leadCheck = await sql`
        SELECT * FROM leads WHERE id = ${id}
      `;

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

      // Parse lead notes to copy to project
      let leadNotes = [];
      try {
        leadNotes = leadData.notes ? JSON.parse(leadData.notes) : [];
      } catch {
        leadNotes = [];
      }

      // Create comprehensive project with ALL lead data
      const projectResult = await sql`
        INSERT INTO projects (
          lead_id,
          customer_name,
          customer_email,
          customer_phone,
          service_address,
          city,
          status,
          company_id,
          notes,
          before_photos,
          after_photos,
          created_at,
          updated_at
        ) VALUES (
          ${id},
          ${leadData.name},
          ${leadData.email},
          ${leadData.phone},
          ${leadData.address_line_1 || null},
          ${leadData.city || null},
          'scheduled',
          ${leadData.company_id || null},
          ${JSON.stringify(leadNotes)}, -- Copy all lead notes to project
          '[]'::jsonb, -- Empty before photos array
          '[]'::jsonb, -- Empty after photos array
          NOW(),
          NOW()
        )
        RETURNING id
      `;

      const projectId = projectResult[0].id;

      // Update lead with project_id and compact lead data
      // Keep only essential lead info, rest is now in project
      await sql`
        UPDATE leads 
        SET 
          project_id = ${projectId},
          status = 'in_progress',
          updated_at = NOW()
        WHERE id = ${id}
      `;

      // Add conversion note to lead notes
      leadNotes.push({
        type: 'project_created',
        text: `✅ Converted to Project #${projectId}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      });

      await sql`
        UPDATE leads 
        SET notes = ${JSON.stringify(leadNotes)}
        WHERE id = ${id}
      `;

      // Add creation note to project
      const projectNotes = [...leadNotes, {
        type: 'project_created',
        text: `Project created from Lead #${id} by ${user_name}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      }];

      await sql`
        UPDATE projects 
        SET notes = ${JSON.stringify(projectNotes)}
        WHERE id = ${projectId}
      `;

      console.log(`✅ Created project ${projectId} for lead ${id} with full data migration`);
      
      return NextResponse.json({ 
        success: true, 
        project_id: projectId,
        message: 'Project created successfully'
      });
    }
    // ==================== UPDATE PROJECT ====================
    else if (action === 'update_project') {
      console.log('📋 Updating project');
      
      // Check for existing project
      const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${id}`;
      const projectId = leadCheck[0]?.project_id;

      if (!projectId) {
        return NextResponse.json({ 
          success: false, 
          error: 'No project exists for this lead. Please create a project first.' 
        }, { status: 400 });
      }
      
      const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
      let existingNotes = [];
      try {
        existingNotes = project[0]?.notes ? JSON.parse(project[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      let noteText = 'Project updated';
      if (job_status) noteText += ` - Status: ${job_status}`;
      if (scheduled_date) noteText += `, Scheduled: ${scheduled_date}`;
      if (assigned_to) noteText += `, Assigned to: ${assigned_to}`;

      existingNotes.push({
        type: 'project_updated',
        text: noteText,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      });

      await sql`
        UPDATE projects 
        SET 
          status = ${job_status || null},
          scheduled_date = ${scheduled_date || null},
          scheduled_time = ${scheduled_time || null},
          assigned_to = ${assigned_to || null},
          estimated_hours = ${estimated_hours || null},
          actual_hours = ${actual_hours || null},
          notes = ${JSON.stringify(existingNotes)},
          updated_at = NOW()
        WHERE id = ${projectId}
      `;

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
      
      const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
      let existingNotes = [];
      try {
        existingNotes = project[0]?.notes ? JSON.parse(project[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      existingNotes.push({
        type: 'quote_created',
        text: `Quote created - Total: $${quote_total}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      });

      await sql`
        UPDATE projects 
        SET 
          quote_data = ${JSON.stringify(quote_data)},
          quote_total = ${quote_total},
          notes = ${JSON.stringify(existingNotes)},
          updated_at = NOW()
        WHERE id = ${projectId}
      `;

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
      
      const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
      let existingNotes = [];
      try {
        existingNotes = project[0]?.notes ? JSON.parse(project[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      existingNotes.push({
        type: 'quote_sent',
        text: 'Quote sent to customer',
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      });

      await sql`
        UPDATE projects 
        SET 
          quote_sent_at = NOW(),
          notes = ${JSON.stringify(existingNotes)},
          updated_at = NOW()
        WHERE id = ${projectId}
      `;

      console.log('✅ Quote sent');
      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE PAYMENT ====================
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
      
      const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
      let existingNotes = [];
      try {
        existingNotes = project[0]?.notes ? JSON.parse(project[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      existingNotes.push({
        type: 'payment_updated',
        text: `Payment status: ${payment_status}${payment_amount ? ` - Amount: $${payment_amount}` : ''}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      });

      const paidAt = payment_status === 'paid' ? new Date().toISOString() : null;

      await sql`
        UPDATE projects 
        SET 
          payment_status = ${payment_status},
          payment_amount = ${payment_amount || null},
          paid_at = ${paidAt},
          notes = ${JSON.stringify(existingNotes)},
          updated_at = NOW()
        WHERE id = ${projectId}
      `;

      console.log('✅ Payment updated');
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
      { status: 500 }
    );
  }
}