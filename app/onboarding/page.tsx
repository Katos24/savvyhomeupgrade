'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building, Mail, Phone, Globe, Palette, Plus, X, Trash2, CheckSquare,
  Save, ChevronRight, ChevronLeft, Check, Copy, Link2, ChevronUp, ChevronDown,
  Lock, Workflow, Users, Edit2, FileText, DollarSign, AlertCircle, Sparkles,
  ArrowRight, RotateCcw, Loader2,
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';

// ─── TYPES ────────────────────────────────────────────
type TaskTemplate = { id: string; label: string; order: number };
type Category = { value: string; label: string; emoji?: string; task_templates?: TaskTemplate[] };
type StatusOption = { value: string; label: string; color: string };
type CustomQuestion = { id: string; label: string; type: 'text' | 'select' | 'checkbox'; required: boolean; options?: string[] };
type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
type QuoteTemplate = { id: string; name: string; category: string; items: LineItem[]; total: number; notes?: string; created_at?: string; updated_at?: string };

const LOCKED_STATUSES = ['new', 'completed'];
const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'pink' },
  { value: 'contacted', label: 'Contacted', color: 'blue' },
  { value: 'quoted', label: 'Quoted', color: 'yellow' },
  { value: 'scheduled', label: 'Scheduled', color: 'purple' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
];
const COLOR_OPTIONS = [
  { value: 'blue', hex: '#3b82f6' }, { value: 'yellow', hex: '#eab308' },
  { value: 'purple', hex: '#a855f7' }, { value: 'orange', hex: '#f97316' },
  { value: 'green', hex: '#22c55e' }, { value: 'red', hex: '#ef4444' },
  { value: 'gray', hex: '#6b7280' }, { value: 'indigo', hex: '#6366f1' },
  { value: 'pink', hex: '#ec4899' },
];
const COLOR_PRESETS = [
  { name: 'Purple', c1: '#667eea', c2: '#764ba2' },
  { name: 'Blue', c1: '#2196F3', c2: '#1976D2' },
  { name: 'Green', c1: '#10b981', c2: '#059669' },
  { name: 'Orange', c1: '#f97316', c2: '#ea580c' },
  { name: 'Pink', c1: '#ec4899', c2: '#db2777' },
  { name: 'Red', c1: '#ef4444', c2: '#dc2626' },
];

const getColorHex = (name: string) => COLOR_OPTIONS.find(c => c.value === name)?.hex || '#3b82f6';
const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '');
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
};

const STEPS = [
  { id: 'company', label: 'Company', icon: '🏢', desc: 'Basic info & branding' },
  { id: 'categories', label: 'Categories', icon: '🏷️', desc: 'Service types & tasks' },
  { id: 'pipeline', label: 'Pipeline', icon: '📊', desc: 'Workflow stages' },
  { id: 'form', label: 'Form', icon: '📝', desc: 'Customer questions' },
  { id: 'quotes', label: 'Quotes', icon: '💰', desc: 'Quote templates' },
  { id: 'done', label: 'Done', icon: '🎉', desc: "You're all set" },
];

// ═══════════════════════════════════════════════════════
// MAIN PAGE (keeps your existing auth/loading logic)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <p className="text-red-400">Error loading company data</p>
      </div>
    );
  }

  return <OnboardingWizard company={company} />;
}

// ═══════════════════════════════════════════════════════
// WIZARD
// ═══════════════════════════════════════════════════════

