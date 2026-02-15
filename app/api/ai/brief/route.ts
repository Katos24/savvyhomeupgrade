import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {

      // DEBUG
  console.log('API Key length:', process.env.ANTHROPIC_API_KEY?.length);
  console.log('API Key first 20 chars:', process.env.ANTHROPIC_API_KEY?.substring(0, 20));
  
  try {
    // Check API key
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

    const body = await request.json();
    
    console.log('Generating AI Brief for lead:', body.lead_id);

    const {
      customer_name,
      description,
      category,
      status,
      project_id,
      scheduled_date,
      scheduled_time,
      assigned_to,
      quote_total,
      payment_amount,
      tasks,
      internal_notes,
    } = body;

    // Build context string
    const contextLines = [];

    contextLines.push(`CUSTOMER: ${customer_name || 'Unknown'}`);
    contextLines.push(`CATEGORY: ${category || 'Not specified'}`);
    contextLines.push(`STATUS: ${status || 'New lead'}`);
    
    if (description) {
      contextLines.push(`\nCUSTOMER REQUEST:\n"${description}"`);
    }

    if (project_id) {
      contextLines.push(`\n--- PROJECT DETAILS ---`);
      
      if (scheduled_date) {
        const dateStr = new Date(scheduled_date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
        contextLines.push(`Scheduled: ${dateStr}${scheduled_time ? ` at ${scheduled_time}` : ''}`);
      }

      if (assigned_to) {
        contextLines.push(`Assigned to: ${assigned_to}`);
      }

      if (quote_total) {
        contextLines.push(`\nQuote: $${parseFloat(quote_total).toLocaleString()}`);
        
        if (payment_amount && parseFloat(payment_amount) > 0) {
          const paid = parseFloat(payment_amount);
          const total = parseFloat(quote_total);
          const remaining = total - paid;
          
          contextLines.push(`Paid: $${paid.toLocaleString()}`);
          
          if (remaining > 0) {
            contextLines.push(`⚠️ PAYMENT DUE: $${remaining.toLocaleString()}`);
          } else {
            contextLines.push(`✓ Paid in full`);
          }
        } else {
          contextLines.push(`⚠️ NO PAYMENT RECEIVED YET`);
        }
      }

      if (tasks && Array.isArray(tasks) && tasks.length > 0) {
        const completed = tasks.filter((t: any) => t.completed).length;
        const total = tasks.length;
        contextLines.push(`\nTasks: ${completed}/${total} completed`);
        
        const pending = tasks.filter((t: any) => !t.completed);
        if (pending.length > 0 && pending.length <= 5) {
          contextLines.push(`Pending tasks:`);
          pending.forEach((t: any) => {
            contextLines.push(`  - ${t.title || t.description || 'Unnamed task'}`);
          });
        }
      }

      if (internal_notes) {
        contextLines.push(`\nINTERNAL NOTES:\n${internal_notes}`);
      }
    } else {
      contextLines.push(`\n(This is a NEW LEAD - not yet converted to project)`);
    }

    const context = contextLines.join('\n');

    console.log('Context built, calling Claude...');

    // Create prompt
    const prompt = `You are a helpful assistant for a busy contractor.

Here's all the information about this lead/project:

${context}

Create a BRIEF, ACTIONABLE summary that the contractor can read in 30 seconds.

Focus on:
1. What's the current situation?
2. What does the customer need?
3. What should the contractor do NEXT?
4. Any critical details or warnings?

Keep it conversational and specific. Use bullet points for clarity.
Highlight important numbers (payment due, dates, etc).

Format as JSON:
{
  "summary": "One-paragraph overview of the situation",
  "next_steps": ["Action 1", "Action 2", "Action 3"],
  "critical_info": ["Important detail 1", "Important detail 2"],
  "urgency": "Emergency/High Priority/Normal/Low Priority"
}`;

    // Call Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    console.log('Claude response received');

    const content = message.content[0];
    
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Parse response
    let brief;
    try {
      const cleanContent = content.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      brief = JSON.parse(cleanContent);
      
      // Add metadata
      brief.customer_name = customer_name;
      brief.is_project = !!project_id;
      brief.status = status;
      
      if (scheduled_date) {
        brief.scheduled = {
          date: scheduled_date,
          time: scheduled_time
        };
      }

    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text);
      
      // Fallback: return raw text
      brief = {
        summary: content.text,
        next_steps: ["Review this lead"],
        critical_info: [],
        urgency: "Normal",
        raw_response: content.text
      };
    }

    console.log('AI Brief generated successfully');

    return NextResponse.json({ 
      success: true, 
      brief 
    });

  } catch (error: any) {
    console.error('AI Brief Error:', error);
    console.error('Error message:', error.message);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to generate brief' 
    }, { status: 500 });
  }
}