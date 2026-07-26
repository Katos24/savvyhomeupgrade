'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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
  Roofing: ['Roof Inspection', 'Roof Replacement', 'Leak Repair', 'Gutter Work'],
  HVAC: ['AC Tune-Up', 'System Install', 'Duct Cleaning', 'Furnace Repair'],
  Plumbing: ['Drain Cleaning', 'Pipe Repair', 'Water Heater', 'Leak Detection'],
  Electrical: ['Panel Upgrade', 'Rewiring', 'Outlet Install', 'Lighting'],
  Solar: ['System Check', 'Panel Install', 'Inverter Repair', 'Battery Backup'],
};

const DEMO_CUSTOMER = 'Jennifer L.';
const COLLISION_FALLBACKS = ['Marcus T.', 'Dana R.', 'Priya S.'];

const DEMO_PREFILLS: Record<string, { service: string; notes: string; address: string }> = {
  Roofing: { service: 'Roof Inspection', notes: 'Missing shingles on south ridge', address: '42 Maple Ave, Brooklyn NY' },
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

const FIELD_LABEL_CLASS = 'text-[10px] sm:text-[9px] font-black text-slate-500 uppercase tracking-[0.1em] block mb-1 sm:mb-0.5';

function DisplayField({
  icon: Icon,
  label,
  value,
  theme,
  multiline = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  theme: Theme;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className={FIELD_LABEL_CLASS}>{label}</label>
      <div className="relative">
        <Icon className={`absolute left-3 sm:left-2.5 ${multiline ? 'top-3 sm:top-2.5' : 'top-1/2 -translate-y-1/2'} w-3.5 h-3.5 sm:w-3 sm:h-3 text-slate-400`} />
        <div
          className={`w-full pl-9 sm:pl-8 pr-3 sm:pr-2.5 py-2.5 sm:py-1.5 rounded-lg text-[13px] sm:text-xs font-semibold text-slate-800 select-none border transition-colors duration-500 ${
            multiline ? 'leading-snug min-h-[48px] sm:min-h-[38px]' : ''
          }`}
          style={{
            backgroundColor: theme.lightBg,
            borderColor: theme.lightBorder,
          }}
        >
          {value}
        </div>
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
    <div className="flex items-end justify-between gap-4 mb-5 min-h-[3.25rem]">
      <div className="flex items-start gap-3 min-w-0">
        <span
          className="mt-0.5 w-7 h-7 rounded-full border flex items-center justify-center text-[11px] font-black shrink-0 transition-colors duration-500"
          style={{
            color: accent,
            borderColor: `${accent}66`,
            backgroundColor: `${accent}1a`,
          }}
        >
          {step}
        </span>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
            {title}
          </h3>
          <p className="text-slate-500 font-semibold text-xs mt-1 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
      {trailing ? <div className="shrink-0 pb-0.5">{trailing}</div> : null}
    </div>
  );
}

export default function FormAndDashboardSection() {
  const [activeExample, setActiveExample] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [extraLeads, setExtraLeads] = useState<any[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

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

      if (typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        boardRef.current?.scrollIntoView({
          behavior: reduced ? 'auto' : 'smooth',
          block: 'start',
        });
      }
    }, 800);
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
      className={`relative py-20 sm:py-28 lg:py-32 transition-colors duration-700 ease-in-out overflow-hidden border-t border-b border-slate-200 ${theme.sectionBg}`}
    >
      <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 pointer-events-none opacity-[0.045] transition-all duration-700">
        <BackgroundTradeIcon className="w-[340px] h-[340px] lg:w-[420px] lg:h-[420px] text-slate-900" strokeWidth={1} />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase mb-4">
            See your brand in action
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Get your form and dashboard today.
            <span className="block mt-2 transition-colors duration-500" style={{ color: theme.textAccent }}>
              Your branding. Your way.
            </span>
          </h2>
          <p className="mt-5 text-slate-600 font-semibold text-sm sm:text-base leading-relaxed">
            Pick a trade below, then send the form on the left and watch the lead land on the board.
          </p>
        </div>

       {/* ── Trade selector: Inline Segmented Bar ──────────────────────── */}
<div className="mt-8 mb-10 flex justify-center">
  <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm max-w-full overflow-x-auto">
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
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200 shrink-0 ${
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

        {/* Form and Board Grid */}
        <div className="mt-14 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* LEFT: BRANDED FORM */}
          <div className="lg:col-span-4">
            <ColumnHeader
              step="1"
              title="What your customer fills out"
              subtitle={hasSubmitted ? 'Sent — check the board' : 'Change the answers, then press Submit'}
              accent={theme.textAccent}
              trailing={
                <span
                  className="inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border"
                  style={{
                    color: theme.textAccent,
                    backgroundColor: `${theme.textAccent}14`,
                    borderColor: `${theme.textAccent}33`,
                  }}
                >
                  {current.trade}
                </span>
              }
            />

            <div
              className="w-full rounded-2xl sm:rounded-3xl border overflow-hidden shadow-2xl transition-colors duration-500 bg-white"
              style={{ borderColor: `${theme.accent}40` }}
            >
              {/* Card Header */}
              <div
                className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 transition-colors duration-500"
                style={{ backgroundColor: theme.accent }}
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center shrink-0 p-1 shadow-sm overflow-hidden">
                  {current.company?.logo_url ? (
                    <img src={current.company.logo_url} alt={current.company.name} className="w-full h-full object-contain" />
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

              <div className="p-3.5 sm:p-4 space-y-2.5">
                <DisplayField icon={User} label="Full Name" value={DEMO_CUSTOMER} theme={theme} />

                <div className="grid grid-cols-2 gap-2">
                  <DisplayField icon={Phone} label="Phone" value="(555) 382-9102" theme={theme} />
                  <DisplayField icon={Mail} label="Email" value="jennifer@example.com" theme={theme} />
                </div>

                {/* Service Selection */}
                <div>
                  <label className={FIELD_LABEL_CLASS}>Service Needed</label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-1">
                    {serviceOptions.map((opt) => {
                      const isSelected = opt === activeService;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedService(opt)}
                          aria-pressed={isSelected}
                          className="px-3 py-2.5 sm:px-2 sm:py-1 rounded-lg sm:rounded-md text-xs sm:text-[10px] font-bold border transition-all duration-200 hover:brightness-95 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                          style={
                            isSelected
                              ? { backgroundColor: theme.accent, color: '#fff', borderColor: 'transparent' }
                              : { backgroundColor: theme.lightBg, borderColor: theme.lightBorder, color: '#475569' }
                          }
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Preference */}
                <div>
                  <label className={FIELD_LABEL_CLASS}>Preferred Time</label>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-1">
                    {['Morning', 'Afternoon', 'Flexible'].map((slot) => {
                      const isSelected = slot === timeWindow;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeWindow(slot)}
                          aria-pressed={isSelected}
                          className="px-2 py-2.5 sm:py-1.5 rounded-lg sm:rounded-md text-xs sm:text-[10px] font-bold border transition-all duration-200 hover:brightness-95 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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

                <DisplayField icon={MapPin} label="Service Address" value={prefill.address} theme={theme} />
                <DisplayField icon={FileText} label="Project Details" value={prefill.notes} theme={theme} multiline />

                {/* Site Photos */}
                <div>
                  <label className={FIELD_LABEL_CLASS}>Site Photos</label>
                  <div
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 sm:py-1.5 border transition-colors duration-500"
                    style={{ backgroundColor: theme.lightBg, borderColor: theme.lightBorder }}
                  >
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${theme.accent}20` }}>
                      <Camera className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {photoCount} photo{photoCount === 1 ? '' : 's'} attached
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Sent with the lead
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPhotoCount((n) => Math.max(0, n - 1))}
                        disabled={photoCount === 0}
                        aria-label="Remove photo"
                        className="w-9 h-9 sm:w-6 sm:h-6 rounded-lg sm:rounded-md border border-slate-300 bg-white text-slate-600 font-black text-base sm:text-sm leading-none flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 active:scale-95 transition"
                      >
                        &minus;
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoCount((n) => Math.min(4, n + 1))}
                        disabled={photoCount === 4}
                        aria-label="Add photo"
                        className="w-9 h-9 sm:w-6 sm:h-6 rounded-lg sm:rounded-md border border-slate-300 bg-white text-slate-600 font-black text-base sm:text-sm leading-none flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 active:scale-95 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {!hasSubmitted ? (
                  <div className="pt-3.5 mt-1 border-t border-slate-900/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400 text-center mb-2.5">
                      Try it — this button works
                    </p>
                    <div className="relative">
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-1.5 rounded-2xl blur-md opacity-60 motion-safe:animate-pulse"
                        style={{ backgroundColor: theme.textAccent }}
                      />
                      <button
                        type="button"
                        onClick={handleSimulatedSubmit}
                        disabled={isSubmitting}
                        style={{
                          backgroundColor: theme.textAccent,
                          boxShadow: `0 10px 24px -6px ${theme.textAccent}90`,
                        }}
                        className="relative w-full flex items-center justify-center gap-2.5 text-white py-3.5 sm:py-4 rounded-xl font-black text-sm sm:text-base tracking-tight ring-2 ring-white/70 transition-transform hover:brightness-110 active:scale-[0.98] disabled:opacity-70 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-900"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2.5">
                            <Send className="w-5 h-5 animate-bounce" /> Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2.5">
                            Submit job request
                            <ChevronRight className="w-5 h-5" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-black text-xs">
                      <Sparkles className="w-4 h-4" /> On the board &rarr;
                    </div>
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed px-1">
                      {activeService} · {timeWindow.toLowerCase()} · {photoCount} photo
                      {photoCount === 1 ? '' : 's'}
                    </p>
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
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DASHBOARD PANEL */}
          <div ref={boardRef} className="lg:col-span-8 scroll-mt-6">
            <ColumnHeader
              step="2"
              title="Where it lands on your board"
              subtitle={hasSubmitted ? 'New lead just arrived' : 'Live status, updated as work moves'}
              accent={theme.textAccent}
              trailing={
                <span
                  className={`w-2.5 h-2.5 rounded-full ${hasSubmitted ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`}
                  aria-hidden="true"
                />
              }
            />

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