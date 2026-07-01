'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Workflow, Mail, ArrowLeft, Users, CreditCard, ChevronRight,
  Trash2, Copy, Check, Phone, ExternalLink, Globe, Lock, Save, X, Pencil, Loader2,
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

function MenuCard({ icon: Icon, label, desc, color, onClick, locked, requiredPlan }: {
  icon: any; label: string; desc: string; color: string;
  onClick: () => void; locked?: boolean; requiredPlan?: string;
}) {
  return (
    <button onClick={onClick}
      className="bg-white rounded-xl p-4 sm:p-5 text-left group hover:shadow-md transition-all duration-200 flex flex-col h-full active:scale-[0.98] border border-gray-100 relative overflow-hidden">
      {locked && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
          <Lock className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-[10px] font-medium text-gray-400">{requiredPlan}</span>
        </div>
      )}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: locked ? '#f1f5f9' : `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color: locked ? '#94a3b8' : color }} />
      </div>
      <p className={`text-sm font-semibold leading-tight mb-1 ${locked ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-600'} transition-colors`}>{label}</p>
      <p className="text-[12px] text-gray-500 leading-relaxed flex-1 hidden sm:block">{desc}</p>
      <div className={`mt-3 flex items-center gap-1 text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-all ${locked ? 'text-gray-400' : 'text-blue-500'}`}>
        {locked ? `Upgrade to ${requiredPlan}` : 'Configure'} <ChevronRight className="w-3 h-3" />
      </div>
    </button>
  );
}

