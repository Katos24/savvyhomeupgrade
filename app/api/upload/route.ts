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
        ${JSON.stringify({ status: 'Analyzing photos...' })},
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
            error: 'AI analysis failed',
            message: 'Manual review required' 
          })}
          WHERE id = ${leadId}
        `;
      }
    } else {
      await sql`
        UPDATE leads 
        SET status = 'new', ai_analysis = ${JSON.stringify({ 
          message: 'No images to analyze. Manual review required.' 
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
    console.log(`🤖 [Lead ${leadId}] Starting Claude analysis`);
    console.log(`🔑 API Key exists: ${!!process.env.ANTHROPIC_API_KEY}`);

    const imageContents = images.map((img: any) => ({
      type: 'image' as const,
      source: { type: 'url' as const, url: img.url },
    }));

    const multiImageNote = totalImages > 1 
      ? `\n\nIMPORTANT: Customer uploaded ${totalImages} total images. This analysis is based on the first image only. Review all ${totalImages} images in the dashboard before providing a final quote.`
      : '';

    const prompt = `You are an expert contractor providing a comprehensive analysis. Be thorough, specific, and realistic.

Project Category: ${category || 'General'}
Customer Description: ${description || 'Not provided'}${multiImageNote}

Provide an IN-DEPTH analysis covering ALL these areas:

## 1. VISUAL ASSESSMENT
- What exactly do you see in the photos?
- Current condition of materials, surfaces, and systems
- Any visible damage, wear, or deterioration
- Age/condition indicators

## 2. SCOPE OF WORK
- Detailed breakdown of what needs to be done
- Estimated square footage or quantities
- Number of units/items affected
- Access challenges or special considerations

## 3. MATERIALS NEEDED
- List all materials required (be specific: brands, types, grades)
- Estimated quantities
- Any specialty items or hard-to-find materials
- Recommended vs. budget alternatives

## 4. LABOR & TIME
- Estimated work hours
- Number of workers needed
- Timeline (hours/days/weeks)
- Any permits or inspections required

## 5. COST BREAKDOWN
- Materials cost estimate
- Labor cost estimate  
- Equipment/tool rental if needed
- Permit costs (if applicable)
- Total project range (low/mid/high estimates)

## 6. PRIORITY & URGENCY
Use realistic assessment:
- **Emergency**: Immediate safety risk or active damage NOW
- **High Priority**: Will worsen significantly within days/weeks
- **Normal**: Should be addressed soon, standard repair timeline
- **Low Priority**: Cosmetic, preventive, or optional improvement

## 7. COMPLEXITY & RISK
- Technical difficulty (Simple/Moderate/Complex)
- Required skill level (DIY/Handyman/Licensed Pro/Specialist)
- Safety considerations
- Potential complications or unknowns

## 8. RECOMMENDATIONS
- Best approach to fix the issue
- Alternative solutions (if any)
- Preventive measures for the future
- Red flags the contractor should investigate further

## 9. ADDITIONAL OBSERVATIONS
- Related systems that may be affected
- Code compliance considerations
- Warranty implications
- Seasonal timing considerations

Format as JSON with this structure:
{
  "summary": "2-3 sentence executive summary",
  "whatYouSee": "Detailed visual description of current state",
  "condition": "Excellent/Good/Fair/Poor/Critical",
  "urgency": "Emergency/High Priority/Normal/Low Priority",
  "totalImages": ${totalImages},
  "scope": {
    "description": "Detailed scope breakdown",
    "squareFootage": "Estimated area (or N/A)",
    "quantity": "Number of units/items",
    "accessibilityNotes": "Any access challenges"
  },
  "materials": {
    "required": ["Material 1 (quantity)", "Material 2 (quantity)"],
    "specialty": ["Any specialty items"],
    "alternatives": "Budget-friendly alternatives if applicable"
  },
  "laborAndTime": {
    "estimatedHours": "X-Y hours",
    "workers": "Number needed",
    "timeline": "X days/weeks",
    "permits": "Required permits or None"
  },
  "costBreakdown": {
    "materials": "$X - $Y",
    "labor": "$X - $Y",
    "equipment": "$X - $Y or N/A",
    "permits": "$X or N/A",
    "totalLow": "$X",
    "totalMid": "$X",
    "totalHigh": "$X"
  },
  "complexity": "Simple/Moderate/Complex",
  "skillLevelRequired": "DIY/Handyman/Licensed Contractor/Specialist",
  "safetyConsiderations": ["Safety issue 1", "Safety issue 2"],
  "recommendations": {
    "primaryApproach": "Best way to fix this",
    "alternatives": ["Alternative option 1", "Alternative option 2"],
    "preventiveMeasures": ["Prevention tip 1", "Prevention tip 2"],
    "redFlags": ["Things contractor should investigate"]
  },
  "observations": ["Key observation 1", "Key observation 2", "Key observation 3"],
  "relatedSystems": ["Other systems that may be affected"],
  "codeCompliance": "Any code considerations or N/A",
  "seasonalTiming": "Best time to do this work or N/A"
}

Be thorough, specific, and realistic. Help the contractor give an accurate quote and the homeowner understand what's involved.`;

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
        max_tokens: 2048,
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
    console.log(`📝 [Lead ${leadId}] Claude response (first 200 chars):`, analysisText.substring(0, 200));
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
      error: 'Could not parse analysis',
      raw: analysisText.substring(0, 500)
    };

    await sql`
      UPDATE leads 
      SET ai_analysis = ${JSON.stringify(analysis)}, status = 'new'
      WHERE id = ${leadId}
    `;

    console.log(`✅ [Lead ${leadId}] Full detailed analysis saved`);

  } catch (error) {
    console.error(`❌ Analysis error:`, error);
    throw error;
  }
}
