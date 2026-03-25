import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { adminDb as sql } from '@/lib/db';

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    if (!authToken) return false;
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;
    const decoded: any = jwt.verify(authToken.value, secret);
    return decoded.role === 'super_admin';
  } catch {
    return false;
  }
}

export async function GET() {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const companies = await sql`
      SELECT * FROM companies 
      ORDER BY created_at DESC
    `;

    const companiesWithStats = await Promise.all(
      companies.map(async (company) => {
        const leadStats = await sql`
          SELECT 
            COUNT(*) as lead_count,
            MAX(created_at) as last_lead_at
          FROM leads 
          WHERE company_id = ${company.id}
        `;
        return {
          ...company,
          lead_count: parseInt(leadStats[0]?.lead_count || '0'),
          last_lead_at: leadStats[0]?.last_lead_at || null,
        };
      })
    );

    return NextResponse.json({ success: true, companies: companiesWithStats });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, slug, email, phone, password, business_type, logo_url, status_options, form_categories } = await request.json();

    const existing = await sql`SELECT id FROM companies WHERE slug = ${slug}`;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Company slug already exists' }, { status: 400 });
    }

    const company = await sql`
      INSERT INTO companies (name, slug, email, phone, business_type, logo_url, status_options, form_categories, created_at)
      VALUES (
        ${name}, 
        ${slug}, 
        ${email}, 
        ${phone || null}, 
        ${business_type || 'general'}, 
        ${logo_url || null}, 
        ${status_options ? JSON.stringify(status_options) : null}::jsonb,
        ${form_categories ? JSON.stringify(form_categories) : null}::jsonb,
        NOW()
      )
      RETURNING *
    `;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await sql`
        INSERT INTO users (email, password, company_id, role)
        VALUES (${email}, ${hashedPassword}, ${company[0].id}, 'contractor')
      `;
    }

    return NextResponse.json({ success: true, company: company[0] });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ success: false, error: 'Failed to create company' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, name, email, phone, business_type, logo_url, password, status_options, form_categories } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Company ID required' }, { status: 400 });
    }

    const company = await sql`
      UPDATE companies 
      SET 
        name = ${name},
        email = ${email},
        phone = ${phone || null},
        business_type = ${business_type || 'general'},
        logo_url = ${logo_url || null},
        status_options = ${status_options ? JSON.stringify(status_options) : null}::jsonb,
        form_categories = ${form_categories ? JSON.stringify(form_categories) : null}::jsonb
      WHERE id = ${id}
      RETURNING *
    `;

    if (company.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await sql`
        UPDATE users 
        SET password = ${hashedPassword}
        WHERE company_id = ${id}
      `;
    }

    return NextResponse.json({ success: true, company: company[0] });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ success: false, error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await verifyAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Company ID required' }, { status: 400 });
    }

    await sql`DELETE FROM leads WHERE company_id = ${id}`;
    await sql`DELETE FROM users WHERE company_id = ${id}`;

    const company = await sql`
      DELETE FROM companies 
      WHERE id = ${id}
      RETURNING *
    `;

    if (company.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Company and all leads deleted' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete company' }, { status: 500 });
  }
}