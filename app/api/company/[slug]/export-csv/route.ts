import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const sql = neon(process.env.DATABASE_URL!);
    
    console.log('Exporting CSV for slug:', slug); // DEBUG
    
    const leads = await sql`
      SELECT 
        l.name,
        l.email,
        l.phone,
        l.category,
        l.status,
        l.description,
        l.created_at
      FROM leads l
      JOIN companies c ON l.company_id = c.id
      WHERE c.slug = ${slug}
      ORDER BY l.created_at DESC
    `;

    console.log('Found leads:', leads.length); // DEBUG

    if (leads.length === 0) {
      return new NextResponse('No leads found', { status: 404 });
    }

    // Create CSV
    const headers = ['Name', 'Email', 'Phone', 'Category', 'Status', 'Description', 'Date'];
    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      const row = [
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.phone}"`,
        `"${lead.category}"`,
        `"${lead.status || 'new'}"`,
        `"${(lead.description || '').replace(/"/g, '""')}"`,
        new Date(lead.created_at).toLocaleDateString()
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${slug}-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export' },
      { status: 500 }
    );
  }
}
