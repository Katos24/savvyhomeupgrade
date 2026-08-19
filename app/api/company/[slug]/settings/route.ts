import { getJwtSecret } from '@/lib/auth';
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

const decoded = jwt.verify(token, getJwtSecret()) as any;

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
  company: {
    ...company,
    website: company.website
  },
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

    const decoded = jwt.verify(token, getJwtSecret()) as any;
    
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


    switch (action) {
// ── Company identity (name, email, phone, website only) ──
case 'update-general': {
  const result = await sql`
    UPDATE companies
    SET
      name = ${data.name || null},
      email = ${data.email || null},
      phone = ${data.phone || null},
      website = ${data.website || null},
      business_type = COALESCE(${data.business_type || null}, business_type)
    WHERE id = ${company.id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, company: result[0] });
}

// ── Branding (logo, colors) ──
case 'update-branding': {
  const result = await sql`
    UPDATE companies
    SET
      logo_url = COALESCE(${data.logo_url || null}, logo_url),
      email_brand_color_1 = COALESCE(${data.email_brand_color_1 || null}, email_brand_color_1),
      email_brand_color_2 = COALESCE(${data.email_brand_color_2 || null}, email_brand_color_2)
    WHERE id = ${company.id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, company: result[0] });
}

// ── Google Reviews ──
case 'update-name': {
  const result = await sql`
    UPDATE companies
    SET name = ${data.name || null}
    WHERE id = ${company.id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, company: result[0] });
}
 

// ── Google Reviews ──
case 'update-google-reviews': {
  const result = await sql`
    UPDATE companies
    SET
      google_review_url = ${data.google_review_url || null},
      google_review_enabled = ${data.google_review_enabled ?? false}
    WHERE id = ${company.id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, company: result[0] });
}

// ── Manual payment link ──
case 'update-payment-link': {
  const result = await sql`
    UPDATE companies
    SET
      payment_link_type = ${data.payment_link_type || null},
      payment_link_url = ${data.payment_link_url || null}
    WHERE id = ${company.id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, company: result[0] });
}

// ── BCC preference ──
case 'update-bcc': {
  const result = await sql`
    UPDATE companies
    SET
      bcc_sender_on_email = ${data.bcc_sender_on_email ?? false}
    WHERE id = ${company.id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, company: result[0] });
}

// ── Default tax rate ──
case 'update-tax-rate': {
  const rate = parseFloat(data.default_tax_rate);
  if (isNaN(rate) || rate < 0 || rate > 100) {
    return NextResponse.json({ success: false, error: 'Tax rate must be between 0 and 100.' }, { status: 400 });
  }
  const result = await sql`
    UPDATE companies
    SET default_tax_rate = ${rate}
    WHERE id = ${company.id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, company: result[0] });
}

// ── Default deposit terms ──
case 'update-deposit-default': {
  const type = data.default_deposit_type ?? null;
  const rawValue = data.default_deposit_value;
  // Both null together, or both set — the CHECK constraint pairs them.
  const clearing = !type || rawValue === null || rawValue === undefined;

  if (!clearing) {
    if (!['percent', 'fixed'].includes(type)) {
      return NextResponse.json({ success: false, error: 'Deposit type must be percent or fixed.' }, { status: 400 });
    }
    const val = parseFloat(rawValue);
    if (isNaN(val) || val <= 0) {
      return NextResponse.json({ success: false, error: 'Deposit must be greater than zero.' }, { status: 400 });
    }
    if (type === 'percent' && val > 100) {
      return NextResponse.json({ success: false, error: 'A percent deposit can\u2019t exceed 100.' }, { status: 400 });
    }
    const result = await sql`
      UPDATE companies
      SET default_deposit_type = ${type}, default_deposit_value = ${val}
      WHERE id = ${company.id}
      RETURNING *
    `;
    return NextResponse.json({ success: true, company: result[0] });
  }

  const result = await sql`
    UPDATE companies
    SET default_deposit_type = NULL, default_deposit_value = NULL
    WHERE id = ${company.id}
    RETURNING *
  `;
  return NextResponse.json({ success: true, company: result[0] });
}

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

        case 'update-capacity': {
        const val = parseInt(data.max_concurrent_bookings, 10);
        if (isNaN(val) || val < 1) {
          return NextResponse.json({ success: false, error: 'Capacity must be at least 1.' }, { status: 400 });
        }
        await sql`
          UPDATE companies
          SET max_concurrent_bookings = ${val}
          WHERE id = ${company.id}
        `;
        break;
      }



      case 'update-categories':
        await sql`
          UPDATE companies
          SET form_categories = ${JSON.stringify(data.form_categories)}::jsonb
          WHERE id = ${company.id}
        `;
        break;

      case 'update-notifications':
        await sql`
          UPDATE companies
          SET 
            reminder_settings = ${JSON.stringify(data.reminder_settings)}::jsonb,
            notification_preferences = ${JSON.stringify(data.notification_preferences)}::jsonb,
            daily_digest_enabled = ${data.notification_preferences?.daily_digest?.enabled ?? false},
            daily_digest_time = ${data.notification_preferences?.daily_digest?.time ?? '07:00'}
          WHERE id = ${company.id}
        `;
        break;

      case 'update-custom-questions':
        
        await sql`
          UPDATE companies
          SET custom_questions = ${JSON.stringify(data.custom_questions)}::jsonb
          WHERE id = ${company.id}
        `;
        
        break;

      case 'update-cta':
        
        await sql`
          UPDATE companies
          SET 
            cta_heading = ${data.cta_heading || null},
            cta_button_text = ${data.cta_button_text || null},
            cta_success_message = ${data.cta_success_message || null}
          WHERE id = ${company.id}
        `;
        
        break;

      case 'update-form': {

        const ctaHeading = data.cta?.cta_heading ?? null;
        const ctaSuccessMessage = data.cta?.cta_success_message ?? null;
        const customQuestions = data.questions ?? [];
        const fieldConfig = data.field_config ?? null;
        const addressEnabled = fieldConfig?.address?.enabled ?? null;
        const addressRequired = fieldConfig?.address?.required ?? false;

        await sql`
          UPDATE companies
          SET
            cta_heading = ${ctaHeading},
            cta_success_message = ${ctaSuccessMessage},
            custom_questions = ${JSON.stringify(customQuestions)}::jsonb,
            form_field_config = ${fieldConfig ? JSON.stringify(fieldConfig) : null}::jsonb,
            address_enabled = ${addressEnabled},
            address_required = ${addressRequired}
          WHERE id = ${company.id}
        `;

        break;
      }

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