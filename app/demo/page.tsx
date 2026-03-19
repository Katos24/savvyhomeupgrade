'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, X, Plus, Menu, Filter, ChevronDown, Loader2,
  Inbox, Send, Sparkles, LayoutGrid, List, ArrowRight,
  Check, MapPin, Phone, Mail, Calendar, Clock, FileText,
  DollarSign, Camera, Bot, AlertCircle, ChevronRight,
  Zap, Eye, Lock,
} from 'lucide-react';


// ─── DEMO DATA ────────────────────────────────────────────────────────────────

const DEMO_COMPANY = {
  name: 'Torres Roofing & Construction',
  slug: 'torres-roofing',
  logo_url: null,
  email_brand_color_1: '#6366f1',
  email_brand_color_2: '#8b5cf6',
};

const DEMO_LEADS = [
  {
    id: 1, name: 'Michael Johnson', email: 'michael.j@gmail.com', phone: '(718) 555-0142',
    category: 'Roofing', status: 'new', created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    address_line_1: '142 Oak Street', city: 'Brooklyn', zip_code: '11201',
    description: 'Storm damage on south slope — approx 3 squares of missing shingles after last week\'s storm. Insurance claim in progress.',
    quote_total: null, payment_status: 'unpaid', file_urls: ['photo1.jpg', 'photo2.jpg'],
    ai_brief: { summary: 'Storm damage job, high urgency. Customer has insurance claim in progress. Schedule estimate before adjuster visit.', urgency: 'high', next_steps: ['Call to confirm scope', 'Request insurance docs', 'Schedule before adjuster visit'] },
  },
  {
    id: 2, name: 'Sarah Kim', email: 'sarah.kim@gmail.com', phone: '(917) 555-0287',
    category: 'Renovation', status: 'quoted', created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    address_line_1: '87 Maple Ave', city: 'Queens', zip_code: '11375',
    description: 'Full kitchen remodel — new cabinets, quartz countertops, backsplash. Budget around $25k.',
    quote_total: '18500.00', payment_status: 'unpaid', file_urls: ['photo1.jpg'],
    ai_brief: null,
  },
  {
    id: 3, name: 'James Park', email: 'james.park@gmail.com', phone: '(347) 555-0391',
    category: 'HVAC', status: 'scheduled', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    address_line_1: '234 Pine Road', city: 'Staten Island', zip_code: '10301',
    description: 'AC unit stopped blowing cold air. Unit is about 8 years old. Need someone ASAP.',
    quote_total: '890.00', payment_status: 'unpaid', file_urls: [],
    scheduled_date: '2026-03-24', scheduled_time: '09:00',
    ai_brief: null,
  },
  {
    id: 4, name: 'Lisa Morgan', email: 'lisa.m@gmail.com', phone: '(646) 555-0514',
    category: 'Fencing', status: 'in-progress', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    address_line_1: '678 Cedar Lane', city: 'Manhattan', zip_code: '10023',
    description: 'Fence is leaning and several pickets are missing. About 80 LF of wood privacy fence.',
    quote_total: '3100.00', payment_status: 'partial', file_urls: ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
    ai_brief: null,
  },
  {
    id: 5, name: 'David Chen', email: 'david.chen@gmail.com', phone: '(212) 555-0623',
    category: 'Electrical', status: 'quoted', created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    address_line_1: '901 Birch Blvd', city: 'Jersey City', zip_code: '07302',
    description: 'Need to upgrade electrical panel from 100 amp to 200 amp service. Adding a home office.',
    quote_total: '2450.00', payment_status: 'unpaid', file_urls: ['video1.mp4'],
    ai_brief: null,
  },
  {
    id: 6, name: 'Amy Nguyen', email: 'amy.n@gmail.com', phone: '(516) 555-0745',
    category: 'Roofing', status: 'new', created_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    address_line_1: '456 Walnut St', city: 'Hoboken', zip_code: '07030',
    description: 'Roof is leaking near the chimney after heavy rain. Water stains on ceiling in master bedroom.',
    quote_total: null, payment_status: 'unpaid', file_urls: ['photo1.jpg'],
    ai_brief: null,
  },
  {
    id: 7, name: 'Robert Torres', email: 'r.torres@gmail.com', phone: '(914) 555-0856',
    category: 'Plumbing', status: 'completed', created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    address_line_1: '321 Spruce Ave', city: 'Newark', zip_code: '07102',
    description: 'Water heater is leaking from the bottom. 50 gallon tank, about 12 years old. Need replacement.',
    quote_total: '1475.00', payment_status: 'paid', file_urls: [],
    ai_brief: null,
  },
  {
    id: 8, name: 'Maria Garcia', email: 'maria.g@gmail.com', phone: '(631) 555-0967',
    category: 'Painting', status: 'contacted', created_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(),
    address_line_1: '555 Hickory Rd', city: 'Yonkers', zip_code: '10701',
    description: 'Full interior repaint of 3 bedroom house. Ceilings, walls, and trim. Need color consultation.',
    quote_total: null, payment_status: 'unpaid', file_urls: [],
    ai_brief: null,
  },
];

