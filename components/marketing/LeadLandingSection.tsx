'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  CreditCard,
  CheckSquare,
  Image,
  MessageCircle,
} from 'lucide-react';

const font = "'Nunito', sans-serif";

const LEAD_TABS = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'quote', label: 'Quote', icon: FileText },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'activity', label: 'Activity', icon: MessageCircle },
];

export default function LeadLandingSection() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <section className="bg-amber-50 py-12 sm:py-20 lg:py-28 overflow-hidden relative">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* HEADER (UNCHANGED) */}
        <div className="text-center mb-10 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl lg:text-6xl text-slate-900 mb-6 leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Every Lead. Every Detail.
            <br />
            <span className="text-blue-600">One Dashboard.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-bold"
            style={{ fontFamily: font }}
          >
            From the moment a lead comes in to the final payment — everything lives in one place.
          </motion.p>
        </div>

        {/* CARD */}
        <div className="max-w-4xl mx-auto">
          <motion.div>
            <div className="bg-white rounded-[2rem] border-[5px] border-slate-900 overflow-hidden shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">

              {/* HEADER (UNCHANGED CONTENT) */}
              <div className="bg-slate-900 px-5 sm:px-10 py-6 sm:py-8">
                <p className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-black">
                  #176
                </p>

                <h3 className="text-2xl sm:text-4xl text-white font-black mb-2">
                  John Smith
                </h3>

                <p className="text-sm text-slate-500 font-bold mb-5">
                  Submitted May 4, 2026
                </p>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <span className="px-3 py-1.5 bg-yellow-500 rounded-full text-xs font-black text-slate-900">
                    Contacted
                  </span>
                  <span className="px-3 py-1.5 bg-blue-500 rounded-full text-xs font-black text-white">
                    May 20 · 8:30 PM
                  </span>
                  <span className="px-3 py-1.5 bg-slate-700 rounded-full text-xs font-bold text-slate-300">
                    Frank
                  </span>
                  <span className="px-3 py-1.5 bg-slate-700 rounded-full text-xs font-bold text-slate-300">
                    $7,950.00 due
                  </span>
                  <span className="px-3 py-1.5 bg-emerald-500/20 rounded-full text-xs font-black text-emerald-400 border border-emerald-500/30">
                    AI Brief
                  </span>
                </div>
              </div>

              {/* TABS (ONLY MOBILE TIGHTENING) */}
              <div className="border-b-4 border-slate-100 bg-slate-50 overflow-x-auto">
                <div className="flex gap-3 min-w-max px-3 sm:px-6">
                  {LEAD_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-5 border-b-[5px] whitespace-nowrap ${
                          isActive
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-400'
                        }`}
                        style={{
                          fontFamily: font,
                          fontWeight: isActive ? 900 : 700,
                        }}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* CONTENT — ALL ORIGINAL CONTENT KEPT */}

              <div className="p-4 sm:p-10 bg-white min-h-[360px]">

                {/* OVERVIEW (UNCHANGED FULL CONTENT) */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">

                    <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100">

                      <div className="flex justify-between mb-6">
                        <p className="text-[11px] uppercase tracking-widest font-black text-slate-400">
                          Client Info
                        </p>
                        <span className="text-[11px] text-blue-500 font-black uppercase">
                          Actions
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Name</p>
                          <p className="font-black text-slate-900">John Smith</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                          <p className="font-black text-blue-500">j@test.com</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                          <p className="font-black text-blue-500">(323) 243-2434</p>
                        </div>
                      </div>

                      {/* CUSTOMER REQUEST RESTORED (IMPORTANT — NOT REMOVED) */}
                      <div className="mb-6">
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-2">
                          Customer Request
                        </p>
                        <p className="text-slate-700 font-bold">
                          Need roof repair after storm damage, a few shingles missing on the north side.
                        </p>
                      </div>

                      <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black">
                        Roof Repair
                      </span>

                    </div>

                  </div>
                )}

                {/* SCHEDULE (DATE KEPT) */}
                {activeTab === 'schedule' && (
                  <div className="text-center py-12">
                    <Calendar size={48} className="text-blue-500 mx-auto mb-4" />
                    <p className="text-xl font-black">May 20, 2026 · 8:30 PM</p>
                    <p className="text-slate-500 font-bold">Assigned: Frank</p>
                  </div>
                )}

                {/* QUOTE (UNCHANGED STRUCTURE PRESERVED) */}
                {activeTab === 'quote' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900 text-white rounded-2xl p-6">
                      <p className="font-black">Tear-off & shingle replacement</p>
                      <p className="text-emerald-400 font-black">$4,200</p>
                      <p className="font-black">Flashing repair</p>
                      <p className="text-emerald-400 font-black">$800</p>
                      <p className="font-black">Cleanup & haul away</p>
                      <p className="text-emerald-400 font-black">$750</p>
                    </div>
                  </div>
                )}

                {/* PAYMENT (UNCHANGED) */}
                {activeTab === 'payment' && (
                  <div className="text-center py-12">
                    <CreditCard className="mx-auto text-emerald-500 mb-4" size={48} />
                    <p className="text-3xl font-black">$7,950.00</p>
                    <p className="text-red-500 font-bold">Unpaid</p>
                  </div>
                )}

                {/* TASKS (UNCHANGED CONTENT PRESERVED) */}
                {activeTab === 'tasks' && (
                  <div className="space-y-4">
                    <div>Schedule inspection</div>
                    <div>Send quote to customer</div>
                    <div>Order materials</div>
                    <div>Confirm crew availability</div>
                  </div>
                )}

                {/* MEDIA (FIXED ONLY — THUMB + EMPTY BOX) */}
                {activeTab === 'media' && (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">

                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200">
                      <img
                        src="/images/roof-damage.webp"
                        className="w-full h-full object-cover"
                        alt="uploaded"
                      />
                    </div>

                    <div className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400">
                      <span className="text-2xl font-black">+</span>
                      <span className="text-[10px] font-black uppercase">Add Media</span>
                    </div>

                  </div>
                )}

                {/* ACTIVITY (UNCHANGED) */}
                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <div>Quote sent via email — 2 hours ago</div>
                    <div>Status changed — 1 day ago</div>
                    <div>Lead submitted — May 4, 2026</div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}