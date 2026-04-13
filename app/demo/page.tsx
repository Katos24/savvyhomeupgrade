'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Search, X, LayoutGrid, List, Inbox, ArrowRight,
  Plus, Calendar, ChevronLeft, ChevronRight,
  MousePointer2, Sparkles, CheckCircle2, Download,
  FolderOpen, Filter, ChevronDown, Clock, DollarSign,
  Sun, Moon, Menu,
} from 'lucide-react';
import DemoBanner from '@/components/demo/DemoBanner';
import DemoHeader from '@/components/demo/DemoHeader';
import LeadCard from '@/components/demo/LeadCard';
import LeadModal from '@/components/demo/LeadModal';
import SettingsPreviewCard from '@/components/demo/SettingsPreviewCard';
import DemoAIButton from '@/components/demo/DemoAIButton';
import {
  WelcomeModal,
  CardSpotlightOverlay,
  DemoTourBanner,
  TourProgressBar,
  useDemoTour,
  type TourStep,
  type TourFlow,
} from '@/components/demo/DemoTour';


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
    scheduled_date: new Date().toISOString().split('T')[0],
    scheduled_time: '09:00', assigned_to: 'Mike T.',
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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getDateBoundaries() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return { now, todayStart, yesterdayStart, weekStart };
}

// ─── BROWSER CHROME ───────────────────────────────────────────────────────────

