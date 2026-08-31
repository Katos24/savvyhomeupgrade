import { adminDb as sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // ── 1. Auth check ──────────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, secret) as { userId: string };
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    // Verify caller's company
    const users = await sql`
      SELECT company_id FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    const companyId = users[0]?.company_id;
    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse & validate body ────────────────────────────────
    const body = await request.json();
    const { id, status, notes, action, user_name, user_email, old_status } = body;

    const leadId = parseInt(id, 10);
    if (!leadId || Number.isNaN(leadId)) {
      return NextResponse.json({ success: false, error: 'Invalid lead ID' }, { status: 400 });
    }

    // Ensure lead belongs to the user's company
    const leadCheck = await sql`
      SELECT l.id, l.notes, l.email as customer_email, l.name as customer_name,
             l.category, l.company_id, p.id as project_id, p.review_request_sent_at
      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      WHERE l.id = ${leadId} AND l.company_id = ${companyId} AND l.deleted = false
      LIMIT 1
    `;

    if (!leadCheck.length) {
      return NextResponse.json({ success: false, error: 'Lead not found' }, { status: 404 });
    }

    const currentLead = leadCheck[0];

    // ── 3. Handle Actions ──────────────────────────────────────
    if (action === 'update_status') {
      let existingNotes = [];
      try {
        existingNotes = currentLead.notes ? JSON.parse(currentLead.notes) : [];
      } catch {
        existingNotes = [];
      }

      const statusChangeEntry = {
        type: 'status_change',
        old_status,
        new_status: status,
        user_name,
        user_email,
        timestamp: new Date().toISOString(),
      };

      existingNotes.push(statusChangeEntry);

      await sql`
        UPDATE leads
        SET status = ${status},
            notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${leadId} AND company_id = ${companyId}
      `;

      // Trigger review request email on job completion
      if (status === 'completed' && old_status !== 'completed') {
        if (currentLead.company_id && currentLead.customer_email && !currentLead.review_request_sent_at) {
          try {
            const { sendGoogleReviewRequestEmail } = await import('@/lib/email');
            await sendGoogleReviewRequestEmail({
              customerEmail: currentLead.customer_email,
              customerName: currentLead.customer_name,
              companyId: currentLead.company_id,
              jobCategory: currentLead.category,
            });

            if (currentLead.project_id) {
              await sql`
                UPDATE projects
                SET review_request_sent_at = NOW()
                WHERE id = ${currentLead.project_id} AND company_id = ${companyId}
              `;
            }
          } catch (emailErr) {
            console.error('Failed to send review request email:', emailErr);
            // Non-blocking: standard status update still completes successfully
          }
        }
      }

      return NextResponse.json({ success: true });

    } else if (action === 'add_note') {
      let existingNotes = [];
      try {
        existingNotes = currentLead.notes ? JSON.parse(currentLead.notes) : [];
      } catch {
        existingNotes = [];
      }

      const newNote = {
        type: 'note',
        text: notes,
        user_name,
        user_email,
        timestamp: new Date().toISOString(),
      };

      existingNotes.push(newNote);

      await sql`
        UPDATE leads
        SET notes = ${JSON.stringify(existingNotes)},
            updated_at = NOW()
        WHERE id = ${leadId} AND company_id = ${companyId}
      `;

      return NextResponse.json({ success: true });

    } else {
      await sql`
        UPDATE leads
        SET status = ${status},
            updated_at = NOW()
        WHERE id = ${leadId} AND company_id = ${companyId}
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