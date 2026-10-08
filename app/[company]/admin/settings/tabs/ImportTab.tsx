'use client';

// Settings → Your business → Import.
// Read a CSV in the browser, match its columns, pick what the list is,
// preview, then send the rows to /api/company/[slug]/import-leads.
// Nothing is emailed. Every import can be undone from the history list.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, FileText, Loader2, Check, AlertTriangle, Undo2, Download, Lock, X, HelpCircle, Table } from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
import { parseCSV, toCSV } from '@/lib/csv';

type FieldKey =
  | 'name' | 'first_name' | 'last_name' | 'email' | 'phone'
  | 'address_line_1' | 'address_line_2' | 'city' | 'zip_code'
  | 'category' | 'notes' | 'date' | 'lead_source';

const FIELDS: { key: FieldKey; label: string; synonyms: string[] }[] = [
  { key: 'name', label: 'Full name', synonyms: ['name', 'full name', 'customer', 'customer name', 'client', 'client name', 'contact', 'contact name', 'display name'] },
  { key: 'first_name', label: 'First name', synonyms: ['first name', 'first', 'firstname', 'given name'] },
  { key: 'last_name', label: 'Last name', synonyms: ['last name', 'last', 'lastname', 'surname', 'family name'] },
  { key: 'email', label: 'Email', synonyms: ['email', 'e mail', 'email address', 'customer email', 'primary email', 'emails'] },
  { key: 'phone', label: 'Phone', synonyms: ['phone', 'phone number', 'mobile', 'mobile phone', 'mobile number', 'cell', 'cell phone', 'telephone', 'tel', 'primary phone', 'main phone', 'phones'] },
  { key: 'address_line_1', label: 'Street address', synonyms: ['address', 'street', 'street address', 'address 1', 'address line 1', 'service address', 'billing address', 'property address', 'billing street', 'street 1'] },
  { key: 'address_line_2', label: 'Unit / Apt', synonyms: ['address 2', 'address line 2', 'unit', 'apt', 'suite', 'street 2'] },
  { key: 'city', label: 'City', synonyms: ['city', 'town', 'billing city'] },
  { key: 'zip_code', label: 'Zip', synonyms: ['zip', 'zip code', 'zipcode', 'postal code', 'postcode', 'billing zip'] },
  { key: 'category', label: 'Service', synonyms: ['service', 'category', 'job type', 'service type', 'type of work', 'trade', 'work type'] },
  { key: 'notes', label: 'Notes', synonyms: ['notes', 'note', 'description', 'details', 'comments', 'job description', 'message'] },
  { key: 'date', label: 'Date', synonyms: ['date', 'created', 'created at', 'date created', 'created date', 'job date', 'completed', 'completed date', 'date added', 'customer since'] },
  { key: 'lead_source', label: 'Lead source', synonyms: ['source', 'lead source', 'referral source', 'how did you hear', 'referred by'] },
];

const MAX_ROWS = 2000;
const ACTIVE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'approved', label: 'Approved' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
];

type Mapping = Record<FieldKey, number>; // column index, -1 = not used
type ImportType = 'leads' | 'active' | 'past';
type Result = {
  importId: number;
  imported: number;
  projectsCreated?: number;
  duplicates: number;
  problems: { row: number; name: string; reason: string }[];
};
type HistoryRow = {
  id: number;
  file_name: string;
  import_type: ImportType;
  imported_count: number;
  skipped_count: number;
  created_by_name: string;
  created_at: string;
  undone_at: string | null;
};

