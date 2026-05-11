'use client';

import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

export default function DemoVideoSection() {
  return (
    <section className="relative py-6 sm:py-10 bg-slate-50 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="w-[280px] sm:w-[320px]">
            {/* Phone frame */}
            <div className="bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-2.5 border-4 border-slate-800 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
              {/* Notch */}
              <div className="flex justify-center mb-1">
                <div className="w-20 h-4 bg-slate-800 rounded-full" />
              </div>

              {/* Video */}
              <div className="rounded-2xl sm:rounded-3xl overflow-hidden bg-black aspect-[9/19]">
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/videos/Lead2ProjectDemo.mp4" type="video/mp4" />
                </video>
              </div>

              {/* Home bar */}
              <div className="flex justify-center mt-2">
                <div className="w-24 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>

            {/* Caption */}
            <p
              className="text-center mt-4 text-[9px] text-slate-400 uppercase tracking-[0.2em]"
              style={{ fontFamily: font, fontWeight: 800 }}
            >
              Real product · No editing · 49 seconds
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}