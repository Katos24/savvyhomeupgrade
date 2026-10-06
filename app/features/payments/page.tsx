import Link from 'next/link';
import { ArrowRight, Check, CreditCard, Banknote, Receipt, Bell, Send, CalendarClock, RotateCcw, FileText, Hash, QrCode, AlertCircle } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { InvoiceMock } from '@/components/marketing/InvoiceShowcaseSection';
import { JobDemo } from '@/components/marketing/NewHero';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, Stamp, TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';

/* ─────────────────────────────────────────────────────────
   /features/payments
   SEO: contractor invoicing, contractor deposits, accept card payments
        contractor, payment tracking for contractors
   Every claim below matches lib/permissions.ts and the app today.
   ───────────────────────────────────────────────────────── */

export const metadata = {
  title: 'Deposits, Invoices & Card Payments for Contractors | Lead2Project',
  description:
    'Collect the deposit before you buy materials and the balance when the job is done. Card payments through Stripe, cash and check tracked too.',
};

const D = 'font-[family-name:var(--font-display)]';
const H2 = `${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`;
const BODY = 'text-base sm:text-lg text-[#3a3f45] leading-relaxed';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-7 py-3 shadow-sm transition-colors ' +
  D +
  ' text-base font-bold uppercase tracking-wider';

function ProTag() {
  return (
    <span className={`ml-1.5 rounded bg-[#1C1F23] px-1.5 py-0.5 ${D} text-[10px] font-bold uppercase tracking-wider text-[#5EC4C9]`}>
      Pro
    </span>
  );
}

function Bullets({ items }: { items: { text: string; pro?: boolean }[] }) {
  return (
    <ul className="mt-6 space-y-2.5">
      {items.map((i) => (
        <li key={i.text} className="flex items-start gap-2.5 text-[15px] font-medium text-[#1C1F23]">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00828A]" strokeWidth={3} />
          <span>
            {i.text}
            {i.pro && <ProTag />}
          </span>
        </li>
      ))}
    </ul>
  );
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

/* ── Mock: invoice email with pay button ── */
function InvoiceEmailMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden" aria-hidden>
      <div className="h-1.5 bg-[#00828A]" />
      <div className="p-5 sm:p-6">
        <p className="text-xs text-slate-500">From Summit Roofing</p>
        <p className="mt-0.5 text-base font-bold">Invoice INV-041</p>
        <div className="mt-4 rounded-md bg-[#F4F7F6] p-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Balance due</p>
          <p className="mt-0.5 text-2xl font-extrabold">{fmt(7200)}</p>
          <div className="mt-3 rounded-md bg-[#00828A] py-2.5 text-sm font-bold text-white">Pay with card · {fmt(7200)}</div>
          <div className="mt-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700">Download Invoice PDF</div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Hi Mike, thanks for choosing us. Your invoice is attached. You can pay online with the button above.
        </p>
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          Payment due: October 15, 2026
        </div>
      </div>
    </div>
  );
}

/* ── Mock: receipt email ── */
function ReceiptMock() {
  return (
    <div className="relative rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-lg" aria-hidden>
      <Stamp label="Paid in full" className="absolute right-5 top-5 text-lg" />
      <p className="text-xs text-slate-500">From Summit Roofing</p>
      <p className="mt-0.5 text-base font-bold">Paid in full — {fmt(7200)} received</p>
      <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Amount paid</p>
        <p className="text-2xl font-extrabold">{fmt(7200)}</p>
        <p className="mt-1 text-xs font-semibold text-emerald-700">Paid in full — thank you!</p>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
        <FileText className="h-4 w-4 text-[#00828A]" /> Invoice-INV-041-Paid.pdf
      </div>
    </div>
  );
}

