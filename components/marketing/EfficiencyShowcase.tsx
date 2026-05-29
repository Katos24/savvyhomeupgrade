'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Send,
  Tag,
  Download,
  Clock,
  CheckCircle2,
  ArrowUpDown,
  Filter,
  FileText,
  Mail,
} from 'lucide-react';

const font = "'Nunito', sans-serif";

function OutboxPreview() {
  const logs = [
    { user: 'Sarah Johnson', action: 'Quote sent', amount: '$1,200.00', status: 'Delivered', statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100', time: '12m ago' },
    { user: 'Mike Davis', action: 'Schedule confirmation', amount: '', status: 'Opened', statusColor: 'text-blue-600 bg-blue-50 border-blue-100', time: '1h ago' },
    { user: 'Tom Harris', action: 'Payment reminder', amount: '$3,400.00', status: 'Delivered', statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100', time: '3h ago' },
    { user: 'Alex Cooper', action: 'Quote sent', amount: '$875.00', status: 'Pending', statusColor: 'text-slate-500 bg-slate-50 border-slate-100', time: 'Just now' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <Send size={10} className="text-slate-500" />
          <span className="text-[9px] font-black text-slate-800 tracking-tight" style={{ fontFamily: font }}>Outbox</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold">
          <Clock size={8} /> Live tracking
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {logs.map((log, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2.5">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <p className="text-[10px] font-black text-slate-900 truncate" style={{ fontFamily: font }}>{log.user}</p>
                <span className="text-[7px] text-slate-400 font-bold flex-shrink-0">{log.time}</span>
              </div>
              <p className="text-[9px] text-slate-500 font-bold truncate mt-0.5">
                {log.action}{log.amount ? ` — ${log.amount}` : ''}
              </p>
            </div>
            <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border flex-shrink-0 tracking-wider ${log.statusColor}`}>
              {log.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesPreview() {
  const categories = [
    { name: 'Roof Repair', color: '#f97316', templates: 'Quote template + 4 tasks' },
    { name: 'Leak Detection', color: '#3b82f6', templates: 'Quote template + 2 tasks' },
    { name: 'Full Replacement', color: '#10b981', templates: 'Quote template + 7 tasks' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <Tag size={10} className="text-slate-500" />
          <span className="text-[9px] font-black text-slate-800 tracking-tight" style={{ fontFamily: font }}>Categories</span>
        </div>
        <span className="text-[8px] font-bold text-blue-500">+ Add New</span>
      </div>
      <div className="divide-y divide-slate-50">
        {categories.map((cat, i) => (
          <div key={i} className="px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-[10px] font-black text-slate-900" style={{ fontFamily: font }}>{cat.name}</span>
            </div>
            <div className="pl-4">
              <span className="text-[8px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 w-fit">
                <FileText size={7} /> {cat.templates}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportPreview() {
  const rows = [
    { name: 'John Smith', category: 'Roof Repair', status: 'Scheduled', amount: '$5,750', checked: true },
    { name: 'Sarah Kim', category: 'Leak Detect', status: 'Quoted', amount: '$1,200', checked: true },
    { name: 'Mike Davis', category: 'Inspection', status: 'New', amount: '$450', checked: false },
    { name: 'Alex Cooper', category: 'Siding', status: 'In Progress', amount: '$3,800', checked: true },
  ];

  const statusColors: Record<string, string> = {
    New: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    Quoted: 'text-amber-600 bg-amber-50 border-amber-100',
    Scheduled: 'text-sky-600 bg-sky-50 border-sky-100',
    'In Progress': 'text-blue-600 bg-blue-50 border-blue-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[8px] font-bold text-slate-500">
            <Filter size={7} /> Filter
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[8px] font-bold text-slate-500">
            <ArrowUpDown size={7} /> Sort
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="text-[8px] font-bold text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">Bulk Edit (3)</span>
          <span className="text-[8px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Download size={7} /> CSV
          </span>
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {rows.map((row, i) => (
          <div key={i} className={`flex items-center justify-between px-3 py-2 ${row.checked ? 'bg-blue-50/30' : ''}`}>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                row.checked ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'
              }`}>
                {row.checked && <CheckCircle2 size={8} className="text-white" />}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-900 truncate" style={{ fontFamily: font }}>{row.name}</p>
                <p className="text-[8px] text-slate-400 font-bold">{row.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border ${statusColors[row.status]}`}>
                {row.status}
              </span>
              <span className="text-[9px] font-black text-slate-700 font-mono">{row.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OperationsShowcase() {
  const cards = [
    {
      icon: Mail,
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-400',
      accentBorder: 'border-emerald-500/20 hover:border-emerald-500/40',
      accentGlow: 'bg-emerald-500',
      title: 'One-Click Emails, Tracked',
      desc: 'Send quotes, confirmations, and payment reminders. Every email tracked in your outbox.',
      preview: OutboxPreview,
    },
    {
      icon: Tag,
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-400',
      accentBorder: 'border-amber-500/20 hover:border-amber-500/40',
      accentGlow: 'bg-amber-500',
      title: 'Categories That Work For You',
      desc: 'Attach quote templates and tasks to each job type.',
      preview: CategoriesPreview,
    },
    {
      icon: Download,
      iconBg: 'bg-sky-500/10 border-sky-500/20',
      iconColor: 'text-sky-400',
      accentBorder: 'border-sky-500/20 hover:border-sky-500/40',
      accentGlow: 'bg-sky-500',
      title: 'Your Data. Always Yours.',
      desc: 'CSV export, bulk edits, full data portability. No lock-in.',
      preview: ExportPreview,
    },
  ];

  return (
    <section id="showcase" className="py-24 sm:py-28 lg:py-36 bg-slate-100 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Section header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-4"
            style={{ fontFamily: font }}
          >
            Beyond the board view
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl text-slate-900 font-black leading-[1.05] tracking-tight"
            style={{ fontFamily: font }}
          >
            Everything else you need. <br />
            <span className="text-emerald-600">Nothing you don&apos;t.</span>
          </motion.h2>
        </div>

        {/* Tablet image — natural aspect ratio on mobile, fixed ratio on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden mb-12 sm:mb-16 w-full aspect-[4/3] sm:aspect-[16/7]"
        >
          <Image
            src="/images/quote-send-tablet.webp"
            alt="Sending a quote on tablet"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">In action</p>
            <p className="text-base sm:text-lg font-black text-white" style={{ fontFamily: font }}>Quote built. One tap to send.</p>
          </div>
        </motion.div>

        {/* 3-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const Preview = card.preview;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className={`relative bg-slate-900 border rounded-2xl p-6 flex flex-col transition-all duration-300 group ${card.accentBorder}`}
              >
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px ${card.accentGlow} opacity-30 blur-[1px]`} />
                <div className="mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 border ${card.iconBg}`}>
                    <Icon size={16} className={card.iconColor} />
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight mb-1.5" style={{ fontFamily: font }}>
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold leading-relaxed" style={{ fontFamily: font }}>
                    {card.desc}
                  </p>
                </div>
                <div className="mt-auto">
                  <Preview />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}