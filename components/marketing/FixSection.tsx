'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function TheFixSection() {
  return (
    <section id="how-it-works" className="relative bg-slate-50 py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Subtle top transition */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-950/5 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">

        {/* TOP SECTION: Split Layout */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">
          
          <div className="order-2 lg:order-1">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
              <span className="text-emerald-700 font-black text-xs uppercase tracking-widest" style={{ fontFamily: font }}>The Solution</span>
            </div>

            <h3 className="text-5xl lg:text-7xl text-slate-900 leading-[0.95] tracking-tighter mb-8" style={{ fontFamily: font, fontWeight: 900 }}>
              One dashboard.<br />
              <span className="text-emerald-600">Every job.</span>
            </h3>

            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-lg">
              Lead2Project gives you a branded link to capture jobs and a command center to run them—quote, schedule, track, done.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 relative"
          >
            {/* Glow effect behind image */}
            <div className="absolute -inset-10 bg-emerald-500/10 blur-3xl rounded-full" />
            
            <div className="relative rounded-3xl shadow-2xl overflow-hidden border-8 border-white bg-white">
              <Image
                src="/images/jobsite.webp"
                alt="Lead2Project on phone"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION: The 3 Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Capture', desc: 'Branded form for photos, details, and info.' },
            { title: 'Organize', desc: 'Every job on one board—status, quote, schedule.' },
            { title: 'Act', desc: 'Send quotes, confirm schedules, get paid—one click.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-emerald-100 hover:border-emerald-200 transition-all group"
            >
              <div className="text-emerald-600 font-black text-xs mb-4 uppercase tracking-wider">0{i + 1}</div>
              <h4 className="text-2xl font-black text-slate-900 mb-3" style={{ fontFamily: font }}>{item.title}</h4>
              <p className="text-slate-500 font-medium text-base leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}