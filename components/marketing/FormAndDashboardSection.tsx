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
  LayoutDashboard,
  FileEdit,
  ArrowRight,
  X,
  MousePointerClick,
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
  Roofing: ['Inspection', 'Replace', 'Leak Repair', 'Gutters'],
  HVAC: ['AC Tune-Up', 'Install', 'Duct Clean', 'Furnace'],
  Plumbing: ['Drain Clean', 'Pipe Repair', 'Water Heater', 'Leaks'],
  Electrical: ['Panel Upgrade', 'Rewiring', 'Outlet', 'Lighting'],
  Solar: ['System Check', 'Panels', 'Inverter', 'Battery'],
};

const DEMO_CUSTOMERS = ['Jennifer L.', 'Marcus T.', 'Dana R.', 'Priya S.'];
const COLLISION_FALLBACKS = ['Alex K.', 'Taylor B.', 'Sam V.'];

const DEMO_PREFILLS: Record<string, { service: string; notes: string; address: string }> = {
  Roofing: { service: 'Inspection', notes: 'Missing shingles on south ridge', address: '42 Maple Ave, Brooklyn NY' },
  HVAC: { service: 'AC Tune-Up', notes: 'Central AC blowing warm air', address: '128 Highland Rd, Austin TX' },
  Plumbing: { service: 'Drain Clean', notes: 'Main bathroom drain backing up', address: '88 Ocean Blvd, Miami FL' },
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
    sectionBg: 'bg-gradient-to-br from-orange-50 via-white to-slate-100 text-slate-900',
    accent: '#f97316',
    textAccent: '#c2410c',
    cardBorder: 'border-orange-500/30',
    lightBg: '#fff7ed',
    lightBorder: '#ffedd5',
    icon: Home,
  },
  HVAC: {
    sectionBg: 'bg-gradient-to-br from-sky-50 via-white to-slate-100 text-slate-900',
    accent: '#0284c7',
    textAccent: '#0369a1',
    cardBorder: 'border-sky-500/30',
    lightBg: '#f0f9ff',
    lightBorder: '#e0f2fe',
    icon: Flame,
  },
  Plumbing: {
    sectionBg: 'bg-gradient-to-br from-emerald-50 via-white to-slate-100 text-slate-900',
    accent: '#059669',
    textAccent: '#047857',
    cardBorder: 'border-emerald-500/30',
    lightBg: '#ecfdf5',
    lightBorder: '#d1fae5',
    icon: Droplet,
  },
  Electrical: {
    sectionBg: 'bg-gradient-to-br from-amber-50 via-white to-slate-100 text-slate-900',
    accent: '#d97706',
    textAccent: '#b45309',
    cardBorder: 'border-amber-500/30',
    lightBg: '#fffbeb',
    lightBorder: '#fef3c7',
    icon: Zap,
  },
  Solar: {
    sectionBg: 'bg-gradient-to-br from-teal-50 via-white to-slate-100 text-slate-900',
    accent: '#0d9488',
    textAccent: '#0f766e',
    cardBorder: 'border-teal-500/30',
    lightBg: '#f0fdfa',
    lightBorder: '#ccfbf1',
    icon: Sun,
  },
};

const FIELD_LABEL_CLASS = 'text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-0.5';

function InteractiveInput({
  icon: Icon,
  label,
  value,
  onChange,
  theme,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (val: string) => void;
  theme: Theme;
}) {
  return (
    <div>
      <label className={FIELD_LABEL_CLASS}>{label}</label>
      <div className="relative group">
        <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-8 pr-2 py-1.5 rounded-lg text-xs font-bold text-slate-800 border transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 cursor-pointer focus:cursor-text hover:brightness-95"
          style={{
            backgroundColor: theme.lightBg,
            borderColor: theme.lightBorder,
          }}
        />
      </div>
    </div>
  );
}

