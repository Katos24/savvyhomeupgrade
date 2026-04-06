'use client';

// components/marketing/LeadModalSection.tsx

import { useRef, useState, useEffect } from 'react';
import { Check } from 'lucide-react';

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const POINTS = [
  { tab: 'Overview',  desc: 'Full client info — name, phone, email, address, job description. One tap to call, email, or get directions.' },
  { tab: 'Quote',     desc: 'Build a quote from your templates. AI generates a project brief from their photos and notes. Clients accept with one tap.' },
  { tab: 'Schedule',  desc: 'Set the date and time. Sends a branded confirmation email automatically. No more "when are you coming?" texts.' },
  { tab: 'Payment',   desc: 'Log deposits and final payments. See exactly what\'s owed at a glance. Send payment reminders in one click.' },
];

export default function LeadModalSection() {
      const { ref, visible } = useFadeIn();

  return (
    <section
      id="features"
      className="py-24 px-6"
      style={{ background: '#f9fafb', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}
    >
      <div className="max-w-6xl mx-auto">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}
        >

          {/* LEFT — copy */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#1a6645' }}>
              Every job
            </p>
            <h2
              className="font-black tracking-tight leading-tight mb-4"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', color: '#0f172a' }}
            >
              Everything about<br />a job in one place.
            </h2>
            <p className="text-base font-medium leading-relaxed mb-8" style={{ color: '#6b7280' }}>
              Click any lead to open its full job card. Every tab you need — overview, quote, schedule, payment, tasks, photos, and notes — all in one modal.
            </p>

            <div className="space-y-5">
              {POINTS.map((pt, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-black"
                    style={{ background: '#e8f4ef', color: '#1a6645', marginTop: 1 }}
                  >
                    {pt.tab}
                  </div>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: '#374151' }}>
                    {pt.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — screenshot */}
          <div
            className="relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateX(24px)',
              transition: 'all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s',
            }}
          >
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
            }}>
              <img
                src="/images/modal-overview.png"
                alt="Lead job card showing client info, quote, and schedule tabs"
                className="w-full h-auto block"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}