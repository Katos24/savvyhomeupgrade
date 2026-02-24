import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const city = searchParams.get('city');
    const email = searchParams.get('email');
    const company_id = searchParams.get('company_id');
    const exclude = searchParams.get('exclude');

    if (!name || !city || !company_id || !exclude) {
      return NextResponse.json(
        { error: 'Missing required params: name, city, company_id, exclude' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);

    const leads = await sql`
      SELECT
        l.id,
        l.name,
        l.city,
        l.email,
        l.category,
        l.status,
        l.created_at,
        l.scheduled_date,
        l.quote_total,
        l.payment_status,
        l.project_id,
        l.address_line_1,
        l.description,
        p.project_number
      FROM leads l
      LEFT JOIN projects p ON l.project_id = p.id
      WHERE
        l.company_id = ${parseInt(company_id)}
        AND LOWER(TRIM(l.name)) = LOWER(TRIM(${name}))
        AND LOWER(TRIM(l.city)) = LOWER(TRIM(${city}))
        AND l.id != ${parseInt(exclude)}
        AND l.deleted = false
      ORDER BY l.created_at DESC
    `;

    // Add match confidence based on email
    const results = leads.map((lead: any) => ({
      ...lead,
      match_confidence:
        email && lead.email && lead.email.toLowerCase() === email.toLowerCase()
          ? 'high'
          : 'medium',
    }));

    return NextResponse.json({ leads: results });
  } catch (error) {
    console.error('❌ Error fetching related leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related leads' },
      { status: 500 }
    );
  }
}