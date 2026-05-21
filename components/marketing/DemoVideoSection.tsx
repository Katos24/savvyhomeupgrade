'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import Image from 'next/image';

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
    <section id="how-it-works" className="relative bg-slate-950 py-14 sm:py-24 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">

        {/* TOP — Text + Image side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* LEFT — Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <p
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-emerald-400 mb-3"
              style={{ fontFamily: font }}
            >
              The fix
            </p>
            <h2
              className="text-3xl sm:text-4xl text-white leading-[1.1]"
              style={{ fontFamily: font, fontWeight: 900 }}
            >
              This one goes to{' '}
              <span className="text-emerald-400">your dashboard.</span>
            </h2>
          </motion.div>

          {/* RIGHT — Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/images/heroimagefull.webp"
                alt="Lead2Project dashboard and branded form on phone"
                width={1100}
                height={1100}
                className="w-full h-auto object-contain"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
              />
            </div>
          </motion.div>
        </div>

        {/* BOTTOM — Video centered with flare */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-24 flex flex-col items-center"
        >
          <p
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-6 sm:mb-8"
            style={{ fontFamily: font }}
          >
            Watch it in action
          </p>

          <div className="relative">
            {/* Glow behind phone */}
            <div className="absolute -inset-8 sm:-inset-12 blur-3xl opacity-20 rounded-full bg-emerald-500" />
            <div className="absolute -inset-16 sm:-inset-24 blur-[80px] opacity-10 rounded-full bg-blue-500" />

            {/* Decorative rings */}
            <div className="absolute -inset-12 sm:-inset-16 border border-white/[0.03] rounded-full" />
            <div className="absolute -inset-20 sm:-inset-28 border border-white/[0.02] rounded-full" />

            {/* Phone */}
            <div className="relative z-10 w-[240px] sm:w-[280px]">
              <div className="rounded-[2rem] overflow-hidden border-[6px] border-slate-700 shadow-2xl bg-black">
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
              {/* Phone notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-24 h-5 bg-slate-700 rounded-b-2xl" />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}