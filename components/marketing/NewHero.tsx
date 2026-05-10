'use client';
import Link from 'next/link';
import { ArrowRight, Camera, Zap, Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const font = "'Nunito', sans-serif";

const VALUE_PROPS = [
  { icon: Camera, text: 'See the job before you drive' },
  { icon: Zap, text: 'Leads delivered instantly' },
  { icon: Shield, text: 'No more tire-kickers' },
  { icon: Star, text: '100% your brand' },
];

export default function NewHero() {
  return (
    <section className="relative overflow-hidden bg-white pt-32 pb-16 sm:pb-20">
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-10 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-10" />
      <div className="absolute bottom-10 left-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl opacity-10" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-5 sm:px-6 text-center">

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-slate-900 text-4xl sm:text-5xl lg:text-6xl mb-5 leading-tight"
          style={{ fontFamily: font, fontWeight: 900 }}
        >
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Your Form.
          </motion.span>{' '}
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            Your Logo.
          </motion.span>
          <br />
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="relative inline-block text-emerald-500"
          >
            Your Questions.
            <motion.div
              className="absolute -bottom-1 left-0 right-0 h-2 bg-emerald-500/15 rounded-full -z-10"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{ transformOrigin: 'left' }}
            />
          </motion.span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-700 mb-6 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: font, fontWeight: 800 }}
        >
          Stop chasing bad leads. Get job details, photos, and qualified customers — before you ever pick up the phone.
        </motion.p>

        {/* Value prop pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 max-w-3xl mx-auto"
        >
          {VALUE_PROPS.map((prop, i) => (
            <motion.div
              key={prop.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-50 rounded-full border-2 border-slate-200"
            >
              <prop.icon size={14} className="text-emerald-500 shrink-0" />
              <span className="text-xs sm:text-sm text-slate-700" style={{ fontFamily: font, fontWeight: 700 }}>
                {prop.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center mb-6"
        >
          <Link href="/signup">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 bg-emerald-500 px-10 py-4 rounded-2xl border-4 border-slate-900 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)]"
            >
              <span
                className="text-xl text-white uppercase"
                style={{ fontFamily: font, fontWeight: 900 }}
              >
                Start Free
              </span>
              <ArrowRight size={24} strokeWidth={3} className="text-white" />
            </motion.div>
          </Link>

          <Link href="/demo">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 rounded-2xl border-3 border-slate-900 text-slate-900 text-lg hover:bg-slate-900 hover:text-white transition-all"
              style={{ fontFamily: font, fontWeight: 900, borderWidth: '3px' }}
            >
              Live Demo
            </motion.div>
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-slate-500"
          style={{ fontFamily: font, fontWeight: 800 }}
        >
          Free to start · No credit card required · Set up in under 5 minutes
        </motion.p>
      </div>
    </section>
  );
}