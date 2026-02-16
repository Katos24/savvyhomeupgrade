import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { description, category } = await request.json();

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json({ 
        success: false, 
        error: 'API key not configured' 
      }, { status: 500 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const prompt = `You are a professional contractor estimating a job quote.

Customer Category: ${category || 'General'}
Customer Description: "${description}"

Generate a detailed quote with line items. Be realistic with pricing for a typical contractor in the US (New York area).

Return ONLY a JSON array of line items in this exact format:
[
  {
    "description": "Labor - Installation",
    "quantity": 1,
    "unitPrice": 150
  },
  {
    "description": "Materials - Ceiling fan and mounting hardware",
    "quantity": 1,
    "unitPrice": 125
  }
]

Include:
- Labor (hourly or flat rate)
- Materials/parts
- Any permits or inspections if needed
- Removal/disposal if applicable

Keep it simple - 2-5 line items max. Use realistic market prices.
Return ONLY the JSON array, no explanation.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const content = message.content[0];
    
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse the JSON response
    let items;
    try {
      const cleanedContent = content.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      items = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Claude response:', content.text);
      throw new Error('Failed to parse AI response');
    }

    // Validate items
    if (!Array.isArray(items)) {
      throw new Error('AI response is not an array');
    }

    // Ensure all items have required fields
    const validatedItems = items.map((item: any) => ({
      description: item.description || 'Unnamed item',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
    }));

    return NextResponse.json({
      success: true,
      items: validatedItems,
    });

  } catch (error) {
    console.error('Generate quote error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate quote' 
      },
      { status: 500 }
    );
  }
}