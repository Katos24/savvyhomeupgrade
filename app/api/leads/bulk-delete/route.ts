import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { canDeleteLead, PERMISSION_ERRORS } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { leadIds, user_name, user_email, reason } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No leads selected' }, { status: 400 });
    }

    // ── Auth ──────────────────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not set');
    const decoded: any = jwt.verify(token, secret);
    const userRole = decoded.role || 'member';

    // ── Permission check ──────────────────────────────────────
    if (!canDeleteLead(userRole)) {
      return NextResponse.json({ success: false, error: PERMISSION_ERRORS.CANNOT_DELETE_LEAD }, { status: 403 });
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

    // ── Soft delete ───────────────────────────────────────────
    let deletedCount = 0;
    const deletedLeads = [];

    for (const leadId of leadIds) {
      const result = await sql`
        UPDATE leads 
        SET deleted = TRUE,
            deleted_at = NOW(),
            deleted_by_name = ${user_name || 'Unknown'},
            deleted_by_email = ${user_email || 'unknown@email.com'},
            deleted_reason = ${reason || 'Bulk delete'},
            updated_at = NOW()
        WHERE id = ${leadId}
          AND deleted = FALSE
          AND company_id = ${decoded.companyId}
        RETURNING id, name
      `;
      if (result.length > 0) {
        deletedCount++;
        deletedLeads.push(result[0]);
      }
    }

    // ── Activity log ─────────────────────────────────────────
    for (const lead of deletedLeads) {
      const leadCheck = await sql`SELECT project_id FROM leads WHERE id = ${lead.id}`;
      const projectId = leadCheck[0]?.project_id;

      const noteEntry = {
        type: 'bulk_delete',
        text: `Lead deleted (bulk action)${reason ? ` - Reason: ${reason}` : ''}`,
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

    return NextResponse.json({
      success: true,
      deleted: deletedCount,
      message: `Deleted ${deletedCount} lead(s)`,
    });

  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete leads' }, { status: 500 });
  }
}