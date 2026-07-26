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
  Sparkles,
  Trash2,
  ChevronDown,
  Clock,
  Save,
  Download,
  Send,
  Upload,
  Plus,
  ChevronRight
} from 'lucide-react';

const font = "'Nunito', sans-serif";

const BRAND_NAVY = '#0B3C6D';
const ACCENT = '#0F766E';
const ACCENT_LIGHT = '#14B8A6';
const VERIFIED_GREEN = '#166534';

// --- Types & Configuration ---

type FeatureId = 'overview' | 'quote' | 'schedule' | 'invoice' | 'media';

interface Feature {
  id: FeatureId;
  title: string;
  shortTitle: string; 
  description: string;
  icon: React.ElementType;
  side: 'left' | 'right';
}

const FEATURES: Feature[] = [
  {
    id: 'overview',
    title: 'Client Management',
    shortTitle: 'Overview',
    description: 'Client contact info and the original job request, side by side — no digging through texts.',
    icon: Users,
    side: 'left',
  },
  {
    id: 'quote',
    title: 'Smart Estimates',
    shortTitle: 'Estimates',
    description: 'Build estimates in minutes with pre-built templates and AI assistance.',
    icon: FileText,
    side: 'left',
  },
  {
    id: 'schedule',
    title: 'Project Scheduling',
    shortTitle: 'Schedule',
    description: 'Keep your team on track with centralized project calendars.',
    icon: Calendar,
    side: 'left',
  },
  {
    id: 'invoice',
    title: '1-Click Invoicing',
    shortTitle: 'Invoices',
    description: 'Convert estimates to invoices instantly. Send via email with attached PDFs.',
    icon: Receipt,
    side: 'right',
  },
  {
    id: 'media',
    title: 'Media & Docs',
    shortTitle: 'Media',
    description: 'Store before/after photos, licenses, and contracts in one place.',
    icon: ImageIcon,
    side: 'right',
  },
];

// --- Shared Interactive Phone Shell Layout Component ---

