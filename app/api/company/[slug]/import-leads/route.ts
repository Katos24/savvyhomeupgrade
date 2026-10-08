// /api/company/[slug]/import-leads
//
// GET  → the company's recent imports (for the history list + Undo).
// POST { action: 'import', ... } → creates leads (and, for "active jobs" /
//      "past customers", converts them to projects the same way the Convert
//      button does: next project numbers, INV-xxx, status 'active').
// POST { action: 'undo', importId } → moves that import's leads to the trash
//      (soft delete, same as deleting a lead in the app).
//
// Rules:
// - Owner/admin of this company only.
// - Converting to projects needs the convert_to_project plan feature (Pro).
// - NEVER sends any email and never runs status automations: everything is
//   written directly, so "completed" here can't trigger final invoices or
//   review requests.
// - Skips rows that duplicate an existing lead (same email or same phone) or
//   another row in the same file.
// - No money data is imported.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/auth';
import { adminDb as sql } from '@/lib/db';
import { can, type PlanTier } from '@/lib/permissions';
import { CATEGORY_MAP } from '@/lib/formCategories';

export const maxDuration = 60;
export const runtime = 'nodejs';

const MAX_ROWS = 2000;
const ACTIVE_STATUSES = ['active', 'quoted', 'approved', 'scheduled', 'in-progress'] as const;
type ImportType = 'leads' | 'active' | 'past';