export default function PaymentsPage() {
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center sm:text-left">
            <Eyebrow>Payments &amp; invoicing</Eyebrow>
            <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
              Get the deposit before you buy materials.
            </h1>
            <p className={`mt-5 ${BODY}`}>
              Set a deposit on each service. Customers pay it by card, and the final invoice collects the balance when the
              job is done. Cash and checks are tracked too.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
              <Link href="/signup" className={`w-full sm:w-auto ${BTN}`}>
                Start free
              </Link>
              <Link
                href="/pricing"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 hover:bg-slate-50 transition-colors ${D} text-base font-bold uppercase tracking-wider`}
              >
                See pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#3a3f45]">
              Card payments through Stripe · Venmo, Zelle, Cash App and PayPal links · Included on Pro
            </p>
          </div>
          {/* Animated job card: deposit request sent → customer pays on their phone → deposit secured */}
          <div className="w-full">
            <JobDemo />
          </div>
        </div>
      </section>

      <TradesStrip />

      {/* ── Deposits & balances ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Deposits &amp; balances</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Set it once per service. Every job follows it.</h2>
            <p className={`mt-4 ${BODY}`}>
              Give each service a deposit, a percent or a flat amount. Every quote for that service asks for it up front,
              and every job shows exactly what&rsquo;s been paid and what&rsquo;s left.
            </p>
            <Bullets
              items={[
                { text: 'Set the deposit once per service, or one default for every job' },
                { text: 'Deposit and balance tracked as two clear steps' },
                { text: 'Progress bar shows how much is collected' },
                { text: 'Partial payments handled' },
                { text: 'Deposit and tax lock once money comes in, so terms can’t change' },
              ]}
            />
          </div>
          {/* The customer's invoice PDF, mid-job with the deposit paid */}
          <div className="w-full max-w-md mx-auto lg:rotate-[-1.5deg]">
            <InvoiceMock />
          </div>
        </div>
      </section>

      <TapeDivider />

      {/* ── Invoice email ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1 w-full max-w-md mx-auto">
            <InvoiceEmailMock />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Invoices</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>A real invoice. Sent in one click.</h2>
            <p className={`mt-4 ${BODY}`}>
              Send the invoice straight from the job. Your customer gets an email with a pay button and the PDF attached,
              so they can pay right away or save it for later.
            </p>
            <Bullets
              items={[
                { text: 'Your logo and business details on every PDF' },
                { text: 'Invoice numbers added for you (INV-001, INV-002…)' },
                { text: 'Every line item from your quote' },
                { text: 'Pay button in the email, QR code on the PDF' },
                { text: 'Due date shown clearly when you set one' },
                { text: 'Every invoice you send saved in your outbox', pro: true },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── Ways to get paid ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-12 text-center sm:text-left">
            <Eyebrow>Get paid your way</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Card, cash or check. It all adds up.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: CreditCard,
                t: 'Card through Stripe',
                d: 'Connect your own Stripe account once. Card payments update the job the moment they land, and the money goes to your bank.',
              },
              {
                icon: QrCode,
                t: 'Your payment link',
                d: 'Rather use Venmo, Zelle, Cash App or PayPal? Add your link and it goes on the invoice. You confirm the payment when it comes in.',
              },
              {
                icon: Banknote,
                t: 'Cash & check',
                d: 'Mark it paid with the amount, method and date. The balance and progress update right away.',
              },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-lg border border-slate-200 bg-[#FBF8F2] p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00828A] text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className={`mt-4 ${D} text-2xl font-bold uppercase leading-tight`}>{t}</p>
                <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-[#3a3f45]">
            Stripe charges its standard processing fee on card payments. Lead2Project doesn&rsquo;t take a cut.
          </p>
        </div>
      </section>

      {/* ── Receipts & reminders ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Receipts &amp; reminders</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Customers always know where they stand.</h2>
            <p className={`mt-4 ${BODY}`}>
              Every payment, card or cash, sends your customer a receipt with what&rsquo;s left. When the job is paid in
              full, the final invoice PDF goes with it. Still waiting on someone? Send a reminder in one click.
            </p>
            <Bullets
              items={[
                { text: 'Receipt emailed for every payment you record' },
                { text: 'Final invoice PDF attached when paid in full' },
                { text: 'One-click payment reminder with the balance and pay link' },
                { text: 'Overdue jobs flagged so nothing slips' },
                { text: 'Refunds recorded and shown on the job' },
              ]}
            />
          </div>
          <div className="w-full max-w-md mx-auto">
            <ReceiptMock />
          </div>
        </div>
      </section>

      {/* ── Everything ── */}
      <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <Eyebrow dark>All in one place</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Every payment tool lives on the job.</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              No separate invoicing app. No spreadsheet. No chasing people by text.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: CreditCard, label: 'Card payments through Stripe' },
              { icon: Banknote, label: 'Cash, check and payment links' },
              { icon: CalendarClock, label: 'Deposits and balances' },
              { icon: FileText, label: 'Invoice PDFs with your logo' },
              { icon: Hash, label: 'Invoice numbers added for you' },
              { icon: Send, label: 'One-click invoice emails' },
              { icon: Receipt, label: 'Automatic receipts' },
              { icon: Bell, label: 'Payment reminders' },
              { icon: AlertCircle, label: 'Overdue jobs flagged' },
              { icon: RotateCcw, label: 'Refunds tracked' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <Icon className="h-4 w-4 shrink-0 text-[#5EC4C9]" />
                <span className="text-[15px] font-semibold text-slate-200">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#00828A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`${D} text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.92]`}>
            Know exactly who owes you money.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">Set up your services and send your first invoice today.</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className={`w-full sm:w-auto rounded-md bg-white text-[#00828A] hover:bg-slate-50 px-8 py-3 shadow-sm transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              Start free
            </Link>
            <Link
              href="/pricing"
              className={`w-full sm:w-auto rounded-md border border-white/40 text-white hover:bg-white/10 px-6 py-3 transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              See pricing
            </Link>
          </div>
          <p className="mt-6 text-sm font-semibold text-white/80">Free plan available · Cancel anytime</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}