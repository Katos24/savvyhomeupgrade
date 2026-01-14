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
      old_status 
    } = body;

    const sql = neon(process.env.DATABASE_URL!);

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

    } else if (action === 'add_note') {
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

    } else {
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
