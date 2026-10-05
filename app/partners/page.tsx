import Link from 'next/link';
import { ArrowRight, Check, X, FileSpreadsheet, Receipt, Briefcase, LayoutDashboard } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider } from '@/components/marketing/marketingUI';

/* ─────────────────────────────────────────────────────────
   /partners: bookkeeper and CPA partner program.
   Matches the app today: partner codes, partner dashboard with
   referred clients, QuickBooks-format CSV export (Basic), expenses
   per job. Referred clients get the standard 14-day trial.
   ───────────────────────────────────────────────────────── */

export const metadata = {
  title: 'Bookkeeper Partner Program | Lead2Project',
  description:
    'Refer your contractor clients to Lead2Project. They track every job, payment and expense. You get a QuickBooks-format export instead of a shoebox in April.',
};

const D = 'font-[family-name:var(--font-display)]';
const H2 = `${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`;
const BODY = 'text-base sm:text-lg text-[#3a3f45] leading-relaxed';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-7 py-3 shadow-sm transition-colors ' +
  D +
  ' text-base font-bold uppercase tracking-wider';

const PAIN_POINTS = [
  'Chasing receipts every month',
  'Clients with no idea what they spent on each job',
  'A shoebox of paperwork at tax time',
  'No way to see profit job by job',
  'Typing invoices into QuickBooks by hand',
];

const WHAT_CHANGES = [
  {
    icon: Briefcase,
    title: 'Every job in one place',
    desc: 'Quotes, invoices, payments and documents live on the job they belong to, not in a text thread.',
  },
  {
    icon: Receipt,
    title: 'Expenses per job',
    desc: 'Your client logs materials and labor costs on each job as they go, so you can see what each job actually made.',
  },
  {
    icon: FileSpreadsheet,
    title: 'QuickBooks-format export',
    desc: 'A CSV laid out for QuickBooks import: invoice numbers, line items, tax and payment status. CSV export is on the Pro plan.',
  },
  {
    icon: LayoutDashboard,
    title: 'Your partner dashboard',
    desc: 'See every client who signed up with your code and open their records from one login.',
  },
];

const STEPS = [
  { title: 'Get your partner code', desc: 'Create a free partner account. Your code is ready as soon as you sign up.' },
  { title: 'Share it with a client', desc: 'Your client enters the code when they sign up. You both get an email when they connect.' },
  { title: 'They run their jobs in it', desc: 'Leads, quotes, payments and expenses, all tracked as the work happens.' },
  { title: 'You pull clean records', desc: 'Open the client from your dashboard and export what you need, any month.' },
];

const SAMPLE = [
  { inv: 'INV-001', customer: 'John Smith', desc: 'Diagnostic & Trip Fee', type: 'labor', account: 'Services', qty: 1, price: '$109.00', amount: '$109.00', status: 'Paid' },
  { inv: 'INV-001', customer: 'John Smith', desc: 'Dual Run Capacitor', type: 'materials', account: 'Job Supplies', qty: 1, price: '$185.00', amount: '$185.00', status: 'Paid' },
  { inv: 'INV-001', customer: 'John Smith', desc: 'Standard Labor (per hour)', type: 'labor', account: 'Services', qty: 2, price: '$150.00', amount: '$300.00', status: 'Paid' },
  { inv: 'INV-002', customer: 'Sarah Torres', desc: 'Condensing Unit', type: 'materials', account: 'Job Supplies', qty: 1, price: '$4,500.00', amount: '$4,500.00', status: 'Partial' },
  { inv: 'INV-002', customer: 'Sarah Torres', desc: 'System Installation', type: 'labor', account: 'Services', qty: 1, price: '$1,800.00', amount: '$1,800.00', status: 'Partial' },
  { inv: 'INV-002', customer: 'Sarah Torres', desc: 'Permits & Testing Fees', type: 'other', account: 'Review', qty: 1, price: '$450.00', amount: '$450.00', status: 'Partial' },
];