const norm = (h: string) =>
  h.toLowerCase().replace(/[_\-./]+/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

function autoMap(headers: string[]): Mapping {
  const m = Object.fromEntries(FIELDS.map((f) => [f.key, -1])) as Mapping;
  const used = new Set<number>();
  const n = headers.map(norm);
  // Pass 1: exact matches
  for (const f of FIELDS) {
    const i = n.findIndex((h, idx) => !used.has(idx) && f.synonyms.includes(h));
    if (i !== -1) {
      m[f.key] = i;
      used.add(i);
    }
  }
  // Pass 2: header contains a synonym (e.g. "Customer Mobile Phone").
  // Most specific fields first, so "Customer Email" goes to Email, not Name.
  const order: FieldKey[] = ['email', 'phone', 'zip_code', 'address_line_2', 'address_line_1', 'city', 'date', 'lead_source', 'category', 'notes', 'first_name', 'last_name', 'name'];
  for (const key of order) {
    const f = FIELDS.find((x) => x.key === key)!;
    if (m[f.key] !== -1) continue;
    const i = n.findIndex((h, idx) => !used.has(idx) && f.synonyms.some((s) => s.length > 3 && h.includes(s)));
    if (i !== -1) {
      m[f.key] = i;
      used.add(i);
    }
  }
  // A full-name column wins over first/last only when there is no first name.
  if (m.name !== -1 && m.first_name !== -1) m.name = -1;
  return m;
}

// 2025-05-02, 5/2/2025, 5/2/25, "2025-05-02 14:00" → YYYY-MM-DD; else ''.
function toISODate(v: string): string {
  const s = (v || '').trim();
  if (!s) return '';
  let y: number, mo: number, d: number;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (m) {
    y = +m[1]; mo = +m[2]; d = +m[3];
  } else if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(s))) {
    mo = +m[1]; d = +m[2]; y = +m[3];
    if (y < 100) y += y >= 70 ? 1900 : 2000;
  } else {
    const t = Date.parse(s);
    if (Number.isNaN(t)) return '';
    const dt = new Date(t);
    y = dt.getFullYear(); mo = dt.getMonth() + 1; d = dt.getDate();
  }
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1970 || y > 2100) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// A ready-to-fill sheet. Column names match what the importer looks for.
const TEMPLATE_ROWS = [
  ['Name', 'Email', 'Phone', 'Address', 'Unit', 'City', 'Zip', 'Service', 'Notes', 'Date'],
  ['Jane Sample', 'jane@example.com', '(516) 555-0101', '12 Oak St', '', 'Holbrook', '11741', 'Roof Repair', 'Leak over the garage', '2025-05-02'],
  ['Bob Example', '', '631-555-0102', '48 Pine Ave', 'Apt 2', 'Ronkonkoma', '11779', '', 'Gutter cleaning every fall', '2024-10-15'],
];

