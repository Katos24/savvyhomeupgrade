'use client';

import Nav from '@/components/marketing/Nav';
import NewHero from '@/components/marketing/NewHero';
import DashboardShowcase from '@/components/marketing/DashboardShowcase';
import FullStorySection from '@/components/marketing/FullStorySection';
import QuoteToPaidSection from '@/components/marketing/QuoteToPaidSection';

import ValuePropsSection from '@/components/marketing/ValuePropsSection';
import HowItWorksSection from '@/components/marketing/HowItWorksSection';
import ProblemSection from '@/components/marketing/ProblemSection';
import TruckSection from '@/components/marketing/TruckSection'; // Your Distribution Section
import CustomizeFormSection from '@/components/marketing/CustomizeFormSection'; // Your Entry Point Section
import DigestBanner from '@/components/marketing/DigestBanner';
import SelfServeBanner from '@/components/marketing/SelfServeBanner';
import Pricing from '@/components/marketing/Pricing';
import FinalCTA from '@/components/marketing/FinalCTA';
import Footer from '@/components/marketing/Footer';

export default function NewHome() {
return (
<div className="min-h-screen font-sans antialiased overflow-x-hidden bg-white text-slate-900">
<Nav />

{/* 1. THE HOOK: The current state of chaos vs. order */}
<NewHero />
<DashboardShowcase />

<FullStorySection />
<QuoteToPaidSection />




<HowItWorksSection />


<TruckSection />

<ValuePropsSection />

<DigestBanner />


<CustomizeFormSection />













{/* 2. THE PROBLEM: Why the current way (threads/folders) is failing them */}

{/* CustomizeFormSection removed — its job (industry picker, full form
    preview) now lives directly in the hero. */}
{/* 5. DISTRIBUTION: Where to put the link (QR/Trucks/Bios) Google section */}

{/* 4. THE ENTRY POINT: Custom Forms (The "Where" & "How") */}

{/* 3. THE SOLUTION: The "Lead2Project" Concept (The Fix) */}







<Pricing />

{/* 9. THE BARRIER REMOVAL: Self-serve sign up */}
<SelfServeBanner />




{/* 11. FINAL CTA */}

<Footer />
</div>
  );
}