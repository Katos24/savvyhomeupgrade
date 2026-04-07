'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck, FileText, ListChecks } from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';
import { FastDemoForm } from '@/components/marketing/FastDemoForm';

export default function Hero() {
  const [currentPhase, setCurrentPhase] = useState<'form' | 'dashboard' | 'outbox'>('form');
  const [leadVisible, setLeadVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let running = true;

    const go = (fn: () => void, ms: number) => {
      if (running) timerRef.current = setTimeout(fn, ms);
    };

    const run = () => {
      if (!running) return;

      // FORM
      setCurrentPhase('form');
      setLeadVisible(false);

      go(() => {
        // DASHBOARD
        setCurrentPhase('dashboard');

        go(() => {
          // OUTBOX
          setCurrentPhase('outbox');
          setLeadVisible(true);

          // LOOP
          go(run, 4000);
        }, 2200);
      }, 3200);
    };

    run();

    return () => {
      running = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-[#020617] flex items-center overflow-hidden pt-20">
      
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#1e293b_0%,transparent_70%)] opacity-50" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />

      <div className="relative w-full max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* LEFT */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <Zap size={14} className="animate-pulse" /> Lead-to-Project OS
            </div>

            <h1 className="text-white font-[950] leading-[0.85] tracking-tight text-[clamp(3.5rem,6vw,7rem)]">
              One Link.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic font-serif pr-4">
                Automation
              </span><br/>
              to Close.
            </h1>

            <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed">
              Scan your QR code or share your link, and our OS{' '}
              <strong className="text-white">auto-fills lead info</strong> and{' '}
              <strong className="text-white">tracks everything on your dashboard</strong>{' '}
              with one-click actions.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto pt-4">
              <Link
                href="/signup"
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all"
              >
                Start Free <ArrowRight size={24} />
              </Link>

              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                <ShieldCheck className="text-emerald-500" size={20} />
                <span className="text-[10px] font-black text-slate-300 uppercase">
                  Verified Outbox
                  <br />
                  <span className="text-slate-500 text-[8px]">No Card Required</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full pt-10 border-t border-white/10">
              <div>
                <FileText className="text-blue-400 mb-2" />
                <p className="text-white font-black text-xs uppercase">Auto-Drafting</p>
              </div>
              <div>
                <ListChecks className="text-emerald-400 mb-2" />
                <p className="text-white font-black text-xs uppercase">Auto-Tasking</p>
              </div>
            </div>
          </div>

          {/* RIGHT — ONE PERSISTENT PHONE */}
          <div className="lg:col-span-6 relative flex justify-center items-center min-h-[650px]">
            <div className="relative w-[260px] aspect-[9/19.5]">

              {/* Glow */}
              <div className="absolute inset-0 blur-2xl bg-blue-500/10 rounded-[3rem]" />

              {/* Phone */}
              <div className="relative w-full h-full rounded-[3rem] border-[6px] border-[#1e293b] bg-[#0f172a] shadow-[0_32px_64px_rgba(0,0,0,0.6)] overflow-hidden">

                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-7 flex justify-center items-end z-20">
                  <div className="w-24 h-5 bg-black rounded-b-2xl" />
                </div>

                {/* SCREEN */}
                <div className="absolute inset-0 pt-6 bg-white overflow-hidden">

                  {/* FORM */}
                  <div
                    className={`absolute inset-0 transition-all duration-700
                    ${currentPhase === 'form' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6 pointer-events-none'}`}
                  >
                    <FastDemoForm autoPlay />
                  </div>

                  {/* DASHBOARD */}
                  <div
                    className={`absolute inset-0 transition-all duration-700 bg-slate-900 text-white px-4 py-4
                    ${currentPhase === 'dashboard' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6 pointer-events-none'}`}
                  >
                    <div className="text-xs font-bold mb-3">Dashboard</div>

                    {/* Animated lead card */}
                    <div
                      className={`transition-all duration-700 delay-200
                      ${currentPhase === 'dashboard' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                    >
                      <div className="bg-slate-700 rounded-xl p-3 text-xs mb-2">
                        Curtis Wilson
                      </div>
                      <div className="bg-slate-700 rounded-xl p-3 text-xs mb-2">
                        Roofing Category
                      </div>
                      <div className="bg-slate-700 rounded-xl p-3 text-xs">
                        42 Maple Ave, NY
                      </div>
                    </div>
                  </div>

                  {/* OUTBOX */}
                  <div
                    className={`absolute inset-0 transition-all duration-700 bg-slate-950
                    ${currentPhase === 'outbox' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  >
                    <CyclingPhoneMockup visible={leadVisible} />
                  </div>

                </div>

                {/* Home bar */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}