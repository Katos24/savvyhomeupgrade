import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    
    // Get filter parameters
    const filterStatus = searchParams.get('status') || 'all';
    const timeFilter = searchParams.get('time') || 'all';
    const filterCategory = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';
    
    console.log('Exporting CSV for slug:', slug);
    console.log('Filters:', { filterStatus, timeFilter, filterCategory, searchQuery });
    
    const sql = neon(process.env.DATABASE_URL!);

    // Get company
    const companies = await sql`SELECT id FROM companies WHERE slug = ${slug}`;
    if (companies.length === 0) {
      return new NextResponse('Company not found', { status: 404 });
    }
    const companyId = companies[0].id;

    // Build base query - fields come from BOTH leads and projects tables
    let query = `
      SELECT 
        l.id,
        l.name,
        l.email,
        l.phone,
        l.address_line_1,
        l.address_line_2,
        l.city,
        l.category,
        l.status,
        l.description,
        l.created_at,
        l.project_id,
        p.scheduled_date,
        p.scheduled_time,
        p.assigned_to,
        p.estimated_hours,
        p.quote_total,
        p.payment_status,
        p.payment_amount,
        CASE WHEN p.id IS NOT NULL THEN 'Project' ELSE 'Lead' END as type
      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      WHERE l.company_id = $1
        AND l.deleted = false
    `;
    
    const queryParams: any[] = [companyId];
    let paramIndex = 2;

    // Add status filter (status is in LEADS table)
    if (filterStatus !== 'all') {
      query += ` AND l.status = $${paramIndex}`;
      queryParams.push(filterStatus);
      paramIndex++;
    }

    // Add category filter (category is in LEADS table)
    if (filterCategory !== 'all') {
      query += ` AND l.category = $${paramIndex}`;
      queryParams.push(filterCategory);
      paramIndex++;
    }

    // Add search filter (search in LEADS table fields)
    if (searchQuery) {
      query += ` AND (
        l.name ILIKE $${paramIndex} OR 
        l.email ILIKE $${paramIndex} OR 
        l.phone ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${searchQuery}%`);
      paramIndex++;
    }

    // Add time filter (created_at is in LEADS table)
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

    console.log('Executing query with params:', queryParams);

    // Execute query using sql.query() for parameterized queries
    const result: any = await sql.query(query, queryParams);
    
    console.log('Query result type:', typeof result);
    console.log('Query result:', result);
    console.log('Is array?', Array.isArray(result));
    console.log('Has rows?', result && 'rows' in result);
    
    // Handle both possible return formats
    const leads: any[] = Array.isArray(result) ? result : (result?.rows || []);

    console.log('Found leads:', leads.length);

    if (leads.length === 0) {
      return new NextResponse('No leads found matching filters', { status: 404 });
    }

    // Create CSV with ALL columns
    const headers = [
      'Type',
      'Name',
      'Email',
      'Phone',
      'Address',
      'City',
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
      'Created Date'
    ];
    
    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      // Helper to escape CSV values
      const escape = (value: any) => {
        if (value === null || value === undefined) return '""';
        const str = String(value);
        // Escape quotes and wrap in quotes
        return `"${str.replace(/"/g, '""')}"`;
      };

      const row = [
        escape(lead.type),                                                           // Type (Lead/Project)
        escape(lead.name),                                                           // From LEADS table
        escape(lead.email),                                                          // From LEADS table
        escape(lead.phone),                                                          // From LEADS table
        escape(lead.address_line_1 || ''),                                          // From LEADS table
        escape(lead.city || ''),                                                     // From LEADS table
        escape(lead.category),                                                       // From LEADS table
        escape(lead.status || 'new'),                                               // From LEADS table
        escape(lead.description || ''),                                             // From LEADS table
        escape(lead.scheduled_date ? new Date(lead.scheduled_date).toLocaleDateString() : ''),  // From PROJECTS table
        escape(lead.scheduled_time || ''),                                          // From PROJECTS table
        escape(lead.assigned_to || ''),                                             // From PROJECTS table
        escape(lead.estimated_hours || ''),                                         // From PROJECTS table
        escape(lead.quote_total ? `$${parseFloat(lead.quote_total).toFixed(2)}` : ''),  // From PROJECTS table
        escape(lead.payment_status || ''),                                          // From PROJECTS table
        escape(lead.payment_amount ? `$${parseFloat(lead.payment_amount).toFixed(2)}` : ''),  // From PROJECTS table
        escape(new Date(lead.created_at).toLocaleDateString())                      // From LEADS table
      ];
      
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    // Generate filename: company-name_YYYY-MM-DD.csv
    const filename = `${slug}_${new Date().toISOString().split('T')[0]}.csv`;

    console.log(`Generated CSV with ${leads.length} leads, filename: ${filename}`);

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