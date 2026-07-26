'use client';

import { useState, useEffect } from 'react';
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
  type LucideIcon,
} from 'lucide-react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import HeroDispatchCards, { DispatchViewSwitcher, type ViewKey } from '@/components/marketing/HeroDispatchCards';
import { TRADE_EXAMPLES } from '@/components/marketing/tradeExamples';
import Link from 'next/link';

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

// Each trade gets its own realistic service menu — the first option is always
// what's shown as "selected" in the demo form, matching DEMO_PREFILLS below.
const SERVICE_OPTIONS: Record<string, string[]> = {
  Roofing: ['Roof Inspection', 'Roof Replacement', 'Leak Repair', 'Gutter Work'],
  HVAC: ['AC Tune-Up', 'System Install', 'Duct Cleaning', 'Furnace Repair'],
  Plumbing: ['Drain Cleaning', 'Pipe Repair', 'Water Heater', 'Leak Detection'],
  Electrical: ['Panel Upgrade', 'Rewiring', 'Outlet Install', 'Lighting'],
  Solar: ['System Check', 'Panel Install', 'Inverter Repair', 'Battery Backup'],
};

const DEMO_PREFILLS: Record<string, { service: string; notes: string; address: string }> = {
  Roofing: { service: 'Roof Inspection', notes: 'Missing shingles on south ridge', address: '42 Maple Ave, Brooklyn NY' },
  HVAC: { service: 'AC Tune-Up', notes: 'Central AC blowing warm air', address: '128 Highland Rd, Austin TX' },
  Plumbing: { service: 'Drain Cleaning', notes: 'Main bathroom drain backing up', address: '88 Ocean Blvd, Miami FL' },
  Electrical: { service: 'Panel Upgrade', notes: 'Breaker box tripping frequently', address: '154 Pinecrest St, Denver CO' },
  Solar: { service: 'System Check', notes: 'Inverter error light on', address: '910 Sun Valley Way, Phoenix AZ' },
};

const TRADE_THEMES: Record<string, { sectionBg: string; accent: string; buttonBg: string; badgeBg: string; badgeText: string; cardBorder: string; icon: LucideIcon }> = {
  Roofing: {
    sectionBg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 text-white',
    accent: '#f97316',
    buttonBg: 'bg-orange-600 hover:bg-orange-500 text-white',
    badgeBg: 'bg-orange-500/20',
    badgeText: 'text-orange-300',
    cardBorder: 'border-orange-500/30',
    icon: Home,
  },
  HVAC: {
    sectionBg: 'bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 text-white',
    accent: '#38bdf8',
    buttonBg: 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-black',
    badgeBg: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
    cardBorder: 'border-sky-500/30',
    icon: Flame,
  },
  Plumbing: {
    sectionBg: 'bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-950 text-white',
    accent: '#34d399',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    cardBorder: 'border-emerald-500/30',
    icon: Droplet,
  },
  Electrical: {
    sectionBg: 'bg-gradient-to-br from-zinc-950 via-amber-950/80 to-slate-950 text-white',
    accent: '#fbbf24',
    buttonBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    cardBorder: 'border-amber-500/30',
    icon: Zap,
  },
  Solar: {
    sectionBg: 'bg-gradient-to-br from-slate-950 via-teal-950 to-cyan-950 text-white',
    accent: '#2dd4bf',
    buttonBg: 'bg-teal-400 hover:bg-teal-300 text-slate-950 font-black',
    badgeBg: 'bg-teal-500/20',
    badgeText: 'text-teal-300',
    cardBorder: 'border-teal-500/30',
    icon: Sun,
  },
};

const fieldLabelClass = 'text-[10px] font-black text-slate-500 uppercase tracking-[0.1em] block mb-1';

