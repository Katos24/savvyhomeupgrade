'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCodeLib from 'qrcode';
import {
  Building, Mail, Phone, Globe, Plus, Trash2, Check, Copy, Link2,
  ChevronRight, ChevronLeft, AlertCircle, Sparkles, ArrowRight, RotateCcw, Loader2, X
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';

type Category = { value: string; label: string; emoji?: string };

const STEPS = [
  { id: 'company',    label: 'Company',    icon: '🏢', desc: 'Basic info & branding' },
  { id: 'categories', label: 'Categories', icon: '🏷️', desc: 'Your service types' },
  { id: 'done',       label: 'Done',       icon: '🎉', desc: "You're all set" },
];

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
};

// ═══════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        const userData = await userRes.json();
        if (!userData.success || !userData.user) { router.push('/login'); return; }

        const slug = userData.user.companySlug || userData.user.company_slug;
        const companyRes = await fetch(`/api/company/${slug}/info`);
        const companyData = await companyRes.json();

        if (companyData.success && companyData.company) {
          setCompany(companyData.company);
          if (companyData.company.onboarding_completed) {
            router.push(`/${slug}/dashboard`);
            return;
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
    </div>
  );

  if (!company) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
      <p className="text-red-400">Error loading company data</p>
    </div>
  );

  return <OnboardingWizard company={company} />;
}

// ═══════════════════════════════════════════════════════
// WIZARD
// ═══════════════════════════════════════════════════════

