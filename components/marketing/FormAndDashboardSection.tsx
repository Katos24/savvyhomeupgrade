'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  User,
  Mail,
  Phone,
  FileText,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Home,
  Flame,
  Droplet,
  Zap,
  Sun,
  Send,
  Sparkles,
  Camera,
  RotateCcw,
  Wifi,
  Battery,
  Smartphone,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import HeroDispatchCards from '@/components/marketing/HeroDispatchCards';
import { TRADE_EXAMPLES } from '@/components/marketing/tradeExamples';

const font = "'Nunito', sans-serif";

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'green' },
  { value: 'contacted', label: 'Dispatched', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'blue' },
];

const TOP_TRADES = [
  { label: 'ROOFING', tradeKey: 'Roofing', icon: Home },
  { label: 'HVAC', tradeKey: 'HVAC', icon: Flame },
  { label: 'PLUMBING', tradeKey: 'Plumbing', icon: Droplet },
  { label: 'ELECTRICAL', tradeKey: 'Electrical', icon: Zap },
  { label: 'SOLAR', tradeKey: 'Solar', icon: Sun },
] as const;

const SERVICE_OPTIONS: Record<string, string[]> = {
  Roofing: ['Inspection', 'Replacement', 'Leak Repair', 'Gutters'],
  HVAC: ['AC Tune-Up', 'Install', 'Duct Cleaning', 'Furnace'],
  Plumbing: ['Drain Cleaning', 'Pipe Repair', 'Water Heater', 'Leak Detection'],
  Electrical: ['Panel Upgrade', 'Rewiring', 'Outlet Install', 'Lighting'],
  Solar: ['System Check', 'Panel Install', 'Inverter Repair', 'Battery Backup'],
};

const DEMO_CUSTOMER = 'Jennifer L.';
const COLLISION_FALLBACKS = ['Marcus T.', 'Dana R.', 'Priya S.'];

const DEMO_PREFILLS: Record<string, { service: string; notes: string; address: string }> = {
  Roofing: { service: 'Inspection', notes: 'Missing shingles on south ridge', address: '42 Maple Ave, Brooklyn NY' },
  HVAC: { service: 'AC Tune-Up', notes: 'Central AC blowing warm air', address: '128 Highland Rd, Austin TX' },
  Plumbing: { service: 'Drain Cleaning', notes: 'Main bathroom drain backing up', address: '88 Ocean Blvd, Miami FL' },
  Electrical: { service: 'Panel Upgrade', notes: 'Breaker box tripping frequently', address: '154 Pinecrest St, Denver CO' },
  Solar: { service: 'System Check', notes: 'Inverter error light on', address: '910 Sun Valley Way, Phoenix AZ' },
};

type Theme = {
  sectionBg: string;
  accent: string;
  textAccent: string;
  cardBorder: string;
  lightBg: string;
  lightBorder: string;
  icon: LucideIcon;
};

const TRADE_THEMES: Record<string, Theme> = {
  Roofing: {
    sectionBg: 'bg-gradient-to-br from-orange-50/50 via-white to-slate-100/80 text-slate-900',
    accent: '#f97316',
    textAccent: '#c2410c',
    cardBorder: 'border-orange-500/20',
    lightBg: '#fff7ed',
    lightBorder: '#ffedd5',
    icon: Home,
  },
  HVAC: {
    sectionBg: 'bg-gradient-to-br from-sky-50/50 via-white to-slate-100/80 text-slate-900',
    accent: '#0284c7',
    textAccent: '#0369a1',
    cardBorder: 'border-sky-500/20',
    lightBg: '#f0f9ff',
    lightBorder: '#e0f2fe',
    icon: Flame,
  },
  Plumbing: {
    sectionBg: 'bg-gradient-to-br from-emerald-50/50 via-white to-slate-100/80 text-slate-900',
    accent: '#059669',
    textAccent: '#047857',
    cardBorder: 'border-emerald-500/20',
    lightBg: '#ecfdf5',
    lightBorder: '#d1fae5',
    icon: Droplet,
  },
  Electrical: {
    sectionBg: 'bg-gradient-to-br from-amber-50/50 via-white to-slate-100/80 text-slate-900',
    accent: '#d97706',
    textAccent: '#b45309',
    cardBorder: 'border-amber-500/20',
    lightBg: '#fffbeb',
    lightBorder: '#fef3c7',
    icon: Zap,
  },
  Solar: {
    sectionBg: 'bg-gradient-to-br from-teal-50/50 via-white to-slate-100/80 text-slate-900',
    accent: '#0d9488',
    textAccent: '#0f766e',
    cardBorder: 'border-teal-500/20',
    lightBg: '#f0fdfa',
    lightBorder: '#ccfbf1',
    icon: Sun,
  },
};

