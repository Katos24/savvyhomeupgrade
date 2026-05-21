'use client';

import { motion } from 'framer-motion';
import {
  List,
  Calendar,
  Send,
  SlidersHorizontal,
  Sparkles,
  Download,
  Filter,
  ArrowUpDown,
  Pencil,
} from 'lucide-react';

const font = "'Nunito', sans-serif";

/* ─────────────────────────────────────
   PREVIEW COMPONENTS (unchanged)
   ───────────────────────────────────── */

function TablePreview() {
  const leads = [
    { name: 'John Smith', status: 'Scheduled', category: 'Roof Repair', amount: '$5,750', assigned: 'Frank' },
    { name: 'Sarah Kim', status: 'Quoted', category: 'Leak Detection', amount: '$1,200', assigned: 'Jorge' },
    { name: 'Mike Davis', status: 'New', category: 'Inspection', amount: '—', assigned: '—' },
    { name: 'Lisa Chen', status: 'Paid', category: 'Gutter Work', amount: '$2,400', assigned: 'Kevin' },
    { name: 'David R.', status: 'In Progress', category: 'Roof Replace', amount: '$12,005', assigned: 'Jack' },
  ];

  const statusColors: Record<string, string> = {
    New: 'bg-emerald-100 text-emerald-700',
    Quoted: 'bg-amber-100 text-amber-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    'In Progress': 'bg-orange-100 text-orange-700',
    Paid: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500">
          <Filter size={9} /> Filters
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-500">
          <ArrowUpDown size={9} /> Sort
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500 rounded-lg text-[9px] font-bold text-white">
          <Pencil size={9} /> Bulk Edit
        </div>
      </div>
      <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.6fr] px-3 py-2 bg-slate-50 border-b border-slate-100">
        {['Customer', 'Status', 'Category', 'Amount'].map((h) => (
          <p key={h} className="text-[8px] font-black uppercase tracking-wider text-slate-400" style={{ fontFamily: font }}>{h}</p>
        ))}
      </div>
      {leads.map((lead, i) => (
        <div
          key={lead.name}
          className={`grid grid-cols-[1.2fr_0.8fr_0.7fr_0.6fr] px-3 py-2 items-center ${i < leads.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-blue-50/30 transition-colors`}
        >
          <div>
            <p className="text-[10px] font-black text-slate-800" style={{ fontFamily: font }}>{lead.name}</p>
            <p className="text-[8px] text-slate-400 font-semibold">{lead.assigned}</p>
          </div>
          <div>
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${statusColors[lead.status] || 'bg-slate-100 text-slate-500'}`}>
              {lead.status}
            </span>
          </div>
          <p className="text-[9px] text-slate-500 font-semibold">{lead.category}</p>
          <p className="text-[10px] font-black text-slate-800" style={{ fontFamily: font }}>{lead.amount}</p>
        </div>
      ))}
    </div>
  );
}

function CalendarPreview() {
  const days = [
    { day: 'Mon 19', jobs: [] },
    { day: 'Tue 20', jobs: [{ name: 'J. Smith', time: '8:30 AM', color: 'bg-blue-500' }, { name: 'S. Kim', time: '2:00 PM', color: 'bg-amber-500' }] },
    { day: 'Wed 21', jobs: [{ name: 'M. Davis', time: '10:00 AM', color: 'bg-emerald-500' }] },
    { day: 'Thu 22', jobs: [{ name: 'L. Chen', time: '9:00 AM', color: 'bg-violet-500' }, { name: 'D. Reyes', time: '1:00 PM', color: 'bg-orange-500' }] },
    { day: 'Fri 23', jobs: [{ name: 'T. Rodriguez', time: '11:00 AM', color: 'bg-blue-500' }] },
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <p className="text-[10px] font-black text-slate-800" style={{ fontFamily: font }}>May 2026</p>
        <div className="flex gap-1">
          {['Day', 'Week', 'Month'].map((v) => (
            <span key={v} className={`text-[8px] font-bold px-2 py-0.5 rounded-md ${v === 'Week' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>{v}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-5 divide-x divide-slate-100">
        {days.map((d) => (
          <div key={d.day} className="min-h-[100px] p-1.5">
            <p className="text-[8px] font-bold text-slate-400 mb-1.5" style={{ fontFamily: font }}>{d.day}</p>
            <div className="space-y-1">
              {d.jobs.map((job) => (
                <div key={job.name} className={`${job.color} rounded-md px-1.5 py-1 text-white`}>
                  <p className="text-[7px] font-black leading-tight">{job.name}</p>
                  <p className="text-[6px] opacity-80">{job.time}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OutboxPreview() {
  const emails = [
    { to: 'John Smith', type: 'Quote', subject: 'Roof Repair Estimate — $5,750', time: '2 hrs ago', status: 'Delivered' },
    { to: 'Sarah Kim', type: 'Schedule', subject: 'Appointment Confirmed — May 18', time: '5 hrs ago', status: 'Delivered' },
    { to: 'Mike Davis', type: 'Payment', subject: 'Payment Reminder — $2,400 due', time: '1 day ago', status: 'Opened' },
    { to: 'Lisa Chen', type: 'Quote', subject: 'Gutter Cleaning Estimate — $800', time: '2 days ago', status: 'Declined' },
  ];

  const typeColors: Record<string, string> = {
    Quote: 'bg-emerald-100 text-emerald-700',
    Schedule: 'bg-blue-100 text-blue-700',
    Payment: 'bg-amber-100 text-amber-700',
  };

  const statusDot: Record<string, string> = {
    Delivered: 'bg-emerald-500',
    Opened: 'bg-blue-500',
    Declined: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <Send size={10} className="text-slate-400" />
        <p className="text-[10px] font-black text-slate-700" style={{ fontFamily: font }}>Outbox</p>
        <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold ml-auto">47 sent</span>
      </div>
      {emails.map((email, i) => (
        <div key={email.to} className={`px-3 py-2.5 flex items-start gap-2.5 ${i < emails.length - 1 ? 'border-b border-slate-50' : ''}`}>
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${statusDot[email.status] || 'bg-slate-300'}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-[10px] font-black text-slate-800 truncate" style={{ fontFamily: font }}>{email.to}</p>
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${typeColors[email.type] || 'bg-slate-100 text-slate-500'}`}>{email.type}</span>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold truncate">{email.subject}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[8px] text-slate-400 font-semibold">{email.time}</p>
            <p className="text-[7px] text-slate-400 font-bold">{email.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PipelinePreview() {
  const stages = [
    { name: 'New', count: 5, color: 'bg-emerald-500' },
    { name: 'Contacted', count: 3, color: 'bg-yellow-500' },
    { name: 'Quoted', count: 4, color: 'bg-blue-500' },
    { name: 'Scheduled', count: 2, color: 'bg-orange-500' },
    { name: 'Complete', count: 6, color: 'bg-slate-500' },
    { name: 'Paid', count: 8, color: 'bg-emerald-600' },
  ];

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[9px] font-black uppercase tracking-wider text-slate-400" style={{ fontFamily: font }}>Pipeline Stages</p>
        <span className="text-[8px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">Drag to reorder</span>
      </div>
      {stages.map((stage) => (
        <div key={stage.name} className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1 text-slate-300">
            <div className="w-1 h-3 bg-slate-300 rounded-full" />
            <div className="w-1 h-3 bg-slate-300 rounded-full" />
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${stage.color} flex-shrink-0`} />
          <p className="text-[10px] font-bold text-slate-700 flex-1" style={{ fontFamily: font }}>{stage.name}</p>
          <span className="text-[8px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">{stage.count}</span>
        </div>
      ))}
    </div>
  );
}

function AIPreview() {
  return (
    <div className="bg-slate-950 rounded-xl border-2 border-slate-800 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2">
        <Sparkles size={10} className="text-emerald-400" />
        <p className="text-[10px] font-black text-white" style={{ fontFamily: font }}>AI Brief — John Smith</p>
      </div>
      <div className="p-3 space-y-2">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
          <p className="text-[9px] text-emerald-300 font-semibold leading-relaxed" style={{ fontFamily: font }}>
            Homeowner reporting storm damage on north-facing slope. Missing shingles visible in uploaded photos. Roof is 15+ years old — likely full replacement candidate. Customer mentioned insurance claim in progress. Recommend scheduling inspection ASAP and preparing both repair and replacement quotes.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
            <p className="text-[8px] text-slate-500 font-bold" style={{ fontFamily: font }}>Suggested quote</p>
            <p className="text-[11px] text-emerald-400 font-black" style={{ fontFamily: font }}>$5,200 – $8,400</p>
          </div>
          <div className="flex-1 bg-slate-800 rounded-lg p-2 text-center">
            <p className="text-[8px] text-slate-500 font-bold" style={{ fontFamily: font }}>Priority</p>
            <p className="text-[11px] text-amber-400 font-black" style={{ fontFamily: font }}>High</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportPreview() {
  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-4 text-center space-y-3">
      <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto flex items-center justify-center">
        <Download size={20} className="text-slate-500" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-800" style={{ fontFamily: font }}>leads_export_may2026.csv</p>
        <p className="text-[9px] text-slate-400 font-semibold" style={{ fontFamily: font }}>247 leads · 18 columns · 1.2 MB</p>
      </div>
      <div className="flex flex-wrap gap-1 justify-center">
        {['Name', 'Email', 'Phone', 'Status', 'Category', 'Quote', 'Payment', 'Date'].map((col) => (
          <span key={col} className="text-[7px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">{col}</span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   FEATURE ROW DATA
   ───────────────────────────────────── */

const FEATURES: {
  id: string;
  icon: any;
  accent: string;
  headline: string;
  body: string;
  Preview: React.FC;
}[] = [
  {
    id: 'table',
    icon: List,
    accent: '#0ea5e9',
    headline: 'Every lead. One table. Total control.',
    body: 'Filter by status, date, assigned crew, or payment. Sort any column. Bulk edit 50 leads at once. This is your command center when the board view isn\'t enough.',
    Preview: TablePreview,
  },
  {
    id: 'calendar',
    icon: Calendar,
    accent: '#f43f5e',
    headline: 'See your week before it happens.',
    body: 'Every scheduled job on a real calendar — day, week, or month. Click to open the lead card. Know exactly who\'s going where and when.',
    Preview: CalendarPreview,
  },
  {
    id: 'outbox',
    icon: Send,
    accent: '#8b5cf6',
    headline: 'Every email you\'ve ever sent. Tracked.',
    body: 'Quotes, schedule confirmations, payment reminders — every email lives in your outbox with timestamps, recipient, and status. When a customer says "I never got it," you\'ll know.',
    Preview: OutboxPreview,
  },
  {
    id: 'pipeline',
    icon: SlidersHorizontal,
    accent: '#f97316',
    headline: 'Your workflow. Your stages. Your rules.',
    body: 'Rename pipeline stages, reorder them, add new ones. "New → Contacted → Quoted → Scheduled → Complete → Paid" or whatever fits how you actually work.',
    Preview: PipelinePreview,
  },
  {
    id: 'ai',
    icon: Sparkles,
    accent: '#10b981',
    headline: 'AI that helps, not replaces.',
    body: 'Get an instant brief on any lead, chat with AI about your pipeline, or generate a starting quote. It\'s not perfect — but it saves you 10 minutes on every new lead.',
    Preview: AIPreview,
  },
  {
    id: 'export',
    icon: Download,
    accent: '#64748b',
    headline: 'Your data. Take it anywhere.',
    body: 'Download your entire lead database as a CSV anytime. Use it for taxes, reporting, marketing lists, or just peace of mind that your data isn\'t locked in.',
    Preview: ExportPreview,
  },
];

/* ─────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────── */

export default function EfficiencyShowcase() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">

        {/* HEADER */}
        <div className="text-center mb-14 sm:mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3"
            style={{ fontFamily: font }}
          >
            Beyond the board
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Everything else you didn&apos;t know{' '}
            <br className="hidden sm:block" />
            <span className="text-blue-600">you needed.</span>
          </motion.h2>
        </div>

        {/* FEATURE ROWS */}
        <div className="space-y-16 sm:space-y-24">
          {FEATURES.map((feature, i) => {
            const isEven = i % 2 === 0;
            const Icon = feature.icon;
            const Preview = feature.Preview;

            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center ${
                  isEven ? '' : 'lg:[direction:rtl]'
                }`}
              >
                {/* Preview */}
                <div className={`transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 rounded-xl ${isEven ? '' : 'lg:[direction:ltr]'}`}>
                  <Preview />
                </div>

                {/* Copy */}
                <div className={`space-y-4 ${isEven ? '' : 'lg:[direction:ltr]'}`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${feature.accent}15`, border: `1px solid ${feature.accent}30` }}
                  >
                    <Icon size={18} style={{ color: feature.accent }} />
                  </div>

                  <h3
                    className="text-xl sm:text-2xl lg:text-3xl text-slate-900 leading-tight"
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    {feature.headline}
                  </h3>

                  <p
                    className="text-sm sm:text-base text-slate-500 leading-relaxed font-semibold max-w-md"
                    style={{ fontFamily: font }}
                  >
                    {feature.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}