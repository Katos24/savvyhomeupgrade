import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { neon } from '@neondatabase/serverless';
import { can } from '@/lib/permissions';
import type { PlanTier } from '@/lib/permissions';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, error: 'Anthropic API key not configured' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { jwt.verify(token, process.env.JWT_SECRET!); }
    catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const body = await request.json();

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
  company_slug,
  repeat_customer,
  past_jobs,
  chat_mode,
  chat_history,
  all_leads_summary,
  photos,
} = body;

// ── Server-side plan check — never trust client-sent plan_tier ──
if (!company_slug) {
  return NextResponse.json({ success: false, error: 'Missing company_slug' }, { status: 400 });
}
const sql = neon(process.env.DATABASE_URL!);
const rows = await sql`SELECT plan_tier FROM companies WHERE slug = ${company_slug} LIMIT 1`;
const dbPlanTier = (rows[0]?.plan_tier ?? 'basic') as PlanTier;
if (!can(dbPlanTier, 'ai_brief')) {
  return NextResponse.json({
    success: false,
    error: 'AI features are available on the Pro plan',
    upgrade_required: true,
  }, { status: 403 });
}

    // ── NEW: FETCH TEAM FOR ACTIONABLE UPDATES ──
    let teamListString = "No team members found.";
    if (company_slug) {
      try {
const teamRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/team/members?slug=${company_slug}`, {
          signal: AbortSignal.timeout(5000),
        });
                const teamData = await teamRes.json();
        if (teamData.success && Array.isArray(teamData.members)) {
          teamListString = teamData.members
            .map((m: any) => `ID: ${m.id} | Name: ${m.name} | Role: ${m.role || 'Tech'}`)
            .join('\n');
        }
      } catch (err) {
        console.error("Failed to fetch team for AI context:", err);
      }
    }

   const CLAUDE_TIMEOUT_MS = 25000;

    async function callWithTimeout(fn: () => Promise<Anthropic.Message>): Promise<Anthropic.Message> {
      return Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI request timed out. Please try again.')), CLAUDE_TIMEOUT_MS)
        ),
      ]);
    }

    async function callClaude(params: Omit<Anthropic.MessageCreateParamsNonStreaming, 'model'>): Promise<Anthropic.Message> {
      try {
        return await callWithTimeout(() =>
          anthropic.messages.create({ ...params, model: 'claude-sonnet-4-20250514' })
        );
      } catch (err: any) {
        const isRetryable = err?.status === 529 || err?.status === 429 || err?.message?.includes('529') || err?.message?.includes('overloaded') || err?.message?.includes('rate_limit');
        if (!isRetryable) throw err;
      }

      for (let attempt = 0; attempt <= 1; attempt++) {
        try {
          return await callWithTimeout(() =>
            anthropic.messages.create({ ...params, model: 'claude-haiku-4-5-20251001' })
          );
        } catch (err: any) {
          const isRetryable = err?.status === 529 || err?.status === 429 || err?.message?.includes('529') || err?.message?.includes('overloaded') || err?.message?.includes('rate_limit');
          if (!isRetryable) throw err;
          if (attempt === 0) await new Promise(r => setTimeout(r, 2000));
        }
      }
      throw new Error('All models overloaded or rate limited. Please try again shortly.');
    }

    // ── CHAT MODE ──
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

${ctx.today_schedule?.length ? `TODAY'S SCHEDULE:\n${ctx.today_schedule.map((j: any) => `- ${j.name} | ${j.category} | ${j.time || 'no time'} | assigned: ${j.assigned_to || 'nobody'}${j.address_line_1 ? ` | ${j.address_line_1}${j.city ? ', ' + j.city : ''}` : ''}`).join('\n')}` : ''}

${ctx.this_week_schedule?.length ? `THIS WEEK:\n${ctx.this_week_schedule.map((j: any) => `- ${j.name} | ${j.category} | ${j.date} | assigned: ${j.assigned_to || 'nobody'}${j.address_line_1 ? ` | ${j.address_line_1}${j.city ? ', ' + j.city : ''}` : ''}`).join('\n')}` : ''}

${ctx.unpaid?.length ? `UNPAID JOBS:\n${ctx.unpaid.map((j: any) => `- ${j.name} | ${j.category} | $${parseFloat(j.quote_total).toLocaleString()} | status: ${j.status}`).join('\n')}` : ''}

${ctx.unassigned?.length ? `UNASSIGNED JOBS:\n${ctx.unassigned.map((j: any) => `- ${j.name} | ${j.category} | ${j.status}`).join('\n')}` : ''}

${ctx.recent_leads?.length ? `ALL RECENT LEADS (60 days):\n${ctx.recent_leads.map((l: any) => {
  const parts = [
    `- ${l.name}`,
    l.category || 'unknown',
    l.status,
    `quote: ${l.quote_total ? '$' + parseFloat(l.quote_total).toLocaleString() : 'none'}`,
    `payment: ${l.payment_status || 'none'}`,
    `scheduled: ${l.scheduled_date || 'not scheduled'}`,
    `assigned: ${l.assigned_to || 'unassigned'}`,
  ];
  if (l.address_line_1 || l.city || l.zip_code) {
    const addr = [l.address_line_1, l.city, l.zip_code].filter(Boolean).join(', ');
    parts.push(`address: ${addr}`);
  }
  if (l.notes) parts.push(`notes: "${l.notes}"`);
  if (l.description) parts.push(`request: "${l.description.slice(0, 120)}"`);
  return parts.join(' | ');
}).join('\n')}` : ''}`
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

    // ── Build text context ──
    const contextLines: string[] = [];

    contextLines.push(`COMPANY: ${company_name || 'Contractor'}`);
    contextLines.push(`CUSTOMER: ${customer_name || 'Unknown'}`);
    contextLines.push(`SERVICE CATEGORY: ${category || 'Not specified'}`);
    contextLines.push(`CURRENT STATUS: ${status || 'New lead'}`);
    contextLines.push(`TODAY'S DATE: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);

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

    // ── Build photo note ──
    const validPhotos: string[] = Array.isArray(photos)
      ? photos.filter((url: any) => typeof url === 'string' && url.startsWith('http')).slice(0, 4)
      : [];

    const photoNote = validPhotos.length > 0
      ? `\nThe customer also submitted ${validPhotos.length} photo(s). Describe what you see in each photo as it relates to the ${category || 'service'} request — visible damage, materials, access issues, scope indicators. Be specific and use trade-appropriate language.`
      : '';

    // ── THE FULL ACTIONABLE PROMPT ──
    const promptText = `You are an expert assistant for a home services contractor business.

AVAILABLE TEAM MEMBERS:
${teamListString}

DATA CONTEXT:
${context}
${photoNote}

Rules:
- Be specific to the service category.
- If it's a repeat customer, factor in history.
- The headline should capture the core situation.
- SUGGESTED UPDATES: Based on the request, suggest a schedule (YYYY-MM-DD), a quote total, and an assignee ID from the list above.

CRITICAL: Respond with ONLY the raw JSON object below. No markdown. No code fences. No explanation before or after. Start your response with { and end with }. Nothing else:
{
  "headline": "punchy status sentence",
  "summary": "2-3 sentence context paragraph",
  "next_steps": ["step 1", "step 2", "step 3"],
  "critical_info": ["flag 1", "flag 2"],
  "urgency": "Emergency|High Priority|Normal|Low Priority",
  "customer_score": "VIP|Good|New|Risky",
  "photo_observations": "forensic trade-appropriate details",
  "complexity": "Simple|Moderate|Complex",
  "damage_assessment": "trade-specific assessment",
  "estimated_scope": "what needs to be done",
  "recommended_action": "what should happen next",
  "safety_concerns": "any risks",
  "estimated_time": "time to complete",
  "whatYouSee": "detailed visual report",
  "condition": "Excellent|Good|Fair|Poor|Critical",
  "costBreakdown": {
    "materials": "est cost",
    "labor": "est cost",
    "totalLow": "est",
    "totalMid": "est",
    "totalHigh": "est"
  },
  "safetyConsiderations": ["item 1", "item 2"],
  "suggested_updates": {
    "assigned_to_id": number | null,
    "assigned_to_name": "name | null",
    "scheduled_date": "YYYY-MM-DD | null",
    "quote_total": number | null,
    "status": "string | null"
  }
}`;

    type ContentBlock =
      | { type: 'text'; text: string }
      | { type: 'image'; source: { type: 'url'; url: string } };

    const messageContent: ContentBlock[] = [{ type: 'text', text: promptText }];
    for (const url of validPhotos) {
      messageContent.push({ type: 'image', source: { type: 'url', url } });
    }

    const message = await callClaude({
      max_tokens: 1500, // Higher for full detail
      messages: [{ role: 'user', content: messageContent }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    let brief;
   try {
  // Extract only the JSON object — ignore any markdown or prose before/after
  const raw = content.text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  const clean = raw.slice(start, end + 1);
      brief = JSON.parse(clean);
      brief.customer_name = customer_name;
      brief.is_project = !!project_id;
      brief.status = status;
      brief.has_photos = validPhotos.length > 0;
      if (scheduled_date) brief.scheduled = { date: scheduled_date, time: scheduled_time };
    } catch {
      brief = { headline: "Error", summary: content.text };
    }

    return NextResponse.json({ success: true, brief });

  } catch (error: any) {
    console.error('AI Brief Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}