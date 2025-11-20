import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json({ 
        success: false, 
        error: 'Anthropic API key not configured' 
      }, { status: 500 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { imageUrls, category, description } = await request.json();
    
    console.log('Analyzing images with Claude:', imageUrls);
    console.log('Category:', category);
    console.log('Description:', description);
    
    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No images provided' 
      }, { status: 400 });
    }

    // Fetch images and convert to base64 with compression
    const imageContents = await Promise.all(
      imageUrls.slice(0, 4).map(async (url: string) => {
        try {
          const response = await fetch(url);
          const arrayBuffer = await response.arrayBuffer();
          let buffer = Buffer.from(arrayBuffer);
          
          // Always compress/resize images to ensure they're under 5MB
          console.log(`Processing image from: ${url} (${buffer.length} bytes)`);
          
          // Resize and compress to ensure < 5MB
          const compressedBuffer = await sharp(buffer)
            .resize(2000, 2000, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ 
              quality: 85,
              mozjpeg: true
            })
            .toBuffer();
          
          console.log(`Compressed to: ${compressedBuffer.length} bytes`);
          
          const base64 = compressedBuffer.toString('base64');
          
          return {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: 'image/jpeg',
              data: base64,
            },
          };
        } catch (error) {
          console.error('Failed to process image:', url, error);
          return null;
        }
      })
    );

    const validImages = imageContents.filter(img => img !== null);

    if (validImages.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to process images' 
      }, { status: 400 });
    }

    console.log('Calling Claude API...');

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert contractor providing a comprehensive analysis. Be thorough, specific, and realistic.

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

Be thorough, specific, and realistic. Help the contractor give an accurate quote and the homeowner understand what's involved.`
            },
            ...validImages
          ],
        },
      ],
    });

    console.log('Claude response received');

    const content = message.content[0];
    
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    let analysis;
    try {
      const cleanContent = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      analysis = {
        summary: content.text,
        whatYouSee: content.text,
        condition: "Unknown",
        urgency: "Normal",
        scope: { description: "Unable to determine" },
        materials: { required: [], specialty: [], alternatives: "N/A" },
        laborAndTime: { estimatedHours: "Unknown", workers: "Unknown", timeline: "Unknown", permits: "Unknown" },
        costBreakdown: { materials: "Unknown", labor: "Unknown", equipment: "N/A", permits: "N/A", totalLow: "Unknown", totalMid: "Unknown", totalHigh: "Unknown" },
        complexity: "Moderate",
        skillLevelRequired: "Licensed Contractor",
        safetyConsiderations: [],
        recommendations: { primaryApproach: "Consult a professional", alternatives: [], preventiveMeasures: [], redFlags: [] },
        observations: [],
        relatedSystems: [],
        codeCompliance: "N/A",
        seasonalTiming: "N/A"
      };
    }

    console.log('Analysis completed successfully');

    return NextResponse.json({ 
      success: true, 
      analysis 
    });

  } catch (error: any) {
    console.error('AI Analysis Error Details:', error);
    console.error('Error message:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Analysis failed' 
    }, { status: 500 });
  }
}
