import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { can, type PlanTier } from '@/lib/permissions';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
  const { slug } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { jwt.verify(token, process.env.JWT_SECRET!); }
    catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const { searchParams } = new URL(request.url);
    
    const filterStatus = searchParams.get('status') || 'all';
    const timeFilter = searchParams.get('time') || 'all';
    const filterCategory = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';
    const exportFormat = searchParams.get('format') || 'all';
    
    const sql = neon(process.env.DATABASE_URL!);

    // Get company + custom_questions + plan check
    const companies = await sql`
      SELECT id, custom_questions, plan_tier
      FROM companies 
      WHERE slug = ${slug}
    `;
    if (companies.length === 0) {
      return new NextResponse('Company not found', { status: 404 });
    }

    // Server-side plan check
    const dbPlanTier = (companies[0].plan_tier ?? 'basic') as PlanTier;
    if (!can(dbPlanTier, 'csv_export')) {
      return NextResponse.json({
        success: false,
        error: 'CSV export is available on the basic plan',
        upgrade_required: true,
      }, { status: 403 });
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
        p.quote_sent_at,
        p.scheduled_date,
        p.scheduled_time,
        p.assigned_to,
        p.estimated_hours,
        p.invoice_number,
p.invoice_sent_at,
p.quote_total,
p.quote_data,
p.payment_status,
p.payment_amount,
p.payment_due_date,
p.payment_date,
p.payment_method
        l.lead_source,
        l.preferred_date,
        l.preferred_time,
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

    let csvRows: string[] = [];

   if (exportFormat === 'quickbooks') {
  const invoicedLeads = leads.filter(l => l.invoice_number && l.project_id);

  if (invoicedLeads.length === 0) {
    return new NextResponse('No invoiced projects found', { status: 404 });
  }

const qbHeaders = [
  'Invoice No.',
  'Customer',
  'Invoice Date',
  'Due Date',
  'Item Description',
  'Item Type',
  'QBO Account',
  'Quantity',
  'Unit Price',
  'Line Amount',
  'Total Amount',
  'Amount Paid',
  'Payment Status',
  'Payment Date',
  'Payment Method',
  'Service Address',
  'City',
  'Zip',
];

 csvRows = [qbHeaders.join(',')];

for (const lead of invoicedLeads) {
  const invoiceDate = lead.invoice_sent_at
    ? new Date(lead.invoice_sent_at).toLocaleDateString()
    : lead.payment_date
    ? new Date(lead.payment_date).toLocaleDateString()
    : lead.quote_sent_at
    ? new Date(lead.quote_sent_at).toLocaleDateString()
    : '';

  const dueDate = lead.payment_due_date
    ? new Date(lead.payment_due_date).toLocaleDateString()
    : '';

  const serviceAddress = lead.address_line_1 || '';
  const city = lead.city || '';
  const zip = lead.zip_code || '';
  const paymentStatus = lead.payment_status || '';
  const paymentDate = lead.payment_date ? new Date(lead.payment_date).toLocaleDateString() : '';
  const paymentMethod = lead.payment_method || '';
  const amountPaid = lead.payment_amount ? parseFloat(lead.payment_amount).toFixed(2) : '';
  const totalAmount = lead.quote_total ? parseFloat(lead.quote_total).toFixed(2) : '';

  // Parse line items from quote_data
  let lineItems: any[] = [];
  try {
    const raw = lead.quote_data;
    if (raw) {
      lineItems = typeof raw === 'string' ? JSON.parse(raw) : raw;
    }
  } catch {
    lineItems = [];
  }

  // If no line items fall back to single row with totall
  if (!lineItems || lineItems.length === 0) {
    const qbValues = [
  escape(lead.invoice_number || ''),
  escape(lead.name || ''),
  escape(invoiceDate),
  escape(dueDate),
  escape(lead.category || ''),
  escape('service'),
  escape(''),
  escape('1'),
  escape(totalAmount),
  escape(totalAmount),
  escape(totalAmount),
  escape(amountPaid),
  escape(paymentStatus),
  escape(paymentDate),
  escape(paymentMethod),
  escape(serviceAddress),
  escape(city),
  escape(zip),
];
    csvRows.push(qbValues.join(','));
  } else {
    // One row per line item
    for (const item of lineItems) {
      const lineAmount = item.amount ? parseFloat(item.amount).toFixed(2) : '';
      const unitPrice = item.unitPrice ? parseFloat(item.unitPrice).toFixed(2) : '';
      const quantity = item.quantity ? item.quantity.toString() : '1';

     const qbValues = [
  escape(lead.invoice_number || ''),
  escape(lead.name || ''),
  escape(invoiceDate),
  escape(dueDate),
  escape(item.description || ''),
  escape(item.type || ''),
  escape(item.qbo_account || ''),
  escape(quantity),
  escape(unitPrice),
  escape(lineAmount),
  escape(totalAmount),
  escape(amountPaid),
  escape(paymentStatus),
  escape(paymentDate),
  escape(paymentMethod),
  escape(serviceAddress),
  escape(city),
  escape(zip),
];
      csvRows.push(qbValues.join(','));
    }
  }
}

} else {
      // Full export — all fields
      const staticHeaders = [
        'Type',
'Invoice #',
'Full Name',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Address',
        'City',
        'Zip Code',
        'Category',
        'Status',
        'Description',
        'Invoice Date',
        'Scheduled Date',
        'Scheduled Time',
        'Assigned To',
        'Estimated Hours',
        'Quote Total',
        'Payment Status',
        'Payment Amount',
        'Payment Due Date',
        'Payment Received Date',
        'Created Date',
        'Lead Source',
        'Preferred Date',
        'Preferred Time',
      ];

      const customHeaders = customQuestions.map((q: any) => q.label);
      const headers = [...staticHeaders, ...customHeaders];
      csvRows = [headers.join(',')];

      for (const lead of leads) {
        const nameParts = (lead.name || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        const answers = lead.custom_answers || {};

        const staticValues = [
         escape(lead.type),
escape(lead.invoice_number || ''),
escape(lead.name || ''),
          escape(firstName),
          escape(lastName),
          escape(lead.email),
          escape(lead.phone),
          escape(lead.address_line_1 || ''),
          escape(lead.city || ''),
          escape(lead.zip_code || ''),
          escape(lead.category),
          escape(lead.status || 'new'),
          escape(lead.description || ''),
          escape(lead.quote_sent_at ? new Date(lead.quote_sent_at).toLocaleDateString() : ''),
          escape(lead.scheduled_date ? new Date(lead.scheduled_date).toLocaleDateString() : ''),
          escape(lead.scheduled_time || ''),
          escape(lead.assigned_to || ''),
          escape(lead.estimated_hours || ''),
          escape(lead.quote_total ? `$${parseFloat(lead.quote_total).toFixed(2)}` : ''),
          escape(lead.payment_status || ''),
          escape(lead.payment_amount ? `$${parseFloat(lead.payment_amount).toFixed(2)}` : ''),
          escape(lead.payment_due_date ? new Date(lead.payment_due_date).toLocaleDateString() : ''),
          escape(lead.payment_date ? new Date(lead.payment_date).toLocaleDateString() : ''),
          escape(new Date(lead.created_at).toLocaleDateString()),
          escape(lead.lead_source || ''),
          escape(lead.preferred_date ? new Date(lead.preferred_date).toLocaleDateString() : ''),
          escape(lead.preferred_time || ''),
        ];

        const customValues = customQuestions.map((q: any) => {
          const raw = answers[q.id];
          if (raw === null || raw === undefined || raw === '') return escape('');
          if (q.type === 'checkbox') return escape(raw === true || raw === 'true' ? 'Yes' : 'No');
          return escape(raw);
        });

        csvRows.push([...staticValues, ...customValues].join(','));
      }
    }

    const csv = csvRows.join('\n');
    const formatSuffix = exportFormat === 'quickbooks' ? '_quickbooks' : '';
    const filename = `${slug}${formatSuffix}_${new Date().toISOString().split('T')[0]}.csv`;

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