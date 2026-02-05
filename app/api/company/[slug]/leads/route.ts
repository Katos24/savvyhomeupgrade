import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

type Props = {
  params: Promise<{ slug: string }>
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    // Get company ID from slug
    const companies = await sql`SELECT id FROM companies WHERE slug = ${slug}`;
    
    if (companies.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const companyId = companies[0].id;

    // LEFT JOIN with projects to get all project data
    const leads = await sql`
      SELECT 
        l.*,
        p.id as project_id,
        p.status as job_status,
        p.scheduled_date,
        p.scheduled_time,
        p.assigned_to,
        p.estimated_hours,
        p.actual_hours,
        p.quote_data,
        p.quote_total,
        p.quote_sent_at,
        p.quote_accepted_at,
        p.payment_status,
        p.payment_amount,
        p.paid_at,
        p.invoice_data,
        p.invoice_sent_at,
        p.before_photos,
        p.after_photos,
        p.documents,
        p.completed_at as job_completed_at,
        p.notes as project_notes,
        p.tasks as project_tasks

      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
      ORDER BY l.created_at DESC
    `;

    // 🔥 Use project_notes ONLY - no more merging!
    const processedLeads = leads.map(lead => {
      let notes = [];
      
      // Only use project notes if they exist
      if (lead.project_notes) {
        try {
          notes = typeof lead.project_notes === 'string' 
            ? JSON.parse(lead.project_notes) 
            : lead.project_notes;
        } catch (e) {
          console.warn('Failed to parse project notes:', e);
          notes = [];
        }
      }

      // Sort notes by timestamp (oldest first)
      notes.sort((a: any, b: any) => {
        const timeA = new Date(a.timestamp || 0).getTime();
        const timeB = new Date(b.timestamp || 0).getTime();
        return timeA - timeB;
      });

      // Remove project_notes from returned object
      const { project_notes, ...leadWithoutProjectNotes } = lead;

      return {
        ...leadWithoutProjectNotes,
        notes: JSON.stringify(notes)
      };
    });

    return NextResponse.json({ success: true, leads: processedLeads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}