import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Nav from '@/components/marketing/Nav';
import Footer from '@/components/marketing/Footer';
import { fontVars } from '@/components/marketing/marketingTheme';
import { Eyebrow } from '@/components/marketing/marketingUI';

// Demo company whose real booking form is embedded below.
const DEMO_SLUG = 'ridge-line-roofing';
const SITE = 'https://lead2project.com';

export const metadata: Metadata = {
  title: 'Put Your Booking Form on Your Own Website | Lead2Project',
  description:
    'Add your Lead2Project request form right onto your existing website. Customers fill it out without leaving your page, and every request lands on your board.',
  alternates: { canonical: '/features/lead-capture/embed' },
};

const EMBED_CODE = `<iframe src="${SITE}/YOUR-BOOKING-LINK?embed=1" data-l2p-form
  style="width:100%;border:0;min-height:720px" title="Request a quote"></iframe>
<script src="${SITE}/embed.js" async></script>`;

export default function EmbedDemoPage() {
  return (
    <div className={`${fontVars} font-[family-name:var(--font-body)] min-h-screen bg-[#F4EFE6] text-[#1C1F23] antialiased`}>
      <Nav />

      {/* Header */}
      <section className="px-4 pt-28 sm:pt-36 pb-10 text-center">
        <Eyebrow>Lead capture</Eyebrow>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl sm:text-7xl font-extrabold uppercase tracking-tight leading-[0.9]">
          Your form, on your website
        </h1>
        <p className="mt-4 mx-auto max-w-xl text-base sm:text-lg text-[#3a3f45]">
          Keep your own site. Paste two lines and your request form sits right on the page. Customers never leave, and
          every request lands on your board.
        </p>
      </section>

      {/* Mock contractor website with the real form inside */}
      <section className="px-3 sm:px-4 pb-14">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-[#1C1F23]/15 bg-white shadow-2xl">
          {/* Browser bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-3 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            </span>
            <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-500">
              ridgelineroofing.example/request-a-quote
            </span>
          </div>

          {/* Pretend contractor site */}
          <header className="flex items-center justify-between gap-4 bg-[#1f2a37] px-5 py-4 text-white sm:px-8">
            <span className="text-lg font-extrabold tracking-tight">Ridge Line Roofing</span>
            <nav className="hidden gap-6 text-sm text-white/80 sm:flex" aria-hidden>
              <span>Services</span>
              <span>Our work</span>
              <span>Reviews</span>
              <span className="font-semibold text-white">Request a quote</span>
            </nav>
          </header>
          <div className="bg-[#f3f4f6] px-5 py-8 sm:px-8">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Request a free roofing quote</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 sm:text-base">
              Tell us about your project and we&rsquo;ll get back to you.
                          </p>
          </div>

          {/* The real form, embedded exactly like a contractor would */}
          <div className="border-t border-slate-200 bg-white">
            <iframe
              src={`/${DEMO_SLUG}?embed=1&demo=1`}
                            data-l2p-form
              title="Request a quote"
              className="block w-full border-0"
              style={{ minHeight: 720 }}
            />
          </div>

          <footer className="bg-[#1f2a37] px-5 py-4 text-xs text-white/60 sm:px-8">
            © Ridge Line Roofing · Demo website for illustration
          </footer>
        </div>
        <p className="mx-auto mt-3 max-w-4xl text-center text-xs text-[#5a6067]">
          This is the real form in demo mode, so nothing you enter is saved or sent. Ridge Line Roofing is a made-up company.
                  </p>
      </section>

      {/* How to add it */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
            Add it in two lines
          </h2>
          <ol className="mt-5 space-y-3 text-base leading-relaxed text-[#3a3f45]">
            <li>
              <strong className="text-[#1C1F23]">1.</strong> Copy the code below and swap in your booking link (you&rsquo;ll
              find it in Settings → Booking form).
            </li>
            <li>
              <strong className="text-[#1C1F23]">2.</strong> Paste it where you want the form on your site. Most website
              builders have an &ldquo;Embed&rdquo; or &ldquo;Custom HTML&rdquo; block.
            </li>
            <li>
              <strong className="text-[#1C1F23]">3.</strong> Done. The form resizes itself to fit, and requests go
              straight to your Lead2Project board.
            </li>
          </ol>
          <pre className="mt-6 overflow-x-auto rounded-lg bg-[#1C1F23] p-4 text-xs leading-relaxed text-white/90 sm:text-sm">
            <code>{EMBED_CODE}</code>
          </pre>
          <p className="mt-3 text-sm text-[#5a6067]">
            Don&rsquo;t want to touch your website? Just link a &ldquo;Request a quote&rdquo; button to your booking link
            instead. That works too.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-4 rounded-lg bg-[#00828A] p-8 text-center text-white shadow-lg">
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold uppercase tracking-tight leading-none">
            Get your form in minutes
          </h2>
          <p className="max-w-lg text-white/85">Free plan includes your booking link. Set it up, then put it on your site.</p>
          <Link
            href="/signup"
            className="rounded-md bg-white px-7 py-3 font-[family-name:var(--font-display)] text-base font-bold uppercase tracking-wider text-[#00828A] shadow-sm transition-colors hover:bg-slate-50"
          >
            Start free
          </Link>
        </div>
      </section>

      <Footer />
      <Script src="/embed.js" strategy="afterInteractive" />
    </div>
  );
}