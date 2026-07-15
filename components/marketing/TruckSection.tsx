'use client';

import { motion } from 'framer-motion';
import { 
  Globe, 
  QrCode, 
  CreditCard, 
  Star, 
  ArrowRight,
  Facebook,
  Instagram
} from 'lucide-react';
import Image from 'next/image';

const font = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

// Official Google multi-color G SVG logo component
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
}

const USE_CASES = [
  { icon: GoogleLogo, title: 'Google Profile', isCustom: true },
  { icon: Globe, title: 'Your Website', color: 'text-emerald-600' },
  { icon: Instagram, title: 'Instagram Bio', color: 'text-pink-600' },
  { icon: Facebook, title: 'Facebook Page', color: 'text-blue-600' },
  { icon: QrCode, title: 'Yard Signs', color: 'text-indigo-600' },
  { icon: CreditCard, title: 'Business Cards', color: 'text-slate-700' },
];

export default function DistributionSection() {
  return (
    <section 
      id="distribution" 
      style={{ fontFamily: font }}
      className="relative bg-slate-50 py-20 sm:py-28 overflow-hidden border-b border-slate-100"
    >
      {/* Background Micro Dot Texture */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* TRANSITIONAL HERO: FROM CHAOS TO AUTOMATED CAPTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-24">

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-col text-left lg:col-span-7"
          >
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-rose-500 mb-3 block">
              Stop Playing Phone Tag
            </span>
            
            <h2 className="text-slate-900 font-black tracking-tight leading-[1.05] text-4xl sm:text-5xl mb-6">
              Get clean leads from everywhere.<br />
              <span className="text-emerald-600">Without picking up the phone.</span>
            </h2>

            <p className="text-slate-500 font-semibold text-base sm:text-lg leading-relaxed mb-6">
              Instead of losing quotes to missed calls and messy texts, route your prospects directly to your custom booking form. Put your link on Google, print it on your trucks, and let customers build their own estimates while you work.
            </p>

            <ul className="space-y-3.5">
              {[
                "Capture ready-to-buy leads while you are busy on-site",
                'Provide clients a structured 1-minute "Request Quote" experience',
                'Collect site photos, measurements, and details automatically'
              ].map((point, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* GOOGLE MOCK WINDOW CARD DISPLAY */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-sm mx-auto lg:mr-0 lg:col-span-5"
          >
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80 relative transition-all duration-300 hover:shadow-2xl">
              
              {/* Google Verified Badge Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-full py-1 px-2.5 shadow-2xs">
                <GoogleLogo className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black text-slate-700">Verified Profile</span>
              </div>

              <div className="flex justify-between items-start mb-5 pt-2">
                <div className="flex gap-3.5">
                  <div className="w-12 h-12 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/images/arctic-air-logo.webp" alt="Arctic Air Branding Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900 leading-tight">Arctic Air HVAC</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex items-center text-amber-400 gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={11} fill="currentColor" className="text-amber-450" />
                        ))}
                      </div>
                      <span className="text-slate-400 font-bold text-[11px] ml-1">4.9 (124 reviews)</span>
                    </div>
                    <p className="text-slate-400 font-bold text-[10px] mt-0.5">HVAC Contractor · Holbrook</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Call-to-action Links */}
              <div className="border-t border-b border-slate-100 py-3.5 my-4 space-y-3.5">
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs font-bold text-slate-600">Online Estimate</span>
                  <span className="text-xs font-black text-emerald-600 flex items-center gap-1 group-hover:underline">
                    Request a Quote <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
                <div className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs font-bold text-slate-600">Appointments</span>
                  <span className="text-xs font-black text-blue-600 flex items-center gap-1 group-hover:underline">
                    Schedule Job <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                {['Website', 'Directions', 'Call'].map((label) => (
                  <div key={label} className="py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-black text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>

        {/* MULTI-CHANNEL DISTRIBUTION NETWORKS */}
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl font-black text-slate-900 mb-8 text-center uppercase tracking-wider text-slate-400 text-xs"
          >
            Deploy your assets everywhere else
          </motion.h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl border border-slate-200/60 overflow-hidden min-h-[260px] sm:min-h-[340px] bg-slate-100 shadow-sm group"
            >
              <Image
                src="/images/qr-scan-2.webp"
                alt="Customer scanning a custom QR code on a service truck to quickly request a design quote"
                fill
                priority
                className="object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
              <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg shadow-sm">
                Scan · Submit · Done
              </div>
            </motion.div>

            <div className="flex flex-col gap-4">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="relative rounded-2xl border border-slate-200/60 overflow-hidden h-36 w-full bg-slate-100 shadow-sm group"
              >
                <Image
                  src="/images/qrbranded2.webp"
                  alt="Branded custom tracking codes printed on service trucks and landscape yard placements"
                  fill
                  className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                <p className="absolute bottom-4 left-4 text-white text-[10px] font-black uppercase tracking-widest">
                  Truck Wraps · Yard Signs · Social Channels
                </p>
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {USE_CASES.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="bg-white border border-slate-200/70 rounded-xl p-4 shadow-xs hover:border-slate-350 hover:shadow-sm transition-all group cursor-default text-left flex flex-col justify-start"
                  >
                    {item.isCustom ? (
                      <item.icon className="w-[18px] h-[18px] mb-2 group-hover:scale-110 transition-transform duration-200" />
                    ) : (
                      <item.icon size={18} className={`${item.color} mb-2 group-hover:scale-110 transition-transform duration-200`} />
                    )}
                    <h4 className="text-xs font-black text-slate-900">{item.title}</h4>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}