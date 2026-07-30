'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Workflow, Mail, ArrowLeft, Users, CreditCard, ChevronRight,
  Trash2,  Check, Lock,  Sparkles,
} from 'lucide-react';
import { can, FEATURE_PLAN_MAP, PLAN_CONFIG, UPGRADE_PROMPTS, type PlanTier } from '@/lib/permissions';
import Link from 'next/link';
import PipelineTab from './tabs/PipelineTab';
import EmailTemplatesTab from './tabs/EmailTemplatesTab';
import TeamTab from './tabs/TeamTab';
import BillingTab from './tabs/BillingTab';

type Tab = 'pipeline' | 'email-templates' | 'team' | 'billing';

const TAB_LABELS: Record<Tab, string> = {
  pipeline: 'Pipeline',
  'email-templates': 'Email Templates',
  team: 'Team Access',
  billing: 'Subscription Billing',
};

const TAB_FEATURE_MAP: Partial<Record<Tab, Parameters<typeof can>[1]>> = {
  pipeline: 'settings_pipeline',
  'email-templates': 'settings_email_templates',
  team: 'settings_team',
};

function UpgradeOverlay({ feature, companySlug }: { feature: string; companySlug: string }) {
  const prompt = UPGRADE_PROMPTS[feature];
  const requiredPlan = (FEATURE_PLAN_MAP as any)[feature] as PlanTier | undefined;
  const planKey = requiredPlan === 'pro' ? 'pro' : 'basic';
  const config = PLAN_CONFIG[planKey];
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-8 text-center">
      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
        <Lock className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-base font-semibold text-blue-900 mb-2">{prompt?.title ?? 'Upgrade to unlock'}</h3>
      {prompt?.description && <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">{prompt.description}</p>}
      {config?.features && (
        <ul className="text-left space-y-2 mb-6 max-w-xs mx-auto">
          {config.features.slice(0, 4).map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
              <Check className="w-3.5 h-3.5 text-green-500 shrink-0" /> {f}
            </li>
          ))}
        </ul>
      )}
      <a href={`/${companySlug}/admin/settings`}
        onClick={e => { e.preventDefault(); window.location.href = `/${companySlug}/admin/settings`; }}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition">
        Upgrade to {config.label}
        {config?.price && <span className="opacity-75 font-normal">— ${config.price}/mo</span>}
      </a>
      <p className="text-xs text-gray-500 mt-3">Cancel anytime. No contracts.</p>
    </div>
  );
}

