import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

// ADD THIS - Increase body size limit
export const maxDuration = 60; // 60 seconds for processing
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

    // Get company_id from slug if exists
    const companySlug = formData.get('company_slug') as string;
    let companyId = null;
    
    if (companySlug) {
      const sql = neon(process.env.DATABASE_URL!);
      const companies = await sql`SELECT id FROM companies WHERE slug = ${companySlug}`;
      if (companies.length > 0) {
        companyId = companies[0].id;
      }
    }

    // STEP 1: Save lead to database IMMEDIATELY with "processing" status
    const sql = neon(process.env.DATABASE_URL!);
    const [lead] = await sql`
      INSERT INTO leads (
        name, email, phone, category, description, 
        company_id, status, ai_analysis
      ) VALUES (
        ${name}, ${email}, ${phone}, ${category}, ${description},
        ${companyId}, 'processing', ${JSON.stringify({ status: 'Processing photos and analyzing...' })}
      )
      RETURNING id
    `;

    const leadId = lead.id;

    console.log('✅ Lead created with ID:', leadId);
    console.log('📸 Files to process:', files.length);

    // STEP 2: Return SUCCESS immediately to user
    // STEP 3: Process files in background - DON'T AWAIT!
    processFilesInBackground(leadId, files, category, description).catch(err => {
      console.error('Background processing failed:', err);
    });

    return NextResponse.json({ 
      success: true,
      message: 'Lead received! We will review your photos and contact you soon.',
      leadId 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit. Please try again.' },
      { status: 500 }
    );
  }
}

// Background processing function
async function processFilesInBackground(leadId: number, files: File[], category: string, description: string) {
  console.log(`🔄 Starting background processing for lead ${leadId}`);
  
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    console.log(`📤 Uploading ${files.length} files to blob storage...`);
    
    // Upload files to Vercel Blob
    const fileUrls = [];
    for (const file of files) {
      console.log(`  Uploading ${file.name}...`);
      
      // Add timestamp to filename to make it unique
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${file.name}`;
      
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
      
      console.log(`  ✅ Uploaded: ${blob.url}`);
    }

    console.log(`✅ All files uploaded. Updating database...`);

    await sql`
      UPDATE leads 
      SET file_urls = ${JSON.stringify(fileUrls)}
      WHERE id = ${leadId}
    `;

    console.log(`✅ Database updated with file URLs`);

    const images = fileUrls.filter(f => 
      f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );

    console.log(`🤖 Found ${images.length} images for Claude analysis`);

    if (images.length > 0) {
      await analyzeWithClaude(leadId, images, category, description);
    } else {
      console.log(`⚠️ No images to analyze`);
      await sql`
        UPDATE leads 
        SET 
          status = 'new',
          ai_analysis = ${JSON.stringify({ 
            message: 'No images to analyze. Manual review required.' 
          })}
        WHERE id = ${leadId}
      `;
    }

    console.log(`✅ Background processing complete for lead ${leadId}`);

  } catch (error) {
    console.error('❌ Background processing error:', error);
    
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      UPDATE leads 
      SET 
        status = 'new',
        ai_analysis = ${JSON.stringify({ 
          error: 'Analysis failed. Manual review required.',
          details: String(error)
        })}
      WHERE id = ${leadId}
    `;
  }
}

async function analyzeWithClaude(leadId: number, images: any[], category: string, description: string) {
  console.log(`🤖 Starting Claude analysis for lead ${leadId}`);
  
  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    const [lead] = await sql`SELECT * FROM leads WHERE id = ${leadId}`;
    
    console.log(`📊 Analyzing ${images.length} images for ${lead.category} project`);

    const imageContents = images.map(img => ({
      type: 'image' as const,
      source: {
        type: 'url' as const,
        url: img.url,
      },
    }));

    const prompt = `You are an expert contractor providing a comprehensive analysis. Be thorough, specific, and realistic.

Project Category: ${category || 'General'}
Customer Description: ${description || 'Not provided'}

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

    console.log(`🤖 Calling Claude API...`);

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
        messages: [
          {
            role: 'user',
            content: [
              ...imageContents,
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Claude API error:', response.status, errorText);
      throw new Error(`Claude API failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Received response from Claude`);
    
    const analysisText = data.content[0].text;
    console.log('Claude response:', analysisText);
    
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { 
      error: 'Could not parse analysis',
      raw: analysisText 
    };

    console.log('Parsed analysis:', analysis);

    await sql`
      UPDATE leads 
      SET 
        ai_analysis = ${JSON.stringify(analysis)},
        status = 'new'
      WHERE id = ${leadId}
    `;

    console.log(`✅ Lead ${leadId} updated with AI analysis and marked as 'new'`);

  } catch (error) {
    console.error('❌ Claude analysis error:', error);
    
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      UPDATE leads 
      SET 
        status = 'new',
        ai_analysis = ${JSON.stringify({ 
          error: 'AI analysis failed. Manual review required.',
          details: String(error)
        })}
      WHERE id = ${leadId}
    `;
  }
}
