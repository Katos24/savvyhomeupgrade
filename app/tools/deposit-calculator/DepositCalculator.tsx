'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, ChevronDown, AlertTriangle, ExternalLink, Info } from 'lucide-react';
import { Eyebrow } from '@/components/marketing/marketingUI';
import { STATES, STATE_LIST, OTHER_STATE, GENERAL, type Source } from './states';

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

function SourceLink({ source, light }: { source: Source; light?: boolean }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-0.5 font-semibold underline-offset-4 hover:underline ${
        light ? 'text-[#5EC4C9]' : 'text-[#00828A]'
      }`}
    >
      {source.label} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

export default function DepositCalculator({ initialState = OTHER_STATE }: { initialState?: string }) {
  const [state, setState] = useState<string>(STATES[initialState] ? initialState : OTHER_STATE);
  const [price, setPrice] = useState('5000');
  const [taxRate, setTaxRate] = useState('');
  const [jobType, setJobType] = useState<'exempt' | 'taxable'>('exempt');
  const [mode, setMode] = useState<'percent' | 'fixed'>('percent');
  const [percent, setPercent] = useState('30');
  const [fixed, setFixed] = useState('1000');
  const [copied, setCopied] = useState(false);

  const info = STATES[state] || null;
  const tax = info?.tax;

  // Keep the browser tab title in step with the chosen state.
  useEffect(() => {
    document.title = info ? info.title : GENERAL.title;
  }, [info]);

  // Change state without reloading (what you typed stays), and update the
  // address so a shared link opens on that state.
  const changeState = (next: string) => {
    setState(next);
    setJobType('exempt');
    const path = next === OTHER_STATE ? '/tools/deposit-calculator' : `/tools/deposit-calculator/${next}`;
    try {
      window.history.replaceState(null, '', path);
    } catch {}
  };

  // Tax rate actually applied, given the state's rules.
  const effectiveRate =
    tax?.kind === 'contractor_pays' ? '0' : tax?.kind === 'by_job_type' && jobType === 'exempt' ? '0' : taxRate;

  const r = useMemo(() => {
    const subtotal = Math.max(parseFloat(price) || 0, 0);
    const rate = Math.min(Math.max(parseFloat(effectiveRate) || 0, 0), 100);
    const taxAmt = round2((subtotal * rate) / 100);
    const total = round2(subtotal + taxAmt);
    const pct = Math.min(Math.max(parseFloat(percent) || 0, 0), 100);
    const flat = Math.max(parseFloat(fixed) || 0, 0);
    const deposit = total > 0 ? Math.min(round2(mode === 'percent' ? (total * pct) / 100 : flat), total) : 0;
    const balance = round2(total - deposit);
    const depositPct = total > 0 ? (deposit / total) * 100 : 0;
    return { subtotal, rate, tax: taxAmt, total, deposit, balance, depositPct, pct };
  }, [price, effectiveRate, mode, percent, fixed]);

  const stateWarning = info?.check ? info.check({ deposit: r.deposit, total: r.total }) : null;

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
      // clipboard blocked: the text is on screen
    }
  };

  const faq = info ? info.faq : GENERAL.faq;

  const inputWrap =
    'flex items-center rounded-md border border-[#1C1F23]/20 bg-white focus-within:border-[#00828A] focus-within:ring-2 focus-within:ring-[#00828A]/20 transition';
  const inputCls = 'w-full bg-transparent px-3 py-3 text-lg font-semibold tabular-nums outline-none';
  const labelCls = 'block text-sm font-bold text-[#1C1F23] mb-1.5';
  const segWrap = 'inline-flex flex-wrap rounded-md border border-[#1C1F23]/20 bg-[#F4EFE6] p-1';
  const segBtn = (on: boolean) =>
    `rounded px-3.5 py-1.5 text-sm font-bold transition ${on ? 'bg-[#1C1F23] text-white' : 'text-[#3a3f45] hover:text-[#1C1F23]'}`;
  const chipBtn = (on: boolean) =>
    `rounded-md border px-3 py-1.5 text-sm font-bold transition ${
      on ? 'border-[#1C1F23] bg-[#1C1F23] text-white' : 'border-[#1C1F23]/20 bg-white text-[#3a3f45] hover:border-[#1C1F23]/40'
    }`;

  const taxInput = (
    <>
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
      {tax?.kind === 'by_job_type' && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tax.presets.map((pr) => (
            <button key={pr.label} type="button" onClick={() => setTaxRate(pr.rate)} className={chipBtn(taxRate === pr.rate)}>
              {pr.label}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-10">
      {/* Header (follows the dropdown) */}
      <header className="pt-28 sm:pt-36 text-center">
        <Eyebrow>Free tool</Eyebrow>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl sm:text-7xl font-extrabold uppercase tracking-tight leading-[0.9]">
          {info ? info.heading : GENERAL.heading}
        </h1>
        <p className="mt-4 mx-auto max-w-xl text-base sm:text-lg text-[#3a3f45]">{info ? info.intro : GENERAL.intro}</p>
      </header>

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Inputs */}
          <div className="rounded-lg border border-[#1C1F23]/15 bg-white p-5 sm:p-7 shadow-sm">
            <div className="space-y-5">
              <div>
                <label htmlFor="state" className={labelCls}>
                  Where is the job?
                </label>
                <div className={`${inputWrap} relative`}>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => changeState(e.target.value)}
                    className="w-full appearance-none bg-transparent px-3 py-3 pr-10 text-lg font-semibold outline-none"
                  >
                    {STATE_LIST.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                    <option value={OTHER_STATE}>Other state</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 h-5 w-5 text-[#5a6067]" />
                </div>
              </div>

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

              {/* Sales tax, by state */}
              <div>
                {tax?.kind === 'by_job_type' ? (
                  <>
                    <span className={labelCls}>What kind of job?</span>
                    <div className={segWrap} role="tablist" aria-label="Job type">
                      <button type="button" role="tab" aria-selected={jobType === 'exempt'} onClick={() => setJobType('exempt')} className={segBtn(jobType === 'exempt')}>
                        {tax.exemptLabel}
                      </button>
                      <button type="button" role="tab" aria-selected={jobType === 'taxable'} onClick={() => setJobType('taxable')} className={segBtn(jobType === 'taxable')}>
                        {tax.taxableLabel}
                      </button>
                    </div>
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-[#3a3f45]">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#5a6067]" />
                      <span>
                        {jobType === 'exempt' ? tax.exemptNote : tax.taxableNote} <SourceLink source={tax.source} />
                      </span>
                    </p>
                    {jobType === 'taxable' && (
                      <div className="mt-3">
                        <label htmlFor="tax" className={labelCls}>
                          Sales tax rate
                        </label>
                        {taxInput}
                      </div>
                    )}
                  </>
                ) : tax?.kind === 'contractor_pays' ? (
                  <>
                    <span className={labelCls}>Sales tax</span>
                    <p className="flex items-start gap-1.5 rounded-md bg-[#F4EFE6] px-3 py-2.5 text-sm text-[#3a3f45]">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#5a6067]" />
                      <span>
                        {tax.note} <SourceLink source={tax.source} />
                      </span>
                    </p>
                  </>
                ) : (
                  <>
                    <label htmlFor="tax" className={labelCls}>
                      Sales tax rate <span className="font-normal text-[#5a6067]">(optional)</span>
                    </label>
                    {taxInput}
                    <p className="mt-1.5 text-xs text-[#5a6067]">
                      Only if you charge sales tax on this job. Rules differ by state and type of work.
                    </p>
                  </>
                )}
              </div>

              <div>
                <span className={labelCls}>Deposit</span>
                <div className={`mb-2 ${segWrap}`} role="tablist" aria-label="Deposit type">
                  {(['percent', 'fixed'] as const).map((m) => (
                    <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={segBtn(mode === m)}>
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
                        <button key={p} type="button" onClick={() => setPercent(String(p))} className={chipBtn(parseFloat(percent) === p)}>
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

            {stateWarning && (
              <p className="mt-3 flex items-start gap-2 rounded-md bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{stateWarning}</span>
              </p>
            )}

            <dl className="mt-6 divide-y divide-white/10 border-y border-white/10 text-sm">
              <div className="flex justify-between py-2.5">
                <dt className="text-white/60">Job price</dt>
                <dd className="font-semibold tabular-nums">{money(r.subtotal)}</dd>
              </div>
              <div className="flex justify-between py-2.5">
                <dt className="text-white/60">Sales tax{r.rate > 0 ? ` (${pctLabel(r.rate)})` : ''}</dt>
                <dd className="font-semibold tabular-nums">{r.tax > 0 ? money(r.tax) : 'None'}</dd>
              </div>
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

        <p className="text-center text-xs text-[#5a6067]">
          Nothing you type is saved or sent anywhere. The deposit is figured on the total including tax, rounded to the cent.
        </p>

        {/* State rules */}
        <div className="rounded-lg border border-[#1C1F23]/15 bg-white p-5 sm:p-7 shadow-sm">
          {info ? (
            <>
              <h2 className="text-lg font-bold text-[#1C1F23]">{info.name} deposit rules to know</h2>
              <ul className="mt-3 space-y-3">
                {info.rules.map((rule, i) => (
                  <li key={i} className="text-base leading-relaxed text-[#3a3f45]">
                    {rule.text} <SourceLink source={rule.source} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-[#1C1F23]">Check your state&rsquo;s rules</h2>
              <p className="mt-2 text-base leading-relaxed text-[#3a3f45]">
                Some states limit how big a deposit can be on home improvement jobs, or control where the money is held.
                Sales tax rules also differ by state and type of work. Check with your state&rsquo;s consumer protection
                office and tax department before you set your deposit.
              </p>
            </>
          )}
          <p className="mt-4 text-sm text-[#5a6067]">
            General information, not legal or tax advice. Rules change and depend on the type of work, so check the
            official source or a professional for your situation.
          </p>
        </div>
      </div>

      {/* FAQ (follows the dropdown) */}
      <section className="mx-auto max-w-3xl">
        <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
          {info ? `${info.name} deposit & tax questions` : 'Common questions'}
        </h2>
        <div className="mt-6 divide-y divide-[#1C1F23]/10 border-y border-[#1C1F23]/10">
          {faq.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-lg font-bold text-[#1C1F23]">
                {item.q}
                <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-[#5a6067] transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-base leading-relaxed text-[#3a3f45]">
                {item.a} {item.source && <SourceLink source={item.source} />}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}