'use client';

// components/marketing/ValueStrip.tsx

import { useRef, useState, useEffect } from 'react';

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

const STATS = [
  {
    value: '8 hrs',
    label: 'saved every week',
    desc: 'No more back-and-forth texts to schedule jobs. One click confirms the appointment and sends the customer a branded email.',
  },
  {
    value: '$11k',
    label: 'avg collected in week one',
    desc: 'Seeing every unpaid balance in one place makes it easy to send reminders and collect money sitting on the table.',
  },
  {
    value: '3 min',
    label: 'to send a quote',
    desc: 'Templates plus AI project brief. Build and send a professional quote before you even start your truck.',
  },
  {
    value: '0',
    label: 'missed leads',
    desc: 'Every QR scan, every form submission, every call lands on your dashboard instantly. Nothing falls through the cracks.',
  },
];

export default function ValueStrip() {
  const { ref, visible } = useFadeIn();

  return (
    <section className="py-20 px-6" style={{ background: '#ffffff', borderBottom: '1px solid #f3f4f6' }}>
      <div className="max-w-6xl mx-auto">

        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.08}s`,
              }}
            >
              <p
                className="font-black mb-1 leading-none"
                style={{ fontSize: 'clamp(36px, 5vw, 52px)', color: '#1a6645' }}
              >
                {stat.value}
              </p>
              <p className="text-sm font-black uppercase tracking-widest mb-3" style={{ color: '#0f172a' }}>
                {stat.label}
              </p>
              <p className="text-sm font-medium leading-relaxed" style={{ color: '#6b7280' }}>
                {stat.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}