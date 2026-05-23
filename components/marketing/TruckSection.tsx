'use client';

import { motion } from 'framer-motion';
import { Globe, QrCode, Share2, Truck, CreditCard, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

const USE_CASES = [
  {
    icon: Globe,
    title: 'Have a website?',
    desc: 'Replace your boring contact forms and dead-end quote buttons instantly.',
  },
  {
    icon: Share2,
    title: 'No website?',
    desc: 'Your custom intake link acts as your complete, professional online presence.',
  },
  {
    icon: QrCode,
    title: 'Truck or yard signs?',
    desc: 'Print your QR code. Passersby scan on their phones, you instantly pull the lead.',
  },
  {
    icon: Users,
    title: 'Social profiles?',
    desc: 'Drop it directly in your bio. One single tap routes leads to your form.',
  },
  {
    icon: CreditCard,
    title: 'Business cards?',
    desc: 'Stamp your unique QR code on the back. Hand them out, capture structured jobs.',
  },
  {
    icon: Truck,
    title: 'Word of mouth?',
    desc: 'Text your clean URL link directly to past clients for easy friend referrals.',
  },
];

export default function DistributionSection() {
  return (
    <section id="distribution" className="relative bg-slate-50 py-24 sm:py-28 lg:py-36 overflow-hidden">
      
      {/* Structural Minimal Canvas Grid */}
      <div
        className="absolute inset-0 opacity-[0.3] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* TOP LAYOUT: Split Header + Asset Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-[50%_50%] gap-12 lg:gap-16 items-center mb-16 sm:mb-24">

          {/* LEFT COLUMN — Brand Messaging */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p
              className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-4"
              style={{ fontFamily: font }}
            >
              One link, everywhere
            </p>
            <h2
              className="text-4xl sm:text-5xl text-slate-900 font-black leading-[1.05] tracking-tight mb-5"
              style={{ fontFamily: font }}
            >
              Where do I <br />
              <span className="text-emerald-600">put it?</span>
            </h2>
            <p
              className="text-slate-600 font-bold text-base sm:text-lg leading-relaxed max-w-md"
              style={{ fontFamily: font }}
            >
              Everywhere your business already exists. Convert passive traffic into structured, detail-rich dashboard entries instantly.
            </p>
          </motion.div>

          {/* RIGHT COLUMN — Premium Media Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.06)] max-w-md mx-auto lg:ml-auto bg-white p-2">
              <div className="rounded-xl overflow-hidden border border-slate-100 relative">
                <Image
                  src="/images/qrbranded2.png"
                  alt="Branded QR code on truck, yard sign, and social media"
                  width={800}
                  height={520}
                  className="w-full h-auto object-cover transition-transform duration-500 hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 450px"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* USE CASE CONTROLS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16 sm:mb-24">
          {USE_CASES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="group bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm hover:border-slate-300 hover:shadow-[0_15px_35px_rgba(15,23,42,0.04)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 transition-colors group-hover:bg-emerald-50 group-hover:border-emerald-100">
                <item.icon size={18} className="text-slate-600 transition-colors group-hover:text-emerald-600" />
              </div>
              <h3
                className="text-slate-900 text-base font-black mb-1.5 tracking-tight"
                style={{ fontFamily: font }}
              >
                {item.title}
              </h3>
              <p
                className="text-slate-500 text-xs sm:text-sm font-bold leading-relaxed"
                style={{ fontFamily: font }}
              >
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* ACTION ZONE: Custom Link Highlight + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-center max-w-2xl mx-auto border-t border-slate-200/60 pt-12"
        >
          {/* Engine URL Browser Bar */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 shadow-sm flex-grow">
            <div className="flex gap-1.5 flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-slate-200" />
              <span className="w-2 h-2 rounded-full bg-slate-200" />
              <span className="w-2 h-2 rounded-full bg-slate-200" />
            </div>
            <span className="text-xs sm:text-sm text-slate-400 font-mono tracking-tight select-none border-l border-slate-100 pl-2 ml-1 truncate">
              lead2project.com/<span className="text-emerald-600 font-black">your-company</span>
            </span>
          </div>

          <Link href="/signup" passHref className="flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 bg-slate-950 hover:bg-slate-900 text-white h-[46px] md:h-full px-7 py-3.5 rounded-xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer shadow-md text-center"
              style={{ fontFamily: font }}
            >
              Get Your Link
              <ArrowRight size={14} strokeWidth={3} />
            </motion.div>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}