function downloadCSV(rows: (string | number)[][], name: string) {
  const url = URL.createObjectURL(new Blob([toCSV(rows)], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const fmtDay = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const TYPE_LABEL: Record<ImportType, string> = { leads: 'New leads', active: 'Active jobs', past: 'Past customers' };

export default function ImportTab({ company }: { company: any }) {
  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const canConvert = can(planTier, 'convert_to_project');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Mapping | null>(null);
  const [type, setType] = useState<ImportType>('leads');
  const [activeStatus, setActiveStatus] = useState('active');
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [undoing, setUndoing] = useState<number | null>(null);

  const loadHistory = () =>
    fetch(`/api/company/${company.slug}/import-leads`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => d?.success && setHistory(d.imports || []))
      .catch(() => {});

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.slug]);

  const reset = () => {
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping(null);
    setError(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onFile = async (file: File | undefined) => {
    setError(null);
    setResult(null);
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      setError('Please choose a .csv file. In Excel or Google Sheets, use File → Save as / Download → CSV.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('That file is over 5 MB. Split it into smaller files and import them one at a time.');
      return;
    }
    const text = await file.text();
    const all = parseCSV(text);
    if (all.length < 2) {
      setError('That file has no rows under the header row.');
      return;
    }
    const [head, ...body] = all;
    if (body.length > MAX_ROWS) {
      setError(`That file has ${body.length.toLocaleString()} rows. Import up to ${MAX_ROWS.toLocaleString()} at a time.`);
      return;
    }
    setFileName(file.name);
    setHeaders(head.map((h, i) => h.trim() || `Column ${i + 1}`));
    setRows(body);
    setMapping(autoMap(head));
  };

  const mappedRows = useMemo(() => {
    if (!mapping) return [];
    const get = (r: string[], k: FieldKey) => (mapping[k] >= 0 ? (r[mapping[k]] ?? '').trim() : '');
    return rows.map((r) => ({
      name: get(r, 'name'),
      first_name: get(r, 'first_name'),
      last_name: get(r, 'last_name'),
      email: get(r, 'email'),
      phone: get(r, 'phone'),
      address_line_1: get(r, 'address_line_1'),
      address_line_2: get(r, 'address_line_2'),
      city: get(r, 'city'),
      zip_code: get(r, 'zip_code'),
      category: get(r, 'category'),
      notes: get(r, 'notes'),
      date: toISODate(get(r, 'date')),
      lead_source: get(r, 'lead_source'),
    }));
  }, [rows, mapping]);

  const hasName = mapping && (mapping.name >= 0 || mapping.first_name >= 0 || mapping.last_name >= 0);
  const hasContact = mapping && (mapping.email >= 0 || mapping.phone >= 0);
  const canImport = !!mapping && !!hasName && !!hasContact && !importing && (type === 'leads' || canConvert);

  const doImport = async () => {
    if (!canImport) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch(`/api/company/${company.slug}/import-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'import', fileName, type, activeStatus, rows: mappedRows }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Import failed. Please try again.');
      setResult(data);
      setRows([]);
      setMapping(null);
      loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const undo = async (importId: number, count: number) => {
    if (!window.confirm(`Undo this import? ${count} imported ${count === 1 ? 'card' : 'cards'} will move to the trash, including any changes made to them since.`)) return;
    setUndoing(importId);
    try {
      const res = await fetch(`/api/company/${company.slug}/import-leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'undo', importId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not undo.');
      if (result?.importId === importId) setResult(null);
      loadHistory();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not undo.');
    } finally {
      setUndoing(null);
    }
  };

  const downloadProblems = () => {
    if (!result?.problems.length) return;
    downloadCSV([['Row', 'Name', 'Problem'], ...result.problems.map((p) => [p.row, p.name, p.reason])], 'import-problems.csv');
  };

  const preview = mappedRows.slice(0, 5);
  const shownFields = FIELDS.filter((f) => mapping && mapping[f.key] >= 0);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-stone-900">Import customers</h2>
        <p className="mt-1 text-sm text-stone-500">
          Bring in leads and customers from a spreadsheet or another app. Save it as a CSV first. No emails are sent, and
          you can undo any import.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="h-4 w-4" strokeWidth={3} />
              </span>
              <div>
                <p className="text-sm font-semibold text-stone-900">
                  Imported {result.imported.toLocaleString()} {result.imported === 1 ? 'card' : 'cards'}
                  {result.projectsCreated ? ` as projects` : ''}
                </p>
                <p className="mt-0.5 text-xs text-stone-500">
                  {result.duplicates > 0 && `${result.duplicates} skipped as duplicates (same email or phone). `}
                  {result.problems.length > 0 && `${result.problems.length} rows had problems.`}
                  {result.duplicates === 0 && result.problems.length === 0 && 'Every row came in.'}
                </p>
              </div>
            </div>
            <button onClick={reset} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {result.problems.length > 0 && (
              <button
                onClick={downloadProblems}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                <Download className="h-3.5 w-3.5" /> Download rows with problems
              </button>
            )}
            {result.imported > 0 && (
              <button
                onClick={() => undo(result.importId, result.imported)}
                disabled={undoing === result.importId}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
              >
                {undoing === result.importId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                Undo this import
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Step 1: pick a file ── */}
      {!mapping && (
        <label
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-10 text-center transition hover:border-stone-400 hover:bg-stone-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFile(e.dataTransfer.files?.[0]);
          }}
        >
          <Upload className="h-6 w-6 text-stone-400" />
          <span className="text-sm font-semibold text-stone-800">Choose a CSV file or drop it here</span>
          <span className="text-xs text-stone-500">Up to {MAX_ROWS.toLocaleString()} rows. The first row should be column names.</span>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      )}

      {/* ── How to get a CSV ── */}
      {!mapping && (
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <HelpCircle className="h-4 w-4 text-stone-400" />
            How to get your customers into a CSV
          </h3>
          <ol className="mt-3 space-y-3 text-sm text-stone-600">
            <li>
              <span className="font-semibold text-stone-800">Starting from scratch or a messy list?</span> Download the
              template, fill one customer per row, and upload it.
              <button
                type="button"
                onClick={() => downloadCSV(TEMPLATE_ROWS, 'lead2project-import-template.csv')}
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                <Table className="h-3.5 w-3.5" /> Download the template
              </button>
            </li>
            <li>
              <span className="font-semibold text-stone-800">Excel:</span> File → Save As → choose{' '}
              <span className="font-medium">CSV UTF-8 (Comma delimited)</span>.
            </li>
            <li>
              <span className="font-semibold text-stone-800">Google Sheets:</span> File → Download →{' '}
              <span className="font-medium">Comma Separated Values (.csv)</span>.
            </li>
            <li>
              <span className="font-semibold text-stone-800">Another app (Jobber, Housecall Pro, QuickBooks…):</span>{' '}
              look for &ldquo;Export&rdquo; on their clients or customers list and choose CSV.
            </li>
          </ol>
          <p className="mt-4 rounded-lg bg-stone-50 px-3 py-2.5 text-xs text-stone-600">
            Your column names don&rsquo;t have to match ours. We match them for you, and you can fix anything before
            importing. Rows need a name and an email or phone.
          </p>
        </section>
      )}

      {/* ── Step 2: match columns, choose type, preview ── */}
      {mapping && (
        <>
          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-stone-900">
                <FileText className="h-4 w-4 shrink-0 text-stone-400" />
                <span className="truncate">{fileName}</span>
                <span className="shrink-0 font-normal text-stone-500">· {rows.length.toLocaleString()} rows</span>
              </p>
              <button onClick={reset} className="shrink-0 text-xs font-semibold text-stone-500 hover:text-stone-800">
                Choose another file
              </button>
            </div>

            <p className="mt-5 text-xs font-semibold text-stone-500">Match your columns</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <label key={f.key} className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 px-3 py-2">
                  <span className="text-sm text-stone-700">{f.label}</span>
                  <select
                    value={mapping[f.key]}
                    onChange={(e) => setMapping({ ...mapping, [f.key]: Number(e.target.value) })}
                    className="max-w-[55%] truncate rounded-md border border-stone-200 bg-white px-2 py-1 text-xs text-stone-800"
                  >
                    <option value={-1}>Don&rsquo;t import</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            {(!hasName || !hasContact) && (
              <p className="mt-3 text-xs font-semibold text-amber-700">
                Match a name column and at least an email or phone column to import.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-stone-500">What is this list?</p>
            <div className="mt-2 space-y-2">
              {(
                [
                  { v: 'leads', t: 'New leads', d: 'People who asked about work you haven’t started. They land in New.', pro: false },
                  { v: 'active', t: 'Active jobs', d: 'Work in progress. Each becomes a project you can quote, schedule and invoice.', pro: true },
                  { v: 'past', t: 'Past customers', d: 'Finished work. Each becomes a completed project, so repeat customers show their past jobs.', pro: true },
                ] as { v: ImportType; t: string; d: string; pro: boolean }[]
              ).map((o) => {
                const locked = o.pro && !canConvert;
                return (
                  <label
                    key={o.v}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                      type === o.v ? 'border-stone-900' : 'border-stone-200'
                    } ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-stone-50'}`}
                  >
                    <input
                      type="radio"
                      name="import-type"
                      className="mt-1"
                      checked={type === o.v}
                      disabled={locked}
                      onChange={() => setType(o.v)}
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-stone-900">
                        {o.t}
                        {locked && (
                          <span className="inline-flex items-center gap-1 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-600">
                            <Lock className="h-2.5 w-2.5" /> Pro
                          </span>
                        )}
                      </span>
                      <span className="block text-xs text-stone-500">{o.d}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            {type === 'active' && (
              <label className="mt-3 flex items-center gap-2 text-sm text-stone-700">
                Put them in
                <select
                  value={activeStatus}
                  onChange={(e) => setActiveStatus(e.target.value)}
                  className="rounded-md border border-stone-200 bg-white px-2 py-1 text-sm"
                >
                  {ACTIVE_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </section>

          {shownFields.length > 0 && (
            <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
              <p className="px-5 pt-4 text-xs font-semibold text-stone-500">Preview (first {preview.length} rows)</p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="border-y border-stone-100 bg-stone-50 text-stone-500">
                      {shownFields.map((f) => (
                        <th key={f.key} className="px-3 py-2 font-semibold">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-b border-stone-100 last:border-0">
                        {shownFields.map((f) => (
                          <td key={f.key} className="max-w-[180px] truncate px-3 py-2 text-stone-800">
                            {(r as any)[f.key] || <span className="text-stone-300">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-5 py-3 text-[11px] text-stone-400">
                New leads and active jobs go to the top of your board; their original date is kept in the notes. Past
                customers keep their date. Notes go on the card&rsquo;s request details. Amounts and payments aren&rsquo;t
                imported.
              </p>
            </section>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={reset}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              onClick={doImport}
              disabled={!canImport}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {importing && <Loader2 className="h-4 w-4 animate-spin" />}
              {importing ? 'Importing…' : `Import ${rows.length.toLocaleString()} as ${TYPE_LABEL[type].toLowerCase()}`}
            </button>
          </div>
        </>
      )}

      {/* ── History ── */}
      {history.length > 0 && (
        <section>
          <p className="mb-2 text-xs font-semibold text-stone-500">Recent imports</p>
          <div className="divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-stone-900">{h.file_name}</p>
                  <p className="text-xs text-stone-500">
                    {TYPE_LABEL[h.import_type] || h.import_type} · {h.imported_count} imported
                    {h.skipped_count ? `, ${h.skipped_count} skipped` : ''} · {fmtDay(h.created_at)}
                    {h.created_by_name ? ` · ${h.created_by_name}` : ''}
                  </p>
                </div>
                {h.undone_at ? (
                  <span className="shrink-0 text-xs font-semibold text-stone-400">Undone {fmtDay(h.undone_at)}</span>
                ) : h.imported_count > 0 ? (
                  <button
                    onClick={() => undo(h.id, h.imported_count)}
                    disabled={undoing === h.id}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                  >
                    {undoing === h.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Undo2 className="h-3.5 w-3.5" />}
                    Undo
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}