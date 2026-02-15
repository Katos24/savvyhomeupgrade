import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📥 Bulk update request:', body);
    
    const { leadIds, updates, user_name, user_email } = body;

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No leads selected' 
      }, { status: 400 });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No updates provided' 
      }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Update leads one by one (Neon prefers template literals)
    let updatedCount = 0;

    for (const leadId of leadIds) {
      // Build update conditionally
      if (updates.status !== undefined) {
        await sql`
          UPDATE leads 
          SET status = ${updates.status},
              updated_at = NOW()
          WHERE id = ${leadId}
        `;
        updatedCount++;
      }
      
      if (updates.assigned_to !== undefined) {
        await sql`
          UPDATE leads 
          SET assigned_to = ${updates.assigned_to},
              updated_at = NOW()
          WHERE id = ${leadId}
        `;
        if (updates.status === undefined) updatedCount++;
      }
      
      if (updates.category !== undefined) {
        await sql`
          UPDATE leads 
          SET category = ${updates.category},
              updated_at = NOW()
          WHERE id = ${leadId}
        `;
        if (updates.status === undefined && updates.assigned_to === undefined) updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} leads`);

    // Add activity log to each lead/project
    for (const leadId of leadIds) {
      // Check if lead has project
      const leadCheck = await sql`
        SELECT project_id FROM leads WHERE id = ${leadId}
      `;
      
      const projectId = leadCheck[0]?.project_id;

      // Build note text
      const updateTexts = Object.entries(updates)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      const noteEntry = {
        type: 'bulk_update',
        text: `Bulk update - ${updateTexts}`,
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

    // Also update projects table if updating assigned_to
    if (updates.assigned_to !== undefined) {
      for (const leadId of leadIds) {
        await sql`
          UPDATE projects 
          SET assigned_to = ${updates.assigned_to},
              updated_at = NOW()
          WHERE lead_id = ${leadId}
        `;
      }
    }

    console.log('✅ Bulk update complete');
    return NextResponse.json({ 
      success: true, 
      updated: updatedCount,
      message: `Updated ${updatedCount} lead(s)`
    });

  } catch (error) {
    console.error('❌ Bulk update error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update leads' 
    }, { status: 500 });
  }
}