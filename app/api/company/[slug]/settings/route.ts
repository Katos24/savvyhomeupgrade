import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT to get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;

    // Get current user
    const users = await sql`
      SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    const currentUser = users[0];

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get company
    const companies = await sql`
      SELECT * FROM companies WHERE slug = ${params.slug} LIMIT 1
    `;
    const company = companies[0];

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    // Check if user belongs to this company
    if (currentUser.company_id !== company.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Only owner and admin can access settings
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      company,
    });

  } catch (error) {
    console.error('Error fetching company settings:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT to get user info
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    
    // Get current user
    const users = await sql`
      SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    const currentUser = users[0];

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get company
    const companies = await sql`
      SELECT * FROM companies WHERE slug = ${params.slug} LIMIT 1
    `;
    const company = companies[0];

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    // Check if user belongs to this company
    if (currentUser.company_id !== company.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    // Only owner and admin can modify settings
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    console.log('Settings update action:', action);
    console.log('Settings update data:', data);

    // Handle different actions
    switch (action) {
      case 'update-general':
        await sql`
          UPDATE companies
          SET 
            name = ${data.name},
            email = ${data.email},
            phone = ${data.phone},
            business_type = ${data.business_type},
            logo_url = ${data.logo_url}
          WHERE id = ${company.id}
        `;
        console.log('General settings updated, new logo_url:', data.logo_url);
        break;

      case 'update-pipeline':
        await sql`
          UPDATE companies
          SET status_options = ${JSON.stringify(data.status_options)}::jsonb
          WHERE id = ${company.id}
        `;
        break;

      case 'update-email-templates':
        await sql`
          UPDATE companies
          SET email_templates = ${JSON.stringify(data.email_templates)}::jsonb
          WHERE id = ${company.id}
        `;
        break;

      case 'update-categories':
        await sql`
          UPDATE companies
          SET form_categories = ${JSON.stringify(data.form_categories)}::jsonb
          WHERE id = ${company.id}
        `;
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });

  } catch (error) {
    console.error('Error updating company settings:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
