'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, User, MapPin, QrCode } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-24 lg:pt-44 pb-16 lg:pb-32 overflow-hidden">
      
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-12 lg:gap-8 items-center">
          
          {/* LEFT: Massive Typography Block */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-10 z-30">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600"
            >
              <QrCode size={14} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ fontFamily: font }}>
                Fixed Price • Unlimited Seats
              </span>
            </motion.div>

            <div className="space-y-6">
              <h1 className="text-slate-900 text-5xl sm:text-7xl lg:text-[7rem] leading-[1.05] lg:leading-[0.88] tracking-tight" style={{ fontFamily: font, fontWeight: 900 }}>
                Capture. <br />
                Manage. <br />
                <span className="text-emerald-500 font-black">Scale.</span>
              </h1>
              <p className="text-slate-600 text-lg lg:text-xl font-bold leading-relaxed max-w-md mx-auto lg:mx-0 lg:border-l-4 lg:border-slate-100 lg:pl-6" style={{ fontFamily: font }}>
Turn any scan or link into a structured job instantly. Customers submit through your branded QR form while your team manages everything.              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
              <Link href="/signup" className="w-full sm:w-auto">
                <div className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-black uppercase transition-all shadow-xl">
                  Start Free
                  <ArrowRight size={20} strokeWidth={3} />
                </div>
              </Link>
              <Link href="/demo" className="group">
                <div className="flex items-center gap-3 px-8 py-5 text-slate-500 hover:text-slate-900 font-black uppercase text-xs tracking-widest transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  </div>
                  Try Demo
                </div>
              </Link>
            </div>
          </div>

          {/* RIGHT: Laptop Pushed Left + Phone on Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-start items-center h-[400px] sm:h-[500px] lg:h-[600px]"
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-emerald-100/30 blur-[100px] rounded-full -z-10 scale-90" />

            {/* LAPTOP: Pushed Left (Centered/Left-aligned in its grid cell) */}
            <div
              className="relative w-full max-w-[550px] sm:max-w-[650px] lg:max-w-none lg:w-[120%] lg:-ml-24 z-10"
              style={{
                perspective: "1500px",
                transformStyle: "preserve-3d",
              }}
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
                  className="w-full h-auto object-contain drop-shadow-[0_45px_100px_rgba(15,23,42,0.12)] rounded-xl"
                />
              </motion.div>
            </div>

            {/* PHONE FORM: Pushed to the far right edge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="absolute -bottom-10 lg:bottom-auto lg:right-[-20px] lg:top-1/2 lg:-translate-y-1/2 bg-white w-[160px] sm:w-[200px] rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.25)] border-4 border-white z-20 group"
            >
              <div className="bg-slate-900 px-4 py-3 text-white rounded-t-[1.7rem]">
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ fontFamily: font }}>New Lead Intake</p>
              </div>
              
              <div className="p-4 sm:p-5 space-y-4">
                 <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-700 font-black" style={{ fontFamily: font }}>
                    <User size={14} className="text-emerald-500"/> Jennifer L
                 </div>
                 <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-700 font-black" style={{ fontFamily: font }}>
                    <MapPin size={14} className="text-emerald-500" /> Holbrook, NY
                 </div>
                 <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold leading-relaxed line-clamp-3">
                   Need roof inspection. Possible slab leak detected. Water meter running.
                 </p>
                 <div className="h-10 w-full bg-emerald-500 rounded-xl flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest group-hover:bg-emerald-600 transition-all cursor-pointer">
                   Submit Request
                 </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}