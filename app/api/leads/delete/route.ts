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

    // 🔒 Get user role from token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    const userRole = decoded.role || 'member';

    // 🔒 CHECK PERMISSION
    if (!canDeleteLead(userRole)) {
      return NextResponse.json(
        { success: false, error: PERMISSION_ERRORS.CANNOT_DELETE_LEAD },
        { status: 403 }
      );
    }
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Just set deleted flag instead of actually deleting
    const result = await sql`
      UPDATE leads 
      SET 
        deleted = TRUE,
        deleted_at = NOW(),
        deleted_by_name = ${user_name || 'Unknown'},
        deleted_by_email = ${user_email || 'unknown@email.com'},
        deleted_reason = ${reason || null}
      WHERE id = ${id} AND deleted = FALSE
      RETURNING id, name
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Lead not found or already deleted' }, { status: 404 });
    }
    
    console.log(`Lead ${id} (${result[0].name}) soft-deleted by ${user_name} (${userRole})`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lead deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete lead error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete lead' 
    }, { status: 500 });
  }
}