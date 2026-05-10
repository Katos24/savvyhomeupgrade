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

/* ── Preview Components (Content Unchanged) ── */

function EmailPreview() {
  return (
    <div className="space-y-3">
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
      <div className="relative">
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
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-slate-200 relative z-10">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
            <Send size={18} className="text-orange-500" />
          </div>
          <p className="text-base text-slate-900 mb-1" style={{ fontFamily: font, fontWeight: 900 }}>
            Send Quote?
          </p>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed" style={{ fontFamily: font, fontWeight: 600 }}>
            An email will be sent to <strong className="text-slate-900">Sarah Johnson</strong> at <strong className="text-slate-900">sarah.j@email.com</strong> — <span className="text-emerald-600" style={{ fontWeight: 900 }}>$450.00</span>.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
            <Clock size={12} className="text-emerald-600" />
            <span className="text-xs text-emerald-700" style={{ fontFamily: font, fontWeight: 700 }}>No email sent yet.</span>
          </div>
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
    <section className="relative overflow-hidden py-12 sm:py-20 lg:py-28 bg-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4 leading-[1.1]"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            More Than Just Leads.
            <br />
            <span className="text-emerald-500">Your Entire Toolkit.</span>
          </h2>
          <p
            className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto font-bold"
            style={{ fontFamily: font }}
          >
            Set it up once. Use it forever. Close more jobs.
          </p>
        </motion.div>

        {/* Tab Bar - Mobile Optimized Scroll/Wrap */}
        <div className="flex gap-2 sm:gap-3 mb-10 sm:mb-14 flex-wrap justify-center sm:flex-nowrap sm:overflow-x-auto pb-2 no-scrollbar">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm transition-all whitespace-nowrap ${
                  activeTab === i
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20'
                    : 'bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-300'
                }`}
                style={{ fontFamily: font, fontWeight: 800, borderStyle: 'solid' }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start"
          >
            {/* "The Proof" (Visual Preview) - Order 1 on Mobile */}
            <div className="order-1 lg:order-1 w-full max-w-md mx-auto lg:max-w-none">
              <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border-[6px] sm:border-[8px] border-slate-800 overflow-hidden shadow-2xl shadow-slate-900/10">
                {/* Mock Window Header */}
                <div className="px-5 py-4 border-b-2 border-slate-800 flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Live Workspace</span>
                </div>
                {/* Dynamic Content */}
                <div className="p-4 sm:p-8">
                  <PreviewComponent />
                </div>
              </div>
            </div>

            {/* "The Pitch" (Text) - Order 2 on Mobile */}
            <div className="order-2 lg:order-2 flex flex-col justify-center text-center lg:text-left pt-2">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 border-b-4"
                style={{
                  backgroundColor: current.color + '15',
                  borderColor: current.color,
                }}
              >
                <current.icon size={24} style={{ color: current.color }} />
              </div>

              <h3
                className="text-2xl sm:text-3xl lg:text-4xl text-slate-900 mb-5 leading-tight tracking-tight"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                {pitch.headline}
              </h3>

              <p
                className="text-base sm:text-lg text-slate-500 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
                style={{ fontFamily: font, fontWeight: 600 }}
              >
                {pitch.sub}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 lg:justify-start">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Clock size={16} />
                  <span className="text-sm font-black" style={{ fontFamily: font }}>
                    Saves 10+ hours / week
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Simple Bottom CTA Text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-24 pt-10 border-t border-slate-100 text-center"
        >
          <p className="text-xl sm:text-2xl text-slate-900 font-black mb-2" style={{ fontFamily: font }}>
            Less typing. Less clicking. More jobs closed.
          </p>
          <p className="text-slate-400 font-bold tracking-tight">That&apos;s the entire point.</p>
        </motion.div>

      </div>
    </section>
  );
}