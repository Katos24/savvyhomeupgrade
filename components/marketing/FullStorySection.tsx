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
  Plus
} from 'lucide-react';

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
  <div className="h-full bg-[#0a0f1d] flex flex-col text-left">
    {/* Global Header Bar Context */}
    <div className="bg-[#111827] px-4 pt-9 pb-2 border-b border-slate-800/60 shrink-0">
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-slate-800/80 text-slate-400 flex items-center justify-center cursor-pointer">
            <ArrowLeft size={14} />
          </div>
          <h2 className="text-[14px] font-black tracking-tight text-white">Thomas M.</h2>
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span> Active <ChevronDown size={8} strokeWidth={3} />
          </span>
        </div>
        <div className="flex gap-1">
          <div className="w-7 h-7 rounded-lg bg-slate-800/40 text-slate-400 flex items-center justify-center"><MoreVertical size={13} /></div>
          <div className="w-7 h-7 rounded-lg bg-slate-800/40 text-slate-400 flex items-center justify-center"><X size={13} /></div>
        </div>
      </div>
      
      <p className="text-[10px] font-bold text-slate-500 mb-2.5 tracking-normal">Roof Repair & Shingle Replacement · #19 · Jun 22</p>

      {/* Metrics Row Block */}
      <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-800/30">
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Quote</span>
          <span className="text-xs font-black text-white">$9,290.00</span>
          <span className="text-[9px] font-black text-blue-400 block mt-0.5">Sent ✓</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Payment</span>
          <span className="text-xs font-black text-white">Unpaid</span>
          <span className="text-[9px] font-bold text-rose-400 block mt-0.5">$9,290.00 due</span>
        </div>
      </div>

      {/* Interactive Nested Scrollable Tab Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-2 text-[11px] font-bold text-slate-400 scrollbar-none">
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
              onClick={() => onTabChange(tab.id as FeatureId)}
              className={`px-3 py-1.5 rounded-lg transition-all font-black shrink-0 ${
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
    <div className="flex-1 bg-[#f8fafc] overflow-y-auto flex flex-col relative">
      {children}
    </div>

    {/* Close Window Shell Actions Footer Container */}
    <div className="bg-[#f1f5f9] border-t border-slate-200/80 py-3 text-center text-xs font-black text-slate-600 cursor-pointer hover:bg-slate-200 shrink-0 select-none">
      Close
    </div>
  </div>
);

// --- Individual View Implementation Blueprints ---

const OverviewView = () => (
  <div className="p-3 space-y-3 flex-1 overflow-y-auto">
    <div className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs text-left">
      <div className="flex justify-between items-center mb-2.5">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider">
          <Users size={12} className="text-slate-400" /> Client info
        </div>
        <button className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-0.5">
          Actions <ChevronDown size={10} strokeWidth={2.5} />
        </button>
      </div>
      <h3 className="text-base font-black text-slate-900 leading-tight">Thomas Miller</h3>
      <p className="text-[11px] font-bold text-slate-500 mt-0.5 mb-3">(631) 555-0144 • thomas@millerdocs.com</p>
      <div className="flex gap-2">
        <button className="flex-1 flex justify-center items-center gap-1 border border-slate-200 py-1.5 bg-white rounded-xl text-[11px] font-black text-slate-700 shadow-2xs">
          <Mail size={12} className="text-blue-500" strokeWidth={2.5} /> Email
        </button>
        <button className="flex-1 flex justify-center items-center gap-1 border border-slate-200 py-1.5 bg-white rounded-xl text-[11px] font-black text-slate-700 shadow-2xs">
          <Phone size={12} className="text-emerald-500" strokeWidth={2.5} /> Call
        </button>
        <button className="flex-1 flex justify-center items-center gap-1 border border-slate-200 py-1.5 bg-white rounded-xl text-[11px] font-black text-slate-700 shadow-2xs">
          <MessageSquare size={12} className="text-indigo-500" strokeWidth={2.5} /> Text
        </button>
      </div>
    </div>
    <div className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs text-left">
      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2">
        <MessageSquare size={12} className="text-emerald-500" strokeWidth={2.5} /> Storm Damage Report
      </div>
      <p className="text-xs font-medium text-slate-600 leading-relaxed">
        "Hey, I need an urgent estimate on replacing a section of architectural shingles on my front gables. High winds tore a large chunk off last night and rain is coming."
      </p>
    </div>
  </div>
);