function DisplayField({
  icon: Icon,
  label,
  value,
  accent,
  multiline = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className={fieldLabelClass}>{label}</label>
      <div className="relative">
        <Icon className={`absolute left-3 ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'} w-3.5 h-3.5 text-slate-400`} />
        <div
          className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-semibold text-slate-800 select-none border transition-colors duration-500 ${
            multiline ? 'leading-relaxed min-h-[52px]' : ''
          }`}
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 5%, white)`,
            borderColor: `color-mix(in srgb, ${accent} 16%, white)`,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function FormAndDashboardSection() {
  const [activeExample, setActiveExample] = useState(0);
  const [view, setView] = useState<ViewKey>('cards');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [extraLeads, setExtraLeads] = useState<any[]>([]);

  const findTradeIndex = (tradeKey: string) => {
    const idx = TRADE_EXAMPLES.findIndex((t) => t.trade.toLowerCase() === tradeKey.toLowerCase());
    return idx !== -1 ? idx : 0;
  };

  const current = TRADE_EXAMPLES[activeExample] || TRADE_EXAMPLES[0];
  const theme = TRADE_THEMES[current.trade] || TRADE_THEMES.Roofing;
  const prefill = DEMO_PREFILLS[current.trade] || DEMO_PREFILLS.Roofing;
  const serviceOptions = SERVICE_OPTIONS[current.trade] || SERVICE_OPTIONS.Roofing;
  const BackgroundTradeIcon = theme.icon;

  useEffect(() => {
    setHasSubmitted(false);
    setIsSubmitting(false);
    setExtraLeads([]);
  }, [activeExample]);

  const handleSimulatedSubmit = () => {
    if (isSubmitting || hasSubmitted) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newLiveLead = {
        id: `demo-live-${Date.now()}`,
        name: 'Jennifer L.',
        phone: '(555) 382-9102',
        email: 'jennifer@example.com',
        category: prefill.service,
        address: prefill.address,
        notes: prefill.notes,
        status: 'new',
        createdAt: 'Just now',
        quote_total: '450.00',
      };

      setExtraLeads([newLiveLead]);
      setIsSubmitting(false);
      setHasSubmitted(true);
    }, 800);
  };

  const combinedLeads = [...extraLeads, ...current.leads];

  return (
    <section
      style={{ fontFamily: font }}
      className={`relative py-16 sm:py-20 transition-all duration-700 ease-in-out overflow-hidden border-t border-b border-white/10 ${theme.sectionBg}`}
    >
      {/* BACKGROUND TRADE ICON */}
      <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 pointer-events-none opacity-10 transition-all duration-700">
        <BackgroundTradeIcon className="w-[450px] h-[450px] text-white" strokeWidth={1} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* STORY INTRO: sign-up narrative + CTA */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[10px] font-black tracking-widest text-white/50 uppercase mb-3">
            See Your Brand In Action
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.1] mb-3">
            Get your form and dashboard today.
            <span className="block mt-1 transition-colors duration-500" style={{ color: theme.accent }}>
              Your branding. Your way.
            </span>
          </h2>
          
        </div>

        {/* TOP SELECTOR TABS */}
        <div className="mb-10 text-center">
          <p className="text-[10px] font-black tracking-widest text-white/50 uppercase mb-3">
            SELECT TRADE EXPERIENCE
          </p>

          <div className="flex flex-wrap justify-center gap-2">
            {TOP_TRADES.map((item) => {
              const Icon = item.icon;
              const isSelected = current.trade.toLowerCase() === item.tradeKey.toLowerCase();

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveExample(findTradeIndex(item.tradeKey))}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-black text-xs tracking-wider transition-all duration-200 border ${
                    isSelected
                      ? 'bg-white text-slate-950 border-white shadow-md'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-white/60'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* LEFT: BRANDED FORM */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-2 ${theme.badgeBg} ${theme.badgeText}`}>
                {current.trade} Workflow
              </span>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Live intake <span style={{ color: theme.accent }}>for {current.trade}</span>
              </h2>
              <p className="mt-1 text-white/70 font-medium text-xs sm:text-sm">
                This is what customers fill out. Submit it to watch it dispatch straight to the board.
              </p>
            </div>

            {/* Realistic branded form card */}
            <div
              className="w-full rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl transition-colors duration-500"
              style={{
                borderColor: `${theme.accent}40`,
                backgroundColor: `color-mix(in srgb, ${theme.accent} 7%, white)`,
              }}
            >
              {/* Company header bar — colored per trade's brand accent */}
              <div
                className="px-4 py-3.5 sm:px-5 sm:py-4 flex items-center gap-3 sm:gap-4 transition-colors duration-500"
                style={{ backgroundColor: theme.accent }}
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center shrink-0 p-1.5 shadow-sm overflow-hidden">
                  {current.company?.logo_url ? (
                    <img
                      src={current.company.logo_url}
                      alt={current.company.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-sm font-black" style={{ color: theme.accent }}>
                      {current.company?.name?.charAt(0) ?? current.trade.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-black text-sm sm:text-base leading-tight truncate">
                    {current.company?.name ?? `${current.trade} Pros`}
                  </h4>
                  <p className="text-white/85 uppercase tracking-widest font-extrabold text-[9px] mt-0.5">
                    Work Request Form
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3.5">
                <DisplayField icon={User} label="Full Name" value="Jennifer L." accent={theme.accent} />

                <div className="grid grid-cols-2 gap-2.5">
                  <DisplayField icon={Phone} label="Phone" value="(555) 382-9102" accent={theme.accent} />
                  <DisplayField icon={Mail} label="Email" value="jennifer@example.com" accent={theme.accent} />
                </div>

                {/* Service chips — themed, current selection highlighted */}
                <div>
                  <label className={fieldLabelClass}>Service Needed</label>
                  <div className="flex flex-wrap gap-1.5">
                    {serviceOptions.map((opt) => {
                      const isSelected = opt === prefill.service;
                      return (
                        <span
                          key={opt}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors duration-500"
                          style={
                            isSelected
                              ? { backgroundColor: theme.accent, color: '#fff', borderColor: 'transparent' }
                              : {
                                  backgroundColor: `color-mix(in srgb, ${theme.accent} 5%, white)`,
                                  borderColor: `color-mix(in srgb, ${theme.accent} 16%, white)`,
                                  color: `color-mix(in srgb, ${theme.accent} 55%, #64748b)`,
                                }
                          }
                        >
                          {opt}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <DisplayField icon={MapPin} label="Service Address" value={prefill.address} accent={theme.accent} />
                <DisplayField icon={FileText} label="Project Details" value={prefill.notes} accent={theme.accent} multiline />

                {/* Photo attachment mock */}
                <div>
                  <label className={fieldLabelClass}>Site Photos</label>
                  <div
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 border transition-colors duration-500"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${theme.accent} 5%, white)`,
                      borderColor: `color-mix(in srgb, ${theme.accent} 16%, white)`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${theme.accent}20` }}
                    >
                      <Camera className="w-4 h-4" style={{ color: theme.accent }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">site-photo.jpg</p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Attached
                      </p>
                    </div>
                  </div>
                </div>

                {!hasSubmitted ? (
                  <button
                    type="button"
                    onClick={handleSimulatedSubmit}
                    disabled={isSubmitting}
                    style={{ backgroundColor: theme.accent }}
                    className="w-full flex items-center justify-center gap-2 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4 animate-bounce" /> Dispatching...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Job Request <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-black text-xs">
                      <Sparkles className="w-4 h-4" /> Dispatched directly to board &rarr;
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHasSubmitted(false);
                        setExtraLeads([]);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline uppercase"
                    >
                      Reset &amp; Test Again
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-semibold pt-1">
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                  <span>Instant dispatch &amp; client SMS routing enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DASHBOARD PANEL */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${hasSubmitted ? 'bg-emerald-400 animate-ping' : 'bg-teal-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  {hasSubmitted ? '★ New Lead Arrived!' : 'Live Dashboard'}
                </span>
              </div>
              <DispatchViewSwitcher view={view} onChange={setView} isDark={true} />
            </div>

            {/* DASHBOARD CARD PANEL */}
            <div className={`p-4 sm:p-5 rounded-2xl border bg-slate-950/80 backdrop-blur-md shadow-2xl space-y-4 transition-colors ${theme.cardBorder}`}>
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
                view={view}
                isDark={true}
              />
            </div>

            <div className="pt-1 flex items-center justify-center gap-1.5 text-white/50 text-xs font-bold text-center">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>Real-time lead status updates</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}