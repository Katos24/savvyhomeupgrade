'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Hammer, ShieldCheck, Zap } from 'lucide-react';

interface StoryBlock {
  badge: string;
  icon: React.ReactNode;
  headline: string;
  desc: string;
  bullets: string[];
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
}

const BLOCKS: StoryBlock[] = [
  {
    badge: 'LEAD CAPTURE',
    icon: <Zap size={20} className="text-slate-950 fill-yellow-400" />,
    headline: 'YOUR TRUCK IS NOW A LEAD MACHINE.',
    desc: 'Most yard signs get eyeballs but not calls. Lead2Project turns every truck and sign into a digital intake form that works while you’re on the roof.',
    bullets: [
      'Custom branded QR decals',
      'Direct-to-board photo uploads',
'Real-time board updates',
    ],
    imageSrc: '/images/qrbranded2.webp',
    imageAlt: 'QR code decals on a work truck',
  },
  {
    badge: 'JOB MANAGEMENT',
    icon: <Hammer size={20} className="text-slate-950" />,
    headline: 'COMMAND THE FIELD IN REAL-TIME.',
desc: 'Stop using napkins and notes. Every lead lands on a visual board. Switch between card, table, and calendar views. Mass-edit from the table in seconds.',
    bullets: [
'Card, Table & Calendar Views',
      '1-Click Quote Approvals',
      '1-Click Payment Reminders',
    ],
    imageSrc: '/images/og-image.webp',
    imageAlt: 'Lead2Project job management dashboard',
    reverse: true,
  },
  {
    badge: 'PRO STATUS',
    icon: <ShieldCheck size={20} className="text-slate-950" />,
    headline: 'STOP CHASING. START OWNING.',
    desc: 'The guy texting quotes at 9 PM loses. You send professional, branded emails that track opens and clicks automatically. Look bigger than you are.',
    bullets: [
      'Automatic Outbox Tracking',
      'Daily 6AM Strategy Digest',
      'Branded Contractor Templates',
    ],
    imageSrc: '/images/marketing.webp',
    imageAlt: 'Contractor using a tablet to send quotes',
  },
];

export default function IndustrialWhySection() {
  const heavyFont = "font-[1000] tracking-tighter uppercase leading-[0.9] sm:leading-[0.85]";

  return (
    <section className="bg-[#f8f9fa] py-16 sm:py-36 overflow-hidden relative">
      
      {/* ─── THE "I-BEAM" SPINE (Structural Backbone) ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full hidden lg:block pointer-events-none">
        <div className="w-full h-full bg-slate-200 border-x-2 border-slate-300 relative">
            {/* Rivet Details */}
            <div className="absolute top-0 w-full flex flex-col items-center gap-24 opacity-20">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                ))}
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-10 relative z-10">
        
        {/* Header */}
        <div className="mb-24 sm:mb-32">
          <div className="flex items-center gap-3 mb-6">
            
          </div>
          <h2 className={`${heavyFont} text-5xl sm:text-9xl text-slate-950 italic`}>
            CORE <span className="text-emerald-600">PILLARS.</span>
          </h2>
        </div>

        {/* Pillars Blocks */}
        <div className="space-y-32 sm:space-y-48 relative">
          {BLOCKS.map((block, i) => (
            <div 
              key={i}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-center relative"
            >
              {/* STRUCTURAL CONNECTOR (Joint) */}
              <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-1/2 h-[2px] bg-slate-300 -z-10 ${block.reverse ? 'left-0' : 'right-0'}`} />
              <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 border-2 border-slate-950 rotate-45 z-20" />

              {/* Content Side */}
              <div className={`${block.reverse ? 'lg:order-2' : 'lg:order-1'} flex flex-col items-start`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-slate-950 text-white px-4 py-1 text-[10px] font-black tracking-widest uppercase italic">
                    Pillar {i+1}
                  </div>
                </div>

                <h3 className={`${heavyFont} text-3xl sm:text-6xl text-slate-950 mb-6 sm:mb-8`}>
                  {block.headline}
                </h3>

                <p className="text-base sm:text-xl text-slate-600 font-bold leading-relaxed mb-8 sm:mb-10 max-w-xl">
                  {block.desc}
                </p>

                <div className="grid grid-cols-1 gap-4 w-full mb-10">
                  {block.bullets.map((bullet, j) => (
                    <div key={j} className="flex items-start gap-4 group">
                      <div className="w-1.5 h-1.5 bg-emerald-500 mt-2 rotate-45 shrink-0" />
                      <span className="text-sm sm:text-lg font-black text-slate-800 uppercase tracking-tight leading-tight">
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center group bg-slate-950 p-1 pr-6 hover:bg-emerald-600 transition-colors duration-300"
                >
                  <div className="bg-yellow-400 text-slate-950 p-3 sm:p-4 mr-4">
                    <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                  <span className="text-lg sm:text-xl font-[1000] text-white uppercase tracking-tighter">
                    Get Started Today
                  </span>
                </Link>
              </div>

              {/* Image Side */}
              <div className={`${block.reverse ? 'lg:order-1' : 'lg:order-2'} w-full`}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative group mx-auto max-w-[500px] lg:max-w-none"
                >
                  <div className="relative overflow-hidden border-[4px] border-slate-950 shadow-[15px_15px_0px_#020617] aspect-[4/3] bg-white">
                    <img
                      src={block.imageSrc}
                      alt={block.imageAlt}
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}