// app/contractor-software/[city]/[service]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, QrCode, Inbox, CreditCard, Smartphone, UserPlus, FileText, Sunrise } from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider } from '@/components/marketing/marketingUI';
import { cities, INDEXED_CITIES, SERVICES } from '@/lib/cities';
import { serviceDetails } from '@/lib/serviceDetails';

/* ─────────────────────────────────────────────────────────
   City × service SEO pages. Every claim matches lib/permissions.ts
   and the app today. No invented interviews, no "2 minutes",
   no "6 AM", no trial length.
   ───────────────────────────────────────────────────────── */

// ─── STATIC PARAMS ───



export async function generateStaticParams() {
  const params: { city: string; service: string }[] = [];
  for (const city of cities) {
    for (const service of SERVICES) {
      params.push({ city, service });
    }
  }
  return params;
}

// ─── HELPERS ───

const STATE_CODES = new Set([
  'dc', 'nj', 'ct', 'pa', 'ma', 'ca', 'tx', 'fl', 'il', 'oh', 'ga', 'nc', 'va', 'md', 'mi', 'az', 'co', 'wa',
  'or', 'nv', 'tn', 'mn', 'wi', 'in', 'mo', 'sc', 'al', 'la', 'ky', 'ok', 'ia', 'ks', 'ne', 'ar', 'ms', 'ut',
  'nm', 'id', 'mt', 'wy', 'nd', 'sd', 'wv', 'nh', 'vt', 'me', 'ri', 'de',
]);

