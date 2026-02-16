import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('==========================================');
    console.log('📥 REQUEST:', JSON.stringify(body, null, 2));
    
    const { 
      id, 
      status, 
      notes, 
      action,
      user_name,
      user_email,
      old_status,
      // Payment fields
      payment_status,
      payment_amount,
      // Project fields
      job_status,
      scheduled_date,
      scheduled_time,
      assigned_to,
      estimated_hours,
      actual_hours,
      // Quote fields
      quote_data,
      quote_total
    } = body;

    const sql = neon(process.env.DATABASE_URL!);

    // ==================== UPDATE STATUS ====================
    if (action === 'update_status') {
      console.log('🔄 ACTION: update_status');
      
      const lead = await sql`SELECT notes FROM leads WHERE id = ${id}`;
      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch (e) {
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
      const notesJson = JSON.stringify(existingNotes);
      const statusString = String(status);

      await sql`
        UPDATE leads 
        SET 
          status = ${statusString}::text,
          notes = ${notesJson}::jsonb,
          updated_at = NOW()
        WHERE id = ${id}
      `;

      console.log('✅ Status updated to:', statusString);
      return NextResponse.json({ success: true });
    }

    // ==================== ADD NOTE ====================
    else if (action === 'add_note') {
      console.log('📝 ACTION: add_note');
      
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
        SET notes = ${JSON.stringify(existingNotes)}::jsonb,
            updated_at = NOW()
        WHERE id = ${id}
      `;

      console.log('✅ Note added');
      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE PAYMENT ====================
    else if (action === 'update_payment') {
      console.log('💳 ACTION: update_payment');
      console.log('Payment status:', payment_status);
      console.log('Payment amount:', payment_amount);
      
      const lead = await sql`SELECT notes FROM leads WHERE id = ${id}`;
      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      // Add payment update to notes
      const paymentNote = {
        type: 'payment_updated',
        text: `Payment status: ${payment_status}${payment_amount ? ` - Amount: $${payment_amount}` : ''}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(paymentNote);

      // Update payment fields
      const paidAt = payment_status === 'paid' ? new Date().toISOString() : null;

      await sql`
        UPDATE leads 
        SET 
          payment_status = ${payment_status},
          payment_amount = ${payment_amount || null},
          paid_at = ${paidAt},
          notes = ${JSON.stringify(existingNotes)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id}
      `;

      console.log('✅ Payment updated');
      return NextResponse.json({ success: true });
    }

    // ==================== UPDATE PROJECT ====================
    else if (action === 'update_project') {
      console.log('📋 ACTION: update_project');
      
      const lead = await sql`SELECT notes FROM leads WHERE id = ${id}`;
      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      // Build note text
      let noteText = 'Project updated';
      if (job_status) noteText += ` - Status: ${job_status}`;
      if (scheduled_date) noteText += `, Scheduled: ${scheduled_date}`;
      if (assigned_to) noteText += `, Assigned to: ${assigned_to}`;

      const projectNote = {
        type: 'project_updated',
        text: noteText,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(projectNote);

      await sql`
        UPDATE leads 
        SET 
          job_status = ${job_status || null},
          scheduled_date = ${scheduled_date || null},
          scheduled_time = ${scheduled_time || null},
          assigned_to = ${assigned_to || null},
          estimated_hours = ${estimated_hours || null},
          actual_hours = ${actual_hours || null},
          notes = ${JSON.stringify(existingNotes)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id}
      `;

      console.log('✅ Project updated');
      return NextResponse.json({ success: true });
    }

    // ==================== SAVE QUOTE ====================
    else if (action === 'save_quote') {
      console.log('💰 ACTION: save_quote');
      
      const lead = await sql`SELECT notes FROM leads WHERE id = ${id}`;
      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      const quoteNote = {
        type: 'quote_created',
        text: `Quote created - Total: $${quote_total}`,
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(quoteNote);

      await sql`
        UPDATE leads 
        SET 
          quote_data = ${JSON.stringify(quote_data)}::jsonb,
          quote_total = ${quote_total},
          notes = ${JSON.stringify(existingNotes)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id}
      `;

      console.log('✅ Quote saved');
      return NextResponse.json({ success: true });
    }

    // ==================== SEND QUOTE ====================
    else if (action === 'send_quote') {
      console.log('📤 ACTION: send_quote');
      
      const lead = await sql`SELECT notes FROM leads WHERE id = ${id}`;
      let existingNotes = [];
      try {
        existingNotes = lead[0]?.notes ? JSON.parse(lead[0].notes) : [];
      } catch {
        existingNotes = [];
      }

      const quoteNote = {
        type: 'quote_sent',
        text: 'Quote sent to customer',
        user_name: user_name,
        user_email: user_email,
        timestamp: new Date().toISOString()
      };

      existingNotes.push(quoteNote);

      await sql`
        UPDATE leads 
        SET 
          quote_sent_at = NOW(),
          notes = ${JSON.stringify(existingNotes)}::jsonb,
          updated_at = NOW()
        WHERE id = ${id}
      `;

      console.log('✅ Quote sent');
      return NextResponse.json({ success: true });
    }

    // ==================== LEGACY (NO ACTION) ====================
    else {
      console.log('⚠️ Legacy update (no action specified)');
      
      await sql`
        UPDATE leads 
        SET status = ${status}::text,
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