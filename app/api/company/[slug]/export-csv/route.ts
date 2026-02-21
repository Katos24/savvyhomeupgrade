import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    const filterStatus = searchParams.get('status') || 'all';
    const timeFilter = searchParams.get('time') || 'all';
    const filterCategory = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';
    
    const sql = neon(process.env.DATABASE_URL!);

    // Get company + custom_questions
    const companies = await sql`
      SELECT id, custom_questions 
      FROM companies 
      WHERE slug = ${slug}
    `;
    if (companies.length === 0) {
      return new NextResponse('Company not found', { status: 404 });
    }
    const companyId = companies[0].id;
    const customQuestions: any[] = companies[0].custom_questions || [];

    // Build base query
    let query = `
      SELECT 
        l.id,
        l.name,
        l.email,
        l.phone,
        l.address_line_1,
        l.address_line_2,
        l.city,
        l.zip_code,
        l.category,
        l.status,
        l.description,
        l.created_at,
        l.project_id,
        l.custom_answers,
        p.scheduled_date,
        p.scheduled_time,
        p.assigned_to,
        p.estimated_hours,
        p.quote_total,
        p.payment_status,
        p.payment_amount,
        l.lead_source,
        CASE WHEN p.id IS NOT NULL THEN 'Project' ELSE 'Lead' END as type
      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      WHERE l.company_id = $1
        AND l.deleted = false
    `;
    
    const queryParams: any[] = [companyId];
    let paramIndex = 2;

    if (filterStatus !== 'all') {
      query += ` AND l.status = $${paramIndex}`;
      queryParams.push(filterStatus);
      paramIndex++;
    }

    if (filterCategory !== 'all') {
      query += ` AND l.category = $${paramIndex}`;
      queryParams.push(filterCategory);
      paramIndex++;
    }

    if (searchQuery) {
      query += ` AND (
        l.name ILIKE $${paramIndex} OR 
        l.email ILIKE $${paramIndex} OR 
        l.phone ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      if (timeFilter === 'today') {
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        query += ` AND l.created_at >= $${paramIndex}`;
        queryParams.push(todayStart.toISOString());
        paramIndex++;
      } else if (timeFilter === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        query += ` AND l.created_at >= $${paramIndex}`;
        queryParams.push(weekStart.toISOString());
        paramIndex++;
      } else if (timeFilter === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        query += ` AND l.created_at >= $${paramIndex}`;
        queryParams.push(monthStart.toISOString());
        paramIndex++;
      }
    }

    query += ` ORDER BY l.created_at DESC`;

    const result: any = await sql.query(query, queryParams);
    const leads: any[] = Array.isArray(result) ? result : (result?.rows || []);

    if (leads.length === 0) {
      return new NextResponse('No leads found matching filters', { status: 404 });
    }

    const escape = (value: any) => {
      if (value === null || value === undefined) return '""';
      const str = String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    // Build headers — static columns first, then one per custom question
    const staticHeaders = [
      'Type',
      'Name',
      'Email',
      'Phone',
      'Address',
      'City',
      'Zip Code',
      'Category',
      'Status',
      'Description',
      'Scheduled Date',
      'Scheduled Time',
      'Assigned To',
      'Estimated Hours',
      'Quote Total',
      'Payment Status',
      'Payment Amount',
      'Created Date',
      'Lead Source',
    ];

    const customHeaders = customQuestions.map(q => q.label);
    const headers = [...staticHeaders, ...customHeaders];
    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      const answers = lead.custom_answers || {};

      const staticValues = [
        escape(lead.type),
        escape(lead.name),
        escape(lead.email),
        escape(lead.phone),
        escape(lead.address_line_1 || ''),
        escape(lead.city || ''),
        escape(lead.zip_code || ''),
        escape(lead.category),
        escape(lead.status || 'new'),
        escape(lead.description || ''),
        escape(lead.scheduled_date ? new Date(lead.scheduled_date).toLocaleDateString() : ''),
        escape(lead.scheduled_time || ''),
        escape(lead.assigned_to || ''),
        escape(lead.estimated_hours || ''),
        escape(lead.quote_total ? `$${parseFloat(lead.quote_total).toFixed(2)}` : ''),
        escape(lead.payment_status || ''),
        escape(lead.payment_amount ? `$${parseFloat(lead.payment_amount).toFixed(2)}` : ''),
        escape(new Date(lead.created_at).toLocaleDateString()),
        escape(lead.lead_source || ''),
      ];

      // Format each custom answer
      const customValues = customQuestions.map(q => {
        const raw = answers[q.id];
        if (raw === null || raw === undefined || raw === '') return escape('');
        if (q.type === 'checkbox') return escape(raw === true || raw === 'true' ? 'Yes' : 'No');
        return escape(raw);
      });

      csvRows.push([...staticValues, ...customValues].join(','));
    }

    const csv = csvRows.join('\n');
    const filename = `${slug}_${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error('Export CSV error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export CSV', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}