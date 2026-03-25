import { adminDb as sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      id,
      status,
      notes,
      action,
      user_name,
      user_email,
      old_status
    } = await request.json();

    if (action === 'update_status') {
      const lead = await sql`
        SELECT notes FROM leads WHERE id = ${id}
      `;

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
        timestamp: new Date().toISOString(),
      };

      existingNotes.push(statusChangeEntry);

      await sql`
        UPDATE leads
        SET status = ${status},
            notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });

    } else if (action === 'add_note') {
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
        timestamp: new Date().toISOString(),
      };

      existingNotes.push(newNote);

      await sql`
        UPDATE leads
        SET notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({ success: true });

    } else {
      await sql`
        UPDATE leads
        SET status = ${status},
            updated_at = NOW()
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