function formatCity(slug: string) {
  return slug
    .split('-')
    .map((word) => {
      if (STATE_CODES.has(word)) return word.toUpperCase();
      if (word === 'st') return 'St.';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

const SERVICE_NAMES: Record<string, string> = {
  hvac: 'HVAC',
  gutters: 'Gutter',
};

function formatService(slug: string) {
  return (
    SERVICE_NAMES[slug] ||
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

// ─── METADATA ───

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}): Promise<Metadata> {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = formatCity(citySlug);
  const service = formatService(serviceSlug);
  const url = `https://lead2project.com/contractor-software/${citySlug}/${serviceSlug}`;

  return {
    title: `${service} Software for ${city} Contractors | Lead2Project`,
    description: `${city} ${service.toLowerCase()} contractors: a booking link and QR code for job requests, one board for every lead, plus quotes, deposits and card payments. Free plan available.`,
    alternates: { canonical: url },
    robots: INDEXED_CITIES.has(citySlug) ? undefined : { index: false, follow: true },
    openGraph: {
      title: `${service} Job Management in ${city} | Lead2Project`,
      description: `Stop losing ${service.toLowerCase()} leads in ${city}. One booking link, one board, and deposits collected before you start.`,
      url,
      siteName: 'Lead2Project',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service} Software for ${city} Contractors | Lead2Project`,
      description: `${city} ${service.toLowerCase()} pros: one booking link, one board, quotes and payments in one place.`,
    },
  };
}

// ─── STYLE ───

const D = 'font-[family-name:var(--font-display)]';
const H2 = `${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`;
const BODY = 'text-base sm:text-lg text-[#3a3f45] leading-relaxed';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-7 py-3 shadow-sm transition-colors ' +
  D +
  ' text-base font-bold uppercase tracking-wider';

function PlanTag({ plan }: { plan: 'Pro' | 'Pro' }) {
  return (
    <span
      className={`ml-1.5 rounded px-1.5 py-0.5 ${D} text-[10px] font-bold uppercase tracking-wider align-middle ${
        plan === 'Pro' ? 'bg-[#1C1F23] text-[#5EC4C9]' : 'bg-[#00828A]/10 text-[#00828A]'
      }`}
    >
      {plan}
    </span>
  );
}

// ─── PAGE ───

export default async function CityServicePage({
  params,
}: {
  params: Promise<{ city: string; service: string }>;
}) {
  const { city: citySlug, service: serviceSlug } = await params;
  const city = formatCity(citySlug);
  const service = formatService(serviceSlug);
  const s = service.toLowerCase();
  const detail = serviceDetails[serviceSlug] || serviceDetails.hvac;
  const jobs: string[] = detail.jobs;

  const steps = [
    {
      icon: QrCode,
      title: 'Share your link',
      desc: `Every account gets a booking link and a QR code. Put it on your truck, yard signs, cards and your Google profile.`,
    },
    {
      icon: Inbox,
      title: 'Leads land on your board',
      desc: `Customers in ${city} send their ${s} job through your form. Got a call instead? Add the lead yourself.`,
    },
    {
      icon: CreditCard,
      title: 'Quote it and get paid',
      desc: 'Send the quote, collect a deposit before you start, and invoice the balance when the job is done.',
    },
  ];

  const features: { icon: typeof QrCode; title: string; desc: string; plan?: 'Pro' }[] = [
    {
      icon: Smartphone,
      title: 'Customers book you directly',
      desc: `No app to download. They scan your QR code or tap your link and describe the ${s} job they need done.`,
    },
    {
      icon: UserPlus,
      title: 'Add leads yourself',
      desc: 'A neighbor flags you down or a buddy sends a number. Add it to your board so you don’t forget to call back.',
    },
    {
      icon: FileText,
      title: 'Quotes from saved services',
      desc: 'Save your services and prices once, then build each quote in a few taps. The deposit is already on it.',
      plan: 'Pro',
    },
    {
      icon: CreditCard,
      title: 'Deposits and card payments',
      desc: 'Customers pay the deposit and the balance by card through Stripe, and you see what’s paid on every job.',
      plan: 'Pro',
    },
  ];

  const faqs = [
    {
      q: 'I already have a system that works. Why switch?',
      a: 'If your system is texts, calls and notes on your phone, it works until it doesn’t. One missed callback is one lost job. Lead2Project doesn’t change how leads come in. It gives you one place to see all of them.',
    },
    {
      q: 'I’m not great with technology. Is this complicated?',
      a: 'If you can use your phone, you can use Lead2Project. Sign up, add your business name, and your booking link and QR code are ready to share.',
    },
    {
      q: 'What if my customers aren’t tech-savvy?',
      a: 'Your booking form is a simple web page with no app to download. They scan your QR code, fill it in and hit submit. If they’d rather call, add the lead yourself.',
    },
    {
      q: 'How much does it cost?',
      a: 'The Free plan covers your booking link, QR code and job board. Pro is $49.99 a month and adds everything else: quotes your customers accept online, deposits, invoices, card payments, scheduling emails, your email history and the daily digest. No setup fees, cancel anytime.',
    },
    {
      q: 'I tried Jobber and Housecall Pro but they were too much.',
      a: 'Those tools are built for bigger operations with dispatchers. Lead2Project is built for solo contractors and small crews who need to capture leads, send quotes and get paid without a lot of setup.',
    },
  ];

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
          <Eyebrow>
            {service} software for {city}
          </Eyebrow>
          <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
            Stop losing {s} leads in {city}.
          </h1>
          <p className={`mt-5 max-w-2xl mx-auto ${BODY}`}>
            Leads come in from texts, calls, Facebook and word of mouth, and some of them get lost. Lead2Project gives you
            one booking link and one board, so every job request lands in the same place.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className={`w-full sm:w-auto ${BTN}`}>
              Start free
            </Link>
            <Link
              href="/"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 hover:bg-slate-50 transition-colors ${D} text-base font-bold uppercase tracking-wider`}
            >
              See how it works <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm font-semibold text-[#3a3f45]">Free plan available · Cancel anytime</p>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <Eyebrow>Sound familiar?</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>The napkin always gets lost.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className={`${D} text-2xl font-bold uppercase`}>How leads come in now</h3>
              <p className="mt-3 text-[15px] text-[#3a3f45] leading-relaxed">
                A homeowner texts you from a referral. Someone messages you on Facebook. A customer calls while you&rsquo;re on
                a job. You tell yourself you&rsquo;ll call back later, and by the time you remember, they&rsquo;ve hired
                someone else.
              </p>
            </div>
            <div className="rounded-lg border border-[#00828A]/30 bg-[#00828A]/[0.04] p-6 shadow-sm">
              <h3 className={`${D} text-2xl font-bold uppercase`}>What you actually need</h3>
              <p className="mt-3 text-[15px] text-[#3a3f45] leading-relaxed">
                One place where every lead lands. A link on your truck and your cards. Customers say what they need, it shows
                up on your board, and you quote it from your phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TapeDivider />

      {/* ── How it works ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <Eyebrow>How it works</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>
              How Lead2Project works for {city} {s} contractors
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between bg-[#1C1F23] px-4 py-2 text-white">
                    <span className={`${D} text-sm font-bold uppercase tracking-[0.14em]`}>Step</span>
                    <span className={`${D} text-xl font-extrabold text-[#5EC4C9]`}>#{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <div className="border-b border-dashed border-slate-300" />
                  <div className="p-5 sm:p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00828A] text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className={`mt-4 ${D} text-2xl font-bold uppercase leading-tight`}>{step.title}</h3>
                    <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Service specific ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Eyebrow>Built for {s}</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Built for {s} contractors.</h2>
            <p className={`mt-4 ${BODY}`}>
              Whether it&rsquo;s {jobs.slice(0, 3).join(', ')} or {jobs[jobs.length - 1]}, you know the pain of {detail.pain}.
              Lead2Project keeps every job in one place.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, desc, plan }) => (
              <div key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#00828A] text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className={`mt-4 ${D} text-2xl font-bold uppercase leading-tight`}>
                  {title}
                  {plan && <PlanTag plan={plan} />}
                </h3>
                <p className="mt-2 text-[15px] text-[#3a3f45] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Daily digest ── */}
      <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow dark>Daily digest</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>
              Your day, before you leave the house.
              <PlanTag plan="Pro" />
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              Turn it on and you get one email every morning with what needs you today.
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Today’s jobs and who’s on them',
              'Leads that have gone quiet',
              'Quotes still waiting on an answer',
              'Overdue payments and what’s due this week',
              'Deposits paid with a balance still owed',
              'Follow-ups you set for today',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <Sunrise className="h-4 w-4 shrink-0 text-[#5EC4C9]" />
                <span className="text-[15px] font-semibold text-slate-200">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>
              Questions {city} {s} contractors ask
            </h2>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <h3 className="flex items-start gap-2.5 text-lg font-bold">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[#00828A]" strokeWidth={3} />
                  {f.q}
                </h3>
                <p className="mt-2 pl-[26px] text-[15px] text-[#3a3f45] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#00828A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`${D} text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.92]`}>
            Stop letting {s} leads slip.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">
            Get your booking link and QR code and start catching every lead in {city}.
          </p>
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