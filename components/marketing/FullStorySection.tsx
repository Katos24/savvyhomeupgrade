'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  FileText,
  Calendar,
  Receipt,
  Image as ImageIcon,
  ArrowLeft,
  MoreVertical,
  X,
  Mail,
  Phone,
  MessageSquare,
  Trash2,
  ChevronDown,
  Clock,
  Save,
  Download,
  Send,
  Upload,
  Plus,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

const font = "'Nunito', sans-serif";
const ACCENT = '#0F766E';

// --- Types & Configuration ---

type FeatureId = 'overview' | 'quote' | 'schedule' | 'invoice' | 'media';

interface Feature {
  id: FeatureId;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
}

const FEATURES: Feature[] = [
  {
    id: 'overview',
    title: 'Client Management',
    shortTitle: 'Overview',
    description: 'Contact details and the original request side by side, so nobody digs through texts.',
    icon: Users,
  },
  {
    id: 'quote',
    title: 'Estimates',
    shortTitle: 'Estimates',
    description: 'Build from saved templates, adjust the scope, send it directly from the job card.',
    icon: FileText,
  },
  {
    id: 'schedule',
    title: 'Scheduling',
    shortTitle: 'Schedule',
    description: 'Assign the foreman, set the date, and the confirmation goes out automatically.',
    icon: Calendar,
  },
  {
    id: 'invoice',
    title: 'Invoicing',
    shortTitle: 'Invoices',
    description: 'Turn the estimate into an invoice, send it, and watch live payment updates.',
    icon: Receipt,
  },
  {
    id: 'media',
    title: 'Photos & Docs',
    shortTitle: 'Media',
    description: 'Before and after shots, permits, and contracts attached straight to the job.',
    icon: ImageIcon,
  },
];

const TABS: { id: FeatureId; label: string }[] = FEATURES.map((f) => ({
  id: f.id,
  label: f.shortTitle,
}));

// --- Shared Phone App Shell ---

const PhoneAppShell = ({
  children,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode;
  activeTab: FeatureId;
  onTabChange: (id: FeatureId) => void;
}) => (
  <div className="h-full bg-[#0a0f1d] flex flex-col text-left select-none" style={{ fontFamily: font }}>
    {/* Phone Top Nav */}
    <div className="bg-[#111827] px-3.5 pt-7 sm:px-4 sm:pt-8 pb-3 border-b border-slate-800/80 shrink-0">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-800/80 text-slate-400 flex items-center justify-center shrink-0">
            <ArrowLeft size={14} />
          </div>
          <h2 className="text-xs sm:text-sm font-black tracking-tight text-white truncate">Jennifer L.</h2>
          <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" /> Active
          </span>
        </div>
        <div className="flex gap-1 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-slate-800/40 text-slate-400 flex items-center justify-center">
            <MoreVertical size={12} />
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-800/40 text-slate-400 flex items-center justify-center">
            <X size={12} />
          </div>
        </div>
      </div>

      <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 mb-3 truncate">
        Ridge Line Roofing · Repair &amp; Shingles · #19
      </p>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-800/40">
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quote</span>
          <span className="text-xs sm:text-[13px] font-black text-white">$9,290.00</span>
          <span className="text-[9px] sm:text-[10px] font-black text-teal-400 block mt-0.5">Sent</span>
        </div>
        <div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
          <span className="text-xs sm:text-[13px] font-black text-white">Unpaid</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-rose-400 block mt-0.5">$9,290.00 due</span>
        </div>
      </div>

      {/* Internal Interactive Phone Nav Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 text-[10px] sm:text-[11px] font-bold shrink-0 no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all font-black shrink-0 relative ${
                isActive ? 'text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="phoneTabHighlight"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>

    {/* Phone Body Container */}
    <div className="flex-1 bg-[#f8fafc] overflow-y-auto flex flex-col relative min-h-0">{children}</div>

    {/* Phone Footer */}
    <div className="bg-[#f1f5f9] border-t border-slate-200/80 py-2.5 text-center text-[10px] sm:text-[11px] font-black text-slate-600 shrink-0">
      Close Card
    </div>
  </div>
);

// --- Inner Views ---