export default function CompanySettingsClient({ company, currentUser }: { company: any; currentUser: any }) {
  const planTier = (company.plan_tier ?? 'free') as PlanTier;

  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [companyData, setCompanyData] = useState(company);

  // Contact info
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactSaving, setContactSaving] = useState(false);
  const [contactSaved, setContactSaved] = useState(false);
  const [contactForm, setContactForm] = useState({
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
  });

  // Digest / BCC
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
        setContactForm({ email: data.company.email || '', phone: data.company.phone || '', website: data.company.website || '' });
      }
    } catch {}
    setActiveTab(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [company.slug]);

  const handleSaveContact = async () => {
    setContactSaving(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-general',
          data: {
            name: companyData.name, // always pass existing name to avoid clearing it
            email: contactForm.email || null,
            phone: contactForm.phone || null,
            website: contactForm.website || null,
          },
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setCompanyData(result.company);
        setIsEditingContact(false);
        setContactSaved(true);
        setTimeout(() => setContactSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setContactSaving(false);
    }
  };

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

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '');
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6,10)}`;
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

  // ── Tab view ──
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

  // ── Main settings view ──
  return (
    <div className="min-h-screen bg-[#0B0E14] pb-20">
      <header className="border-b border-white/[0.06] px-4 py-3.5 sticky top-0 z-40 bg-[#0B0E14]">
        <div className="max-w-4xl mx-auto flex items-center gap-3 min-w-0">
          <Link href={`/${company.slug}/home`} className="flex items-center gap-1.5 text-[12.5px] text-slate-400 hover:text-white transition-colors shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Home
          </Link>
          <span className="text-white/20 shrink-0">/</span>
          <span className="text-[12.5px] font-medium text-white truncate">Settings</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* ── CONTACT INFO ── */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[14px] font-semibold text-gray-900">{companyData.name}</h2>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white inline-block mt-1 ${planTier === 'pro' ? 'bg-blue-600' : planTier === 'basic' ? 'bg-gray-700' : 'bg-emerald-600'}`}>
                {planTier} plan
              </span>
            </div>
            {!isEditingContact
              ? <button onClick={() => setIsEditingContact(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-[12px] font-medium transition">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              : <div className="flex gap-2">
                  <button onClick={() => { setIsEditingContact(false); setContactForm({ email: companyData.email || '', phone: companyData.phone || '', website: companyData.website || '' }); }}
                    className="flex items-center gap-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-xl text-[12px] font-medium hover:bg-gray-50 transition">
                    <X className="w-3 h-3" /> Cancel
                  </button>
                  <button onClick={handleSaveContact} disabled={contactSaving}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-[12px] font-medium transition">
                    {contactSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : contactSaved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {contactSaving ? 'Saving...' : contactSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
            }
          </div>

          <div className="p-5 space-y-3">
            {isEditingContact ? (
              <>
                {[
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'hello@yourcompany.com', icon: <Mail className="w-3.5 h-3.5 text-blue-500" /> },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '(555) 555-5555', icon: <Phone className="w-3.5 h-3.5 text-emerald-500" /> },
                  { label: 'Company Website', key: 'website', type: 'text', placeholder: 'https://yourwebsite.com', icon: <Globe className="w-3.5 h-3.5 text-violet-500" /> },
                ].map(field => (
                  <div key={field.key} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus-within:bg-white focus-within:border-gray-200 transition">
                    {field.icon}
                    <input
                      type={field.type}
                      value={(contactForm as any)[field.key]}
                      placeholder={field.placeholder}
                      onChange={e => {
                        if (field.key === 'phone') {
                          const d = e.target.value.replace(/\D/g, '');
                          if (d.length <= 10) setContactForm({ ...contactForm, phone: formatPhone(d) });
                        } else {
                          setContactForm({ ...contactForm, [field.key]: e.target.value });
                        }
                      }}
                      className="flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Email', value: companyData.email, icon: <Mail className="w-3.5 h-3.5 text-blue-500" /> },
                  { label: 'Phone', value: companyData.phone ? formatPhone(companyData.phone) : null, icon: <Phone className="w-3.5 h-3.5 text-emerald-500" /> },
                  { label: 'Company Website', value: companyData.website ? companyData.website.replace(/^https?:\/\//, '') : null, icon: <Globe className="w-3.5 h-3.5 text-violet-500" />, href: companyData.website },
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-1.5 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wide">{item.label}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-900 truncate">
                      {item.value || <span className="text-gray-400 font-normal">Not set</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Booking link */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10.5px] font-medium text-gray-500 mb-0.5">Booking link</p>
                <code className="text-[12px] font-mono text-gray-700 truncate block">lead2project.com/{company.slug}</code>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border border-gray-200 text-gray-700 hover:bg-white transition">
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </section>

        {/* ── AUTOMATIONS ── */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-[14px] font-semibold text-gray-900">Automations</h2>
          </div>
          <div className="divide-y divide-gray-100">

            {/* Daily digest */}
            {can(planTier, 'daily_digest') ? (
              <button onClick={() => setShowDigestConfirm(true)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition text-left">
                <div>
                  <p className="text-[13px] font-medium text-gray-900">Daily digest</p>
                  <p className="text-[12px] text-gray-600 mt-0.5">6AM summary of leads, jobs, and payments</p>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${digestEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${digestEnabled ? 'left-5' : 'left-0.5'}`} />
                </div>
              </button>
            ) : (
              <button onClick={() => openTab('billing')}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-blue-50/40 transition text-left group">
                <div>
                  <p className="text-[13px] font-medium text-gray-400 group-hover:text-blue-600 transition-colors">Daily digest</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">6AM summary of leads, jobs, and payments</p>
                </div>
                <span className="text-[10px] font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-full shrink-0">Pro</span>
              </button>
            )}

            {/* BCC */}
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-[13px] font-medium text-gray-900">BCC me on customer emails</p>
                <p className="text-[12px] text-gray-600 mt-0.5">Get a copy when a quote or schedule email sends</p>
              </div>
              <button onClick={handleToggleBcc} disabled={bccSaving}
                className={`w-10 h-5 rounded-full relative transition-colors shrink-0 disabled:opacity-50 ${bccEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${bccEnabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

          </div>
        </section>

        {/* ── SYSTEM CONFIGURATION ── */}
        <div>
          <p className="text-[11px] font-medium text-white/40 mb-3 px-1">System configuration</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MenuCard icon={Workflow} label="Pipeline" desc="Customize your lead stages and workflow." color="#f59e0b" onClick={() => openTab('pipeline')} locked={!can(planTier, 'settings_pipeline')} requiredPlan="Basic" />
            <MenuCard icon={Mail} label="Email Templates" desc="Personalize the emails customers receive." color="#3b82f6" onClick={() => openTab('email-templates')} locked={!can(planTier, 'settings_email_templates')} requiredPlan="Pro" />
            <MenuCard icon={Users} label="Team" desc="Invite your crew and assign leads." color="#0ea5e9" onClick={() => openTab('team')} locked={!can(planTier, 'settings_team')} requiredPlan="Basic" />
          </div>
        </div>

        {/* ── BILLING ── */}
        {planTier !== 'free' && (
          <div>
            <p className="text-[11px] font-medium text-white/40 mb-3 px-1">Billing</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MenuCard icon={CreditCard} label="Subscription" desc="Manage your plan and billing." color="#10b981" onClick={() => openTab('billing')} />
            </div>
          </div>
        )}

        {planTier === 'free' && (
          <a href={`/${company.slug}/admin/settings`} onClick={e => { e.preventDefault(); openTab('billing'); }}
            className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 transition">
            <CreditCard className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Upgrade your plan</span>
            <span className="text-xs text-white/60">From $49.99/mo</span>
          </a>
        )}

        {/* ── FOOTER ── */}
        <div className="flex justify-end">
          <a href={`/${company.slug}/dashboard/deleted-leads`}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-500/10 bg-red-500/5 rounded-xl transition hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-300">Recovery center</span>
          </a>
        </div>
      </div>

      {/* Digest confirm modal */}
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