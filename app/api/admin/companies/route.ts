import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Simple query without aggregates - we'll count leads separately
    const companies = await sql`
      SELECT * FROM companies 
      ORDER BY created_at DESC
    `;
    
    // Get lead counts for each company
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
          last_lead_at: leadStats[0]?.last_lead_at || null
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
  try {
    const { name, slug, email, phone, password, business_type, logo_url, status_options, form_categories } = await request.json();
    const sql = neon(process.env.DATABASE_URL!);
    
    // Check if slug already exists
    const existing = await sql`SELECT id FROM companies WHERE slug = ${slug}`;
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Company slug already exists' }, { status: 400 });
    }
    
    // Create company with status_options AND form_categories
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
    
    // Create user for the company (if you have users table)
    if (password) {
      try {
        await sql`
          INSERT INTO users (email, password, company_id, role)
          VALUES (${email}, ${password}, ${company[0].id}, 'contractor')
        `;
      } catch (e) {
        console.log('Users table might not exist:', e);
      }
    }
    
    return NextResponse.json({ success: true, company: company[0] });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ success: false, error: 'Failed to create company' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, name, email, phone, business_type, logo_url, password, status_options, form_categories } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Company ID required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Update company INCLUDING status_options AND form_categories
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
    
    // Update password in users table if provided
    if (password && password.trim() !== '') {
      try {
        await sql`
          UPDATE users 
          SET password = ${password}
          WHERE company_id = ${id}
        `;
      } catch (e) {
        console.log('Could not update user password:', e);
      }
    }
    
    return NextResponse.json({ success: true, company: company[0] });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json({ success: false, error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Company ID required' }, { status: 400 });
    }
    
    const sql = neon(process.env.DATABASE_URL!);
    
    // Delete all leads first
    await sql`DELETE FROM leads WHERE company_id = ${id}`;
    
    // Delete users for this company
    try {
      await sql`DELETE FROM users WHERE company_id = ${id}`;
    } catch (e) {
      console.log('Could not delete users:', e);
    }
    
    // Delete company
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