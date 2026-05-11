'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  FileText,
  Zap,
  ClipboardList,
  List,
  Calendar,
  Check,
  Clock,
  Send,
} from 'lucide-react';

const font = "'Nunito', sans-serif";

/* =========================
   TYPES
========================= */

type FeatureId =
  | 'emails'
  | 'quotes'
  | 'oneclick'
  | 'tasks'
  | 'table'
  | 'calendar';

/* =========================
   MODES
========================= */

const MODES = [
  { id: 'workflows', label: 'Communication' },
  { id: 'operations', label: 'Operations' },
] as const;

/* =========================
   FEATURES
========================= */

const FEATURES: Record<
  'workflows' | 'operations',
  { id: FeatureId; label: string; icon: any; color: string }[]
> = {
  workflows: [
    { id: 'emails', label: 'Branded Emails', icon: Mail, color: '#3b82f6' },
    { id: 'quotes', label: 'Quote Templates', icon: FileText, color: '#10b981' },
    { id: 'oneclick', label: 'One-Click Send', icon: Zap, color: '#f97316' },
  ],
  operations: [
    { id: 'tasks', label: 'Task Templates', icon: ClipboardList, color: '#8b5cf6' },
    { id: 'table', label: 'Leads Table', icon: List, color: '#0ea5e9' },
    { id: 'calendar', label: 'Calendar View', icon: Calendar, color: '#f43f5e' },
  ],
};

/* =========================
   PITCHES (REAL COPY)
========================= */

const PITCHES: Record<FeatureId, { headline: string; sub: string }> = {
  emails: {
    headline: 'Branded customer communication that feels like your business.',
    sub: 'Send automated emails with dynamic variables and real job data.',
  },
  quotes: {
    headline: 'Professional quotes built from reusable templates.',
    sub: 'Stop rebuilding estimates. Generate accurate pricing instantly.',
  },
  oneclick: {
    headline: 'Send quotes and updates instantly.',
    sub: 'One click replaces copy/paste, PDFs, and manual emailing.',
  },
  tasks: {
    headline: 'Standardize how your team works.',
    sub: 'Repeatable workflows that eliminate missed steps.',
  },
  table: {
    headline: 'All leads in a structured command view.',
    sub: 'Filter, sort, and manage every customer in real time.',
  },
  calendar: {
    headline: 'Visual scheduling for every job.',
    sub: 'See your entire business laid out day by day.',
  },
};

/* =========================
   PREVIEWS (RESTORED REALISM)
========================= */

/* EMAIL */
function EmailPreview() {
  return (
    <div className="space-y-3">
      <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700 text-[10px] text-slate-300">
        Variables: {'{{company_name}}'} {'{{customer_name}}'} {'{{scheduled_date}}'} {'{{address}}'}
      </div>

      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
        <div
          className="h-20 flex items-center justify-center text-white text-[10px]"
          style={{
            background: 'linear-gradient(135deg,#0f172a,#3b82f6)',
            fontWeight: 900,
          }}
        >
          Ridge Line Roofing
        </div>

        <div className="p-3 text-[10px] space-y-1">
          <div className="font-bold">Appointment Confirmed</div>
          <div>Hi John, your appointment is scheduled.</div>
          <div>Date: March 15, 2024</div>
          <div>Time: 10:00 AM</div>
          <div>Address: 123 Main St</div>
        </div>
      </div>
    </div>
  );
}

/* QUOTE */
function QuotePreview() {
  const items = [
    { desc: 'Shingle removal', price: 800 },
    { desc: 'New shingles', price: 1200 },
    { desc: 'Labor', price: 1800 },
  ];

  const total = items.reduce((a, b) => a + b.price, 0);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-700 overflow-hidden text-[10px]">
      <div className="p-3 border-b border-slate-800 text-white font-bold">
        Roof Replacement Quote
      </div>

      <div className="p-3 space-y-1 text-slate-300">
        {items.map((i) => (
          <div key={i.desc} className="flex justify-between">
            <span>{i.desc}</span>
            <span>${i.price}</span>
          </div>
        ))}
        <div className="pt-2 text-emerald-400 font-black flex justify-between">
          <span>Total</span>
          <span>${total}</span>
        </div>
      </div>
    </div>
  );
}

