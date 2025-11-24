import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Check if it's JSON (new direct upload) or FormData (old method)
    const contentType = request.headers.get('content-type') || '';
    
    let name, email, phone, category, description, fileUrls, companySlug, companyId;
    
    if (contentType.includes('application/json')) {
      // NEW: Direct upload - files already in blob, just receive URLs
      const body = await request.json();
      name = body.name;
      email = body.email;
      phone = body.phone;
      category = body.category;
      description = body.description;
      fileUrls = body.file_urls || [];
      companySlug = body.company_slug;
      companyId = body.company_id;
      
      console.log('📥 Received JSON upload with', fileUrls.length, 'pre-uploaded files');
    } else {
      // OLD: FormData upload (for backward compatibility)
      const formData = await request.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      phone = formData.get('phone') as string;
      category = formData.get('category') as string;
      description = formData.get('description') as string;
      companySlug = formData.get('company_slug') as string;
      
      // For old method, we'd upload files here but let's deprecate this
      fileUrls = [];
      console.log('⚠️ Received FormData upload (deprecated)');
    }

    // Get company_id from slug if exists
    if (companySlug && !companyId) {
      const sql = neon(process.env.DATABASE_URL!);
      const companies = await sql`SELECT id FROM companies WHERE slug = ${companySlug}`;
      if (companies.length > 0) {
        companyId = companies[0].id;
      }
    }

    const sql = neon(process.env.DATABASE_URL!);
    const [lead] = await sql`
      INSERT INTO leads (
        name, email, phone, category, description, 
        company_id, status, ai_analysis, file_urls
      ) VALUES (
        ${name}, ${email}, ${phone}, ${category}, ${description},
        ${companyId}, 'processing', 
        ${JSON.stringify({ status: 'Analyzing...' })},
        ${JSON.stringify(fileUrls)}
      )
      RETURNING id
    `;

    const leadId = lead.id;
    console.log('✅ Lead created with ID:', leadId);
    console.log('📸 Files attached:', fileUrls.length);

    // Run AI analysis
    const images = fileUrls.filter((f: any) => 
      f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );

    if (images.length > 0) {
      console.log(`🤖 [Lead ${leadId}] Running AI analysis on ${images.length} images...`);
      
      try {
        await analyzeWithClaude(leadId, [images[0]], category, description, images.length);
        console.log(`✅ [Lead ${leadId}] AI analysis complete`);
      } catch (aiError) {
        console.error(`❌ [Lead ${leadId}] AI failed:`, aiError);
        await sql`
          UPDATE leads 
          SET status = 'new', ai_analysis = ${JSON.stringify({ 
            error: 'AI analysis failed' 
          })}
          WHERE id = ${leadId}
        `;
      }
    } else {
      await sql`
        UPDATE leads 
        SET status = 'new', ai_analysis = ${JSON.stringify({ 
          message: 'No images to analyze' 
        })}
        WHERE id = ${leadId}
      `;
    }

    return NextResponse.json({ 
      success: true,
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

async function analyzeWithClaude(
  leadId: number, 
  images: any[], 
  category: string, 
  description: string,
  totalImages: number = 1
) {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log(`🤖 [Lead ${leadId}] Analyzing with Claude...`);
    console.log(`🔑 API Key exists: ${!!process.env.ANTHROPIC_API_KEY}`);

    const imageContents = images.map((img: any) => ({
      type: 'image' as const,
      source: { type: 'url' as const, url: img.url },
    }));

    const multiImageNote = totalImages > 1 
      ? `\n\nNote: Customer uploaded ${totalImages} images total. This analysis is based on the first image. Review all images in dashboard.`
      : '';

    const prompt = `Analyze this ${category} project: ${description}${multiImageNote}

Provide JSON response:
{
  "summary": "Brief summary",
  "condition": "Good/Fair/Poor/Critical",
  "urgency": "Emergency/High Priority/Normal/Low Priority",
  "estimatedCost": "$X-$Y",
  "timeline": "X days",
  "recommendations": "Key recommendations"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [...imageContents, { type: 'text', text: prompt }],
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
      summary: analysisText.substring(0, 200)
    };

    await sql`
      UPDATE leads 
      SET ai_analysis = ${JSON.stringify(analysis)}, status = 'new'
      WHERE id = ${leadId}
    `;

    console.log(`✅ [Lead ${leadId}] Analysis saved`);

  } catch (error) {
    console.error(`❌ Analysis error:`, error);
    throw error;
  }
}
