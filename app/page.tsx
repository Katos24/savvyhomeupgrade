import Nav                from '@/components/marketing/Nav';
import NewHero            from '@/components/marketing/NewHero';
import NewTrustStrip      from '@/components/marketing/NewTrustStrip';
import NewFeatures        from '@/components/marketing/NewFeatures';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';
import NewWhySection      from '@/components/marketing/NewWhySection';
import HeroDashboardDemo from '@/components/marketing/NewHeroDashboardDemo';
import LeadModalSection   from '@/components/marketing/LeadModalSection';
import Pricing            from '@/components/marketing/Pricing';
import Comparison         from '@/components/marketing/Comparison';
import FinalCTA           from '@/components/marketing/FinalCTA';
import Footer             from '@/components/marketing/Footer';

/*  ─────────────────────────────────────────────────────────
    NEW HOME PAGE — V2
    ─────────────────────────────────────────────────────────
    1. NewHero          ✅ Deep blue hero + carousel
    2. NewTrustStrip    ✅ Metrics + trade badges (light bg)
    3. NewFeatures      ✅ Tabbed features with screenshots
    4. NewWhySection    ✅ Why Lead2Project + story blocks
    5. Pricing          ✅ (reusing existing)
    6. Comparison       ✅ (reusing existing)
    7. FinalCTA         ✅ (reusing existing)
    8. Footer           ✅ (reusing existing)
    ───────────────────────────────────────────────────────── */

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-[#020617]">
      <Nav />

      {/* 1. HERO — dark blue */}
      <NewHero />

      {/* 2. TRUST — light */}
      <NewTrustStrip />

      {/* 3. FEATURES — light */}
      <NewFeatures />

      {/* 4. HOW IT WORKS — 4-step journey (dark) */}
      <div className="bg-[#020617] py-16 sm:py-28 px-5 sm:px-10">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-sm font-semibold text-slate-500 tracking-wide mb-4">How it works</p>
          <h2
            className="font-black text-white leading-[1.1] tracking-tight"
            style={{
              fontSize: 'clamp(1.6rem, 5vw, 3.2rem)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Four Steps. Zero Headaches.
          </h2>
        </div>
        <HeroStoryStrip />
      </div>

      {/* 5. WHY LEAD2PROJECT — light blue */}
      <NewWhySection />

      {/* 6. LIVE DEMO — form to board in real time (dark) */}
      <div className="bg-[#020617] py-16 sm:py-28 px-5 sm:px-10">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-sm font-semibold text-slate-500 tracking-wide mb-4">See it in action</p>
          <h2
            className="font-black text-white leading-[1.1] tracking-tight mb-4"
            style={{
              fontSize: 'clamp(1.6rem, 5vw, 3.2rem)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            Customer Scans. Lead Lands.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium max-w-md mx-auto">
            Watch a lead come in from a QR scan and hit your board in real time.
          </p>
        </div>
        <div className="flex justify-center">
          <HeroDashboardDemo />
        </div>
      </div>

      {/* 7. OPERATIONS — cycling phone (light) */}
      <LeadModalSection />

      {/* 7. PRICING */}
      <Pricing />

      {/* 6. COMPARISON */}
      <div className="bg-slate-50">
        <Comparison />
      </div>

      {/* 7. FINAL CTA */}
      <FinalCTA />

      {/* 8. FOOTER */}
      <Footer />
    </div>
  );
}