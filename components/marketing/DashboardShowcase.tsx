'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  FileText,
  Check,
  ChevronRight,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import HeroDispatchCards, { DispatchViewSwitcher, type ViewKey } from '@/components/marketing/HeroDispatchCards';
import { TRADE_EXAMPLES } from '@/components/marketing/tradeExamples';

const font = "'Nunito', sans-serif";

const STATUS_OPTIONS = [
  { value: 'new', label: 'New Lead', color: 'green' },
  { value: 'contacted', label: 'Dispatched', color: 'yellow' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Job Completed', color: 'blue' },
];

// Fixed brand navy stays constant across trades; the second gradient stop
// shifts to each trade's accent color — a small visual nod to "your form,
// your brand" without contradicting the site's own consistent identity.
const BRAND_NAVY = '#0B3C6D';
// Muted hunter green — replaces the brighter Tailwind green-600 used for
// the phone-verified checkmark, matching the professional palette used
// elsewhere on the site instead of a consumer-app-style bright green.
const VERIFIED_GREEN = '#166534';

const labelClass = 'text-[10px] font-black text-gray-700 uppercase tracking-[0.12em] ml-1';
const inputClass =
  'w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-900';

// Formats raw digits (as stored on TradeLead) into (555) 123-4567 — same
// pattern used in the real UploadFormStepOne component.
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (!digits.length) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// ==========================================
// Static, non-interactive replica of UploadFormStepOne's real styling.
// This is NOT the live production component — that one is wired to real
// state, onChange handlers, and API calls (/api/upload). This is a visual
// stand-in built to match it closely for demo purposes on the marketing site.
// ==========================================
function RealisticFormPreview({ example }: { example: (typeof TRADE_EXAMPLES)[number] }) {
  const lead = example.leads?.[0] as any;
  const color1 = BRAND_NAVY;
  const color2 = example.color;

  const serviceQuestion = example.questions[0];
  const description =
    lead?.category
      ? `Looking for help with ${lead.category.replace(/_/g, ' ')} at my property. Please reach out to schedule a time to take a look.`
      : 'Please describe what you need help with...';

  return (
    <div className="w-full max-w-md mx-auto" style={{ fontFamily: font }}>
      {/* Step indicator */}
      <div className="flex items-center gap-3 justify-center mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center text-white shadow-sm"
            style={{ background: color1 }}
          >
            1
          </div>
          <span className="text-xs font-black text-gray-800 uppercase tracking-widest">Your Info</span>
        </div>
        <div className="flex-1 max-w-[40px] h-px bg-gray-200" />
        <div className="flex items-center gap-2 opacity-40">
          <div className="w-6 h-6 rounded-full bg-gray-200 text-[11px] font-black flex items-center justify-center text-gray-500">
            2
          </div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Details</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden">
        {/* Branded top banner — full-color background, large logo, so the
            "your brand" difference actually reads at a glance between
            trades instead of only being described in copy. */}
        <div
          className="px-5 py-4 flex items-center gap-4"
          style={{ backgroundColor: color2 }}
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center shrink-0 p-2 shadow-sm">
            <img
              src={example.logo}
              alt={example.company.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-black text-base sm:text-lg leading-tight truncate">
              {example.company.name}
            </h4>
            <p className="text-white/80 uppercase tracking-widest font-extrabold text-[9px] mt-1">
              Work Request Form
            </p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className={labelClass}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <div className={inputClass}>{lead?.name || 'John Smith'}</div>
            </div>
          </div>

          {/* Email + Phone side by side to keep the card compact */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <div className={`${inputClass} truncate`}>{lead?.email || 'john@example.com'}</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <div className={`${inputClass} pr-9`}>
                  {lead?.phone ? formatPhoneNumber(lead.phone) : '(555) 000-0000'}
                </div>
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${VERIFIED_GREEN}20` }}
                >
                  <Check className="w-3 h-3" strokeWidth={3} style={{ color: VERIFIED_GREEN }} />
                </div>
              </div>
            </div>
          </div>

          {/* Service category pills */}
          <div className="space-y-2">
            <label className={labelClass}>Service Needed</label>
            <AnimatePresence mode="wait">
              <motion.div
                key={example.trade}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="flex flex-wrap gap-1.5"
              >
                {serviceQuestion.options.map((opt, i) => {
                  const selected = i === serviceQuestion.selected;
                  return (
                    <div
                      key={opt}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        selected
                          ? 'text-white border-transparent shadow-sm'
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                      style={
                        selected
                          ? { background: `linear-gradient(135deg, ${color1}, ${color2})` }
                          : undefined
                      }
                    >
                      {opt}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className={labelClass}>Tell Us About Your Project</label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-300" />
              <div className={`${inputClass} min-h-[64px] leading-relaxed`}>{description}</div>
            </div>
          </div>

          {/* Site Photos — shows the real uploaded image when the trade
              example has one (Roofing has roof-damage.webp), otherwise the
              same upload-placeholder state used elsewhere on the site. This
              is what proves photo upload actually works, not just claimed. */}
          <div className="space-y-1.5">
            <label className={labelClass}>Site Photos</label>
            <AnimatePresence mode="wait">
              <motion.div
                key={example.trade}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
              >
                {example.uploadPreview ? (
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2.5">
                    <img
                      src={example.uploadPreview}
                      alt={example.uploadFileName || 'Uploaded site photo'}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {example.uploadFileName || 'photo.webp'}
                      </p>
                      <p
                        className="text-[10px] font-black uppercase tracking-wider mt-0.5"
                        style={{ color: VERIFIED_GREEN }}
                      >
                        Attached successfully
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl py-5 flex flex-col items-center justify-center gap-1 bg-gray-50/60">
                    <ImageIcon className="w-5 h-5 text-gray-300" />
                    <span className="text-xs font-bold text-gray-400">Tap to upload photos</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Submit */}
        <div className="px-5 pb-5">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-2xl font-black text-sm shadow-lg cursor-default"
            style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-center mt-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Continue To Additional Details (Optional)
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main showcase: real-looking form on one side, live dashboard on the
// other, connected by an arrow. Independent of ArchitectHero — has its
// own trade-cycling state so it doesn't need to share state with the hero.
// ==========================================
export default function DashboardShowcase() {
  const [activeExample, setActiveExample] = useState(0);
  // View is manual only — no auto-switching, defaults to 'cards'.
  const [view, setView] = useState<ViewKey>('cards');
  const current = TRADE_EXAMPLES[activeExample];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % TRADE_EXAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      style={{ fontFamily: font }}
      className="relative overflow-hidden bg-[#fcfcfc] py-20 sm:py-28 border-b-[3px] border-slate-900"
    >
      <div
        className="absolute inset-0 opacity-[0.045] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1.2px, transparent 1.2px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-slate-500 block mb-3">
            From submission to dispatch board
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight">
            One form in. Already organized on your board.
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-4">
          {/* FORM SIDE */}
          <div className="w-full lg:flex-1 lg:max-w-md">
            <div className="text-center mb-4">
              <span
                className="inline-block border-2 border-slate-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)]"
                style={{ backgroundColor: `${BRAND_NAVY}15`, color: BRAND_NAVY }}
              >
                Step 1: Customer fills out your form
              </span>
            </div>
            <RealisticFormPreview example={current} />

            {/* Moved here from the hero — ties directly to the form that's
                currently showing this trade's branding, instead of
                floating disconnected from any visible product. */}
            <div className="relative h-6 overflow-hidden mt-3 flex justify-center lg:justify-start">
              <AnimatePresence mode="wait">
                <motion.p
                  key={current.trade}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Optimized for</span>
                  <span
                    className="font-black px-2 py-0.5 rounded border border-slate-200 transition-colors duration-300"
                    style={{ color: current.color, backgroundColor: `${current.color}12` }}
                  >
                    {current.trade}
                  </span>
                  <span>services, contracts & teams.</span>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* CONNECTOR */}
          <div className="flex lg:flex-col items-center justify-center gap-2 shrink-0 py-2 lg:py-0 lg:px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-slate-900 bg-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
              <ArrowRight className="w-5 h-5 text-slate-900 rotate-90 lg:rotate-0" strokeWidth={3} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-center max-w-[100px] leading-tight">
              Lands on your board instantly
            </span>
          </div>

          {/* DASHBOARD SIDE */}
          <div className="w-full lg:flex-[1.4]">
            <div className="text-center mb-4">
              <span
                className="inline-block border-2 border-slate-900 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(15,23,42,1)]"
                style={{ backgroundColor: `${BRAND_NAVY}15`, color: BRAND_NAVY }}
              >
                Step 2: You quote, schedule, and get paid
              </span>
            </div>

            {/* View switcher lives OUTSIDE the laptop bezel now, not inside
                the dashboard's own padded content area. Manual only —
                defaults to Cards, no auto-switching. */}
            <div className="mb-4">
              <DispatchViewSwitcher view={view} onChange={setView} isDark={false} />
            </div>

            <div className="relative w-full">
              <div className="relative rounded-t-2xl border-[10px] border-b-0 border-slate-900 bg-slate-800 overflow-hidden shadow-[6px_6px_0px_0px_#0f172a] lg:shadow-[10px_10px_0px_0px_#0f172a]">
                <div className="relative flex flex-col w-full min-h-[440px] sm:min-h-[480px] lg:min-h-[520px]">
                  <div className="flex-1 min-h-0 p-4 overflow-y-auto flex flex-col space-y-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={current.trade}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22 }}
                        className="flex flex-col flex-1 min-h-0 space-y-4"
                      >
                        <DashboardHeader
                          company={current.company}
                          isDark={true}
                          isRefreshing={false}
                          planTier="pro"
                          onSidebarOpen={() => {}}
                          onCreateLead={() => {}}
                          onLockedFeature={() => {}}
                          onRefresh={() => {}}
                          accentColor={current.color}
                        />

                        <DashboardStats
                          globalStats={current.stats}
                          allLeads={current.leads}
                          isDark={true}
                        />

                        <HeroDispatchCards
                          leads={current.leads}
                          statusOptions={STATUS_OPTIONS}
                          trade={current.trade}
                          view={view}
                          isDark={true}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="relative h-4 bg-slate-800 border-2 border-t-0 border-slate-900 rounded-b-md" />
              <div className="relative h-1.5 mx-[10%] bg-slate-950 rounded-b-xl -mt-px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}