'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, X, LayoutGrid, List, Inbox, ArrowRight,
  Plus, Calendar, ChevronLeft, ChevronRight,
  MousePointer2, Sparkles, Zap, CheckCircle2, Download, Bell, Mail, Users, CreditCard, Settings
} from 'lucide-react';
import DemoBanner from '@/components/demo/DemoBanner';
import DemoHeader from '@/components/demo/DemoHeader';
import LeadCard from '@/components/demo/LeadCard';
import LeadModal from '@/components/demo/LeadModal';
import SettingsPreviewCard from '@/components/demo/SettingsPreviewCard';
import DemoAIButton from '@/components/demo/DemoAIButton';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type Task = { id: string; label: string; done: boolean };
export type QuoteItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  category: string;
  status: string;
  created_at: string;
  address_line_1: string;
  city: string;
  zip_code: string;
  description: string;
  quote_total: string | null;
  payment_status: string;
  file_urls: string[];
  scheduled_date?: string;
  scheduled_time?: string;
  assigned_to?: string;
  ai_brief?: any;
  tasks?: Task[];
  quote_items?: QuoteItem[];
};

// ─── DEMO DATA ────────────────────────────────────────────────────────────────

const INITIAL_LEADS: Lead[] = [
  {
    id: 1, name: 'Michael Johnson', email: 'michael.j@gmail.com', phone: '(718) 555-0142',
    category: 'Roofing', status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    address_line_1: '142 Oak Street', city: 'Brooklyn', zip_code: '11201',
    description: 'Storm damage on south slope — approx 3 squares of missing shingles after last week\'s storm. Insurance claim in progress.',
    quote_total: '4200.00', payment_status: 'unpaid', file_urls: ['photo1.jpg', 'photo2.jpg'],
    tasks: [
      { id: 't1', label: 'Call to confirm scope', done: false },
      { id: 't2', label: 'Request insurance docs', done: false },
      { id: 't3', label: 'Schedule before adjuster visit', done: false },
    ],
    quote_items: [
      { id: 'q1', description: 'Shingle replacement — 3 squares', quantity: 3, unitPrice: 850, amount: 2550 },
      { id: 'q2', description: 'Underlayment & materials', quantity: 1, unitPrice: 950, amount: 950 },
      { id: 'q3', description: 'Labor & cleanup', quantity: 1, unitPrice: 700, amount: 700 },
    ],
    ai_brief: {
      summary: 'Storm damage job, high urgency. Customer has insurance claim in progress. Schedule estimate before adjuster visit.',
      urgency: 'high',
      next_steps: ['Call to confirm scope', 'Request insurance docs', 'Schedule before adjuster visit'],
    },
  },
  {
    id: 2, name: 'Sarah Kim', email: 'sarah.kim@gmail.com', phone: '(917) 555-0287',
    category: 'Renovation', status: 'quoted',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    address_line_1: '87 Maple Ave', city: 'Queens', zip_code: '11375',
    description: 'Full kitchen remodel — new cabinets, quartz countertops, backsplash. Budget around $25k.',
    quote_total: '18500.00', payment_status: 'unpaid', file_urls: ['photo1.jpg'],
    tasks: [
      { id: 't1', label: 'Send quote for review', done: true },
      { id: 't2', label: 'Follow up in 2 days', done: false },
    ],
    quote_items: [
      { id: 'q1', description: 'Cabinet installation', quantity: 1, unitPrice: 8500, amount: 8500 },
      { id: 'q2', description: 'Quartz countertops', quantity: 1, unitPrice: 6000, amount: 6000 },
      { id: 'q3', description: 'Backsplash tile & labor', quantity: 1, unitPrice: 4000, amount: 4000 },
    ],
    ai_brief: null,
  },
  {
    id: 3, name: 'James Park', email: 'james.park@gmail.com', phone: '(347) 555-0391',
    category: 'HVAC', status: 'scheduled',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    address_line_1: '234 Pine Road', city: 'Staten Island', zip_code: '10301',
    description: 'AC unit stopped blowing cold air. Unit is about 8 years old. Need someone ASAP.',
    quote_total: '890.00', payment_status: 'unpaid', file_urls: [],
    scheduled_date: '2026-04-10', scheduled_time: '09:00', assigned_to: 'Mike T.',
    tasks: [
      { id: 't1', label: 'Confirm appointment', done: true },
      { id: 't2', label: 'Bring refrigerant', done: false },
    ],
    quote_items: [
      { id: 'q1', description: 'AC diagnostic', quantity: 1, unitPrice: 150, amount: 150 },
      { id: 'q2', description: 'Refrigerant recharge', quantity: 1, unitPrice: 740, amount: 740 },
    ],
    ai_brief: null,
  },
  {
    id: 4, name: 'Lisa Morgan', email: 'lisa.m@gmail.com', phone: '(646) 555-0514',
    category: 'Fencing', status: 'in-progress',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    address_line_1: '678 Cedar Lane', city: 'Manhattan', zip_code: '10023',
    description: 'Fence is leaning and several pickets are missing. About 80 LF of wood privacy fence.',
    quote_total: '3100.00', payment_status: 'partial', file_urls: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
    tasks: [
      { id: 't1', label: 'Material pickup', done: true },
      { id: 't2', label: 'Demo old fence', done: true },
      { id: 't3', label: 'Install new posts', done: false },
      { id: 't4', label: 'Final inspection', done: false },
    ],
    quote_items: [
      { id: 'q1', description: 'Wood privacy fence 80 LF', quantity: 80, unitPrice: 28, amount: 2240 },
      { id: 'q2', description: 'Labor & demo', quantity: 1, unitPrice: 860, amount: 860 },
    ],
    ai_brief: null,
  },
  {
    id: 5, name: 'David Chen', email: 'david.chen@gmail.com', phone: '(212) 555-0623',
    category: 'Electrical', status: 'quoted',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    address_line_1: '901 Birch Blvd', city: 'Jersey City', zip_code: '07302',
    description: 'Need to upgrade electrical panel from 100 amp to 200 amp service. Adding a home office.',
    quote_total: '2450.00', payment_status: 'unpaid', file_urls: ['video1.mp4'],
    tasks: [{ id: 't1', label: 'Pull permit', done: false }],
    quote_items: [
      { id: 'q1', description: '200A panel upgrade', quantity: 1, unitPrice: 2450, amount: 2450 },
    ],
    ai_brief: null,
  },
  {
    id: 6, name: 'Amy Nguyen', email: 'amy.n@gmail.com', phone: '(516) 555-0745',
    category: 'Roofing', status: 'new',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    address_line_1: '456 Walnut St', city: 'Hoboken', zip_code: '07030',
    description: 'Roof is leaking near the chimney after heavy rain. Water stains on ceiling in master bedroom.',
    quote_total: '1850.00', payment_status: 'unpaid', file_urls: ['photo1.jpg'],
    tasks: [{ id: 't1', label: 'Schedule site visit', done: false }],
    quote_items: [
      { id: 'q1', description: 'Chimney flashing repair', quantity: 1, unitPrice: 950, amount: 950 },
      { id: 'q2', description: 'Shingle patch & sealant', quantity: 1, unitPrice: 600, amount: 600 },
      { id: 'q3', description: 'Interior water damage assessment', quantity: 1, unitPrice: 300, amount: 300 },
    ],
    ai_brief: null,
  },
  {
    id: 7, name: 'Robert Torres', email: 'r.torres@gmail.com', phone: '(914) 555-0856',
    category: 'Plumbing', status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    address_line_1: '321 Spruce Ave', city: 'Newark', zip_code: '07102',
    description: 'Water heater is leaking from the bottom. 50 gallon tank, about 12 years old. Need replacement.',
    quote_total: '1475.00', payment_status: 'paid', file_urls: [],
    tasks: [
      { id: 't1', label: 'Install new water heater', done: true },
      { id: 't2', label: 'Collect final payment', done: true },
    ],
    quote_items: [
      { id: 'q1', description: '50-gal water heater', quantity: 1, unitPrice: 875, amount: 875 },
      { id: 'q2', description: 'Installation labor', quantity: 1, unitPrice: 600, amount: 600 },
    ],
    ai_brief: null,
  },
  {
    id: 8, name: 'Maria Garcia', email: 'maria.g@gmail.com', phone: '(631) 555-0967',
    category: 'Painting', status: 'contacted',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    address_line_1: '555 Hickory Rd', city: 'Yonkers', zip_code: '10701',
    description: 'Full interior repaint of 3 bedroom house. Ceilings, walls, and trim. Need color consultation.',
    quote_total: '3400.00', payment_status: 'unpaid', file_urls: [],
    tasks: [{ id: 't1', label: 'Send color swatches', done: false }],
    quote_items: [
      { id: 'q1', description: 'Interior paint — 3 bed / 2 bath', quantity: 1, unitPrice: 2200, amount: 2200 },
      { id: 'q2', description: 'Ceiling paint', quantity: 1, unitPrice: 700, amount: 700 },
      { id: 'q3', description: 'Trim & doors', quantity: 1, unitPrice: 500, amount: 500 },
    ],
    ai_brief: null,
  },
];

