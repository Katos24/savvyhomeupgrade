import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    let name, email, phone, category, description, fileUrls, companySlug, companyId;
    
    if (contentType.includes('application/json')) {
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
      const formData = await request.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      phone = formData.get('phone') as string;
      category = formData.get('category') as string;
      description = formData.get('description') as string;
      companySlug = formData.get('company_slug') as string;
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
    
    // Count images
    const images = fileUrls.filter((f: any) => 
      f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    
    const [lead] = await sql`
      INSERT INTO leads (
        name, email, phone, category, description, 
        company_id, status, ai_analysis, file_urls
      ) VALUES (
        ${name}, ${email}, ${phone}, ${category}, ${description},
        ${companyId}, 'new',
        ${JSON.stringify({ 
          message: 'Lead submitted successfully. Awaiting contractor review.',
          images: images.length,
          category: category,
          description: description
        })},
        ${JSON.stringify(fileUrls)}
      )
      RETURNING id
    `;

    const leadId = lead.id;
    console.log(`✅ Lead created with ID: ${leadId} (${images.length} images)`);

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