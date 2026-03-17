import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { canDeleteLead, PERMISSION_ERRORS } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    const { id, user_name, user_email, reason } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
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

    // ── Verify lead belongs to this company ───────────────────
    const ownerCheck = await sql`
      SELECT id FROM leads
      WHERE id = ${id} AND company_id = ${decoded.companyId}
      LIMIT 1
    `;
    if (ownerCheck.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // ── Soft delete ───────────────────────────────────────────
    const result = await sql`
      UPDATE leads 
      SET 
        deleted = TRUE,
        deleted_at = NOW(),
        deleted_by_name = ${user_name || 'Unknown'},
        deleted_by_email = ${user_email || 'unknown@email.com'},
        deleted_reason = ${reason || null}
      WHERE id = ${id}
        AND deleted = FALSE
        AND company_id = ${decoded.companyId}
      RETURNING id, name
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lead deleted successfully' });

  } catch (error) {
    console.error('Delete lead error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 500 });
  }
}