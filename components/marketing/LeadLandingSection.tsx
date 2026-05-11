'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Calendar,
  FileText,
  CreditCard,
  CheckSquare,
  Image,
  MessageCircle,
  Send,
  Zap,
  ArrowRight,
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

const TAB_VALUE: Record<string, { headline: string; body: string; highlight: string }> = {
  overview: {
    headline: 'Everything about the job. One screen.',
    body: "Name, email, phone, photos, description — all captured from your custom form. No retyping. No digging through texts. It's all here the second they submit.",
    highlight: 'Zero data entry',
  },
  schedule: {
    headline: 'Book the job. Send confirmation. One click.',
    body: "Pick a date and time, assign a crew member, and fire off a branded confirmation email to the customer — all without leaving the card. No back-and-forth texts.",
    highlight: 'One-click scheduling email',
  },
  quote: {
    headline: "Stop rewriting the same quote. Use templates.",
    body: "Pre-build quote templates for each category — roof replacement, leak repair, inspection. Select one, adjust the numbers, send. The customer gets a professional email with accept or decline built in.",
    highlight: 'Pre-built quote templates',
  },
  payment: {
    headline: 'Track every dollar. Send reminders instantly.',
    body: "See what's owed, what's paid, and what's overdue at a glance. One click sends a branded payment reminder email. No awkward phone calls.",
    highlight: 'One-click payment reminders',
  },
  tasks: {
    headline: 'Auto-load tasks by job type.',
    body: "Set up task templates per category — 'Roof Replacement' auto-loads inspection, material order, crew schedule, cleanup. Your team knows exactly what to do without being told twice.",
    highlight: 'Category-based task templates',
  },
  media: {
    headline: "Customer photos from day one. Yours from day last.",
    body: "Customers upload photos with their request — you see the damage before you even call. Add your own progress shots, documents, and short videos as the job moves forward.",
    highlight: 'Photos from intake to completion',
  },
  activity: {
    headline: 'Full history. Every email. Every change.',
    body: "Every quote sent, status change, email delivered, and note added — timestamped and searchable. When a customer calls asking 'did you send that quote?' you'll know in seconds.",
    highlight: 'Complete audit trail',
  },
};