function MenuCard({ icon: Icon, label, desc, color, onClick, locked, requiredPlan, emphasized }: {
  icon: any; label: string; desc: string; color: string;
  onClick: () => void; locked?: boolean; requiredPlan?: string; emphasized?: boolean;
}) {
  return (
    <button onClick={onClick}
      className={`bg-white rounded-xl p-4 text-left group hover:shadow-md transition-all duration-200 flex flex-col h-full active:scale-[0.98] border relative overflow-hidden ${
        emphasized ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-gray-100'
      }`}>
      {locked && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
          <Lock className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">{requiredPlan}</span>
        </div>
      )}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2.5" style={{ backgroundColor: locked ? '#f1f5f9' : `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color: locked ? '#94a3b8' : color }} />
      </div>
      <p className={`text-sm font-semibold leading-tight mb-1 ${locked ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>{label}</p>
      <p className="text-[12px] text-gray-500 leading-relaxed flex-1 hidden sm:block">{desc}</p>
      <div className={`mt-2.5 flex items-center gap-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-all ${locked ? 'text-gray-400' : 'text-blue-500'}`}>
        {locked ? `Upgrade to ${requiredPlan}` : 'Configure'} <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  );
}

export default function CompanySettingsClient({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'free') as PlanTier;

  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [companyData, setCompanyData] = useState(company);

 
  const [digestEnabled, setDigestEnabled] = useState(company.daily_digest_enabled ?? false);
  const [showDigestConfirm, setShowDigestConfirm] = useState(false);
  const [bccEnabled, setBccEnabled] = useState(company.bcc_sender_on_email ?? false);
  const [bccSaving, setBccSaving] = useState(false);

  const [copied, setCopied] = useState(false);
  const [publicLink, setPublicLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setPublicLink(`${window.location.origin}/${company.slug}`);
  }, [company.slug]);

  useEffect(() => {
    setBccEnabled(companyData.bcc_sender_on_email ?? false);
  }, [companyData.bcc_sender_on_email]);

  const openTab = useCallback((tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeTab = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`);
      const data = await res.json();
      if (data.success && data.company) {
  setCompanyData(data.company);
}
    } catch {}
    setActiveTab(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [company.slug]);


  const handleToggleBcc = async () => {
    const newVal = !bccEnabled;
    setBccEnabled(newVal);
    setBccSaving(true);
    try {
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-bcc', data: { bcc_sender_on_email: newVal } }),
      });
    } catch {
      setBccEnabled(!newVal);
    } finally {
      setBccSaving(false);
    }
  };


  const renderUnlockedTab = (tab: Tab, data: any) => {
    switch (tab) {
      case 'pipeline': return <PipelineTab company={data} currentUser={currentUser} />;
      case 'email-templates': return <EmailTemplatesTab company={data} currentUser={currentUser} />;
      case 'team': return <TeamTab company={data} currentUser={currentUser} />;
      case 'billing': return <BillingTab company={data} currentUser={currentUser} />;
      default: return null;
    }
  };

  const renderTabContent = (tab: Tab) => {
    const featureKey = TAB_FEATURE_MAP[tab];
    if (featureKey && !can(planTier, featureKey)) {
      return (
        <div className="relative">
          <div className="blur-[3px] pointer-events-none select-none opacity-60" aria-hidden>
            {renderUnlockedTab(tab, companyData)}
          </div>
          <div className="absolute inset-0 flex items-start justify-center pt-24 z-10">
            <UpgradeOverlay feature={featureKey} companySlug={company.slug} />
          </div>
        </div>
      );
    }
    return renderUnlockedTab(tab, companyData);
  };

  if (activeTab) {
    return (
      <div className="min-h-screen bg-[#0B0E14]">
        <header className="border-b border-white/[0.06] px-4 py-3.5 sticky top-0 z-50 bg-[#0B0E14]">
          <div className="max-w-4xl mx-auto flex items-center gap-3 min-w-0">
            <Link href={`/${company.slug}/home`} className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-white transition-colors shrink-0">
              <ArrowLeft className="w-3.5 h-3.5" /> Home
            </Link>
            <span className="text-white/20 shrink-0">/</span>
            <button onClick={closeTab} className="text-[12.5px] text-slate-400 hover:text-white transition-colors shrink-0">Settings</button>
            <span className="text-white/20 shrink-0">/</span>
            <span className="text-[12.5px] font-medium text-white truncate">{TAB_LABELS[activeTab]}</span>
          </div>
        </header>
        <div className="max-w-5xl mx-auto px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-white rounded-2xl p-4 shadow-2xl">{renderTabContent(activeTab)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] pb-16">
      <header className="border-b border-white/[0.06] px-4 py-3.5 sticky top-0 z-40 bg-[#0B0E14]">
        <div className="max-w-4xl mx-auto flex items-center gap-3 min-w-0">
          <Link href={`/${company.slug}/home`} className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-white transition-colors shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span className="text-white/20 shrink-0">/</span>
          <span className="text-[12.5px] font-medium text-white truncate">Settings</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* ── BILLING — now first, and impossible to miss ── */}
        {planTier === 'free' ? (
          <button
            onClick={() => openTab('billing')}
            className="w-full text-left rounded-2xl p-6 bg-gradient-to-br from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.99]"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-tight">Upgrade your plan</p>
                  <p className="text-[13px] text-white/85 mt-0.5">Unlock payments, pricing tools, and more — starting at $49.99/mo</p>
                </div>
              </div>
              <span className="px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-bold text-sm shrink-0">
                See plans →
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => openTab('billing')}
            className="w-full text-left rounded-2xl p-5 bg-white border-2 border-emerald-200 ring-1 ring-emerald-100 hover:shadow-md transition-all flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Subscription & billing</p>
                <p className="text-[12px] text-gray-500 mt-0.5">Manage your plan, payment method, and invoices</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        )}

   

   

        {/* ── SYSTEM CONFIGURATION ── */}
        <div>
          <p className="text-[11px] font-medium text-white/40 mb-2.5 px-1">System configuration</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MenuCard icon={Workflow} label="Pipeline" desc="Customize your lead stages and workflow." color="#f59e0b" onClick={() => openTab('pipeline')} locked={!can(planTier, 'settings_pipeline')} requiredPlan="Basic" />
            <MenuCard icon={Mail} label="Email Templates" desc="Personalize the emails customers receive." color="#3b82f6" onClick={() => openTab('email-templates')} locked={!can(planTier, 'settings_email_templates')} requiredPlan="Pro" />
            <MenuCard icon={Users} label="Team" desc="Invite your crew and assign leads." color="#0ea5e9" onClick={() => openTab('team')} locked={!can(planTier, 'settings_team')} requiredPlan="Basic" />
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex justify-end">
          <a href={`/${company.slug}/dashboard/deleted-leads`}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-500/10 bg-red-500/5 rounded-xl transition hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-300">Recovery center</span>
          </a>
        </div>
      </div>

      {showDigestConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setShowDigestConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              {digestEnabled ? 'Turn off daily digest?' : 'Turn on daily digest?'}
            </h3>
            <p className="text-[12.5px] text-gray-600 mb-6">
              {digestEnabled ? 'You will stop receiving the 6AM daily summary email.' : 'You will receive a 6AM daily summary of your leads, jobs, and payments.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDigestConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={async () => {
                const newVal = !digestEnabled;
                setDigestEnabled(newVal);
                setShowDigestConfirm(false);
                await fetch(`/api/company/${company.slug}/settings`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update-notifications', data: { reminder_settings: company.reminder_settings, notification_preferences: { ...(company.notification_preferences || {}), daily_digest: { enabled: newVal }, digest_recipient: 'company' } } }),
                });
              }} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition ${digestEnabled ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {digestEnabled ? 'Turn off' : 'Turn on'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}