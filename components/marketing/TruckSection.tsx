'use client';

import { motion } from 'framer-motion';
import { Globe, QrCode, Share2, Truck, CreditCard, Users, ArrowRight, Star } from 'lucide-react';
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
      
      <div className="absolute inset-0 opacity-[0.3] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6">

        {/* GOOGLE FOCUSED TOP SECTION */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-black text-[10px] uppercase tracking-widest mb-6">
              <Star size={12} className="fill-blue-500" /> The Google Growth Hack
            </div>
            
            <h2 className="text-[40px] sm:text-6xl text-slate-900 font-black leading-[0.95] tracking-tight mb-8" style={{ fontFamily: font }}>
              Own the <span className="text-blue-600">Google Search</span> result.
            </h2>
            
            <p className="text-slate-600 font-bold text-lg leading-relaxed mb-8" style={{ fontFamily: font }}>
              When a customer searches for you, they shouldn't find a dead-end. Add your Lead2Project link to your <strong>Google Business Profile</strong> as your primary "Booking" or "Quote" link. 
            </p>

            <ul className="space-y-4 mb-8">
              {['Capture leads while you’re on another job', 'Professional "Request Quote" button', 'Automatic photo/site condition data'].map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px]">✓</div>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

        {/* GOOGLE MOCKUP - Realistic View */}
<motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
  <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 w-full max-w-sm mx-auto">
    {/* Simulated Google Listing Card */}
    <div className="flex justify-between items-start mb-4">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full border border-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img src="/images/arctic-air-logo.webp" alt="Artic Air" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="font-black text-lg text-slate-900">Artic Air HVAC</h3>
          <div className="flex items-center gap-1 text-yellow-500 text-xs">★★★★★ <span className="text-slate-400">4.9 (124)</span></div>
          <p className="text-slate-500 text-[10px]">HVAC Contractor</p>
        </div>
      </div>
    </div>
    
  {/* THE "REAL" LOOK: Dual Action Links with Pulse Animation */}
    <div className="border-t border-b border-slate-100 py-3 my-3 space-y-3">
       {/* Request Quote - Pulsing */}
       <div className="flex items-center justify-between group">
          <span className="text-xs font-bold text-slate-700">Quote</span>
          <div className="relative flex items-center gap-2">
             <div className="absolute -left-4 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
             <span className="text-xs font-black text-emerald-600 underline cursor-pointer">Request a Quote →</span>
          </div>
       </div>

       {/* Book Appointment */}
       <div className="flex items-center justify-between group">
          <span className="text-xs font-bold text-slate-700">Book</span>
          <span className="text-xs font-black text-blue-600 underline cursor-pointer">Schedule Job →</span>
       </div>
    </div>

    {/* Standard Google Buttons */}
    <div className="flex gap-2 mt-4">
      <div className="flex-1 py-2 rounded-full border border-slate-300 text-center text-xs font-bold text-slate-700">Website</div>
      <div className="flex-1 py-2 rounded-full border border-slate-300 text-center text-xs font-bold text-slate-700">Directions</div>
      <div className="flex-1 py-2 rounded-full border border-slate-300 text-center text-xs font-bold text-slate-700">Call</div>
    </div>
    
    <p className="mt-4 text-[9px] text-center text-slate-400 font-bold uppercase tracking-wider">
      Visible to all your Google searches
    </p>
  </div>
</motion.div>
        </div>

        {/* USE CASES - Kept for secondary distribution */}
        <div className="mb-20">
          <h3 className="text-2xl font-black text-slate-900 mb-10 text-center" style={{ fontFamily: font }}>And everywhere else...</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {USE_CASES.map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <item.icon size={18} className="text-emerald-600 mb-3" />
                <h4 className="text-sm font-black text-slate-900 mb-1">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION ZONE */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-200 pt-12">
          <Link href="/signup" className="flex items-center justify-center gap-2 bg-slate-950 text-white px-8 py-4 rounded-xl font-black uppercase text-sm hover:bg-slate-900 transition-all w-full sm:w-auto">
            Get Your Google-Ready Link <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}