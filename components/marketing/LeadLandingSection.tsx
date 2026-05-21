'use client';

import { motion } from 'framer-motion';
import { Eye, FileText, Calendar, DollarSign } from 'lucide-react';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

const FEATURES = [
  {
    id: 'overview',
    icon: <Eye size={18} className="text-blue-600" />,
    title: 'Zero Data Entry',
    desc: 'Every lead lands with photos, job details, and contact info. No retyping.',
    image: '/images/overview-screen.png',
    accent: '#3b82f6',
  },
  {
    id: 'quote',
    icon: <FileText size={18} className="text-emerald-600" />,
    title: 'One-Click Quotes',
    desc: 'Build in seconds from a template and email a branded quote instantly.',
    image: '/images/quote-send-tablet.webp',
    accent: '#10b981',
  },
  {
    id: 'schedule',
    icon: <Calendar size={18} className="text-indigo-600" />,
    title: 'Quick Scheduling',
    desc: 'Book the job, assign your crew, and fire off confirmations without leaving the card.',
    image: '/images/schedule-screen.webp',
    accent: '#6366f1',
  },
  {
    id: 'payment',
    icon: <DollarSign size={18} className="text-amber-600" />,
    title: 'Payment Tracking',
    desc: 'Track what is paid, what is due, and send custom invoice reminders.',
    image: '/images/payment-send.webp',
    accent: '#f59e0b',
  },
];

export default function LeadLandingSection() {
  return (
    <section className="relative bg-slate-50 py-16 sm:py-24 overflow-hidden">
      {/* Background Subtle Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">
        
        {/* HEADER */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
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
            className="text-3xl sm:text-4xl lg:text-5xl text-slate-900 leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Run the entire job{' '}
            <span className="text-blue-600 block sm:inline">from one card.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-slate-500 mt-4 font-semibold leading-relaxed"
            style={{ fontFamily: font }}
          >
            Lead2Project gives you exactly what you need to track, run, and complete the job. No more switching between texts, spreadsheets, and messy inboxes.
          </motion.p>
        </div>

        {/* CLEAN GRID VIEW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {FEATURES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div className="mb-6">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${item.accent}12` }}
                >
                  {item.icon}
                </div>
                <h3 
                  className="text-xl text-slate-900 mb-1"
                  style={{ fontFamily: font, fontWeight: 800 }}
                >
                  {item.title}
                </h3>
                <p 
                  className="text-sm text-slate-500 font-medium"
                  style={{ fontFamily: font }}
                >
                  {item.desc}
                </p>
              </div>

              {/* Card Workspace Screenshot Preview */}
              <div 
                className="relative rounded-xl overflow-hidden border mt-auto bg-slate-50"
                style={{ borderColor: `${item.accent}20` }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={350}
                  className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}