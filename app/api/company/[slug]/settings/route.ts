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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;

    const users = await sql`
      SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    const currentUser = users[0];

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await sql`
      SELECT * FROM companies WHERE slug = ${params.slug} LIMIT 1
    `;
    const company = companies[0];

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    if (currentUser.company_id !== company.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    
    const users = await sql`
      SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    const currentUser = users[0];

    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const companies = await sql`
      SELECT * FROM companies WHERE slug = ${params.slug} LIMIT 1
    `;
    const company = companies[0];

    if (!company) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    if (currentUser.company_id !== company.id) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    console.log('Settings update action:', action);
    console.log('Settings update data:', data);

    switch (action) {
      case 'update-general':
        try {
          console.log('Updating company ID:', company.id);
          console.log('With data:', {
            name: data.name,
            email: data.email,
            phone: data.phone,
            website: data.website,
            business_type: data.business_type,
            logo_url: data.logo_url,
            email_brand_color_1: data.email_brand_color_1,
            email_brand_color_2: data.email_brand_color_2
          });
          
          const result = await sql`
            UPDATE companies
            SET 
              name = ${data.name},
              email = ${data.email},
              phone = ${data.phone || null},
              website = ${data.website || null},
              business_type = ${data.business_type || 'general'},
              logo_url = ${data.logo_url || null},
              email_brand_color_1 = ${data.email_brand_color_1 || '#667eea'},
              email_brand_color_2 = ${data.email_brand_color_2 || '#764ba2'}
            WHERE id = ${company.id}
            RETURNING *
          `;
          
          console.log('✅ Update successful:', result[0]);
        } catch (updateError) {
          console.error('❌ Update failed:', updateError);
          throw updateError;
        }
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

      case 'update-notifications':
        console.log('Updating notification settings for company:', company.id);
        console.log('Settings:', {
          reminder_settings: data.reminder_settings,
          notification_preferences: data.notification_preferences
        });
        
        await sql`
          UPDATE companies
          SET 
            reminder_settings = ${JSON.stringify(data.reminder_settings)}::jsonb,
            notification_preferences = ${JSON.stringify(data.notification_preferences)}::jsonb
          WHERE id = ${company.id}
        `;
        
        console.log('✅ Notification settings updated');
        break;

      case 'update-custom-questions':
        console.log('Updating custom questions for company:', company.id);
        console.log('Custom questions:', data.custom_questions);
        
        await sql`
          UPDATE companies
          SET custom_questions = ${JSON.stringify(data.custom_questions)}::jsonb
          WHERE id = ${company.id}
        `;
        
        console.log('✅ Custom questions updated');
        break;

      case 'update-cta':
        console.log('Updating CTA settings for company:', company.id);
        console.log('CTA data:', data);
        
        await sql`
          UPDATE companies
          SET 
            cta_heading = ${data.cta_heading || null},
            cta_button_text = ${data.cta_button_text || null},
            cta_success_message = ${data.cta_success_message || null}
          WHERE id = ${company.id}
        `;
        
        console.log('✅ CTA settings updated');
        break;

      default:
        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Fetch updated company data to return
    const updatedCompanies = await sql`
      SELECT * FROM companies WHERE id = ${company.id} LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      company: updatedCompanies[0],
    });

  } catch (error) {
    console.error('Error updating company settings:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}