const STATUS_OPTIONS = [
  { value: 'new',         label: 'New',         color: 'blue',   bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  { value: 'contacted',   label: 'Contacted',   color: 'yellow', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  { value: 'quoted',      label: 'Quoted',      color: 'purple', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { value: 'scheduled',   label: 'Scheduled',   color: 'green',  bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
  { value: 'in-progress', label: 'In Progress', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  { value: 'completed',   label: 'Completed',   color: 'emerald',bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200'},
  { value: 'cancelled',   label: 'Cancelled',   color: 'red',    bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
];

const fmt = (n: string | number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n));

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}

// ─── LEAD DETAIL MODAL ────────────────────────────────────────────────────────
function LeadModal({ lead, onClose }: { lead: any; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview');

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="bg-white w-full max-w-2xl sm:rounded-[2rem] h-[90vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={lead.status} />
              <span className="text-[10px] text-gray-400 font-medium">{lead.category}</span>
            </div>
            <h2 className="text-xl font-black text-gray-900">{lead.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{timeAgo(lead.created_at)}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {[{ id: 'overview', label: 'Overview' }, { id: 'ai', label: '✦ AI Brief' }].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-4 text-sm font-bold border-b-2 transition -mb-px ${activeTab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: <Mail className="w-4 h-4 text-blue-500" />, label: 'Email', value: lead.email },
                  { icon: <Phone className="w-4 h-4 text-green-500" />, label: 'Phone', value: lead.phone },
                  { icon: <MapPin className="w-4 h-4 text-red-500" />, label: 'Address', value: lead.address_line_1 ? `${lead.address_line_1}, ${lead.city}` : 'Not provided' },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">{item.icon}<span className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</span></div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Project Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{lead.description}</p>
              </div>

              {/* Photos */}
              {lead.file_urls?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Attachments ({lead.file_urls.length})</p>
                  <div className="flex gap-2">
                    {lead.file_urls.map((f: string, i: number) => (
                      <div key={i} className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center border border-indigo-200">
                        {f.includes('video') ? <span className="text-lg">🎥</span> : <Camera className="w-5 h-5 text-indigo-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quote */}
              {lead.quote_total && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Quote Sent</p>
                    <p className="text-2xl font-black text-emerald-700">{fmt(lead.quote_total)}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${lead.payment_status === 'paid' ? 'bg-emerald-600 text-white' : lead.payment_status === 'partial' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white text-gray-500 border border-gray-200'}`}>
                    {lead.payment_status === 'paid' ? '✓ Paid' : lead.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                  </span>
                </div>
              )}

              {/* Scheduled */}
              {lead.scheduled_date && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Scheduled</p>
                    <p className="text-sm font-bold text-blue-800">{new Date(lead.scheduled_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}{lead.scheduled_time && ` at ${lead.scheduled_time}`}</p>
                  </div>
                </div>
              )}

              {/* Demo actions banner */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
                <Lock className="w-5 h-5 text-indigo-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-indigo-800">This is a live demo</p>
                  <p className="text-xs text-indigo-600">Sign up to send quotes, schedule jobs, collect payment, and more.</p>
                </div>
                <Link href="/signup" className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition">
                  Try Free
                </Link>
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <div>
              {lead.ai_brief ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-5 border border-indigo-700/40">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-4 h-4 text-indigo-300" />
                      <span className="text-sm font-bold text-white">AI Summary</span>
                      {lead.ai_brief.urgency === 'high' && (
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full uppercase ml-auto">High Priority</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{lead.ai_brief.summary}</p>
                  </div>
                  {lead.ai_brief.next_steps && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Recommended Next Steps</p>
                      <div className="space-y-2">
                        {lead.ai_brief.next_steps.map((step: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                            <span className="text-emerald-500 font-black text-sm">→</span>
                            <span className="text-sm font-medium text-gray-800">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-indigo-400" />
                  </div>
                  <p className="font-bold text-gray-800 mb-1">AI Brief Available on Pro</p>
                  <p className="text-sm text-gray-400 mb-4">Every lead gets an AI summary — scope, urgency, and next steps.</p>
                  <Link href="/signup?plan=pro" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition">
                    Upgrade to Pro <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DEMO PAGE ───────────────────────────────────────────────────────────
export default function DemoPage() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filtered = useMemo(() =>
    DEMO_LEADS.filter(l => {
      if (filterStatus !== 'all' && l.status !== filterStatus) return false;
      if (searchQuery && !l.name.toLowerCase().includes(searchQuery.toLowerCase()) && !l.category.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }),
    [filterStatus, searchQuery]
  );

  const statusCounts = useMemo(() =>
    STATUS_OPTIONS.reduce((acc, s) => {
      acc[s.value] = DEMO_LEADS.filter(l => l.status === s.value).length;
      return acc;
    }, {} as Record<string, number>),
    []
  );

  const totalRevenue = DEMO_LEADS.filter(l => l.payment_status === 'paid').reduce((s, l) => s + Number(l.quote_total || 0), 0);
  const pendingRevenue = DEMO_LEADS.filter(l => l.quote_total && l.payment_status !== 'paid').reduce((s, l) => s + Number(l.quote_total || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' }}>

      {/* Demo banner */}
      <div className="bg-indigo-600 px-4 py-2.5 flex items-center justify-center gap-3">
        <Eye className="w-4 h-4 text-indigo-200 shrink-0" />
        <p className="text-sm font-bold text-white">You're viewing a live demo — data is read-only</p>
        <Link href="/signup" className="ml-2 px-4 py-1.5 bg-white text-indigo-600 text-xs font-black rounded-full hover:bg-indigo-50 transition shrink-0">
          Start Free Trial →
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

        {/* Top bar */}
        <header className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] px-4 py-3 sm:p-5 mb-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg">
                T
              </div>
              <div className="border-l border-white/10 pl-3">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight leading-none">{DEMO_COMPANY.name}</h1>
                <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold block mt-1">Dashboard</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/50 uppercase tracking-wide">
                <Eye className="w-3 h-3" /> Demo Mode
              </span>
              <Link href="/signup" className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-950 hover:bg-indigo-50 rounded-xl font-bold text-sm transition shadow-lg">
                <Zap className="w-4 h-4 stroke-[3px]" /> Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Leads',     value: DEMO_LEADS.length,                    sub: 'all time',       color: 'text-white'        },
            { label: 'Active Jobs',     value: DEMO_LEADS.filter(l => !['completed','cancelled'].includes(l.status)).length, sub: 'in pipeline', color: 'text-blue-400'  },
            { label: 'Revenue Collected', value: fmt(totalRevenue),                  sub: 'paid',           color: 'text-emerald-400'  },
            { label: 'Pending',         value: fmt(pendingRevenue),                  sub: 'awaiting payment',color: 'text-amber-400'   },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-4">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none text-white placeholder-white/30 text-sm font-medium transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full text-white/40">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="hidden md:flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button onClick={() => setViewMode('cards')} className={`p-2.5 rounded-lg transition ${viewMode === 'cards' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-lg transition ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setFilterStatus('all')}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${filterStatus === 'all' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
            >
              All ({DEMO_LEADS.length})
            </button>
            {STATUS_OPTIONS.map(s => statusCounts[s.value] > 0 && (
              <button
                key={s.value}
                onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${filterStatus === s.value ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
              >
                {s.label} ({statusCounts[s.value]})
              </button>
            ))}
          </div>
        </div>

        {/* Leads */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(lead => {
  const statusConfig = STATUS_OPTIONS.find(s => s.value === lead.status) || STATUS_OPTIONS[0];
  const colorMap: Record<string, string> = {
    blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7', orange: '#f97316',
    green: '#10b981', emerald: '#10b981', red: '#ef4444', gray: '#64748b',
  };
  const statusHex = colorMap[statusConfig.color] || '#3b82f6';
  const isCompleted = lead.status === 'completed';

  const formatTime = (time?: string) => {
    if (!time) return 'TBD';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div
      key={lead.id}
      onClick={() => setSelectedLead(lead)}
      className={`group relative flex bg-[#0A0C10] border border-[#1C2029] rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:border-blue-500/50 shadow-sm hover:shadow-xl cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
    >
      {/* Left accent bar */}
      <div className="w-1.5 shrink-0" style={{ backgroundColor: statusHex }} />

      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border"
              style={{ backgroundColor: `${statusHex}15`, color: statusHex, borderColor: `${statusHex}30` }}
            >
              {statusConfig.label}
            </span>
            {lead.ai_brief && (
              <span className="text-[9px] font-bold text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI
              </span>
            )}
          </div>
          <h3 className="text-white text-lg font-bold tracking-tight truncate group-hover:text-blue-400 transition-colors">
            {lead.name}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            <span className="truncate max-w-[100px]">{lead.category}</span>
            {lead.file_urls?.length > 0 && (
              <span className="flex items-center gap-1">
                <Camera className="w-3 h-3 text-gray-600" /> {lead.file_urls.length}
              </span>
            )}
          </div>
        </div>

        {/* Schedule box */}
        <div className="grid grid-cols-2 gap-2 mb-5 bg-[#161B22]/50 p-3 rounded-xl border border-[#1C2029]">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Date</span>
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              {lead.scheduled_date
                ? new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Not Set'}
            </div>
          </div>
          <div className="flex flex-col gap-1 border-l border-[#232830] pl-3">
            <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Arrival</span>
            <div className="flex items-center gap-1.5 text-gray-300 font-bold text-[11px]">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              {formatTime(lead.scheduled_time)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#1C2029]">
          <div className="flex flex-col">
            <div className="text-white font-black text-base tracking-tight">
              {lead.quote_total
                ? `$${parseFloat(lead.quote_total).toLocaleString()}`
                : <span className="text-gray-700 text-xs uppercase tracking-widest">No Quote</span>}
            </div>
            <div className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${lead.payment_status === 'paid' ? 'text-emerald-500' : 'text-gray-500'}`}>
              {lead.payment_status || 'Unpaid'}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-[#161B22] border border-[#232830] flex items-center justify-center text-gray-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

      </div>
    </div>
  );
})}
          </div>
        ) : (
          <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {['Customer','Category','Status','Quote','Created'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-white/40 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`border-b border-white/5 hover:bg-white/5 cursor-pointer transition ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-bold text-white">{lead.name}</p>
                      <p className="text-[10px] text-white/40">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-white/60">{lead.category}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-400">{lead.quote_total ? fmt(lead.quote_total) : '—'}</td>
                    <td className="px-4 py-3 text-[11px] text-white/40">{timeAgo(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Inbox className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 font-bold">No leads match your filter</p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-indigo-900/60 to-blue-900/60 border border-indigo-500/30 rounded-[2rem] p-8 sm:p-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Ready to run your business like this?</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Get your own dashboard in 2 minutes.</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
            Share your booking link, customers submit their jobs with photos and videos, everything lands here — organized and ready to quote.
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
      {selectedLead && <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />}
    </div>
  );
}