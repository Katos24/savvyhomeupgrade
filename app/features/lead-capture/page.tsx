import Link from 'next/link';
import {
  ArrowRight,
  Check,
  QrCode,
  Link2,
  LayoutDashboard,
  Smartphone,
  MapPin,
  Wrench,
  Camera,
  FileText,
  CalendarDays,
  HelpCircle,
  Clock,
  Star,
  Mail,
} from 'lucide-react';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow, TapeDivider, TradesStrip } from '@/components/marketing/marketingUI';
import LeadFormDemo from '@/components/marketing/LeadFormDemo';

/* ─────────────────────────────────────────────────────────
   /features/lead-capture
   SEO: contractor booking form, QR code for contractors,
        lead intake for roofers / plumbers / HVAC
   Every claim below matches lib/permissions.ts and the app today.
   ───────────────────────────────────────────────────────── */

export const metadata = {
  title: 'Booking Form & QR Code for Contractors | Lead2Project',
  description:
    'Your own booking link and QR code. Customers request a quote from your truck, yard sign or Google profile, and it lands in your dashboard.',
};

const D = 'font-[family-name:var(--font-display)]';
const H2 = `${D} text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-[0.95]`;
const BODY = 'text-base sm:text-lg text-[#3a3f45] leading-relaxed';
const BTN =
  'inline-flex items-center justify-center gap-2 rounded-md bg-[#00828A] hover:bg-[#006e75] text-white px-7 py-3 shadow-sm transition-colors ' +
  D +
  ' text-base font-bold uppercase tracking-wider';

function PlanTag({ plan }: { plan: 'Pro' | 'Pro' }) {
  return (
    <span className={`ml-1.5 rounded bg-[#1C1F23] px-1.5 py-0.5 ${D} text-[10px] font-bold uppercase tracking-wider text-[#5EC4C9]`}>
      {plan}
    </span>
  );
}

function Bullets({ items }: { items: { text: string; plan?: 'Pro' }[] }) {
  return (
    <ul className="mt-6 space-y-2.5">
      {items.map((i) => (
        <li key={i.text} className="flex items-start gap-2.5 text-[15px] font-medium text-[#1C1F23]">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00828A]" strokeWidth={3} />
          <span>
            {i.text}
            {i.plan && <PlanTag plan={i.plan} />}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* Decorative QR-style pattern (not scannable). */
function FakeQR({ className = '' }: { className?: string }) {
  const n = 21;
  const cells: boolean[] = [];
  let seed = 11;
  for (let i = 0; i < n * n; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.52);
  }
  const finder = (r: number, c: number) => {
    const at = (r0: number, c0: number) => {
      const rr = r - r0;
      const cc = c - c0;
      if (rr < 0 || rr > 6 || cc < 0 || cc > 6) return null;
      return rr === 0 || rr === 6 || cc === 0 || cc === 6 || (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4);
    };
    return at(0, 0) ?? at(0, n - 7) ?? at(n - 7, 0);
  };
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className={className} shapeRendering="crispEdges" aria-hidden>
      <rect width={n} height={n} fill="#fff" />
      {Array.from({ length: n * n }).map((_, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        const f = finder(r, c);
        const on = f === null ? cells[i] : f;
        return on ? <rect key={i} x={c} y={r} width={1} height={1} fill="#1C1F23" /> : null;
      })}
    </svg>
  );
}

/* ── Mock: QR code on a truck door / yard sign ── */
function QrSignMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-lg" aria-hidden>
      <div className="rounded-md bg-[#1C1F23] p-6 text-center text-white">
        <p className={`${D} text-2xl sm:text-3xl font-extrabold uppercase tracking-wide`}>Summit Roofing</p>
        <p className="mt-1 text-sm text-slate-300">Repairs · Replacements · Gutters</p>
        <div className="mx-auto mt-5 w-36 rounded-md bg-white p-2.5">
          <FakeQR className="h-full w-full" />
        </div>
        <p className={`mt-4 ${D} text-xl font-bold uppercase tracking-wider text-[#5EC4C9]`}>Scan for a free quote</p>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">Example yard sign. Print the same code anywhere.</p>
    </div>
  );
}

/* ── Mock: your link and QR code, ready to share ── */
function LinkCardMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-lg" aria-hidden>
      <p className="text-sm font-bold">Your booking link</p>
      <div className="mt-2 flex items-center gap-2">
        <div className="min-w-0 flex-1 truncate rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          Your link, ready to paste anywhere
        </div>
        <span className="shrink-0 rounded-md bg-[#00828A] px-3 py-2.5 text-sm font-bold text-white">Copy</span>
      </div>
      <div className="mt-5 flex items-center gap-4 rounded-md border border-slate-200 bg-[#FBF8F2] p-4">
        <div className="w-24 shrink-0 rounded bg-white p-1.5 shadow-sm">
          <FakeQR className="h-full w-full" />
        </div>
        <div>
          <p className="text-sm font-bold">Your QR code</p>
          <p className="mt-0.5 text-xs text-slate-500">Opens your booking form when scanned.</p>
          <span className="mt-2 inline-block rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold">Download</span>
        </div>
      </div>
    </div>
  );
}

/* ── Mock: Google Business Profile with a booking button ── */
function GoogleProfileMock() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 shadow-lg" aria-hidden>
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-slate-100 text-sm font-bold text-slate-600">SR</div>
        <div>
          <p className="text-sm font-bold">Summit Roofing</p>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1 text-[11px] text-slate-500">Roofing contractor · Holbrook, NY</span>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-600">
        <div className="rounded-md border border-slate-200 py-2">Call</div>
        <div className="rounded-md border border-slate-200 py-2">Directions</div>
        <div className="rounded-md bg-[#00828A] py-2 text-white">Book online</div>
      </div>
      <p className="mt-3 text-xs text-slate-500">&ldquo;Book online&rdquo; opens your Lead2Project booking form.</p>
    </div>
  );
}

