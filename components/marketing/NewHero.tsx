'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, User, MapPin, Phone, QrCode, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    // Reduced padding to keep everything tight
    <section className="relative bg-white pt-16 lg:pt-44 pb-8 lg:pb-16 overflow-hidden">
      
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      
      <div className="absolute bottom-0 left-0 right-0 h-32 lg:h-60 bg-gradient-to-t from-slate-100/60 to-transparent -z-10" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-4 lg:gap-8 items-start">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col items-start text-left space-y-4 lg:space-y-10 z-30">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mb-2 lg:mb-0"
            >
              <QrCode size={14} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ fontFamily: font }}>
                QR → Lead → Job Workflow
              </span>
            </motion.div>

            <div className="space-y-2 lg:space-y-6">
              <h1 className="text-slate-900 text-5xl sm:text-7xl lg:text-[7rem] leading-[1.1] lg:leading-[0.9] tracking-tight font-black" style={{ fontFamily: font }}>
                Capture. <br />
                Convert. <br />
                <span className="text-emerald-500 font-black">Run Work.</span>
              </h1>
              
              <p className="hidden lg:block text-slate-600 text-xl font-bold leading-relaxed max-w-md border-l-4 border-slate-100 pl-6" style={{ fontFamily: font }}>
                Turn any scan or link into a structured job instantly. Customers submit through your branded QR form while your team manages everything.
              </p>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex flex-row items-center gap-5 w-full">
              <Link href="/signup">
                <div className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-black uppercase shadow-xl transition-all">
                  Get Your QR System
                  <ArrowRight size={20} strokeWidth={3} />
                </div>
              </Link>
            </div>
          </div>

          {/* RIGHT VISUALS - Fixed the mobile gap here */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            // Removed 'my-10' and reduced h-auto to keep it tight to the header
            className="relative flex justify-center lg:justify-start items-center h-auto lg:h-[600px] mt-4 lg:mt-0"
          >
            <div className="absolute inset-0 bg-emerald-100/30 blur-[80px] rounded-full -z-10 scale-90" />

            {/* LAPTOP: Massive on mobile (w-[140%]) */}
            <div
              className="relative w-[140%] lg:w-[125%] lg:-ml-24 z-10"
              style={{ perspective: "1500px", transformStyle: "preserve-3d" }}
            >
              <motion.div
                animate={{ 
                  rotateY: typeof window !== 'undefined' && window.innerWidth >= 1024 ? -12 : 0,
                  rotateX: typeof window !== 'undefined' && window.innerWidth >= 1024 ? 4 : 0
                }}
                className="transition-transform duration-700 ease-out"
              >
                <Image
                  src="/images/hero-image-laptop.webp"
                  alt="Lead2Project Dashboard"
                  width={1600}
                  height={1200}
                  priority
                  className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(15,23,42,0.1)] lg:drop-shadow-[0_45px_100px_rgba(15,23,42,0.12)] rounded-xl"
                />
              </motion.div>

              <div className="absolute -bottom-4 lg:-bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-6 lg:h-12 bg-slate-900/15 blur-[40px] lg:blur-[80px] rounded-full -z-10" />
            </div>

            {/* PHONE: HIDDEN ON MOBILE */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:block absolute right-[-30px] top-1/2 -translate-y-1/2 w-[230px] bg-white rounded-[2.2rem] shadow-2xl border-4 border-white z-20"
            >
              <div className="bg-slate-900 px-4 py-3 text-white rounded-t-[2rem]">
                <p className="text-[10px] font-black uppercase tracking-widest">New Lead · Leak Detection</p>
              </div>
              
              <div className="p-5 space-y-3 bg-white">
                 <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-700 font-bold">
                        <User size={12} className="text-emerald-500" /> Jennifer L
                    </div>
                 </div>
                 <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-100">
                    <Image src="/images/roof-damage.webp" alt="Attached" fill className="object-cover" />
                 </div>
                 <div className="h-10 w-full bg-emerald-500 rounded-xl flex items-center justify-center text-white text-[11px] font-black uppercase tracking-widest">
                   Submit Request
                 </div>
              </div>
            </motion.div>
          </motion.div>

          {/* MOBILE ONLY: Buttons & Subtext */}
          <div className="flex lg:hidden flex-col items-center text-center space-y-6 pt-2">
            <p className="text-slate-600 text-sm font-bold leading-relaxed max-w-[280px]" style={{ fontFamily: font }}>
              Customers submit through your branded QR form while your team manages everything.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Link href="/signup">
                <div className="flex items-center justify-center gap-3 bg-slate-950 text-white px-8 py-4 rounded-xl font-black uppercase shadow-xl">
                  Get Started <ArrowRight size={18} />
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}