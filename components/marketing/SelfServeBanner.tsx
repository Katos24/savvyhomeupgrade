'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, Zap, Gauge, Layers3, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

export default function SelfServeBanner() {
  return (
    <section className="relative bg-white py-24 sm:py-32 overflow-hidden border-b border-slate-100">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-20 right-[10%] w-72 h-72 bg-emerald-50 rounded-full blur-[100px] opacity-50" />
        <div className="absolute bottom-20 left-[10%] w-72 h-72 bg-sky-50 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        
        {/* Header Section */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <Zap size={10} className="fill-white" /> Instant Deployment
            </span>
            <h2 className="text-4xl sm:text-6xl text-slate-900 font-black leading-[1.05] tracking-tight mb-6" style={{ fontFamily: font }}>
              Stop booking demos. <br />
              <span className="text-emerald-600">Start building today.</span>
            </h2>
            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-xl mx-auto" style={{ fontFamily: font }}>
              Lead2Project is designed for immediate impact. Configure your workspace, invite your crew, and sync your operations in under 5 minutes. No sales calls, no gatekeepers.
            </p>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: The "Better Way" Proposition */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Modular Compatibility Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-slate-50 p-8 rounded-3xl border border-slate-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  <Layers3 className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-1" style={{ fontFamily: font }}>Plays well with others</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Lead2Project isn't a platform that demands total migration. Keep your existing accounting software, payment processors, and field tools. We act as the intelligence layer that sits on top of your current stack to bridge the gaps.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Efficiency Stats */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <Gauge className="text-slate-900 mb-3" size={24} />
                <h4 className="text-sm font-black text-slate-900 mb-1">Total Setup Time</h4>
                <p className="text-xs text-slate-500 font-bold tracking-tight">&lt; 2 minutes</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <ShieldCheck className="text-slate-900 mb-3" size={24} />
                <h4 className="text-sm font-black text-slate-900 mb-1">Sales Friction</h4>
                <p className="text-xs text-slate-500 font-bold tracking-tight">Zero (Self-Serve)</p>
              </div>
            </div>
          </div>

          {/* RIGHT: High-Conversion Call to Action */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:col-span-5 bg-slate-900 rounded-3xl p-8 text-white shadow-xl"
          >
            <h3 className="text-xl font-black mb-6" style={{ fontFamily: font }}>Ready to deploy?</h3>
            <ul className="space-y-4 mb-8">
              {[
                'Full platform access immediately',
                'No credit card for starter tier',
                'No waiting for sales approval',
                'One-click integration patterns'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                  <Check size={16} className="text-emerald-400" /> {item}
                </li>
              ))}
            </ul>
            
            <Link href="/signup" className="block">
              <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl font-black text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-2 group">
                Create Free Workspace 
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            
          </motion.div>
        </div>
      </div>
    </section>
  );
}