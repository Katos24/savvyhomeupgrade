import Link from 'next/link';
import { ArrowRight, Check, X, QrCode, Bell } from 'lucide-react';
import type { IndustryContent } from '@/lib/industry-content';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import Pricing from '@/components/marketing/Pricing';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';

/* ─────────────────────────────────────────────────────────
   Shared layout for /solutions/[industry]
   Copy comes from lib/industry-content.ts. Pricing reuses the
   home page <Pricing /> so plans stay true to permissions.ts.
   ───────────────────────────────────────────────────────── */

const D = 'font-[family-name:var(--font-display)]';
const H2 = `${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`;
const BODY = 'text-base sm:text-lg text-[#3a3f45] leading-relaxed';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-7 py-3 shadow-sm transition-colors ' +
  D +
  ' text-base font-bold uppercase tracking-wider';

/* ── Mock: the customer's request form ── */
function FormMock({ content }: { content: IndustryContent }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden" aria-hidden>
      <div className="h-1.5 bg-[#00828A]" />
      <div className="p-5">
        <p className="text-[11px] text-slate-400">lead2project.com/your-business</p>
        <p className="mt-0.5 text-base font-bold">New {content.name} request</p>
        <div className="mt-4 space-y-3">
          {content.formFields.map((f) => (
            <div key={f.label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{f.label}</p>
              <div
                className={`mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 ${
                  f.type === 'textarea' ? 'min-h-[56px] leading-relaxed' : ''
                }`}
              >
                {f.placeholder}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md bg-[#00828A] py-2.5 text-center text-xs font-bold text-white">Submit request</div>
      </div>
    </div>
  );
}

/* ── Mock: the card that lands on your board ── */
function NewLeadMock({ content }: { content: IndustryContent }) {
  const first = content.formFields[0]?.placeholder ?? 'New customer';
  const last = content.formFields[content.formFields.length - 1]?.placeholder ?? '';
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg" aria-hidden>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded bg-[#00828A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00828A]">
          <Bell className="h-3 w-3" /> New lead
        </span>
        <span className="text-[10px] text-slate-400">just now</span>
      </div>
      <p className="mt-3 text-sm font-bold">{first}</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        {last.length > 90 ? `${last.slice(0, 90)}…` : last}
      </p>
      <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">{content.name}</div>
    </div>
  );
}

/* ── Mock: confirmation email the customer gets ── */
function ConfirmEmailMock({ content }: { content: IndustryContent }) {
  const e = content.emailPreview;
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden" aria-hidden>
      <div className="h-1.5 bg-[#00828A]" />
      <div className="p-5 sm:p-6">
        <p className="text-xs text-slate-500">From {e.business}</p>
        <p className="mt-0.5 text-base font-bold">{e.subject}</p>
        <div className="mt-3 space-y-2">
          {e.bodyLines.map((l) => (
            <p key={l} className="text-sm text-slate-600 leading-relaxed">
              {l}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function IndustryLandingPage({ content }: { content: IndustryContent }) {
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
          <Eyebrow>{content.badge}</Eyebrow>
          <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
            {content.hero.headline}
          </h1>
          <p className={`mt-5 max-w-2xl mx-auto ${BODY}`}>{content.hero.sub}</p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className={`w-full sm:w-auto ${BTN}`}>
              {content.hero.cta}
            </Link>
            <Link
              href="#how-it-works"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 hover:bg-slate-50 transition-colors ${D} text-base font-bold uppercase tracking-wider`}
            >
              How it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <TradesStrip />

      {/* ── Pain points ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow>Sound familiar?</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>{content.pain.headline}</h2>
          </div>
          <ul className="space-y-3">
            {content.pain.points.map((point) => (
              <li key={point} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <X className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <p className="text-[15px] font-medium">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TapeDivider />

      {/* ── Form → board ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Your booking link</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>They fill it out. It lands on your board.</h2>
            <p className={`mt-4 ${BODY}`}>
              Share your link or QR code. Customers send the details you need, and every request shows up as a new lead,
              ready to quote.
            </p>
            <ul className="mt-6 space-y-2.5">
              {['Booking link and QR code on Free', 'Your own questions and branding on Basic', 'Every request saved, nothing lost in a text thread'].map(
                (t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[15px] font-medium">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00828A]" strokeWidth={3} />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <FormMock content={content} />
            <div className="space-y-4 sm:pt-16">
              <NewLeadMock content={content} />
              <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-hidden>
                <QrCode className="h-8 w-8 text-[#1C1F23]" />
                <p className="text-xs font-semibold text-slate-600">Print the QR code on your truck, yard signs and invoices.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <Eyebrow>How it works</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Three steps.</h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.howItWorks.map((step, i) => (
              <li key={step.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between bg-[#1C1F23] px-4 py-2 text-white">
                  <span className={`${D} text-sm font-bold uppercase tracking-[0.14em]`}>Step</span>
                  <span className={`${D} text-xl font-extrabold text-[#5EC4C9]`}>#{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="border-b border-dashed border-slate-300" />
                <div className="p-5 sm:p-6">
                  <h3 className={`${D} text-2xl font-bold uppercase leading-tight`}>{step.title}</h3>
                  <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <Eyebrow dark>Built for {content.name.toLowerCase()}</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Built for how you work.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {content.features.map((f) => (
              <div key={f.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <h3 className={`${D} text-xl font-bold uppercase leading-tight text-white`}>{f.title}</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Confirmation email ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Customer email</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>They know you got it.</h2>
            <p className={`mt-4 ${BODY}`}>
              When a customer sends a request, they get an email from your business name letting them know you received
              it. No more &ldquo;did my message go through?&rdquo; calls.
            </p>
          </div>
          <div className="w-full max-w-md mx-auto">
            <ConfirmEmailMock content={content} />
          </div>
        </div>
      </section>

      <Pricing />

      {/* ── Final CTA ── */}
      <section className="bg-[#00828A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`${D} text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.92]`}>
            Stop losing jobs to missed calls.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">
            Get your {content.name.toLowerCase()} booking link today. Free to start.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className={`w-full sm:w-auto rounded-md bg-white text-[#00828A] hover:bg-slate-50 px-8 py-3 shadow-sm transition-colors ${D} text-base font-bold uppercase tracking-wider text-center`}
            >
              Get your free booking link
            </Link>
          </div>
          <p className="mt-6 text-sm font-semibold text-white/80">Free plan available · Cancel anytime</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}