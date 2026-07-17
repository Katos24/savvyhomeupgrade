'use client';

import { motion } from 'framer-motion';
import { Globe, QrCode, Facebook, Instagram, CreditCard } from 'lucide-react';
import Image from 'next/image';

const font = "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

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

// Bento cells — each optionally has an image (desktop only). Cells without
// a confirmed real asset fall back to an icon-only tile so nothing 404s;
// swap `image` in once you have a real screenshot/photo for that spot.
const BENTO_CELLS = [
  {
    title: 'Google Business Profile',
    subtitle: 'Often the first thing a customer sees',
    icon: GoogleLogo,
    isCustomIcon: true,
    image: null, // TODO: add a Google Business Profile screenshot
    span: 'lg:col-span-2 lg:row-span-1',
  },
  {
    title: 'Truck wraps & yard signs',
    subtitle: 'Scan, submit, done',
    icon: QrCode,
    color: 'text-indigo-400',
    image: '/images/qrbranded2.webp',
    span: 'lg:col-span-2 lg:row-span-2',
  },
  {
    title: 'Instagram bio',
    subtitle: 'Link in bio, right to your form',
    icon: Instagram,
    color: 'text-pink-400',
    image: null, // TODO: add an Instagram bio screenshot
    span: 'lg:col-span-1',
  },
  {
    title: 'Facebook page',
    subtitle: 'Pin it to the top of your page',
    icon: Facebook,
    color: 'text-blue-400',
    image: null, // TODO: add a Facebook page screenshot
    span: 'lg:col-span-1',
  },
  {
    title: 'QR code, scanned in the field',
    subtitle: 'Customer scans, form opens instantly',
    icon: QrCode,
    color: 'text-emerald-400',
    image: '/images/qr-scan-2.webp',
    span: 'lg:col-span-2',
  },
  {
    title: 'Business cards',
    subtitle: 'Hand one over, they book on the spot',
    icon: CreditCard,
    color: 'text-slate-300',
    image: null, // TODO: add a business card mockup
    span: 'lg:col-span-2',
  },
];

export default function TruckSection() {
  return (
    <section
      id="distribution"
      style={{ fontFamily: font }}
      className="relative bg-[#0B1220] py-20 sm:py-28 overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header with step badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-xl font-black text-white">
            2
          </span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            Blast your link everywhere
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-white font-black tracking-tight leading-[1.05] text-4xl sm:text-5xl mb-12 max-w-2xl"
        >
          Share your link and QR code — <span className="text-emerald-400">put it everywhere.</span>
        </motion.h2>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4">
          {BENTO_CELLS.map((cell, i) => (
            <motion.div
              key={cell.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className={`relative rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden shadow-sm hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 min-h-[160px] flex flex-col ${cell.span || ''}`}
            >
              {cell.image && (
                <div className="relative hidden sm:block flex-1 min-h-[120px] bg-white/5">
                  <Image
                    src={cell.image}
                    alt={cell.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                </div>
              )}

              <div className={`p-4 sm:p-5 ${cell.image ? 'sm:absolute sm:bottom-0 sm:left-0 sm:right-0' : 'flex-1 flex flex-col justify-center'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    {cell.isCustomIcon ? (
                      <cell.icon className="w-4 h-4" />
                    ) : (
                      <cell.icon size={16} className={cell.color} />
                    )}
                  </div>
                  <h4 className="text-sm font-black text-white">
                    {cell.title}
                  </h4>
                </div>
                <p className="text-[11px] font-bold text-slate-400">
                  {cell.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}