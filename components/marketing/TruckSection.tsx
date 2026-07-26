'use client';

import { motion } from 'framer-motion';
import {
  QrCode,
  Facebook,
  Instagram,
  CreditCard,
  Star,
  ArrowRight,
  Check
} from 'lucide-react';
import Image from 'next/image';

const font = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

function GoogleProfileMockup() {
  return (
    <div className="w-full bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
          <GoogleLogo className="w-4.5 h-4.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-bold text-slate-900 truncate">Ridge Line Roofing</p>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="text-amber-400" fill="currentColor" />
            ))}
            <span className="text-[10px] font-semibold text-slate-500 ml-1">4.9 (124 reviews)</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-2.5 space-y-2">
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-[11px] font-medium text-slate-500">Primary Booking Link</span>
          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
            Quote Form <ArrowRight size={11} />
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-700">
          <span className="text-[11px] font-medium text-slate-500">Direct Actions</span>
          <span className="text-[11px] font-bold text-teal-700">Schedule Job</span>
        </div>
      </div>
    </div>
  );
}

const OTHER_CHANNELS = [
  { label: 'Instagram Bio Link', icon: Instagram, color: 'text-pink-600', badge: 'Active' },
  { label: 'Facebook Page Callout', icon: Facebook, color: 'text-blue-600', badge: 'Active' },
  { label: 'Printed Business Cards', icon: CreditCard, color: 'text-emerald-600', badge: 'QR Ready' },
  { label: 'Yard Signs & Vehicle Decals', icon: QrCode, color: 'text-amber-600', badge: 'QR Ready' },
];

export default function TruckSection() {
  return (
    <section
      id="distribution"
      style={{ fontFamily: font }}
      className="relative bg-slate-100 py-16 sm:py-24 overflow-hidden border-b border-slate-300/70"
    >
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-50 px-3 py-1 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-teal-600" />
            <span className="text-xs font-black text-teal-800 uppercase tracking-wide">
              What Happens After You Sign Up
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-slate-900 font-black tracking-tight leading-[1.1] text-3xl sm:text-5xl mb-4"
          >
            Get your link and{' '}
            <span className="text-teal-700 block sm:inline">QR code out there.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-slate-700 font-semibold text-base sm:text-lg"
          >
            So customers can fill out your form and book the job, wherever they see you.
          </motion.p>
        </div>

        {/* Main Section Outer Card */}
        <div className="p-4 sm:p-6 bg-slate-200/80 border-2 border-slate-300 rounded-3xl shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-stretch">
            
            {/* Featured Showcase Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl overflow-hidden border border-slate-300 bg-white shadow-md group min-h-[320px] flex items-center justify-center"
            >
              <Image
                src="/images/qrbranded2.webp"
                alt="Ridge Line Roofing QR code and booking link presentation"
                width={1920}
                height={1300}
                className="w-full h-full object-cover"
                priority
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-slate-200 px-3 py-1 rounded-lg shadow-sm">
                <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-600 stroke-[3]" /> Print & Digital Sync
                </span>
              </div>
            </motion.div>

            {/* Channels Sidebar Stack */}
            <div className="flex flex-col gap-4 justify-between">
              
              {/* Google Business Profile Block */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="rounded-2xl border border-slate-300 bg-slate-100 p-4"
              >
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                    Google Integration
                  </span>
                  <span className="text-[10px] font-bold text-teal-800 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-md">
                    Verified
                  </span>
                </div>
                <GoogleProfileMockup />
              </motion.div>

              {/* Connected Channels List */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="rounded-2xl border border-slate-300 bg-slate-100 p-4 flex flex-col gap-2"
              >
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 px-0.5">
                  Connected Touchpoints
                </span>

                {OTHER_CHANNELS.map((channel) => (
                  <div
                    key={channel.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <channel.icon size={14} className={channel.color} />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{channel.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                      {channel.badge}
                    </span>
                  </div>
                ))}
              </motion.div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}