/* ─── Pill Tabs ─── */
function PillTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (id: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const pill = activeRef.current;
      const container = scrollRef.current;
      const offset = pill.offsetLeft - container.offsetWidth / 2 + pill.offsetWidth / 2;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory px-1"
      style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {LEAD_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={isActive ? activeRef : null}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5
              rounded-full whitespace-nowrap transition-all duration-200 snap-start
              border-2 flex-shrink-0
              ${
                isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50'
              }
            `}
            style={{ fontFamily: font, fontWeight: isActive ? 900 : 700 }}
          >
            <Icon size={13} className="sm:w-[15px] sm:h-[15px]" />
            <span className="text-[11px] sm:text-xs">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function LeadLandingSection() {
  const [activeTab, setActiveTab] = useState('overview');
  const currentValue = TAB_VALUE[activeTab];

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

        {/* HEADER */}
        <div className="text-center mb-8 sm:mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3"
            style={{ fontFamily: font }}
          >
            Once a lead lands
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-5xl lg:text-6xl text-slate-900 mb-4 sm:mb-6 leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Run the entire job <br className="hidden sm:block" />
            <span className="text-blue-600">from one card.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-lg text-black-500 max-w-2xl mx-auto font-bold"
            style={{ fontFamily: font }}
          >
            Quote, schedule, collect payment, track tasks, send emails —
            all without leaving the lead card. No extra tools. No chaos.
          </motion.p>
        </div>

        {/* PILL TABS — always on top */}
        <div className="max-w-6xl mx-auto mb-5 sm:mb-8">
          <PillTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] gap-6 lg:gap-12 items-start max-w-6xl mx-auto">

          {/* VALUE COPY — below card on mobile, left on desktop */}
          <div className="order-2 lg:order-1 lg:sticky lg:top-32">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 sm:space-y-5"
              >
                <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-3 py-1.5">
                  <Zap size={12} className="text-blue-600" fill="currentColor" />
                  <span
                    className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-blue-700"
                    style={{ fontFamily: font }}
                  >
                    {currentValue.highlight}
                  </span>
                </div>

                <h3
                  className="text-lg sm:text-2xl lg:text-3xl text-slate-900 leading-tight"
                  style={{ fontFamily: font, fontWeight: 900 }}
                >
                  {currentValue.headline}
                </h3>

                <p
                  className="text-sm sm:text-base text-slate-600 leading-relaxed font-semibold"
                  style={{ fontFamily: font }}
                >
                  {currentValue.body}
                </p>

                <div className="hidden lg:flex items-center gap-2 text-blue-600 text-sm font-black pt-1">
                  <ArrowRight size={14} strokeWidth={3} />
                  <span>Click the tabs above to explore</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* CARD — first on mobile */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl sm:rounded-[1.5rem] border-[3px] sm:border-4 border-slate-900 overflow-hidden shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">

                {/* CARD HEADER */}
                <div className="bg-slate-900 px-4 sm:px-8 py-3 sm:py-6">
                  <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">
                    #176
                  </p>
                  <h3
                    className="text-lg sm:text-2xl text-white font-black mb-1"
                    style={{ fontFamily: font }}
                  >
                    John Smith
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-bold mb-2 sm:mb-4">
                    Submitted May 4, 2026
                  </p>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <span className="px-2 py-0.5 sm:py-1 bg-yellow-500 rounded-full text-[9px] sm:text-[10px] font-black text-slate-900">
                      Contacted
                    </span>
                    <span className="px-2 py-0.5 sm:py-1 bg-blue-500 rounded-full text-[9px] sm:text-[10px] font-black text-white">
                      May 20 · 8:30 PM
                    </span>
                    <span className="px-2 py-0.5 sm:py-1 bg-slate-700 rounded-full text-[9px] sm:text-[10px] font-bold text-slate-300">
                      Frank
                    </span>
                    <span className="px-2 py-0.5 sm:py-1 bg-slate-700 rounded-full text-[9px] sm:text-[10px] font-bold text-slate-300">
                      $7,950 due
                    </span>
                  </div>
                </div>

                {/* CONTENT AREA */}
                <div className="p-4 sm:p-8 bg-white min-h-[200px] sm:min-h-[280px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >

                      {/* OVERVIEW */}
                      {activeTab === 'overview' && (
                        <div className="space-y-4">
                          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border-2 border-slate-100">
                            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-3">
                              Client Info
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Name</p>
                                <p className="font-black text-slate-900 text-sm">John Smith</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Email</p>
                                <p className="font-black text-blue-500 text-sm">j@test.com</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Phone</p>
                                <p className="font-black text-blue-500 text-sm">(323) 243-2434</p>
                              </div>
                            </div>
                            <div className="mb-3">
                              <p className="text-[9px] text-slate-400 uppercase font-black mb-1">Request</p>
                              <p className="text-slate-700 font-bold text-sm">
                                Need roof repair after storm damage, a few shingles missing on the north side.
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black">
                              Roof Repair
                            </span>
                          </div>
                        </div>
                      )}

                      {/* SCHEDULE */}
                      {activeTab === 'schedule' && (
                        <div className="space-y-4">
                          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border-2 border-slate-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-black">Scheduled</p>
                                <p className="font-black text-slate-900 text-base sm:text-lg">May 20, 2026</p>
                                <p className="text-slate-500 font-bold text-xs">8:30 PM · Frank</p>
                              </div>
                              <Calendar size={28} className="text-blue-500" />
                            </div>
                          </div>
                          <button className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-black text-xs sm:text-sm">
                            <Send size={13} />
                            Send Schedule Confirmation
                          </button>
                          <p className="text-center text-[10px] text-slate-400 font-bold">
                            Branded email sent instantly · Tracked in outbox
                          </p>
                        </div>
                      )}

                      {/* QUOTE */}
                      {activeTab === 'quote' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[9px] uppercase tracking-widest font-black text-slate-400">
                              Quote — Roof Repair Template
                            </p>
                            <span className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black">
                              Template
                            </span>
                          </div>
                          <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 space-y-2.5">
                            {[
                              ['Tear-off & shingle replacement', '$4,200'],
                              ['Flashing repair', '$800'],
                              ['Cleanup & haul away', '$750'],
                            ].map(([item, price]) => (
                              <div key={item} className="flex justify-between items-center">
                                <span className="font-bold text-xs sm:text-sm">{item}</span>
                                <span className="font-black text-emerald-400 text-xs sm:text-sm">{price}</span>
                              </div>
                            ))}
                            <div className="border-t border-slate-700 pt-2.5 mt-1 flex justify-between">
                              <span className="font-black text-sm">Total</span>
                              <span className="font-black text-emerald-400 text-base">$5,750</span>
                            </div>
                          </div>
                          <button className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white py-3 rounded-xl font-black text-xs sm:text-sm">
                            <Send size={13} />
                            Send Quote to Customer
                          </button>
                          <p className="text-center text-[10px] text-slate-400 font-bold">
                            Customer receives email with Accept / Decline buttons
                          </p>
                        </div>
                      )}

                      {/* PAYMENT */}
                      {activeTab === 'payment' && (
                        <div className="space-y-4">
                          <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border-2 border-slate-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase font-black">Amount Due</p>
                                <p className="font-black text-slate-900 text-2xl">$7,950.00</p>
                              </div>
                              <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black">
                                Unpaid
                              </span>
                            </div>
                          </div>
                          <button className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-xl font-black text-xs sm:text-sm">
                            <Send size={13} />
                            Send Payment Reminder
                          </button>
                          <p className="text-center text-[10px] text-slate-400 font-bold">
                            No awkward phone calls · Professional branded email
                          </p>
                        </div>
                      )}

                      {/* TASKS */}
                      {activeTab === 'tasks' && (
                        <div className="space-y-2.5">
                          <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-2">
                            Auto-loaded from &ldquo;Roof Repair&rdquo; category
                          </p>
                          {[
                            { task: 'Schedule inspection', done: true },
                            { task: 'Send quote to customer', done: true },
                            { task: 'Order materials', done: false },
                            { task: 'Confirm crew availability', done: false },
                            { task: 'Complete job & take photos', done: false },
                          ].map((item) => (
                            <div
                              key={item.task}
                              className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                                item.done
                                  ? 'bg-emerald-50 border-emerald-200'
                                  : 'bg-white border-slate-100'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                                  item.done ? 'bg-emerald-500' : 'border-2 border-slate-300'
                                }`}
                              >
                                {item.done && (
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                  </svg>
                                )}
                              </div>
                              <span
                                className={`text-sm font-bold ${
                                  item.done ? 'text-slate-400 line-through' : 'text-slate-700'
                                }`}
                              >
                                {item.task}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* MEDIA */}
                      {activeTab === 'media' && (
                        <div>
                          <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-3">
                            Customer uploaded · May 4, 2026
                          </p>
                          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100">
                              <img
                                src="/images/roof-damage.webp"
                                className="w-full h-full object-cover"
                                alt="Storm damage"
                              />
                            </div>
                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100">
                              <img
                                src="/images/roof-damage.webp"
                                className="w-full h-full object-cover opacity-70"
                                alt="Damage detail"
                              />
                            </div>
                            <div className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-1">
                              <span className="text-lg font-black">+</span>
                              <span className="text-[9px] font-black uppercase">Add More</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold mt-3 text-center">
                            Photos, documents, and short videos — all attached to the lead
                          </p>
                        </div>
                      )}

                      {/* ACTIVITY */}
                      {activeTab === 'activity' && (
                        <div className="space-y-2">
                          <p className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-2">
                            Full Timeline
                          </p>
                          {[
                            { action: 'Payment reminder sent', time: '10 min ago', icon: Send, color: 'text-amber-500' },
                            { action: 'Quote sent — awaiting response', time: '2 hours ago', icon: FileText, color: 'text-blue-500' },
                            { action: 'Schedule confirmation sent', time: '1 day ago', icon: Calendar, color: 'text-emerald-500' },
                            { action: 'Status → Contacted', time: '2 days ago', icon: User, color: 'text-slate-400' },
                            { action: 'Lead submitted via QR scan', time: 'May 4, 2026', icon: Zap, color: 'text-yellow-500' },
                          ].map((item) => (
                            <div key={item.action} className="flex items-start gap-3 p-2.5 rounded-lg">
                              <item.icon size={14} className={`${item.color} mt-0.5 flex-shrink-0`} />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-700">{item.action}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{item.time}</p>
                              </div>
                            </div>
                          ))}
                          <p className="text-[10px] text-slate-400 font-bold mt-2 text-center">
                            Every email tracked · Full history in the outbox
                          </p>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}