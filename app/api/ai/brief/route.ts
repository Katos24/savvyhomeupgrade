import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { neon } from '@neondatabase/serverless';
import { can } from '@/lib/permissions';
import type { PlanTier } from '@/lib/permissions';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
export const maxDuration = 30;

// AI assistant chat only. The per-lead AI brief / photo analysis that used
// to live here has been removed.

const CLAUDE_TIMEOUT_MS = 25000;

function isRetryable(err: any) {
  return (
    err?.status === 529 ||
    err?.status === 429 ||
    err?.message?.includes('529') ||
    err?.message?.includes('overloaded') ||
    err?.message?.includes('rate_limit')
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, error: 'Anthropic API key not configured' }, { status: 500 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!decoded?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { chat_mode, chat_history, all_leads_summary } = body;

    if (!chat_mode) {
      return NextResponse.json(
        { success: false, error: 'AI lead briefs are no longer available.' },
        { status: 410 }
      );
    }

    // ── Server-side plan check ──
    // Looked up by the company in the login token, not a slug from the
    // request body — otherwise a free account could send a Pro company's
    // slug and get past the plan check.
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT name, plan_tier FROM companies WHERE id = ${decoded.companyId} LIMIT 1`;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const companyName: string = rows[0].name || 'a contractor';
    const dbPlanTier = (rows[0].plan_tier ?? 'free') as PlanTier;
    if (!can(dbPlanTier, 'ai_chat')) {
      return NextResponse.json(
        { success: false, error: 'The AI assistant is available on the Pro plan', upgrade_required: true },
        { status: 403 }
      );
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
        return await callWithTimeout(() => anthropic.messages.create({ ...params, model: 'claude-sonnet-5-5' }));
      } catch (err: any) {
        if (!isRetryable(err)) throw err;
      }
      for (let attempt = 0; attempt <= 1; attempt++) {
        try {
          return await callWithTimeout(() =>
            anthropic.messages.create({ ...params, model: 'claude-haiku-4-5-20251001' })
          );
        } catch (err: any) {
          if (!isRetryable(err)) throw err;
          if (attempt === 0) await new Promise((r) => setTimeout(r, 2000));
        }
      }
      throw new Error('All models overloaded or rate limited. Please try again shortly.');
    }

    const ctx = all_leads_summary;
    const leadsContext = ctx
      ? `BUSINESS SNAPSHOT for ${companyName}:
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

    const systemPrompt = `You are a smart business assistant for ${companyName}. You have real-time access to their job data. Answer questions specifically using the actual data provided — never be vague when you have the numbers. Be conversational, direct, and actionable. Use bullet points for lists. Bold important numbers or names with **text**. Keep responses under 150 words unless detail is truly needed.

${leadsContext}`;

    const messages = (Array.isArray(chat_history) ? chat_history : [])
      .filter((m: any) => (m?.role === 'user' || m?.role === 'assistant') && typeof m?.content === 'string')
      .map((m: any) => ({ role: m.role, content: m.content }));

    if (messages.length === 0) {
      return NextResponse.json({ success: false, error: 'No message to send' }, { status: 400 });
    }

    const chatResponse = await callClaude({
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const replyText = chatResponse.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    if (!replyText) {
      console.error('No text block. Blocks:', chatResponse.content.map((b) => b.type));
      throw new Error('Unexpected response type');
    }

    return NextResponse.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('AI Chat Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}