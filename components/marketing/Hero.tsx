'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ListChecks, Image as ImageIcon } from 'lucide-react';
import { HeroStoryStrip } from '@/components/marketing/HeroStoryStrip';

export default function Hero() {
  return (
    /* Background matches your Settings Showcase #F7F5F0 */
    <section className="relative bg-[#F7F5F0] overflow-hidden pb-12 pt-24 md:pt-32">
      {/* Subtle texture to make it feel premium */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      
      <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-6 z-10">
        <div className="flex flex-col items-center text-center mb-16">
          
          {/* Tag: Using your new Forest Green accent */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a6645]/10 border border-[#1a6645]/20 mb-6">
            <Zap size={12} className="text-[#1a6645] fill-[#1a6645]" />
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#1a6645]">
              For Residential Contractors
            </p>
          </div>

          <h1 className="text-[#0F1F3D] font-[900] tracking-tight leading-[0.95] mb-6 max-w-4xl"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}>
            One job pays for <br className="hidden sm:block" />
            <span className="text-[#1a6645]">
              the whole year.
            </span>
          </h1>

          <p className="text-slate-600 max-w-xl mb-10 text-base sm:text-lg md:text-xl font-medium leading-relaxed px-4">
            Stop paying for "leads." Get the professional system that turns your current traffic into booked jobs.
          </p>

          <div className="flex flex-col items-center gap-8 w-full">
            <Link href="/signup"
              className="group relative inline-flex items-center gap-3 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto justify-center"
              style={{
                fontSize: '1.1rem',
                padding: '1.2rem 3rem',
                background: '#0F1F3D', // Deep Navy from Settings
                boxShadow: '0 20px 40px -12px rgba(15,31,61,0.35)',
              }}>
              Claim Your Branded Link Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {/* Two Links Visualization - Mobile Responsive Grid */}
            <div className="grid grid-cols-1 sm:flex sm:flex-row justify-center gap-4 sm:gap-8 mt-4 w-full sm:w-auto">
              <div className="flex items-center gap-3 bg-white/50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-200 sm:border-0">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                  <ImageIcon size={18} className="text-[#1a6645]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Link 01</p>
                  <p className="text-xs font-bold text-[#0F1F3D] tracking-tight">Your Customer Portal</p>
                </div>
              </div>

              <div className="w-px h-8 bg-slate-300 hidden sm:block self-center" />

              <div className="flex items-center gap-3 bg-white/50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-200 sm:border-0">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                  <ListChecks size={18} className="text-[#1a6645]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">Link 02</p>
                  <p className="text-xs font-bold text-[#0F1F3D] tracking-tight">Management Board</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transition into the Dark Strip - Mobile Fixed Container */}
        <div className="mt-12 sm:mt-24 relative pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-12 rounded-[32px] sm:rounded-[50px] bg-[#020617] border border-white/5 shadow-2xl overflow-hidden">
      
          
          {/* Ensure the story strip doesn't break mobile width */}
          <div className="relative w-full overflow-hidden sm:overflow-visible">
            <HeroStoryStrip />
          </div>
        </div>
      </div>
    </section>
  );
}