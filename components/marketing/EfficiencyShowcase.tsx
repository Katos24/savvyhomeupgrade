'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, FileText, Zap, ClipboardList, Send, Check, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const TABS = [
  { id: 'emails', label: 'Branded Emails', icon: Mail, color: '#3b82f6' },
  { id: 'quotes', label: 'Quote Templates', icon: FileText, color: '#10b981' },
  { id: 'oneclick', label: 'One-Click Send', icon: Zap, color: '#f97316' },
  { id: 'tasks', label: 'Task Templates', icon: ClipboardList, color: '#8b5cf6' },
];

/* ── Preview Components ── */

function EmailPreview() {
  return (
    <div className="space-y-3">
      {/* Variable tags */}
      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
        <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-2" style={{ fontFamily: font, fontWeight: 800 }}>Available Variables</p>
        <div className="flex flex-wrap gap-1.5">
          {['{{company_name}}', '{{customer_name}}', '{{scheduled_date}}', '{{customer_address}}'].map(v => (
            <span key={v} className="px-2 py-0.5 bg-slate-700 rounded text-[9px] text-slate-400 border border-slate-600" style={{ fontFamily: 'monospace' }}>
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Live preview — branded email */}
      <div className="bg-white rounded-xl overflow-hidden border-2 border-slate-700">
        <div className="h-20 flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e293b 0%, #f97316 50%, #ea580c 100%)' }}
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-1 shadow-md">
            <img src="/images/ridgelinelogo.webp" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <p className="text-[10px] text-white" style={{ fontFamily: font, fontWeight: 900 }}>Ridge Line Roofing</p>
        </div>
        <div className="p-3 text-left">
          <div className="flex flex-col sm:flex-row sm:gap-4 gap-0.5 text-[9px] text-slate-400 mb-2 border-b border-slate-100 pb-2" style={{ fontFamily: font, fontWeight: 600 }}>
            <span><strong className="text-slate-600">From:</strong> Ridge Line Roofing</span>
            <span><strong className="text-slate-600">To:</strong> john.smith@email.com</span>
          </div>
          <p className="text-xs text-slate-900 mb-2" style={{ fontFamily: font, fontWeight: 900 }}>
            Appointment Scheduled - Ridge Line Roofing
          </p>
          <div className="text-[10px] text-slate-600 space-y-1.5 leading-relaxed" style={{ fontFamily: font, fontWeight: 600 }}>
            <p>Hi John Smith,</p>
            <p>Your appointment has been scheduled!</p>
            <p>Date: March 15, 2024<br />Time: 10:00 AM<br />Address: 123 Main St, Anytown</p>
            <p>We look forward to serving you!</p>
            <p className="text-slate-400 pt-1">Best regards,<br />Ridge Line Roofing</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuotePreview() {
  const items = [
    { desc: 'Tear-off existing shingles', price: 80, qty: 1 },
    { desc: 'Architectural shingles', price: 120, qty: 1 },
    { desc: 'Underlayment & ice shield', price: 40, qty: 1 },
    { desc: 'Flashing & drip edge', price: 3.86, qty: 1 },
    { desc: 'Ridge vent', price: 12, qty: 1 },
    { desc: 'Cleanup & haul away', price: 750, qty: 1 },
  ];
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-white" style={{ fontFamily: font, fontWeight: 900 }}>Pricing Template</p>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest" style={{ fontFamily: font, fontWeight: 700 }}>Roof Replacement</p>
        </div>
      </div>
      <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
        <div className="grid grid-cols-[1fr_50px_28px_55px] sm:grid-cols-[1fr_60px_32px_60px] gap-1 px-2 sm:px-3 py-2 bg-slate-900/80 border-b border-slate-700">
          <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest" style={{ fontFamily: font, fontWeight: 800 }}>Item</span>
          <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest text-right" style={{ fontFamily: font, fontWeight: 800 }}>Price</span>
          <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest text-center" style={{ fontFamily: font, fontWeight: 800 }}>Qty</span>
          <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest text-right" style={{ fontFamily: font, fontWeight: 800 }}>Total</span>
        </div>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-[1fr_50px_28px_55px] sm:grid-cols-[1fr_60px_32px_60px] gap-1 px-2 sm:px-3 py-2 sm:py-2.5 border-b border-slate-800/50 items-center">
            <span className="text-[9px] sm:text-[10px] text-white truncate" style={{ fontFamily: font, fontWeight: 700 }}>{item.desc}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 text-right" style={{ fontFamily: font, fontWeight: 700 }}>${item.price.toFixed(2)}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 text-center" style={{ fontFamily: font, fontWeight: 700 }}>{item.qty}</span>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 text-right" style={{ fontFamily: font, fontWeight: 900 }}>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-3 py-3 bg-slate-900/50">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest" style={{ fontFamily: font, fontWeight: 800 }}>Total Estimate</span>
          <span className="text-base text-emerald-400" style={{ fontFamily: font, fontWeight: 900 }}>${total.toFixed(2)}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <button className="py-2 rounded-lg text-[10px] text-slate-400 border border-slate-700 bg-slate-800" style={{ fontFamily: font, fontWeight: 800 }}>Cancel</button>
        <button className="py-2 rounded-lg text-[10px] text-white bg-emerald-500 border border-emerald-400" style={{ fontFamily: font, fontWeight: 900 }}>Save Changes</button>
      </div>
    </div>
  );
}

function OneClickPreview() {
  return (
    <div>
      {/* Background — dimmed lead card */}
      <div className="relative">
        {/* Lead info bar */}
        <div className="bg-slate-800 rounded-xl p-3 mb-3 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs text-white" style={{ fontFamily: font, fontWeight: 900 }}>#161 Sarah Johnson</p>
              <p className="text-[9px] text-slate-500" style={{ fontFamily: font, fontWeight: 600 }}>Submitted Apr 16, 2026</p>
            </div>
            <span className="text-[9px] text-emerald-400 px-2 py-0.5 bg-emerald-500/15 rounded border border-emerald-500/25" style={{ fontFamily: font, fontWeight: 800 }}>
              In Progress
            </span>
          </div>
          {/* Quote line items peeking behind */}
          <div className="space-y-1.5 opacity-40">
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400" style={{ fontFamily: font, fontWeight: 600 }}>Labor - Detailed scope</span>
              <span className="text-white" style={{ fontFamily: font, fontWeight: 800 }}>$250.00</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span className="text-slate-400" style={{ fontFamily: font, fontWeight: 600 }}>Materials - Document</span>
              <span className="text-white" style={{ fontFamily: font, fontWeight: 800 }}>$150.00</span>
            </div>
            <div className="flex justify-between text-[9px] pt-1 border-t border-slate-700">
              <span className="text-slate-500 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 800 }}>Total</span>
              <span className="text-white" style={{ fontFamily: font, fontWeight: 900 }}>$450.00</span>
            </div>
          </div>
        </div>

        {/* Send Quote Modal — overlaid */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-slate-200 relative z-10">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
            <Send size={18} className="text-orange-500" />
          </div>

          <p className="text-base text-slate-900 mb-1" style={{ fontFamily: font, fontWeight: 900 }}>
            Send Quote?
          </p>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed" style={{ fontFamily: font, fontWeight: 600 }}>
            An email will be sent to <strong className="text-slate-900">Sarah Johnson</strong> at <strong className="text-slate-900">sarah.j@email.com</strong> — <span className="text-emerald-600" style={{ fontWeight: 900 }}>$450.00</span>.
          </p>

          {/* Status */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
            <Clock size={12} className="text-emerald-600" />
            <span className="text-xs text-emerald-700" style={{ fontFamily: font, fontWeight: 700 }}>No email sent yet.</span>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 rounded-full text-xs text-slate-500 bg-slate-100 border border-slate-200" style={{ fontFamily: font, fontWeight: 800 }}>
              Cancel
            </button>
            <button className="py-2.5 rounded-full text-xs text-white bg-orange-500 border-2 border-orange-400 flex items-center justify-center gap-1.5 shadow-md" style={{ fontFamily: font, fontWeight: 900 }}>
              <Send size={11} /> Send It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TasksPreview() {
  const tasks = [
    { text: 'Schedule inspection', done: true },
    { text: 'Order materials', done: true },
    { text: 'Pull permit', done: false },
    { text: 'Confirm crew for Monday', done: false },
    { text: 'Send pre-job email', done: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white" style={{ fontFamily: font, fontWeight: 900 }}>Roof Replacement Checklist</span>
        <span className="text-[9px] text-purple-400 px-2 py-0.5 bg-purple-500/15 rounded border border-purple-500/25" style={{ fontFamily: font, fontWeight: 800 }}>TEMPLATE</span>
      </div>
      <div className="space-y-1.5">
        {tasks.map((task, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${
              task.done ? 'bg-emerald-500/8 border-emerald-500/15' : 'bg-slate-800/40 border-slate-700/40'
            }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 ${
              task.done ? 'bg-emerald-500 border-emerald-400' : 'border-slate-600'
            }`}>
              {task.done && <Check size={9} className="text-white" strokeWidth={3} />}
            </div>
            <span
              className={`text-[11px] ${task.done ? 'text-emerald-400/70 line-through' : 'text-slate-300'}`}
              style={{ fontFamily: font, fontWeight: task.done ? 600 : 700 }}
            >
              {task.text}
            </span>
          </div>
        ))}
      </div>
      <button
        className="w-full py-2 mt-3 rounded-lg text-[10px] text-white bg-purple-500 border border-purple-400 flex items-center justify-center gap-1.5"
        style={{ fontFamily: font, fontWeight: 900 }}
      >
        <ClipboardList size={10} /> Apply Template to Job
      </button>
    </div>
  );
}

const PREVIEWS: Record<string, () => React.ReactNode> = {
  emails: EmailPreview,
  quotes: QuotePreview,
  oneclick: OneClickPreview,
  tasks: TasksPreview,
};

const PITCHES: Record<string, { headline: string; sub: string }> = {
  emails: {
    headline: 'Your logo. Your colors. Your message. Every email looks like it came from a real company — because it did.',
    sub: 'Build email templates once with dynamic variables. They auto-fill with customer details. Hit send. Done.',
  },
  quotes: {
    headline: 'Professional quotes with line items, quantities, and totals. Save templates for jobs you do all the time.',
    sub: 'Stop rebuilding quotes from scratch in Word docs. Create it once, reuse it forever.',
  },
  oneclick: {
    headline: 'Build quote. Click send. Customer gets a branded email with the total. You get it logged in your outbox.',
    sub: 'No copying. No pasting. No switching apps. Just click the button.',
  },
  tasks: {
    headline: 'Every roof job needs the same 8 steps. Create it once as a template, apply it to any job with one click.',
    sub: 'Never forget to pull a permit or order materials again.',
  },
};

export default function EfficiencyShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const current = TABS[activeTab];
  const PreviewComponent = PREVIEWS[current.id];
  const pitch = PITCHES[current.id];

  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-28 bg-white">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-3 leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            More Than Just Leads.
            <br />
            <span className="text-emerald-500">Your Entire Toolkit.</span>
          </h2>
          <p
            className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto"
            style={{ fontFamily: font, fontWeight: 700 }}
          >
            Set it up once. Use it forever. Close more jobs.
          </p>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex gap-2 sm:gap-3 mb-8 sm:mb-10 flex-wrap justify-center">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm transition-all border-3 ${
                  activeTab === i
                    ? 'bg-slate-900 text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,0.3)]'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                }`}
                style={{ fontFamily: font, fontWeight: 800, borderWidth: '3px' }}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-8 lg:gap-12 items-start"
          >
            {/* Left — App preview */}
            <div className="order-1">
              <div className="bg-slate-900 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-slate-800 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]" style={{ borderWidth: undefined }}>
                <div className="px-4 py-2.5 border-b-3 border-slate-700 flex items-center gap-2" style={{ borderBottomWidth: '3px' }}>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] text-slate-500 ml-2" style={{ fontFamily: font, fontWeight: 700 }}>Lead2Project</span>
                </div>
                <div className="p-4 sm:p-5">
                  <PreviewComponent />
                </div>
              </div>
            </div>

            {/* Right — Value pitch */}
            <div className="order-2 flex flex-col justify-center lg:py-6">
              <div
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5 border-2 sm:border-3"
                style={{
                  backgroundColor: current.color + '15',
                  borderColor: current.color + '30',
                  borderWidth: '3px',
                }}
              >
                <current.icon size={20} style={{ color: current.color }} />
              </div>

              <h3
                className="text-xl sm:text-2xl text-slate-900 mb-4 leading-snug"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                {pitch.headline}
              </h3>

              <p
                className="text-sm sm:text-base text-slate-500 leading-relaxed mb-6"
                style={{ fontFamily: font, fontWeight: 600 }}
              >
                {pitch.sub}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 self-start">
                <Clock size={14} className="text-emerald-400" />
                <span className="text-xs text-white" style={{ fontFamily: font, fontWeight: 900 }}>
                  Save 10+ hours every week
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 sm:mt-20 text-center"
        >
          <p className="text-xl sm:text-2xl text-slate-900 mb-2" style={{ fontFamily: font, fontWeight: 900 }}>
            Less typing. Less clicking. More jobs closed.
          </p>
          <p className="text-base text-slate-500 mb-8" style={{ fontFamily: font, fontWeight: 700 }}>
            That's the entire point.
          </p>
      
        </motion.div>

      </div>
    </section>
  );
}