'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Check, ArrowRight, Image as ImageIcon,
  Zap, ShieldCheck, FileText, ListChecks, 
  MousePointerClick, ChevronRight
} from 'lucide-react';
import { CyclingPhoneMockup } from '@/components/marketing/CyclingPhoneMockup';

export default function Hero() {
  const [currentPhase, setCurrentPhase] = useState<'scanning' | 'filling' | 'result'>('scanning');
  const [showStep1, setShowStep1] = useState(true);
  const [leadVisible, setLeadVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let running = true;
    const go = (fn: () => void, ms: number) => {
      if (running) timerRef.current = setTimeout(fn, ms);
    };
    
    const run = () => {
      if (!running) return;

      setCurrentPhase('scanning');
      setLeadVisible(false);
      setShowStep1(true);

      go(() => {
        setCurrentPhase('filling');
        
        go(() => {
          setShowStep1(false);
          
          go(() => {
            setCurrentPhase('result');
            
            go(() => {
              setLeadVisible(true);
              go(run, 5000);
            }, 800);
          }, 2500);
        }, 1500);
      }, 3000);
    };
    
    run();
    return () => {
      running = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-[#020617] flex items-center overflow-hidden pt-20">
      
      {/* Backgroundd */}
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic font-serif pr-4">Automation</span><br/>
              to Close.
            </h1>

            <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed">
              Stop manual entry. When a lead scans your truck's QR code, our OS 
              <strong className="text-white"> drafts the quote</strong> and 
              <strong className="text-white"> assigns crew tasks</strong> automatically.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto pt-4">
              <Link href="/signup" className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-blue-500 transition-all">
                Start Free <ArrowRight size={24} />
              </Link>

              <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/10">
                 <ShieldCheck className="text-emerald-500" size={20} />
                 <span className="text-[10px] font-black text-slate-300 uppercase">
                   Verified Outbox
                   <br/>
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

          {/* RIGHT */}
          <div className="lg:col-span-6 relative flex justify-center items-center min-h-[650px]">
            
            <div className="relative w-full max-w-[450px]">

              {/* SCAN */}
              <div className={`absolute inset-0 transition-all duration-1000 
                ${currentPhase === 'scanning' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                
                <div className="relative h-[580px] w-full rounded-[3rem] overflow-hidden border border-white/20">
                  <Image 
                    src="/images/qr-scan-2.png" 
                    alt="Truck QR Scan" 
                    fill 
                    className="object-cover"
                  />
                </div>
              </div>

              {/* FORM */}
              <div className={`absolute inset-0 transition-all duration-1000 
                ${currentPhase === 'filling' ? 'opacity-100 z-30' : 'opacity-0'}`}>
                
                <div className="bg-white rounded-[2.5rem] p-8 space-y-4">
                  {showStep1 ? (
                    <>
                      <div className="p-4 bg-slate-100 rounded-xl">Curtis Wilson</div>
                      <div className="p-4 bg-blue-100 rounded-xl">Roofing Category</div>
                      <div className="w-full py-4 bg-blue-600 text-white rounded-xl flex justify-center gap-2">
                        Next Step <ChevronRight size={14}/>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-100 rounded-xl">42 Maple Ave, NY</div>
                      <div className="border-2 border-dashed rounded-xl py-8 flex flex-col items-center">
                        <ImageIcon />
                        <span>Photo Attached</span>
                      </div>
                      <button className="w-full py-4 bg-emerald-500 text-white rounded-xl flex justify-center gap-2">
                        <Check /> Submitted
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* RESULT */}
              <div className={`absolute inset-0 transition-all duration-1000 flex flex-col items-center
                ${currentPhase === 'result' ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none'}`}>
                
                <CyclingPhoneMockup visible={leadVisible} />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}