function OnboardingWizard({ company }: { company: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Company
  const [companyData, setCompanyData] = useState({
    name: company.name || '',
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    email_brand_color_1: company.email_brand_color_1 || '#667eea',
    email_brand_color_2: company.email_brand_color_2 || '#764ba2',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  // Step 2: Categories
  const defaultCats: Category[] = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
  const [categories, setCategories] = useState<Category[]>(
    company.form_categories?.length > 0 ? company.form_categories : defaultCats
  );
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');

  // Step 3: Done
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/${company.slug}` : '';

  useEffect(() => {
    if (!publicLink) return;
    QRCodeLib.toDataURL(publicLink, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } })
      .then(url => setQrCodeUrl(url));
  }, [publicLink]);

  const showErr = (msg: string) => { setError(msg); setTimeout(() => setError(''), 4000); };
  const isDone = currentStep === STEPS.length - 1;

  // ── SAVE FUNCTIONS ──

  const saveCompany = async (): Promise<boolean> => {
    if (!companyData.name.trim()) { showErr('Company name is required'); return false; }
    setSaving(true); setError('');
    try {
      let logoUrl = company.logo_url;
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        fd.append('companySlug', company.slug);
        const r = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const d = await r.json();
        if (d.success) logoUrl = d.logoUrl;
      }
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-general', data: { ...companyData, logo_url: logoUrl } }),
      });
      const data = await res.json();
      if (!data.success) { showErr(data.error || 'Failed to save'); return false; }
      return true;
    } catch { showErr('Failed to save'); return false; }
    finally { setSaving(false); }
  };

  const saveCategories = async (): Promise<boolean> => {
    if (categories.length < 3) { showErr('Need at least 3 categories'); return false; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-categories', data: { form_categories: categories } }),
      });
      const data = await res.json();
      if (!data.success) { showErr(data.error || 'Failed to save'); return false; }
      await fetch('/api/onboarding/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, skipped: false }),
      });
      return true;
    } catch { showErr('Failed to save'); return false; }
    finally { setSaving(false); }
  };

  const handleNext = async () => {
    let ok = true;
    if (currentStep === 0) ok = await saveCompany();
    else if (currentStep === 1) ok = await saveCategories();
    if (ok) setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const handleSkip = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));

  const addCat = () => {
    if (!newCatLabel.trim()) return;
    if (categories.length >= 20) { showErr('Max 20 categories'); return; }
    const val = newCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories([...categories, { value: val, label: newCatLabel.trim() }]);
    setNewCatLabel(''); setShowAddCat(false);
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>

      {/* HEADER */}
      <div className="sticky top-0 z-40 border-b border-white/10" style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">L2P</span>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm">Set Up Your Account</h1>
                <p className="text-white/40 text-xs">Step {currentStep + 1} of {STEPS.length}</p>
              </div>
            </div>
            {!isDone && (
              <button onClick={handleSkip} className="text-white/40 hover:text-white/70 text-xs font-semibold transition">
                Skip this step →
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: i < currentStep ? '100%' : i === currentStep ? '50%' : '0%', background: i <= currentStep ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'transparent' }} />
                </div>
                <span className="text-xs font-semibold hidden sm:block" style={{ color: i <= currentStep ? '#a5b4fc' : 'rgba(255,255,255,0.2)' }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-2xl">{STEPS[currentStep].icon}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{STEPS[currentStep].label}</h2>
            <p className="text-sm text-white/40">{STEPS[currentStep].desc}</p>
          </div>
        </div>

        {/* STEP 1: COMPANY */}
        {currentStep === 0 && (
          <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Company Info</span>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-2">Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain border border-gray-200 rounded-lg bg-gray-50" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400">
                      {companyData.name.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setLogoFile(f); const r = new FileReader(); r.onloadend = () => setLogoPreview(r.result as string); r.readAsDataURL(f); }
                    }} className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:rounded-md cursor-pointer" />
                    <p className="text-xs text-gray-400 mt-1">Shows in emails and your booking page</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">
                  <Building className="w-3.5 h-3.5" /> Company Name <span className="text-red-400">*</span>
                </label>
                <input type="text" value={companyData.name} onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" placeholder="Your Company Name" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5"><Mail className="w-3.5 h-3.5" /> Contact Email</label>
                  <input type="email" value={companyData.email} onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" placeholder="contact@company.com" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                  <input type="tel" value={companyData.phone} onChange={(e) => setCompanyData({ ...companyData, phone: formatPhone(e.target.value) })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" placeholder="(555) 123-4567" maxLength={14} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5"><Globe className="w-3.5 h-3.5" /> Website</label>
                  <input type="url" value={companyData.website} onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" placeholder="https://yourcompany.com" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wide block mb-1.5">Brand Colors</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={companyData.email_brand_color_1}
                      onChange={(e) => setCompanyData({ ...companyData, email_brand_color_1: e.target.value })}
                      className="w-10 h-10 cursor-pointer border-2 border-gray-200 rounded-xl p-0.5" />
                    <input type="color" value={companyData.email_brand_color_2}
                      onChange={(e) => setCompanyData({ ...companyData, email_brand_color_2: e.target.value })}
                      className="w-10 h-10 cursor-pointer border-2 border-gray-200 rounded-xl p-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORIES */}
        {currentStep === 1 && (
          <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Service Categories</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{categories.length}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCategories(defaultCats)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition">
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
                {categories.length < 20 && (
                  <button onClick={() => setShowAddCat(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                )}
              </div>
            </div>

            {showAddCat && (
              <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
                <div className="flex gap-2">
                  <input type="text" value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCat()}
                    placeholder="e.g., Emergency Repair" autoFocus
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />
                  <button onClick={addCat} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">Add</button>
                  <button onClick={() => { setShowAddCat(false); setNewCatLabel(''); }}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition">Cancel</button>
                </div>
              </div>
            )}

          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
  {categories.map((cat, idx) => (
    <div key={idx}
      className="group relative flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg transition">
      <span className="text-sm font-semibold text-gray-700 group-hover:text-indigo-700 truncate">{cat.label}</span>
      <button onClick={() => { if (categories.length <= 3) { showErr('Min 3 categories'); return; } setCategories(categories.filter((_, i) => i !== idx)); }}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-0.5 text-red-400 hover:text-red-600 transition">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  ))}
</div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">These appear as options when customers submit a lead. Min 3, max 20.</p>
            </div>
          </div>
        )}

        {/* STEP 3: DONE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl text-center">
              <div className="px-6 py-10">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">Your account is configured. Share your booking link with customers to start receiving leads.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Booking Link</span>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-400">Customers use this link to submit leads directly to your dashboard</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono truncate">{publicLink}</div>
                  <button onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className={`px-4 py-3 rounded-lg text-sm font-bold transition flex items-center gap-2 ${copied ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
                <div className="border-t border-gray-100 pt-4 flex flex-col items-center gap-3">
                  {qrCodeUrl ? (
                    <div className="bg-white p-4 border-2 border-gray-200 rounded-xl inline-block">
                      <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                    </div>
                  )}
                  <p className="text-xs text-gray-400">Print on business cards, flyers, or storefronts</p>
                  {qrCodeUrl && (
                    <button onClick={() => { const a = document.createElement('a'); a.download = `${company.slug}-qr-code.png`; a.href = qrCodeUrl; a.click(); }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition">
                      <ArrowRight className="w-3.5 h-3.5" /> Download QR Code
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">What's Next</span>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { emoji: '🔗', title: 'Share your booking link', desc: 'Add it to your website, social media, or email signature' },
                  { emoji: '👥', title: 'Invite your team', desc: 'Add team members in Settings → Team to assign leads' },
                  { emoji: '⚙️', title: 'Fine-tune in Settings', desc: 'Adjust categories, pipeline, email templates, and more anytime' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 px-5 py-4">
                    <span className="text-xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
                    <div><p className="font-semibold text-gray-800 text-sm">{tip.title}</p><p className="text-xs text-gray-400 mt-0.5">{tip.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <a href={`/${company.slug}/dashboard`}
              className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Go to Your Dashboard <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      {!isDone && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <button onClick={handleBack} className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-lg transition flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            <button onClick={handleNext} disabled={saving}
              className="px-8 py-2.5 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : currentStep === 1 ? (
                <>Finish Setup <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Save & Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}