import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let name, email, phone, category, description, fileUrls, companySlug, companyId;
    
    if (contentType.includes('application/json')) {
      // Direct upload - files already in blob
      const body = await request.json();
      name = body.name;
      email = body.email;
      phone = body.phone;
      category = body.category;
      description = body.description;
      fileUrls = body.file_urls || [];
      companySlug = body.company_slug;
      companyId = body.company_id;
      
      console.log('📥 JSON upload with', fileUrls.length, 'files');
    } else {
      // Old FormData method
      const formData = await request.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      phone = formData.get('phone') as string;
      category = formData.get('category') as string;
      description = formData.get('description') as string;
      companySlug = formData.get('company_slug') as string;
      fileUrls = [];
    }

    // Get company_id from slug
    if (companySlug && !companyId) {
      const sql = neon(process.env.DATABASE_URL!);
      const companies = await sql`SELECT id FROM companies WHERE slug = ${companySlug}`;
      if (companies.length > 0) {
        companyId = companies[0].id;
      }
    }

    // Save lead with status="processing" - cron will handle AI analysis
    const sql = neon(process.env.DATABASE_URL!);
    const [lead] = await sql`
      INSERT INTO leads (
        name, email, phone, category, description, 
        company_id, status, ai_analysis, file_urls
      ) VALUES (
        ${name}, ${email}, ${phone}, ${category}, ${description},
        ${companyId}, 'processing', 
        ${JSON.stringify({ status: 'Processing photos and analyzing...' })},
        ${JSON.stringify(fileUrls)}
      )
      RETURNING id
    `;

    console.log('✅ Lead created with ID:', lead.id, '- Cron will process AI analysis');

    // Return success immediately - cron handles the rest!
    return NextResponse.json({ 
      success: true,
      message: 'Lead received! We will review your photos and contact you soon.',
      leadId: lead.id,
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