const PhoneAppShell = ({ 
  children, 
  activeTab, 
  onTabChange 
}: { 
  children: React.ReactNode; 
  activeTab: FeatureId; 
  onTabChange: (id: FeatureId) => void;
}) => (
  <div className="h-full bg-[#0a0f1d] flex flex-col text-left select-none" style={{ fontFamily: font }}>
    {/* Global Header Bar Context */}
    <div className="bg-[#111827] px-3 sm:px-4 pt-7 sm:pt-9 pb-2 border-b border-slate-800/60 shrink-0">
      <div className="flex justify-between items-center mb-1.5 sm:mb-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800/80 text-slate-400 flex items-center justify-center shrink-0">
            <ArrowLeft size={13} />
          </div>
          <h2 className="text-xs sm:text-[14px] font-black tracking-tight text-white truncate">Jennifer L.</h2>
          <span className="bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
            <span className="w-1 h-1 bg-teal-400 rounded-full"></span> Active
          </span>
        </div>
        <div className="flex gap-1 shrink-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800/40 text-slate-400 flex items-center justify-center"><MoreVertical size={12} /></div>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800/40 text-slate-400 flex items-center justify-center"><X size={12} /></div>
        </div>
      </div>
      
      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 mb-2 truncate">
        Ridge Line Roofing · Repair & Shingles · #19
      </p>

      {/* Metrics Row Block */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 pb-2 border-b border-slate-800/30">
        <div>
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Quote</span>
          <span className="text-[11px] sm:text-xs font-black text-white">$9,290.00</span>
          <span className="text-[8px] sm:text-[9px] font-black text-teal-400 block mt-0.5">Sent ✓</span>
        </div>
        <div>
          <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Payment</span>
          <span className="text-[11px] sm:text-xs font-black text-white">Unpaid</span>
          <span className="text-[8px] sm:text-[9px] font-bold text-rose-400 block mt-0.5">$9,290.00 due</span>
        </div>
      </div>

      {/* Interactive Nested Scrollable Tab Row */}
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pt-2 text-[10px] sm:text-[11px] font-bold text-slate-400 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'quote', label: 'Quote' },
          { id: 'schedule', label: 'Schedule' },
          { id: 'invoice', label: 'Invoice' },
          { id: 'media', label: 'Media' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id as FeatureId)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all font-black shrink-0 ${
                isActive 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>

    {/* View Content Display Screen Area */}
    <div className="flex-1 bg-[#f8fafc] overflow-y-auto flex flex-col relative min-h-0">
      {children}
    </div>

    {/* Close Window Shell Actions Footer Container */}
    <div className="bg-[#f1f5f9] border-t border-slate-200/80 py-2 sm:py-2.5 text-center text-[11px] font-black text-slate-600 shrink-0 select-none">
      Close
    </div>
  </div>
);

// --- Individual View Implementation Blueprints ---

const OverviewView = () => (
  <div className="p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 flex-1 overflow-y-auto" style={{ fontFamily: font }}>
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-2.5 sm:p-3 shadow-xs text-left">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
          <Users size={11} className="text-slate-400" /> Client info
        </div>
        <button className="text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded text-[9px] font-black flex items-center gap-0.5">
          Actions <ChevronDown size={9} strokeWidth={2.5} />
        </button>
      </div>
      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-tight">Jennifer L.</h3>
      <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 mt-0.5 mb-2.5 truncate">(555) 382-9102 • jennifer@example.com</p>
      
      {/* Quick Actions Bar */}
      <div className="grid grid-cols-3 gap-1.5">
        <button className="flex justify-center items-center gap-1 border border-slate-200 py-1.5 bg-white rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 shadow-2xs">
          <Mail size={11} className="text-teal-600" strokeWidth={2.5} /> Email
        </button>
        <button className="flex justify-center items-center gap-1 border border-slate-200 py-1.5 bg-white rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 shadow-2xs">
          <Phone size={11} className="text-emerald-600" strokeWidth={2.5} /> Call
        </button>
        <button className="flex justify-center items-center gap-1 border border-slate-200 py-1.5 bg-white rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 shadow-2xs">
          <MessageSquare size={11} className="text-indigo-600" strokeWidth={2.5} /> Text
        </button>
      </div>
    </div>

    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-2.5 sm:p-3 shadow-xs text-left">
      <div className="flex items-center gap-1 text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-1.5">
        <MessageSquare size={11} className="text-teal-600" strokeWidth={2.5} /> Customer Request Message
      </div>
      <p className="text-[11px] sm:text-xs font-semibold text-slate-600 leading-relaxed">
        "Looking for help with roof repair at my property. Please reach out to schedule a time to take a look at missing architectural shingles."
      </p>
    </div>
  </div>
);

const QuoteView = () => (
  <div className="p-2.5 sm:p-3 overflow-y-auto flex-1 space-y-2.5 sm:space-y-3" style={{ fontFamily: font }}>
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-2.5 sm:p-3 shadow-xs text-left">
      <div className="flex justify-between items-center mb-2.5">
        <div>
          <h3 className="font-black text-slate-900 text-xs flex items-center gap-1">
            <FileText size={13} className="text-teal-600" /> Roofing Estimate #104
          </h3>
          <p className="text-[9px] text-teal-600 font-black mt-0.5">Sent Jul 6</p>
        </div>
        <button className="text-teal-700 bg-teal-50 px-2 py-0.5 border border-teal-100 rounded text-[9px] font-black flex items-center gap-0.5">
          <Sparkles size={9} /> AI assist
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-2 sm:p-2.5">
          <h4 className="font-black text-slate-800 text-[11px] sm:text-xs">Debris Removal & Roof Tear-Off</h4>
          <div className="flex justify-between items-end mt-1">
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Amount</p>
              <p className="text-[11px] sm:text-xs font-black text-slate-900">$2,290.00</p>
            </div>
            <button className="w-5 h-5 rounded bg-rose-50 text-rose-500 flex items-center justify-center"><Trash2 size={10} /></button>
          </div>
        </div>

        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-2 sm:p-2.5">
          <h4 className="font-black text-slate-800 text-[11px] sm:text-xs">Architectural Shingles (15 sq)</h4>
          <div className="flex justify-between items-end mt-1">
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Amount</p>
              <p className="text-[11px] sm:text-xs font-black text-slate-900">$7,000.00</p>
            </div>
            <button className="w-5 h-5 rounded bg-rose-50 text-rose-500 flex items-center justify-center"><Trash2 size={10} /></button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ScheduleView = () => (
  <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-3 min-h-0 text-left" style={{ fontFamily: font }}>
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-xs p-2.5 sm:p-3 space-y-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs sm:text-[14px] font-black text-slate-900 tracking-tight">Crew Schedule</h3>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded-md border border-slate-200/80 bg-white text-slate-500">
            <Clock size={12} strokeWidth={2.5} />
          </button>
          <button className="p-1 rounded-md border border-slate-200/80 bg-white text-slate-500">
            <Calendar size={12} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div>
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
          👤 Assigned Foreman
        </label>
        <div className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-slate-800 text-[11px] sm:text-xs font-black">
          <span>Kevin (Ridge Line Team)</span>
          <ChevronDown size={12} className="text-slate-400" strokeWidth={2.5} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
            Tear-off Date
          </label>
          <div className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-slate-800 text-[11px] sm:text-xs font-black">
            Jul 22, 2026
          </div>
        </div>

        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">
            Arrival Time
          </label>
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-slate-800 text-[11px] sm:text-xs font-black">
            8:00 AM
          </div>
        </div>
      </div>
    </div>

    <div className="bg-[#111827] rounded-xl p-2 mt-2 flex items-center justify-between text-white shadow-md">
      <span className="text-[10px] font-black text-slate-400 pl-1">Wed, Jul 22</span>
      <div className="flex items-center gap-1">
        <button className="bg-teal-600 text-white text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Save size={11} strokeWidth={2.5} /> Save
        </button>
      </div>
    </div>
  </div>
);

const InvoiceView = () => (
  <div className="flex-1 flex flex-col bg-[#f8fafc] text-left min-h-0" style={{ fontFamily: font }}>
    <div className="bg-[#111827] p-3 sm:p-4 text-white shadow-inner shrink-0">
      <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-slate-400 uppercase block mb-0.5">Outstanding Balance</span>
      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">$9,290.00</h3>
      
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/40">
        <div>
          <span className="text-[8px] font-black text-slate-400 uppercase block">Collected</span>
          <span className="text-[11px] font-black text-teal-400">$0.00</span>
        </div>
        <div>
          <span className="text-[8px] font-black text-slate-400 uppercase block">Status</span>
          <span className="inline-block text-[8px] font-black bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60 mt-0.5">Unpaid</span>
        </div>
      </div>
    </div>

    <div className="p-2.5 sm:p-3 flex-1 overflow-y-auto">
      <div className="bg-white border border-slate-200/70 rounded-xl sm:rounded-2xl p-3 shadow-2xs space-y-1">
        <div className="flex justify-between items-start mb-0.5">
          <div>
            <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider">Invoice Document</span>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight">INV-019</h4>
          </div>
          <span className="text-[8px] font-black bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">Sent</span>
        </div>
        
        <p className="text-[10px] font-bold text-slate-500">Due Jul 30, 2026</p>

        <div className="grid grid-cols-2 gap-1.5 pt-2">
          <button className="border border-slate-200/80 text-slate-700 text-[10px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1 bg-white">
            <Download size={11} strokeWidth={2.5} /> PDF
          </button>
          <button className="bg-[#111827] text-white text-[10px] font-black py-1.5 rounded-lg flex items-center justify-center gap-1">
            <Send size={11} strokeWidth={2.5} /> Resend
          </button>
        </div>
      </div>
    </div>
  </div>
);

const MediaView = () => (
  <div className="flex-1 flex flex-col p-2.5 sm:p-3 min-h-0 text-left justify-between" style={{ fontFamily: font }}>
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/70 shadow-xs p-2.5 space-y-2 flex-1 flex flex-col min-h-0">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 shrink-0">
        <h3 className="text-xs sm:text-[14px] font-black text-slate-900 tracking-tight flex items-center gap-1">
          <ImageIcon size={13} className="text-teal-600" /> Project Photos
        </h3>
        <span className="text-[9px] bg-slate-100 font-extrabold text-slate-600 px-1.5 py-0.5 rounded">
          1 Photo
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 content-start">
        <div className="group relative rounded-lg border border-slate-200/80 overflow-hidden bg-slate-50 flex flex-col">
          <div className="w-full aspect-square relative bg-slate-200 overflow-hidden">
            <img 
              src="/images/roof-damage.webp" 
              alt="Roof Damage Site Photo" 
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[7px] font-black px-1 py-0.5 rounded uppercase">
              Before
            </span>
          </div>
          <div className="p-1 bg-white border-t border-slate-100">
            <p className="text-[8px] font-black text-slate-800 truncate">roof-damage.webp</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200/40 overflow-hidden bg-slate-100/50 flex flex-col items-center justify-center aspect-square border-dashed border-2 text-slate-300">
          <Plus size={14} strokeWidth={2.5} />
          <span className="text-[7px] font-black uppercase tracking-wider mt-0.5">After Photo</span>
        </div>
      </div>
    </div>

    <div className="bg-[#111827] rounded-xl p-1.5 mt-2 flex items-center gap-1.5 text-white shadow-md shrink-0">
      <button 
        className="flex-1 text-white text-[10px] sm:text-xs font-black py-1.5 rounded-lg flex items-center justify-center gap-1"
        style={{ backgroundColor: ACCENT }}
      >
        <Upload size={11} strokeWidth={3} /> Upload Photo
      </button>
    </div>
  </div>
);

// --- Main Component ---

export default function InteractiveShowcase() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('overview');

  const renderPhoneContent = () => {
    switch (activeFeature) {
      case 'overview': return <OverviewView />;
      case 'quote':    return <QuoteView />;
      case 'schedule': return <ScheduleView />;
      case 'invoice':  return <InvoiceView />;
      case 'media':    return <MediaView />;
      default:         return <OverviewView />;
    }
  };

  return (
    <section 
      style={{ fontFamily: font }}
      className="bg-slate-950 py-16 sm:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden relative border-t border-slate-800/80 text-white"
    >
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,118,110,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-teal-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section - Left Aligned */}
        <div className="mb-8 sm:mb-12 text-left">
          

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 leading-[1.1]">
            Manage your entire business <br className="hidden sm:block" />
            <span className="text-teal-400">from one screen.</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-bold max-w-xl leading-relaxed">
            Tap the tabs or modules below to explore how client data, estimates, schedules, and photos sync inside your field app.
          </p>
        </div>

        {/* Mobile Tab Selector Pill Bar */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 pt-1 px-1 snap-x scrollbar-none justify-start min-w-full items-center">
          {FEATURES.map((feature) => {
            const isSelected = activeFeature === feature.id;
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => setActiveFeature(feature.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-black transition-all whitespace-nowrap snap-center ${
                  isSelected
                    ? 'bg-teal-500 border-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 scale-105'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <feature.icon size={13} className={isSelected ? 'text-slate-950' : 'text-slate-400'} strokeWidth={2.5} />
                {feature.shortTitle}
              </button>
            );
          })}
        </div>

        {/* Main Grid Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Feature Cards (Desktop) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            {FEATURES.filter(f => f.side === 'left').map((feature) => {
              const isActive = activeFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 outline-none ${
                    isActive
                      ? 'border-teal-500 bg-white text-slate-950 shadow-2xl scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isActive ? 'bg-teal-50 text-teal-700' : 'bg-white/10 text-slate-300'
                  }`}>
                    <feature.icon size={18} strokeWidth={2.5} />
                  </div>
                  <h3 className={`text-base font-black mb-1 transition-colors ${
                    isActive ? 'text-slate-950' : 'text-white'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-xs leading-relaxed font-bold transition-colors ${
                    isActive ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Central Live Device Framework Sandbox */}
          <div className="col-span-1 lg:col-span-4 flex justify-center relative z-20">
            
            {/* Phone Outer Core Frame with Responsive Height */}
            <div className="relative w-full max-w-[320px] sm:max-w-[340px] min-h-[580px] sm:min-h-[660px] h-[75vh] max-h-[680px] bg-black rounded-[2.5rem] sm:rounded-[3rem] border-[8px] sm:border-[10px] border-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-800">
              
              {/* Dynamic Island Notch Element */}
              <div className="absolute top-0 inset-x-0 h-5 bg-transparent z-50 flex justify-center pointer-events-none">
                <div className="w-18 h-3.5 bg-black rounded-b-xl relative">
                  <div className="absolute right-2 top-1 w-1 h-1 rounded-full bg-slate-800/60"></div>
                </div>
              </div>

              {/* Layout Content Workspace Mount Shell */}
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

          {/* Right Feature Cards (Desktop) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-4">
            {FEATURES.filter(f => f.side === 'right').map((feature) => {
              const isActive = activeFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 outline-none ${
                    isActive
                      ? 'border-teal-500 bg-white text-slate-950 shadow-2xl scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    isActive ? 'bg-teal-50 text-teal-700' : 'bg-white/10 text-slate-300'
                  }`}>
                    <feature.icon size={18} strokeWidth={2.5} />
                  </div>
                  <h3 className={`text-base font-black mb-1 transition-colors ${
                    isActive ? 'text-slate-950' : 'text-white'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-xs leading-relaxed font-bold transition-colors ${
                    isActive ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Mobile Accordion Feature Cards Below Preview */}
          <div className="block lg:hidden w-full space-y-2 mt-4">
            {FEATURES.map((feature) => {
              const isActive = activeFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                    isActive
                      ? 'border-teal-500 bg-slate-900 text-white shadow-lg'
                      : 'border-slate-800/80 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <feature.icon size={16} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xs font-black truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                      {feature.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 leading-snug mt-0.5 line-clamp-2">
                      {feature.description}
                    </p>
                  </div>
                  <ChevronRight size={14} className={`shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}