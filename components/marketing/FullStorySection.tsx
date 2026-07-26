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
  icon: React.ElementType;
}

/** One flat list. The old left/right `side` split was arbitrary and forced
 *  two separate rendering blocks for identical buttons. */
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
    description: 'Build from saved templates, adjust the scope, send it from the job card.',
    icon: FileText,
  },
  {
    id: 'schedule',
    title: 'Scheduling',
    shortTitle: 'Schedule',
    description: 'Assign the foreman, set the date, and the confirmation goes out with it.',
    icon: Calendar,
  },
  {
    id: 'invoice',
    title: 'Invoicing',
    shortTitle: 'Invoices',
    description: 'Turn the estimate into an invoice, send it, and watch the balance.',
    icon: Receipt,
  },
  {
    id: 'media',
    title: 'Photos & Docs',
    shortTitle: 'Media',
    description: 'Before and after shots, permits, and contracts attached to the job.',
    icon: ImageIcon,
  },
];

const TABS: { id: FeatureId; label: string }[] = FEATURES.map((f) => ({
  id: f.id,
  label: f.shortTitle,
}));

// --- Shared phone shell ---

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
    <div className="bg-[#111827] px-3.5 pt-7 pb-2 border-b border-slate-800/60 shrink-0">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-800/80 text-slate-400 flex items-center justify-center shrink-0">
            <ArrowLeft size={13} />
          </div>
          <h2 className="text-sm font-black tracking-tight text-white truncate">Jennifer L.</h2>
          <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <span className="w-1 h-1 bg-teal-400 rounded-full" /> Active
          </span>
        </div>
        <div className="flex gap-1 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-slate-800/40 text-slate-400 flex items-center justify-center"><MoreVertical size={12} /></div>
          <div className="w-7 h-7 rounded-lg bg-slate-800/40 text-slate-400 flex items-center justify-center"><X size={12} /></div>
        </div>
      </div>

      <p className="text-[11px] font-bold text-slate-400 mb-2 truncate">
        Ridge Line Roofing · Repair &amp; Shingles · #19
      </p>

      <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-800/30">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quote</span>
          <span className="text-[13px] font-black text-white">$9,290.00</span>
          <span className="text-[10px] font-black text-teal-400 block mt-0.5">Sent</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
          <span className="text-[13px] font-black text-white">Unpaid</span>
          <span className="text-[10px] font-bold text-rose-400 block mt-0.5">$9,290.00 due</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 text-[11px] font-bold shrink-0">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all font-black shrink-0 ${
                isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>

    <div className="flex-1 bg-[#f8fafc] overflow-y-auto flex flex-col relative min-h-0">{children}</div>

    <div className="bg-[#f1f5f9] border-t border-slate-200/80 py-2.5 text-center text-[11px] font-black text-slate-600 shrink-0">
      Close
    </div>
  </div>
);

// --- Views ---

