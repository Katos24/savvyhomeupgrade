import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { sendNewLeadAlertEmail, sendLeadConfirmationEmail } from '@/lib/email';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let name, email, phone, address_line_1, address_line_2, city, zip_code, category, description, fileUrls, companySlug, companyId, lead_source, preferred_date, preferred_time;
    let customAnswers: Record<string, any> = {};
    let notify_customer = true;
let notify_owner = true;
let created_by = 'customer';

    // Helper function to format category
    const formatCategory = (cat: string) => {
      return cat
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    if (contentType.includes('application/json')) {
      const body = await request.json();
      name = body.name;
      email = body.email;
      phone = body.phone;
      address_line_1 = body.address_line_1 || null;
      address_line_2 = body.address_line_2 || null;
      city = body.city || null;
      zip_code = body.zip_code || null;
      category = body.category;
      description = body.description;
      fileUrls = body.file_urls || [];
      companySlug = body.company_slug;
      companyId = body.company_id;
      lead_source = body.lead_source || null;
      customAnswers = body.custom_answers || {};
      preferred_date = body.preferred_date || null;
      preferred_time = body.preferred_time || null;
      notify_customer = body.notify_customer ?? true;
notify_owner = body.notify_owner ?? true;
created_by = body.created_by || 'customer';

      console.log('📥 JSON upload with', fileUrls.length, 'files');
      if (address_line_1) {
        console.log('📍 Address:', address_line_1, address_line_2 ? `(${address_line_2})` : '', city ? `in ${city}` : '', zip_code ? `${zip_code}` : '');
      }
      if (lead_source) {
        console.log('🎯 Lead source:', lead_source);
      }
      if (Object.keys(customAnswers).length > 0) {
        console.log('📝 Custom answers:', customAnswers);
      }
    } else {
      const formData = await request.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      phone = formData.get('phone') as string;
      address_line_1 = formData.get('address_line_1') as string || null;
      address_line_2 = formData.get('address_line_2') as string || null;
      city = formData.get('city') as string || null;
      zip_code = formData.get('zip_code') as string || null;
      category = formData.get('category') as string;
      description = formData.get('description') as string;
      companySlug = formData.get('company_slug') as string;
      lead_source = formData.get('lead_source') as string || null;
      fileUrls = [];
    }

    if (companySlug && !companyId) {
      const sql = neon(process.env.DATABASE_URL!);
      const companies = await sql`SELECT id FROM companies WHERE slug = ${companySlug}`;
      if (companies.length > 0) {
        companyId = companies[0].id;
      }
    }

    const sql = neon(process.env.DATABASE_URL!);
    console.log(`🔄 Creating lead for ${name}...`);

    const [lead] = await sql`
      INSERT INTO leads (
        name, email, phone, address_line_1, address_line_2, city, zip_code, category, description,
        company_id, status, file_urls, lead_source, custom_answers, preferred_date, preferred_time, created_by
      ) VALUES (
        ${name}, ${email}, ${phone}, ${address_line_1}, ${address_line_2}, ${city}, ${zip_code}, ${category}, ${description},
        ${companyId}, 'new', ${JSON.stringify(fileUrls)}, ${lead_source}, ${JSON.stringify(customAnswers)}, ${preferred_date}, ${preferred_time}, ${created_by}
      )
      RETURNING id
    `;

    const leadId = lead.id;
    console.log(`✅ Lead created with ID: ${leadId}`);

    // Send email notification to contractor
    if (companySlug) {
      const company = await sql`SELECT email, name FROM companies WHERE slug = ${companySlug}`;
      if (company.length > 0 && company[0].email) {
        const contractorEmail = company[0].email;
        const companyName = company[0].name;
        const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${companySlug}/dashboard`;

        if (notify_owner) sendNewLeadAlertEmail({
          contractorEmail,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          category: formatCategory(category),
          description: description || 'No description provided',
          dashboardUrl,
          address: address_line_1 || undefined,
          city: city || undefined,
          photosCount: fileUrls.length || 0,
        }).catch(err => {
          console.error('Failed to send contractor email alert:', err);
        });
        console.log(`📧 Contractor email alert queued for ${contractorEmail}`);

        if (notify_customer && email) sendLeadConfirmationEmail({
          customerEmail: email,
          customerName: name,
          category: formatCategory(category),
          companyName,
        }).catch(err => {
          console.error('Failed to send customer confirmation:', err);
        });
        console.log(`📧 Customer confirmation queued for ${email}`);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Lead submitted successfully!',
      leadId,
      filesUploaded: fileUrls.length
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}