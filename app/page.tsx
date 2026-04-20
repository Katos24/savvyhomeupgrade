import Nav                from '@/components/marketing/Nav';
import Hero               from '@/components/marketing/Hero';
import QRMarketingSection from '@/components/marketing/QRMarketingSection';
import LeadModalSection   from '@/components/marketing/LeadModalSection';
import TheBoard           from '@/components/marketing/TheBoard';
import ValueStrip         from '@/components/marketing/ValueStrip';
import Pricing            from '@/components/marketing/Pricing';
import Comparison         from '@/components/marketing/Comparison';
import FinalCTA           from '@/components/marketing/FinalCTA';
import Footer             from '@/components/marketing/Footer';
import SectionDivider     from '@/components/marketing/SectionDivider';

export default function Home() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-[#020617]">
      <Nav />

      {/* ── DARK ZONE 1 — Hero + QR (seamless) ─────────────────── */}
      <Hero />
      {/* No divider — Hero and QR are both dark, flow directly */}
      <QRMarketingSection />
      {/* QR has a built-in bottom fade to white */}

      {/* ── WHITE ZONE — LeadModal ─────────────────────────────── */}
      <LeadModalSection />

      <SectionDivider variant="white-to-dark" />

      {/* ── DARK ZONE 2 — Board + Value ────────────────────────── */}
      <TheBoard />

      <SectionDivider variant="dark-to-dark" />

      <ValueStrip />

      <SectionDivider variant="dark-to-white" darkColor="#0a0f1e" />

      {/* ── WHITE ZONE 2 — Pricing + Comparison ────────────────── */}
      <Pricing />

      <SectionDivider variant="white-to-slate" />

      <div className="bg-slate-50">
        <Comparison />
      </div>

      <SectionDivider variant="slate-to-white" className="!h-8" />
      <SectionDivider variant="white-to-dark" />

      {/* ── DARK ZONE 3 — Final CTA + Footer ───────────────────── */}
      <FinalCTA />
      <Footer />
    </div>
  );
}