'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, User, Mail, Phone, Calendar, FileText, CreditCard, CheckSquare, Image, MessageCircle, Bell, Sparkles, Search, Filter, Grid3X3, List, CalendarDays, ArrowRight } from 'lucide-react';
import Link from 'next/link';

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
    <section className="bg-amber-50 py-14 sm:py-20 lg:py-28 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl text-slate-900 mb-4 leading-tight"
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
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto"
            style={{ fontFamily: font, fontWeight: 700 }}
          >
            From the moment a lead comes in to the final payment — everything lives in one place.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* LEFT: Dashboard Mock */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-slate-900 rounded-2xl border-4 border-slate-800 overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)]">

              {/* Dashboard header bar */}
              <div className="px-4 py-3 border-b-3 border-slate-700 flex items-center justify-between" style={{ borderBottomWidth: '3px' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 flex items-center justify-center">
                    <img src="/images/ridgelinelogo.webp" alt="Logo" className="w-5 h-5 object-contain" />
                  </div>
                  <div>
                    <p className="text-xs text-white" style={{ fontFamily: font, fontWeight: 900 }}>Ridge Line Roofing</p>
                    <p className="text-[8px] text-emerald-400 uppercase tracking-widest" style={{ fontFamily: font, fontWeight: 700 }}>Dashboard</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-500 rounded-lg text-[9px] text-white" style={{ fontFamily: font, fontWeight: 900 }}>
                  + New Lead
                </div>
              </div>

              {/* Stat cards */}
              <div className="px-3 pt-3 grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Leads', value: '35', bg: 'bg-blue-900/50' },
                  { label: 'Active', value: '33', bg: 'bg-blue-900/30' },
                  { label: 'Revenue', value: '$21K', bg: 'bg-emerald-900/30' },
                  { label: 'Pending', value: '$121K', bg: 'bg-emerald-900/20' },
                ].map(stat => (
                  <div key={stat.label} className={`${stat.bg} rounded-lg px-2 py-2`}>
                    <p className="text-[7px] text-slate-400 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 700 }}>{stat.label}</p>
                    <p className="text-sm text-white" style={{ fontFamily: font, fontWeight: 900 }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Filters + view toggle */}
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex gap-1">
                  {['Filters', 'Today', 'Unpaid', 'New (8)'].map(f => (
                    <span key={f} className="px-2 py-0.5 bg-slate-800 rounded text-[7px] text-slate-500 border border-slate-700" style={{ fontFamily: font, fontWeight: 700 }}>
                      {f}
                    </span>
                  ))}
                </div>
                <div className="flex gap-0.5">
                  <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center"><Grid3X3 size={9} className="text-white" /></div>
                  <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center border border-slate-700"><List size={9} className="text-slate-500" /></div>
                  <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center border border-slate-700"><CalendarDays size={9} className="text-slate-500" /></div>
                </div>
              </div>

              {/* Lead cards grid */}
              <div className="px-3 pb-3 grid grid-cols-3 gap-1.5">
                {[
                  { name: 'Chuck M', service: 'Roof Replacement', status: 'New', statusColor: 'bg-emerald-500', topColor: 'bg-emerald-500', revenue: '0.00' },
                  { name: 'Sarah J', service: 'Roof Repair', status: 'In Progress', statusColor: 'bg-blue-500', topColor: 'bg-blue-500', revenue: '0.00' },
                  { name: 'John S', service: 'Roof Repair', status: 'Contacted', statusColor: 'bg-yellow-500', topColor: 'bg-slate-500', revenue: '7,950' },
                ].map(lead => (
                  <div key={lead.name} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
                    <div className={`h-1 ${lead.topColor}`} />
                    <div className="p-2">
                      <div className="flex items-center gap-1 mb-1.5">
                        <div className={`w-1 h-1 rounded-full ${lead.statusColor}`} />
                        <span className="text-[6px] text-slate-400 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 800 }}>{lead.status}</span>
                      </div>
                      <p className="text-[10px] text-white mb-0.5" style={{ fontFamily: font, fontWeight: 900 }}>{lead.name}</p>
                      <p className="text-[7px] text-slate-500 mb-2" style={{ fontFamily: font, fontWeight: 600 }}>{lead.service}</p>
                      <div className="flex justify-between text-[6px] text-slate-500" style={{ fontFamily: font, fontWeight: 700 }}>
                        <span>Est. Revenue</span>
                        <span className="text-white">${lead.revenue}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Lead Card Modal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl border-4 border-slate-900 overflow-hidden shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]">

              {/* Lead header */}
              <div className="bg-slate-900 px-4 sm:px-5 py-4">
                <p className="text-[9px] text-slate-500 mb-0.5" style={{ fontFamily: font, fontWeight: 700 }}>#176</p>
                <p className="text-lg sm:text-xl text-white mb-1" style={{ fontFamily: font, fontWeight: 900 }}>John Smith</p>
                <p className="text-[10px] text-slate-500 mb-3" style={{ fontFamily: font, fontWeight: 600 }}>Submitted May 4, 2026</p>

                {/* Status pills */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 bg-yellow-500 rounded-full text-[9px] text-slate-900" style={{ fontFamily: font, fontWeight: 900 }}>Contacted</span>
                  <span className="px-2.5 py-1 bg-blue-500 rounded-full text-[9px] text-white" style={{ fontFamily: font, fontWeight: 800 }}>May 20 · 8:30 PM</span>
                  <span className="px-2.5 py-1 bg-slate-700 rounded-full text-[9px] text-slate-300" style={{ fontFamily: font, fontWeight: 800 }}>Frank</span>
                  <span className="px-2.5 py-1 bg-slate-700 rounded-full text-[9px] text-slate-300" style={{ fontFamily: font, fontWeight: 800 }}>$7,950.00 due</span>
                  <span className="px-2.5 py-1 bg-emerald-500/20 rounded-full text-[9px] text-emerald-400 border border-emerald-500/30" style={{ fontFamily: font, fontWeight: 900 }}>AI Brief</span>
                </div>
              </div>

              {/* Tab bar */}
              <div className="border-b-2 border-slate-200 px-2 sm:px-4 overflow-x-auto">
                <div className="flex gap-0 min-w-max">
                  {LEAD_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] sm:text-[11px] border-b-2 transition-all ${
                          isActive
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                        style={{ fontFamily: font, fontWeight: isActive ? 900 : 700 }}
                      >
                        <Icon size={12} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab content */}
              <div className="p-4 sm:p-5" style={{ minHeight: '260px' }}>

                {activeTab === 'overview' && (
                  <div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-3">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[9px] text-slate-400 uppercase tracking-widest" style={{ fontFamily: font, fontWeight: 800 }}>Client Info</p>
                        <span className="text-[9px] text-blue-500" style={{ fontFamily: font, fontWeight: 800 }}>Actions</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase tracking-wider mb-0.5" style={{ fontFamily: font, fontWeight: 700 }}>Name</p>
                          <p className="text-xs text-slate-900" style={{ fontFamily: font, fontWeight: 800 }}>John Smith</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase tracking-wider mb-0.5" style={{ fontFamily: font, fontWeight: 700 }}>Email</p>
                          <p className="text-xs text-blue-500" style={{ fontFamily: font, fontWeight: 800 }}>j@test.com</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase tracking-wider mb-0.5" style={{ fontFamily: font, fontWeight: 700 }}>Phone</p>
                          <p className="text-xs text-blue-500" style={{ fontFamily: font, fontWeight: 800 }}>(323) 243-2434</p>
                        </div>
                      </div>
                      <div className="mb-3">
                        <p className="text-[8px] text-slate-400 uppercase tracking-wider mb-1" style={{ fontFamily: font, fontWeight: 700 }}>Category</p>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]" style={{ fontFamily: font, fontWeight: 800 }}>Roof Repair</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'Email', icon: Mail },
                          { label: 'Call', icon: Phone },
                          { label: 'Text', icon: MessageCircle },
                        ].map(action => (
                          <div key={action.label} className="flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 bg-white">
                            <action.icon size={11} className="text-slate-400" />
                            <span className="text-[10px] text-slate-600" style={{ fontFamily: font, fontWeight: 700 }}>{action.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer message + internal notes */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <p className="text-[8px] text-emerald-500 uppercase tracking-widest mb-1" style={{ fontFamily: font, fontWeight: 800 }}>Customer's Message</p>
                        <p className="text-[10px] text-slate-600" style={{ fontFamily: font, fontWeight: 600 }}>Need roof repair after storm damage, a few shingles missing on the north side.</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <p className="text-[8px] text-amber-500 uppercase tracking-widest mb-1" style={{ fontFamily: font, fontWeight: 800 }}>Internal Notes</p>
                        <p className="text-[10px] text-slate-400 italic" style={{ fontFamily: font, fontWeight: 600 }}>Add notes about this job...</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Calendar size={28} className="text-blue-500 mb-2" />
                    <p className="text-sm text-slate-900 mb-1" style={{ fontFamily: font, fontWeight: 900 }}>May 20, 2026 · 8:30 PM</p>
                    <p className="text-xs text-slate-500" style={{ fontFamily: font, fontWeight: 600 }}>Assigned to: Frank</p>
                    <div className="mt-4 px-4 py-2 bg-blue-500 rounded-lg text-[10px] text-white" style={{ fontFamily: font, fontWeight: 900 }}>Reschedule</div>
                  </div>
                )}

                {activeTab === 'quote' && (
                  <div>
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-700">
                      {[
                        { item: 'Tear-off & shingle replacement', price: '$4,200' },
                        { item: 'Flashing repair', price: '$800' },
                        { item: 'Cleanup & haul away', price: '$750' },
                      ].map((row, i) => (
                        <div key={i} className={`flex justify-between py-2 ${i < 2 ? 'border-b border-slate-700' : ''}`}>
                          <span className="text-[10px] text-slate-300" style={{ fontFamily: font, fontWeight: 600 }}>{row.item}</span>
                          <span className="text-[10px] text-emerald-400" style={{ fontFamily: font, fontWeight: 900 }}>{row.price}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 mt-1 border-t border-slate-600">
                        <span className="text-[9px] text-slate-500 uppercase" style={{ fontFamily: font, fontWeight: 800 }}>Total</span>
                        <span className="text-sm text-emerald-400" style={{ fontFamily: font, fontWeight: 900 }}>$5,750.00</span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 py-2 text-center bg-emerald-500 rounded-lg text-[10px] text-white border-2 border-emerald-400" style={{ fontFamily: font, fontWeight: 900 }}>Send Quote</div>
                      <div className="flex-1 py-2 text-center bg-slate-100 rounded-lg text-[10px] text-slate-600 border-2 border-slate-200" style={{ fontFamily: font, fontWeight: 800 }}>Edit</div>
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="flex flex-col items-center justify-center py-6">
                    <CreditCard size={28} className="text-emerald-500 mb-2" />
                    <p className="text-lg text-slate-900 mb-1" style={{ fontFamily: font, fontWeight: 900 }}>$7,950.00</p>
                    <p className="text-xs text-red-500 mb-3" style={{ fontFamily: font, fontWeight: 700 }}>Unpaid</p>
                    <div className="px-4 py-2 bg-emerald-500 rounded-lg text-[10px] text-white" style={{ fontFamily: font, fontWeight: 900 }}>Send Payment Reminder</div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-1.5">
                    {[
                      { text: 'Schedule inspection', done: true },
                      { text: 'Send quote to customer', done: true },
                      { text: 'Order materials', done: false },
                      { text: 'Confirm crew availability', done: false },
                    ].map((task, i) => (
                      <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border ${task.done ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-400' : 'border-slate-300'}`}>
                          {task.done && <svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className={`text-[11px] ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`} style={{ fontFamily: font, fontWeight: 700 }}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="aspect-square bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
                        <Image size={16} className="text-slate-300" />
                      </div>
                    ))}
                    <div className="col-span-3 text-center py-2">
                      <p className="text-[10px] text-slate-400" style={{ fontFamily: font, fontWeight: 700 }}>3 photos uploaded by customer</p>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-2.5">
                    {[
                      { action: 'Quote sent via email', time: '2 hours ago', color: 'bg-blue-500' },
                      { action: 'Status changed to Contacted', time: '1 day ago', color: 'bg-yellow-500' },
                      { action: 'Lead submitted via QR code', time: 'May 4, 2026', color: 'bg-emerald-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${item.color} mt-1.5 shrink-0`} />
                        <div>
                          <p className="text-[11px] text-slate-700" style={{ fontFamily: font, fontWeight: 700 }}>{item.action}</p>
                          <p className="text-[9px] text-slate-400" style={{ fontFamily: font, fontWeight: 600 }}>{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 sm:mt-16 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { value: '9 Tabs', label: 'Everything about a lead in one card' },
              { value: '3 Views', label: 'Card, table, and calendar layouts' },
              { value: '1 Click', label: 'Email, quote, or schedule instantly' },
            ].map((stat, i) => (
              <div
                key={stat.value}
                className="bg-white rounded-xl sm:rounded-2xl border-3 border-slate-900 p-5 sm:p-6 text-center shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                style={{ borderWidth: '3px' }}
              >
                <div className="text-2xl sm:text-3xl text-slate-900 mb-1" style={{ fontFamily: font, fontWeight: 900 }}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600" style={{ fontFamily: font, fontWeight: 700 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}