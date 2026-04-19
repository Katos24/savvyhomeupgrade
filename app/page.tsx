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

export default function Home() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-[#020617]">
      <Nav />

      {/* ── DARK ZONE 1 ── */}
      <Hero />

      {/* dark → white */}
      <div className="h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #020617, #ffffff)' }} />

      {/* ── WHITE ZONE ── */}
      <QRMarketingSection />
      <LeadModalSection />

      {/* white → dark */}
      <div className="h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #ffffff, #020617)' }} />

      {/* ── DARK ZONE 2 ── */}
      <TheBoard />

      {/* dark → dark bloom */}
      <div className="relative h-20 overflow-hidden pointer-events-none" style={{ background: '#020617' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-20 rounded-full opacity-25"
            style={{ background: 'radial-gradient(ellipse at center, #1a6645, transparent 70%)' }} />
        </div>
        <div className="absolute bottom-0 inset-x-0 h-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #0a0f1e)' }} />
      </div>

      <ValueStrip />

      {/* dark → white */}
      <div className="h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0a0f1e, #ffffff)' }} />

      {/* ── WHITE ZONE 2 ── */}
      <Pricing />
      <Comparison />

      {/* white → dark */}
      <div className="h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #ffffff, #020617)' }} />

      {/* ── DARK ZONE 3 ── */}
      <FinalCTA />
      <Footer />
    </div>
  );
}