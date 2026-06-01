'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, QrCode, Share2, Truck, CreditCard, Users, ArrowRight, Star, MapPin, Camera, User, Phone, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

const USE_CASES = [
  { icon: Globe, title: 'Your Website' },
  { icon: Share2, title: 'Social Profiles' },
  { icon: QrCode, title: 'Yard Signs' },
  { icon: Users, title: 'Referrals' },
  { icon: CreditCard, title: 'Business Cards' },
  { icon: Truck, title: 'Vehicle Wraps' },
];

function MiniFormPreview({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="absolute top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:-top-8 sm:-right-10 w-[220px] z-50"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden ring-1 ring-black/5">
        <div className="bg-[#0ea5e9] px-3 py-2.5 flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded flex items-center justify-center flex-shrink-0">
            <img src="/images/arctic-air-logo.webp" className="w-3 h-3 object-contain" alt="" />
          </div>
          <div>
            <p className="text-[9px] text-white font-black leading-tight">Arctic Air HVAC</p>
            <p className="text-[7px] text-white/70 uppercase tracking-widest font-bold">Request Form</p>
          </div>
          <button onClick={onClose} className="ml-auto text-white/60 hover:text-white">
            <X size={10} />
          </button>
        </div>
        <div className="p-3 space-y-2">
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[8px] font-bold text-slate-400 flex items-center gap-1">
            <User size={8} className="text-slate-300" /> Full Name
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[8px] font-bold text-slate-400 flex items-center gap-1">
            <Phone size={8} className="text-slate-300" /> Phone
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-[8px] font-bold text-slate-400 flex items-center gap-1">
            <MapPin size={8} className="text-slate-300" /> Address
          </div>
          <div>
            <p className="text-[7px] text-slate-400 uppercase tracking-wider font-black mb-1">System Type</p>
            <div className="flex gap-1 flex-wrap">
              <span className="text-[7px] font-bold text-white bg-[#0ea5e9] px-1.5 py-0.5 rounded">Central AC</span>
              <span className="text-[7px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">Heat Pump</span>
              <span className="text-[7px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">Furnace</span>
            </div>
          </div>
          <div className="border border-dashed border-slate-200 rounded-lg py-2 text-center">
            <Camera size={10} className="mx-auto text-slate-300 mb-0.5" />
            <p className="text-[7px] text-slate-400 font-bold">Attach photos</p>
          </div>
          <div className="bg-[#0ea5e9] text-white text-[8px] font-black uppercase tracking-wider text-center py-1.5 rounded-lg">
            Submit
          </div>
        </div>
      </div>
      <p className="text-[8px] text-slate-400 font-bold text-center mt-2 uppercase tracking-wider">
        What your customer sees
      </p>
    </motion.div>
  );
}

export default function DistributionSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section id="distribution" className="relative bg-slate-50 py-16 sm:py-24 lg:py-36 overflow-hidden">

      <div className="absolute inset-0 opacity-[0.3] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* ── GOOGLE SECTION ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">

          {/* Copy — order-1 on mobile so it appears first, order-1 on desktop (left) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="order-1 lg:order-1"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-black text-[10px] uppercase tracking-widest mb-6">
              <Star size={12} className="fill-blue-500" /> The Google Growth Hack
            </div>

            <h2 className="text-4xl sm:text-5xl text-slate-900 font-black leading-[0.95] tracking-tight mb-8" style={{ fontFamily: font }}>
              Own the <span className="text-blue-600">Google Search</span> result.
            </h2>

            <p className="text-slate-600 font-bold text-lg leading-relaxed mb-8" style={{ fontFamily: font }}>
              Add your Lead2Project link to your <strong>Google Business Profile</strong> as your primary &ldquo;Booking&rdquo; or &ldquo;Quote&rdquo; link.
            </p>

            <ul className="space-y-4 mb-8">
              {["Capture leads while you're on another job", 'Professional "Request Quote" button', 'Collect photos'].map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Google mockup — order-2 on mobile (below copy), order-2 on desktop (right) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-2 lg:order-2"
          >
            <div className="relative">
              <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-sm mx-auto">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src="/images/arctic-air-logo.webp" alt="Arctic Air" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-900">Arctic Air HVAC</h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs">
                        <span>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                        <span className="text-slate-400">4.9 (124)</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">HVAC Contractor</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-b border-slate-100 py-3 my-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Quote</span>
                    <div className="relative flex items-center gap-2">
                      <div className="absolute -left-4 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <button
                        onClick={() => setShowForm(!showForm)}
                        className="text-xs font-black text-emerald-600 underline cursor-pointer hover:text-emerald-700 transition-colors"
                      >
                        Request a Quote &rarr;
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Book</span>
                    <button
                      onClick={() => setShowForm(!showForm)}
                      className="text-xs font-black text-blue-600 underline cursor-pointer hover:text-blue-700 transition-colors"
                    >
                      Schedule Job &rarr;
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <div className="flex-1 py-2 rounded-full border border-slate-300 text-center text-xs font-bold text-slate-700">Website</div>
                  <div className="flex-1 py-2 rounded-full border border-slate-300 text-center text-xs font-bold text-slate-700">Directions</div>
                  <div className="flex-1 py-2 rounded-full border border-slate-300 text-center text-xs font-bold text-slate-700">Call</div>
                </div>

                <p className="mt-4 text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider">
                  {showForm ? 'Tap again to close preview' : 'Tap "Request a Quote" to preview'}
                </p>
              </div>

              <AnimatePresence>
                {showForm && <MiniFormPreview onClose={() => setShowForm(false)} />}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>

        {/* ── AND EVERYWHERE ELSE ── */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-black text-slate-900 mb-10 text-center"
            style={{ fontFamily: font }}
          >
            And everywhere else...
          </motion.h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            {/* Scan image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[380px]"
            >
              <Image
                src="/images/qr-scan-2.webp"
                alt="Scanning QR code on truck to get a quote"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">
                Scan. Submit. Done.
              </div>
            </motion.div>

            {/* Right: collage + tiles */}
            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative rounded-2xl overflow-hidden h-40 w-full"
              >
                <Image
                  src="/images/qrbranded2.webp"
                  alt="QR codes on trucks, yard signs, and social profiles"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <p className="absolute bottom-3 left-4 text-white text-[10px] font-black uppercase tracking-widest">
                  Truck wraps · Yard signs · Social
                </p>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {USE_CASES.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                  >
                    <item.icon size={16} className="text-emerald-600 mb-2" />
                    <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200 pt-12">
          <Link href="/signup" className="flex items-center justify-center gap-2 bg-slate-950 text-white px-8 py-4 rounded-xl font-black uppercase text-sm hover:bg-slate-900 transition-all w-full sm:w-auto">
            Get Your Google-Ready Link <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}