function BrowserChrome({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl overflow-hidden border shadow-2xl ${
      isDark ? 'border-white/10 shadow-black/50' : 'border-gray-300 shadow-gray-300/60'
    }`}>
      <div className={`hidden sm:flex items-center gap-3 px-4 py-3 border-b ${
        isDark ? 'bg-[#0b1120] border-white/10' : 'bg-gray-200 border-gray-300'
      }`}>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs w-full max-w-sm ${
            isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-300'
          }`}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`shrink-0 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className={`font-mono ${isDark ? 'text-white/30' : 'text-gray-400'}`}>lead2project.com/</span>
            <span className={`font-mono font-semibold ${isDark ? 'text-white/60' : 'text-gray-700'}`}>torres/dashboard</span>
          </div>
        </div>
        <div className="w-[54px] shrink-0" />
      </div>
      <div className={isDark ? 'bg-[#1e293b]' : 'bg-gray-50'}>
        {children}
      </div>
    </div>
  );
}

// ─── DEMO CREATE MODAL ────────────────────────────────────────────────────────

function DemoCreateModal({ isDark, onClose }: { isDark: boolean; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [form, setForm] = useState({ name: '', phone: '', email: '', category: 'Roofing', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('done');
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${
    isDark
      ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400'
  }`;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 ${
        isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>
        {step === 'form' ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Add New Lead</h2>
                <p className="text-indigo-400 text-[10px] uppercase tracking-widest font-bold mt-0.5">Demo Mode</p>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl transition ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-gray-100 text-gray-400'}`}>
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
            <h3 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>This is a demo!</h3>
            <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              In the real app, <span className="font-bold text-indigo-400">{form.name || 'this lead'}</span> would be instantly saved, notifications sent, and appear on your board.
            </p>
            <div className="flex gap-3">
              <button onClick={onClose} className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${isDark ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
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

function DemoCalendar({ leads, isDark, onSelectLead }: { leads: Lead[]; isDark: boolean; onSelectLead: (l: Lead) => void }) {
  const [calDate, setCalDate] = useState(new Date());
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
  const border = isDark ? 'border-white/5' : 'border-gray-100';

  return (
    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-[#0a0c14] border-white/10' : 'bg-white border-gray-200'}`}>
      <div className={`flex items-center justify-between px-5 py-4 border-b ${border}`}>
        <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{monthName}</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setCalDate(new Date(year, month - 1, 1))} className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setCalDate(new Date(year, month + 1, 1))} className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className={`grid grid-cols-7 border-b ${border}`}>
        {days.map(d => (
          <div key={d} className={`py-2 text-center text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className={`min-h-[70px] border-r border-b ${border}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayLeads = leadsForDay(day);
          const todayCell = isToday(day);
          return (
            <div key={day} className={`min-h-[70px] border-r border-b p-1.5 transition ${border} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} ${(day + firstDay - 1) % 7 === 6 ? 'border-r-0' : ''}`}>
              <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-black mb-1 ${todayCell ? 'bg-indigo-600 text-white' : isDark ? 'text-white/50' : 'text-gray-500'}`}>
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
    </div>
  );
}

// ─── SECTION GROUP HEADER ─────────────────────────────────────────────────────

function SectionHeader({ title, count, isDark }: { title: string; count: number; isDark: boolean }) {
  return (
    <div className="flex items-center gap-4 mb-8 py-2">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h2>
      </div>
      <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
      {title !== 'Older' && (
        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
          isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
        }`}>
          {count}
        </span>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'calendar'>('cards');
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('dashboard-theme') !== 'light';
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAiNudge, setShowAiNudge] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [hasOpenedLead, setHasOpenedLead] = useState(false);
  const [showTourBanner, setShowTourBanner] = useState(true);
  const [dynamicCta, setDynamicCta] = useState<string | null>(null);

const { tourStep, tourFlow, startFlow, advanceTo, dismissTour } = useDemoTour();

  useEffect(() => {
    localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const updateLead = (id: number, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, ...updates } : prev);
  };

const handleSelectLead = (lead: Lead) => {
  setSelectedLead(lead);
  setHasOpenedLead(true);
  // if user clicks Michael during pick-card step, advance tour
  if (tourStep === 'pick-card' && lead.id === 1) {
    advanceTo('save-quote');
  }
};

const handleTourStart = (flow: TourFlow) => {
  setShowTourBanner(false);
  startFlow(flow);
};

  const categories = useMemo(() => [...new Set(leads.map(l => l.category).filter(Boolean))], [leads]);

  const { todayStart, yesterdayStart, weekStart } = getDateBoundaries();

  const filtered = useMemo(() => {
    return leads.filter(l => {
      if (filterStatus !== 'all' && l.status !== filterStatus) return false;
      if (filterPayment === 'unpaid' && l.payment_status === 'paid') return false;
      if (filterCategory !== 'all' && l.category !== filterCategory) return false;
      if (startDate && new Date(l.created_at) < new Date(startDate)) return false;
      if (endDate && new Date(l.created_at) > new Date(endDate + 'T23:59:59')) return false;
      if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !l.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !l.email.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !l.phone.includes(searchQuery)) return false;
      return true;
    });
  }, [leads, filterStatus, filterPayment, filterCategory, startDate, endDate, searchQuery]);

  const groups = useMemo(() => [
    { title: 'Today',              leads: filtered.filter(l => new Date(l.created_at) >= todayStart) },
    { title: 'Yesterday',          leads: filtered.filter(l => { const d = new Date(l.created_at); return d >= yesterdayStart && d < todayStart; }) },
    { title: 'Earlier This Week',  leads: filtered.filter(l => { const d = new Date(l.created_at); return d >= weekStart && d < yesterdayStart; }) },
    { title: 'Older',              leads: filtered.filter(l => new Date(l.created_at) < weekStart) },
  ], [filtered]);

  const statusCounts = useMemo(() =>
    STATUS_OPTIONS.reduce((acc, s) => {
      acc[s.value] = leads.filter(l => l.status === s.value).length;
      return acc;
    }, {} as Record<string, number>), [leads]);

  const revenue = leads.filter(l => l.payment_status === 'paid').reduce((s, l) => s + Number(l.quote_total || 0), 0);
  const pending = leads.filter(l => l.quote_total && l.payment_status !== 'paid').reduce((s, l) => s + Number(l.quote_total || 0), 0);
  const activeJobs = leads.filter(l => !['completed', 'cancelled', 'lost'].includes(l.status)).length;

  const hasActiveFilters = filterStatus !== 'all' || filterPayment !== 'all' || filterCategory !== 'all' || startDate || endDate || searchQuery;

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterPayment('all');
    setFilterCategory('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

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

  useEffect(() => {
  if (tourStep === 'idle' && hasOpenedLead) {
    setShowTourBanner(true);
  }
}, [tourStep]);

  // ── shared class helpers ───────────────────────────────────────────────────
  const pillBase = `shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all`;
  const pillOff  = isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500';

  return (
    <div className={isDark ? 'min-h-screen bg-[#0a0f1e]' : 'min-h-screen bg-gray-200'}>
      <DemoBanner darkMode={isDark} onToggleDark={() => setIsDark(v => !v)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-12">
        <BrowserChrome isDark={isDark}>
          <div className={`min-h-screen relative selection:bg-indigo-500/30 ${isDark ? 'bg-[#1e293b]' : 'bg-gray-50'}`}>
            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 relative z-10">

              {/* ── TOP NAV BAR ───────────────────────────────────────────── */}
              <header className={`rounded-2xl px-4 py-3 sm:px-6 sm:py-4 mb-8 transition-all ${
                isDark
                  ? 'bg-[#0A0C14] border border-white/10 shadow-2xl'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between gap-4">
                  {/* Brand */}
                  <div className="flex items-center gap-4 min-w-0">
                    <button className={`p-2.5 rounded-xl transition-colors ${
                      isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                    }`}>
                      <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 min-w-0 border-l border-slate-200/20 pl-4">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-indigo-500/20">
                        T
                      </div>
                      <div className="min-w-0">
                        <h1 className={`text-sm sm:text-lg font-black tracking-tight truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Torres Contracting
                        </h1>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-500">Dashboard</p>
                      </div>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      <Plus className="w-4 h-4 stroke-[3px]" />
                      <span className="hidden sm:inline">New Lead</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </header>

              {/* ── STATS ─────────────────────────────────────────────────── */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                {[
                  { label: 'Total Leads', value: leads.length,  accent: 'bg-indigo-500' },
                  { label: 'Active Jobs',  value: activeJobs,   accent: 'bg-blue-500' },
                  { label: 'Revenue',      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(revenue), accent: 'bg-emerald-500' },
                  { label: 'Pending',      value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(pending), accent: 'bg-amber-500' },
                ].map((s, i) => (
                  <div key={i} className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 transition-all duration-300 ${
                    isDark
                      ? 'bg-[#0A0C14] border-white/5 hover:border-white/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`w-2 h-2 rounded-full ${s.accent}`} />
                        <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                          {s.label}
                        </p>
                      </div>
                      <p className={`text-2xl sm:text-4xl font-black tracking-tighter tabular-nums ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {s.value}
                      </p>
                    </div>
                    <div className={`absolute -right-4 -top-4 w-20 h-20 blur-3xl rounded-full opacity-10 ${s.accent}`} />
                  </div>
                ))}
              </section>

              {/* ── TOUR BANNER ───────────────────────────────────────────── */}
              <AnimatePresence>
  {showTourBanner && tourStep === 'idle' && (
    <DemoTourBanner
      darkMode={isDark}
      onStart={(flow) => handleTourStart(flow)}
      onDismiss={() => setShowTourBanner(false)}
    />
  )}
</AnimatePresence>

{/* Card spotlight overlay — dims everything except Michael */}
<AnimatePresence>
  {tourStep === 'pick-card' && (
    <CardSpotlightOverlay onSkip={dismissTour} />
  )}
</AnimatePresence>

              {/* ── SEARCH & FILTER COMMAND CENTER ────────────────────────── */}
              <section aria-label="Search and filter leads" className="flex flex-col gap-4 mb-8">

                {/* Row 1: Search + View Toggles + Theme */}
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative flex-1 group">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isDark ? 'text-white/20' : 'text-slate-400'} group-focus-within:text-indigo-500`} />
                    <input
                      type="search"
                      placeholder="Search name, email, phone..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className={`w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm font-bold transition-all outline-none border ${
                        isDark
                          ? 'bg-[#0A0C14] border-white/5 text-white placeholder-white/20 focus:border-indigo-500/50'
                          : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-sm'
                      }`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* View Switcher */}
                  <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-[#0A0C14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    {[
                      { id: 'cards',    Icon: LayoutGrid },
                      { id: 'table',    Icon: List },
                      { id: 'calendar', Icon: Calendar },
                    ].map(({ id, Icon }) => (
                      <button
                        key={id}
                        onClick={() => setViewMode(id as any)}
                        className={`p-2 rounded-lg transition-all ${
                          viewMode === id
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => setIsDark(v => !v)}
                    className={`p-3.5 rounded-2xl border transition-all active:scale-95 ${
                      isDark ? 'bg-[#0A0C14] border-white/5 text-amber-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
                    }`}
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>

                {/* Row 2: Filter Pills */}
                <div className="relative">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">

                    {/* Advanced Filter Launcher */}
                    <button
                      onClick={() => setShowAdvancedFilters(v => !v)}
                      className={`${pillBase} ${
                        showAdvancedFilters || hasActiveFilters
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                          : pillOff
                      }`}
                    >
                      <Filter className="w-3.5 h-3.5 stroke-[3px]" />
                      Filters
                      <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`w-px h-4 mx-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

                    {/* Today */}
                    <button
                      onClick={() => setFilterStatus(filterStatus === 'scheduled' ? 'all' : 'scheduled')}
                      className={`${pillBase} ${
                        filterStatus === 'scheduled'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : pillOff
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Today
                    </button>

                    {/* Unpaid */}
                    <button
                      onClick={() => setFilterPayment(filterPayment === 'unpaid' ? 'all' : 'unpaid')}
                      className={`${pillBase} ${
                        filterPayment === 'unpaid'
                          ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20'
                          : pillOff
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Unpaid
                    </button>

                    {/* New */}
                    <button
                      onClick={() => setFilterStatus(filterStatus === 'new' ? 'all' : 'new')}
                      className={`${pillBase} ${
                        filterStatus === 'new'
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg'
                          : pillOff
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      New {(statusCounts['new'] || 0) > 0 && <span className="opacity-70">({statusCounts['new']})</span>}
                    </button>

                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="shrink-0 p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <X className="w-4 h-4 stroke-[3px]" />
                      </button>
                    )}
                  </div>

                  {/* Advanced Filter Dropdown */}
                  {showAdvancedFilters && (
                    <div>
                      <div className="fixed inset-0 z-40" onClick={() => setShowAdvancedFilters(false)} />

                      {/* Desktop */}
                      <div
                        className="hidden sm:block absolute top-full left-0 mt-2 z-[200] w-[380px] rounded-2xl border shadow-2xl p-5"
                        style={{
                          background: isDark ? '#0D0F17' : '#ffffff',
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        }}
                      >
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Category</label>
                            <select
                              value={filterCategory}
                              onChange={e => setFilterCategory(e.target.value)}
                              className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all appearance-none cursor-pointer ${
                                isDark ? 'bg-white/5 border-white/10 text-white hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="all">All Sectors</option>
                              {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Payment</label>
                            <select
                              value={filterPayment}
                              onChange={e => setFilterPayment(e.target.value)}
                              className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all appearance-none cursor-pointer ${
                                isDark ? 'bg-white/5 border-white/10 text-white hover:border-indigo-500/50' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="all">All</option>
                              <option value="unpaid">Unpaid</option>
                              <option value="paid">Paid</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Start Date</label>
                            <input
                              type="date"
                              value={startDate}
                              onChange={e => setStartDate(e.target.value)}
                              className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">End Date</label>
                            <input
                              type="date"
                              value={endDate}
                              onChange={e => setEndDate(e.target.value)}
                              className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`}
                            />
                          </div>
                        </div>

                        <div className="mb-8 space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Lifecycle Status</label>
                          <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map(s => (
                              <button
                                key={s.value}
                                onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                  filterStatus === s.value
                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                                    : isDark ? 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-500'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                          <button
                            onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                            className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all"
                          >
                            Reset Engine
                          </button>
                          <button
                            onClick={() => setShowAdvancedFilters(false)}
                            className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all"
                          >
                            Apply Changes
                          </button>
                        </div>
                      </div>

                      {/* Mobile Drawer */}
                      <div className="sm:hidden fixed inset-0 z-[300] flex flex-col justify-end">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdvancedFilters(false)} />
                        <div className={`relative rounded-t-[3rem] p-8 pb-12 max-h-[90vh] overflow-y-auto shadow-[0_-24px_48px_rgba(0,0,0,0.6)] ${
                          isDark ? 'bg-[#0D0F17] border-t border-white/10' : 'bg-white border-t border-slate-200'
                        }`}>
                          <div className="w-16 h-1.5 bg-indigo-500/20 rounded-full mx-auto mb-10" />
                          <div className="space-y-10">
                            <div className="space-y-4">
                              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">Category</label>
                              <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className={`w-full rounded-2xl px-5 py-4 text-base font-bold border outline-none appearance-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                              >
                                <option value="all">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">Timeline</label>
                              <div className="grid grid-cols-2 gap-4">
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                                  className={`w-full rounded-2xl px-5 py-4 text-sm font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} />
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                                  className={`w-full rounded-2xl px-5 py-4 text-sm font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} />
                              </div>
                            </div>
                            <div className="space-y-4">
                              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">Status</label>
                              <div className="flex flex-wrap gap-2">
                                {STATUS_OPTIONS.map(s => (
                                  <button
                                    key={s.value}
                                    onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                                    className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                                      filterStatus === s.value
                                        ? 'bg-indigo-600 text-white border-indigo-500'
                                        : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-slate-100 border-slate-200 text-slate-500'
                                    }`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-3 mt-12">
                            <button
                              onClick={() => setShowAdvancedFilters(false)}
                              className="w-full py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40"
                            >
                              Apply Filters
                            </button>
                            <button
                              onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                              className="w-full py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"
                            >
                              Reset All
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* ── LEADS DISPLAY ─────────────────────────────────────────── */}
              <section aria-label="Leads" aria-live="polite" className="relative">
                {filtered.length === 0 ? (
                  <div className={`rounded-[3rem] p-16 sm:p-32 text-center border-2 border-dashed transition-all ${
                    isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-500/10 mb-6">
                      <Inbox className="w-10 h-10 text-indigo-500/40" />
                    </div>
                    <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No leads found</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                      {hasActiveFilters ? 'No leads match your filters.' : 'Create your first lead to get started.'}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-8 px-6 py-3 rounded-xl bg-indigo-500 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                ) : viewMode === 'calendar' ? (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <DemoCalendar leads={leads} isDark={isDark} onSelectLead={handleSelectLead} />
                  </div>

                ) : viewMode === 'table' ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                      <div>
                        <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          All Leads
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                          {filtered.length} records
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const headers = ['Name', 'Email', 'Phone', 'Category', 'Status', 'Quote Total', 'Payment', 'City', 'Created'];
                          const rows = filtered.map(l => [
                            l.name, l.email, l.phone, l.category,
                            STATUS_OPTIONS.find(o => o.value === l.status)?.label || l.status,
                            l.quote_total || '', l.payment_status, l.city,
                            new Date(l.created_at).toLocaleDateString('en-US'),
                          ]);
                          const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a'); a.href = url; a.download = 'leads-demo.csv'; a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${
                          isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                        }`}
                      >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                      </button>
                    </div>

                    <div className={`rounded-[2rem] overflow-hidden border shadow-2xl transition-all ${isDark ? 'bg-[#0A0C14] border-white/5' : 'bg-white border-slate-200'}`}>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                          <thead>
                            <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                              {['Customer', 'Category', 'Status', 'Quote', 'Payment', 'City', 'Created'].map(h => (
                                <th key={h} className={`px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((lead, i) => {
                              const s = STATUS_OPTIONS.find(o => o.value === lead.status);
                              return (
                                <tr key={lead.id} onClick={() => handleSelectLead(lead)}
                                  className={`border-b cursor-pointer transition ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-50 hover:bg-slate-50'}`}>
                                  <td className="px-5 py-4 whitespace-nowrap">
                                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{lead.name}</p>
                                    <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{lead.email}</p>
                                  </td>
                                  <td className={`px-5 py-4 text-sm whitespace-nowrap ${isDark ? 'text-white/60' : 'text-slate-500'}`}>{lead.category}</td>
                                  <td className="px-5 py-4 whitespace-nowrap">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${s?.hex}20`, color: s?.hex }}>
                                      {s?.label}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-sm font-bold text-emerald-400 whitespace-nowrap">{lead.quote_total ? fmt(lead.quote_total) : '—'}</td>
                                  <td className={`px-5 py-4 text-[11px] whitespace-nowrap ${lead.payment_status === 'paid' ? 'text-emerald-400 font-bold' : isDark ? 'text-white/30' : 'text-slate-400'}`}>{lead.payment_status}</td>
                                  <td className={`px-5 py-4 text-[11px] whitespace-nowrap ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{lead.city}</td>
                                  <td className={`px-5 py-4 text-[11px] whitespace-nowrap ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{timeAgo(lead.created_at)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                ) : (
                  // ── CARDS VIEW with grouped sections ──────────────────────
                  <div className="space-y-16">
                    {!hasOpenedLead && (
                      <div className={`sm:hidden flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${
                        isDark ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-indigo-50 border border-indigo-100'
                      }`}>
                        <MousePointer2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <p className="text-xs font-bold text-indigo-400">Tap any card to open a full lead</p>
                      </div>
                    )}
                    {groups.map(({ title, leads: groupLeads }) => groupLeads.length > 0 && (
                      <section key={title} aria-label={`${title} leads`} className="relative">
                        <div className="sticky top-0 z-10 py-2">
                          <SectionHeader title={title} count={groupLeads.length} isDark={isDark} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {groupLeads.map(lead => (
  <div
    key={lead.id}
    className="relative"
    style={tourStep === 'pick-card' ? {
      zIndex: lead.id === 1 ? 450 : 1,
      position: 'relative',
    } : {}}
  >
    <LeadCard
      lead={lead}
      darkMode={lead.id === 1 && tourStep === 'pick-card' ? false : isDark}
      onClick={() => handleSelectLead(lead)}
      tourActive={lead.id === 1 && tourStep === 'pick-card'}
    />
    {lead.id === 1 && tourStep === 'pick-card' && (
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ boxShadow: '0 0 0 3px #6366f1, 0 8px 32px rgba(99,102,241,0.5)' }}
      />
    )}
  </div>
))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </section>

              {/* ── LOAD MORE (simulated) ──────────────────────────────────── */}
              {viewMode === 'cards' && filtered.length > 0 && (
                <div className="flex justify-center pt-16 pb-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] border-2 transition-all ${
                      isDark
                        ? 'bg-transparent border-white/10 text-white/40 cursor-default'
                        : 'bg-white border-slate-200 text-slate-400 cursor-default'
                    }`}>
                      All {filtered.length} leads loaded
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Real app paginates with server-side batches
                    </span>
                  </div>
                </div>
              )}

            </main>
          </div>
        </BrowserChrome>

        {/* ── BOTTOM CTA ──────────────────────────────────────────────────── */}
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

      {/* ── MODALS ────────────────────────────────────────────────────────── */}
     <AnimatePresence>
  {tourStep === 'welcome' && (
    <WelcomeModal
      onStart={() => advanceTo('pick-card')}
      onSkip={dismissTour}
    />
  )}
</AnimatePresence>

{selectedLead && (
  <LeadModal
          lead={leads.find(l => l.id === selectedLead.id) || selectedLead}
          darkMode={isDark}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updates) => updateLead(selectedLead.id, updates)}
          tourStep={tourStep}
          onTourAdvance={advanceTo}
          onTourDismiss={dismissTour}
        />
      )}

 

{showCreateModal && (
  <DemoCreateModal isDark={isDark} onClose={() => setShowCreateModal(false)} />
)}

      {showSettings && <SettingsPreviewCard onClose={() => setShowSettings(false)} />}

      <DemoAIButton showNudge={showAiNudge} onToggle={() => setShowAiNudge(v => !v)} />
    </div>
  );
}