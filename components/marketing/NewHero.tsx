'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, Send, UserPlus, QrCode, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Component Imports
import CardsView from '@/components/dashboard/views/CardsView';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';

const font = "'Nunito', sans-serif";

const MOCK_COMPANY = {
  name: 'Ridge Line Roofing',
  logo_url: '/images/ridgelinelogo.webp',
  slug: 'ridge-line-roofing',
};

// Leads shown permanently — no click/reveal gating. Includes the QR-scanned
// lead so the dashboard side visibly matches the "customer just scanned"
// story told by the photo on the left.
const LEADS = [
  {
    id: 3,
    name: 'Jennifer L.',
    phone: '5553829102',
    email: 'jennifer@example.com',
    category: 'roof_repair',
    status: 'new',
    quote_total: '1250',
    file_urls: JSON.stringify([]),
    assigned_to: 'Unassigned',
    project_quote_sent_at: '',
    scheduled_date: '',
    payment_status: '',
    payment_amount: '',
    created_at: new Date().toISOString(),
    lead_source: 'qr_scan',
    address_line_1: '29 Birchwood Ln',
    address_line_2: '',
    city: 'Holbrook',
    zip_code: '11741',
  },
  {
    id: 1,
    name: 'Chris Williams',
    phone: '5551234567',
    email: 'chris@example.com',
    category: 'roof_repair',
    status: 'in-progress',
    quote_total: '2768',
    file_urls: JSON.stringify([{ url: '/images/roof-damage.webp', name: 'roof-damage.webp', type: 'image/webp' }]),
    assigned_to: 'Will',
    project_quote_sent_at: '2026-06-20',
    scheduled_date: '2026-07-13T00:00:00Z',
    payment_status: 'partial',
    payment_amount: '1384',
    created_at: '2026-06-15T10:00:00Z',
    lead_source: 'website',
    address_line_1: '482 Ridgewood Ave',
    address_line_2: '',
    city: 'Holbrook',
    zip_code: '11741',
  },
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'green' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'blue' },
];

const GLOBAL_STATS = {
  total_leads: 39,
  active_jobs: 37,
  revenue: 55000,
  pending: 101250,
};

export default function ArchitectHero() {
  const [showCreateLeadInfo, setShowCreateLeadInfo] = useState(false);
  const cardsWrapperRef = useRef<HTMLDivElement>(null);

  // Forces CardsView's desktop grid to 2 columns inside this hero panel only.
  // CardsView.tsx itself is untouched — we grab the actual grid element after
  // mount and set its column count directly via inline style + !important,
  // which reliably beats any Tailwind utility regardless of CSS specificity.
  useEffect(() => {
    const gridEl = cardsWrapperRef.current?.querySelector<HTMLElement>('[class*="sm:grid"]');
    gridEl?.style.setProperty('grid-template-columns', 'repeat(2, minmax(0, 1fr))', 'important');
  }, []);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 via-orange-50/20 to-white pt-28 pb-16 sm:pt-32 lg:pt-36 lg:pb-24 border-b border-slate-200/60 z-10"
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main Copy Row */}
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-5 mb-10 lg:mb-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50/80 px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
              Built for trade businesses
            </span>
          </div>

          <h1 className="text-slate-900 tracking-tighter leading-[1.02] text-4xl sm:text-5xl md:text-6xl">
            <span className="font-extrabold block text-slate-900">Your form fills out.</span>
            <span className="font-black text-emerald-600 block mt-1">Your dashboard fills in.</span>
          </h1>

          <p className="max-w-xl text-base sm:text-lg font-medium leading-relaxed text-slate-600">
            Customers scan a code on your truck and submit your branded intake form, photos and all. The job lands on your board instantly, updating metrics in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/signup">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm shadow-lg shadow-slate-950/10 transition-colors cursor-pointer"
              >
                Get Started Free
                <ArrowRight size={16} strokeWidth={3} />
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Static Split Panel — both halves visible immediately, no click or timer required */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">

          {/* LEFT — real-world photo proof: customer scans the truck decal, form's already on their phone */}
          <div className="relative h-[380px] sm:h-[460px] lg:h-[620px] lg:col-span-5 rounded-3xl overflow-hidden border border-slate-200 shadow-[0_40px_80px_rgba(15,23,42,0.15)] bg-slate-900">
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/qr-scan-2.webp"
                alt="Customer scanning a Ridge Line Roofing QR code on a work truck to submit a quote request"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover"
                priority
              />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-3.5 py-2.5 shadow-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <QrCode size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-900 leading-tight">Scan to get a quote</p>
                <p className="text-[10px] font-bold text-slate-500 leading-tight">On every truck, sign, and card you hand out</p>
              </div>
            </div>
          </div>

          {/* RIGHT — the dashboard, already showing the scanned lead. Nothing to click, nothing to wait for. */}
          <div className="relative h-[560px] sm:h-[620px] lg:h-[620px] lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200 shadow-[0_40px_80px_rgba(15,23,42,0.15)] bg-[#0A0C14] flex flex-col">
            <div className="flex-1 min-h-0 p-3 sm:p-5 overflow-y-auto flex flex-col">
              <DashboardHeader
                company={MOCK_COMPANY}
                isDark={true}
                isRefreshing={false}
                planTier="pro"
                onSidebarOpen={() => {}}
                onCreateLead={() => setShowCreateLeadInfo(true)}
                onLockedFeature={() => {}}
                onRefresh={() => {}}
              />

              <DashboardStats
                globalStats={GLOBAL_STATS}
                allLeads={LEADS}
                isDark={true}
              />

              <div ref={cardsWrapperRef} className="flex-1 min-h-0 relative z-10">
                <CardsView
                  leads={LEADS}
                  onSelectLead={() => {}}
                  statusOptions={STATUS_OPTIONS}
                  isDark={true}
                  planTier="pro"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Subtle scroll cue — points further down the page (Problem/Full
            Story sections), not a competing CTA, just a quiet nudge. */}
        <motion.div
          className="flex flex-col items-center gap-1.5 mt-8 sm:mt-10"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            See what it&apos;s capable of
          </span>
          <ChevronDown size={16} className="text-slate-400" />
        </motion.div>

      </div>

      {/* Create Lead info modal — explains that leads arrive via customer
          intake form OR manual entry, without opening a full functional
          create-lead flow in the hero preview. */}
      <AnimatePresence>
        {showCreateLeadInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreateLeadInfo(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 shadow-2xl p-6"
              style={{ fontFamily: font }}
            >
              <button
                onClick={() => setShowCreateLeadInfo(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>

              <h3 className="text-lg font-black tracking-tight text-slate-900 mb-1">
                Two ways leads land here
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-5">
                Every job on your board gets there one of two ways.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Send size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Customer scans &amp; submits</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                      QR code on your truck, sign, or card opens your form. Photos and all — it lands on your board automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <UserPlus size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">You add one manually</p>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                      Phone call, walk-in, referral — enter it yourself in a few taps and it shows up the same way.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowCreateLeadInfo(false)}
                className="w-full mt-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-wider transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}