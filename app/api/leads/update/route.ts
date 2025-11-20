import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes, action } = body;

    const sql = neon(process.env.DATABASE_URL!);
    
    if (action === 'add_note') {
      // Get existing notes
      const [lead] = await sql`SELECT notes FROM leads WHERE id = ${id}`;
      
      let notesArray = [];
      if (lead.notes) {
        try {
          notesArray = JSON.parse(lead.notes);
        } catch (e) {
          // If notes is a string, convert it to an array entry
          notesArray = lead.notes ? [{ text: lead.notes, timestamp: new Date().toISOString() }] : [];
        }
      }
      
      // Add new note
      notesArray.push({
        text: notes,
        timestamp: new Date().toISOString()
      });
      
      await sql`
        UPDATE leads 
        SET notes = ${JSON.stringify(notesArray)}
        WHERE id = ${id}
      `;
    } else {
      // Just update status
      await sql`
        UPDATE leads 
        SET status = ${status}
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}
