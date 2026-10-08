'use client';

import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';

// Same math as the app (lib/billing.ts): the deposit is taken from the
// tax-inclusive job total, rounded to cents, and never more than the total.

const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number.isFinite(n) ? n : 0);

const round2 = (n: number) => Math.round(n * 100) / 100;

// Digits and one dot, max 2 decimals ("$1,0a0.555" → "1000.55").
function cleanMoney(v: string): string {
  let s = v.replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '').slice(0, 2);
  return s.slice(0, 12);
}

// Up to 3 decimals for tax rates like 8.625.
function cleanRate(v: string): string {
  let s = v.replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, '').slice(0, 3);
  return s.slice(0, 7);
}

const QUICK_PERCENTS = [10, 25, 33, 50];

export default function DepositCalculator() {
  const [price, setPrice] = useState('5000');
  const [taxRate, setTaxRate] = useState('');
  const [mode, setMode] = useState<'percent' | 'fixed'>('percent');
  const [percent, setPercent] = useState('30');
  const [fixed, setFixed] = useState('1000');
  const [copied, setCopied] = useState(false);

  const r = useMemo(() => {
    const subtotal = Math.max(parseFloat(price) || 0, 0);
    const rate = Math.min(Math.max(parseFloat(taxRate) || 0, 0), 100);
    const tax = round2((subtotal * rate) / 100);
    const total = round2(subtotal + tax);
    const pct = Math.min(Math.max(parseFloat(percent) || 0, 0), 100);
    const flat = Math.max(parseFloat(fixed) || 0, 0);
    const deposit = total > 0 ? Math.min(round2(mode === 'percent' ? (total * pct) / 100 : flat), total) : 0;
    const balance = round2(total - deposit);
    const depositPct = total > 0 ? (deposit / total) * 100 : 0;
    return { subtotal, rate, tax, total, deposit, balance, depositPct, pct };
  }, [price, taxRate, mode, percent, fixed]);

  const pctLabel = (n: number) => `${Math.round(n * 10) / 10}%`;

  const shareText =
    `Deposit to get started: ${money(r.deposit)} (${pctLabel(r.depositPct)} of the job).\n` +
    `Balance on completion: ${money(r.balance)}.\n` +
    `Job total: ${money(r.total)}${r.tax > 0 ? ` (includes ${money(r.tax)} sales tax)` : ''}.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: nothing to do, the text is on screen
    }
  };

  const inputWrap =
    'flex items-center rounded-md border border-[#1C1F23]/20 bg-white focus-within:border-[#00828A] focus-within:ring-2 focus-within:ring-[#00828A]/20 transition';
  const inputCls = 'w-full bg-transparent px-3 py-3 text-lg font-semibold tabular-nums outline-none';
  const labelCls = 'block text-sm font-bold text-[#1C1F23] mb-1.5';

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      {/* Inputs */}
      <div className="rounded-lg border border-[#1C1F23]/15 bg-white p-5 sm:p-7 shadow-sm">
        <div className="space-y-5">
          <div>
            <label htmlFor="price" className={labelCls}>
              Job price <span className="font-normal text-[#5a6067]">(before tax)</span>
            </label>
            <div className={inputWrap}>
              <span className="pl-3 text-lg font-semibold text-[#5a6067]">$</span>
              <input
                id="price"
                inputMode="decimal"
                autoComplete="off"
                value={price}
                onChange={(e) => setPrice(cleanMoney(e.target.value))}
                placeholder="5000"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="tax" className={labelCls}>
              Sales tax rate <span className="font-normal text-[#5a6067]">(optional)</span>
            </label>
            <div className={inputWrap}>
              <input
                id="tax"
                inputMode="decimal"
                autoComplete="off"
                value={taxRate}
                onChange={(e) => setTaxRate(cleanRate(e.target.value))}
                placeholder="0"
                className={inputCls}
              />
              <span className="pr-3 text-lg font-semibold text-[#5a6067]">%</span>
            </div>
            <p className="mt-1.5 text-xs text-[#5a6067]">Only if you charge sales tax on this job. Leave blank if not.</p>
          </div>

          <div>
            <span className={labelCls}>Deposit</span>
            <div className="mb-2 inline-flex rounded-md border border-[#1C1F23]/20 bg-[#F4EFE6] p-1" role="tablist" aria-label="Deposit type">
              {(['percent', 'fixed'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => setMode(m)}
                  className={`rounded px-4 py-1.5 text-sm font-bold transition ${
                    mode === m ? 'bg-[#1C1F23] text-white' : 'text-[#3a3f45] hover:text-[#1C1F23]'
                  }`}
                >
                  {m === 'percent' ? 'Percent' : 'Flat amount'}
                </button>
              ))}
            </div>

            {mode === 'percent' ? (
              <>
                <div className={inputWrap}>
                  <input
                    id="percent"
                    aria-label="Deposit percent"
                    inputMode="decimal"
                    autoComplete="off"
                    value={percent}
                    onChange={(e) => {
                      const v = cleanRate(e.target.value);
                      setPercent(parseFloat(v) > 100 ? '100' : v);
                    }}
                    placeholder="30"
                    className={inputCls}
                  />
                  <span className="pr-3 text-lg font-semibold text-[#5a6067]">%</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {QUICK_PERCENTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPercent(String(p))}
                      className={`rounded-md border px-3 py-1.5 text-sm font-bold transition ${
                        parseFloat(percent) === p
                          ? 'border-[#1C1F23] bg-[#1C1F23] text-white'
                          : 'border-[#1C1F23]/20 bg-white text-[#3a3f45] hover:border-[#1C1F23]/40'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className={inputWrap}>
                <span className="pl-3 text-lg font-semibold text-[#5a6067]">$</span>
                <input
                  id="fixed"
                  aria-label="Deposit amount"
                  inputMode="decimal"
                  autoComplete="off"
                  value={fixed}
                  onChange={(e) => setFixed(cleanMoney(e.target.value))}
                  placeholder="1000"
                  className={inputCls}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col rounded-lg bg-[#1C1F23] p-5 sm:p-7 text-white shadow-lg" aria-live="polite">
        <p className="font-[family-name:var(--font-display)] text-sm font-bold uppercase tracking-[0.16em] text-[#5EC4C9]">
          Deposit to get started
        </p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-5xl sm:text-6xl font-extrabold tabular-nums tracking-tight">
          {money(r.deposit)}
        </p>
        <p className="mt-1 text-sm text-white/60">{pctLabel(r.depositPct)} of the job total</p>

        <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
          <div className="flex justify-between py-2.5">
            <dt className="text-white/60">Job price</dt>
            <dd className="font-semibold tabular-nums">{money(r.subtotal)}</dd>
          </div>
          {r.tax > 0 && (
            <div className="flex justify-between py-2.5">
              <dt className="text-white/60">Sales tax ({pctLabel(r.rate)})</dt>
              <dd className="font-semibold tabular-nums">{money(r.tax)}</dd>
            </div>
          )}
          <div className="flex justify-between py-2.5">
            <dt className="text-white/80 font-semibold">Job total</dt>
            <dd className="font-bold tabular-nums">{money(r.total)}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-white/60">Deposit</dt>
            <dd className="font-semibold tabular-nums">− {money(r.deposit)}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-white/80 font-semibold">Balance on completion</dt>
            <dd className="font-bold tabular-nums">{money(r.balance)}</dd>
          </div>
        </dl>

        {mode === 'fixed' && r.total > 0 && (parseFloat(fixed) || 0) > r.total && (
          <p className="mt-3 text-xs text-amber-300">The flat amount is more than the job total, so the deposit is capped at the total.</p>
        )}

        <div className="mt-5 rounded-md bg-white/5 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-white/50">Text for your customer</p>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-white/10"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/85">{shareText}</p>
        </div>
      </div>
    </div>
  );
}