function ColumnHeader({
  step,
  title,
  subtitle,
  accent,
  trailing,
}: {
  step: string;
  title: string;
  subtitle: string;
  accent: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-3 lg:mb-5">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0"
          style={{
            color: accent,
            borderColor: `${accent}66`,
            backgroundColor: `${accent}1a`,
          }}
        >
          {step}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-slate-900 leading-tight truncate">
            {title}
          </h3>
          <p className="text-slate-500 font-semibold text-[11px] sm:text-xs leading-none truncate">
            {subtitle}
          </p>
        </div>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

export default function FormAndDashboardSection() {
  const [activeExample, setActiveExample] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [extraLeads, setExtraLeads] = useState<any[]>([]);
  
  // Interactive Form State
  const [customerName, setCustomerName] = useState(DEMO_CUSTOMERS[0]);
  const [customerPhone, setCustomerPhone] = useState('(555) 382-9102');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<string>('Morning');
  const [photoCount, setPhotoCount] = useState(1);

  // Mobile navigation
  const [mobileTab, setMobileTab] = useState<'form' | 'dashboard'>('form');
  const [showToast, setShowToast] = useState(false);

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
    setShowToast(false);
    setCustomerName(DEMO_CUSTOMERS[Math.floor(Math.random() * DEMO_CUSTOMERS.length)]);
  }, [activeExample]);

  const handleSimulatedSubmit = () => {
    if (isSubmitting || hasSubmitted) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newLiveLead = {
        id: `demo-live-${Date.now()}`,
        name: customerName,
        phone: customerPhone,
        email: `${customerName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
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
      setShowToast(true);
    }, 800);
  };

  const combinedLeads = useMemo(() => {
    const BASE_LEAD_COUNT = 3;
    const baseLeads = current.leads.slice(0, BASE_LEAD_COUNT).map((lead, i) =>
      lead.name?.trim().toLowerCase() === customerName.toLowerCase()
        ? { ...lead, name: COLLISION_FALLBACKS[i % COLLISION_FALLBACKS.length] }
        : lead
    );
    return [...extraLeads, ...baseLeads];
  }, [current.leads, extraLeads, customerName]);

  return (
    <section
      style={{ fontFamily: font }}
      className={`relative py-12 sm:py-20 lg:py-28 transition-colors duration-700 ease-in-out overflow-hidden border-t border-b border-slate-200 ${theme.sectionBg}`}
    >
      <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 pointer-events-none opacity-[0.045] transition-all duration-700">
        <BackgroundTradeIcon className="w-[280px] h-[280px] lg:w-[420px] lg:h-[420px] text-slate-900" strokeWidth={1} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto px-2">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-2">
            See your brand in action
          </p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Get your form and dashboard today.
            <span className="block mt-1 sm:mt-2 transition-colors duration-500" style={{ color: theme.textAccent }}>
              Your branding. Your way.
            </span>
          </h2>
          <p className="mt-3 text-slate-600 font-semibold text-xs sm:text-base leading-relaxed">
            Pick a trade, customize the form fields below, and submit to test real-time sync with the dispatch board.
          </p>
        </div>

        {/* Trade Selector */}
        <div className="mt-6 mb-6 lg:mb-10 flex justify-center">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm max-w-full overflow-x-auto no-scrollbar">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black tracking-wide transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MOBILE VIEW TOGGLE SWITCH (Hidden on Desktop) */}
        <div className="flex lg:hidden justify-center mb-6">
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl w-full max-w-xs font-bold text-xs">
            <button
              type="button"
              onClick={() => setMobileTab('form')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                mobileTab === 'form' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <FileEdit size={14} /> 1. Customer Form
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileTab('dashboard');
                setShowToast(false);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all relative ${
                mobileTab === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <LayoutDashboard size={14} /> 2. Live Board
              {hasSubmitted && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-1.5 right-2" />
              )}
            </button>
          </div>
        </div>

        {/* Grid Container */}
        <div className="mt-4 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* LEFT: BRANDED FORM CARD */}
          <div className={`lg:col-span-5 ${mobileTab === 'form' ? 'block' : 'hidden lg:block'}`}>
            <ColumnHeader
              step="1"
              title="Test Form"
              subtitle={hasSubmitted ? 'Submitted! Click board tab' : 'Try editing fields & press Submit'}
              accent={theme.textAccent}
              trailing={
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                  <MousePointerClick size={10} /> Live Demo
                </span>
              }
            />

            <div
              className="w-full rounded-2xl border overflow-hidden shadow-xl bg-white transition-all relative"
              style={{ borderColor: `${theme.accent}40` }}
            >
              {/* Header */}
              <div
                className="px-3 py-2 flex items-center justify-between transition-colors"
                style={{ backgroundColor: theme.accent }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center shrink-0 p-0.5 shadow-sm overflow-hidden">
                    {current.company?.logo_url ? (
                      <img src={current.company.logo_url} alt={current.company.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs font-black" style={{ color: theme.accent }}>
                        {current.company?.name?.charAt(0) ?? current.trade.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-black text-xs sm:text-sm leading-tight truncate">
                      {current.company?.name ?? `${current.trade} Pros`}
                    </h4>
                    <p className="text-white/80 uppercase tracking-widest font-extrabold text-[8px] mt-0.5">
                      Work Request Form
                    </p>
                  </div>
                </div>

                <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shrink-0">
                  Interactive
                </span>
              </div>

              <div className="p-3 space-y-2.5">
                {/* Editable Inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <InteractiveInput
                    icon={User}
                    label="Customer Name"
                    value={customerName}
                    onChange={setCustomerName}
                    theme={theme}
                  />
                  <InteractiveInput
                    icon={Phone}
                    label="Phone"
                    value={customerPhone}
                    onChange={setCustomerPhone}
                    theme={theme}
                  />
                </div>

                {/* Service Selection */}
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className={FIELD_LABEL_CLASS}>Select Service</label>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Click to pick</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {serviceOptions.map((opt) => {
                      const isSelected = opt === activeService;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedService(opt)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border truncate transition-all text-left flex items-center justify-between ${
                            isSelected ? 'ring-2 ring-slate-900/20 shadow-sm' : 'hover:border-slate-400'
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: theme.accent, color: '#fff', borderColor: 'transparent' }
                              : { backgroundColor: theme.lightBg, borderColor: theme.lightBorder, color: '#475569' }
                          }
                        >
                          <span className="truncate">{opt}</span>
                          {isSelected && <CheckCircle2 size={12} className="shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Window */}
                <div>
                  <label className={FIELD_LABEL_CLASS}>Preferred Time</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['Morning', 'Afternoon', 'Flexible'].map((slot) => {
                      const isSelected = slot === timeWindow;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeWindow(slot)}
                          className="px-1 py-1 rounded-md text-[10px] font-bold border transition-all"
                          style={
                            isSelected
                              ? { backgroundColor: theme.accent, color: '#fff', borderColor: 'transparent' }
                              : { backgroundColor: theme.lightBg, borderColor: theme.lightBorder, color: '#475569' }
                          }
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Address & Notes static preview */}
                <div className="space-y-1.5 pt-0.5">
                  <div>
                    <label className={FIELD_LABEL_CLASS}>Service Address</label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs text-slate-600 bg-slate-50 border-slate-200">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{prefill.address}</span>
                    </div>
                  </div>

                  <div>
                    <label className={FIELD_LABEL_CLASS}>Job Notes</label>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs text-slate-600 bg-slate-50 border-slate-200">
                      <FileText size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{prefill.notes}</span>
                    </div>
                  </div>
                </div>

                {/* Photos attachment */}
                <div
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 border"
                  style={{ backgroundColor: theme.lightBg, borderColor: theme.lightBorder }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Camera className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accent }} />
                    <span className="text-[11px] font-bold text-slate-800 truncate">
                      Attach Photos ({photoCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPhotoCount((n) => Math.max(0, n - 1))}
                      disabled={photoCount === 0}
                      className="w-5 h-5 rounded border border-slate-300 bg-white text-slate-600 font-black text-xs leading-none flex items-center justify-center disabled:opacity-30 hover:bg-slate-100"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoCount((n) => Math.min(4, n + 1))}
                      disabled={photoCount === 4}
                      className="w-5 h-5 rounded border border-slate-300 bg-white text-slate-600 font-black text-xs leading-none flex items-center justify-center disabled:opacity-30 hover:bg-slate-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                {!hasSubmitted ? (
                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <p className="text-[9px] font-black uppercase text-center text-slate-400 mb-1 flex items-center justify-center gap-1">
                      <Sparkles size={10} className="text-amber-500" /> Test real-time dispatch flow
                    </p>
                    <button
                      type="button"
                      onClick={handleSimulatedSubmit}
                      disabled={isSubmitting}
                      style={{ backgroundColor: theme.textAccent }}
                      className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-black text-xs tracking-tight transition-all hover:brightness-110 active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 animate-bounce" /> Dispatching...
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          Submit Job Request <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center space-y-1">
                    <p className="flex items-center justify-center gap-1 text-emerald-700 font-black text-xs">
                      <Sparkles className="w-3.5 h-3.5" /> Dispatched to Live Board!
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setHasSubmitted(false);
                        setExtraLeads([]);
                        setShowToast(false);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline uppercase"
                    >
                      Test Another Job
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: DASHBOARD PANEL */}
          <div className={`lg:col-span-7 ${mobileTab === 'dashboard' ? 'block' : 'hidden lg:block'}`}>
            <ColumnHeader
              step="2"
              title="Live Dispatch Board"
              subtitle={hasSubmitted ? 'New lead arrived!' : 'Real-time sync'}
              accent={theme.textAccent}
              trailing={
                <span
                  className={`w-2.5 h-2.5 rounded-full ${hasSubmitted ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}
                />
              }
            />

            <div className={`p-2.5 sm:p-4 rounded-2xl border bg-slate-950/90 backdrop-blur-md shadow-2xl space-y-3 transition-colors ${theme.cardBorder}`}>
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

      {/* FLOATING MOBILE TOAST NOTIFICATION */}
      {showToast && mobileTab === 'form' && (
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">Lead Dispatched!</p>
                <p className="text-[10px] text-slate-400 truncate">{customerName} added to board</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setMobileTab('dashboard');
                  setShowToast(false);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all"
              >
                View <ArrowRight size={12} />
              </button>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close notification"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}