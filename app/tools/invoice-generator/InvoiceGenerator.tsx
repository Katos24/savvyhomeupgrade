'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Printer, ImagePlus, X } from 'lucide-react';
import { Eyebrow } from '@/components/marketing/marketingUI';

/* ─────────────────────────────────────────────────────────
   Free invoice maker for contractors. Everything stays in the
   browser: nothing is sent to our server or saved to the
   database. "Save as PDF" uses the browser's print dialog.
   Your business details are remembered on this device only.
   ───────────────────────────────────────────────────────── */

const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number.isFinite(n) ? n : 0);
const round2 = (n: number) => Math.round(n * 100) / 100;

// Digits and one dot, max 2 decimals.
function cleanMoney(v: string): string {
  let s = v.replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  return s.slice(0, 12);
}
function cleanRate(v: string): string {
  let s = v.replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '').slice(0, 3);
  return s.slice(0, 7);
}

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const addDays = (iso: string, days: number) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};
const fmtDate = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return isNaN(dt.getTime()) ? '' : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

type Item = { id: number; description: string; qty: string; rate: string };
type Kind = 'full' | 'deposit' | 'balance';
const BIZ_KEY = 'l2p-invoice-tool-business';

const DUE_OPTIONS = [
  { label: 'On receipt', days: 0 },
  { label: '7 days', days: 7 },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
];

