'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Play, User, MapPin, Phone, Mail, QrCode, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function ArchitectHero() {
  return (
    <section className="relative bg-white pt-20 lg:pt-44 pb-20 lg:pb-32 overflow-hidden">
      
      {/* 1. BACKGROUND TEXTURE */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      
      {/* 2. THE DESK SURFACE: Creates that "grounded" table look from the image */}
      <div className="absolute bottom-0 left-0 right-0 h-48 lg:h-80 bg-gradient-to-t from-slate-100/60 to-transparent -z-10" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] gap-8 lg:gap-8 items-start">
          
          {/* LEFT CONTENT: Top on Mobile */}
          <div className="flex flex-col items-start text-left space-y-6 lg:space-y-10 z-30">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600"
            >
              <QrCode size={14} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ fontFamily: font }}>
                QR → Lead → Job Workflow
              </span>
            </motion.div>

            <div className="space-y-4 lg:space-y-6">
              <h1 className="text-slate-900 text-4xl sm:text-7xl lg:text-[7rem] leading-[1.1] lg:leading-[0.9] tracking-tight font-black" style={{ fontFamily: font }}>
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
                <div className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-800 text-white px-10 py-5 rounded-2xl font-black uppercase transition-all shadow-xl">
                  Get Your QR System
                  <ArrowRight size={20} strokeWidth={3} />
                </div>
              </Link>
              <Link href="/demo" className="group">
                <div className="flex items-center justify-center gap-3 px-8 py-5 text-slate-900 font-black uppercase text-xs tracking-widest transition-colors">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  </div>
                  Watch Demo
                </div>
              </Link>
            </div>
          </div>

          {/* RIGHT VISUALS: Laptop + Intake Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-start items-center h-auto lg:h-[600px] my-10 lg:my-0"
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-emerald-100/30 blur-[80px] rounded-full -z-10 scale-90" />

            {/* LAPTOP CONTAINER */}
            <div
              className="relative w-[115%] lg:w-[125%] lg:-ml-24 z-10"
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

              {/* 3. CONTACT SHADOW: This makes the laptop sit on the "Desk" */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[85%] h-12 bg-slate-900/15 blur-[80px] rounded-full -z-10" />
            </div>

            {/* PHONE: Intake Form with Media Thumbnail */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute right-[-2%] bottom-[-15%] lg:right-[-30px] lg:top-1/2 lg:-translate-y-1/2 w-[180px] sm:w-[230px] bg-white rounded-[1.8rem] lg:rounded-[2.2rem] shadow-2xl border-4 border-white z-20"
            >
              <div className="bg-slate-900 px-4 py-3 text-white rounded-t-[1.6rem] lg:rounded-t-[2rem]">
                <p className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest">New Lead · Leak Detection</p>
              </div>
              
              <div className="p-3 lg:p-5 space-y-3 bg-white">
                 <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[9px] lg:text-[11px] text-slate-700 font-bold">
                        <User size={12} className="text-emerald-500" /> Jennifer L
                    </div>
                    <div className="flex items-center gap-2 text-[9px] lg:text-[11px] text-slate-600 font-bold">
                        <Phone size={12} className="text-slate-400" /> (631) 555-0192
                    </div>
                 </div>

                 {/* ATTACHED MEDIA SECTION */}
                 <div className="space-y-1.5">
                    <p className="text-[7px] lg:text-[8px] font-black uppercase text-slate-400 tracking-wider">Attached Media</p>
                    <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-100">
                      <Image 
                        src="/images/roof-damage.webp" 
                        alt="Attached Roof Damage" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute top-1.5 right-1.5 bg-slate-900/80 backdrop-blur-sm text-[7px] text-white px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                        <Check size={8} className="text-emerald-400" /> Imported
                      </div>
                    </div>
                    <p className="text-[8px] text-slate-400 font-bold truncate">roof-damage.webp</p>
                 </div>

                 <div className="flex items-center gap-2 text-[9px] lg:text-[11px] text-slate-600 font-bold">
                    <MapPin size={12} className="text-emerald-500" /> Holbrook, NY
                 </div>
                 
                 <p className="text-[8px] lg:text-[10px] text-slate-500 font-medium leading-tight">
                    Possible slab leak detected. Water meter running overnight.
                 </p>

                 <div className="h-8 lg:h-10 w-full bg-emerald-500 rounded-lg lg:rounded-xl flex items-center justify-center text-white text-[9px] lg:text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                   Submit Request
                 </div>
              </div>
            </motion.div>
          </motion.div>

          {/* MOBILE ONLY: Buttons & Subtext below Image */}
          <div className="flex lg:hidden flex-col items-center text-center space-y-6 pt-12">
            <p className="text-slate-600 text-base font-bold leading-relaxed max-w-sm" style={{ fontFamily: font }}>
              Customers submit through your branded QR form while your team manages everything.
            </p>
            <div className="flex flex-col gap-4 w-full">
              <Link href="/signup">
                <div className="flex items-center justify-center gap-3 bg-slate-950 text-white px-8 py-5 rounded-2xl font-black uppercase shadow-xl">
                  Get Your QR System <ArrowRight size={18} />
                </div>
              </Link>
              <Link href="/demo">
                <div className="flex items-center justify-center gap-3 text-slate-900 font-black uppercase text-[11px] tracking-widest">
                   Watch Demo
                </div>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}