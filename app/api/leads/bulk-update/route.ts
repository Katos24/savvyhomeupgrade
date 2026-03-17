import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // ── Auth ──────────────────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    const decoded: any = jwt.verify(token, secret);

    const body = await request.json();
    const { leadIds, updates, user_name, user_email } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads selected' }, { status: 400 });
    }
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, error: 'No updates provided' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // ── Verify all leads belong to this company ───────────────
    const companyCheck = await sql`
      SELECT COUNT(*) as count FROM leads
      WHERE id = ANY(${leadIds}::int[])
      AND company_id = ${decoded.companyId}
    `;
    if (parseInt(companyCheck[0].count) !== leadIds.length) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // ── Update leads ─────────────────────────────────────────
    let updatedCount = 0;
    for (const leadId of leadIds) {
      if (updates.status !== undefined) {
        await sql`
          UPDATE leads 
          SET status = ${updates.status}, updated_at = NOW()
          WHERE id = ${leadId}
        `;
        updatedCount++;
      }
      if (updates.assigned_to !== undefined) {
        await sql`
          UPDATE leads 
          SET assigned_to = ${updates.assigned_to}, updated_at = NOW()
          WHERE id = ${leadId}
        `;
        if (updates.status === undefined) updatedCount++;
      }
      if (updates.category !== undefined) {
        await sql`
          UPDATE leads 
          SET category = ${updates.category}, updated_at = NOW()
          WHERE id = ${leadId}
        `;
        if (updates.status === undefined && updates.assigned_to === undefined) updatedCount++;
      }
    }

    // ── Activity log ─────────────────────────────────────────
    const updateTexts = Object.entries(updates)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    for (const leadId of leadIds) {
      const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${leadId}`;
      const projectId = leadCheck[0]?.project_id;

      const noteEntry = {
        type: 'bulk_update',
        text: `Bulk update - ${updateTexts}`,
        user_name: user_name || 'System',
        user_email: user_email || '',
        timestamp: new Date().toISOString(),
      };

      if (projectId) {
        const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
        let notes = [];
        try {
          const rawNotes = project[0]?.notes;
          if (!rawNotes) notes = [];
          else if (typeof rawNotes === 'string') notes = JSON.parse(rawNotes);
          else if (Array.isArray(rawNotes)) notes = rawNotes;
        } catch { notes = []; }
        notes.push(noteEntry);
        await sql`
          UPDATE projects 
          SET notes = ${JSON.stringify(notes)}, updated_at = NOW()
          WHERE id = ${projectId}
        `;
      }
    }

    // ── Sync assigned_to to projects ─────────────────────────
    if (updates.assigned_to !== undefined) {
      for (const leadId of leadIds) {
        await sql`
          UPDATE projects 
          SET assigned_to = ${updates.assigned_to}, updated_at = NOW()
          WHERE lead_id = ${leadId}
        `;
      }
    }

    return NextResponse.json({
      success: true,
      updated: updatedCount,
      message: `Updated ${updatedCount} lead(s)`,
    });

  } catch (error) {
    console.error('❌ Bulk update error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update leads' }, { status: 500 });
  }
}