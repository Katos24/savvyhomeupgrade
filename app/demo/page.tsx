'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search, X, Plus, Menu, Filter, ChevronDown, Loader2,
  Inbox, Send, Sparkles, LayoutGrid, List, ArrowRight,
  Check, MapPin, Phone, Mail, Calendar, Clock, FileText,
  DollarSign, Camera, Bot, AlertCircle, ChevronRight,
  Zap, Eye, Lock, User, ArrowLeft
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
const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'quote' | 'payment' | 'tasks' | 'activity' | 'ai'>('overview');
  const tabs = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'schedule', label: 'Schedule', show: true },
    { id: 'quote', label: 'Quote', show: true },
    { id: 'payment', label: 'Payment', show: true },
    { id: 'tasks', label: 'Tasks', show: true },
    { id: 'activity', label: 'Activity', show: true },
      { id: 'ai', label: '✦ AI Brief', show: true },

  ];

  const fmt = (n: string | number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(Number(n));

  const statusHex: Record<string, string> = {
    new: '#3b82f6', contacted: '#eab308', quoted: '#a855f7',
    scheduled: '#10b981', 'in-progress': '#f97316', completed: '#22c55e',
    cancelled: '#ef4444',
  };
  const hex = statusHex[lead.status] || '#3b82f6';

  const statusLabel: Record<string, string> = {
    new: 'New', contacted: 'Contacted', quoted: 'Quoted',
    scheduled: 'Scheduled', 'in-progress': 'In Progress',
    completed: 'Completed', cancelled: 'Cancelled',
  };

  const LockedTab = () => (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-7 h-7 text-indigo-400" />
      </div>
      <p className="font-black text-gray-800 text-lg mb-1">Unlock This Feature</p>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Sign up free to use scheduling, quotes, payments, tasks, and more — all in one place.
      </p>
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
      >
        Start Free Trial <ArrowRight className="w-4 h-4" />
      </Link>
<p className="mt-3 text-xs text-gray-400">14-day free trial · Cancel anytime</p>    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '95vh', height: '95vh' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── HERO HEADER (matches real modal) ── */}
        <div className="flex-shrink-0 relative overflow-hidden" style={{ background: '#312e81' }}>
          <div className="relative z-10 p-4 sm:p-6 pb-0">

            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-4">
                <div className="mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Lead</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight truncate">
                  {lead.name}
                </h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Submitted {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center transition"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            {/* Status + chips */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span
                className="appearance-none pl-3 pr-3 py-1.5 text-xs font-bold"
                style={{ background: `${hex}25`, color: hex, border: `1px solid ${hex}40` }}
              >
                {statusLabel[lead.status] || 'New'}
              </span>

              {lead.scheduled_date ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold"
                  style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', color: '#7dd3fc' }}>
                  <Calendar className="w-3 h-3" />
                  {new Date(lead.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {lead.scheduled_time && ` · ${lead.scheduled_time}`}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)' }}>
                  <Calendar className="w-3 h-3" /> Not scheduled
                </div>
              )}

              {lead.assigned_to && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)' }}>
                  <User className="w-3 h-3" /> {lead.assigned_to}
                </div>
              )}

              {lead.quote_total && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold ${
                  lead.payment_status === 'paid'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : 'text-white/50'
                }`}
                  style={lead.payment_status !== 'paid' ? { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' } : {}}
                >
                  {lead.payment_status === 'paid'
                    ? `✓ Paid — ${fmt(lead.quote_total)}`
                    : `${fmt(lead.quote_total)} due`}
                </div>
              )}
            </div>

            {/* Tab bar */}
            <div className="flex items-center overflow-x-auto gap-0" style={{ scrollbarWidth: 'none' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all border-b-2 whitespace-nowrap"
                  style={{
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
                    borderBottomColor: activeTab === tab.id ? '#a5b4fc' : 'transparent',
                    background: 'transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#f6f6fa' }}>
          <div className="p-4 sm:p-6 space-y-4">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <>
                {/* Client card */}
                <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Client Info</h3>
                  </div>
                  <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Name</p><p className="text-sm font-semibold text-gray-900">{lead.name}</p></div>
                    <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Email</p><p className="text-sm font-semibold text-indigo-600 truncate">{lead.email}</p></div>
                    <div><p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Phone</p><p className="text-sm font-semibold text-indigo-600">{lead.phone}</p></div>
                    {lead.address_line_1 && (
                      <div className="col-span-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Address</p>
                        <p className="text-sm font-semibold text-gray-900">{lead.address_line_1}, {lead.city}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Category</p>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600">
                        {lead.category}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 px-5 pb-4">
                    {[
                      { icon: <Mail className="w-4 h-4" />, label: 'Email', color: '#3b82f6' },
                      { icon: <Phone className="w-4 h-4" />, label: 'Call', color: '#22c55e' },
                      { icon: <MapPin className="w-4 h-4" />, label: 'Directions', color: '#ef4444' },
                    ].map(btn => (
                      <div key={btn.label}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-100 bg-gray-50 rounded-none"
                      >
                        <span style={{ color: btn.color }}>{btn.icon}</span>
                        <span className="text-xs font-semibold text-gray-600">{btn.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer's Message</h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-gray-600 leading-relaxed">{lead.description}</p>
                    {lead.file_urls?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{lead.file_urls.length} Photos Submitted</p>
                        <div className="flex gap-2">
                          {lead.file_urls.slice(0, 4).map((_: any, i: number) => (
                            <div key={i} className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-none border border-indigo-200 flex items-center justify-center">
                              <Camera className="w-4 h-4 text-indigo-400" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Demo CTA */}
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

           {/* AI BRIEF — show real data if available, else locked */}
{activeTab === 'ai' && (
  lead.ai_brief ? (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-5 border border-indigo-700/40">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-300" />
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
      {/* Upsell below the real data */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-bold text-indigo-800">Every lead gets a brief like this</p>
          <p className="text-xs text-indigo-600">Sign up to generate AI briefs with photo analysis, urgency scoring, and next steps.</p>
        </div>
        <Link href="/signup" className="shrink-0 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition">
          Try Free
        </Link>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-7 h-7 text-indigo-400" />
      </div>
      <p className="font-black text-gray-800 text-lg mb-1">AI Brief</p>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Every lead gets an AI summary — scope, urgency, and next steps. Sign up to unlock.
      </p>
      <Link href="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
        Start Free Trial <ArrowRight className="w-4 h-4" />
      </Link>
      <p className="mt-3 text-xs text-gray-400">14-day free trial · Cancel anytime</p>
    </div>
  )
)}

{/* ALL OTHER TABS — locked */}
{activeTab !== 'overview' && activeTab !== 'ai' && <LockedTab />}

          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 border-2 border-gray-100 bg-white hover:bg-gray-50 text-sm font-bold text-gray-600 transition">
            Close
          </button>
          <Link href="/signup"
            className="flex-[2] py-3 text-sm font-bold text-white text-center transition flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
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
    const [showAiNudge, setShowAiNudge] = useState(false); // ← add here

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
     <div className="bg-indigo-600 px-4 py-2.5 flex items-center justify-between gap-3">
  <Link href="/" className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-xs font-bold transition shrink-0">
    <ArrowLeft className="w-3.5 h-3.5" /> Home
  </Link>
  <div className="flex items-center gap-2">
    <Eye className="w-4 h-4 text-indigo-200 shrink-0" />
    <p className="text-sm font-bold text-white hidden sm:block">You're viewing a live demo — data is read-only</p>
    <p className="text-sm font-bold text-white sm:hidden">Live Demo</p>
  </div>
  <Link href="/signup" className="px-4 py-1.5 bg-white text-indigo-600 text-xs font-black rounded-full hover:bg-indigo-50 transition shrink-0">
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
        {/* AI Chat Button — locked */}
<div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3">
  {showAiNudge && (
    <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-4 w-64 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900 mb-0.5">AI Assistant</p>
          <p className="text-xs text-gray-500 leading-relaxed">Ask anything about your leads, jobs, and revenue. Sign up to unlock.</p>
        </div>
      </div>
      <Link
        href="/signup"
        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition"
      >
        Try Free <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  )}
  <button
    onClick={() => setShowAiNudge(v => !v)}
    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
    style={{
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
    }}
  >
    <Sparkles className="w-6 h-6 text-white" />
  </button>
</div>
    </div>
  );
}