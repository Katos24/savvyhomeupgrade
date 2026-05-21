'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

const font = "'Nunito', sans-serif";

export default function DemoVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 3;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section className="relative bg-slate-950 py-14 sm:py-24 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* LEFT — Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <p
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-3"
              style={{ fontFamily: font }}
            >
              See the difference
            </p>
            <h2
              className="text-3xl sm:text-4xl text-white leading-[1.1]"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              Customer fills out your form.{' '}
              <span className="text-emerald-400">You get this, not an email.</span>
            </h2>
            <p
              className="text-sm sm:text-base text-white mt-5 font-medium leading-relaxed max-w-md mx-auto lg:mx-0"
              style={{ fontFamily: font }}
            >
              Watch a real lead come in with photos, details, and customer
              message straight to your dashboard. No inbox digging required.
            </p>
          </motion.div>

          {/* RIGHT — Phone-sized Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-[260px] sm:w-[280px]">
              <div className="absolute -inset-4 blur-3xl opacity-15 rounded-3xl bg-emerald-500" />
              <div className="relative z-10 rounded-[2rem] overflow-hidden border-[6px] border-slate-700 shadow-2xl bg-black">
                <video
                  ref={videoRef}
                  src="/videos/Lead2ProjectDemo.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-auto"
                />
              </div>
              {/* Phone notch detail */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-24 h-5 bg-slate-700 rounded-b-2xl" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}