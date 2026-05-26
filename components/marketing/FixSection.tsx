'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const font = "'Nunito', sans-serif";

export default function TheFixSection() {
  return (
    <section className="relative bg-slate-50 py-20 sm:py-28 lg:py-36 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT: Copy */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p
                className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400 mb-4"
                style={{ fontFamily: font }}
              >
                The fix
              </p>
             <h3
  className="text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-[0.95] tracking-tight mb-4"
  style={{ fontFamily: font, fontWeight: 900 }}
>
  One dashboard. <br />
  <span className="text-emerald-600">Every job.</span>
</h3>
<p
  className="text-lg text-slate-500 font-bold leading-relaxed"
  style={{ fontFamily: font }}
>
  Customers submit. You run it all from here.
</p>
            </motion.div>
          </div>

          {/* RIGHT: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 relative"
          >
            <div className="absolute -inset-8 bg-emerald-500/8 blur-3xl rounded-full pointer-events-none" />
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border border-slate-200 bg-white">
              <Image
                src="/images/jobsite.webp"
                alt="Lead2Project dashboard on phone"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}