/* ONE CLICK */
function OneClickPreview() {
  return (
    <div className="bg-white border rounded-xl p-4 text-[10px]">
      <div className="flex items-center gap-2 mb-2">
        <Clock size={12} />
        Ready to send quote
      </div>

      <button className="w-full bg-orange-500 text-white py-2 rounded-lg flex items-center justify-center gap-1">
        <Send size={12} /> Send Now
      </button>
    </div>
  );
}

/* TASKS */
function TasksPreview() {
  const tasks = [
    { text: 'Schedule inspection', done: true },
    { text: 'Order materials', done: true },
    { text: 'Pull permit', done: false },
  ];

  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <div
          key={t.text}
          className="flex items-center gap-2 p-2 rounded bg-slate-100 text-[10px]"
        >
          <div className={`w-3 h-3 border rounded ${t.done ? 'bg-green-500' : ''}`} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* TABLE (REALISTIC) */
function TablePreview() {
  const leads = [
    { name: 'John Smith', status: 'Scheduled', date: 'Mar 15' },
    { name: 'Mike Davis', status: 'New', date: 'Today' },
    { name: 'Sarah Lee', status: 'Unpaid', date: 'Pending' },
  ];

  return (
    <div className="bg-white border rounded-xl text-[10px] overflow-hidden">
      <div className="grid grid-cols-3 p-2 bg-slate-50 font-bold">
        <div>Customer</div>
        <div>Status</div>
        <div>Date</div>
      </div>

      {leads.map((l) => (
        <div key={l.name} className="grid grid-cols-3 p-2 border-t">
          <div>{l.name}</div>
          <div>{l.status}</div>
          <div>{l.date}</div>
        </div>
      ))}
    </div>
  );
}

/* CALENDAR (REALISTIC) */
function CalendarPreview() {
  const days = [
    { d: 'Mon', job: false },
    { d: 'Tue', job: true },
    { d: 'Wed', job: false },
    { d: 'Thu', job: true },
  ];

  return (
    <div className="bg-white border rounded-xl p-3 text-[10px]">
      <div className="grid grid-cols-4 gap-2">
        {days.map((d) => (
          <div
            key={d.d}
            className={`p-2 rounded text-center ${
              d.job ? 'bg-blue-100' : 'bg-slate-100'
            }`}
          >
            <div className="font-bold">{d.d}</div>
            <div>{d.job ? 'Job' : '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* MAP */
const PREVIEWS: Record<FeatureId, any> = {
  emails: EmailPreview,
  quotes: QuotePreview,
  oneclick: OneClickPreview,
  tasks: TasksPreview,
  table: TablePreview,
  calendar: CalendarPreview,
};

/* =========================
   MAIN
========================= */

export default function EfficiencyShowcase() {
  const [mode, setMode] = useState<'workflows' | 'operations'>('workflows');
  const [activeIndex, setActiveIndex] = useState(0);

  const features = FEATURES[mode];
  const active = features[activeIndex];

  const Preview = PREVIEWS[active.id];
  const pitch = PITCHES[active.id];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-5">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900">
            Run your entire business in one system
          </h2>
        </div>

        {/* MODE */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-slate-100 rounded-full p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setActiveIndex(0);
                }}
                className={`px-5 py-2 text-sm font-bold rounded-full ${
                  mode === m.id ? 'bg-slate-900 text-white' : 'text-slate-500'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* GRID */}
        <div className="grid lg:grid-cols-2 gap-10">

          {/* LEFT */}
          <div className="space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon;

              return (
                <button
                  key={f.id}
                  onClick={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left ${
                    activeIndex === i
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-bold text-sm">{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* RIGHT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="border rounded-2xl p-5 bg-slate-50">
                <Preview />
              </div>

              <h3 className="mt-5 text-2xl font-black text-slate-900">
                {pitch.headline}
              </h3>

              <p className="text-slate-500 mt-2">
                {pitch.sub}
              </p>
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </section>
  );
}