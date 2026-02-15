import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { canDeleteLead, PERMISSION_ERRORS } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 Bulk delete request:', body);
    
    const { leadIds, user_name, user_email, reason } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No leads selected' 
      }, { status: 400 });
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

    // Soft delete leads one by one (Neon doesn't support dynamic IN clauses well)
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
        WHERE id = ${leadId} AND deleted = FALSE
        RETURNING id, name
      `;

      if (result.length > 0) {
        deletedCount++;
        deletedLeads.push(result[0]);
      }
    }
    
    console.log(`✅ Deleted ${deletedCount} leads by ${user_name} (${userRole})`);

    // Add activity log to each project (if exists)
    for (const lead of deletedLeads) {
      // Check if lead has project
      const leadCheck = await sql`
        SELECT project_id FROM leads WHERE id = ${lead.id}
      `;
      
      const projectId = leadCheck[0]?.project_id;

      const noteEntry = {
        type: 'bulk_delete',
        text: `Lead deleted (bulk action)${reason ? ` - Reason: ${reason}` : ''}`,
        user_name: user_name || 'System',
        user_email: user_email || '',
        timestamp: new Date().toISOString()
      };

      // Add to project notes if project exists
      if (projectId) {
        const project = await sql`SELECT notes FROM projects WHERE id = ${projectId}`;
        
        let notes = [];
        try {
          const rawNotes = project[0]?.notes;
          if (!rawNotes) {
            notes = [];
          } else if (typeof rawNotes === 'string') {
            notes = JSON.parse(rawNotes);
          } else if (Array.isArray(rawNotes)) {
            notes = rawNotes;
          }
        } catch (e) {
          notes = [];
        }

        notes.push(noteEntry);

        await sql`
          UPDATE projects 
          SET notes = ${JSON.stringify(notes)},
              updated_at = NOW()
          WHERE id = ${projectId}
        `;
      }
    }

    console.log('✅ Bulk delete complete');
    return NextResponse.json({ 
      success: true, 
      deleted: deletedCount,
      message: `Deleted ${deletedCount} lead(s)`
    });

  } catch (error) {
    console.error('❌ Bulk delete error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete leads' 
    }, { status: 500 });
  }
}