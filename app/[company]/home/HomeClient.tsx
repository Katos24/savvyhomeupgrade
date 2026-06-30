'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Copy, Check, ExternalLink, ArrowUpRight, Loader2, Lock, Download,
} from 'lucide-react';
import QRCodeLib from 'qrcode';
import { can, type PlanTier } from '@/lib/permissions';

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
  plan_tier?: string;
  custom_questions?: any[];
  categoriesCustomized: boolean;
  hasRealLead: boolean;
  stripe_connect_onboarded: boolean;
  stripe_payment_status: 'active' | 'restricted' | 'pending' | null;
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
      {children}
    </span>
  );
}

function MockupPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-24 bg-slate-50 border-b border-slate-100 flex items-center justify-center px-5">
      {children}
    </div>
  );
}

function FormMockup() {
  return (
    <svg viewBox="0 0 200 70" className="w-full max-w-[180px]">
      <rect x="0" y="2" width="120" height="7" rx="2" fill="#CBD5E1" />
      <rect x="0" y="18" width="200" height="14" rx="3" fill="#fff" stroke="#E2E8F0" />
      <rect x="0" y="40" width="200" height="14" rx="3" fill="#fff" stroke="#E2E8F0" />
      <rect x="0" y="62" width="56" height="8" rx="4" fill="#6366F1" />
    </svg>
  );
}

function DashboardMockup() {
  return (
    <svg viewBox="0 0 200 70" className="w-full max-w-[180px]">
      <rect x="0" y="0" width="200" height="16" rx="3" fill="#F1F5F9" stroke="#E2E8F0" />
      <circle cx="10" cy="8" r="2.5" fill="#94A3B8" />
      <rect x="20" y="6" width="60" height="4" rx="2" fill="#94A3B8" />
      <rect x="0" y="22" width="200" height="14" rx="3" fill="#fff" stroke="#E2E8F0" />
      <circle cx="10" cy="29" r="2.5" fill="#34D399" />
      <rect x="20" y="27" width="80" height="4" rx="2" fill="#CBD5E1" />
      <rect x="0" y="40" width="200" height="14" rx="3" fill="#EEF2FF" stroke="#C7D2FE" />
      <circle cx="10" cy="47" r="2.5" fill="#6366F1" />
      <rect x="20" y="45" width="70" height="4" rx="2" fill="#A5B4FC" />
      <rect x="0" y="58" width="200" height="12" rx="3" fill="#fff" stroke="#E2E8F0" />
    </svg>
  );
}

function InvoiceMockup() {
  return (
    <svg viewBox="0 0 200 70" className="w-full max-w-[150px]">
      <rect x="0" y="0" width="200" height="70" rx="4" fill="#fff" stroke="#E2E8F0" />
      <rect x="14" y="14" width="70" height="6" rx="2" fill="#94A3B8" />
      <rect x="14" y="28" width="172" height="1" fill="#F1F5F9" />
      <rect x="14" y="36" width="90" height="4" rx="2" fill="#CBD5E1" />
      <rect x="160" y="36" width="26" height="4" rx="2" fill="#CBD5E1" />
      <rect x="14" y="46" width="90" height="4" rx="2" fill="#CBD5E1" />
      <rect x="160" y="46" width="26" height="4" rx="2" fill="#CBD5E1" />
      <rect x="14" y="58" width="48" height="6" rx="2" fill="#6366F1" />
      <rect x="148" y="58" width="38" height="6" rx="2" fill="#0F172A" />
    </svg>
  );
}

function CategoriesMockup() {
  return (
    <svg viewBox="0 0 200 70" className="w-full max-w-[170px]">
      <rect x="0" y="0" width="56" height="22" rx="11" fill="#EEF2FF" stroke="#C7D2FE" />
      <rect x="14" y="9" width="28" height="4" rx="2" fill="#6366F1" />
      <rect x="64" y="0" width="64" height="22" rx="11" fill="#F8FAFC" stroke="#E2E8F0" />
      <rect x="78" y="9" width="36" height="4" rx="2" fill="#94A3B8" />
      <rect x="0" y="30" width="72" height="22" rx="11" fill="#F8FAFC" stroke="#E2E8F0" />
      <rect x="14" y="39" width="44" height="4" rx="2" fill="#94A3B8" />
      <rect x="80" y="30" width="48" height="22" rx="11" fill="#F8FAFC" stroke="#E2E8F0" />
      <rect x="94" y="39" width="20" height="4" rx="2" fill="#94A3B8" />
    </svg>
  );
}

