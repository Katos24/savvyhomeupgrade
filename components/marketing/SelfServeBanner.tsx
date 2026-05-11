'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Check, X, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
// Optional: If you can use 'Inter' from next/font/google, use that.
// If not, we fall back to generic system sans, which Apple uses.
const font = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";

export default function AppleSmoothBanner() {
  return (
    <section className="relative bg-white py-24 sm:py-32 overflow-hidden border-b border-gray-100">
      
      {/* Subtle Background Depth - blurred warm accent */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-50 rounded-full blur-3xl opacity-60" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-16 lg:gap-24">
          
          {/* LEFT — Context */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="inline-flex items-center gap-2 mb-4">
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                 <span className="text-sm font-semibold text-gray-950" style={{ fontFamily: font }}>No demos. Pure build.</span>
              </div>

              <h2
                className="text-4xl sm:text-5xl lg:text-6xl text-gray-950 leading-[1.1] mb-8 tracking-tight"
                style={{ fontFamily: font, fontWeight: 700 }}
              >
                Lead2Project is ready <br />
                when you are.
              </h2>

              <p className="text-lg sm:text-xl text-gray-700 max-w-xl mb-12 leading-relaxed" style={{ fontFamily: font }}>
                Skip the sales cycles and endless pitches. 
                Experience a platform designed to let you build, 
                <span className="text-gray-950 font-semibold"> not wait.</span>
              </p>

              {/* The "Other Guy" List - Subtle & respectful */}
              <div className="space-y-5 border-t border-gray-100 pt-8 mt-12">
                {[
                  { icon: X, text: "Book a sales demo", detail: "Wait days for a call" },
                  { icon: X, text: "Complex annual agreements", detail: "Pre-login commitment" },
                  { icon: X, text: "Hidden tier pricing", detail: "Opaque 'Contact Us' models" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <item.icon className="text-red-500 shrink-0 mt-0.5" size={16} strokeWidth={2.5} />
                    <div>
                      <p className="text-sm font-semibold text-gray-950" style={{ fontFamily: font }}>{item.text}</p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* RIGHT — The "Smooth" Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-[360px]"
          >
            {/* The "Soft" Card - Use soft border, no sharp shadow */}
            <div className="relative bg-[#FBFBFC] border border-gray-100 rounded-[28px] p-9 shadow-sm hover:shadow-md transition-shadow duration-500">
              
              <div className="mb-10 text-center">
                 <h4 className="text-sm font-semibold text-emerald-600 mb-2" style={{ fontFamily: font }}>The Build First Model</h4>
                 <p className="text-2xl font-bold text-gray-950 tracking-tight" style={{ fontFamily: font }}>Lead2Project</p>
              </div>

              <ul className="space-y-6 mb-10">
                {[
                  'Instant Workspace Creation',
                  'Free Access Tier Available',
                  'Month-to-Month Flexibility',
                  'No Credit Card required'
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3.5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Check className="text-emerald-600" size={14} strokeWidth={3} />
                    </div>
                    <span className="text-gray-800 text-[15px] font-medium" style={{ fontFamily: font }}>{t}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full flex items-center justify-center gap-2.5 bg-gray-950 hover:bg-emerald-600 text-white py-4 rounded-full text-[15px] font-semibold transition-colors cursor-pointer group"
                  style={{ fontFamily: font }}
                >
                  Start Building Free
                  <ArrowRight size={18} className="text-white group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
              
              {/* Subtle Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-5 text-gray-500">
                  <div className="flex items-center gap-1.5 text-xs">
                      <Clock size={13} strokeWidth={2} /> Set up in minutes
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                      <Shield size={13} strokeWidth={2} /> Secure Access
                  </div>
              </div>
              
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}