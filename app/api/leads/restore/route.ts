import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Lead ID is required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Just unset the deleted flag
    const result = await sql`
      UPDATE leads 
      SET 
        deleted = FALSE,
        deleted_at = NULL,
        deleted_by_name = NULL,
        deleted_by_email = NULL,
        deleted_reason = NULL
      WHERE id = ${id} AND deleted = TRUE
      RETURNING id, name
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ success: false, error: 'Deleted lead not found' }, { status: 404 });
    }
    
    console.log(`Lead ${id} (${result[0].name}) restored`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Lead restored successfully'
    });
    
  } catch (error) {
    console.error('Restore lead error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to restore lead' 
    }, { status: 500 });
  }
}