const QuoteView = () => (
  <div className="p-3 overflow-y-auto flex-1 space-y-3">
    <div className="bg-white rounded-2xl border border-slate-200/60 p-3 shadow-xs text-left">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
            <FileText size={14} className="text-indigo-500" /> Roofing Estimate #104
          </h3>
          <p className="text-[9px] text-blue-500 font-black mt-0.5">Sent Jul 6</p>
        </div>
        <button className="text-indigo-600 bg-indigo-50 px-2 py-0.5 border border-indigo-100 rounded-md text-[10px] font-black flex items-center gap-0.5">
          <Sparkles size={10} /> AI assist
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-2.5">
          <h4 className="font-black text-slate-800 text-xs">Debris Removal & Roof Tear-Off</h4>
          <div className="flex justify-between items-end mt-1">
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Amount</p>
              <p className="text-xs font-black text-slate-900">$2,290.00</p>
            </div>
            <button className="w-6 h-6 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center"><Trash2 size={11} /></button>
          </div>
        </div>

        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-2.5">
          <h4 className="font-black text-slate-800 text-xs">Architectural Shingles (approx 15 squares)</h4>
          <div className="flex justify-between items-end mt-1">
            <div>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Amount</p>
              <p className="text-xs font-black text-slate-900">$7,000.00</p>
            </div>
            <button className="w-6 h-6 rounded-md bg-rose-50 text-rose-500 flex items-center justify-center"><Trash2 size={11} /></button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ScheduleView = () => (
  <div className="flex-1 flex flex-col justify-between p-3 min-h-0 text-left">
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-3.5 space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-[14px] font-black text-slate-900 tracking-tight">Crew Schedule</h3>
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-2xs hover:bg-slate-50">
            <Clock size={13} strokeWidth={2.5} />
          </button>
          <button className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-2xs hover:bg-slate-50">
            <Calendar size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
          👤 Assigned Foreman
        </label>
        <div className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2.5 flex items-center justify-between text-slate-800 text-xs font-black shadow-2xs">
          <span>Kevin</span>
          <ChevronDown size={14} className="text-slate-400" strokeWidth={2.5} />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
          Tear-off Date
        </label>
        <div className="w-full bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2.5 text-slate-800 text-xs font-black shadow-2xs">
          Jul 15, 2026
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
          Arrival Window
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2.5 flex items-center justify-between text-slate-800 text-xs font-black shadow-2xs">
            <span>7</span>
            <div className="flex flex-col text-[7px] text-slate-400 leading-none select-none">▲▼</div>
          </div>
          <span className="text-slate-400 font-black text-sm">:</span>
          <div className="flex-1 bg-slate-50/60 border border-slate-200/80 rounded-xl px-3 py-2.5 flex items-center justify-between text-slate-800 text-xs font-black shadow-2xs">
            <span>00</span>
            <div className="flex flex-col text-[7px] text-slate-400 leading-none select-none">▲▼</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 text-blue-600 rounded-xl px-3.5 py-2.5 text-xs font-black shadow-2xs">
            AM
          </div>
        </div>
      </div>
    </div>

    <div className="bg-[#111827] rounded-xl p-2.5 mt-4 flex items-center justify-between text-white shadow-md">
      <span className="text-[11px] font-black text-slate-400 pl-1">Wed, Jul 15</span>
      <div className="flex items-center gap-1.5">
        <button className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-black px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-700 shadow-2xs transition-colors">
          <Save size={12} strokeWidth={2.5} /> Save
        </button>
        <button className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg text-slate-300 border border-slate-700 shadow-2xs transition-colors">
          <Mail size={12} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </div>
);

const InvoiceView = () => (
  <div className="flex-1 flex flex-col bg-[#f8fafc] text-left min-h-0">
    <div className="bg-[#111827] p-4 text-white shadow-inner shrink-0">
      <span className="text-[9px] font-black tracking-wider text-slate-500 uppercase block mb-0.5">Outstanding Balance</span>
      <h3 className="text-2xl font-black tracking-tight text-white">$9,290.00</h3>
      
      <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/40">
        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider">Collected</span>
          <span className="text-xs font-black text-emerald-400">$0.00</span>
        </div>
        <div>
          <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider">Status</span>
          <span className="inline-block text-[9px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60 mt-0.5">Unpaid</span>
        </div>
      </div>
      
      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
        <div className="bg-emerald-400 h-full w-0" />
      </div>
      <span className="text-[8px] text-slate-500 font-extrabold mt-1 block tracking-tight">0% collected</span>
    </div>

    <div className="p-3 flex-1 overflow-y-auto">
      <div className="bg-white border border-slate-200/70 rounded-2xl p-3.5 shadow-2xs space-y-1">
        <div className="flex justify-between items-start mb-0.5">
          <div>
            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Invoice Document</span>
            <h4 className="text-sm font-black text-slate-900 tracking-tight leading-tight">INV-019</h4>
          </div>
          <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100">Sent</span>
        </div>
        
        <p className="text-[11px] font-bold text-slate-500">Due Jul 30, 2026</p>
        <p className="text-[11px] font-black text-emerald-600 pt-1 flex items-center gap-1">✓ Sent Jul 6, 2026</p>
        <p className="text-[10px] font-bold text-slate-400">Roofing Repair Work · $9,290.00</p>

        <div className="grid grid-cols-2 gap-2 pt-3">
          <button className="border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-[11px] font-black py-2 rounded-xl flex items-center justify-center gap-1 shadow-2xs transition-colors bg-white">
            <Download size={12} strokeWidth={2.5} /> PDF
          </button>
          <button className="bg-[#111827] hover:bg-slate-900 text-white text-[11px] font-black py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-colors">
            <Send size={12} strokeWidth={2.5} /> Resend
          </button>
        </div>
      </div>
    </div>
  </div>
);

const MediaView = () => (
  <div className="flex-1 flex flex-col p-3 min-h-0 text-left justify-between">
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs p-3.5 space-y-3 flex-1 flex flex-col min-h-0">
      
      {/* Tab/Category Sub-header inside Media */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
        <h3 className="text-[14px] font-black text-slate-900 tracking-tight flex items-center gap-1.5">
          <ImageIcon size={14} className="text-emerald-500" /> Project Photos
        </h3>
        <span className="text-[10px] bg-slate-100 font-extrabold text-slate-600 px-2 py-0.5 rounded-md">
          3 Files
        </span>
      </div>

      {/* Gallery Photo Grid Frame */}
      <div className="grid grid-cols-2 gap-2.5 overflow-y-auto pr-0.5 flex-1 content-start">
        
        {/* Item 1: High Fidelity Render containing the referenced image input */}
        <div className="group relative rounded-xl border border-slate-200/80 overflow-hidden bg-slate-50 shadow-2xs flex flex-col">
          <div className="w-full aspect-square relative bg-slate-200 overflow-hidden">
            <img 
              src="/images/roof-damage.webp" 
              alt="Wind Damage Assessment" 
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
              Before
            </span>
          </div>
          <div className="p-1.5 bg-white border-t border-slate-100">
            <p className="text-[9px] font-black text-slate-800 truncate">roof-damage.png</p>
            <p className="text-[8px] font-bold text-slate-400">Jul 6 · 1.4 MB</p>
          </div>
        </div>

        {/* Item 2: Placeholder for ongoing roofing documentation asset */}
        <div className="group relative rounded-xl border border-slate-200/40 overflow-hidden bg-slate-100/50 flex flex-col items-center justify-center aspect-square border-dashed border-2 text-slate-300">
          <Plus size={16} strokeWidth={2.5} />
          <span className="text-[8px] font-black uppercase tracking-wider mt-1">After Photo</span>
        </div>

      </div>
    </div>

    {/* Media Actions Sticky Operational Toolbar */}
    <div className="bg-[#111827] rounded-xl p-2 mt-3 flex items-center gap-2 text-white shadow-md shrink-0">
      <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors">
        <Upload size={12} strokeWidth={3} /> Upload Photo
      </button>
      <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black p-2 rounded-lg border border-slate-700 transition-colors">
        <FileText size={12} strokeWidth={2.5} />
      </button>
    </div>
  </div>
);

// --- Main Interactive Module Framework Engine Component ---

export default function InteractiveShowcase() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>('overview');

  // Restored renderPhoneContent function safely inside the component
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
    <section className="bg-slate-950 py-16 md:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.04),transparent_50%)] pointer-events-none" />

  <div className="max-w-7xl mx-auto">
  {/* Header Section - Left Aligned & Compact */}
  <div className="mb-8 sm:mb-12 text-left">
    {/* Step Badge + Subtitle Tag */}
    <div className="flex items-center gap-3 mb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-lg font-black text-slate-950">
        4
      </span>
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        The full story, tab by tab
      </span>
    </div>

    {/* Title & Description */}
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
      Manage your entire business <br className="hidden sm:block" />
      <span className="text-[#7BC94F]">from one screen.</span>
    </h2>
    <p className="text-slate-400 text-sm sm:text-base font-medium max-w-xl">
      Tap the modules below to look at how real-time operational control layouts update instantly inside the field app preview.
    </p>
  </div>

        {/* Mobile Viewports Top Horizontally Scrollable Selector Badges Row */}
  <div className="lg:hidden flex gap-2 overflow-x-auto pb-5 pt-1 px-1 snap-x scrollbar-none justify-start min-w-full items-center">
          {FEATURES.map((feature) => {
            const isSelected = activeFeature === feature.id;
            return (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-black transition-all whitespace-nowrap snap-center ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.25)] scale-105'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <feature.icon size={13} className={isSelected ? 'text-slate-950' : 'text-slate-500'} strokeWidth={2.5} />
                {feature.shortTitle}
              </button>
            );
          })}
        </div>

        {/* Responsive Grid Interface Wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Feature Selection Cards (Desktop only Column) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-5">
            {FEATURES.filter(f => f.side === 'left').map((feature) => {
              const isActive = activeFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 outline-none ${
                    isActive
                      ? 'border-emerald-500 bg-white shadow-xl scale-[1.02]'
                      : 'border-transparent bg-white/90 hover:bg-white hover:border-slate-350 shadow-md'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-colors ${
                    isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <feature.icon size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className={`text-lg font-black mb-1.5 transition-colors ${
                    isActive ? 'text-slate-950' : 'text-slate-800'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-xs leading-relaxed font-bold transition-colors ${
                    isActive ? 'text-slate-600' : 'text-slate-500'
                  }`}>
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Central Live Device Framework Sandbox Container */}
          <div className="col-span-1 lg:col-span-4 flex justify-center relative z-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            {/* Phone Outer Core Frame */}
            <div className="relative w-full max-w-[325px] sm:max-w-[340px] h-[640px] sm:h-[680px] bg-black rounded-[3rem] border-[9px] sm:border-[11px] border-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-800">
              
              {/* Device Dynamic Island Notch Element Spacer */}
              <div className="absolute top-0 inset-x-0 h-6 bg-transparent z-50 flex justify-center pointer-events-none">
                <div className="w-20 h-4 bg-black rounded-b-xl relative">
                  <div className="absolute right-3 top-1.5 w-1 h-1 rounded-full bg-slate-800/60"></div>
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
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    {renderPhoneContent()}
                  </motion.div>
                </AnimatePresence>
              </PhoneAppShell>
            </div>
          </div>

          {/* Right Feature Selection Cards (Desktop only Column) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-5">
            {FEATURES.filter(f => f.side === 'right').map((feature) => {
              const isActive = activeFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left p-5 rounded-3xl border-2 transition-all duration-300 outline-none ${
                    isActive
                      ? 'border-emerald-500 bg-white shadow-xl scale-[1.02]'
                      : 'border-transparent bg-white/90 hover:bg-white hover:border-slate-350 shadow-md'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 transition-colors ${
                    isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <feature.icon size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className={`text-lg font-black mb-1.5 transition-colors ${
                    isActive ? 'text-slate-950' : 'text-slate-800'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-xs leading-relaxed font-bold transition-colors ${
                    isActive ? 'text-slate-600' : 'text-slate-500'
                  }`}>
                    {feature.description}
                  </p>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}