function GoogleG({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function ReviewsMockup() {
  return (
    <div className="relative w-full max-w-[150px]">
      <svg viewBox="0 0 200 70" className="w-full">
        <rect x="0" y="0" width="200" height="48" rx="4" fill="#fff" stroke="#E2E8F0" />
        <circle cx="18" cy="16" r="7" fill="#F1F5F9" />
        <rect x="32" y="11" width="60" height="4" rx="2" fill="#94A3B8" />
        <rect x="32" y="19" width="40" height="3" rx="1.5" fill="#CBD5E1" />
        {[0, 1, 2, 3, 4].map(i => (
          <path
            key={i}
            d="M8 0l2.4 4.9 5.4.8-3.9 3.8.9 5.4L8 12.3l-4.8 2.6.9-5.4L.2 5.7l5.4-.8z"
            fill="#FBBC05"
            transform={`translate(${10 + i * 18}, 30)`}
          />
        ))}
      </svg>
      <div className="absolute top-2 right-2">
        <GoogleG size={14} />
      </div>
    </div>
  );
}

function SettingsMockup() {
  return (
    <svg viewBox="0 0 200 70" className="w-full max-w-[170px]">
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(0, ${i * 24})`}>
          <rect x="0" y="0" width="80" height="4" rx="2" fill="#94A3B8" />
          <rect x="120" y="-3" width="40" height="10" rx="5" fill={i === 1 ? '#6366F1' : '#E2E8F0'} />
          <circle cx={i === 1 ? 154 : 126} cy="2" r="5" fill="#fff" />
        </g>
      ))}
    </svg>
  );
}

function StatusBadge({ status }: { status: 'active' | 'pending' | 'not_connected' }) {
  const styles = {
    active: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    pending: 'text-amber-700 bg-amber-50 border-amber-100',
    not_connected: 'text-slate-500 bg-slate-50 border-slate-200',
  };
  const text = {
    active: 'Connected',
    pending: 'Needs attention',
    not_connected: 'Not connected',
  };
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${styles[status]}`}>
      {text[status]}
    </span>
  );
}

function NavCard({
  label, description, href, mockup, stat, statLabel, badge, locked, requiredPlan,
}: {
  label: string;
  description: string;
  href: string;
  mockup: React.ReactNode;
  stat?: React.ReactNode;
  statLabel?: string;
  badge?: React.ReactNode;
  locked?: boolean;
  requiredPlan?: string;
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-lg border border-slate-200/80 overflow-hidden hover:border-slate-300 hover:shadow-sm transition-all flex flex-col relative"
    >
      {locked && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200">
          <Lock className="w-2.5 h-2.5 text-slate-400" />
          <span className="text-[9px] font-medium text-slate-500">{requiredPlan}</span>
        </div>
      )}
      <MockupPanel>
        <div className={locked ? 'opacity-40' : ''}>{mockup}</div>
      </MockupPanel>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-[13px] font-semibold text-slate-900">{label}</h3>
          {badge}
        </div>
        <p className="text-[12px] text-slate-500 leading-relaxed flex-1">{description}</p>
        <div className="flex items-center justify-between mt-3">
          {stat !== undefined ? (
            <div>
              <div className="text-[15px] font-semibold text-slate-900 tabular-nums leading-none">{stat}</div>
              {statLabel && <div className="text-[10px] text-slate-400 mt-1">{statLabel}</div>}
            </div>
          ) : <span />}
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}

type ChecklistStep = {
  label: string;
  description: string;
  done: boolean;
  href: string;
};

function SetupChecklist({ steps }: { steps: ChecklistStep[] }) {
  const doneCount = steps.filter(s => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <Eyebrow>Get set up</Eyebrow>
        <span className="text-[11px] text-slate-400 tabular-nums">{doneCount}/{steps.length}</span>
      </div>
      <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden">
        <div className="h-0.5 bg-slate-100">
          <div
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${(doneCount / steps.length) * 100}%` }}
          />
        </div>
        {steps.map((step, i) => (
          <Link
            key={step.label}
            href={step.href}
            className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors ${
              i !== steps.length - 1 ? 'border-b border-slate-100' : ''
            } ${step.done ? 'opacity-50' : ''}`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
              step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {step.done ? <Check className="w-3 h-3 stroke-[3px]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[12.5px] font-medium ${step.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                {step.label}
              </p>
              <p className="text-[11.5px] text-slate-400 mt-0.5">{step.description}</p>
            </div>
            {!step.done && <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function HomeClient({ company }: { company: Company }) {
const [publicLink, setPublicLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrStyle, setQrStyle] = useState<'standard' | 'brand' | 'dark'>('standard');
  const [includeLogo, setIncludeLogo] = useState(true);


  useEffect(() => {
    if (typeof window !== 'undefined') setPublicLink(`${window.location.origin}/${company.slug}`);
  }, [company.slug]);

  useEffect(() => {
    if (!publicLink) return;
    const generate = async () => {
      let dark = '#0F172A', light = '#FFFFFF';
      if (qrStyle === 'brand') dark = company.email_brand_color_1 || '#0F172A';
      if (qrStyle === 'dark') { dark = '#FFFFFF'; light = '#0F172A'; }
      try {
        const url = await QRCodeLib.toDataURL(publicLink, { width: 1000, margin: 2, errorCorrectionLevel: 'H', color: { dark, light } });
        setQrCodeUrl(url);
      } catch {}
    };
    generate();
  }, [publicLink, qrStyle, company.email_brand_color_1]);
  const planTier = (company.plan_tier || 'free') as PlanTier;
  const paymentsLocked = !can(planTier, 'stripe_connect');
  const reviewsLocked = !can(planTier, 'google_reviews');

  const paymentsStatus: 'active' | 'pending' | 'not_connected' =
    paymentsLocked || !company.stripe_connect_onboarded
      ? 'not_connected'
      : company.stripe_payment_status === 'active'
        ? 'active'
        : 'pending'; // covers 'restricted' and null (not-yet-backfilled) alike

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const downloadStyledQR = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.onload = () => {
      canvas.width = qrImg.width;
      canvas.height = qrImg.height;
      ctx?.drawImage(qrImg, 0, 0);
      if (includeLogo && company.logo_url) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = company.logo_url;
        logoImg.onload = () => {
          const logoSize = canvas.width * 0.18;
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;
          ctx!.fillStyle = 'white';
          ctx?.beginPath();
          // @ts-ignore
          if (ctx?.roundRect) ctx.roundRect(x - 10, y - 10, logoSize + 20, logoSize + 20, 15);
          else ctx?.rect(x - 10, y - 10, logoSize + 20, logoSize + 20);
          ctx?.fill();
          ctx?.drawImage(logoImg, x, y, logoSize, logoSize);
          const a = document.createElement('a');
          a.download = `${company.slug}-branded-qr.png`;
          a.href = canvas.toDataURL('image/png');
          a.click();
        };
      } else {
        const a = document.createElement('a');
        a.download = `${company.slug}-qr.png`;
        a.href = qrImg.src;
        a.click();
      }
    };
    qrImg.src = qrCodeUrl;
  };

  const planLabel = (company.plan_tier || 'free').replace(/^\w/, c => c.toUpperCase());

  const checklistSteps: ChecklistStep[] = [
    {
      label: 'Connect payments',
      description: 'So customers can actually pay you online',
      done: paymentsStatus === 'active',
      href: `/${company.slug}/payments`,
    },
    {
      label: 'Set up categories & pricing',
      description: 'Auto-load tasks and quotes by job type',
      done: company.categoriesCustomized,
      href: `/${company.slug}/categories`,
    },
    {
      label: 'Customize your booking form',
      description: 'Add questions specific to your business',
      done: (company.custom_questions?.length ?? 0) > 0,
      href: `/${company.slug}/form`,
    },
    {
      label: 'Get your first lead',
      description: 'Share your booking link to get started',
      done: company.hasRealLead,
      href: `/${company.slug}/dashboard`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14]">
      {/* ── Top status bar ── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 overflow-hidden bg-white/[0.06]">
              {company.logo_url ? (
                <img src={company.logo_url} className="w-full h-full object-contain p-1" alt="" />
              ) : (
                <span className="text-white text-[11px] font-semibold">{company.name?.charAt(0)}</span>
              )}
            </div>
            <span className="text-[13px] font-medium text-white truncate">{company.name}</span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-slate-400">Live</span>
            </div>
            <span className="text-[11px] font-medium text-slate-300 px-2 py-0.5 rounded border border-white/10">
              {planLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">

        <SetupChecklist steps={checklistSteps} />

        {/* ── Booking link — the one structured data block ── */}
        <div className="mb-3">
          <Eyebrow>Booking form</Eyebrow>
        </div>
        <div className="bg-white rounded-lg border border-slate-200/80 mb-10 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

            <div className="p-6 flex flex-col">
              <h2 className="text-[15px] font-semibold text-slate-900 mb-1.5">
                Share this link or QR code anywhere
              </h2>
              <p className="text-[12.5px] text-slate-500 leading-relaxed mb-5 max-w-md">
                Every submission lands in your dashboard as a lead — no setup required on the customer's end.
              </p>

              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-md border border-slate-200 bg-slate-50 mb-3 max-w-md">
                <code className="text-[12.5px] font-mono text-slate-600 truncate flex-1">
                  lead2project.com/{company.slug}
                </code>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <a
                  href={publicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  View form <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

           <div className="p-6 flex flex-col items-center justify-center gap-2 bg-slate-50/50">
              <button
                onClick={() => setShowQrModal(true)}
                className="w-32 h-32 rounded-md bg-white border border-slate-200 flex items-center justify-center overflow-hidden hover:border-slate-300 transition-colors"
              >
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} className="w-full h-full" alt="Booking QR code" />
                ) : (
                  <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                )}
              </button>
              <span className="text-[11px] text-black font-medium">Download QR</span>
            </div>

          </div>
        </div>

        {/* ── Workspace cards ── */}
        <div className="mb-3">
          <Eyebrow>Workspace</Eyebrow>
        </div>
        {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
            <div className="relative bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className={`p-6 rounded-xl mb-5 flex items-center justify-center transition-colors duration-500 ${qrStyle === 'dark' ? 'bg-gray-900' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="relative">
                  <img src={qrCodeUrl} className="w-44 h-44 sm:w-52 sm:h-52" />
                  {includeLogo && company.logo_url && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-lg p-1 shadow-md border border-gray-100">
                        <img src={company.logo_url} className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  {['standard', 'brand', 'dark'].map(s => (
                    <button key={s} onClick={() => setQrStyle(s as any)}
                      className={`flex-1 py-2.5 rounded-lg border text-xs font-medium transition-all ${qrStyle === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Embed company logo</span>
                  <button onClick={() => setIncludeLogo(!includeLogo)} className={`w-10 h-5 rounded-full relative transition-colors ${includeLogo ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${includeLogo ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setShowQrModal(false)} className="py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition bg-gray-50 rounded-xl">Cancel</button>
                  <button onClick={downloadStyledQR} className="py-3 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Export PNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <NavCard
            label="Dashboard"
            description="Manage leads, schedule jobs, track every project"
            href={`/${company.slug}/dashboard`}
            mockup={<DashboardMockup />}
          />
          <NavCard
            label="Customer payments"
            description="Accept cards with Stripe, or use a manual payment link"
            href={`/${company.slug}/payments`}
            mockup={<InvoiceMockup />}
            badge={<StatusBadge status={paymentsStatus} />}
            locked={paymentsLocked}
            requiredPlan="Basic"
          />
          <NavCard
            label="Pricing templates"
            description="Task checklists and pricing by category, auto-loaded on new jobs"
            href={`/${company.slug}/categories`}
            mockup={<CategoriesMockup />}
          />
          <NavCard
            label="Booking form"
            description="Customize what customers fill out, branding, and custom questions"
            href={`/${company.slug}/form`}
            mockup={<FormMockup />}
          />
          <NavCard
            label="Google reviews"
            description="Auto-request a review from customers when a job's marked complete"
            href={`/${company.slug}/google-reviews`}
            mockup={<ReviewsMockup />}
            locked={reviewsLocked}
            requiredPlan="Basic"
          />
          <NavCard
            label="Settings"
            description="Pipeline, team, billing, and email configuration"
            href={`/${company.slug}/admin/settings`}
            mockup={<SettingsMockup />}
          />
        </div>
      </div>
    </div>
  );
}