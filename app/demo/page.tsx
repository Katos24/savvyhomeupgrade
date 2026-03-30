'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, LayoutGrid, List, Inbox, Zap, Eye, ArrowRight, Sun, Moon, Settings } from 'lucide-react';
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
    quote_total: '3400.00', payment_status: 'unpaid',
    file_urls: [],
    tasks: [{ id: 't1', label: 'Send color swatches', done: false }],
quote_items: [
  { id: 'q1', description: 'Interior paint — 3 bed / 2 bath', quantity: 1, unitPrice: 2200, amount: 2200 },
  { id: 'q2', description: 'Ceiling paint', quantity: 1, unitPrice: 700, amount: 700 },
  { id: 'q3', description: 'Trim & doors', quantity: 1, unitPrice: 500, amount: 500 },
],    ai_brief: null,
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [darkMode, setDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAiNudge, setShowAiNudge] = useState(false);

  const updateLead = (id: number, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    if (selectedLead?.id === id) setSelectedLead(prev => prev ? { ...prev, ...updates } : prev);
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

  const bg = darkMode
  ? 'min-h-screen bg-[#1e293b]'
  : 'min-h-screen bg-gray-50';

  const cardBg = darkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textMuted = darkMode ? 'text-white/40' : 'text-gray-400';
  const inputBg = darkMode ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-indigo-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-indigo-400';
  const filterBtn = (active: boolean) => active
    ? 'bg-indigo-600 text-white border-indigo-500'
    : darkMode
      ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50';

  return (
    <div className={bg}>
      <DemoBanner darkMode={darkMode} onToggleDark={() => setDarkMode(v => !v)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <DemoHeader darkMode={darkMode} totalLeads={leads.length} activeJobs={leads.filter(l => !['completed', 'cancelled'].includes(l.status)).length} totalRevenue={totalRevenue} pendingRevenue={pendingRevenue} onShowSettings={() => setShowSettings(true)} />

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
            <div className={`hidden md:flex border rounded-xl p-1 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
              <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-lg transition ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : darkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-lg transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : darkMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>

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
        </div>

        {/* Lead grid */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(lead => (
              <LeadCard key={lead.id} lead={lead} darkMode={darkMode} onClick={() => setSelectedLead(lead)} />
            ))}
          </div>
        ) : (
          <div className={`border rounded-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}>
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                  {['Customer', 'Category', 'Status', 'Quote', 'Created'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest ${textMuted}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => {
                  const s = STATUS_OPTIONS.find(o => o.value === lead.status);
                  return (
                    <tr key={lead.id} onClick={() => setSelectedLead(lead)}
                      className={`border-b cursor-pointer transition ${darkMode ? 'border-white/5 hover:bg-white/5' : 'border-gray-50 hover:bg-gray-50'} ${i % 2 !== 0 && darkMode ? 'bg-white/[0.01]' : ''}`}>
                      <td className="px-4 py-3">
                        <p className={`text-sm font-bold ${textPrimary}`}>{lead.name}</p>
                        <p className={`text-[10px] ${textMuted}`}>{lead.email}</p>
                      </td>
                      <td className={`px-4 py-3 text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{lead.category}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${s?.hex}20`, color: s?.hex }}>
                          {s?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-400">{lead.quote_total ? fmt(lead.quote_total) : '—'}</td>
                      <td className={`px-4 py-3 text-[11px] ${textMuted}`}>{timeAgo(lead.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Inbox className={`w-10 h-10 mx-auto mb-3 ${textMuted}`} />
            <p className={`font-bold ${textMuted}`}>No leads match your filter</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-indigo-900/60 to-blue-900/60 border border-indigo-500/30 rounded-[2rem] p-8 sm:p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Ready to run your business like this?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Get your own dashboard in 2 minutes.</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Share your booking link, customers submit their jobs with photos — everything lands here, organized and ready to quote.
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

      {/* Lead modal */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          darkMode={darkMode}
          onClose={() => setSelectedLead(null)}
          onUpdate={(updates) => updateLead(selectedLead.id, updates)}
        />
      )}

      {/* Settings preview */}
      {showSettings && <SettingsPreviewCard onClose={() => setShowSettings(false)} />}

      {/* AI button */}
      <DemoAIButton showNudge={showAiNudge} onToggle={() => setShowAiNudge(v => !v)} />
    </div>
  );
}