export default function InvoiceGenerator() {
  // Your business (remembered on this device)
  const [bizName, setBizName] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [logo, setLogo] = useState<string>('');

  // Customer + invoice
  const [custName, setCustName] = useState('');
  const [custContact, setCustContact] = useState('');
  const [jobAddress, setJobAddress] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('INV-001');
  const [issueDate, setIssueDate] = useState(todayIso());
  const [dueDays, setDueDays] = useState(14);

  // Items, tax, deposit
  const [items, setItems] = useState<Item[]>([
    { id: 1, description: 'Labor', qty: '1', rate: '' },
    { id: 2, description: 'Materials', qty: '1', rate: '' },
  ]);
  const [taxRate, setTaxRate] = useState('');
  const [kind, setKind] = useState<Kind>('full');
  const [depMode, setDepMode] = useState<'percent' | 'fixed'>('percent');
  const [depPercent, setDepPercent] = useState('30');
  const [depFixed, setDepFixed] = useState('');
  const [notes, setNotes] = useState('Thank you for your business.');

  // Load / save business details on this device only.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BIZ_KEY);
      if (!raw) return;
      const b = JSON.parse(raw);
      setBizName(b.bizName || '');
      setBizPhone(b.bizPhone || '');
      setBizEmail(b.bizEmail || '');
      setBizAddress(b.bizAddress || '');
      setLogo(b.logo || '');
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(BIZ_KEY, JSON.stringify({ bizName, bizPhone, bizEmail, bizAddress, logo }));
    } catch {}
  }, [bizName, bizPhone, bizEmail, bizAddress, logo]);

  const onLogo = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Please use a logo under 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogo(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const updateItem = (id: number, patch: Partial<Item>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const addItem = () => setItems((prev) => [...prev, { id: Math.max(0, ...prev.map((i) => i.id)) + 1, description: '', qty: '1', rate: '' }]);
  const removeItem = (id: number) => setItems((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));

  const r = useMemo(() => {
    const lines = items.map((i) => {
      const q = Math.max(parseFloat(i.qty) || 0, 0);
      const p = Math.max(parseFloat(i.rate) || 0, 0);
      return { ...i, q, p, amount: round2(q * p) };
    });
    const subtotal = round2(lines.reduce((s, l) => s + l.amount, 0));
    const rate = Math.min(Math.max(parseFloat(taxRate) || 0, 0), 100);
    const tax = round2((subtotal * rate) / 100);
    const total = round2(subtotal + tax);
    const pct = Math.min(Math.max(parseFloat(depPercent) || 0, 0), 100);
    const flat = Math.max(parseFloat(depFixed) || 0, 0);
    const deposit = total > 0 ? Math.min(round2(depMode === 'percent' ? (total * pct) / 100 : flat), total) : 0;
    const balance = round2(total - deposit);
    const due = kind === 'deposit' ? deposit : kind === 'balance' ? balance : total;
    return { lines, subtotal, rate, tax, total, deposit, balance, due };
  }, [items, taxRate, depMode, depPercent, depFixed, kind]);

  const dueDate = dueDays === 0 ? '' : addDays(issueDate, dueDays);
  const title = kind === 'deposit' ? 'Deposit invoice' : kind === 'balance' ? 'Final invoice' : 'Invoice';
  const depLabel = depMode === 'percent' ? `Deposit (${Math.round((parseFloat(depPercent) || 0) * 10) / 10}%)` : 'Deposit';

  const inputWrap =
    'flex items-center rounded-md border border-[#1C1F23]/20 bg-white focus-within:border-[#00828A] focus-within:ring-2 focus-within:ring-[#00828A]/20 transition';
  const inputCls = 'w-full min-w-0 bg-transparent px-3 py-2.5 text-base sm:text-sm font-medium outline-none';
  const labelCls = 'block text-sm font-bold text-[#1C1F23] mb-1.5';
  const card = 'rounded-lg border border-[#1C1F23]/15 bg-white p-5 sm:p-6 shadow-sm';
  const sectionTitle = 'font-[family-name:var(--font-display)] text-xl font-extrabold uppercase tracking-tight mb-4';
  const chipBtn = (on: boolean) =>
    `rounded-md border px-3 py-1.5 text-sm font-bold transition ${
      on ? 'border-[#1C1F23] bg-[#1C1F23] text-white' : 'border-[#1C1F23]/20 bg-white text-[#3a3f45] hover:border-[#1C1F23]/40'
    }`;

  const field = (label: string, value: string, set: (v: string) => void, placeholder = '', opts: { type?: string; id: string }) => (
    <div>
      <label htmlFor={opts.id} className={labelCls}>
        {label}
      </label>
      <div className={inputWrap}>
        <input
          id={opts.id}
          type={opts.type || 'text'}
          value={value}
          onChange={(e) => set(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Only the invoice prints. */}
      <style>{`
        @media print {
          @page { size: letter; margin: 12mm; }
          html, body { background: #fff !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <header className="pt-28 text-center sm:pt-36 print:hidden">
        <Eyebrow>Free tool</Eyebrow>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-extrabold uppercase leading-[0.9] tracking-tight sm:text-7xl">
          Contractor invoice maker
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#3a3f45] sm:text-lg">
          Make a clean invoice in a couple of minutes, with a deposit and balance if you need them. Save it as a PDF. Free, no sign-up, and nothing
          you type leaves your device.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] print:block">
        {/* ── Form ── */}
        <div className="space-y-5 print:hidden">
          <div className={card}>
            <h2 className={sectionTitle}>Your business</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('Business name', bizName, setBizName, 'Summit Roofing', { id: 'biz' })}
              {field('Phone', bizPhone, setBizPhone, '(555) 555-0123', { id: 'bizphone', type: 'tel' })}
              {field('Email', bizEmail, setBizEmail, 'you@yourbusiness.com', { id: 'bizemail', type: 'email' })}
              {field('Address', bizAddress, setBizAddress, 'Optional', { id: 'bizaddr' })}
            </div>
            <div className="mt-4 flex items-center gap-3">
              {logo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logo} alt="Your logo" className="h-12 w-auto max-w-[140px] rounded border border-[#1C1F23]/10 object-contain p-1" />
                  <button type="button" onClick={() => setLogo('')} className="inline-flex items-center gap-1 text-sm font-semibold text-[#3a3f45] hover:text-[#1C1F23]">
                    <X className="h-4 w-4" /> Remove logo
                  </button>
                </>
              ) : (
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-[#1C1F23]/30 px-3 py-2 text-sm font-semibold text-[#3a3f45] hover:border-[#1C1F23]/60">
                  <ImagePlus className="h-4 w-4" /> Add your logo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
                </label>
              )}
              <span className="text-xs text-[#5a6067]">Remembered on this device only.</span>
            </div>
          </div>

          <div className={card}>
            <h2 className={sectionTitle}>Customer and invoice</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('Customer name', custName, setCustName, 'Maria Lopez', { id: 'cust' })}
              {field('Customer email or phone', custContact, setCustContact, 'Optional', { id: 'custc' })}
              <div className="sm:col-span-2">{field('Job address', jobAddress, setJobAddress, '47 Maple Ave, Levittown, NY', { id: 'jobaddr' })}</div>
              {field('Invoice number', invoiceNo, setInvoiceNo, 'INV-001', { id: 'invno' })}
              {field('Invoice date', issueDate, (v) => setIssueDate(v || todayIso()), '', { id: 'invdate', type: 'date' })}
            </div>
            <div className="mt-4">
              <span className={labelCls}>Due</span>
              <div className="flex flex-wrap gap-1.5">
                {DUE_OPTIONS.map((o) => (
                  <button key={o.label} type="button" onClick={() => setDueDays(o.days)} className={chipBtn(dueDays === o.days)}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className={sectionTitle}>Line items</h2>
            <div className="space-y-3">
              {items.map((i, idx) => (
                <div key={i.id} className="grid grid-cols-[1fr_auto] gap-2 rounded-md border border-[#1C1F23]/10 p-3 sm:grid-cols-[1fr_70px_110px_auto] sm:border-0 sm:p-0">
                  <div className={`${inputWrap} col-span-2 sm:col-span-1`}>
                    <input
                      aria-label={`Item ${idx + 1} description`}
                      value={i.description}
                      onChange={(e) => updateItem(i.id, { description: e.target.value })}
                      placeholder="Description"
                      className={inputCls}
                    />
                  </div>
                  <div className={inputWrap}>
                    <input
                      aria-label={`Item ${idx + 1} quantity`}
                      inputMode="decimal"
                      value={i.qty}
                      onChange={(e) => updateItem(i.id, { qty: cleanRate(e.target.value) })}
                      placeholder="Qty"
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                  <div className={`${inputWrap} sm:order-none`}>
                    <span className="pl-3 text-sm font-semibold text-[#5a6067]">$</span>
                    <input
                      aria-label={`Item ${idx + 1} price`}
                      inputMode="decimal"
                      value={i.rate}
                      onChange={(e) => updateItem(i.id, { rate: cleanMoney(e.target.value) })}
                      placeholder="Price"
                      className={`${inputCls} tabular-nums`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i.id)}
                    disabled={items.length === 1}
                    aria-label={`Remove item ${idx + 1}`}
                    className="flex h-10 w-10 items-center justify-center rounded-md text-[#5a6067] transition hover:bg-[#F4EFE6] hover:text-[#1C1F23] disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#00828A] hover:text-[#006e75]">
              <Plus className="h-4 w-4" /> Add line
            </button>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="tax" className={labelCls}>
                  Sales tax rate <span className="font-normal text-[#5a6067]">(optional)</span>
                </label>
                <div className={inputWrap}>
                  <input id="tax" inputMode="decimal" value={taxRate} onChange={(e) => setTaxRate(cleanRate(e.target.value))} placeholder="0" className={`${inputCls} tabular-nums`} />
                  <span className="pr-3 text-sm font-semibold text-[#5a6067]">%</span>
                </div>
              </div>
            </div>
          </div>

          <div className={card}>
            <h2 className={sectionTitle}>Deposit</h2>
            <span className={labelCls}>What is this invoice for?</span>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setKind('full')} className={chipBtn(kind === 'full')}>
                Full amount
              </button>
              <button type="button" onClick={() => setKind('deposit')} className={chipBtn(kind === 'deposit')}>
                Deposit to start
              </button>
              <button type="button" onClick={() => setKind('balance')} className={chipBtn(kind === 'balance')}>
                Balance after deposit
              </button>
            </div>

            {kind !== 'full' && (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => setDepMode('percent')} className={chipBtn(depMode === 'percent')}>
                    % of total
                  </button>
                  <button type="button" onClick={() => setDepMode('fixed')} className={chipBtn(depMode === 'fixed')}>
                    $ amount
                  </button>
                </div>
                <div className="max-w-[220px]">
                  <div className={inputWrap}>
                    {depMode === 'fixed' && <span className="pl-3 text-sm font-semibold text-[#5a6067]">$</span>}
                    <input
                      aria-label="Deposit"
                      inputMode="decimal"
                      value={depMode === 'percent' ? depPercent : depFixed}
                      onChange={(e) => (depMode === 'percent' ? setDepPercent(cleanRate(e.target.value)) : setDepFixed(cleanMoney(e.target.value)))}
                      placeholder={depMode === 'percent' ? '30' : '1000'}
                      className={`${inputCls} tabular-nums`}
                    />
                    {depMode === 'percent' && <span className="pr-3 text-sm font-semibold text-[#5a6067]">%</span>}
                  </div>
                </div>
                <p className="text-sm text-[#3a3f45]">
                  {kind === 'deposit'
                    ? `The customer pays ${money(r.deposit)} now and ${money(r.balance)} when the job is done.`
                    : `Shows the ${money(r.deposit)} deposit as already paid, with ${money(r.balance)} due.`}
                </p>
              </div>
            )}

            <div className="mt-5">
              <label htmlFor="notes" className={labelCls}>
                Notes or payment terms <span className="font-normal text-[#5a6067]">(optional)</span>
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 600))}
                className="w-full rounded-md border border-[#1C1F23]/20 bg-white px-3 py-2.5 text-base outline-none transition focus:border-[#00828A] focus:ring-2 focus:ring-[#00828A]/20 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* ── Preview (this is what prints) ── */}
        <div className="lg:sticky lg:top-24 lg:self-start print:static">
          <div className="mb-3 flex items-center justify-between gap-3 print:hidden">
            <p className="text-sm font-bold text-[#1C1F23]">Preview</p>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md bg-[#00828A] px-5 py-2.5 font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-colors hover:bg-[#006e75]"
            >
              <Printer className="h-4 w-4" /> Save as PDF
            </button>
          </div>

          <div className="rounded-lg border border-[#1C1F23]/15 bg-white p-6 text-[13px] text-slate-800 shadow-sm sm:p-8 print:rounded-none print:border-0 print:p-0 print:shadow-none">
            {/* Top */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="" className="mb-2 h-12 w-auto max-w-[160px] object-contain" />
                )}
                <p className="text-base font-bold text-slate-900">{bizName || 'Your business name'}</p>
                <div className="text-slate-500">
                  {bizPhone && <p>{bizPhone}</p>}
                  {bizEmail && <p className="break-all">{bizEmail}</p>}
                  {bizAddress && <p>{bizAddress}</p>}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xl font-bold uppercase tracking-wide text-slate-900">{title}</p>
                <p className="text-slate-500">{invoiceNo || 'INV-001'}</p>
                <p className="mt-2 text-slate-500">
                  Date: <span className="text-slate-800">{fmtDate(issueDate)}</span>
                </p>
                <p className="text-slate-500">
                  Due: <span className="text-slate-800">{dueDays === 0 ? 'On receipt' : fmtDate(dueDate)}</span>
                </p>
              </div>
            </div>

            {/* Bill to */}
            <div className="mt-6 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 print:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Bill to</p>
                <p className="font-semibold text-slate-900">{custName || 'Customer name'}</p>
                {custContact && <p className="break-all text-slate-500">{custContact}</p>}
              </div>
              {jobAddress && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Job address</p>
                  <p className="text-slate-800">{jobAddress}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <table className="mt-6 w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-2 font-semibold">Description</th>
                  <th className="w-12 py-2 text-right font-semibold">Qty</th>
                  <th className="w-20 py-2 text-right font-semibold">Price</th>
                  <th className="w-24 py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {r.lines.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 align-top">
                    <td className="py-2 pr-2 text-slate-800">{l.description || <span className="text-slate-300">Item</span>}</td>
                    <td className="py-2 text-right tabular-nums">{l.q}</td>
                    <td className="py-2 text-right tabular-nums">{money(l.p)}</td>
                    <td className="py-2 text-right font-medium tabular-nums text-slate-900">{money(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 ml-auto w-full max-w-[280px] space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="tabular-nums">{money(r.subtotal)}</span>
              </div>
              {r.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Sales tax ({r.rate}%)</span>
                  <span className="tabular-nums">{money(r.tax)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
                <span>Job total</span>
                <span className="tabular-nums">{money(r.total)}</span>
              </div>
              {kind === 'deposit' && (
                <div className="flex justify-between text-slate-500">
                  <span>Balance after the job</span>
                  <span className="tabular-nums">{money(r.balance)}</span>
                </div>
              )}
              {kind === 'balance' && (
                <div className="flex justify-between text-slate-600">
                  <span>{depLabel} paid</span>
                  <span className="tabular-nums">−{money(r.deposit)}</span>
                </div>
              )}
              <div className="mt-2 flex items-baseline justify-between rounded-md bg-slate-900 px-3 py-2 text-white">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {kind === 'deposit' ? `${depLabel} due` : 'Amount due'}
                </span>
                <span className="text-lg font-bold tabular-nums">{money(r.due)}</span>
              </div>
            </div>

            {notes.trim() && (
              <div className="mt-6 border-t border-slate-200 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Notes</p>
                <p className="whitespace-pre-line text-slate-700">{notes}</p>
              </div>
            )}
          </div>

          <p className="mt-3 text-xs text-[#5a6067] print:hidden">
            &ldquo;Save as PDF&rdquo; opens your browser&rsquo;s print window. Choose <strong>Save as PDF</strong> as the printer. On a phone, use Share
            then Print, or Save to Files.
          </p>
        </div>
      </div>

      {/* CTA */}
      <section className="print:hidden">
        <div className="flex flex-col gap-5 rounded-lg bg-[#00828A] p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
              Want customers to pay it online?
            </h2>
            <p className="mt-3 text-white/85">
              Send the same invoice from Lead2Project with a pay button. Customers pay the deposit or balance by card, and the job shows what&rsquo;s paid
              and what&rsquo;s left.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Link
              href="/signup"
              className="rounded-md bg-white px-7 py-3 text-center font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-[#00828A] shadow-sm transition-colors hover:bg-slate-50"
            >
              Start free
            </Link>
            <Link href="/how-it-works" className="text-center text-sm font-semibold text-white/85 underline-offset-4 hover:underline">
              See how it works →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}