export default function PartnersPage() {
  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen antialiased overflow-x-hidden bg-white text-[#1C1F23]`}>
      <Nav />

      {/* ── Hero ── */}
      <section
        className="bg-[#F4EFE6] pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            'linear-gradient(rgba(28,31,35,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(28,31,35,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <Eyebrow>For bookkeepers &amp; CPAs</Eyebrow>
          <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
            Your contractor clients, finally organized.
          </h1>
          <p className={`mt-5 max-w-2xl mx-auto ${BODY}`}>
            Refer your contractor clients to Lead2Project. They track every job, payment and expense as they go. You get
            records you can actually work with, every month.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/bookkeeper/signup" className={`w-full sm:w-auto ${BTN}`}>
              Become a partner <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/book-demo"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 hover:bg-slate-50 transition-colors ${D} text-base font-bold uppercase tracking-wider`}
            >
              See the product
            </Link>
          </div>
          <p className="mt-4 text-sm font-semibold text-[#3a3f45]">
            Already a partner?{' '}
            <Link href="/bookkeeper/login" className="text-[#00828A] underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>
      </section>

      {/* ── Pain ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow>Sound familiar?</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>It&rsquo;s not their fault. They don&rsquo;t have a system.</h2>
          </div>
          <ul className="space-y-3">
            {PAIN_POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <p className="text-[15px] font-medium">{p}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TapeDivider />

      {/* ── What changes ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-10 text-center sm:text-left">
            <Eyebrow>What changes</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Clean records. Every month.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {WHAT_CHANGES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00828A] text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className={`mt-4 ${D} text-2xl font-bold uppercase leading-tight`}>{title}</h3>
                <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample export ── */}
      <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <Eyebrow dark>The export</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Every line item, ready to import.</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Line items come sorted into labor, materials and other, with a suggested account. Anything unclear is marked
              for your review instead of guessed.
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-white/10 bg-white text-[#1C1F23]">
            <table className="w-full min-w-[760px] text-xs">
              <thead>
                <tr className="bg-slate-100">
                  {['Invoice No.', 'Customer', 'Item', 'Type', 'QBO Account', 'Qty', 'Unit Price', 'Amount', 'Payment'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left font-bold uppercase tracking-wider text-[10px] text-slate-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SAMPLE.map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{r.inv}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.customer}</td>
                    <td className="px-3 py-2.5">{r.desc}</td>
                    <td className="px-3 py-2.5 text-slate-500">{r.type}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {r.account === 'Review' ? (
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700">Review</span>
                      ) : (
                        r.account
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">{r.qty}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.price}</td>
                    <td className="px-3 py-2.5 font-bold whitespace-nowrap">{r.amount}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`rounded px-1.5 py-0.5 font-bold ${
                          r.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">Sample data.</p>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <Eyebrow>How it works</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Simple referral. Real records.</h2>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between bg-[#1C1F23] px-4 py-2 text-white">
                  <span className={`${D} text-sm font-bold uppercase tracking-[0.14em]`}>Step</span>
                  <span className={`${D} text-xl font-extrabold text-[#5EC4C9]`}>#{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="border-b border-dashed border-slate-300" />
                <div className="p-5">
                  <h3 className={`${D} text-xl font-bold uppercase leading-tight`}>{s.title}</h3>
                  <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <ul className="mt-10 flex flex-col sm:flex-row flex-wrap gap-x-8 gap-y-2.5 justify-center">
            {['Free to join', 'No contract', 'Clients get the standard 14-day free trial'].map((t) => (
              <li key={t} className="flex items-center gap-2 text-[15px] font-semibold">
                <Check className="h-4 w-4 text-[#00828A]" strokeWidth={3} /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#00828A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`${D} text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.92]`}>
            Stop chasing receipts.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">Create a free partner account and get your code.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/bookkeeper/signup"
              className={`w-full sm:w-auto rounded-md bg-white text-[#00828A] hover:bg-slate-50 px-8 py-3 shadow-sm transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              Become a partner
            </Link>
            <Link
              href="/bookkeeper/login"
              className={`w-full sm:w-auto rounded-md border border-white/40 text-white hover:bg-white/10 px-6 py-3 transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              Partner log in
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}