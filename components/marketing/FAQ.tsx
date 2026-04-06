
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 9 — FAQ
// Status: Ready. Add / remove questions as needed.
// ─────────────────────────────────────────────────────────────────────────────
'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks'

function FAQ() {
  const { ref, visible } = useFadeIn();
  const [open, setOpen] = useState<number | null>(null);

  const faqs = [
    { q: 'Do my customers need to download an app?', a: 'No. They scan your QR code and your form opens directly in their phone\'s browser. No download, no account, no friction.' },
    { q: 'Can I customize what the form asks?',       a: 'Yes. You control which fields are shown — service type, address, preferred date, photos, custom questions. Turn them on or off anytime.' },
    { q: 'How does the AI quote generator work?',     a: 'When a customer uploads photos of their project, our AI analyzes the images and drafts line items with estimated pricing based on your templates. You review every number before sending.' },
    { q: 'What\'s the difference between Starter and Pro?', a: 'Starter covers customer intake, lead tracking, and basic organization. Pro adds full project management, AI tools (quotes, briefs, assistant), scheduling, and the Daily Digest.' },
    { q: 'Can I cancel anytime?',                     a: 'Yes. No contracts, no cancellation fees. Cancel from your account settings with one click. Your data is yours and exportable anytime.' },
  ];

  return (
    <section className="py-28 px-6 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto">
        <div
          ref={ref}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
        >
          <div className="text-center mb-16">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mb-4">FAQ</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Quick answers.</h2>
          </div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-[15px] pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                {open === i && (
                  <div className="px-6 pb-5">
                    <p className="text-slate-500 text-[15px] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


export default FAQ;