export default function FormAndDashboardSection() {
  const [activeExample, setActiveExample] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [extraLeads, setExtraLeads] = useState<any[]>([]);

  // Mobile View Switcher: 'form' vs 'board'
  const [mobileTab, setMobileTab] = useState<'form' | 'board'>('form');

  // Device screen state inside phone
  const [phoneScreen, setPhoneScreen] = useState<'form' | 'success'>('form');

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<string>('Morning');
  const [photoCount, setPhotoCount] = useState(1);

  const current = TRADE_EXAMPLES[activeExample] || TRADE_EXAMPLES[0];
  const theme = TRADE_THEMES[current.trade] || TRADE_THEMES.Roofing;
  const prefill = DEMO_PREFILLS[current.trade] || DEMO_PREFILLS.Roofing;
  const serviceOptions = SERVICE_OPTIONS[current.trade] || SERVICE_OPTIONS.Roofing;
  const BackgroundTradeIcon = theme.icon;

  const activeService = selectedService ?? prefill.service;

  useEffect(() => {
    setHasSubmitted(false);
    setIsSubmitting(false);
    setExtraLeads([]);
    setSelectedService(null);
    setTimeWindow('Morning');
    setPhotoCount(1);
    setPhoneScreen('form');
    setMobileTab('form');
  }, [activeExample]);

  const handleSimulatedSubmit = () => {
    if (isSubmitting || hasSubmitted) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newLiveLead = {
        id: `demo-live-${Date.now()}`,
        name: DEMO_CUSTOMER,
        phone: '(555) 382-9102',
        email: 'jennifer@example.com',
        category: activeService,
        address: prefill.address,
        notes: `${prefill.notes} — prefers ${timeWindow.toLowerCase()}`,
        status: 'new',
        createdAt: 'Just now',
        file_urls: JSON.stringify(
          Array.from({ length: photoCount }, (_, i) => `site-photo-${i + 1}.jpg`)
        ),
        isNew: true,
      };

      setExtraLeads([newLiveLead]);
      setIsSubmitting(false);
      setHasSubmitted(true);
      setPhoneScreen('success');

      // Auto-switch mobile view to the Live Dispatch Board on submit!
      setMobileTab('board');
    }, 700);
  };

  const combinedLeads = useMemo(() => {
    const BASE_LEAD_COUNT = 3;
    const baseLeads = current.leads.slice(0, BASE_LEAD_COUNT).map((lead, i) =>
      lead.name?.trim().toLowerCase() === DEMO_CUSTOMER.toLowerCase()
        ? { ...lead, name: COLLISION_FALLBACKS[i % COLLISION_FALLBACKS.length] }
        : lead
    );
    return [...extraLeads, ...baseLeads];
  }, [current.leads, extraLeads]);

  return (
    <section
      style={{ fontFamily: font }}
      className={`relative py-12 sm:py-20 lg:py-24 transition-colors duration-700 ease-in-out overflow-hidden border-t border-b border-slate-200 ${theme.sectionBg}`}
    >
      {/* Dynamic Background Watermark */}
      <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 pointer-events-none opacity-[0.035] transition-all duration-700">
        <BackgroundTradeIcon className="w-[380px] h-[380px] lg:w-[520px] lg:h-[520px] text-slate-900" strokeWidth={1} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2.5">
            Interactive Product Demo
          </p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            See your brand on mobile.
            <span className="block mt-1 sm:mt-2 transition-colors duration-500" style={{ color: theme.textAccent }}>
              Watch leads land live on board.
            </span>
          </h2>
          <p className="mt-3 text-slate-600 font-semibold text-xs sm:text-base leading-relaxed">
            Select a trade below, submit the form inside the phone mockup, and watch the lead appear instantly on the dispatch dashboard.
          </p>
        </div>

        {/* ── Trade Selector Bar ──────────────────────── */}
        <div className="mt-6 sm:mt-8 mb-6 sm:mb-10 flex justify-center">
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-sm max-w-full overflow-x-auto no-scrollbar">
            {TOP_TRADES.map((item) => {
              const Icon = item.icon;
              const isSelected = current.trade.toLowerCase() === item.tradeKey.toLowerCase();
              const tradeIndex = TRADE_EXAMPLES.findIndex((t) => t.trade.toLowerCase() === item.tradeKey.toLowerCase());

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveExample(tradeIndex !== -1 ? tradeIndex : 0)}
                  aria-pressed={isSelected}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── MOBILE TABS TOGGLE (Only visible on screens smaller than lg) ──────────────────────── */}
        <div className="flex lg:hidden justify-center mb-6">
          <div className="bg-slate-900/90 p-1 rounded-2xl border border-slate-800 flex items-center gap-1 w-full max-w-[340px] shadow-lg">
            <button
              type="button"
              onClick={() => setMobileTab('form')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mobileTab === 'form'
                  ? 'bg-white text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone size={14} />
              <span>1. Mobile Form</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('board')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mobileTab === 'board'
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>2. Live Board</span>
              {hasSubmitted && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </button>
          </div>
        </div>

        {/* ── Interactive Grid: Phone Mockup (Left) + Desktop Dashboard (Right) ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT: PHONE FRAME MOCKUP */}
          <div className={`lg:col-span-5 flex-col items-center justify-center ${mobileTab === 'form' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* Phone Shell */}
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-[42px] p-3.5 bg-slate-900 ring-1 ring-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] transition-all">
              
              {/* Dynamic Notch / Island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-30 flex items-center justify-between px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <div className="w-2 h-2 rounded-full bg-blue-900/40" />
              </div>

              {/* Phone Screen Container */}
              <div className="relative w-full rounded-[32px] overflow-hidden bg-slate-50 border border-slate-200 pt-8 pb-4 px-3 flex flex-col min-h-[560px] sm:min-h-[580px] shadow-inner">
                
                {/* Phone Status Bar */}
                <div className="flex items-center justify-between px-2 mb-2 text-[10px] font-extrabold text-slate-800">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Wifi size={11} />
                    <Battery size={12} />
                  </div>
                </div>

                {/* Inside Screen Content */}
                {phoneScreen === 'form' ? (
                  <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-300">
                    
                    {/* Form Header */}
                    <div>
                      <div
                        className="rounded-xl p-2.5 flex items-center gap-2 mb-3 shadow-sm text-white transition-colors duration-500"
                        style={{ backgroundColor: theme.accent }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                          {current.company?.logo_url ? (
                            <img src={current.company.logo_url} alt="Logo" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-xs font-black" style={{ color: theme.accent }}>
                              {current.company?.name?.charAt(0) ?? 'P'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-xs truncate leading-tight">
                            {current.company?.name ?? `${current.trade} Pros`}
                          </h4>
                          <p className="text-[8px] font-extrabold uppercase tracking-widest text-white/80">
                            Mobile Request Form
                          </p>
                        </div>
                      </div>

                      {/* Compact Input Fields */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                            <label className="text-[8px] font-black uppercase text-slate-400 block">Name</label>
                            <p className="text-[11px] font-bold text-slate-800 truncate">{DEMO_CUSTOMER}</p>
                          </div>
                          <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                            <label className="text-[8px] font-black uppercase text-slate-400 block">Phone</label>
                            <p className="text-[11px] font-bold text-slate-800 truncate">(555) 382-9102</p>
                          </div>
                        </div>

                        {/* Interactive Service Buttons */}
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">
                            Service Needed
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            {serviceOptions.map((opt) => {
                              const isSelected = opt === activeService;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setSelectedService(opt)}
                                  className="px-2 py-1 rounded-md text-[10px] font-extrabold border transition-all truncate text-left"
                                  style={
                                    isSelected
                                      ? { backgroundColor: theme.accent, color: '#fff', borderColor: 'transparent' }
                                      : { backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#475569' }
                                  }
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Preferred Time Slot */}
                        <div>
                          <label className="text-[8px] font-black uppercase text-slate-400 block mb-1">
                            Preferred Time
                          </label>
                          <div className="grid grid-cols-3 gap-1">
                            {['Morning', 'Afternoon', 'Flexible'].map((slot) => {
                              const isSelected = slot === timeWindow;
                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setTimeWindow(slot)}
                                  className="py-1 rounded-md text-[9px] font-bold border text-center transition-all"
                                  style={
                                    isSelected
                                      ? { backgroundColor: theme.accent, color: '#fff', borderColor: 'transparent' }
                                      : { backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#475569' }
                                  }
                                >
                                  {slot}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                          <label className="text-[8px] font-black uppercase text-slate-400 block">Address</label>
                          <p className="text-[10px] font-bold text-slate-700 truncate">{prefill.address}</p>
                        </div>

                        {/* Attachments */}
                        <div className="bg-white p-1.5 rounded-lg border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Camera size={12} style={{ color: theme.accent }} />
                            <span className="text-[10px] font-bold text-slate-700">{photoCount} Photo attached</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setPhotoCount((n) => Math.max(0, n - 1))}
                              className="w-4 h-4 rounded border bg-slate-50 text-[10px] font-black flex items-center justify-center text-slate-600"
                            >
                              -
                            </button>
                            <button
                              type="button"
                              onClick={() => setPhotoCount((n) => Math.min(4, n + 1))}
                              className="w-4 h-4 rounded border bg-slate-50 text-[10px] font-black flex items-center justify-center text-slate-600"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Primary Mobile Action Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSimulatedSubmit}
                        disabled={isSubmitting}
                        style={{ backgroundColor: theme.textAccent }}
                        className="w-full text-white py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                      >
                        {isSubmitting ? (
                          <span>Sending to Board...</span>
                        ) : (
                          <>
                            <span>Submit Request</span>
                            <ChevronRight size={14} />
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ) : (
                  /* Success Screen inside Phone */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4 animate-in zoom-in-95 duration-300">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                      <CheckCircle2 size={28} />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm">Lead Dispatched!</h4>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1 leading-relaxed">
                      Your request has been delivered directly to the contractor’s live dashboard.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setHasSubmitted(false);
                        setExtraLeads([]);
                        setPhoneScreen('form');
                        setMobileTab('form');
                      }}
                      className="mt-6 flex items-center gap-1.5 text-xs font-black text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50"
                    >
                      <RotateCcw size={12} /> Test Again
                    </button>
                  </div>
                )}

                {/* Phone Bottom Home Bar */}
                <div className="w-20 h-1 bg-slate-300 rounded-full mx-auto mt-3" />
              </div>
            </div>

          </div>

          {/* RIGHT: DESKTOP DISPATCH DASHBOARD */}
          <div className={`lg:col-span-7 ${mobileTab === 'board' ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Live Dispatch Board
                </h3>
              </div>
              {hasSubmitted && (
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full animate-bounce">
                  ⚡ New lead received!
                </span>
              )}
            </div>

            <div className={`p-3.5 sm:p-5 rounded-2xl border bg-slate-950/90 backdrop-blur-md shadow-2xl space-y-4 transition-colors ${theme.cardBorder}`}>
              <DashboardHeader
                company={current.company}
                isDark={true}
                isRefreshing={isSubmitting}
                planTier="pro"
                onSidebarOpen={() => {}}
                onCreateLead={() => {}}
                onLockedFeature={() => {}}
                onRefresh={() => {}}
                accentColor={current.color}
              />

              <DashboardStats
                globalStats={current.stats}
                allLeads={combinedLeads}
                isDark={true}
                accentColor={current.color}
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