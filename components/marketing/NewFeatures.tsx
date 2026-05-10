'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  Mail,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  Database
} from 'lucide-react';

const LEADS = [
  { name: 'Marcus Holloway', status: 'Scheduled', color: 'bg-emerald-500', amount: '$7,950', icon: <CalendarDays size={14}/> },
  { name: 'Sarah Jenkins', status: 'Won!', color: 'bg-yellow-400', amount: '$2,400', icon: <CheckCircle2 size={14}/> },
  { name: 'Julian Martinez', status: 'Quote Sent', color: 'bg-sky-400', amount: '$5,200', icon: <FileText size={14}/>  },
  { name: 'David Reyes', status: 'New Lead', color: 'bg-orange-400', amount: '—', icon: <Sparkles size={14}/> },
];

const OUTBOX_LOGS = [
  { name: 'Marcus Holloway', msg: 'Quote #4402 Sent', time: '2h ago', icon: <FileText size={18}/> },
  { name: 'Sarah Jenkins', msg: 'Schedule Confirmed', time: '5h ago', icon: <CalendarDays size={18}/> },
  { name: 'Apex Fencing', msg: 'Payment Reminder', time: '1d ago', icon: <Clock size={18}/>  },
  { name: 'Julian Martinez', msg: 'Follow-up Automated', time: '2d ago', icon: <Mail size={18}/>   },
];

function CardsView() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      {LEADS.map(lead => (
        <motion.div 
          key={lead.name} 
          whileHover={{ scale: 1.05 }}
          className="bg-white border-2 border-slate-900 p-5 rounded-2xl shadow-xl"
        >
          <div className="flex justify-between items-center mb-4">
            <p className="text-base font-black text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              {lead.name}
            </p>
            <div className="text-slate-400">{lead.icon}</div>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-xs font-black px-3 py-1.5 rounded-full text-white uppercase ${lead.color}`}>
              {lead.status}
            </span>
            <span className="text-lg font-black text-emerald-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              {lead.amount}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function OutboxView() {
  return (
    <div className="space-y-3">
      {OUTBOX_LOGS.map((log, i) => (
        <motion.div 
          key={i} 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-4 p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
            {log.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
              {log.name}
            </p>
            <p className="text-xs font-bold text-slate-500">{log.msg}</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{log.time}</span>
        </motion.div>
      ))}
    </div>
  );
}

function ExportView() {
  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-black uppercase text-slate-700">
            <tr>
              <th className="p-4">Client</th>
              <th className="p-4 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {LEADS.map(l => (
              <tr key={l.name} className="border-t text-sm font-bold">
                <td className="p-4">{l.name}</td>
                <td className="p-4 text-right text-emerald-600">{l.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="w-full bg-emerald-500 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-3 border-2 border-slate-900">
        <Database size={20} />
        Export Data
      </button>
    </div>
  );
}

const FEATURES = [
  { id: 'board', icon: <LayoutDashboard size={22} />, name: 'Project Board' },
  { id: 'quote', icon: <FileText size={22} />, name: 'Create Quote Template', img: '/images/quote-builder.webp' },
  { id: 'schedule', icon: <CalendarDays size={22} />, name: 'Schedule and Send', img: '/images/schedule-screen.webp' },
  { id: 'outbox', icon: <Mail size={22} />, name: 'Outbox' },
  { id: 'export', icon: <Download size={22} />, name: 'Data Export' },
];

export default function NewFeatures() {
  const [active, setActive] = useState(0);
  const current = FEATURES[active];

  return (
    <section className="bg-white py-16 sm:py-32 overflow-hidden">

      <div className="max-w-7xl mx-auto px-5 sm:px-6">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-7xl font-black text-slate-900 leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
            Everything You Need.
            <br />
            <span className="text-emerald-600">One Dashboard.</span>
          </h2>

          <p className="text-slate-600 font-bold text-lg mt-6">
            Manage leads, quotes, schedules, and payments all in one place.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border-4 border-slate-200 shadow-2xl">

          {/* NAV */}
          <div className="lg:col-span-4 bg-white border-r border-slate-200 flex lg:flex-col overflow-x-auto">
            {FEATURES.map((f, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex items-center gap-4 p-6 whitespace-nowrap transition-all ${
                  active === i ? 'bg-emerald-500 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {f.icon}
                <span className="font-black">{f.name}</span>
              </button>
            ))}
          </div>

          {/* PREVIEW — FIXED CLEAN UI */}
          <div className="lg:col-span-8 bg-slate-100 p-10 min-h-[600px] flex items-center justify-center">

            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-3xl"
              >

                {/* IMAGE */}
                {current.img && (
                  <div className="rounded-3xl overflow-hidden border-4 border-white shadow-2xl mb-6">
                    <img
                      src={current.img}
                      alt={current.name}
                      className="w-full h-[420px] object-cover"
                    />
                  </div>
                )}

                {/* UI CARD */}
                <div className="bg-white rounded-3xl border-4 border-slate-200 shadow-xl p-6">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">
                    {current.name}
                  </h3>
                  <p className="text-slate-600 font-semibold">
                    Live preview of this feature inside your dashboard.
                  </p>
                </div>

                {/* RENDER COMPONENTS */}
                {current.id === 'board' && (
                  <div className="mt-6">
                    <CardsView />
                  </div>
                )}

                {current.id === 'outbox' && (
                  <div className="mt-6">
                    <OutboxView />
                  </div>
                )}

                {current.id === 'export' && (
                  <div className="mt-6">
                    <ExportView />
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>

        </div>
      </div>
    </section>
  );
}