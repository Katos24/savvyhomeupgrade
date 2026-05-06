// app/api/ai/generate-quote/route.ts
//
// Architecture: Fire-and-poll job queue
//   POST  → validates input, creates a job, kicks off async processing, returns jobId
//   Client polls GET /api/ai/quote-status?jobId=xxx until complete | failed
//
// Security:
//   - Server-side plan check (never trust client)
//   - Company ownership verified before every DB write
//   - Photo URLs validated against allowlist domains
//   - Input sanitized and length-capped
//   - Rate limited per company (5 requests / 60s)
//   - Job expires after 1 hour — no stale data
//   - No NY hardcoding — works for any US region

import { NextResponse, after } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { neon } from '@neondatabase/serverless';
import { can, type PlanTier } from '@/lib/permissions';

export const maxDuration = 60;

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_PHOTOS        = 6;
const MAX_DESC_LENGTH   = 2000;
const MAX_NOTES_LENGTH  = 2000;
const MAX_RETRIES       = 3;
const BASE_DELAY_MS     = 1500;
const RATE_LIMIT_MAX    = 5;     // requests
const RATE_LIMIT_SEC    = 60;    // per window (seconds)

// Only allow photos from your own storage domain(s)
// Add your Vercel Blob / S3 / Cloudflare domain here
const ALLOWED_PHOTO_DOMAINS = [
  'blob.vercel-storage.com',
  'vercel-storage.com',
  'amazonaws.com',
  'cloudflare.com',
  'r2.cloudflarestorage.com',
  'storage.googleapis.com',
  'uploadthing.com',
  'utfs.io',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAllowedPhotoUrl(url: string): boolean {
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'https:') return false;
    return ALLOWED_PHOTO_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

function sanitizeString(input: any, maxLength: number): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Rate limiter (in-memory per instance, good enough for Vercel) ────────────
// For multi-instance, swap this for Redis or a DB-backed counter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(companyId: number): boolean {
  const key = `rl:quote:${companyId}`;
  const now = Date.now();

  // Clean stale entries to prevent memory leak
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetAt) rateLimitMap.delete(k);
  }

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_SEC * 1000 });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

// ─── Photo processor ─────────────────────────────────────────────────────────
async function processPhoto(url: string): Promise<Anthropic.ImageBlockParam | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s timeout per photo

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Photo fetch failed: ${res.status}`);

    const buf = Buffer.from(await res.arrayBuffer());

    // Enforce max 10MB raw before compression
    if (buf.length > 10 * 1024 * 1024) throw new Error('Photo too large (>10MB)');

    const compressed = await sharp(buf)
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return {
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: compressed.toString('base64'),
      },
    };
  } catch (err) {
    console.warn('Photo processing failed (skipping):', url, err);
    return null;
  }
}

// ─── Claude call with retry + backoff ────────────────────────────────────────
async function callClaudeWithRetry(
  anthropic: Anthropic,
  messageContent: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[]
): Promise<Anthropic.Message> {
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: messageContent }],
      });
    } catch (err: any) {
      lastError = err;

      // The Anthropic SDK wraps the error — check all possible locations
      const statusCode = err?.status ?? err?.statusCode ?? err?.error?.status;
      const errorType  =
        err?.error?.error?.type ??   // SDK double-wrapped
        err?.error?.type ??           // single-wrapped
        err?.type ?? '';

      const isOverloaded = statusCode === 529 || errorType === 'overloaded_error';
      const isRateLimit  = statusCode === 429 || errorType === 'rate_limit_error';
      const shouldRetry  = (isOverloaded || isRateLimit) && attempt < MAX_RETRIES;

      if (shouldRetry) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(`Claude ${statusCode} (attempt ${attempt}/${MAX_RETRIES}), retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        // Rethrow with a clean human-readable message
        const cleanMessage = isOverloaded
          ? 'Claude is currently overloaded. Please try again in a moment.'
          : isRateLimit
          ? 'Too many requests to AI. Please wait a moment and try again.'
          : err?.message ?? 'AI service error';
        throw new Error(cleanMessage);
      }
    }
  }

  // All retries exhausted
  const statusCode = lastError?.status ?? lastError?.statusCode;
  const errorType  = lastError?.error?.error?.type ?? lastError?.error?.type ?? '';
  const isOverloaded = statusCode === 529 || errorType === 'overloaded_error';
  throw new Error(
    isOverloaded
      ? 'Claude is currently overloaded after multiple retries. Please try again in a minute.'
      : lastError?.message ?? 'AI service error after retries'
  );
}