export const STATUS_OPTIONS = [
  { value: 'new',         label: 'New',         hex: '#3b82f6' },
  { value: 'contacted',   label: 'Contacted',   hex: '#eab308' },
  { value: 'quoted',      label: 'Quoted',      hex: '#a855f7' },
  { value: 'scheduled',   label: 'Scheduled',   hex: '#10b981' },
  { value: 'in-progress', label: 'In Progress', hex: '#f97316' },
  { value: 'completed',   label: 'Completed',   hex: '#22c55e' },
  { value: 'cancelled',   label: 'Cancelled',   hex: '#ef4444' },
];

export const fmt = (n: string | number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n));

export const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const formatDateNice = (dateStr: string) => {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const formatTime12h = (timeStr: string) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};


// ADD before BrowserChrome component
const TOUR_STEPS = [
  {
    icon: <LayoutGrid className="w-5 h-5 text-indigo-400" />,
    title: 'This is your live dashboard',
    body: 'Every lead your customers submit lands here automatically. Tap any card to manage it.',
  },
  {
    icon: <Sparkles className="w-5 h-5 text-violet-400" />,
    title: 'Quotes, tasks, scheduling — all inside',
    body: 'Open a lead to send a quote, assign tasks, schedule a job, and track payment.',
  },
];

function DemoTour({ darkMode, onDone }: { darkMode: boolean; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  return (
<div className="fixed top-20 sm:bottom-24 sm:top-auto left-1/2 -translate-x-1/2 z-[500] w-[calc(100vw-32px)] max-w-sm pointer-events-none">      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="pointer-events-auto rounded-2xl shadow-2xl border p-6 bg-white border-gray-200"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-gray-50">
              {current.icon}
            </div>
            <div className="flex-1 min-w-0">
  <p className="text-sm font-black mb-1.5 text-gray-900">{current.title}</p>
              <p className="text-xs leading-relaxed text-gray-500">{current.body}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? 'w-5 bg-indigo-500'
                    : 'w-1.5 bg-gray-200'
                }`} />
              ))}
            </div>
            <button
              onClick={() => isLast ? onDone() : setStep(s => s + 1)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-xl transition active:scale-95"
            >
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── BROWSER CHROME ───────────────────────────────────────────────────────────

function BrowserChrome({ darkMode, children }: { darkMode: boolean; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl overflow-hidden border shadow-2xl ${
      darkMode ? 'border-white/10 shadow-black/50' : 'border-gray-300 shadow-gray-300/60'
    }`}>
      {/* Browser chrome bar — desktop only */}
      <div className={`hidden sm:flex items-center gap-3 px-4 py-3 border-b ${
        darkMode ? 'bg-[#0b1120] border-white/10' : 'bg-gray-200 border-gray-300'
      }`}>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs w-full max-w-sm ${
            darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-300'
          }`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`shrink-0 ${darkMode ? 'text-white/25' : 'text-gray-400'}`}>
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className={`font-mono ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>lead2project.com/</span>
            <span className={`font-mono font-semibold ${darkMode ? 'text-white/60' : 'text-gray-700'}`}>torres/dashboard</span>
          </div>
        </div>
        <div className="w-[54px] shrink-0" />
      </div>

      {/* Content — renders once */}
      <div className={darkMode ? 'bg-[#1e293b]' : 'bg-gray-50'}>
        {children}
      </div>
    </div>
  );
}

