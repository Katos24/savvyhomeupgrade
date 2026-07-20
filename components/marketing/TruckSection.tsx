'use client';

import { motion } from 'framer-motion';
import { Globe, QrCode, Facebook, Instagram, CreditCard, Star, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const font = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

function GoogleProfileMockup() {
  return (
    <div className="w-full max-w-[260px] mx-auto bg-white rounded-2xl shadow-xl p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <GoogleLogo className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-black text-slate-900 truncate">Ridge Line Roofing</p>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={9} className="text-amber-400" fill="currentColor" />
            ))}
            <span className="text-[9px] font-bold text-slate-400 ml-1">4.9 (124 reviews)</span>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500">Website</span>
          <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
            Request a Quote <ArrowRight size={10} />
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500">Appointments</span>
          <span className="text-[10px] font-black text-blue-600">Schedule Job</span>
        </div>
      </div>
    </div>
  );
}

const OTHER_CHANNELS = [
  { label: 'Instagram bio', icon: Instagram, color: 'text-pink-400' },
  { label: 'Facebook page', icon: Facebook, color: 'text-blue-400' },
  { label: 'Business cards', icon: CreditCard, color: 'text-slate-300' },
];

export default function TruckSection() {
  return (
    <section
      id="distribution"
      style={{ fontFamily: font }}
      className="relative bg-[#0B1220] py-20 sm:py-28 overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-xl font-black text-white">
            2
          </span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            Blast your link everywhere
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-white font-black tracking-tight leading-[1.05] text-4xl sm:text-5xl mb-4 max-w-2xl"
        >
          Share your link and QR code — <span className="text-emerald-400">put it everywhere.</span>
        </motion.h2>

        <p className="text-slate-400 font-bold text-sm sm:text-base max-w-xl mb-12">
          Truck decals, yard signs, social posts — one link and QR code work everywhere you can put them.
        </p>

        {/* Hero image + Google Profile side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 mb-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <Image
              src="/images/qrbranded2.webp"
              alt="Ridge Line Roofing QR code and booking link shown on a truck decal, yard sign, and social media post"
              width={1920}
              height={1300}
              className="w-full h-auto"
              priority
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 text-center">
              Google Business Profile
            </p>
            <GoogleProfileMockup />
          </motion.div>
        </div>

        {/* Lightweight supporting row for the rest */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {OTHER_CHANNELS.map((channel) => (
            <div
              key={channel.label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/10">
                <channel.icon size={14} className={channel.color} />
              </div>
              <span className="text-xs font-bold text-slate-300">{channel.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}