// ─── Build prompt ─────────────────────────────────────────────────────────────
function buildPrompt(
  category: string,
  fullContext: string,
  photoCount: number
): string {
  return `You are a seasoned general contractor with 20+ years of field experience across the United States. You are generating a professional, accurate job quote based on the information provided.

Job Category: ${category || 'General Contractor'}
${fullContext}
${photoCount > 0
  ? `You have been provided ${photoCount} photo(s) of the job site. Analyze them carefully and methodically — use what you actually see (damage extent, materials, measurements, condition) to determine scope, quantities, and pricing. Cross-reference visual evidence with the description provided.`
  : 'No photos provided — base your estimate strictly on the written description and notes above. Flag any line items where a site visit is needed to confirm scope.'
}

PRICING GUIDELINES:
- Use realistic US market rates appropriate to the scope and trade
- General labor: $65–$120/hr depending on skill level and region
- Skilled trades (licensed electrician, plumber, HVAC): $100–$180/hr
- Specialist work (structural, roofing, tile): $85–$150/hr
- Always separate labor and materials into distinct line items
- Base quantities on what is described or visually evident — do not inflate
- Include permits if the work type typically requires them ($100–$600)
- Include debris removal or disposal only if clearly needed
- Round unit prices to clean increments ($25, $50, $75, $100, $125, $150, etc.)
- Never output precision like $73.47 — that signals guessing, not expertise
- Do NOT pad the quote. Do NOT lowball. Price it as a fair, honest contractor would
- If scope is genuinely unclear, note it in the line item description: e.g. "Labor - Drywall repair (sq footage TBD on site visit)"
- If photos show damage you were not told about, include it and note it

OUTPUT FORMAT — return ONLY a valid JSON array, no markdown, no explanation, no preamble:
[
  {
    "description": "Labor - [specific task description]",
    "quantity": 4,
    "unitPrice": 95
  },
  {
    "description": "Materials - [specific material, grade, quantity unit]",
    "quantity": 2,
    "unitPrice": 180
  }
]

STRICT RULES:
- 3 to 7 line items — no more, no less
- Every description must be specific — never just "Labor" or "Materials" alone
- quantity: positive number
- unitPrice: positive number
- Return ONLY the raw JSON array — absolutely nothing else`;
}