// ─── DEMO CREATE MODAL ────────────────────────────────────────────────────────

function DemoCreateModal({ darkMode, onClose }: { darkMode: boolean; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [form, setForm] = useState({ name: '', phone: '', email: '', category: 'Roofing', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('done');
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
    darkMode
      ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
  }`;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ${
        darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>
        {step === 'form' ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add New Lead</h2>
                <p className="text-indigo-400 text-[10px] uppercase tracking-widest font-bold mt-0.5">Demo Mode</p>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-white/5 text-white/40' : 'hover:bg-gray-100 text-gray-400'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Customer name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
                <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
              </div>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={`${inputClass} appearance-none cursor-pointer`}>
                {['Roofing', 'Renovation', 'HVAC', 'Plumbing', 'Electrical', 'Fencing', 'Painting'].map(c => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
              </select>
              <textarea rows={2} placeholder="Project details..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} />
              <button type="submit" className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl transition active:scale-95 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Create Lead
              </button>
            </form>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>This is a demo!</h3>
            <p className={`text-sm mb-6 leading-relaxed ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              In the real app, <span className="font-bold text-indigo-400">{form.name || 'this lead'}</span> would be instantly saved, notifications sent, and appear on your board.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${darkMode ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                Close
              </button>
              <Link href="/signup" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-sm transition text-center">
                Sign Up Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────

function DemoCalendar({ leads, darkMode, onSelectLead }: { leads: Lead[]; darkMode: boolean; onSelectLead: (l: Lead) => void }) {
  const [calDate, setCalDate] = useState(new Date(2026, 3, 1));
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const scheduledLeads = leads.filter(l => l.scheduled_date);
  const leadsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return scheduledLeads.filter(l => l.scheduled_date?.startsWith(dateStr));
  };
  const today = new Date();
  const isToday = (day: number) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
  const monthName = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const border = darkMode ? 'border-white/5' : 'border-gray-100';

  return (
    <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
        <h3 className={`text-base font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{monthName}</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className={`grid grid-cols-7 border-b ${border}`}>
        {days.map(d => (
          <div key={d} className={`py-2 text-center text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className={`min-h-[80px] border-r border-b ${border}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayLeads = leadsForDay(day);
          const todayCell = isToday(day);
          return (
            <div key={day} className={`min-h-[80px] border-r border-b p-1.5 transition ${border} ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${(day + firstDay - 1) % 7 === 6 ? 'border-r-0' : ''}`}>
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black mb-1 ${todayCell ? 'bg-indigo-600 text-white' : darkMode ? 'text-white/50' : 'text-gray-500'}`}>
                {day}
              </div>
              <div className="space-y-0.5">
                {dayLeads.map(lead => {
                  const s = STATUS_OPTIONS.find(o => o.value === lead.status);
                  return (
                    <button key={lead.id} onClick={() => onSelectLead(lead)} className="w-full text-left px-1.5 py-1 rounded-md text-[10px] font-bold truncate transition hover:opacity-80" style={{ backgroundColor: `${s?.hex}25`, color: s?.hex }}>
                      {lead.scheduled_time ? formatTime12h(lead.scheduled_time) : ''} {lead.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {scheduledLeads.length > 0 && (
        <div className={`border-t ${border} px-5 py-4`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>Scheduled Jobs</p>
          <div className="space-y-2">
            {scheduledLeads.map(lead => {
              const s = STATUS_OPTIONS.find(o => o.value === lead.status);
              return (
                <button key={lead.id} onClick={() => onSelectLead(lead)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${darkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s?.hex }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lead.name}</p>
                    <p className={`text-xs truncate ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{lead.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {lead.scheduled_date && <p className={`text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-600'}`}>{formatDateNice(lead.scheduled_date)}</p>}
                    {lead.scheduled_time && <p className={`text-[10px] ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{formatTime12h(lead.scheduled_time)}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLICK HINT ───────────────────────────────────────────────────────────────

function ClickHint({ children }: { children: React.ReactNode; show: boolean }) {
  return <div className="relative">{children}</div>;
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'calendar'>('cards');
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAiNudge, setShowAiNudge] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasOpenedLead, setHasOpenedLead] = useState(false);
  const [showTour, setShowTour] = useState(true);
const [dynamicCta, setDynamicCta] = useState<string | null>(null);

  const updateLead = (id: number, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, ...updates } : prev);
  };

 
const handleSelectLead = (lead: Lead) => {
  setSelectedLead(lead);
  setHasOpenedLead(true);
  setShowTour(false);
};
  const filtered = useMemo(() =>
    leads.filter(l => {
      if (filterStatus !== 'all' && l.status !== filterStatus) return false;
      if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !l.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }), [leads, filterStatus, searchQuery]);

  const statusCounts = useMemo(() =>
    STATUS_OPTIONS.reduce((acc, s) => {
      acc[s.value] = leads.filter(l => l.status === s.value).length;
      return acc;
    }, {} as Record<string, number>), [leads]);

  const totalRevenue = leads.filter(l => l.payment_status === 'paid').reduce((s, l) => s + Number(l.quote_total || 0), 0);
  const pendingRevenue = leads.filter(l => l.quote_total && l.payment_status !== 'paid').reduce((s, l) => s + Number(l.quote_total || 0), 0);

  const textMuted = darkMode ? 'text-white/40' : 'text-gray-400';
  const inputBg = darkMode
    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500'
    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400';
  const filterBtn = (active: boolean) => active
    ? 'bg-indigo-600 text-white border-indigo-500'
    : darkMode
      ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50';

 
 
 // ADD before return statement


// Dynamic CTA based on what they did
useEffect(() => {
  if (hasOpenedLead && !dynamicCta) {
    setDynamicCta('You just managed a lead in 10 seconds. Imagine waking up to 10 of these every morning.');
  }
}, [hasOpenedLead]);

useEffect(() => {
  if (filterStatus !== 'all' && !dynamicCta) {
    setDynamicCta('You just filtered your pipeline. In the real app this updates live as new jobs come in.');
  }
}, [filterStatus]);
 
 
      return (
    <div className={darkMode ? 'min-h-screen bg-[#0a0f1e]' : 'min-h-screen bg-gray-200'}>
      <DemoBanner darkMode={darkMode} onToggleDark={() => setDarkMode(v => !v)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-12">

        {/* Browser chrome wraps everything */}
        <BrowserChrome darkMode={darkMode}>
          <div className="px-4 sm:px-6 py-5 sm:py-8">
            <DemoHeader
              darkMode={darkMode}
              totalLeads={leads.length}
              activeJobs={leads.filter(l => !['completed', 'cancelled'].includes(l.status)).length}
              totalRevenue={totalRevenue}
              pendingRevenue={pendingRevenue}
              onShowSettings={() => setShowSettings(true)}
              onCreateLead={() => setShowCreateModal(true)}
            />

            {/* Search + filters */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-white/30' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${inputBg}`}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full ${darkMode ? 'hover:bg-white/10 text-white/40' : 'hover:bg-gray-100 text-gray-400'}`}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* View toggle */}
                <div className={`flex border rounded-xl p-1 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                  <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-lg transition ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : darkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-lg transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : darkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                    <List className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-lg transition ${viewMode === 'calendar' ? 'bg-indigo-600 text-white' : darkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>

                {/* Create button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 rounded-xl font-bold text-sm transition shadow-lg active:scale-95 shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[3px]" />
                  <span className="hidden sm:inline">Create</span>
                </button>
              </div>

              {/* Status pills */}
              {viewMode !== 'calendar' && (
                <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  <button onClick={() => setFilterStatus('all')} className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${filterBtn(filterStatus === 'all')}`}>
                    All ({leads.length})
                  </button>
                  {STATUS_OPTIONS.map(s => statusCounts[s.value] > 0 && (
                    <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                      className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${filterBtn(filterStatus === s.value)}`}>
                      {s.label} ({statusCounts[s.value]})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Views */}
            {viewMode === 'calendar' ? (
              <DemoCalendar leads={leads} darkMode={darkMode} onSelectLead={handleSelectLead} />
            ) : viewMode === 'cards' ? (
             <>
  {/* Mobile featured card hint */}
  {!hasOpenedLead && (
    <div className={`sm:hidden flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${
      darkMode ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'
    }`}>
      <MousePointer2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
      <p className="text-xs font-bold text-indigo-400">Tap any card to open a full lead</p>
    </div>
  )}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {filtered.map((lead, i) => (
      <ClickHint key={lead.id} show={!hasOpenedLead && i === 0}>
        <LeadCard lead={lead} darkMode={darkMode} onClick={() => handleSelectLead(lead)} />
      </ClickHint>
    ))}
  </div>
</>
) : (
  <div className={`border rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}>
    {/* Export CSV bar */}
    <div className={`flex items-center justify-between px-4 py-2.5 border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
        {filtered.length} records
      </p>
      <button
        onClick={() => {
          const headers = ['Name', 'Email', 'Phone', 'Category', 'Status', 'Quote Total', 'Payment', 'City', 'Created'];
          const rows = filtered.map(l => [
            l.name, l.email, l.phone, l.category,
            STATUS_OPTIONS.find(o => o.value === l.status)?.label || l.status,
            l.quote_total || '',
            l.payment_status,
            l.city,
            new Date(l.created_at).toLocaleDateString('en-US'),
          ]);
          const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'leads-export.csv';
          a.click();
          URL.revokeObjectURL(url);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
          darkMode ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10' : 'bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100'
        }`}
      >
        <Download className="w-3.5 h-3.5" /> Export CSV
      </button>
    </div>
    {/* Horizontal scroll wrapper */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
            {['Customer', 'Category', 'Status', 'Quote', 'Payment', 'City', 'Created'].map(h => (
              <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${textMuted}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((lead, i) => {
            const s = STATUS_OPTIONS.find(o => o.value === lead.status);
            return (
              <tr key={lead.id} onClick={() => handleSelectLead(lead)}
                className={`border-b cursor-pointer transition ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50'} ${i % 2 !== 0 && darkMode ? 'bg-white/[0.01]' : ''}`}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{lead.name}</p>
                  <p className={`text-[10px] ${textMuted}`}>{lead.email}</p>
                </td>
                <td className={`px-4 py-3 text-sm whitespace-nowrap ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{lead.category}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${s?.hex}20`, color: s?.hex }}>
                    {s?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-bold text-emerald-400 whitespace-nowrap">{lead.quote_total ? fmt(lead.quote_total) : '—'}</td>
                <td className={`px-4 py-3 text-[11px] whitespace-nowrap ${
                  lead.payment_status === 'paid' ? 'text-emerald-400 font-bold' : textMuted
                }`}>{lead.payment_status}</td>
                <td className={`px-4 py-3 text-[11px] whitespace-nowrap ${textMuted}`}>{lead.city}</td>
                <td className={`px-4 py-3 text-[11px] whitespace-nowrap ${textMuted}`}>{timeAgo(lead.created_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}

            {filtered.length === 0 && viewMode !== 'calendar' && (
              <div className="text-center py-20">
                <Inbox className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
                <p className={`font-bold ${textMuted}`}>No leads match your filter</p>
              </div>
            )}
          </div>
        </BrowserChrome>

        {/* Bottom CTA */}
        <div className="mt-10 bg-gradient-to-r from-indigo-900/60 to-blue-900/60 border border-indigo-500/30 rounded-[2rem] p-8 sm:p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Ready to run your business like this?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Get your own dashboard in 2 minutes.</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
  {dynamicCta || 'Share your booking link, customers submit their jobs with photos — everything lands here, organized and ready to quote.'}
</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-2xl font-extrabold text-base hover:bg-indigo-50 transition shadow-2xl">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold text-base hover:bg-white/10 transition">
              Learn More
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-600 uppercase tracking-widest">14-day free trial · Cancel anytime</p>
        </div>
      </div>

      {/* Modals */}
     {selectedLead && (
  <LeadModal
    lead={leads.find(l => l.id === selectedLead.id) || selectedLead}
    darkMode={darkMode}
    onClose={() => setSelectedLead(null)}
    onUpdate={(updates) => updateLead(selectedLead.id, updates)}
  />
)}

      {showCreateModal && (
        <DemoCreateModal darkMode={darkMode} onClose={() => setShowCreateModal(false)} />
      )}

      {showSettings && <SettingsPreviewCard onClose={() => setShowSettings(false)} />}

      <DemoAIButton showNudge={showAiNudge} onToggle={() => setShowAiNudge(v => !v)} />

        {/* Tour */}
{showTour && (
  <DemoTour darkMode={darkMode} onDone={() => setShowTour(false)} />
)}


    </div>
  );
}