'use client';

import { useState, useEffect } from 'react';
import {
  Copy, Check, ExternalLink, ArrowUpRight, Loader2,
} from 'lucide-react';
import QRCodeLib from 'qrcode';

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
  plan_tier?: string;
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
      {children}
    </span>
  );
}

function NavRow({
  label, description, stat, statLabel, href, badge,
}: {
  label: string;
  description: string;
  stat?: React.ReactNode;
  statLabel?: string;
  href: string;
  badge?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-6 px-6 py-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[13px] font-semibold text-slate-900">{label}</h3>
          {badge}
        </div>
        <p className="text-[12.5px] text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center gap-5 shrink-0">
        {stat !== undefined && (
          <div className="text-right">
            <div className="text-[15px] font-semibold text-slate-900 tabular-nums leading-none">{stat}</div>
            {statLabel && <div className="text-[10px] text-slate-400 mt-1">{statLabel}</div>}
          </div>
        )}
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition-colors" />
      </div>
    </a>
  );
}

export default function HomeClient({ company }: { company: Company }) {
  const [publicLink, setPublicLink] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const [leadStats, setLeadStats] = useState<{ total: number } | null>(null);
  const [paymentsStatus, setPaymentsStatus] = useState<'loading' | 'active' | 'pending' | 'not_connected'>('loading');

  useEffect(() => {
    if (typeof window !== 'undefined') setPublicLink(`${window.location.origin}/${company.slug}`);
  }, [company.slug]);

  useEffect(() => {
    if (!publicLink) return;
    QRCodeLib.toDataURL(publicLink, {
      width: 480,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark: '#0F172A', light: '#FFFFFF' },
    })
      .then(setQrCodeUrl)
      .catch(() => {});
  }, [publicLink]);

  useEffect(() => {
    fetch(`/api/company/${company.slug}/leads/count`)
      .then(r => r.json())
      .then(data => { if (data.success) setLeadStats({ total: data.count ?? 0 }); })
      .catch(() => {});
  }, [company.slug]);

  useEffect(() => {
    fetch(`/api/company/${company.slug}/stripe/connect-status`)
      .then(r => r.json())
      .then(data => setPaymentsStatus(data.chargesEnabled ? 'active' : 'pending'))
      .catch(() => setPaymentsStatus('not_connected'));
  }, [company.slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const planLabel = (company.plan_tier || 'free').replace(/^\w/, c => c.toUpperCase());

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

            <div className="p-6 flex items-center justify-center bg-slate-50/50">
              <div className="w-32 h-32 rounded-md bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} className="w-full h-full" alt="Booking QR code" />
                ) : (
                  <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Navigation list ── */}
        <div className="mb-3">
          <Eyebrow>Workspace</Eyebrow>
        </div>
        <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden">
          <NavRow
            label="Dashboard"
            description="Manage leads, schedule jobs, track every project"
            stat={leadStats ? leadStats.total : <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />}
            statLabel="total leads"
            href={`/${company.slug}/dashboard`}
          />
          <NavRow
            label="Customer payments"
            description="Accept cards with Stripe, or use a manual payment link"
            href={`/${company.slug}/payments`}
            badge={
              paymentsStatus === 'active' ? (
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  Connected
                </span>
              ) : paymentsStatus === 'pending' ? (
                <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                  Needs attention
                </span>
              ) : paymentsStatus === 'not_connected' ? (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                  Not connected
                </span>
              ) : null
            }
          />
          <NavRow
            label="Pricing templates"
            description="Task checklists and pricing by category, auto-loaded on new jobs"
            href={`/${company.slug}/categories`}
          />
          <NavRow
            label="Booking form"
            description="Customize what customers fill out, branding, and custom questions"
            href={`/${company.slug}/form`}
          />
          <NavRow
            label="Settings"
            description="Pipeline, team, billing, and email configuration"
            href={`/${company.slug}/admin/settings`}
          />
        </div>
      </div>
    </div>
  );
}