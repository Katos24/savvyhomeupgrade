'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCodeLib from 'qrcode';
import {
  Building, Phone, ChevronLeft, ChevronRight,
  AlertCircle, ArrowRight, Loader2, X, Plus,
  RotateCcw, Copy, Check, Download, Sparkles, Mail,
  Camera,
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';

type Category = { value: string; label: string; emoji?: string };

const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
};

const STEPS = [
  { id: 'company',    label: 'Your Business' },
  { id: 'categories', label: 'Job Types'      },
  { id: 'done',       label: 'Go Live'        },
];

// ─── LOADING ──────────────────────────────────────────────────────────────────

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
          if (companyData.company.onboarding_completed) {
            router.push(`/${slug}/dashboard`);
            return;
          }
          setCompany(companyData.company);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadData();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
    </div>
  );

  if (!company) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <p className="text-red-400 text-sm font-bold">Error loading account. Please refresh.</p>
    </div>
  );

  return <OnboardingWizard company={company} />;
}

// ─── WIZARD ───────────────────────────────────────────────────────────────────

function OnboardingWizard({ company }: { company: any }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1 state
  const [companyName, setCompanyName] = useState(company.name || '');
  const [phone, setPhone] = useState(formatPhone(company.phone || ''));
const [email, setEmail] = useState(company.email || '');
 const [brandColor, setBrandColor] = useState(company.email_brand_color_1 || '#2563eb');
  const [brandColor2, setBrandColor2] = useState(company.email_brand_color_2 || '#0891b2');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  // Step 2 state
const defaultCats: Category[] = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
  const [categories, setCategories] = useState<Category[]>(
    company.form_categories?.length > 0 ? company.form_categories : defaultCats
  );
  const allCats: Category[] = [
    ...defaultCats,
    ...categories.filter(c => !defaultCats.some(d => d.value === c.value)),
  ];
    company.form_categories?.length > 0 ? company.form_categories : defaultCats
 
  const [newCatLabel, setNewCatLabel] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // Step 3 state
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/${company.slug}` : '';

  useEffect(() => {
    if (!publicLink) return;
    QRCodeLib.toDataURL(publicLink, { width: 300, margin: 2, color: { dark: '#000000', light: '#FFFFFF' } })
      .then(url => setQrCodeUrl(url));
  }, [publicLink]);

  if (company.onboarding_completed) return null;

  const showErr = (msg: string) => { setError(msg); setTimeout(() => setError(''), 4000); };
  const isDone = currentStep === STEPS.length - 1;
  const progress = ((currentStep + 0.5) / STEPS.length) * 100;

  // ── Save functions ──

  const saveCompany = async (): Promise<boolean> => {
    if (!companyName.trim()) { showErr('Company name is required'); return false; }
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
        body: JSON.stringify({
          action: 'update-general',
          data: {
            name: companyName,
            email,
            phone: phone.replace(/\D/g, ''),
            email_brand_color_1: brandColor,
            email_brand_color_2: brandColor2,
            logo_url: logoUrl,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) { showErr(data.error || 'Failed to save'); return false; }
      return true;
    } catch { showErr('Failed to save'); return false; }
    finally { setSaving(false); }
  };

  const saveCategories = async (): Promise<boolean> => {
    if (categories.length < 3) { showErr('Select at least 3 job types'); return false; }
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

  const handleSkip = async () => {
    if (currentStep === 1) {
      // Still complete onboarding so they don't get stuck
      await fetch('/api/onboarding/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, skipped: true }),
      });
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const addCat = () => {
    if (!newCatLabel.trim()) return;
    if (categories.length >= 20) { showErr('Max 20 job types'); return; }
    const val = newCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories(prev => [...prev, { value: val, label: newCatLabel.trim() }]);
    setNewCatLabel(''); setShowAddCat(false);
  };

  const removeCategory = (idx: number) => {
    if (categories.length <= 3) { showErr('Keep at least 3 job types'); return; }
    setCategories(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Render ──

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
                <span className="text-white text-[10px] font-black tracking-tight">L2P</span>
              </div>
              <div>
                <p className="text-white font-black text-sm leading-none">Setup</p>
                <p className="text-white/30 text-[10px] mt-0.5">Step {currentStep + 1} of {STEPS.length} · {STEPS[currentStep].label}</p>
              </div>
            </div>
            {!isDone && (
              <button
                onClick={handleSkip}
                className="text-white/30 hover:text-white/60 text-xs font-semibold transition"
              >
                Skip →
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-white/10">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: i < currentStep ? '100%' : i === currentStep ? '50%' : '0%',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── ERROR ──────────────────────────────────────────────────────────── */}
      {error && (
        <div className="max-w-lg mx-auto w-full px-4 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-2xl">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        </div>
      )}

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8 pb-36">

        {/* ── STEP 1: Company ─────────────────────────────────────────────── */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">Tell us about your business.</h2>
              <p className="text-white/40 text-sm mt-1.5">You can update all of this anytime in Settings.</p>
            </div>

            {/* Logo upload */}
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Logo</label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 group-hover:border-blue-500/50 bg-white/5 flex items-center justify-center overflow-hidden transition-all shrink-0">
                  {logoPreview
                    ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    : <div className="flex flex-col items-center gap-1">
                        <Camera className="w-5 h-5 text-white/20 group-hover:text-blue-400 transition" />
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Upload</span>
                      </div>
                  }
                </div>
                <div>
                  <p className="text-sm font-bold text-white/70 group-hover:text-white transition">
                    {logoPreview ? 'Change logo' : 'Upload your logo'}
                  </p>
                  <p className="text-xs text-white/30 mt-1">PNG, JPG, SVG — shows in emails and your booking page</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setLogoFile(f); const r = new FileReader(); r.onloadend = () => setLogoPreview(r.result as string); r.readAsDataURL(f); }
                }} />
              </label>
            </div>

            {/* Company Name */}
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Ridge Line Roofing"
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-base placeholder-white/20 outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

 {/* Email */}
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="hello@yourcompany.com"
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-base placeholder-white/20 outline-none focus:border-blue-500/60 transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Business Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(formatPhone(e.target.value))}
                  placeholder="(555) 000-0000"
                  maxLength={14}
                  className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-base placeholder-white/20 outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all"
                />
              </div>
            </div>

          {/* Brand Colors */}
            <div>
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">Brand Colors</label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                {/* Gradient preview */}
                <div
                  className="h-10 rounded-xl w-full"
                  style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor2})` }}
                />
                {/* Color pickers */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={e => setBrandColor(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden shrink-0"
                    />
                    <span className="text-xs font-mono font-bold text-white/40">{brandColor}</span>
                  </div>
                  <span className="text-white/20 font-black">→</span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="color"
                      value={brandColor2}
                      onChange={e => setBrandColor2(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0 overflow-hidden shrink-0"
                    />
                    <span className="text-xs font-mono font-bold text-white/40">{brandColor2}</span>
                  </div>
                </div>
             
                 
          
              </div>
            </div>
              </div>
        )}

        {/* ── STEP 2: Categories ──────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">What kind of jobs do you run?</h2>
              <p className="text-white/40 text-sm mt-1.5">Customers pick from these when they submit a request. Tap to remove any that don't apply.</p>
            </div>

            {/* Preview hint */}
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
              <div>
                <p className="text-xs font-semibold text-blue-300 leading-relaxed">
                  When a customer scans your QR code, they'll see these as service options on their form.
                </p>
                <p className="text-xs text-blue-400/60 mt-1">
                  Each job type gets its own task checklist and quote template in Settings.
                </p>
              </div>
            </div>

         {/* Category pills */}
            <div className="flex flex-wrap gap-2">
              {allCats.map((cat, idx) => {
                const isSelected = categories.some(c => c.value === cat.value);
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isSelected) {
                        if (categories.length <= 3) { showErr('Keep at least 3 job types'); return; }
                        setCategories(prev => prev.filter(c => c.value !== cat.value));
                      } else {
                        if (categories.length >= 20) { showErr('Max 20 job types'); return; }
                        setCategories(prev => [...prev, cat]);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-blue-600/30 border-blue-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-blue-400 shrink-0" />}
                    <span className="text-sm font-bold">{cat.label}</span>
                  </button>
                );
              })}

              {/* Add new */}
              {!showAddCat && categories.length < 20 && (
                <button
                  onClick={() => setShowAddCat(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/40 rounded-xl transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-sm font-bold text-white/40">Add type</span>
                </button>
              )}
            </div>

            {/* Add input */}
            {showAddCat && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatLabel}
                  onChange={e => setNewCatLabel(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCat()}
                  placeholder="e.g. Emergency Repair"
                  autoFocus
                  className="flex-1 px-4 py-3 bg-white/5 border border-blue-500/40 rounded-xl text-white font-bold text-sm placeholder-white/20 outline-none focus:border-blue-500 transition-all"
                />
                <button onClick={addCat} className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black rounded-xl transition">
                  Add
                </button>
                <button onClick={() => { setShowAddCat(false); setNewCatLabel(''); }} className="p-3 bg-white/5 hover:bg-white/10 text-white/40 rounded-xl transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Reset + count */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-white/30 font-semibold">
                {categories.length} selected · min 3
              </p>
              <button
                onClick={() => setCategories(defaultCats)}
                className="flex items-center gap-1.5 text-xs font-bold text-white/30 hover:text-white/60 transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset to defaults
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Done ────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="space-y-6">

            {/* Success */}
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Sparkles className="w-9 h-9 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-2">You're live.</h2>
              <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                Share your booking link and customers can start submitting jobs immediately.
              </p>
            </div>

            {/* Booking link */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Your Booking Link</p>
                <p className="text-xs text-white/25 mt-1">Share this everywhere — trucks, yard signs, Instagram bio</p>
              </div>
              <div className="p-4 space-y-4">
              {/* Link + copy */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-sm font-mono font-bold text-blue-300 truncate">{publicLink}</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className={`shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl font-black text-sm transition-all ${
                      copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>

  {/* Share actions */}
<div className="grid grid-cols-2 gap-2">

  {/* Instagram / Copy */}
  <a
    href="https://www.instagram.com/"
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => navigator.clipboard.writeText(publicLink)}
    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-pink-500 text-white font-black text-xs transition-all hover:opacity-90 active:scale-95"
  >
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
    Copy for Bio
  </a>

  {/* SMS */}
  <a
    href={`sms:?body=Book%20your%20job%20here%3A%20${encodeURIComponent(publicLink)}`}
    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all active:scale-95"
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    Text to Customer
  </a>

</div>

                {/* QR Code — hero */}
                <div className="flex flex-col items-center gap-3 pt-2">
                  {qrCodeUrl ? (
                    <div className="p-5 bg-white rounded-3xl shadow-xl">
                      <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44 sm:w-52 sm:h-52" />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-white/5 rounded-3xl flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                    </div>
                  )}
                  <p className="text-xs text-white/40 font-semibold text-center">Put this on your truck, yard signs, and business cards</p>
                  {qrCodeUrl && (
                    <button
                      onClick={() => { const a = document.createElement('a'); a.download = `${company.slug}-qr.png`; a.href = qrCodeUrl; a.click(); }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black text-sm rounded-2xl transition-all uppercase tracking-widest"
                    >
                      <Download className="w-4 h-4" /> Download QR Code
                    </button>
                  )}
                </div>
              </div>
            </div>
            

            {/* Go to dashboard */}
            <a
              href={`/${company.slug}/dashboard`}
              className="w-full py-5 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-[0.98] shadow-2xl shadow-blue-600/30"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Open my dashboard
              <ArrowRight className="w-5 h-5" />
            </a>

            <p className="text-center text-xs text-white/20 font-semibold">
              You can customize your pipeline, email templates, and team in Settings anytime.
            </p>
          </div>
        )}

      </div>

      {/* ── BOTTOM NAV ─────────────────────────────────────────────────────── */}
      {!isDone && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f1e]/95 backdrop-blur-md border-t border-white/5">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            {currentStep > 0 ? (
              <button
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
                className="flex items-center gap-2 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-bold rounded-2xl transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}
            <button
              onClick={handleNext}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-4 text-white font-black text-base rounded-2xl transition-all disabled:opacity-50 active:scale-[0.98] shadow-xl shadow-blue-600/20"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : currentStep === 1 ? (
                <>Finish Setup <ChevronRight className="w-5 h-5" /></>
              ) : (
                <>Save & Continue <ChevronRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}