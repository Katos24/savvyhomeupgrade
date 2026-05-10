'use client';

import { motion } from 'framer-motion';
import { Smartphone, Monitor, ArrowRight } from 'lucide-react';

/*
  FONT: Nunito — add to layout.tsx:
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
*/

const font = "'Nunito', sans-serif";

export default function LeadLandingSection() {
  return (
    <section className="bg-amber-50 py-14 sm:py-20 lg:py-28 overflow-hidden relative">
      {/* Fun background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 lg:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 mb-4 sm:mb-5 leading-tight px-2"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Customer Fills It Out.
            <br />
            <span className="relative inline-block">
              <span className="text-blue-600">You Get It Instantly.</span>
              <motion.div
                className="absolute -bottom-1.5 left-0 right-0 h-3 bg-blue-200 -z-10 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
              />
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto px-2"
            style={{ fontFamily: font, fontWeight: 700 }}
          >
            No waiting. No manual data entry. The lead shows up on your board{' '}
            <span className="text-blue-600" style={{ fontWeight: 900 }}>in real-time.</span>
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
        >
          
          {/* LEFT: QR Code Photo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-slate-900 overflow-hidden shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
                style={{ borderWidth: undefined }}
              >
                <img
                  src="/images/qr-scan-2.webp"
                  alt="QR code on truck"
                  className="w-full block"
                />
              </motion.div>
              
              {/* Caption Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 px-4 sm:px-6 py-2 sm:py-2.5 bg-yellow-400 rounded-full text-xs sm:text-sm text-slate-900 shadow-lg whitespace-nowrap border-3 border-slate-900"
                style={{ fontFamily: font, fontWeight: 900, borderWidth: '3px' }}
              >
                Customer Scans QR Code
              </motion.div>
            </div>
          </div>

          {/* CENTER: Arrow */}
          <div className="lg:col-span-2 flex justify-center items-center">
            <div className="hidden lg:block">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                <ArrowRight size={32} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <div className="lg:hidden my-4 sm:my-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-600 flex items-center justify-center border-3 sm:border-4 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] rotate-90" style={{ borderWidth: undefined }}>
                <ArrowRight size={22} className="text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* RIGHT: Dark Dashboard */}
          <div className="lg:col-span-5">
            <div className="bg-slate-900 rounded-2xl sm:rounded-3xl border-3 sm:border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
              
              {/* Dashboard Top Bar */}
              <div className="px-4 sm:px-5 py-3 sm:py-4 border-b-3 border-slate-700" style={{ borderBottomWidth: '3px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center border-2 border-slate-700">
                      <Monitor size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-white" style={{ fontFamily: font, fontWeight: 900 }}>Your Dashboard</div>
                      <div className="text-xs text-slate-500" style={{ fontFamily: font, fontWeight: 700 }}>Live Board</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full border-2 border-emerald-500/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>Live</span>
                  </div>
                </div>
              </div>

              {/* Card Grid */}
              <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                
                {/* Lead Card — Kevin White */}
                <div
                  className="col-span-1 sm:col-span-2 bg-emerald-500 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border-3 border-emerald-300"
                  style={{ borderWidth: '3px' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-emerald-600 text-xs border-2 border-emerald-300" style={{ fontFamily: font, fontWeight: 900 }}>
                        KW
                      </div>
                      <div>
                        <div className="text-sm text-white" style={{ fontFamily: font, fontWeight: 900 }}>Kevin White</div>
                        <div className="text-xs text-emerald-100" style={{ fontFamily: font, fontWeight: 600 }}>kevin@email.com</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-white rounded-full border-2 border-emerald-300">
                      <span className="text-[11px] text-emerald-600 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>NEW</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-600 rounded-xl px-3 py-2">
                      <div className="text-[10px] text-emerald-200 uppercase tracking-wider mb-0.5" style={{ fontFamily: font, fontWeight: 800 }}>Roof Age</div>
                      <div className="text-xs text-white" style={{ fontFamily: font, fontWeight: 900 }}>10-20 years</div>
                    </div>
                    <div className="bg-emerald-600 rounded-xl px-3 py-2">
                      <div className="text-[10px] text-emerald-200 uppercase tracking-wider mb-0.5" style={{ fontFamily: font, fontWeight: 800 }}>Source</div>
                      <div className="text-xs text-white flex items-center gap-1" style={{ fontFamily: font, fontWeight: 900 }}>
                        <Smartphone size={10} /> QR Code
                      </div>
                    </div>
                  </div>
                </div>

                {/* Existing Lead 1 */}
                <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] border-2 border-orange-300" style={{ fontFamily: font, fontWeight: 900 }}>
                      SJ
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate" style={{ fontFamily: font, fontWeight: 800 }}>Sarah Johnson</div>
                      <div className="text-[10px] text-slate-500" style={{ fontFamily: font, fontWeight: 600 }}>2 hours ago</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-yellow-500 rounded-lg inline-block border-2 border-yellow-400">
                    <span className="text-[10px] text-slate-900 uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>Contacted</span>
                  </div>
                </div>

                {/* Existing Lead 2 */}
                <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] border-2 border-blue-300" style={{ fontFamily: font, fontWeight: 900 }}>
                      MT
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate" style={{ fontFamily: font, fontWeight: 800 }}>Mike Torres</div>
                      <div className="text-[10px] text-slate-500" style={{ fontFamily: font, fontWeight: 600 }}>Yesterday</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-blue-500 rounded-lg inline-block border-2 border-blue-400">
                    <span className="text-[10px] text-white uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>Scheduled</span>
                  </div>
                </div>

                {/* Existing Lead 3 */}
                <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] border-2 border-emerald-300" style={{ fontFamily: font, fontWeight: 900 }}>
                      RL
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate" style={{ fontFamily: font, fontWeight: 800 }}>Rachel Lee</div>
                      <div className="text-[10px] text-slate-500" style={{ fontFamily: font, fontWeight: 600 }}>2 days ago</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-500 rounded-lg inline-block border-2 border-emerald-300">
                    <span className="text-[10px] text-white uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>Won</span>
                  </div>
                </div>

                {/* Existing Lead 4 */}
                <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-3.5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] border-2 border-purple-300" style={{ fontFamily: font, fontWeight: 900 }}>
                      DA
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate" style={{ fontFamily: font, fontWeight: 800 }}>David Adams</div>
                      <div className="text-[10px] text-slate-500" style={{ fontFamily: font, fontWeight: 600 }}>3 days ago</div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 bg-purple-500 rounded-lg inline-block border-2 border-purple-300">
                    <span className="text-[10px] text-white uppercase tracking-wider" style={{ fontFamily: font, fontWeight: 900 }}>Follow Up</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </motion.div>

        {/* Bottom Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 sm:mt-16 lg:mt-20 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { value: '2 sec', label: 'From submit to your board', color: 'bg-blue-500' },
              { value: 'Zero', label: 'Manual data entry needed', color: 'bg-emerald-500' },
              { value: '24/7', label: 'Leads come in while you sleep', color: 'bg-orange-500' }
            ].map((stat, i) => (
              <motion.div
                key={stat.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="bg-white rounded-xl sm:rounded-2xl border-3 border-slate-900 p-5 sm:p-6 text-center shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] sm:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
                style={{ borderWidth: '3px' }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl text-slate-900 mb-1" style={{ fontFamily: font, fontWeight: 900 }}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600" style={{ fontFamily: font, fontWeight: 700 }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}