'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function TheFixSection() {
  return (
    <section id="how-it-works" className="relative bg-slate-50 py-20 sm:py-28 lg:py-36 overflow-hidden">
      {/* Dynamic top divider angle to cut away cleanly from the dark section */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none" />
      
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14 sm:mb-20"
        >
          <p
            className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-emerald-600 mb-4"
            style={{ fontFamily: font }}
          >
            The fix
          </p>
          <h2
            className="text-3xl sm:text-5xl lg:text-6xl text-slate-900 leading-[1.05] tracking-tight max-w-3xl mx-auto"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            This one goes to{' '}
            <span className="text-emerald-600 block sm:inline">your dashboard.</span>
          </h2>
        </motion.div>

        {/* Tilted laptop */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
          style={{ perspective: '2000px' }}
        >
          {/* Deep complex shadows for real depth on light background */}
          <div className="absolute -inset-4 lg:-inset-10 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none mix-blend-multiply" />
          <div className="absolute top-12 -inset-x-6 bottom-[-40px] bg-slate-900/[0.06] blur-2xl rounded-[2rem] pointer-events-none" />

          <motion.div
            initial={{ rotateX: 12, rotateY: -10, rotateZ: 1.5, scale: 0.98 }}
            whileInView={{ rotateX: 4, rotateY: -3, rotateZ: 0.5, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl lg:rounded-3xl shadow-[0_30px_70px_rgba(15,23,42,0.18),0_10px_20px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden bg-white p-1.5 sm:p-2.5 backdrop-blur"
          >
            <div className="relative rounded-xl lg:rounded-[1.25rem] overflow-hidden border border-slate-100">
              <Image
                src="/images/hero-image-laptop.webp"
                alt="Lead2Project Dashboard — every lead organized on one board"
                width={1800}
                height={1300}
                className="w-full h-auto object-cover transition-transform duration-700 hover:scale-[1.01]"
                sizes="(max-width: 768px) 100vw, 1100px"
                priority
              />
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}