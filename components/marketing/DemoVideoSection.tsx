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
      <div className="relative z-10 max-w-md mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-3"
            style={{ fontFamily: font }}
          >
            See it in action
          </p>
          <h2
            className="text-3xl sm:text-4xl text-white leading-[1.1] mb-10"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            From scan to lead{' '}
            <span className="text-emerald-400">in seconds.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 blur-3xl opacity-20 rounded-3xl bg-emerald-500 scale-90" />
          <div className="relative z-10 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <video
              ref={videoRef}
              src="/videos/Lead2ProjectDemo.mp4"
              muted
              loop
              playsInline
              controls
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}