const OverviewView = () => (
  <div className="p-3 sm:p-4 space-y-3 flex-1 overflow-y-auto" style={{ fontFamily: font }}>
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
          <Users size={12} /> Client info
        </div>
        <button type="button" className="text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black flex items-center gap-1">
          Actions <ChevronDown size={10} strokeWidth={2.5} />
        </button>
      </div>
      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">Jennifer L.</h3>
      <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5 mb-3 truncate">
        (555) 382-9102 · jennifer@example.com
      </p>

      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: 'Email', icon: Mail, color: 'text-teal-600' },
          { label: 'Call', icon: Phone, color: 'text-emerald-600' },
          { label: 'Text', icon: MessageSquare, color: 'text-indigo-600' },
        ].map((a) => (
          <button
            key={a.label}
            type="button"
            className="flex justify-center items-center gap-1 border border-slate-200/80 py-2 bg-white hover:bg-slate-50 rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 transition-colors"
          >
            <a.icon size={12} className={a.color} strokeWidth={2.5} /> {a.label}
          </button>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-2">
        <MessageSquare size={12} className="text-teal-600" strokeWidth={2.5} /> Their request
      </div>
      <p className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-relaxed">
        Looking for help with roof repair. Please reach out to schedule a time to
        look at the missing architectural shingles.
      </p>
    </div>
  </div>
);

const QuoteView = () => (
  <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3" style={{ fontFamily: font }}>
    <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
            <FileText size={13} className="text-teal-600" /> Estimate #104
          </h3>
          <p className="text-[9px] sm:text-[10px] text-teal-600 font-black mt-0.5">Sent Jul 6</p>
        </div>
        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded text-[9px] sm:text-[10px] font-black">
          From template
        </span>
      </div>

      <div className="space-y-2">
        {[
          { label: 'Debris Removal & Tear-Off', amt: '$2,290.00' },
          { label: 'Architectural Shingles (15 sq)', amt: '$7,000.00' },
        ].map((li) => (
          <div key={li.label} className="border border-slate-100 bg-slate-50/60 rounded-xl p-2.5 sm:p-3">
            <h4 className="font-black text-slate-800 text-xs">{li.label}</h4>
            <div className="flex justify-between items-end mt-1.5">
              <div>
                <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amount</p>
                <p className="text-[11px] sm:text-xs font-black text-slate-900">{li.amt}</p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${li.label}`}
                className="w-6 h-6 rounded bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ScheduleView = () => (
  <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 min-h-0" style={{ fontFamily: font }}>
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">Crew Schedule</h3>
        <div className="flex items-center gap-1">
          <span className="p-1.5 rounded-md border border-slate-200/80 bg-white text-slate-500">
            <Clock size={12} strokeWidth={2.5} />
          </span>
          <span className="p-1.5 rounded-md border border-slate-200/80 bg-white text-slate-500">
            <Calendar size={12} strokeWidth={2.5} />
          </span>
        </div>
      </div>

      <div>
        <label className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
          Assigned foreman
        </label>
        <button
          type="button"
          className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-slate-800 text-xs font-black hover:bg-slate-100/60 transition-colors"
        >
          <span>Kevin (Ridge Line)</span>
          <ChevronDown size={12} className="text-slate-400" strokeWidth={2.5} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Date</label>
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-800 text-xs font-black">
            Jul 22
          </div>
        </div>
        <div>
          <label className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Arrival</label>
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-800 text-xs font-black">
            8:00 AM
          </div>
        </div>
      </div>
    </div>

    <div className="bg-[#111827] rounded-xl p-2.5 mt-3 flex items-center justify-between text-white shadow-md">
      <span className="text-[10px] sm:text-[11px] font-black text-slate-400 pl-1">Wed, Jul 22</span>
      <button type="button" className="bg-teal-600 hover:bg-teal-500 text-white text-[10px] sm:text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
        <Save size={12} strokeWidth={2.5} /> Save
      </button>
    </div>
  </div>
);

const InvoiceView = () => (
  <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-0" style={{ fontFamily: font }}>
    <div className="bg-[#111827] p-3.5 sm:p-4 text-white shrink-0">
      <span className="text-[9px] sm:text-[10px] font-black tracking-wider text-slate-400 uppercase block mb-1">
        Outstanding balance
      </span>
      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">$9,290.00</h3>

      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/40">
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase block">Collected</span>
          <span className="text-xs font-black text-teal-400">$0.00</span>
        </div>
        <div>
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase block">Status</span>
          <span className="inline-block text-[9px] sm:text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 mt-0.5">
            Unpaid
          </span>
        </div>
      </div>
    </div>

    <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 sm:p-4 shadow-sm space-y-1.5">
        <div className="flex justify-between items-start mb-1">
          <div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-400 block uppercase tracking-wider">Invoice</span>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">INV-019</h4>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-100">
            Sent
          </span>
        </div>

        <p className="text-[10px] sm:text-[11px] font-bold text-slate-500">Due Jul 30</p>

        <div className="grid grid-cols-2 gap-2 pt-2.5">
          <button type="button" className="border border-slate-200/80 text-slate-700 text-[10px] sm:text-[11px] font-black py-2 rounded-lg flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 transition-colors">
            <Download size={12} strokeWidth={2.5} /> PDF
          </button>
          <button type="button" className="bg-[#111827] hover:bg-slate-800 text-white text-[10px] sm:text-[11px] font-black py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
            <Send size={12} strokeWidth={2.5} /> Resend
          </button>
        </div>
      </div>
    </div>
  </div>
);

const MediaView = () => (
  <div className="flex-1 flex flex-col p-3 sm:p-4 min-h-0 justify-between" style={{ fontFamily: font }}>
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 sm:p-4 space-y-2.5 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
          <ImageIcon size={13} className="text-teal-600" /> Project photos
        </h3>
        <span className="text-[9px] sm:text-[10px] bg-slate-100 font-extrabold text-slate-600 px-2 py-0.5 rounded">
          1 photo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 overflow-y-auto flex-1 content-start">
        <div className="relative rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50 flex flex-col">
          <div className="w-full aspect-square relative bg-slate-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-800/80 to-transparent flex items-center justify-center text-slate-400">
              <ImageIcon size={24} />
            </div>
            <span className="absolute bottom-1.5 left-1.5 bg-black/80 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded uppercase backdrop-blur-xs">
              Before
            </span>
          </div>
        </div>

        <button
          type="button"
          className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-100/50 hover:bg-slate-100 flex flex-col items-center justify-center aspect-square text-slate-400 transition-colors"
        >
          <Plus size={18} strokeWidth={2.5} />
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider mt-1">After</span>
        </button>
      </div>
    </div>

    <div className="bg-[#111827] rounded-xl p-2 mt-3 flex items-center text-white shadow-md shrink-0">
      <button
        type="button"
        className="flex-1 text-white text-[11px] sm:text-xs font-black py-2 rounded-lg flex items-center justify-center gap-2 transition-brightness hover:brightness-110 active:scale-[0.98]"
        style={{ backgroundColor: ACCENT }}
      >
        <Upload size={13} strokeWidth={3} /> Upload photo
      </button>
    </div>
  </div>
);

// --- Main Showcase Section ---

export default function InteractiveShowcase() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('overview');
  const active = FEATURES.find((f) => f.id === activeFeature) ?? FEATURES[0];

  const renderPhoneContent = () => {
    switch (activeFeature) {
      case 'quote':
        return <QuoteView />;
      case 'schedule':
        return <ScheduleView />;
      case 'invoice':
        return <InvoiceView />;
      case 'media':
        return <MediaView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 py-24 sm:py-32 lg:py-40 px-6 sm:px-12 border-t border-white/10 text-white"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-teal-300 mb-6">
            <Sparkles size={14} className="text-teal-400" /> Interactive Field Preview
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
            Everything about the job,{' '}
            <span className="text-teal-300">on one screen.</span>
          </h2>

          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed max-w-xl">
            Pick a section to see how your crew handles quotes, schedules, and photos live from the field.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 lg:gap-20 items-center">
          {/* DESKTOP SIDE BAR */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-3">
            {FEATURES.map((f) => {
              const isActive = activeFeature === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFeature(f.id)}
                  aria-pressed={isActive}
                  className={`w-full text-left rounded-2xl border transition-all duration-300 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                    isActive
                      ? 'border-teal-400/60 bg-white/10 shadow-xl'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-teal-400 text-slate-950' : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      <f.icon size={19} strokeWidth={2.5} />
                    </span>
                    <h3 className={`text-lg font-black ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {f.title}
                    </h3>
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <p className="text-sm font-semibold text-slate-300 leading-relaxed pl-14 pt-3">
                          {f.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* MOBILE & DESKTOP DISPLAY CANVAS */}
          <div className="lg:col-span-6 flex flex-col items-center">
            {/* Mobile Description Text above phone */}
            <div className="lg:hidden w-full text-center mb-6 min-h-[2.5rem]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={active.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm font-medium text-teal-200 leading-relaxed"
                >
                  {active.description}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Layout Wrapper: Mobile Left Tabs + Center Phone Shell */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
              {/* MOBILE LEFT TAB BAR (Hidden on desktop) */}
              <div className="flex lg:hidden flex-col gap-2 shrink-0">
                {FEATURES.map((f) => {
                  const isActive = activeFeature === f.id;
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFeature(f.id)}
                      aria-pressed={isActive}
                      className={`flex flex-col items-center justify-center w-14 h-14 py-2 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-teal-400 border-teal-300 text-slate-950 shadow-lg font-black scale-105'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-[9px] font-black mt-1 tracking-tight truncate max-w-[48px]">
                        {f.shortTitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* PHONE MOCKUP FRAME */}
              <div className="relative w-full max-w-[280px] xs:max-w-[300px] sm:max-w-[340px] h-[550px] xs:h-[580px] sm:h-[640px] bg-black rounded-[2.5rem] sm:rounded-[3rem] border-[8px] sm:border-[10px] border-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/10 shrink-0">
                {/* Dynamic Camera Notch */}
                <div className="absolute top-0 inset-x-0 h-4 sm:h-5 z-50 flex justify-center pointer-events-none">
                  <div className="w-20 sm:w-24 h-3.5 sm:h-4 bg-black rounded-b-xl relative">
                    <span className="absolute right-2 top-1 w-1 h-1 rounded-full bg-slate-800/60" />
                  </div>
                </div>

                <PhoneAppShell activeTab={activeFeature} onTabChange={setActiveFeature}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeFeature}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="w-full h-full flex flex-col min-h-0"
                    >
                      {renderPhoneContent()}
                    </motion.div>
                  </AnimatePresence>
                </PhoneAppShell>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}