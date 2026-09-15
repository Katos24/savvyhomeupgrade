'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Flame,
  Droplet,
  Zap,
  Sun,
  CheckCircle2,
  Send,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { Plus_Jakarta_Sans } from 'next/font/google';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import HeroDispatchCards from '@/components/marketing/HeroDispatchCards';
import { TRADE_EXAMPLES } from '@/components/marketing/tradeExamples';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'green' },
  { value: 'contacted', label: 'Dispatched', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'blue' },
];

const TOP_TRADES = [
  { label: 'Roofing', tradeKey: 'Roofing', icon: Home },
  { label: 'HVAC', tradeKey: 'HVAC', icon: Flame },
  { label: 'Plumbing', tradeKey: 'Plumbing', icon: Droplet },
  { label: 'Electrical', tradeKey: 'Electrical', icon: Zap },
  { label: 'Solar', tradeKey: 'Solar', icon: Sun },
] as const;

const SERVICE_OPTIONS: Record<string, string[]> = {
  Roofing: ['Inspection', 'Replacement', 'Leak Repair', 'Gutters'],
  HVAC: ['AC Tune-Up', 'Install', 'Duct Cleaning', 'Furnace'],
  Plumbing: ['Drain Cleaning', 'Pipe Repair', 'Water Heater', 'Leak Detection'],
  Electrical: ['Panel Upgrade', 'Rewiring', 'Outlet Install', 'Lighting'],
  Solar: ['System Check', 'Panel Install', 'Inverter Repair', 'Battery Backup'],
};

const DEMO_PREFILLS: Record<string, { service: string; notes: string; address: string; name: string }> = {
  Roofing: { name: 'Jennifer L.', service: 'Inspection', notes: 'Missing shingles on south ridge', address: '42 Maple Ave, Austin TX' },
  HVAC: { name: 'Marcus T.', service: 'AC Tune-Up', notes: 'Central AC blowing warm air', address: '128 Highland Rd, Austin TX' },
  Plumbing: { name: 'Dana R.', service: 'Drain Cleaning', notes: 'Main bathroom drain backing up', address: '88 Ocean Blvd, Miami FL' },
  Electrical: { name: 'Priya S.', service: 'Panel Upgrade', notes: 'Breaker box tripping frequently', address: '154 Pinecrest St, Denver CO' },
  Solar: { name: 'Carlos M.', service: 'System Check', notes: 'Inverter error light on panel', address: '910 Sun Valley Way, Phoenix AZ' },
};

