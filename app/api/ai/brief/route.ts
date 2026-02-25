import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, error: 'Anthropic API key not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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
      payment_status,
      tasks,
      internal_notes,
      company_name,
      repeat_customer,
      past_jobs,
      chat_mode,
      chat_history,
      all_leads_summary,
      plan_tier,
    } = body;

    // ── Plan gating ────────────────────────────────────────────
    if (plan_tier === 'basic') {
      return NextResponse.json({
        success: false,
        error: 'AI features are available on Pro and Business plans',
        upgrade_required: true,
      }, { status: 403 });
    }

    // ── Retry helper — try Sonnet once, immediately fall back to Haiku ──
    async function callClaude(params: Omit<Anthropic.MessageCreateParamsNonStreaming, 'model'>): Promise<Anthropic.Message> {
      // Try Sonnet once — no retries, fail fast
      try {
        console.log('Trying claude-sonnet-4-20250514...');
        return await anthropic.messages.create({ ...params, model: 'claude-sonnet-4-20250514' });
      } catch (err: any) {
        const isOverloaded = err?.status === 529 || err?.message?.includes('529') || err?.message?.includes('overloaded');
        if (!isOverloaded) throw err;
        console.log('Sonnet overloaded, falling back to Haiku immediately...');
      }

      // Haiku fallback — 2 attempts with short delay
      for (let attempt = 0; attempt <= 1; attempt++) {
        try {
          console.log(`Trying claude-haiku-4-5-20251001, attempt: ${attempt + 1}`);
          return await anthropic.messages.create({ ...params, model: 'claude-haiku-4-5-20251001' });
        } catch (err: any) {
          const isOverloaded = err?.status === 529 || err?.message?.includes('529') || err?.message?.includes('overloaded');
          if (!isOverloaded) throw err;
          if (attempt === 0) {
            console.log('Haiku overloaded, retrying in 800ms...');
            await new Promise(r => setTimeout(r, 800));
          }
        }
      }

      throw new Error('All models overloaded. Please try again shortly.');
    }

    // ── CHAT MODE ──────────────────────────────────────────────
    if (chat_mode) {
      const ctx = all_leads_summary;
      const leadsContext = ctx
        ? `BUSINESS SNAPSHOT for ${company_name}:
- Total leads: ${ctx.summary?.total_leads || 0}
- New leads awaiting review: ${ctx.summary?.new_leads || 0}
- Unpaid jobs: ${ctx.summary?.unpaid_jobs || 0} ($${(ctx.summary?.unpaid_total || 0).toLocaleString()} outstanding)
- Unassigned jobs: ${ctx.summary?.unassigned_jobs || 0}
- Scheduled today: ${ctx.summary?.today_scheduled || 0}
- Scheduled this week: ${ctx.summary?.this_week_scheduled || 0}

${ctx.today_schedule?.length ? `TODAY'S SCHEDULE:\n${ctx.today_schedule.map((j: any) => `- ${j.name} | ${j.category} | ${j.time || 'no time'} | assigned: ${j.assigned_to || 'nobody'}`).join('\n')}` : ''}

${ctx.this_week_schedule?.length ? `THIS WEEK:\n${ctx.this_week_schedule.map((j: any) => `- ${j.name} | ${j.category} | ${j.date} | assigned: ${j.assigned_to || 'nobody'}`).join('\n')}` : ''}

${ctx.unpaid?.length ? `UNPAID JOBS:\n${ctx.unpaid.map((j: any) => `- ${j.name} | ${j.category} | $${parseFloat(j.quote_total).toLocaleString()} | status: ${j.status}`).join('\n')}` : ''}

${ctx.unassigned?.length ? `UNASSIGNED JOBS:\n${ctx.unassigned.map((j: any) => `- ${j.name} | ${j.category} | ${j.status}`).join('\n')}` : ''}

${ctx.recent_leads?.length ? `ALL RECENT LEADS (60 days):\n${ctx.recent_leads.map((l: any) => `- ${l.name} | ${l.category || 'unknown'} | ${l.status} | quote: ${l.quote_total ? '$' + parseFloat(l.quote_total).toLocaleString() : 'none'} | payment: ${l.payment_status || 'none'} | scheduled: ${l.scheduled_date || 'not scheduled'} | assigned: ${l.assigned_to || 'unassigned'}`).join('\n')}` : ''}`
        : 'No lead data available.';

      const systemPrompt = `You are a smart business assistant for ${company_name || 'a contractor'}. You have real-time access to their job data. Answer questions specifically using the actual data provided — never be vague when you have the numbers. Be conversational, direct, and actionable. Use bullet points for lists. Bold important numbers or names with **text**. Keep responses under 150 words unless detail is truly needed.

${leadsContext}`;

      const messages = (chat_history || []).map((m: any) => ({
        role: m.role,
        content: m.content,
      }));

      const chatResponse = await callClaude({
        max_tokens: 512,
        system: systemPrompt,
        messages,
      });

      const replyContent = chatResponse.content[0];
      if (replyContent.type !== 'text') throw new Error('Unexpected response type');

      return NextResponse.json({ success: true, reply: replyContent.text });
    }

    // ── Build context ──────────────────────────────────────────
    const contextLines: string[] = [];

    contextLines.push(`COMPANY: ${company_name || 'Contractor'}`);
    contextLines.push(`CUSTOMER: ${customer_name || 'Unknown'}`);
    contextLines.push(`SERVICE CATEGORY: ${category || 'Not specified'}`);
    contextLines.push(`CURRENT STATUS: ${status || 'New lead'}`);

    if (repeat_customer && past_jobs?.length > 0) {
      const lifetimeValue = past_jobs
        .filter((j: any) => j.quote_total)
        .reduce((sum: number, j: any) => sum + parseFloat(j.quote_total), 0);

      contextLines.push(`\n⭐ REPEAT CUSTOMER — ${past_jobs.length} previous job(s), $${lifetimeValue.toLocaleString()} lifetime value`);
      contextLines.push(`Past jobs:`);
      past_jobs.forEach((j: any) => {
        const monthsAgo = Math.floor((Date.now() - new Date(j.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30));
        const timeStr = monthsAgo < 1 ? 'this month' : monthsAgo === 1 ? '1 month ago' : `${monthsAgo} months ago`;
        contextLines.push(`  - ${j.category || 'Unknown'} | ${j.status} | ${j.quote_total ? '$' + parseFloat(j.quote_total).toLocaleString() : 'no quote'} | ${timeStr}${j.description ? ` | "${j.description}"` : ''}`);
      });
    }

    if (description) {
      contextLines.push(`\nCUSTOMER'S REQUEST:\n"${description}"`);
    }

    if (project_id) {
      contextLines.push(`\n── PROJECT DETAILS ──`);

      if (scheduled_date) {
        const schedDate = new Date(scheduled_date);
        const now = new Date();
        const daysUntil = Math.ceil((schedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const dateStr = schedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        let urgencyNote = '';
        if (daysUntil < 0) urgencyNote = ' ⚠️ PAST DUE';
        else if (daysUntil === 0) urgencyNote = ' 🚨 TODAY';
        else if (daysUntil === 1) urgencyNote = ' ⚠️ TOMORROW';
        else if (daysUntil <= 3) urgencyNote = ` ⚠️ IN ${daysUntil} DAYS`;
        contextLines.push(`Scheduled: ${dateStr}${scheduled_time ? ` at ${scheduled_time}` : ''}${urgencyNote}`);
      } else {
        contextLines.push(`Scheduled: Not yet scheduled`);
      }

      if (assigned_to) {
        contextLines.push(`Assigned to: ${assigned_to}`);
      } else {
        contextLines.push(`Assigned to: ⚠️ NOBODY — unassigned`);
      }

      if (quote_total) {
        const total = parseFloat(quote_total);
        const paid = payment_amount ? parseFloat(payment_amount) : 0;
        const remaining = total - paid;
        contextLines.push(`\nQuote total: $${total.toLocaleString()}`);

        if (payment_status === 'paid') {
          contextLines.push(`Payment: ✓ PAID IN FULL`);
        } else if (payment_status === 'partial') {
          contextLines.push(`Payment: Partial — $${paid.toLocaleString()} paid, $${remaining.toLocaleString()} still owed ⚠️`);
        } else {
          contextLines.push(`Payment: ⚠️ NOTHING RECEIVED — $${total.toLocaleString()} outstanding`);
        }
      }

      if (tasks && Array.isArray(tasks) && tasks.length > 0) {
        const completed = tasks.filter((t: any) => t.completed).length;
        contextLines.push(`\nTasks: ${completed}/${tasks.length} complete`);
        const pending = tasks.filter((t: any) => !t.completed);
        if (pending.length > 0 && pending.length <= 5) {
          pending.forEach((t: any) => {
            contextLines.push(`  ☐ ${t.label || t.title || 'Unnamed task'}`);
          });
        }
      }

      if (internal_notes) {
        contextLines.push(`\nINTERNAL NOTES: ${internal_notes}`);
      }
    } else {
      contextLines.push(`\n(New lead — not yet converted to a project)`);
    }

    const context = contextLines.join('\n');

    const prompt = `You are an expert assistant for a home services contractor business.

Here is everything you know about this lead/project:

${context}

Write a fast, actionable brief that a busy contractor can scan in under 30 seconds.

Rules:
- Be specific to the service category (roofing, HVAC, plumbing, etc) — use industry-appropriate language
- If it's a repeat customer, acknowledge the relationship and factor in their history
- Calculate urgency from the scheduling and payment data — don't be vague
- The headline should be a single punchy sentence capturing the situation
- Next steps should be concrete actions, not generic advice
- Flag anything that needs immediate attention in critical_info

Respond ONLY with this JSON (no markdown, no extra text):
{
  "headline": "One punchy sentence — the situation in a nutshell",
  "summary": "2-3 sentence paragraph with the full context",
  "next_steps": ["Specific action 1", "Specific action 2", "Specific action 3"],
  "critical_info": ["Urgent flag 1 if any", "Urgent flag 2 if any"],
  "urgency": "Emergency|High Priority|Normal|Low Priority",
  "customer_score": "VIP|Good|New|Risky"
}

customer_score rules:
- VIP = repeat customer, always paid, multiple jobs
- Good = paid on time, no issues
- New = first job, no history
- Risky = payment issues or cancelled jobs in history`;

    const message = await callClaude({
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    let brief;
    try {
      const clean = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      brief = JSON.parse(clean);
      brief.customer_name = customer_name;
      brief.is_project = !!project_id;
      brief.status = status;
      if (scheduled_date) brief.scheduled = { date: scheduled_date, time: scheduled_time };
    } catch {
      brief = {
        headline: `${customer_name} — ${category || 'New lead'}`,
        summary: content.text,
        next_steps: ['Review this lead'],
        critical_info: [],
        urgency: 'Normal',
        customer_score: 'New',
      };
    }

    return NextResponse.json({ success: true, brief });

  } catch (error: any) {
    console.error('AI Brief Error:', error.message);

    const isOverloaded =
      error?.status === 529 ||
      error?.message?.includes('529') ||
      error?.message?.includes('overloaded') ||
      error?.message?.includes('All models overloaded');

    if (isOverloaded) {
      return NextResponse.json({
        success: false,
        error: 'AI is busy right now — please try again in a moment.',
        overloaded: true,
      }, { status: 503 });
    }

    return NextResponse.json({ success: false, error: error.message || 'Failed to generate brief' }, { status: 500 });
  }
}