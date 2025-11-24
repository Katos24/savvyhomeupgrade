import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const maxDuration = 60;
export const runtime = 'nodejs';

export async function GET(request: Request) {
  // Verify this is coming from Vercel Cron (security)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🔄 Cron job started - checking for leads to process');

  try {
    const sql = neon(process.env.DATABASE_URL!);
    
    // Get all leads with status="processing"
    const leadsToProcess = await sql`
      SELECT id, category, description, file_urls, created_at
      FROM leads 
      WHERE status = 'processing'
      ORDER BY created_at ASC
      LIMIT 5
    `;

    console.log(`📋 Found ${leadsToProcess.length} leads to process`);

    if (leadsToProcess.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No leads to process',
        processed: 0 
      });
    }

    const results = [];

    for (const lead of leadsToProcess) {
      console.log(`🤖 Processing lead ${lead.id}...`);

      try {
        const fileUrls = typeof lead.file_urls === 'string' 
          ? JSON.parse(lead.file_urls) 
          : lead.file_urls;

        // Filter for images
        const images = fileUrls?.filter((f: any) => 
          f.type?.startsWith('image/') || f.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        ) || [];

        if (images.length > 0) {
          // Analyze first image
          await analyzeWithClaude(
            lead.id, 
            [images[0]], 
            lead.category, 
            lead.description,
            images.length
          );
          results.push({ leadId: lead.id, status: 'analyzed' });
        } else {
          // No images - mark as new
          await sql`
            UPDATE leads 
            SET status = 'new', ai_analysis = ${JSON.stringify({ 
              message: 'No images to analyze. Manual review required.' 
            })}
            WHERE id = ${lead.id}
          `;
          results.push({ leadId: lead.id, status: 'no_images' });
        }

        console.log(`✅ Processed lead ${lead.id}`);

      } catch (error) {
        console.error(`❌ Failed to process lead ${lead.id}:`, error);
        
        // Mark as failed but set to 'new' so contractor can still see it
        await sql`
          UPDATE leads 
          SET status = 'new', ai_analysis = ${JSON.stringify({ 
            error: 'AI analysis failed. Manual review required.',
            details: String(error)
          })}
          WHERE id = ${lead.id}
        `;
        
        results.push({ leadId: lead.id, status: 'error', error: String(error) });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results 
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
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
  
  console.log(`🤖 [Lead ${leadId}] Starting Claude analysis`);

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

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Claude error:`, errorText);
    throw new Error(`Claude API failed: ${response.status}`);
  }

  const data = await response.json();
  const analysisText = data.content[0].text;
  
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

  console.log(`✅ [Lead ${leadId}] Analysis saved`);
}