const OverviewView = () => (
  <div className="p-3 space-y-3 flex-1 overflow-y-auto" style={{ fontFamily: font }}>
    <div className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
          <Users size={12} /> Client info
        </div>
        <span className="text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-0.5">
          Actions <ChevronDown size={10} strokeWidth={2.5} />
        </span>
      </div>
      <h3 className="text-base font-black text-slate-900 leading-tight">Jennifer L.</h3>
      <p className="text-[11px] font-bold text-slate-500 mt-0.5 mb-3 truncate">
        (555) 382-9102 · jennifer@example.com
      </p>

      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: 'Email', icon: Mail, color: 'text-teal-600' },
          { label: 'Call', icon: Phone, color: 'text-emerald-600' },
          { label: 'Text', icon: MessageSquare, color: 'text-indigo-600' },
        ].map((a) => (
          <span
            key={a.label}
            className="flex justify-center items-center gap-1 border border-slate-200 py-2 bg-white rounded-xl text-[11px] font-black text-slate-700"
          >
            <a.icon size={12} className={a.color} strokeWidth={2.5} /> {a.label}
          </span>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs">
      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2">
        <MessageSquare size={12} className="text-teal-600" strokeWidth={2.5} /> Their request
      </div>
      <p className="text-xs font-semibold text-slate-600 leading-relaxed">
        Looking for help with roof repair. Please reach out to schedule a time to
        look at the missing architectural shingles.
      </p>
    </div>
  </div>
);

const QuoteView = () => (
  <div className="p-3 overflow-y-auto flex-1 space-y-3" style={{ fontFamily: font }}>
    <div className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
            <FileText size={13} className="text-teal-600" /> Estimate #104
          </h3>
          <p className="text-[10px] text-teal-600 font-black mt-0.5">Sent Jul 6</p>
        </div>
        <span className="text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded text-[10px] font-black">
          From template
        </span>
      </div>

      <div className="space-y-2">
        {[
          { label: 'Debris Removal & Tear-Off', amt: '$2,290.00' },
          { label: 'Architectural Shingles (15 sq)', amt: '$7,000.00' },
        ].map((li) => (
          <div key={li.label} className="border border-slate-100 bg-slate-50/60 rounded-xl p-2.5">
            <h4 className="font-black text-slate-800 text-xs">{li.label}</h4>
            <div className="flex justify-between items-end mt-1">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Amount</p>
                <p className="text-xs font-black text-slate-900">{li.amt}</p>
              </div>
              <span className="w-6 h-6 rounded bg-rose-50 text-rose-500 flex items-center justify-center">
                <Trash2 size={11} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ScheduleView = () => (
  <div className="flex-1 flex flex-col justify-between p-3 min-h-0" style={{ fontFamily: font }}>
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-3 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-black text-slate-900 tracking-tight">Crew Schedule</h3>
        <div className="flex items-center gap-1">
          <span className="p-1.5 rounded-md border border-slate-200/80 bg-white text-slate-500"><Clock size={12} strokeWidth={2.5} /></span>
          <span className="p-1.5 rounded-md border border-slate-200/80 bg-white text-slate-500"><Calendar size={12} strokeWidth={2.5} /></span>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
          Assigned foreman
        </label>
        <div className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-slate-800 text-xs font-black">
          <span>Kevin (Ridge Line)</span>
          <ChevronDown size={12} className="text-slate-400" strokeWidth={2.5} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Date</label>
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-800 text-xs font-black">
            Jul 22
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Arrival</label>
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2 text-slate-800 text-xs font-black">
            8:00 AM
          </div>
        </div>
      </div>
    </div>

    <div className="bg-[#111827] rounded-xl p-2 mt-2 flex items-center justify-between text-white shadow-md">
      <span className="text-[11px] font-black text-slate-400 pl-1">Wed, Jul 22</span>
      <span className="bg-teal-600 text-white text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1">
        <Save size={12} strokeWidth={2.5} /> Save
      </span>
    </div>
  </div>
);

const InvoiceView = () => (
  <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-0" style={{ fontFamily: font }}>
    <div className="bg-[#111827] p-4 text-white shrink-0">
      <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block mb-1">
        Outstanding balance
      </span>
      <h3 className="text-2xl font-black tracking-tight text-white">$9,290.00</h3>

      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/40">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase block">Collected</span>
          <span className="text-xs font-black text-teal-400">$0.00</span>
        </div>
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase block">Status</span>
          <span className="inline-block text-[10px] font-black bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 mt-0.5">
            Unpaid
          </span>
        </div>
      </div>
    </div>

    <div className="p-3 flex-1 overflow-y-auto">
      <div className="bg-white border border-slate-200/70 rounded-2xl p-3 shadow-2xs space-y-1">
        <div className="flex justify-between items-start mb-1">
          <div>
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Invoice</span>
            <h4 className="text-sm font-black text-slate-900 tracking-tight">INV-019</h4>
          </div>
          <span className="text-[10px] font-black bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">
            Sent
          </span>
        </div>

        <p className="text-[11px] font-bold text-slate-500">Due Jul 30</p>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <span className="border border-slate-200/80 text-slate-700 text-[11px] font-black py-2 rounded-lg flex items-center justify-center gap-1 bg-white">
            <Download size={12} strokeWidth={2.5} /> PDF
          </span>
          <span className="bg-[#111827] text-white text-[11px] font-black py-2 rounded-lg flex items-center justify-center gap-1">
            <Send size={12} strokeWidth={2.5} /> Resend
          </span>
        </div>
      </div>
    </div>
  </div>
);

const MediaView = () => (
  <div className="flex-1 flex flex-col p-3 min-h-0 justify-between" style={{ fontFamily: font }}>
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-3 space-y-2 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
          <ImageIcon size={13} className="text-teal-600" /> Project photos
        </h3>
        <span className="text-[10px] bg-slate-100 font-extrabold text-slate-600 px-2 py-0.5 rounded">
          1 photo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 content-start">
        <div className="relative rounded-lg border border-slate-200/80 overflow-hidden bg-slate-50 flex flex-col">
          <div className="w-full aspect-square relative bg-slate-200 overflow-hidden">
            <img src="/images/roof-damage.webp" alt="Roof damage site photo" className="w-full h-full object-cover" />
            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">
              Before
            </span>
          </div>
          <div className="p-1.5 bg-white border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-800 truncate">roof-damage.webp</p>
          </div>
        </div>

        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-100/50 flex flex-col items-center justify-center aspect-square text-slate-400">
          <Plus size={16} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-wider mt-1">After photo</span>
        </div>
      </div>
    </div>

    <div className="bg-[#111827] rounded-xl p-1.5 mt-2 flex items-center text-white shadow-md shrink-0">
      <span
        className="flex-1 text-white text-xs font-black py-2 rounded-lg flex items-center justify-center gap-1.5"
        style={{ backgroundColor: ACCENT }}
      >
        <Upload size={12} strokeWidth={3} /> Upload photo
      </span>
    </div>
  </div>
);

// --- Section ---

export default function InteractiveShowcase() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('overview');
  const active = FEATURES.find((f) => f.id === activeFeature) ?? FEATURES[0];

  const renderPhoneContent = () => {
    switch (activeFeature) {
      case 'quote': return <QuoteView />;
      case 'schedule': return <ScheduleView />;
      case 'invoice': return <InvoiceView />;
      case 'media': return <MediaView />;
      default: return <OverviewView />;
    }
  };

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 py-20 sm:py-28 px-4 sm:px-6 border-t border-white/10 text-white"
    >
      <div className="absolute top-1/3 -left-20 w-[420px] h-[420px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">

        <div className="max-w-2xl mb-10 sm:mb-14">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300 block mb-4">
            The job card
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.08] mb-4">
            Everything about the job,{' '}
            <span className="text-teal-300">on one screen.</span>
          </h2>
          <p className="text-slate-300 text-base font-semibold leading-relaxed">
            Pick a section to see what your crew sees in the field.
          </p>
        </div>

        {/* ONE control set. Scrolling pills on mobile, a stacked list on desktop. */}
        <div className="lg:hidden -mx-4 px-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
            {FEATURES.map((f) => {
              const isActive = activeFeature === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFeature(f.id)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-black whitespace-nowrap snap-start transition-colors ${
                    isActive
                      ? 'bg-teal-400 border-teal-300 text-slate-950'
                      : 'bg-white/5 border-white/15 text-slate-300'
                  }`}
                >
                  <f.icon size={14} strokeWidth={2.5} />
                  {f.shortTitle}
                </button>
              );
            })}
          </div>
          <p className="text-sm font-semibold text-slate-300 leading-relaxed mt-3 min-h-[2.5rem]">
            {active.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Desktop list — replaces the old split left/right card columns */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-2">
            {FEATURES.map((f) => {
              const isActive = activeFeature === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFeature(f.id)}
                  aria-pressed={isActive}
                  className={`w-full text-left rounded-2xl border transition-all duration-200 px-5 py-4 ${
                    isActive
                      ? 'border-teal-400/60 bg-white/10 shadow-lg'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-teal-400 text-slate-950' : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      <f.icon size={17} strokeWidth={2.5} />
                    </span>
                    <h3 className={`text-base font-black ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {f.title}
                    </h3>
                  </div>

                  {/* Description only on the active row — five paragraphs at once
                      is what made the old version a wall of text. */}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden text-sm font-semibold text-slate-300 leading-relaxed pl-12 pt-2"
                      >
                        {f.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>

          {/* Phone */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-[300px] sm:max-w-[320px] h-[560px] sm:h-[620px] bg-black rounded-[2.75rem] border-[9px] border-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
              <div className="absolute top-0 inset-x-0 h-5 z-50 flex justify-center pointer-events-none">
                <div className="w-20 h-3.5 bg-black rounded-b-xl relative">
                  <span className="absolute right-2 top-1 w-1 h-1 rounded-full bg-slate-800/60" />
                </div>
              </div>

              <PhoneAppShell activeTab={activeFeature} onTabChange={setActiveFeature}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
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
    </section>
  );
}