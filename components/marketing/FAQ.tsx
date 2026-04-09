'use client';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useFadeIn } from '@/components/marketing/hooks';

const faqs = [
  {
    q: 'Do my customers need to download an app?',
    a: 'No. They scan your QR code and your form opens directly in their browser. No download, no account, no friction. Works on every phone.',
  },
  {
    q: 'Can I customize what the form asks?',
    a: 'Yes. Toggle fields on or off — address, preferred date, photos, custom questions. Your form, your rules. Changes go live instantly.',
  },
  {
    q: 'How does the AI quote generator work?',
    a: 'When a customer uploads photos, our AI analyzes the images and drafts line items based on your templates. You review every number before anything gets sent.',
  },
  {
    q: "What's the difference between Basic and Pro?",
    a: 'Basic covers your full digital storefront — QR code, lead board, scheduling, and quoting. Pro adds AI tools: quote generation from photos, project briefs for crews, a daily digest email, and the full email outbox.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. No contracts, no cancellation fees. One click from your account settings. Your data is yours and exportable anytime.',
  },
];

export default function FAQ() {
  const { ref, visible } = useFadeIn();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#F7F5F0] border-t border-[#E5E0D8]">
      <div className="max-w-2xl mx-auto">
        <div
          ref={ref}
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: '#1a6645' }}>FAQ</p>
<h2 className="font-black text-slate-900" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 0.95, letterSpacing: '-0.03em' }}>Quick answers.</h2>
          </div>

          {/* Questions */}
          <div className="space-y-2">
            {faqs.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border overflow-hidden transition-all duration-300"
                  style={{
                    background: isOpen ? '#fff' : '#fff',
                    borderColor: isOpen ? '#0F1F3D20' : '#E5E0D8',
                    boxShadow: isOpen ? '0 4px 20px rgba(15,31,61,0.08)' : 'none',
                  }}
                >
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  >
                    <span className="font-black text-slate-900 text-[14px] leading-snug">{faq.q}</span>
                    <div
                      className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-all duration-300"
                      style={{ background: isOpen ? '#0F1F3D' : '#f1f5f9' }}
                    >
                      {isOpen
                        ? <Minus size={11} className="text-white" strokeWidth={3} />
                        : <Plus size={11} className="text-slate-500" strokeWidth={3} />
                      }
                    </div>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isOpen ? 200 : 0 }}
                  >
<p className="px-5 pb-4 text-slate-400 text-[13px] font-normal leading-loose">{faq.a}</p>                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}