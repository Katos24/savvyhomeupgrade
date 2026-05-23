'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import ProblemSection from '@/components/marketing/ProblemSection';
import TheFixSection from '@/components/marketing/FixSection';
import TruckSection from '@/components/marketing/TruckSection';
import CustomizeFormSection from '@/components/marketing/CustomizeFormSection';
import LeadLandingSection from '@/components/marketing/LeadLandingSection';
import DigestBanner from '@/components/marketing/DigestBanner';
import EfficiencyShowcase from '@/components/marketing/EfficiencyShowcase';
import Pricing from '@/components/marketing/Pricing';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';
import SelfServeBanner from '@/components/marketing/SelfServeBanner';
import ArchitectHero from '@/components/marketing/NewHero';

export default function NewHome() {
  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white">
<Nav />

{/* 1. HOOK — pain + scrapbook collage */}
<NewHero />

{/* 2. DEEPEN THE PAIN — 1-2-3-4 steps */}
<ProblemSection />

{/* 3. THE FIX — "This one goes to your dashboard" + tilted laptop */}
<TheFixSection />

{/* 4. THE ENTRY POINT — "Your Form, Your Brand" */}
<CustomizeFormSection />

{/* 5. ONE LINK EVERYWHERE — QR code, trucks, yard signs, social */}
<TruckSection />

{/* 6. ONCE IT LANDS — "Run the entire job from one card" */}
<LeadLandingSection />

{/* 8. YOUR BUSINESS AT 6AM — daily digest */}
<DigestBanner />


{/* 7. ONE CLICK EMAILS + OUTBOX — send quote/schedule/payment, all tracked */}
<EfficiencyShowcase />



{/* 10. NO DEMOS, JUST BUILD — self serve */}
<SelfServeBanner />

{/* 11. PRICING */}
<Pricing />

{/* 12. FINAL CTA */}
<FinalCTA />

{/* 13. FOOTER */}
<Footer />
    </div>
  );
}