export default function FormAndDashboardSection() {
  const [activeTradeIndex, setActiveTradeIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [extraLeads, setExtraLeads] = useState<any[]>([]);

  const current = TRADE_EXAMPLES[activeTradeIndex] || TRADE_EXAMPLES[0];
  const prefill = DEMO_PREFILLS[current.trade] || DEMO_PREFILLS.Roofing;
  const serviceOptions = SERVICE_OPTIONS[current.trade] || SERVICE_OPTIONS.Roofing;

  const [selectedService, setSelectedService] = useState<string>(prefill.service);
  const [selectedTime, setSelectedTime] = useState<string>('Morning');

  // Reset prefill when trade changes
  useEffect(() => {
    setHasSubmitted(false);
    setIsSubmitting(false);
    setExtraLeads([]);
    const newPrefill = DEMO_PREFILLS[current.trade] || DEMO_PREFILLS.Roofing;
    setSelectedService(newPrefill.service);
    setSelectedTime('Morning');
  }, [activeTradeIndex, current.trade]);

  const handleSimulatedSubmit = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newLiveLead = {
        id: `lead-${Date.now()}`,
        name: prefill.name,
        phone: '(555) 382-9102',
        email: `${prefill.name.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
        category: selectedService,
        address: prefill.address,
        notes: `${prefill.notes} (${selectedTime} preference)`,
        status: 'new',
        createdAt: 'Just now',
        isNew: true,
      };

      setExtraLeads([newLiveLead]);
      setIsSubmitting(false);
      setHasSubmitted(true);
    }, 600);
  };

  const combinedLeads = useMemo(() => {
    return [...extraLeads, ...current.leads.slice(0, 3)];
  }, [current.leads, extraLeads]);

  return (
    <section
      className={`${jakarta.variable} font-[family-name:var(--font-jakarta)] bg-[#F4F7F6] py-16 sm:py-24 border-t border-slate-200/80 text-slate-900 antialiased selection:bg-[#00828A]/20 selection:text-[#00828A]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* ── 1. SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm text-xs font-semibold text-[#00828A]">
            <Sparkles className="w-3.5 h-3.5" />
            Instant Client-to-Board Dispatch
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
            From client request to live dispatch in under 5 seconds.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal">
            Custom brand your intake forms. When clients submit, jobs drop instantly onto your Lead2Project live board.
          </p>

          {/* ── Trade Selector Pills ── */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm max-w-full overflow-x-auto no-scrollbar">
              {TOP_TRADES.map((item) => {
                const Icon = item.icon;
                const tradeIndex = TRADE_EXAMPLES.findIndex(
                  (t) => t.trade.toLowerCase() === item.tradeKey.toLowerCase()
                );
                const isSelected = activeTradeIndex === (tradeIndex !== -1 ? tradeIndex : 0);

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveTradeIndex(tradeIndex !== -1 ? tradeIndex : 0)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isSelected
                        ? 'bg-[#00828A] text-white shadow-md shadow-[#00828A]/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 2. TWO-COLUMN INTERACTIVE WORKSPACE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT: Clean Intake Form Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1. Client Request Form
              </span>
              <span className="text-[11px] font-semibold text-[#00828A] bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-md">
                Live Embed Preview
              </span>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
              {/* Form Branding Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00828A]/10 text-[#00828A] flex items-center justify-center font-bold text-sm">
                    {current.trade.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {current.company?.name ?? `${current.trade} Services`}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Online Request Portal
                    </p>
                  </div>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>

              {/* Form Fields */}
              <div className="space-y-3.5 text-xs">
                {/* Contact Prefill */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Name</span>
                    <span className="font-semibold text-slate-800">{prefill.name}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Phone</span>
                    <span className="font-semibold text-slate-800">(555) 382-9102</span>
                  </div>
                </div>

                {/* Interactive Service Options */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">
                    Service Requested
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {serviceOptions.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => setSelectedService(service)}
                        className={`px-3 py-2 rounded-xl text-[11px] font-semibold border text-left transition-all truncate ${
                          selectedService === service
                            ? 'bg-[#00828A] text-white border-[#00828A] shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Time Window */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">
                    Preferred Time Window
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Morning', 'Afternoon', 'Flexible'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`py-1.5 rounded-lg text-[11px] font-semibold border text-center transition-all ${
                          selectedTime === time
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Job Location */}
                <div className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-xl flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#00828A] shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Property Location</span>
                    <span className="font-semibold text-slate-800 truncate block">{prefill.address}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="button"
                onClick={handleSimulatedSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#00828A] hover:bg-[#006e75] text-white font-bold text-xs py-3.5 rounded-xl shadow-md shadow-[#00828A]/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing to Dispatch Board...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Service Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {hasSubmitted && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Request sent! Check the live board on the right &rarr;</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Live Lead2Project Dispatch Board */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Live Lead2Project Board
                </span>
              </div>
              {hasSubmitted && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md animate-bounce">
                  ⚡ New lead injected!
                </span>
              )}
            </div>

            {/* Dark Mode Dashboard Mockup */}
            <div className="bg-[#081524] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-5 text-white">
              <DashboardHeader
                company={current.company}
                isDark={true}
                isRefreshing={isSubmitting}
                planTier="pro"
                onCreateLead={() => {}}
                onLockedFeature={() => {}}
                onRefresh={() => {}}
                accentColor="#00828A"
              />

              <DashboardStats
                globalStats={current.stats}
                allLeads={combinedLeads}
                isDark={true}
                accentColor="#00828A"
              />

              <HeroDispatchCards
                leads={combinedLeads}
                statusOptions={STATUS_OPTIONS}
                trade={current.trade}
                view="cards"
                isDark={true}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}