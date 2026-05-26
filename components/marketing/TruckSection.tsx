'use client';

import { motion } from 'framer-motion';
import { Globe, QrCode, Share2, Truck, CreditCard, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

const USE_CASES = [
  { icon: Globe, title: 'Your Website', desc: 'Replace dead-end forms with your high-conversion intake engine.' },
  { icon: Share2, title: 'Social Profiles', desc: 'Drop the link in your bio to turn followers into active projects.' },
  { icon: QrCode, title: 'Yard Signs', desc: 'Passersby scan and start a lead inquiry in seconds.' },
  { icon: Users, title: 'Referrals', desc: 'Text your URL to past clients for seamless friend referrals.' },
  { icon: CreditCard, title: 'Business Cards', desc: 'Stamp your unique QR on the back. Lead capture anywhere.' },
  { icon: Truck, title: 'Vehicle Wraps', desc: 'Turn your truck into a 24/7 lead-generation machine.' },
];

export default function DistributionSection() {
  return (
    <section id="distribution" className="relative bg-slate-50 py-16 sm:py-24 lg:py-36 overflow-hidden">
      
      {/* Structural Minimal Canvas Grid */}
      <div className="absolute inset-0 opacity-[0.3] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* TOP LAYOUT: Split Header + Asset Mockup */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center mb-20">

          {/* LEFT: Messaging */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="w-full lg:w-1/2"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-4" style={{ fontFamily: font }}>
              One link, everywhere
            </p>
            {/* Punchy, mobile-optimized typography */}
            <h2 className="text-[40px] sm:text-5xl text-slate-900 font-black leading-[0.95] tracking-tight mb-6" style={{ fontFamily: font }}>
              Where do I <br />
              <span className="text-slate-500">put it?</span>
            </h2>
            <p className="text-slate-600 font-bold text-base sm:text-lg leading-relaxed max-w-md" style={{ fontFamily: font }}>
              Everywhere your business already exists. Convert passive traffic into structured, detail-rich dashboard entries instantly.
            </p>
          </motion.div>

          {/* RIGHT: Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            className="w-full lg:w-1/2"
          >
            <div className="rounded-2xl border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.06)] bg-white p-2 w-full">
              <div className="rounded-xl overflow-hidden border border-slate-100">
                <Image
                  src="/images/qrbranded2.png"
                  alt="Branded QR code on truck, yard sign, and social media"
                  width={800}
                  height={520}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* USE CASE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {USE_CASES.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <item.icon size={18} className="text-emerald-600" />
              </div>
              <h3 className="text-slate-900 font-black mb-1.5" style={{ fontFamily: font }}>{item.title}</h3>
              <p className="text-slate-500 text-sm font-bold leading-relaxed" style={{ fontFamily: font }}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* ACTION ZONE */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }} 
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-center border-t border-slate-200 pt-12"
        >
          <div className="flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm w-full sm:w-auto">
            <span className="text-sm text-slate-400 font-mono truncate">
              lead2project.com/<span className="text-emerald-600 font-black">your-company</span>
            </span>
          </div>
          <Link href="/signup" className="flex items-center justify-center gap-2 bg-slate-950 text-white px-7 py-3 rounded-xl font-black uppercase text-xs hover:bg-slate-900 transition-all w-full sm:w-auto">
            Get Your Link <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}