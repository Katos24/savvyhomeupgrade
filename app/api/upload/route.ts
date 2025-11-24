import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const files = formData.getAll('files') as File[];

    const companySlug = formData.get('company_slug') as string;
    let companyId = null;
    
    if (companySlug) {
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
        company_id, status, ai_analysis
      ) VALUES (
        ${name}, ${email}, ${phone}, ${category}, ${description},
        ${companyId}, 'processing', ${JSON.stringify({ status: 'Analyzing...' })}
      )
      RETURNING id
    `;

    const leadId = lead.id;
    console.log('✅ Lead created with ID:', leadId);
    console.log('📸 Files received:', files.length);
    
    // Log file sizes
    files.forEach((file, i) => {
      console.log(`  File ${i+1}: ${file.name} - ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    });

    // Upload files
    const fileUrls = [];
    
    if (files.length > 0) {
      console.log(`📤 [Lead ${leadId}] Uploading files...`);
      
      for (const file of files) {
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${file.name}`;
        
        try {
          const blob = await put(uniqueFilename, file, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
          
          fileUrls.push({
            url: blob.url,
            name: file.name,
            type: file.type,
            size: file.size,
          });
          
          console.log(`  ✅ [Lead ${leadId}] Uploaded: ${file.name}`);
        } catch (uploadError) {
          console.error(`  ❌ [Lead ${leadId}] Upload failed:`, uploadError);
        }
      }

      // Save file URLs to database
      if (fileUrls.length > 0) {
        await sql`UPDATE leads SET file_urls = ${JSON.stringify(fileUrls)} WHERE id = ${leadId}`;
        console.log(`✅ [Lead ${leadId}] Saved ${fileUrls.length} file URLs to database`);
      }
    }

    // Run AI analysis (AWAIT IT - don't run in background)
    const images = fileUrls.filter(f => 
      f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );

    if (images.length > 0) {
      console.log(`🤖 [Lead ${leadId}] Running AI analysis...`);
      
      try {
        // Analyze first image only
        await analyzeWithClaude(leadId, [images[0]], category, description, images.length);
        console.log(`✅ [Lead ${leadId}] AI analysis complete`);
      } catch (aiError) {
        console.error(`❌ [Lead ${leadId}] AI analysis failed:`, aiError);
        await sql`
          UPDATE leads 
          SET status = 'new', ai_analysis = ${JSON.stringify({ 
            error: 'AI analysis failed',
            message: 'Manual review required' 
          })}
          WHERE id = ${leadId}
        `;
      }
    } else {
      console.log(`⚠️ [Lead ${leadId}] No images to analyze`);
      await sql`
        UPDATE leads 
        SET status = 'new', ai_analysis = ${JSON.stringify({ message: 'No images' })}
        WHERE id = ${leadId}
      `;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Lead received!',
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
  console.log(`🤖 [Lead ${leadId}] Starting Claude analysis`);
  
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log(`🔑 [Lead ${leadId}] API Key exists: ${!!process.env.ANTHROPIC_API_KEY}`);

    const imageContents = images.map(img => ({
      type: 'image' as const,
      source: { type: 'url' as const, url: img.url },
    }));

    const multiImageNote = totalImages > 1 
      ? `\n\nIMPORTANT: Customer uploaded ${totalImages} total images. This analysis is based on the first image only. Review all ${totalImages} images in dashboard before final quote.`
      : '';

    const prompt = `You are an expert contractor. Analyze this ${category} project.

Customer Description: ${description}${multiImageNote}

Provide analysis as JSON:
{
  "summary": "Brief 2-3 sentence summary",
  "condition": "Excellent/Good/Fair/Poor/Critical",
  "urgency": "Emergency/High Priority/Normal/Low Priority",
  "totalImages": ${totalImages},
  "estimatedCost": "$X - $Y",
  "timeline": "X days/weeks",
  "recommendations": "Key recommendations"
}`;

    console.log(`📡 [Lead ${leadId}] Calling Claude API...`);

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

    console.log(`📬 [Lead ${leadId}] Claude responded: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [Lead ${leadId}] Claude error:`, errorText);
      throw new Error(`Claude API failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.content[0].text;
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
      summary: analysisText.substring(0, 200),
      condition: 'Unknown',
      urgency: 'Normal'
    };

    await sql`
      UPDATE leads 
      SET ai_analysis = ${JSON.stringify(analysis)}, status = 'new'
      WHERE id = ${leadId}
    `;

    console.log(`✅ [Lead ${leadId}] Analysis saved`);

  } catch (error) {
    console.error(`❌ [Lead ${leadId}] Analysis error:`, error);
    throw error;
  }
}