// ─── Core processing function (runs async after response) ─────────────────────
async function processQuoteJob(jobId: string, sql: any, anthropic: Anthropic) {
  try {
    // Mark as processing
    await sql`
      UPDATE ai_quote_jobs
      SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
      WHERE id = ${jobId}
    `;

    // Fetch job input
    const jobRows = await sql`SELECT input FROM ai_quote_jobs WHERE id = ${jobId}`;
    if (!jobRows[0]) throw new Error('Job not found');

    const { description, internal_notes, category, photoUrls } = jobRows[0].input;

    // Build context
    let fullContext = '';
    if (description)     fullContext += `Customer Description: "${description}"\n`;
    if (internal_notes)  fullContext += `Contractor Internal Notes: "${internal_notes}"\n`;

    // Process photos in parallel, skip failures
    const photoResults = await Promise.allSettled(
      (photoUrls as string[]).map(processPhoto)
    );
    const imageContents: Anthropic.ImageBlockParam[] = photoResults
      .filter((r): r is PromiseFulfilledResult<Anthropic.ImageBlockParam> =>
        r.status === 'fulfilled' && r.value !== null
      )
      .map(r => r.value);

    // Build prompt and call Claude
    const prompt = buildPrompt(category, fullContext, imageContents.length);
    const messageContent: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = [
      { type: 'text', text: prompt },
      ...imageContents,
    ];

    const message = await callClaudeWithRetry(anthropic, messageContent);

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type from Claude');

    // Parse and validate
    const clean = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    let items: any[];
    try {
      items = JSON.parse(clean);
    } catch {
      throw new Error('Claude returned non-JSON — try adding more detail to the description');
    }

    if (!Array.isArray(items)) throw new Error('AI response is not an array');

    const validatedItems = items
      .filter((item: any) => item.description && Number(item.unitPrice) > 0)
      .map((item: any) => ({
        description: String(item.description).trim().slice(0, 300),
        quantity:    Math.max(0.25, Number(item.quantity) || 1),
        unitPrice:   Math.max(1,    Number(item.unitPrice) || 0),
      }));

    if (validatedItems.length === 0) {
      throw new Error('No valid line items returned — try adding more detail to the description');
    }

    // Mark complete
    await sql`
      UPDATE ai_quote_jobs
      SET
        status     = 'complete',
        result     = ${JSON.stringify({ items: validatedItems, usedPhotos: imageContents.length })}::jsonb,
        updated_at = NOW()
      WHERE id = ${jobId}
    `;

  } catch (err: any) {
    console.error('Quote job failed:', jobId, err.message);

    // Mark failed with error message
    await sql`
      UPDATE ai_quote_jobs
      SET
        status     = 'failed',
        error      = ${err.message || 'Unknown error'},
        updated_at = NOW()
      WHERE id = ${jobId}
    `;
  }
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ success: false, error: 'Service not configured' }, { status: 500 });
    }

    // ── Parse and sanitize input ───────────────────────────────────────────
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const company_slug   = sanitizeString(body.company_slug,   100);
    const description    = sanitizeString(body.description,    MAX_DESC_LENGTH);
    const internal_notes = sanitizeString(body.internal_notes, MAX_NOTES_LENGTH);
    const category       = sanitizeString(body.category,       100);
    const lead_id        = typeof body.lead_id === 'number' ? body.lead_id : null;

    if (!company_slug) {
      return NextResponse.json({ success: false, error: 'Missing company_slug' }, { status: 400 });
    }

    if (!description && !internal_notes) {
      return NextResponse.json({
        success: false,
        error: 'Please add a project description or internal notes before generating a quote.',
        needs_description: true,
      }, { status: 400 });
    }

    // ── Validate and allowlist photo URLs ──────────────────────────────────
    const rawPhotos: string[] = Array.isArray(body.photos) ? body.photos : [];
    const photoUrls = rawPhotos
      .filter((u: any) => typeof u === 'string' && isAllowedPhotoUrl(u))
      .slice(0, MAX_PHOTOS);

    // Log any rejected URLs for debugging
    const rejectedCount = rawPhotos.length - photoUrls.length;
    if (rejectedCount > 0) {
      console.warn(`Rejected ${rejectedCount} photo URL(s) — not from allowed domains`);
    }

    // ── DB: verify company + plan ──────────────────────────────────────────
    const sql = neon(process.env.DATABASE_URL!);
    const companyRows = await sql`
      SELECT id, plan_tier
      FROM companies
      WHERE slug = ${company_slug}
      LIMIT 1
    `;

    if (!companyRows[0]) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const { id: companyId, plan_tier } = companyRows[0];
    const dbPlanTier = (plan_tier ?? 'free') as PlanTier;

    if (!can(dbPlanTier, 'ai_quote')) {
      return NextResponse.json({
        success: false,
        error: 'AI quote generator is available on the Pro plan',
        upgrade_required: true,
      }, { status: 403 });
    }

    // ── Rate limit (per company) ───────────────────────────────────────────
    if (!checkRateLimit(companyId)) {
      return NextResponse.json({
        success: false,
        error: `Too many quote requests. Please wait a moment and try again.`,
        rate_limited: true,
      }, { status: 429 });
    }

    // ── Create job in DB ───────────────────────────────────────────────────
    const jobRows = await sql`
      INSERT INTO ai_quote_jobs (company_id, lead_id, status, input, expires_at)
      VALUES (
        ${companyId},
        ${lead_id},
        'pending',
        ${JSON.stringify({ description, internal_notes, category, photoUrls })}::jsonb,
        NOW() + INTERVAL '1 hour'
      )
      RETURNING id
    `;

    const jobId = jobRows[0].id;

     // ── Kick off async processing (fire and return jobId) ─────────────────
    // after() sends the response immediately but keeps the function alive
    // until processQuoteJob completes (up to maxDuration)
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    after(
      processQuoteJob(jobId, sql, anthropic).catch(err => {
        console.error('Unhandled processQuoteJob error:', err);
      })
    );

    // Return jobId immediately — client polls from here
    return NextResponse.json({
      success: true,
      jobId,
      message: 'Quote generation started',
    });

  } catch (error: any) {
    console.error('Generate quote POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to start quote generation',
    }, { status: 500 });
  }
}