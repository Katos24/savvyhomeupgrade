import Nav                from '@/components/marketing/Nav';
import NewHero            from '@/components/marketing/NewHero';
import NewTrustStrip      from '@/components/marketing/NewTrustStrip';
import NewFeatures        from '@/components/marketing/NewFeatures';
import NewWhySection      from '@/components/marketing/NewWhySection';
// import NewPricing      from '@/components/marketing/NewPricing';
// import NewComparison   from '@/components/marketing/NewComparison';
// import NewFinalCTA     from '@/components/marketing/NewFinalCTA';
import Footer             from '@/components/marketing/Footer';

/*  ─────────────────────────────────────────────────────────
    NEW HOME PAGE — V2
    ─────────────────────────────────────────────────────────
    1. NewHero          ✅ Deep blue hero + carousel
    2. NewTrustStrip    ✅ Metrics + trade badges (light bg)
    3. NewFeatures      ✅ Tabbed features with screenshots (light bg)
    4. NewWhySection    ✅ Why Lead2Project + story blocks
    5. NewPricing       — TODO
    6. NewComparison    — TODO
    7. NewFinalCTA      — TODO
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

      {/* 4. WHY LEAD2PROJECT — light blue */}
      <NewWhySection />

      {/* 5. PRICING — TODO */}
      {/* <NewPricing /> */}

      {/* 6. COMPARISON — TODO */}
      {/* <NewComparison /> */}

      {/* 7. FINAL CTA — TODO */}
      {/* <NewFinalCTA /> */}

      <Footer />
    </div>
  );
}