const STEPS = [
  { icon: QrCode, title: 'Share your link', desc: 'You get your own booking link and QR code. Put them on your truck, yard signs, business cards and Google profile.' },
  { icon: Smartphone, title: 'Customer fills it out', desc: 'They scan or tap, and fill out your form: what they need, where, and when, with photos if you turn them on.' },
  { icon: LayoutDashboard, title: 'It lands on your board', desc: 'The request shows up in your dashboard with every detail, and you get an email alert. No retyping, no lost paper.' },
];

const ARRIVES = [
  { icon: Smartphone, label: 'Name, phone and email' },
  { icon: Wrench, label: 'Service they need' },
  { icon: FileText, label: 'Job description' },
  { icon: MapPin, label: 'Job address' },
  { icon: Camera, label: 'Photos and videos' },
  { icon: CalendarDays, label: 'Preferred date and time' },
  { icon: HelpCircle, label: 'Your custom questions' },
  { icon: Clock, label: 'When they submitted' },
  { icon: Mail, label: 'An email alert to you' },
];

export default function LeadCapturePage() {
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
            <Eyebrow>Lead capture</Eyebrow>
            <h1 className={`mt-4 ${D} text-5xl sm:text-6xl lg:text-[64px] font-extrabold uppercase leading-[0.9] tracking-tight`}>
              Turn your truck into a quote request.
            </h1>
            <p className={`mt-5 ${BODY}`}>
              People see your truck and your yard signs every day, then forget the number. Give them a QR code and a
              booking link, and the request comes straight to you, even while you&rsquo;re on a job.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
              <Link href="/signup" className={`w-full sm:w-auto ${BTN}`}>
                Get your link free
              </Link>
              <Link
                href="/#how-it-works"
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-6 py-3 hover:bg-slate-50 transition-colors ${D} text-base font-bold uppercase tracking-wider`}
              >
                How it works <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-4 text-sm font-semibold text-[#3a3f45]">Booking link and QR code are on the free plan.</p>
          </div>
          <QrSignMock />
        </div>
      </section>

      <TradesStrip />

      {/* ── How it works ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-10 sm:mb-14 text-center sm:text-left">
            <Eyebrow>How it works</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Three steps. Nothing to chase.</h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm">
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

      <TapeDivider />

      {/* ── Custom form ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>Your form</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Your brand. Your questions.</h2>
            <p className={`mt-4 ${BODY}`}>
              The free form asks for name, email, phone and a description. Upgrade and make it yours: your logo and
              colors, the fields you need, and photos of the job before you ever pick up the phone.
            </p>
            <Bullets
              items={[
                { text: 'Name, email, phone and description' },
                { text: 'Your logo and brand colors', plan: 'Pro' },
                { text: 'Your services, so you know what they need', plan: 'Pro' },
                { text: 'Address, preferred date and time fields', plan: 'Pro' },
                { text: 'Customer photo and video uploads', plan: 'Pro' },
                { text: 'Your own questions, per service', plan: 'Pro' },
              ]}
            />
          </div>
          <div className="lg:order-first">
            <LeadFormDemo />
          </div>
        </div>
      </section>

      {/* ── QR code ── */}
      <section className="bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Eyebrow>QR code</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>One code. Everywhere you work.</h2>
            <p className={`mt-4 ${BODY}`}>
              Your QR code opens your booking form. Print it once and put it everywhere people see your work.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              {['Truck doors', 'Yard signs', 'Business cards', 'Invoices', 'Door hangers', 'Your Instagram bio'].map((place) => (
                <div key={place} className="flex items-center gap-2 rounded-md border border-slate-200 bg-[#FBF8F2] px-3 py-2.5">
                  <Link2 className="h-3.5 w-3.5 shrink-0 text-[#00828A]" />
                  <span className="text-sm font-semibold">{place}</span>
                </div>
              ))}
            </div>
          </div>
          <LinkCardMock />
        </div>
      </section>

      {/* ── Google Business Profile ── */}
      <section className="bg-[#F4EFE6] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1 w-full max-w-md mx-auto">
            <GoogleProfileMock />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Google profile</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Get requests straight from Google.</h2>
            <p className={`mt-4 ${BODY}`}>
              Add your booking link to your Google Business Profile. People searching for your trade nearby can request a
              quote right there, with no phone tag.
            </p>
            <Bullets
              items={[
                { text: 'Paste your link as the booking button on your profile' },
                { text: 'Works from Google Search and Google Maps' },
                { text: 'Same form and questions as everywhere else' },
                { text: 'Requests land on your board like any other' },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── What arrives ── */}
      <section className="bg-[#1C1F23] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-10 sm:mb-12">
            <Eyebrow dark>Every request</Eyebrow>
            <h2 className={`mt-3 ${H2}`}>Arrives ready to quote.</h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
              No calling back to ask what they need. Everything you set up on your form shows up on the job.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ARRIVES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3.5">
                <Icon className="h-4 w-4 shrink-0 text-[#5EC4C9]" />
                <span className="text-[15px] font-semibold text-slate-200">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-slate-400">Fields you don&rsquo;t turn on are simply left off the form.</p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#00828A] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className={`${D} text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[0.92]`}>
            Stop losing jobs to forgotten numbers.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/85">Get your booking link and QR code today. Free.</p>
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