function OnboardingWizard({ company }: { company: any }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Step 1: Company ──
  const [companyData, setCompanyData] = useState({
    name: company.name || '', email: company.email || '', phone: company.phone || '',
    website: company.website || '',
    email_brand_color_1: company.email_brand_color_1 || '#667eea',
    email_brand_color_2: company.email_brand_color_2 || '#764ba2',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(company.logo_url || '');

  // ── Step 2: Categories ──
  const defaultCats = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
  const [categories, setCategories] = useState<Category[]>(
    company.form_categories?.length > 0 ? company.form_categories : defaultCats
  );
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [editCatIdx, setEditCatIdx] = useState<number | null>(null);
  const [editTasks, setEditTasks] = useState<TaskTemplate[]>([]);
  const [newTaskLabel, setNewTaskLabel] = useState('');

  // ── Step 3: Pipeline ──
  const [statuses, setStatuses] = useState<StatusOption[]>(() => {
    if (Array.isArray(company.status_options) && company.status_options.length > 0) return company.status_options;
    return DEFAULT_STATUSES;
  });
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('blue');

  // ── Step 4: Form ──
  const [ctaHeading, setCtaHeading] = useState(company.cta_heading || '');
  const [ctaSuccess, setCtaSuccess] = useState(company.cta_success_message || '');
  const [questions, setQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);
  const [showAddQ, setShowAddQ] = useState(false);
  const [editQId, setEditQId] = useState<string | null>(null);
  const [newQ, setNewQ] = useState<CustomQuestion>({ id: '', label: '', type: 'text', required: false, options: [] });
  const [newOpt, setNewOpt] = useState('');

  // ── Step 5: Quotes ──
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
  const [showQuoteEditor, setShowQuoteEditor] = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplCat, setTplCat] = useState('');
  const [tplNotes, setTplNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [newLI, setNewLI] = useState({ description: '', quantity: '1', unitPrice: '' });

  // ── Step 6: Done ──
  const [copied, setCopied] = useState(false);
  const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/${company.slug}` : '';

  useEffect(() => {
    fetch(`/api/company/${company.slug}/quote-templates`)
      .then(r => r.json()).then(d => { if (d.success) setTemplates(d.templates || []); }).catch(() => {});
  }, [company.slug]);

  const showErr = (msg: string) => { setError(msg); setTimeout(() => setError(''), 4000); };
  const isDone = currentStep === STEPS.length - 1;

  // ── SAVE FUNCTIONS ──

  const saveCompany = async () => {
    if (!companyData.name.trim()) { showErr('Company name is required'); return false; }
    setSaving(true); setError('');
    try {
      let logoUrl = company.logo_url;
      if (logoFile) {
        const fd = new FormData(); fd.append('logo', logoFile); fd.append('companySlug', company.slug);
        const r = await fetch('/api/upload-logo', { method: 'POST', body: fd });
        const d = await r.json(); if (d.success) logoUrl = d.logoUrl;
      }
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-general', data: { ...companyData, logo_url: logoUrl } }),
      });
      const data = await res.json();
      if (!data.success) { showErr(data.error || 'Failed to save'); return false; }
      return true;
    } catch { showErr('Failed to save'); return false; } finally { setSaving(false); }
  };

  const saveCats = async () => {
    if (categories.length < 3) { showErr('Need at least 3 categories'); return false; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-categories', data: { form_categories: categories } }),
      });
      const data = await res.json();
      if (!data.success) { showErr(data.error || 'Failed to save'); return false; }
      return true;
    } catch { showErr('Failed to save'); return false; } finally { setSaving(false); }
  };

  const savePipeline = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-pipeline', data: { status_options: statuses } }),
      });
      const data = await res.json();
      if (!data.success) { showErr(data.error || 'Failed to save'); return false; }
      return true;
    } catch { showErr('Failed to save'); return false; } finally { setSaving(false); }
  };

  const saveForm = async () => {
    setSaving(true); setError('');
    try {
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-cta', data: { cta_heading: ctaHeading, cta_success_message: ctaSuccess } }),
      });
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-custom-questions', data: { custom_questions: questions } }),
      });
      return true;
    } catch { showErr('Failed to save'); return false; } finally { setSaving(false); }
  };

  const completeOnboarding = async () => {
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, skipped: false }),
      });
    } catch {}
  };

  const handleNext = async () => {
    let ok = true;
    if (currentStep === 0) ok = await saveCompany();
    else if (currentStep === 1) ok = await saveCats();
    else if (currentStep === 2) ok = await savePipeline();
    else if (currentStep === 3) ok = await saveForm();
    else if (currentStep === 4) { await completeOnboarding(); }
    if (ok) setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  const handleSkip = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));

  const skipAll = async () => {
    try {
      await fetch('/api/onboarding/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: company.id, skipped: true }),
      });
      router.push(`/${company.slug}/dashboard`);
    } catch {}
  };

  // ── HELPERS ──
  const typeLabel = (t: string) => t === 'select' ? 'Dropdown' : t === 'checkbox' ? 'Yes / No' : 'Text';

  const addCat = () => {
    if (!newCatLabel.trim()) return;
    if (categories.length >= 20) { showErr('Max 20 categories'); return; }
    const val = newCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories([...categories, { value: val, label: newCatLabel.trim(), task_templates: [] }]);
    setNewCatLabel(''); setShowAddCat(false);
  };

  const addStatus = () => {
    if (!newStatusLabel.trim()) return;
    if (statuses.length >= 10) { showErr('Max 10 statuses'); return; }
    const val = newStatusLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const u = [...statuses]; u.splice(u.length - 1, 0, { value: val, label: newStatusLabel.trim(), color: newStatusColor });
    setStatuses(u); setNewStatusLabel(''); setNewStatusColor('blue'); setShowAddStatus(false);
  };

  const moveStatus = (from: number, to: number) => {
    if (to < 0 || to >= statuses.length || to === 0 || to === statuses.length - 1) return;
    if (LOCKED_STATUSES.includes(statuses[from].value)) return;
    const u = [...statuses]; const [m] = u.splice(from, 1); u.splice(to, 0, m); setStatuses(u);
  };

  const addQuestion = () => {
    if (!newQ.label.trim()) { showErr('Question required'); return; }
    if (newQ.type === 'select' && !newQ.options?.length) { showErr('Add options'); return; }
    if (editQId) { setQuestions(questions.map(q => q.id === editQId ? newQ : q)); }
    else { setQuestions([...questions, { ...newQ, id: `q_${Date.now()}` }]); }
    setNewQ({ id: '', label: '', type: 'text', required: false, options: [] });
    setNewOpt(''); setShowAddQ(false); setEditQId(null);
  };

  const closeQuoteEditor = () => {
    setShowQuoteEditor(false); setShowCatPicker(false); setTplName(''); setTplCat('');
    setTplNotes(''); setLineItems([]); setNewLI({ description: '', quantity: '1', unitPrice: '' });
  };

  const addLineItem = () => {
    if (!newLI.description || !newLI.unitPrice) return;
    const qty = parseFloat(newLI.quantity) || 1;
    const price = parseFloat(newLI.unitPrice);
    if (isNaN(price) || price <= 0) return;
    setLineItems([...lineItems, { id: `li_${Date.now()}`, description: newLI.description, quantity: qty, unitPrice: price, amount: qty * price }]);
    setNewLI({ description: '', quantity: '1', unitPrice: '' });
  };

  const saveTemplate = async () => {
    if (!tplName.trim()) { showErr('Template name required'); return; }
    if (lineItems.length === 0) { showErr('Add at least one item'); return; }
    setSaving(true);
    const total = lineItems.reduce((s, i) => s + i.amount, 0);
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          template: { id: `custom_${Date.now()}`, name: tplName.trim(), category: tplCat, items: lineItems, total, notes: tplNotes.trim(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        }),
      });
      const result = await res.json();
      if (result.success) {
        const r2 = await fetch(`/api/company/${company.slug}/quote-templates`);
        const d2 = await r2.json(); if (d2.success) setTemplates(d2.templates || []);
        closeQuoteEditor();
      } else showErr(result.error || 'Failed to save');
    } catch { showErr('Failed to save'); } finally { setSaving(false); }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', templateId: id }),
      });
      setTemplates(templates.filter(t => t.id !== id));
    } catch {}
  };

  const runningTotal = lineItems.reduce((s, i) => s + i.amount, 0);

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>

      {/* ── HEADER ── */}
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

      {/* ── ERROR ── */}
      {error && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium rounded-lg">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-2xl">{STEPS[currentStep].icon}</span>
          <div>
            <h2 className="text-xl font-bold text-white">{STEPS[currentStep].label}</h2>
            <p className="text-sm text-white/40">{STEPS[currentStep].desc}</p>
          </div>
        </div>

        {/* ═══════ STEP 1: COMPANY ═══════ */}
        {currentStep === 0 && (
          <div className="space-y-4">
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
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5"><Building className="w-3.5 h-3.5" /> Company Name <span className="text-red-400">*</span></label>
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
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5"><Globe className="w-3.5 h-3.5" /> Website</label>
                  <input type="url" value={companyData.website} onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" placeholder="https://yourcompany.com" />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Branding</span>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-400">These colors appear in the header of emails sent to customers</p>
                <div className="h-12 w-full rounded-lg" style={{ background: `linear-gradient(135deg, ${companyData.email_brand_color_1}, ${companyData.email_brand_color_2})` }} />
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_PRESETS.map(p => (
                    <button key={p.name} onClick={() => setCompanyData({ ...companyData, email_brand_color_1: p.c1, email_brand_color_2: p.c2 })}
                      className={`h-8 rounded-lg transition hover:scale-105 ${companyData.email_brand_color_1 === p.c1 ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                      style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }} title={p.name} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ STEP 2: CATEGORIES ═══════ */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{categories.length}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCategories(defaultCats)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition"><RotateCcw className="w-3 h-3" /> Reset</button>
                  {categories.length < 20 && <button onClick={() => setShowAddCat(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"><Plus className="w-3 h-3" /> Add</button>}
                </div>
              </div>
              {showAddCat && (
                <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
                  <div className="flex gap-2">
                    <input type="text" value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCat()}
                      placeholder="e.g., Emergency Repair" autoFocus className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />
                    <button onClick={addCat} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">Add</button>
                    <button onClick={() => { setShowAddCat(false); setNewCatLabel(''); }} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition">Cancel</button>
                  </div>
                </div>
              )}
              <div className="divide-y divide-gray-50">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 group transition">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{cat.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{cat.task_templates?.length || 0} task{cat.task_templates?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => { setEditCatIdx(idx); setEditTasks(cat.task_templates || []); setNewTaskLabel(''); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-100 rounded-lg transition"><CheckSquare className="w-3.5 h-3.5" /> Tasks</button>
                    <button onClick={() => { if (categories.length <= 3) { showErr('Min 3 categories'); return; } setCategories(categories.filter((_, i) => i !== idx)); }}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-gray-400"><span className="font-bold text-gray-500">Tip:</span> Add task templates to auto-create checklists when leads convert to projects.</p>
              </div>
            </div>

            {/* Task editor modal */}
            {editCatIdx !== null && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
                <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl sm:rounded-xl">
                  <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ background: '#312e81' }}>
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckSquare className="w-5 h-5 text-indigo-300 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Task Templates</p>
                        <p className="text-white font-bold truncate">{categories[editCatIdx].label}</p>
                      </div>
                    </div>
                    <button onClick={() => setEditCatIdx(null)} className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="flex gap-2">
                      <input type="text" value={newTaskLabel} onChange={(e) => setNewTaskLabel(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && newTaskLabel.trim()) { setEditTasks([...editTasks, { id: `t_${Date.now()}`, label: newTaskLabel.trim(), order: editTasks.length + 1 }]); setNewTaskLabel(''); } }}
                        placeholder="Add a task..." className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" />
                      <button onClick={() => { if (newTaskLabel.trim()) { setEditTasks([...editTasks, { id: `t_${Date.now()}`, label: newTaskLabel.trim(), order: editTasks.length + 1 }]); setNewTaskLabel(''); } }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">Add</button>
                    </div>
                    {editTasks.length > 0 ? (
                      <div className="border border-gray-100 divide-y divide-gray-50 overflow-hidden rounded-lg">
                        {editTasks.map((task, idx) => (
                          <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group transition">
                            <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">{idx + 1}</span>
                            <input type="text" value={task.label} onChange={(e) => setEditTasks(editTasks.map(t => t.id === task.id ? { ...t, label: e.target.value } : t))}
                              className="flex-1 min-w-0 px-2 py-1 text-sm border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none bg-transparent transition" />
                            <button onClick={() => setEditTasks(editTasks.filter(t => t.id !== task.id))}
                              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 rounded-lg transition flex-shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center border border-dashed border-gray-200 rounded-lg">
                        <CheckSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-400">No tasks yet</p>
                        <p className="text-xs text-gray-300 mt-1">Type above and press Enter</p>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
                    <button onClick={() => setEditCatIdx(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg transition">Cancel</button>
                    <button onClick={() => { if (editCatIdx === null) return; const u = [...categories]; u[editCatIdx] = { ...u[editCatIdx], task_templates: editTasks }; setCategories(u); setEditCatIdx(null); }}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg transition flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Save Tasks</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ STEP 3: PIPELINE ═══════ */}
        {currentStep === 2 && (
          <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pipeline Statuses</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{statuses.length}</span>
              </div>
              {statuses.length < 10 && !showAddStatus && (
                <button onClick={() => setShowAddStatus(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"><Plus className="w-3 h-3" /> Add Status</button>
              )}
            </div>
            {showAddStatus && (
              <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100 space-y-3">
                <input type="text" value={newStatusLabel} onChange={(e) => setNewStatusLabel(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStatus()}
                  placeholder="e.g., Awaiting Approval" autoFocus className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c.value} onClick={() => setNewStatusColor(c.value)}
                      className={`w-7 h-7 rounded-full transition ${newStatusColor === c.value ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addStatus} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">Add</button>
                  <button onClick={() => { setShowAddStatus(false); setNewStatusLabel(''); }} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition">Cancel</button>
                </div>
              </div>
            )}
            <div className="divide-y divide-gray-50">
              {statuses.map((s, i) => {
                const locked = LOCKED_STATUSES.includes(s.value);
                return (
                  <div key={`${s.value}-${i}`} className={`flex items-center gap-3 px-5 py-3.5 group transition ${locked ? 'bg-gray-50/60' : 'hover:bg-gray-50'}`}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getColorHex(s.color) }} />
                    <span className={`flex-1 text-sm font-semibold ${locked ? 'text-gray-400' : 'text-gray-800'}`}>{s.label}</span>
                    {locked && <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold px-2 py-0.5 bg-gray-100 rounded"><Lock className="w-3 h-3" /> Locked</span>}
                    {!locked && (
                      <div className="flex items-center gap-0.5">
                        <button disabled={i <= 1} onClick={() => moveStatus(i, i - 1)} className="p-1.5 hover:bg-gray-200 rounded transition disabled:opacity-20 text-gray-500"><ChevronUp className="w-4 h-4" /></button>
                        <button disabled={i >= statuses.length - 2} onClick={() => moveStatus(i, i + 1)} className="p-1.5 hover:bg-gray-200 rounded transition disabled:opacity-20 text-gray-500"><ChevronDown className="w-4 h-4" /></button>
                        <button onClick={() => setStatuses(statuses.filter((_, idx) => idx !== i))} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded transition"><X className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400"><span className="font-bold text-gray-500">Tip:</span> Leads move through these stages. New and Completed are locked.</p>
            </div>
          </div>
        )}

        {/* ═══════ STEP 4: FORM ═══════ */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Form Appearance</span></div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Form Heading</label>
                  <input type="text" value={ctaHeading} onChange={(e) => setCtaHeading(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" placeholder="Get Your Free Quote Today" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Success Message</label>
                  <textarea value={ctaSuccess} onChange={(e) => setCtaSuccess(e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition resize-none" placeholder="Thank you! We'll get back to you within 24 hours." />
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custom Questions</span>
                  {questions.length > 0 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{questions.length}</span>}
                </div>
                {!showAddQ && <button onClick={() => { setShowAddQ(true); setEditQId(null); setNewQ({ id: '', label: '', type: 'text', required: false, options: [] }); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"><Plus className="w-3 h-3" /> Add Question</button>}
              </div>
              {showAddQ && (
                <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100 space-y-4">
                  <input type="text" value={newQ.label} onChange={(e) => setNewQ({ ...newQ, label: e.target.value })} placeholder="e.g., What is your budget range?" autoFocus
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />
                  <div className="grid grid-cols-3 gap-2">
                    {(['text', 'select', 'checkbox'] as const).map(t => (
                      <button key={t} onClick={() => setNewQ({ ...newQ, type: t, options: [] })}
                        className={`py-2 text-xs font-bold border rounded-lg transition ${newQ.type === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600'}`}>{typeLabel(t)}</button>
                    ))}
                  </div>
                  {newQ.type === 'select' && (
                    <div className="space-y-2">
                      {newQ.options?.map((opt, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg">
                          <span className="text-sm text-gray-700">{opt}</span>
                          <button onClick={() => setNewQ({ ...newQ, options: newQ.options?.filter((_, idx) => idx !== i) })} className="text-red-400"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input type="text" value={newOpt} onChange={(e) => setNewOpt(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && newOpt.trim()) { setNewQ({ ...newQ, options: [...(newQ.options || []), newOpt.trim()] }); setNewOpt(''); } }}
                          placeholder="Add option..." className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />
                        <button onClick={() => { if (newOpt.trim()) { setNewQ({ ...newQ, options: [...(newQ.options || []), newOpt.trim()] }); setNewOpt(''); } }}
                          className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg transition">Add</button>
                      </div>
                    </div>
                  )}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={newQ.required} onChange={(e) => setNewQ({ ...newQ, required: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-semibold text-gray-700">Required</span>
                  </label>
                  <div className="flex gap-2">
                    <button onClick={addQuestion} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">{editQId ? 'Update' : 'Add Question'}</button>
                    <button onClick={() => { setShowAddQ(false); setEditQId(null); }} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition">Cancel</button>
                  </div>
                </div>
              )}
              {questions.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {questions.map(q => (
                    <div key={q.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 group transition">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{q.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">{typeLabel(q.type)}</span>
                          {q.required && <span className="text-xs font-bold text-red-500">Required</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => { setNewQ({ ...q }); setEditQId(q.id); setShowAddQ(true); }} className="p-1.5 hover:bg-indigo-50 text-indigo-400 rounded-lg transition"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setQuestions(questions.filter(x => x.id !== q.id))} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !showAddQ && (
                <div className="py-10 text-center">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-400">No custom questions yet</p>
                  <p className="text-xs text-gray-300 mt-1">Optional — add them later in Settings</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════ STEP 5: QUOTES ═══════ */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quote Templates</span>
                  {templates.length > 0 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{templates.length}</span>}
                </div>
                <button onClick={() => setShowCatPicker(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"><Plus className="w-3 h-3" /> Create Template</button>
              </div>
              {templates.length > 0 ? (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map(t => {
                    const cat = categories.find(c => c.value === t.category);
                    return (
                      <div key={t.id} className="border border-gray-200 hover:border-indigo-200 group transition overflow-hidden flex flex-col rounded-lg">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2">
                          <div className="min-w-0"><p className="font-bold text-gray-800 text-sm truncate">{t.name}</p>{cat && <p className="text-xs text-gray-400 mt-0.5">{cat.label}</p>}</div>
                          <button onClick={() => deleteTemplate(t.id)} className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="px-4 py-3 flex-1 space-y-1.5">
                          {t.items.slice(0, 3).map((item, i) => (<div key={i} className="flex justify-between gap-2 text-xs"><span className="text-gray-500 truncate">{item.description}</span><span className="text-gray-700 font-semibold flex-shrink-0">{fmt(item.amount)}</span></div>))}
                          {t.items.length > 3 && <p className="text-xs text-gray-300">+{t.items.length - 3} more</p>}
                        </div>
                        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total</span>
                          <span className="text-base font-bold text-emerald-600">{fmt(t.total)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-400">No templates yet</p>
                  <p className="text-xs text-gray-300 mt-1">Optional — create templates to auto-fill quotes per category</p>
                </div>
              )}
            </div>

            {/* Cat picker */}
            {showCatPicker && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                <div className="bg-white w-full sm:max-w-lg shadow-2xl overflow-hidden sm:rounded-xl">
                  <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#312e81' }}>
                    <div><p className="font-bold text-white">Select Category</p><p className="text-xs text-indigo-300 mt-0.5">Which category is this template for?</p></div>
                    <button onClick={() => setShowCatPicker(false)} className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button key={cat.value} onClick={() => { setTplCat(cat.value); setShowCatPicker(false); setShowQuoteEditor(true); }}
                        className="px-3 py-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition text-center rounded-lg">
                        <span className="font-semibold text-gray-700 text-sm">{cat.label}</span></button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quote editor */}
            {showQuoteEditor && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
                <div className="bg-white w-full sm:max-w-3xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col sm:rounded-xl">
                  <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ background: '#312e81' }}>
                    <div><p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">New Quote Template</p><p className="text-white font-bold">{categories.find(c => c.value === tplCat)?.label}</p></div>
                    <button onClick={closeQuoteEditor} className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Template Name *</label>
                        <input type="text" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="e.g., Standard Roof Repair" autoFocus
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" /></div>
                      <div><label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Notes</label>
                        <input type="text" value={tplNotes} onChange={(e) => setTplNotes(e.target.value)} placeholder="Optional notes..."
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" /></div>
                    </div>
                    <div className="border border-gray-100 overflow-hidden rounded-lg">
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" /><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</span>
                        {lineItems.length > 0 && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold rounded">{lineItems.length}</span>}
                      </div>
                      <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <div className="col-span-5">Description</div><div className="col-span-2 text-center">Qty</div><div className="col-span-2 text-right">Unit Price</div><div className="col-span-2 text-right">Amount</div><div className="col-span-1"></div>
                      </div>
                      {lineItems.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 items-center group hover:bg-gray-50 transition">
                          <div className="col-span-5 text-sm text-gray-800 truncate">{item.description}</div>
                          <div className="col-span-2 text-sm text-gray-600 text-center">{item.quantity}</div>
                          <div className="col-span-2 text-sm text-gray-600 text-right">{fmt(item.unitPrice)}</div>
                          <div className="col-span-2 text-sm font-semibold text-gray-800 text-right">{fmt(item.amount)}</div>
                          <div className="col-span-1 flex justify-end"><button onClick={() => setLineItems(lineItems.filter(li => li.id !== item.id))} className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 rounded transition"><Trash2 className="w-3.5 h-3.5" /></button></div>
                        </div>
                      ))}
                      <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 items-center bg-white">
                        <div className="col-span-5"><input type="text" value={newLI.description} onChange={(e) => setNewLI({ ...newLI, description: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') addLineItem(); }} placeholder="Item description" className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-400 focus:outline-none transition" /></div>
                        <div className="col-span-2"><input type="number" value={newLI.quantity} min="1" onChange={(e) => setNewLI({ ...newLI, quantity: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded text-center focus:border-indigo-400 focus:outline-none transition" /></div>
                        <div className="col-span-2"><input type="number" value={newLI.unitPrice} min="0" step="0.01" onChange={(e) => setNewLI({ ...newLI, unitPrice: e.target.value })} onKeyDown={(e) => { if (e.key === 'Enter') addLineItem(); }} placeholder="0.00" className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded text-right focus:border-indigo-400 focus:outline-none transition" /></div>
                        <div className="col-span-2 text-sm text-gray-400 text-right">{newLI.unitPrice ? fmt((parseFloat(newLI.quantity) || 1) * (parseFloat(newLI.unitPrice) || 0)) : '—'}</div>
                        <div className="col-span-1 flex justify-end"><button onClick={addLineItem} className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"><Plus className="w-3.5 h-3.5" /></button></div>
                      </div>
                      {lineItems.length > 0 && (
                        <div className="px-4 py-3 flex justify-between items-center" style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</span>
                          <span className="text-lg font-bold text-emerald-600">{fmt(runningTotal)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
                    <button onClick={closeQuoteEditor} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg transition">Cancel</button>
                    <button onClick={saveTemplate} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">{saving ? 'Saving...' : 'Save Template'}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ STEP 6: DONE ═══════ */}
        {currentStep === 5 && (
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
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2"><Link2 className="w-4 h-4 text-gray-400" /><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Booking Link</span></div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-gray-400">Customers use this link to submit leads directly to your dashboard</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono truncate">{publicLink}</div>
                  <button onClick={() => { navigator.clipboard.writeText(publicLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    className={`px-4 py-3 rounded-lg text-sm font-bold transition flex items-center gap-2 ${copied ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">What's Next</span></div>
              <div className="divide-y divide-gray-50">
                {[{ emoji: '🔗', title: 'Share your booking link', desc: 'Add it to your website, social media, or email signature' },
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
            <a href={`/${company.slug}/dashboard`} className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>Go to Your Dashboard <ArrowRight className="w-5 h-5" /></a>
          </div>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      {!isDone && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <button onClick={handleBack} className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-bold rounded-lg transition flex items-center gap-2"><ChevronLeft className="w-4 h-4" /> Back</button>
            ) : <div />}
            <button onClick={handleNext} disabled={saving}
              className="px-8 py-2.5 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : currentStep === 4 ? <>Finish Setup <ChevronRight className="w-4 h-4" /></> : <>Save & Continue <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}