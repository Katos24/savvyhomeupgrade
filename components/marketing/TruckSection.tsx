'use client';

import { motion } from 'framer-motion';
import { Globe, QrCode, Share2, Truck, CreditCard, Users, Star } from 'lucide-react';
import Image from 'next/image';

const font = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const USE_CASES = [
  { icon: Globe, title: 'Your Website' },
  { icon: Share2, title: 'Social Profiles' },
  { icon: QrCode, title: 'Yard Signs' },
  { icon: Users, title: 'Referrals' },
  { icon: CreditCard, title: 'Business Cards' },
  { icon: Truck, title: 'Vehicle Wraps' },
];

export default function DistributionSection() {
  return (
    <section 
      id="distribution" 
      style={{ fontFamily: font }}
      className="relative bg-slate-50 py-20 sm:py-28 overflow-hidden border-b border-slate-100"
    >
      {/* Background Micro Dot Texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* GOOGLE PROFILE INTERACTION INTEGRATION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col text-left"
          >
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 block">
              Search Visibility Optimization
            </span>
            
            <h2 className="text-slate-900 font-black tracking-tight leading-[1.05] text-4xl sm:text-5xl mb-6">
              Own your local <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Google Search results.</span>
            </h2>

            <p className="text-slate-500 font-bold text-base sm:text-lg leading-relaxed mb-6">
              Add your Lead2Project secure booking link directly to your Google Business Profile as your primary call-to-action button to capture inbound requests seamlessly.
            </p>

            <ul className="space-y-3.5">
              {[
                "Capture fresh leads while you are out on another job site",
                'Provide clients a clean, structured Request Quote button',
                'Collect site photos and breakdown details automatically'
              ].map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* GOOGLE MOCK WINDOW CARD DISPLAY */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-sm mx-auto lg:mr-0"
          >
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200/60 relative">
              <div className="flex justify-between items-start mb-5">
                <div className="flex gap-3.5">
                  <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/images/arctic-air-logo.webp" alt="Arctic Air Branding Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 leading-tight">Arctic Air HVAC</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex items-center text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={11} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-slate-400 font-bold text-[11px] ml-1">4.9 (124 reviews)</span>
                    </div>
                    <p className="text-slate-400 font-bold text-[10px] mt-0.5">HVAC Contractor · Holbrook</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-slate-100 py-3.5 my-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Online Estimate</span>
                  <span className="text-xs font-black text-emerald-600 cursor-pointer hover:underline">Request a Quote &rarr;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Appointments</span>
                  <span className="text-xs font-black text-blue-600 cursor-pointer hover:underline">Schedule Job &rarr;</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                {['Website', 'Directions', 'Call'].map((label) => (
                  <div key={label} className="py-2 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-black text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* MULTI-CHANNEL DISTRIBUTION NETWORKS */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-black text-slate-900 mb-8 text-center"
          >
            Deploy your assets everywhere else...
          </motion.h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl border border-slate-200/60 overflow-hidden min-h-[260px] sm:min-h-[340px] bg-slate-100 shadow-2xs"
            >
              <Image
                src="/images/qr-scan-2.webp"
                alt="Customer scanning a custom QR code on a service truck to quickly request a design quote"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg shadow-sm">
                Scan · Submit · Done
              </div>
            </motion.div>

            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="relative rounded-2xl border border-slate-200/60 overflow-hidden h-36 w-full bg-slate-100 shadow-2xs"
              >
                <Image
                  src="/images/qrbranded2.webp"
                  alt="Branded custom tracking codes printed on service trucks and landscape yard placements"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                <p className="absolute bottom-4 left-4 text-white text-[10px] font-black uppercase tracking-widest">
                  Truck Wraps · Yard Signs · Social Channels
                </p>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {USE_CASES.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="bg-white border border-slate-200/70 rounded-xl p-4 shadow-3xs hover:border-slate-300 transition-colors group cursor-default"
                  >
                    <item.icon size={16} className="text-emerald-600 mb-2 group-hover:scale-105 transition-transform" />
                    <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}