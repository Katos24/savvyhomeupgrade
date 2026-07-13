'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Send,
  Download,
  Clock,
  CheckCircle2,
  ArrowUpDown,
  Filter,
  Mail,
} from 'lucide-react';

function OutboxPreview() {
  const logs = [
    { user: 'Sarah Johnson', action: 'Roofing Quote sent', amount: '$8,400.00', status: 'Delivered', statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100', time: '12m ago' },
    { user: 'Mike Davis', action: 'Schedule confirmation', amount: '', status: 'Opened', statusColor: 'text-blue-600 bg-blue-50 border-blue-100', time: '1h ago' },
    { user: 'Tom Harris', action: 'Payment reminder', amount: '$3,400.00', status: 'Delivered', statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-100', time: '3h ago' },
    { user: 'Alex Cooper', action: 'Emergency Tarp Quote', amount: '$875.00', status: 'Pending', statusColor: 'text-slate-500 bg-slate-50 border-slate-100', time: 'Just now' },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full text-left">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-1.5">
          <Send size={10} className="text-slate-500" />
          <span className="text-[10px] font-black text-slate-800 tracking-tight">Outbox</span>
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
                <p className="text-[10px] font-black text-slate-900 truncate">{log.user}</p>
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

function ExportPreview() {
  const rows = [
    { name: 'John Smith', category: 'Roof Repair', status: 'Scheduled', amount: '$5,750', checked: true },
    { name: 'Sarah Kim', category: 'Leak Detect', status: 'Quoted', amount: '$1,200', checked: true },
    { name: 'Mike Davis', category: 'Inspection', status: 'New', amount: '$450', checked: false },
    { name: 'Alex Cooper', category: 'Gutter Guard', status: 'In Progress', amount: '$3,800', checked: true },
  ];

  const statusColors: Record<string, string> = {
    New: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    Quoted: 'text-amber-600 bg-amber-50 border-amber-100',
    Scheduled: 'text-sky-600 bg-sky-50 border-sky-100',
    'In Progress': 'text-blue-600 bg-blue-50 border-blue-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full text-left">
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
          <span className="text-[8px] font-bold text-blue-500 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">Bulk Selected (3)</span>
          <span className="text-[8px] font-black text-white bg-slate-900 px-1.5 py-0.5 rounded flex items-center gap-0.5 cursor-pointer">
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
                <p className="text-[10px] font-black text-slate-900 truncate">{row.name}</p>
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

export default function EfficiencyShowcase() {
  const cards = [
    {
      icon: Mail,
      iconBg: 'bg-emerald-50 border-emerald-200',
      iconColor: 'text-emerald-600',
      accentBorder: 'border-slate-200 hover:border-emerald-300 hover:shadow-lg',
      accentGlow: 'bg-emerald-500',
      title: 'One-Click Emails, Tracked',
      desc: 'Send quotes, confirmations, and project reminders. Every pipeline notification is monitored live.',
      preview: OutboxPreview,
    },
    {
      icon: Download,
      iconBg: 'bg-sky-50 border-sky-200',
      iconColor: 'text-sky-600',
      accentBorder: 'border-slate-200 hover:border-sky-300 hover:shadow-lg',
      accentGlow: 'bg-sky-500',
      title: 'Your Assets. Fully Exportable.',
      desc: 'Sync financial data with external accounting ledgers or pull CSV books. Safe data ownership with no lock-ins.',
      preview: ExportPreview,
    },
  ];

  return (
    <section id="showcase" className="py-20 sm:py-28 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none bg-repeat"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          <div className="lg:col-span-5 text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-3">
              Beyond the pipeline board
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-slate-900 font-black leading-tight tracking-tight">
              Every message tracked. <br />
              <span className="text-slate-400">Every record yours to keep.</span>
            </h2>
          </div>
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border border-slate-200 bg-white w-full aspect-[16/8] shadow-xl"
            >
              <Image
                src="/images/quote-send-tablet.webp"
                alt="Oakridge roofing quote production interface view"
                fill
                className="object-cover object-center"
                sizes="(max-w-1024px) 100vw, 700px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
              <div className="absolute bottom-4 left-4 sm:left-6 text-left">
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-0.5">Live Action Capture</p>
                <p className="text-sm font-black text-white">Project assessment finalized. One tap to fire out details.</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {cards.map((card, i) => {
            const Icon = card.icon;
            const Preview = card.preview;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.25 }}
                className={`relative bg-white border rounded-2xl p-6 flex flex-col shadow-sm transition-all duration-300 group ${card.accentBorder}`}
              >
                <div className={`absolute top-0 left-1/4 w-1/2 h-px ${card.accentGlow} opacity-20 blur-[1px]`} />
                <div className="mb-6 text-left">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 border ${card.iconBg}`}>
                    <Icon size={15} className={card.iconColor} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-auto pt-2 rounded-xl">
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