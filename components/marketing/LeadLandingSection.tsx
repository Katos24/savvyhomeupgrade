'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, FileText, CreditCard, CheckSquare, Image, MessageCircle, DollarSign, Clock } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('media'); // Setting Media as active to show the image immediately

  return (
    <section className="bg-amber-50 py-14 sm:py-20 lg:py-28 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">

        {/* Header */}
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

        {/* Lead Card - SIGNIFICANTLY Wider (max-w-4xl) */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-[2rem] border-[6px] border-slate-900 overflow-hidden shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">

              {/* Lead header */}
              <div className="bg-slate-900 px-6 sm:px-10 py-8">
                <p className="text-[11px] text-slate-500 mb-1 uppercase tracking-[0.2em] font-black" style={{ fontFamily: font }}>#176</p>
                <h3 className="text-2xl sm:text-4xl text-white mb-3" style={{ fontFamily: font, fontWeight: 900 }}>John Smith</h3>
                <p className="text-sm text-slate-500 mb-6 font-bold" style={{ fontFamily: font }}>Submitted May 4, 2026</p>

                {/* Status pills */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-yellow-500 rounded-full text-xs text-slate-900 font-black">Contacted</span>
                  <span className="px-4 py-1.5 bg-blue-500 rounded-full text-xs text-white font-black">May 20 · 8:30 PM</span>
                  <span className="px-4 py-1.5 bg-slate-700 rounded-full text-xs text-slate-300 font-bold">Frank</span>
                  <span className="px-4 py-1.5 bg-slate-700 rounded-full text-xs text-slate-300 font-bold">$7,950.00 due</span>
                  <span className="px-4 py-1.5 bg-emerald-500/20 rounded-full text-xs text-emerald-400 border border-emerald-500/30 font-black">AI Brief</span>
                </div>
              </div>

              {/* Tab bar */}
              <div className="border-b-4 border-slate-100 px-4 sm:px-10 overflow-x-auto bg-slate-50">
                <div className="flex gap-4 min-w-max">
                  {LEAD_TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-5 py-6 text-xs sm:text-sm border-b-[6px] transition-all ${
                          isActive
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                        style={{ fontFamily: font, fontWeight: isActive ? 900 : 700 }}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab content */}
              <div className="p-6 sm:p-12 bg-white" style={{ minHeight: '380px' }}>

                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border-2 border-slate-100">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-[11px] text-slate-400 uppercase tracking-widest font-black">Client Info</p>
                        <span className="text-[11px] text-blue-500 font-black cursor-pointer hover:underline uppercase tracking-widest">Actions</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Name</p>
                          <p className="text-base text-slate-900 font-black">John Smith</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Email</p>
                          <p className="text-base text-blue-500 font-black">j@test.com</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 font-bold">Phone</p>
                          <p className="text-base text-blue-500 font-black">(323) 243-2434</p>
                        </div>
                      </div>
                      <div className="mb-8">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-3 font-bold">Category</p>
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black">Roof Repair</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: 'Email', icon: Mail },
                          { label: 'Call', icon: Phone },
                          { label: 'Text', icon: MessageCircle },
                        ].map(action => (
                          <div key={action.label} className="flex items-center justify-center gap-3 py-4 rounded-xl border-[3px] border-slate-200 bg-white hover:border-blue-500 transition-all cursor-pointer">
                            <action.icon size={16} className="text-slate-400" />
                            <span className="text-sm text-slate-700 font-black">{action.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100">
                        <p className="text-[10px] text-emerald-500 uppercase tracking-widest mb-3 font-black">Customer's Message</p>
                        <p className="text-sm text-slate-600 leading-relaxed font-bold">Need roof repair after storm damage, a few shingles missing on the north side.</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-100">
                        <p className="text-[10px] text-amber-500 uppercase tracking-widest mb-3 font-black">Internal Notes</p>
                        <p className="text-sm text-slate-400 italic font-bold">Add notes about this job...</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'schedule' && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Calendar size={64} className="text-blue-500 mb-6" />
                    <p className="text-2xl text-slate-900 mb-2 font-black">May 20, 2026 · 8:30 PM</p>
                    <p className="text-base text-slate-500 font-bold mb-10">Assigned to: Frank</p>
                    <div className="px-12 py-4 bg-blue-500 rounded-2xl text-sm text-white font-black uppercase tracking-widest cursor-pointer shadow-xl shadow-blue-500/20 border-b-4 border-blue-700 active:border-b-0 transition-all">Reschedule</div>
                  </div>
                )}

                {activeTab === 'quote' && (
                  <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="bg-slate-900 rounded-3xl p-8 border-[6px] border-slate-800">
                      {[
                        { item: 'Tear-off & shingle replacement', price: '$4,200' },
                        { item: 'Flashing repair', price: '$800' },
                        { item: 'Cleanup & haul away', price: '$750' },
                      ].map((row, i) => (
                        <div key={i} className={`flex justify-between py-4 ${i < 2 ? 'border-b-2 border-slate-800' : ''}`}>
                          <span className="text-sm text-slate-300 font-bold">{row.item}</span>
                          <span className="text-sm text-emerald-400 font-black">{row.price}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-6 mt-4 border-t-2 border-slate-700">
                        <span className="text-xs text-slate-500 uppercase font-black tracking-widest">Total</span>
                        <span className="text-3xl text-emerald-400 font-black">$5,750.00</span>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-1 py-5 text-center bg-emerald-500 rounded-2xl text-sm text-white font-black uppercase tracking-widest border-b-4 border-emerald-700 cursor-pointer active:border-b-0 transition-all shadow-lg shadow-emerald-500/10">Send Quote</div>
                      <div className="flex-1 py-5 text-center bg-slate-100 rounded-2xl text-sm text-slate-600 font-black uppercase tracking-widest border-b-4 border-slate-300 cursor-pointer active:border-b-0 transition-all">Edit</div>
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <CreditCard size={64} className="text-emerald-500 mb-6" />
                    <p className="text-4xl text-slate-900 mb-2 font-black">$7,950.00</p>
                    <p className="text-sm text-red-500 mb-12 font-black uppercase tracking-[0.3em]">Status: Unpaid</p>
                    <div className="px-12 py-5 bg-emerald-500 rounded-2xl text-sm text-white font-black uppercase tracking-widest cursor-pointer shadow-xl shadow-emerald-500/20 border-b-4 border-emerald-700 active:border-b-0 transition-all">Send Payment Reminder</div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {[
                      { text: 'Schedule inspection', done: true },
                      { text: 'Send quote to customer', done: true },
                      { text: 'Order materials', done: false },
                      { text: 'Confirm crew availability', done: false },
                    ].map((task, i) => (
                      <div key={i} className={`flex items-center gap-6 px-6 py-5 rounded-2xl border-2 transition-all ${task.done ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                        <div className={`w-6 h-6 rounded-lg border-[3px] flex items-center justify-center ${task.done ? 'bg-emerald-500 border-emerald-400' : 'border-slate-300'}`}>
                          {task.done && <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span className={`text-base ${task.done ? 'text-slate-400 line-through' : 'text-slate-700 font-black'}`} style={{ fontFamily: font }}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'media' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Customer uploaded image - Specified Image added here */}
                    <div className="col-span-1 sm:col-span-2 aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200">
                      <img
                        src="/images/roof-damage.webp"
                        alt="Customer uploaded roof damage photo"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {[2, 3].map(i => (
                      <div key={i} className="aspect-square bg-slate-100 rounded-2xl border-4 border-dashed border-slate-200 flex items-center justify-center hover:border-blue-500 transition-all cursor-pointer">
                        <Image size={32} className="text-slate-300" />
                      </div>
                    ))}
                    <div className="aspect-square bg-slate-50 rounded-2xl border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all cursor-pointer">
                        <span className="text-2xl font-black mb-1">+</span>
                        <span className="text-[10px] font-black uppercase">Add Media</span>
                    </div>
                    <div className="col-span-full text-center py-6">
                      <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Images Uploaded by Client (Showing 1 of 3)</p>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {[
                      { action: 'Quote sent via email', time: '2 hours ago', color: 'bg-blue-500' },
                      { action: 'Status changed to Contacted', time: '1 day ago', color: 'bg-yellow-500' },
                      { action: 'Lead submitted via QR code', time: 'May 4, 2026', color: 'bg-emerald-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-6">
                        <div className={`w-3 h-3 rounded-full ${item.color} mt-2 shrink-0 shadow-lg`} />
                        <div className="bg-slate-50 flex-1 p-4 rounded-xl border border-slate-100">
                          <p className="text-base text-slate-700 font-black">{item.action}</p>
                          <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mt-1">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats - Widened and spaced to match the new card width */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 sm:mt-24 max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            {[
              { value: '9 Tabs', label: 'Every Detail Tracked' },
              { value: '3 Views', label: 'Card, Table & Calendar' },
              { value: '1 Click', label: 'Quote & Schedule Instantly' },
            ].map((stat, i) => (
              <div
                key={stat.value}
                className="bg-white rounded-[2rem] border-4 border-slate-900 p-8 sm:p-10 text-center shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
              >
                <div className="text-4xl sm:text-5xl text-slate-900 mb-3 font-black" style={{ fontFamily: font }}>
                  {stat.value}
                </div>
                <div className="text-xs text-slate-600 font-black uppercase tracking-[0.2em] leading-relaxed">
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