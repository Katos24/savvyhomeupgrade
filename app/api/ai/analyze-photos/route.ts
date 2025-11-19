import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

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

    // Initialize Anthropic INSIDE the function
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

    // Fetch images and convert to base64
    const imageContents = await Promise.all(
      imageUrls.slice(0, 4).map(async (url: string) => {
        try {
          const response = await fetch(url);
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          
          // Determine media type from URL
          let mediaType = 'image/jpeg';
          if (url.match(/\.png$/i)) mediaType = 'image/png';
          else if (url.match(/\.gif$/i)) mediaType = 'image/gif';
          else if (url.match(/\.webp$/i)) mediaType = 'image/webp';
          
          return {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: mediaType,
              data: base64,
            },
          };
        } catch (error) {
          console.error('Failed to fetch image:', url, error);
          return null;
        }
      })
    );

    // Filter out failed images
    const validImages = imageContents.filter(img => img !== null);

    if (validImages.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch images' 
      }, { status: 400 });
    }

    console.log('Calling Claude API...');

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert contractor analyzing project photos. 
              
Project Category: ${category || 'General'}
Customer Description: ${description || 'Not provided'}

Analyze these photos and provide:
1. **What you see**: Describe the space, materials, and current condition
2. **Scope of work**: Estimate size/scale (sq ft, number of items, etc.)
3. **Condition**: Rate as Excellent, Good, Fair, Poor, or Critical
4. **Urgency**: Emergency, High Priority, Normal, or Low Priority
5. **Key observations**: Any damage, issues, or important details
6. **Estimated complexity**: Simple, Moderate, or Complex

Format your response as JSON with these exact keys:
{
  "summary": "Brief 1-2 sentence overview",
  "whatYouSee": "Detailed description",
  "scope": "Size/scale estimate",
  "condition": "Excellent/Good/Fair/Poor/Critical",
  "urgency": "Emergency/High/Normal/Low",
  "observations": ["observation 1", "observation 2"],
  "complexity": "Simple/Moderate/Complex",
  "estimatedCostRange": "$X,XXX - $XX,XXX (or 'Unable to estimate')"
}

Be specific, professional, and helpful. Focus on details that help a contractor quote the job.`
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

    // Parse JSON from response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      analysis = {
        summary: content.text,
        whatYouSee: content.text,
        scope: "Unable to determine",
        condition: "Unknown",
        urgency: "Normal",
        observations: [],
        complexity: "Moderate",
        estimatedCostRange: "Unable to estimate"
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
