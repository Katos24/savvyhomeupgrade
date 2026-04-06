'use client';

import { useRef, useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ClipboardList, 
  FileText, 
  Calendar, 
  CreditCard,
  Zap,
  ArrowRight
} from 'lucide-react';

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { 
        if (entry.isIntersecting) { 
          setVisible(true); 
          observer.disconnect(); 
        } 
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  
  return { ref, visible };
}

const POINTS = [
  { 
    tab: 'Overview', 
    icon: <ClipboardList size={18} />, 
    desc: 'Full client info—name, phone, and address. One tap to call, email, or get GPS directions to the job site.' 
  },
  { 
    tab: 'Quote', 
    icon: <Zap size={18} />, 
    desc: 'AI generates a project brief from customer notes. Build quotes from your custom templates and send for instant approval.' 
  },
  { 
    tab: 'Schedule', 
    icon: <Calendar size={18} />, 
    desc: 'Set the date and sync it. Automatically sends a branded confirmation email so you stop getting "Are you coming?" texts.' 
  },
  { 
    tab: 'Payment', 
    icon: <CreditCard size={18} />, 
    desc: 'Track deposits and balances. Send professional payment reminders in one click and see your cash flow at a glance.' 
  },
];

export default function LeadModalSection() {
  const { ref, visible } = useFadeIn();

  return (
    <section
      id="features"
      className="py-16 lg:py-24 px-4 sm:px-6 bg-slate-50 border-y border-slate-200"
    >
      <div className="max-w-7xl mx-auto">
        <div
          ref={ref}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-1000 ease-out ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          
          {/* LEFT — COPY */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 border border-green-200 mb-6">
              <CheckCircle2 size={12} className="text-green-700" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-700">
                Centralized Control
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] mb-6 text-slate-900">
              The only "Job Card" <br />
              you'll ever need.
            </h2>
            
            <p className="text-lg font-medium leading-relaxed text-slate-500 mb-10 max-w-xl">
              Tapping a lead opens a full command center. Every detail—from AI briefs to payment status—is organized into a single, simple view.
            </p>

            <div className="grid gap-6">
              {POINTS.map((pt, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#1a6645] group-hover:bg-green-50 transition-colors">
                    {pt.icon}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                      {pt.tab}
                    </h3>
                    <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-600">
                      {pt.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-slate-200">
              <button className="flex items-center gap-2 font-black text-[#1a6645] hover:gap-3 transition-all">
                Learn about custom categories
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* RIGHT — SCREENSHOT */}
          <div className={`order-1 lg:order-2 transition-all duration-1000 delay-200 ease-out ${
            visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
          }`}>
            <div className="relative">
              {/* Decorative background element */}
              <div className="absolute -inset-4 bg-green-200/30 rounded-[32px] blur-2xl -z-10" />
              
              <div className="rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.18)] border border-slate-200 bg-white">
                <img
                  src="/images/modal-overview.png"
                  alt="Lead2Project Job Card Modal"
                  className="w-full h-auto block"
                />
              </div>

              {/* Floating Status Badge (Mobile Hidden or Tablet+) */}
              <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter text-nowrap">Accepted Quote</p>
                  <p className="text-xs font-bold text-slate-900">$4,250.00 — Paid</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}