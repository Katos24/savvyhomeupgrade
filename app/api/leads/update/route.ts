import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, 
      status, 
      notes, 
      action,
      user_name,
      user_email,
      old_status,
      // New project fields
      job_status,
      scheduled_date,
      scheduled_time,
      assigned_to,
      estimated_hours,
      actual_hours,
      quote_data,
      quote_total,
      payment_status,
      payment_amount
    } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // ==================== EXISTING: UPDATE STATUS ====================
    if (action === 'update_status') {
      // Get existing notes
      const lead = await sql`
        SELECT notes FROM leads WHERE id = ${id}
      `;

      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      // Add status change entry
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
            notes = ${JSON.stringify(existingNotes)}
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    } 
    
    // ==================== EXISTING: ADD NOTE ====================
    else if (action === 'add_note') {
      // Get existing notes
      const lead = await sql`
        SELECT notes FROM leads WHERE id = ${id}
      `;

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
        SET notes = ${JSON.stringify(existingNotes)}
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    } 
    
    // ==================== NEW: CREATE PROJECT ====================
    else if (action === 'create_project') {
      // Get existing notes
      const lead = await sql`
        SELECT notes FROM leads WHERE id = ${id}
      `;

      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      // Add project created note
      const projectNote = {
        type: 'project_created',
        text: 'Project created from lead',
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(projectNote);

      // Update lead with project status
      await sql`
        UPDATE leads 
        SET job_status = ${job_status || 'scheduled'},
            notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    }
    
    // ==================== NEW: UPDATE PROJECT ====================
    else if (action === 'update_project') {
      // Get existing notes
      const lead = await sql`
        SELECT notes FROM leads WHERE id = ${id}
      `;

      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      // Add project updated note
      const projectNote = {
        type: 'project_updated',
        text: `Project updated - Status: ${job_status}${scheduled_date ? `, Scheduled: ${scheduled_date}` : ''}${assigned_to ? `, Assigned to: ${assigned_to}` : ''}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(projectNote);

      // Build update query dynamically based on what fields are provided
      const jobCompletedAt = job_status === 'completed' ? new Date().toISOString() : null;

      await sql`
        UPDATE leads 
        SET job_status = ${job_status},
            scheduled_date = ${scheduled_date || null},
            scheduled_time = ${scheduled_time || null},
            assigned_to = ${assigned_to || null},
            estimated_hours = ${estimated_hours || null},
            actual_hours = ${actual_hours || null},
            job_completed_at = COALESCE(job_completed_at, ${jobCompletedAt}),
            notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    }
    
    // ==================== NEW: SAVE QUOTE ====================
    else if (action === 'save_quote') {
      // Get existing notes
      const lead = await sql`
        SELECT notes FROM leads WHERE id = ${id}
      `;

      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      // Add quote created note
      const quoteNote = {
        type: 'quote_created',
        text: `Quote created - Total: $${quote_total.toFixed(2)}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(quoteNote);

      await sql`
        UPDATE leads 
        SET quote_data = ${JSON.stringify(quote_data)},
            quote_total = ${quote_total},
            notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    }
    
    // ==================== NEW: SEND QUOTE ====================
    else if (action === 'send_quote') {
      // Get lead info
      const lead = await sql`
        SELECT notes, email, name FROM leads WHERE id = ${id}
      `;

      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      // Add quote sent note
      const quoteNote = {
        type: 'quote_sent',
        text: `Quote sent to ${lead[0]?.email}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(quoteNote);

      await sql`
        UPDATE leads 
        SET quote_sent_at = NOW(),
            notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      // TODO: Send actual email to customer with quote
      // Integrate with SendGrid, Resend, or your email service here

      return NextResponse.json({ success: true });
    }
    
    // ==================== NEW: UPDATE PAYMENT ====================
    else if (action === 'update_payment') {
      // Get existing notes
      const lead = await sql`
        SELECT notes FROM leads WHERE id = ${id}
      `;

      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      // Add payment updated note
      const paymentNote = {
        type: 'payment_updated',
        text: `Payment status: ${payment_status}${payment_amount ? ` - Amount: $${payment_amount}` : ''}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(paymentNote);

      // Set paid_at timestamp if status is 'paid'
      const paidAt = payment_status === 'paid' ? new Date().toISOString() : null;

      await sql`
        UPDATE leads 
        SET payment_status = ${payment_status},
            payment_amount = ${payment_amount || null},
            paid_at = COALESCE(paid_at, ${paidAt}),
            notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    }
    
    // ==================== LEGACY: FALLBACK ====================
    else {
      // Legacy: just update status without tracking
      await sql`
        UPDATE leads 
        SET status = ${status}
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });
    }

  } catch (error) {
    console.error('Failed to update lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}