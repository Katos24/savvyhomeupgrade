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
  },
  {
    pain: 'Your competitor just sent a branded quote in 30 seconds. You\'re still typing yours.',
    painSub: 'While you\'re writing emails from scratch, they already closed the deal.',
    fix: 'Branded emails. Quote templates. One click. The homeowner picks the pro who looks like a pro.',
    color: 'bg-emerald-500',
    borderColor: 'border-emerald-400',
  },
];

export default function ValueSection() {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20 bg-slate-950">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2
            className="text-3xl sm:text-4xl text-white mb-3 leading-tight"
            style={{ fontFamily: font, fontWeight: 900 }}
          >
            Time Is Money.
            <br />
            <span className="text-yellow-400">You're Wasting Both.</span>
          </h2>
        </motion.div>

        {/* Cards — stacked, no images */}
        <div className="space-y-5">
          {PAIN_POINTS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className="bg-slate-900 rounded-2xl border-3 border-slate-800 overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                style={{ borderWidth: '3px' }}
              >
                <div className="px-6 sm:px-8 pt-6 sm:pt-7 pb-4">
                  <p
                    className="text-xl sm:text-2xl text-white mb-1.5 leading-snug"
                    style={{ fontFamily: font, fontWeight: 900 }}
                  >
                    {item.pain}
                  </p>
                  <p
                    className="text-sm text-slate-500"
                    style={{ fontFamily: font, fontWeight: 700 }}
                  >
                    {item.painSub}
                  </p>
                </div>
                <div
                  className={`${item.color} px-6 sm:px-8 py-4 border-t-3 ${item.borderColor}`}
                  style={{ borderTopWidth: '3px' }}
                >
                  <p className="text-sm text-white leading-relaxed" style={{ fontFamily: font, fontWeight: 800 }}>
                    {item.fix}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-yellow-400 px-8 sm:px-10 py-4 rounded-2xl border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
            >
              <span
                className="text-lg text-slate-900 uppercase"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Start Free
              </span>
              <ArrowRight size={20} strokeWidth={3} className="text-slate-900" />
            </motion.div>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}