'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  FileText,
  Zap,
  ClipboardList,
  Send,
  Check,
  Clock,
} from 'lucide-react';

const font = "'Nunito', sans-serif";

const TABS = [
  { id: 'emails', label: 'Branded Emails', icon: Mail, color: '#3b82f6' },
  { id: 'quotes', label: 'Quote Templates', icon: FileText, color: '#10b981' },
  { id: 'oneclick', label: 'One-Click Send', icon: Zap, color: '#f97316' },
  { id: 'tasks', label: 'Task Templates', icon: ClipboardList, color: '#8b5cf6' },
];

/* =========================
   PREVIEW COMPONENTS
========================= */

function EmailPreview() {
  return (
    <div className="space-y-3">
      <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
        <p
          className="text-[9px] text-slate-500 uppercase tracking-widest mb-2"
          style={{ fontFamily: font, fontWeight: 800 }}
        >
          Available Variables
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            '{{company_name}}',
            '{{customer_name}}',
            '{{scheduled_date}}',
            '{{customer_address}}',
          ].map((v) => (
            <span
              key={v}
              className="px-2 py-0.5 bg-slate-700 rounded text-[9px] text-slate-400 border border-slate-600"
              style={{ fontFamily: 'monospace' }}
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden border-2 border-slate-700">
        <div
          className="h-20 flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #1e293b 0%, #f97316 50%, #ea580c 100%)',
          }}
        >
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mb-1 shadow-md">
            <img
              src="/images/ridgelinelogo.webp"
              alt="Logo"
              className="w-5 h-5 object-contain"
            />
          </div>
          <p
            className="text-[10px] text-white"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Ridge Line Roofing
          </p>
        </div>

        <div className="p-3 text-left">
          <div
            className="flex flex-col sm:flex-row sm:gap-4 gap-0.5 text-[9px] text-slate-400 mb-2 border-b border-slate-100 pb-2"
            style={{ fontFamily: font, fontWeight: 600 }}
          >
            <span>
              <strong className="text-slate-600">From:</strong> Ridge Line
              Roofing
            </span>
            <span>
              <strong className="text-slate-600">To:</strong>{' '}
              john.smith@email.com
            </span>
          </div>

          <p
            className="text-xs text-slate-900 mb-2"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Appointment Scheduled - Ridge Line Roofing
          </p>

          <div
            className="text-[10px] text-slate-600 space-y-1.5 leading-relaxed"
            style={{ fontFamily: font, fontWeight: 600 }}
          >
            <p>Hi John Smith,</p>
            <p>Your appointment has been scheduled!</p>
            <p>
              Date: March 15, 2024
              <br />
              Time: 10:00 AM
              <br />
              Address: 123 Main St, Anytown
            </p>
            <p>We look forward to serving you!</p>
            <p className="text-slate-400 pt-1">
              Best regards,
              <br />
              Ridge Line Roofing
            </p>
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
          <p
            className="text-sm text-white"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Pricing Template
          </p>
          <p
            className="text-[9px] text-slate-500 uppercase tracking-widest"
            style={{ fontFamily: font, fontWeight: 700 }}
          >
            Roof Replacement
          </p>
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden">
        <div className="grid grid-cols-[1fr_50px_28px_55px] sm:grid-cols-[1fr_60px_32px_60px] gap-1 px-2 sm:px-3 py-2 bg-slate-900/80 border-b border-slate-700">
          <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest">
            Item
          </span>
          <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest text-right">
            Price
          </span>
          <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest text-center">
            Qty
          </span>
          <span className="text-[7px] sm:text-[8px] text-slate-500 uppercase tracking-widest text-right">
            Total
          </span>
        </div>

        {items.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_50px_28px_55px] sm:grid-cols-[1fr_60px_32px_60px] gap-1 px-2 sm:px-3 py-2 border-b border-slate-800/50 items-center"
          >
            <span className="text-[9px] sm:text-[10px] text-white truncate">
              {item.desc}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 text-right">
              ${item.price.toFixed(2)}
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 text-center">
              {item.qty}
            </span>
            <span className="text-[9px] sm:text-[10px] text-emerald-400 text-right font-black">
              ${(item.price * item.qty).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="flex items-center justify-between px-3 py-3 bg-slate-900/50">
          <span className="text-[9px] text-slate-500 uppercase tracking-widest">
            Total Estimate
          </span>
          <span className="text-base text-emerald-400 font-black">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function OneClickPreview() {
  return (
    <div>
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border-2 border-slate-200">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3">
          <Send size={18} className="text-orange-500" />
        </div>

        <p
          className="text-base text-slate-900 mb-1"
          style={{ fontFamily: font, fontWeight: 900 }}
        >
          Send Quote?
        </p>

        <p
          className="text-xs text-slate-600 mb-4 leading-relaxed"
          style={{ fontFamily: font, fontWeight: 600 }}
        >
          Send branded quote instantly to your customer — no copy/paste needed.
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
          <Clock size={12} className="text-emerald-600" />
          <span
            className="text-xs text-emerald-700"
            style={{ fontFamily: font, fontWeight: 700 }}
          >
            Ready to send
          </span>
        </div>

        <button
          className="w-full py-2.5 rounded-full text-xs text-white bg-orange-500 border-2 border-orange-400 flex items-center justify-center gap-1.5"
          style={{ fontFamily: font, fontWeight: 900 }}
        >
          <Send size={11} /> Send It
        </button>
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
  ];

  return (
    <div>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${
              task.done
                ? 'bg-emerald-500/8 border-emerald-500/15'
                : 'bg-slate-800/40 border-slate-700/40'
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border-2 ${
                task.done
                  ? 'bg-emerald-500 border-emerald-400'
                  : 'border-slate-600'
              }`}
            >
              {task.done && (
                <Check size={9} className="text-white" strokeWidth={3} />
              )}
            </div>

            <span
              className={`text-[11px] ${
                task.done
                  ? 'text-emerald-400/70 line-through'
                  : 'text-slate-300'
              }`}
            >
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEWS: Record<string, () => React.ReactNode> = {
  emails: EmailPreview,
  quotes: QuotePreview,
  oneclick: OneClickPreview,
  tasks: TasksPreview,
};

const PITCHES = {
  emails: {
    headline:
      'Branded customer communication that feels like a real business.',
    sub: 'Custom templates, variables, logos, and automated messaging.',
  },
  quotes: {
    headline:
      'Professional quotes with saved templates for repeatable jobs.',
    sub: 'Build once. Reuse forever. Send faster.',
  },
  oneclick: {
    headline:
      'Create and send quotes, invoices, and updates in seconds.',
    sub: 'No bouncing between tools. Just close jobs faster.',
  },
  tasks: {
    headline:
      'Repeatable job workflows your team can apply instantly.',
    sub: 'Standardize operations without missing steps.',
  },
};

export default function EfficiencyShowcase() {
  const [activeTab, setActiveTab] = useState(0);

  const current = TABS[activeTab];
  const PreviewComponent = PREVIEWS[current.id];
  const pitch = PITCHES[current.id as keyof typeof PITCHES];

  return (
    <section className="relative overflow-hidden py-14 sm:py-20 lg:py-28 bg-white">
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl text-slate-900 mb-5 leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Lead2Project Helps You
            <br />
            <span className="text-emerald-500">
              Run the Entire Business.
            </span>
          </h2>

          <p
            className="text-base sm:text-xl text-slate-500 max-w-3xl mx-auto font-bold"
            style={{ fontFamily: font }}
          >
            From customer communication to quotes, scheduling, and repeatable
            workflows — this is more than lead tracking.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-14">
          {TABS.map((tab, i) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(i)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-full text-xs sm:text-sm transition-all ${
                  activeTab === i
                    ? 'bg-slate-900 text-white shadow-xl'
                    : 'bg-white text-slate-500 border-2 border-slate-100 hover:border-slate-300'
                }`}
                style={{ fontFamily: font, fontWeight: 800 }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          >
            {/* Preview */}
            <div className="order-1 w-full max-w-lg mx-auto">
              <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] border-[6px] border-slate-800 overflow-hidden shadow-2xl">
                <div className="p-4 sm:p-8">
                  <PreviewComponent />
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="order-2 text-center lg:text-left">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto lg:mx-0 border-b-4"
                style={{
                  backgroundColor: current.color + '15',
                  borderColor: current.color,
                }}
              >
                <current.icon size={24} style={{ color: current.color }} />
              </div>

              <h3
                className="text-2xl sm:text-3xl lg:text-4xl text-slate-900 mb-5 leading-tight"
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

              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Clock size={16} />
                <span
                  className="text-sm font-black"
                  style={{ fontFamily: font }}
                >
                  Saves 10+ hours / week
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-24 pt-10 border-t border-slate-100 text-center"
        >
          <p
            className="text-xl sm:text-3xl text-slate-900 font-black mb-2"
            style={{ fontFamily: font }}
          >
            Less busywork. More closed jobs.
          </p>

          <p className="text-slate-400 font-bold">
            Built to help contractors actually operate.
          </p>
        </motion.div>
      </div>
    </section>
  );
}