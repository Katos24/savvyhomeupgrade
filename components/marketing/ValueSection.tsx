'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const font = "'Nunito', sans-serif";

const PAIN_POINTS = [
  {
    pain: 'You drove 45 minutes for a job that was never gonna close.',
    painSub: 'No photos. No budget. No details. Just a "can you come take a look?"',
    fix: 'What if you saw the job site, the damage, and the budget before you started the truck?',
    color: 'bg-orange-500',
    borderColor: 'border-orange-400',
    image: '/images/morning-brief.webp',
  },
  {
    pain: 'Your leads are in 6 different places. Half of them are already gone.',
    painSub: 'Texts. Voicemails. Facebook DMs. That napkin in your center console.',
    fix: 'One dashboard. Every lead. Nothing falls through the cracks ever again.',
    color: 'bg-blue-500',
    borderColor: 'border-blue-400',
    image: '/images/marketing-quote.webp',
  },
  {
    pain: 'Your competitor just sent a branded quote in 30 seconds. You\'re still typing yours.',
    painSub: 'While you\'re writing emails from scratch, they already closed the deal.',
    fix: 'Branded emails. Quote templates. One click. The homeowner picks the pro who looks like a pro.',
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
    image: '/images/quote-send-tablet.webp',
  },
];

export default function ValueSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-24 bg-slate-950">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl text-white mb-3 leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Time Is Money.
            <br />
            <span className="text-yellow-400">You're Wasting Both.</span>
          </h2>
          <p
            className="text-base sm:text-lg text-slate-400"
            style={{ fontFamily: font, fontWeight: 700 }}
          >
            Every hour you spend chasing bad leads is an hour you're not closing real ones.
          </p>
        </motion.div>

        {/* Mobile: horizontal scroll - FIXED HEIGHT ISSUES */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-8 lg:hidden -mx-5 px-5 items-stretch">
          {PAIN_POINTS.map((item, i) => (
            <div
              key={i}
              className="min-w-[88%] snap-center bg-slate-900 rounded-2xl border-3 border-slate-800 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] flex flex-col"
              style={{ borderWidth: '3px' }}
            >
              <div className="h-40 shrink-0 bg-slate-800">
                <img
                  src={item.image}
                  className="h-full w-full object-cover"
                  alt=""
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p
                  className="text-lg text-white mb-1.5 leading-snug"
                  style={{ fontFamily: font, fontWeight: 900 }}
                >
                  {item.pain}
                </p>
                <p
                  className="text-xs text-slate-500 mb-4"
                  style={{ fontFamily: font, fontWeight: 700 }}
                >
                  {item.painSub}
                </p>
                {/* MT-AUTO ensures the fix box always aligns to bottom of the card */}
                <div className={`${item.color} px-4 py-3 rounded-xl border-2 ${item.borderColor} mt-auto`}>
                  <p className="text-[11px] text-white leading-relaxed" style={{ fontFamily: font, fontWeight: 800 }}>
                    {item.fix}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: alternating image/text */}
        <div className="hidden lg:block space-y-8">
          {PAIN_POINTS.map((item, i) => {
            const imageRight = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div
                  className="grid grid-cols-2 bg-slate-900 rounded-3xl border-3 border-slate-800 overflow-hidden shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)]"
                  style={{ borderWidth: '3px' }}
                >
                  <div className={`flex flex-col justify-between ${imageRight ? 'order-1' : 'order-2'}`}>
                    <div className="px-10 pt-8 pb-4">
                      <p
                        className="text-2xl text-white mb-2 leading-snug"
                        style={{ fontFamily: font, fontWeight: 900 }}
                      >
                        {item.pain}
                      </p>
                      <p
                        className="text-base text-slate-500"
                        style={{ fontFamily: font, fontWeight: 700 }}
                      >
                        {item.painSub}
                      </p>
                    </div>
                    <div
                      className={`${item.color} px-10 py-5 border-t-3 ${item.borderColor}`}
                      style={{ borderTopWidth: '3px' }}
                    >
                      <p className="text-sm text-white leading-relaxed" style={{ fontFamily: font, fontWeight: 800 }}>
                        {item.fix}
                      </p>
                    </div>
                  </div>

                  <div className={`${imageRight ? 'order-2' : 'order-1'} bg-slate-800`}>
                    <img
                      src={item.image}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 text-center"
        >
          <p
            className="text-lg sm:text-xl text-white mb-6"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Your competitors are already using this.
            <br />
            <span className="text-yellow-400">How long are you gonna wait?</span>
          </p>
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-yellow-400 px-8 sm:px-10 py-4 rounded-2xl border-4 border-slate-900 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]"
            >
              <span
                className="text-lg sm:text-xl text-slate-900 uppercase"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Start Free
              </span>
              <ArrowRight size={22} strokeWidth={3} className="text-slate-900" />
            </motion.div>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}