type InRow = {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  zip_code?: string;
  category?: string;
  notes?: string;
  date?: string; // YYYY-MM-DD from the browser, or ''
  lead_source?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const clip = (v: unknown, max: number) => {
  if (v === null || v === undefined) return '';
  return String(v).replace(/\s+/g, ' ').trim().slice(0, max);
};

function normPhone(v: unknown): string {
  let d = String(v ?? '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return d.length >= 7 && d.length <= 15 ? d : '';
}

async function getContext(slug: string) {
  const token = (await cookies()).get('auth-token')?.value;
  if (!token) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  let decoded: any;
  try {
    decoded = jwt.verify(token, getJwtSecret());
  } catch {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }
  const users = await sql`SELECT id, name, email, role, company_id FROM users WHERE id = ${decoded.userId} LIMIT 1`;
  const user = users[0];
  if (!user) return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };

  const companies = await sql`
    SELECT id, slug, plan_tier, business_type, form_categories
    FROM companies WHERE slug = ${slug} LIMIT 1
  `;
  const company = companies[0];
  if (!company || company.id !== user.company_id) {
    return { error: NextResponse.json({ success: false, error: 'Not found' }, { status: 404 }) };
  }
  if (user.role !== 'owner' && user.role !== 'admin') {
    return { error: NextResponse.json({ success: false, error: 'Only owners and admins can import.' }, { status: 403 }) };
  }
  return { user, company };
}

export async function GET(_req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const ctx = await getContext(slug);
    if ('error' in ctx) return ctx.error;
    const rows = await sql`
      SELECT id, file_name, import_type, row_count, imported_count, skipped_count,
             created_by_name, created_at, undone_at
      FROM lead_imports
      WHERE company_id = ${ctx.company.id}
      ORDER BY created_at DESC
      LIMIT 10
    `;
    return NextResponse.json({ success: true, imports: rows });
  } catch (err) {
    console.error('import-leads GET failed:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const ctx = await getContext(slug);
    if ('error' in ctx) return ctx.error;
    const { user, company } = ctx;
    const body = await req.json().catch(() => ({}));

    // ── Undo ──
    if (body.action === 'undo') {
      const importId = parseInt(String(body.importId), 10);
      const found = await sql`
        SELECT id, lead_ids, undone_at FROM lead_imports
        WHERE id = ${importId} AND company_id = ${company.id} LIMIT 1
      `;
      const imp = found[0];
      if (!imp) return NextResponse.json({ success: false, error: 'Import not found' }, { status: 404 });
      if (imp.undone_at) return NextResponse.json({ success: false, error: 'This import was already undone.' }, { status: 409 });
      const ids: number[] = (imp.lead_ids || []).map((n: any) => Number(n)).filter(Number.isFinite);
      if (ids.length) {
        await sql`
          UPDATE leads
          SET deleted = true,
              deleted_at = NOW(),
              deleted_by_name = ${user.name || user.email || 'Unknown'},
              deleted_by_email = ${user.email || ''},
              deleted_reason = 'Import undone',
              updated_at = NOW()
          WHERE id = ANY(${ids}::int[]) AND company_id = ${company.id} AND COALESCE(deleted, false) = false
        `;
      }
      await sql`UPDATE lead_imports SET undone_at = NOW() WHERE id = ${imp.id}`;
      return NextResponse.json({ success: true, removed: ids.length });
    }

    if (body.action !== 'import') {
      return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
    }

    // ── Import ──
    const type: ImportType = ['leads', 'active', 'past'].includes(body.type) ? body.type : 'leads';
    const activeStatus: string = ACTIVE_STATUSES.includes(body.activeStatus) ? body.activeStatus : 'active';
    const fileName = clip(body.fileName, 200) || 'spreadsheet.csv';
    const inRows: InRow[] = Array.isArray(body.rows) ? body.rows : [];

    if (inRows.length === 0) return NextResponse.json({ success: false, error: 'No rows to import.' }, { status: 400 });
    if (inRows.length > MAX_ROWS) {
      return NextResponse.json(
        { success: false, error: `Too many rows. Import up to ${MAX_ROWS.toLocaleString()} at a time.` },
        { status: 400 }
      );
    }

    const convert = type !== 'leads';
    if (convert && !can((company.plan_tier ?? 'free') as PlanTier, 'convert_to_project')) {
      return NextResponse.json(
        { success: false, error: 'Importing as jobs is on the Pro plan. Import them as new leads instead.', upgradeRequired: true },
        { status: 403 }
      );
    }

    // Services, to match the spreadsheet's service column to a real category.
    const cats: any[] =
      Array.isArray(company.form_categories) && company.form_categories.length
        ? company.form_categories
        : (CATEGORY_MAP as any)[company.business_type || 'general'] || (CATEGORY_MAP as any).general || [];
    const catLookup = new Map<string, string>();
    for (const c of cats) {
      const value = typeof c === 'object' ? c.value : c;
      const label = typeof c === 'object' ? c.label : c;
      if (value) {
        catLookup.set(String(value).toLowerCase(), String(value));
        catLookup.set(String(value).toLowerCase().replace(/_/g, ' '), String(value));
      }
      if (label && value) catLookup.set(String(label).toLowerCase(), String(value));
    }

    // Existing leads, for duplicate checks.
    const existing = await sql`
      SELECT lower(email) AS e, regexp_replace(COALESCE(phone, ''), '\\D', '', 'g') AS p
      FROM leads
      WHERE company_id = ${company.id} AND COALESCE(deleted, false) = false
    `;
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    for (const r of existing) {
      if (r.e) seenEmails.add(String(r.e));
      if (r.p) {
        const p = String(r.p);
        seenPhones.add(p.length === 11 && p.startsWith('1') ? p.slice(1) : p);
      }
    }

    const problems: { row: number; name: string; reason: string }[] = [];
    let duplicates = 0;

    const cols = {
      name: [] as string[],
      email: [] as string[],
      phone: [] as string[],
      description: [] as (string | null)[],
      category: [] as (string | null)[],
      a1: [] as (string | null)[],
      a2: [] as (string | null)[],
      city: [] as (string | null)[],
      zip: [] as (string | null)[],
      created: [] as (string | null)[],
      source: [] as (string | null)[],
    };

    inRows.forEach((r, i) => {
      const rowNum = i + 2; // +1 for the header row, +1 for 1-based
      const name =
        clip(r.name, 120) || clip([r.first_name, r.last_name].filter(Boolean).join(' '), 120);
      const rawEmail = clip(r.email, 254);
      const email = EMAIL_RE.test(rawEmail) ? rawEmail : '';
      const phone = normPhone(r.phone);

      if (!name) {
        problems.push({ row: rowNum, name: '', reason: 'No name' });
        return;
      }
      if (!email && !phone) {
        problems.push({ row: rowNum, name, reason: rawEmail ? 'Email looks invalid and no phone' : 'No email or phone' });
        return;
      }
      const eKey = email.toLowerCase();
      if ((eKey && seenEmails.has(eKey)) || (phone && seenPhones.has(phone))) {
        duplicates++;
        return;
      }
      if (eKey) seenEmails.add(eKey);
      if (phone) seenPhones.add(phone);

      const rawCat = clip(r.category, 80);
      const category = rawCat ? catLookup.get(rawCat.toLowerCase()) || null : null;

      const descParts: string[] = [];
      const note = String(r.notes ?? '').trim().slice(0, 4000);
      if (note) descParts.push(`Imported note: ${note}`);
      if (rawCat && !category) descParts.push(`Service: ${rawCat}`);
      const isoDate = typeof r.date === 'string' && DATE_RE.test(r.date) ? r.date : null;
      // New leads and active jobs land at the top of the board (created now);
      // their original date is kept in the notes. Past customers keep their
      // real date so they sort into history.
      if (isoDate && type !== 'past') descParts.push(`Original date: ${isoDate}`);

      cols.name.push(name);
      cols.email.push(email);
      cols.phone.push(phone);
      cols.description.push(descParts.length ? descParts.join('\n') : null);
      cols.category.push(category);
      cols.a1.push(clip(r.address_line_1, 200) || null);
      cols.a2.push(clip(r.address_line_2, 200) || null);
      cols.city.push(clip(r.city, 100) || null);
      cols.zip.push(clip(r.zip_code, 20) || null);
      cols.created.push(type === 'past' ? isoDate : null);
      cols.source.push(clip(r.lead_source, 80) || null);
    });

    const toImport = cols.name.length;
    const importedBy = user.name || user.email || 'Unknown';

    const batch = await sql`
      INSERT INTO lead_imports (company_id, created_by_user_id, created_by_name, file_name, import_type, row_count, imported_count, skipped_count)
      VALUES (${company.id}, ${user.id}, ${importedBy}, ${fileName}, ${type}, ${inRows.length}, 0, ${inRows.length})
      RETURNING id
    `;
    const importId = batch[0].id;

    if (toImport === 0) {
      await sql`UPDATE lead_imports SET skipped_count = ${inRows.length}, lead_ids = '{}' WHERE id = ${importId}`;
      return NextResponse.json({ success: true, importId, imported: 0, duplicates, problems });
    }

    const leadStatus = type === 'leads' ? 'new' : type === 'past' ? 'completed' : activeStatus;
    const activity = JSON.stringify([
      {
        type: 'imported',
        text: `Imported from ${fileName} by ${importedBy}`,
        user_name: importedBy,
        user_email: user.email || '',
        timestamp: new Date().toISOString(),
      },
    ]);

    // One INSERT for all rows. Original dates become created_at.
    const inserted = await sql`
      INSERT INTO leads (
        name, email, phone, description, status, category, company_id, notes,
        origin, created_by, lead_source, address_line_1, address_line_2, city, zip_code,
        custom_answers, created_at, updated_at, job_completed_at
      )
      SELECT
        t.name, t.email, t.phone, t.description, ${leadStatus}::text, t.category, ${company.id}::int, ${activity}::text,
        'import', 'import', t.source, t.a1, t.a2, t.city, t.zip,
        '{}'::jsonb,
        COALESCE(t.created::timestamp, NOW()),
        NOW(),
        CASE WHEN ${type}::text = 'past' THEN COALESCE(t.created::timestamp, NOW()) ELSE NULL END
      FROM unnest(
        ${cols.name}::text[], ${cols.email}::text[], ${cols.phone}::text[], ${cols.description}::text[],
        ${cols.category}::text[], ${cols.a1}::text[], ${cols.a2}::text[], ${cols.city}::text[],
        ${cols.zip}::text[], ${cols.created}::text[], ${cols.source}::text[]
      ) AS t(name, email, phone, description, category, a1, a2, city, zip, created, source)
      RETURNING id
    `;
    const leadIds: number[] = inserted.map((r: any) => Number(r.id));

    let projectsCreated = 0;
    if (convert && leadIds.length) {
      // Same shape as create_project: numbers continue from the company's
      // highest, INV-001 style, status 'active'. Numbered by lead id order.
      const projects = await sql`
        WITH base AS (
          SELECT COALESCE(MAX(p.project_number), 0) AS m
          FROM projects p JOIN leads l ON p.lead_id = l.id
          WHERE l.company_id = ${company.id}
        ),
        src AS (
          SELECT l.*, row_number() OVER (ORDER BY l.id) AS rn
          FROM leads l WHERE l.id = ANY(${leadIds}::int[])
        )
        INSERT INTO projects (
          lead_id, project_number, customer_name, customer_email, customer_phone,
          service_address, address_line_2, city, zip_code, category, status, company_id,
          invoice_number, before_photos, after_photos, created_at, updated_at
        )
        SELECT
          s.id, b.m + s.rn, s.name, s.email, s.phone,
          s.address_line_1, s.address_line_2, s.city, s.zip_code, s.category, 'active', s.company_id,
          'INV-' || CASE WHEN b.m + s.rn < 1000 THEN lpad((b.m + s.rn)::text, 3, '0') ELSE (b.m + s.rn)::text END,
          '[]'::jsonb, '[]'::jsonb, s.created_at, NOW()
        FROM src s CROSS JOIN base b
        RETURNING id
      `;
      const projectIds: number[] = projects.map((r: any) => Number(r.id));
      projectsCreated = projectIds.length;

      await sql`
        UPDATE leads l SET project_id = p.id
        FROM projects p
        WHERE p.lead_id = l.id AND l.id = ANY(${leadIds}::int[])
      `;
      const projectNotes = JSON.stringify([
        {
          type: 'project_created',
          text: `Project created by import (${fileName}) by ${importedBy}`,
          user_name: importedBy,
          user_email: user.email || '',
          timestamp: new Date().toISOString(),
        },
      ]);
      await sql`UPDATE projects SET notes = ${projectNotes} WHERE id = ANY(${projectIds}::int[])`;
    }

    await sql`
      UPDATE lead_imports
      SET imported_count = ${leadIds.length},
          skipped_count = ${inRows.length - leadIds.length},
          lead_ids = ${leadIds}::int[]
      WHERE id = ${importId}
    `;

    return NextResponse.json({
      success: true,
      importId,
      imported: leadIds.length,
      projectsCreated,
      duplicates,
      problems,
    });
  } catch (err) {
    console.error('import-leads POST failed:', err);
    return NextResponse.json({ success: false, error: 'Import failed. Check your import history below before trying again.' }, { status: 500 });
  }
}