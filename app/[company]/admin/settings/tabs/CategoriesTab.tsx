'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  CheckSquare,
  Trash2,
  Save,
  AlertTriangle,
  Layers,
  DollarSign,
  AlertCircle,
  Lock,
  Check,
  Percent,
  HandCoins,
  Pencil,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';
import { can, type PlanTier } from '@/lib/permissions';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type TaskTemplate = { id: string; label: string; order: number };
type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
type DepositType = 'percent' | 'fixed';
type QuoteTemplate = {
  id: string;
  category: string;
  items: LineItem[];
  total: number;
  tax_rate?: number;
  deposit_type?: DepositType | null;
  deposit_value?: number | null;
};
type Category = { value: string; label: string; task_templates?: TaskTemplate[] };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(n) ? 0 : n);

const clean = (v: any): number => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

const depositFor = (total: number, type: DepositType | null | undefined, value: number | null | undefined): number => {
  const v = Number(value) || 0;
  if (!type || v <= 0 || total <= 0) return 0;
  const raw = type === 'percent' ? (total * v) / 100 : v;
  return Math.min(Math.round(raw * 100) / 100, total);
};

const depositLabel = (type: DepositType | null | undefined, value: number | null | undefined) => {
  const v = Number(value) || 0;
  if (!type || v <= 0) return 'No deposit';
  return type === 'percent' ? `${v}% deposit` : `${fmt(v)} deposit`;
};

const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };
const noSpinners = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

// ─── LOCKED STATE ────────────────────────────────────────────────────────────

function LockedCategoriesSection({ companySlug }: { companySlug: string }) {
  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-12 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white py-16 px-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Lock className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Categories & Pricing Templates</h3>
          <p className="mt-1 text-sm text-slate-500">
            Custom category checklists and automatic line-item pricing are available on the Basic plan.
          </p>
          <a
            href={`/${companySlug}/home?section=billing`}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 shadow-sm"
          >
            Upgrade to Basic
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function CategoriesTab({ company, currentUser }: { company: any; currentUser?: any }) {
  const defaultCategories = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;

  const [categories, setCategories] = useState<Category[]>(
    company.form_categories?.length > 0 ? company.form_categories : defaultCategories
  );
  const [useDefaults, setUseDefaults] = useState(!company.form_categories?.length);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatError, setNewCatError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; label: string } | null>(null);

  const [taskEditorCatIndex, setTaskEditorCatIndex] = useState<number | null>(null);
  const [editingTasks, setEditingTasks] = useState<TaskTemplate[]>([]);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [taskInputError, setTaskInputError] = useState(false);

  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quoteEditorOpen, setQuoteEditorOpen] = useState(false);
  const [quoteEditorCatValue, setQuoteEditorCatValue] = useState<string>('');
  const [editingLineItems, setEditingLineItems] = useState<LineItem[]>([]);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [lineItemError, setLineItemError] = useState('');
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [showQuotePreview, setShowQuotePreview] = useState(false);

  // Per-template values in pricing modal
  const [editingTaxRateValue, setEditingTaxRateValue] = useState<number>(0);
  const [editingDepositType, setEditingDepositType] = useState<DepositType | null>(null);
  const [editingDepositValue, setEditingDepositValue] = useState<number>(0);

  // Company-wide defaults
  const [taxRate, setTaxRate] = useState<number>(company.default_tax_rate ?? 0);
  const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [taxRateDraft, setTaxRateDraft] = useState(String(company.default_tax_rate ?? 0));
  const [taxRateSaving, setTaxRateSaving] = useState(false);

  const [depositType, setDepositType] = useState<DepositType | null>(company.default_deposit_type ?? null);
  const [depositValue, setDepositValue] = useState<number>(company.default_deposit_value ?? 0);
  const [editingDepositDefault, setEditingDepositDefault] = useState(false);
  const [depositTypeDraft, setDepositTypeDraft] = useState<DepositType>(company.default_deposit_type ?? 'percent');
  const [depositValueDraft, setDepositValueDraft] = useState(String(company.default_deposit_value ?? ''));
  const [depositSaving, setDepositSaving] = useState(false);
  const [depositError, setDepositError] = useState('');

  // Target default offered for backfill onto existing templates
  const [applyTarget, setApplyTarget] = useState<'tax' | 'deposit' | null>(null);
  const [applyingToAll, setApplyingToAll] = useState(false);

  const saveTaxRate = async () => {
    const parsed = parseFloat(taxRateDraft);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return;
    setTaxRateSaving(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-tax-rate', data: { default_tax_rate: parsed } }),
      });
      const result = await res.json();
      if (result.success) {
        setTaxRate(parsed);
        setEditingTaxRate(false);
        if (quoteTemplates.length > 0) setApplyTarget('tax');
      }
    } catch {}
    finally { setTaxRateSaving(false); }
  };

  const saveDepositDefault = async (clearIt = false) => {
    const parsed = clearIt ? 0 : parseFloat(depositValueDraft);
    const nextType: DepositType | null = clearIt ? null : depositTypeDraft;

    if (!clearIt) {
      if (isNaN(parsed) || parsed <= 0) { setDepositError('Enter an amount above zero.'); return; }
      if (depositTypeDraft === 'percent' && parsed > 100) { setDepositError('A percent deposit can\'t exceed 100.'); return; }
    }

    setDepositSaving(true);
    setDepositError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-deposit-default',
          data: { default_deposit_type: nextType, default_deposit_value: clearIt ? null : parsed },
        }),
      });
      const result = await res.json();
      if (result.success) {
        setDepositType(nextType);
        setDepositValue(clearIt ? 0 : parsed);
        setEditingDepositDefault(false);
        if (quoteTemplates.length > 0) setApplyTarget('deposit');
      } else {
        setDepositError(result.error || 'Could not save default deposit.');
      }
    } catch {
      setDepositError('Network error. Try again.');
    } finally {
      setDepositSaving(false);
    }
  };

  const applyDefaultToAllTemplates = async (target: 'tax' | 'deposit') => {
    setApplyingToAll(true);
    setSaveError('');

    try {
      const updatedTemplates = quoteTemplates.map((t) => {
        const normalizedItems = t.items.map((item: any, i: number) => {
          const qty = clean(item.quantity ?? item.qty ?? 1) || 1;
          const price = clean(
            item.unitPrice ?? item.unit_price ?? item.unitCost ?? item.unit_cost ?? 0
          );
          return {
            id: item.id || `item_${Date.now() + i}`,
            description: String(item.description || item.label || ''),
            quantity: qty,
            unitPrice: price,
            amount: qty * price,
          };
        });

        const subtotal = normalizedItems.reduce((s, i) => s + i.amount, 0);
        const nextTaxRate = target === 'tax' ? taxRate : (t.tax_rate ?? 0);
        const nextTotal = target === 'tax' ? subtotal + subtotal * (nextTaxRate / 100) : t.total;

        return {
          ...t,
          items: normalizedItems,
          tax_rate: nextTaxRate,
          deposit_type: target === 'deposit' ? depositType : (t.deposit_type ?? null),
          deposit_value:
            target === 'deposit'
              ? (depositType && depositValue > 0 ? depositValue : null)
              : (t.deposit_value ?? null),
          total: nextTotal,
        };
      });

      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-many', templates: updatedTemplates }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setSaveError(data.error || 'Could not apply the change. Try again.');
        return;
      }

      setQuoteTemplates(data.templates || updatedTemplates);
      setApplyTarget(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError('Network error applying the change. Try again.');
    } finally {
      setApplyingToAll(false);
    }
  };

  const markDirty = useCallback(() => setIsDirty(true), []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  useEffect(() => {
    fetch(`/api/company/${company.slug}/quote-templates`)
      .then(r => r.json())
      .then(d => { if (d.success) setQuoteTemplates(d.templates || []); })
      .catch(() => {})
      .finally(() => setQuotesLoading(false));
  }, [company.slug]);

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) { setNewCatError('Enter a category name.'); return; }
    const value = newCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories(prev => [...prev, { value, label: newCatLabel.trim(), task_templates: [] }]);
    setNewCatLabel(''); setNewCatError(''); setShowAddForm(false); setUseDefaults(false); markDirty();
  };

  const confirmDeleteCategory = () => {
    if (!deleteConfirm) return;
    setCategories(prev => prev.filter((_, i) => i !== deleteConfirm.index));
    setUseDefaults(false); setDeleteConfirm(null); markDirty();
  };

  const handleSave = async () => {
    setSaving(true); setSaveError(''); setSaveSuccess(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-categories', data: { form_categories: useDefaults ? null : categories } }),
      });
      const data = await res.json();
      if (data.success) { setSaveSuccess(true); setIsDirty(false); setTimeout(() => setSaveSuccess(false), 3000); }
      else setSaveError(data.error || 'Failed to save.');
    } catch { setSaveError('Network error.'); }
    finally { setSaving(false); }
  };

  const openTaskEditor = (index: number) => {
    setTaskEditorCatIndex(index);
    setEditingTasks(categories[index].task_templates || []);
    setNewTaskLabel(''); setTaskInputError(false);
  };

  const addTask = () => {
    if (!newTaskLabel.trim()) { setTaskInputError(true); return; }
    setEditingTasks(prev => [...prev, { id: `task_${Date.now()}`, label: newTaskLabel.trim(), order: prev.length + 1 }]);
    setNewTaskLabel(''); setTaskInputError(false);
  };

  const saveTaskTemplates = async () => {
    if (newTaskLabel.trim()) { setTaskInputError(true); return; }
    if (taskEditorCatIndex === null) return;
    const updatedCategories = [...categories];
    updatedCategories[taskEditorCatIndex] = { ...updatedCategories[taskEditorCatIndex], task_templates: editingTasks };
    setCategories(updatedCategories);
    setUseDefaults(false);
    try {
      await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-categories', data: { form_categories: updatedCategories } }),
      });
    } catch {}
    setTaskEditorCatIndex(null);
    setIsDirty(false);
  };

  const openQuoteEditor = (catValue: string) => {
    const existing = quoteTemplates.find(t => t.category === catValue);
    const mapped: LineItem[] = existing
      ? existing.items.map((item: any, i: number) => {
          const qty = clean(item.quantity ?? item.qty ?? 1) || 1;
          const price = clean(item.unitPrice ?? item.unit_price ?? item.unitCost ?? item.unit_cost ?? 0);
          return { id: `item_${Date.now() + i}`, description: String(item.description || item.label || ''), quantity: qty, unitPrice: price, amount: qty * price };
        })
      : [];
    setEditingLineItems(mapped);
    setEditingQuoteId(existing?.id || null);
    setEditingTaxRateValue(existing ? (existing.tax_rate ?? 0) : taxRate);
    setEditingDepositType(existing ? (existing.deposit_type ?? null) : depositType);
    setEditingDepositValue(existing ? (existing.deposit_value ?? 0) : depositValue);
    setNewDesc(''); setNewPrice(''); setNewQty('1');
    setLineItemError(''); setQuoteError('');
    setQuoteEditorCatValue(catValue);
    setQuoteEditorOpen(true);
  };

  const addLineItem = () => {
    if (!newDesc.trim()) { setLineItemError('Enter a description.'); return; }
    const price = clean(newPrice);
    if (!newPrice || price === 0) { setLineItemError('Enter a valid price.'); return; }
    const qty = clean(newQty) || 1;
    setEditingLineItems(prev => [...prev, { id: `item_${Date.now()}`, description: newDesc.trim(), quantity: qty, unitPrice: price, amount: qty * price }]);
    setNewDesc(''); setNewPrice(''); setNewQty('1'); setLineItemError('');
  };

  const updateLineItem = (id: string, field: 'description' | 'quantity' | 'unitPrice', value: string) => {
    setEditingLineItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      if (field === 'description') return { ...item, description: value };
      const num = clean(value);
      const qty = field === 'quantity' ? (num || 1) : item.quantity;
      const price = field === 'unitPrice' ? num : item.unitPrice;
      return { ...item, [field]: num, amount: qty * price };
    }));
  };

  const saveQuoteTemplate = async () => {
    if (newDesc.trim() || newPrice) { setLineItemError('Click + to add this item first.'); return; }
    if (editingLineItems.length === 0) { setQuoteError('Add at least one line item.'); return; }
    if (editingDepositType === 'percent' && editingDepositValue > 100) {
      setQuoteError('A percent deposit can\'t exceed 100.'); return;
    }
    setQuoteSaving(true); setQuoteError('');
    const subtotal = editingLineItems.reduce((s, i) => s + i.amount, 0);
    const total = subtotal + subtotal * (editingTaxRateValue / 100);
    const templateData = {
      id: editingQuoteId || `custom_${Date.now()}`,
      category: quoteEditorCatValue,
      items: editingLineItems,
      total,
      tax_rate: editingTaxRateValue,
      deposit_type: editingDepositValue > 0 ? editingDepositType : null,
      deposit_value: editingDepositValue > 0 ? editingDepositValue : null,
    };
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: editingQuoteId ? 'update' : 'create', template: templateData }),
      });
      const result = await res.json();
      if (result.success) {
        setQuoteTemplates(result.templates || []);
        setQuoteEditorOpen(false);
      } else setQuoteError(result.error || 'Failed to save.');
    } catch { setQuoteError('Network error.'); }
    finally { setQuoteSaving(false); }
  };

  const deleteQuoteTemplate = async () => {
    if (!editingQuoteId || !confirm('Remove this pricing template?')) return;
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', templateId: editingQuoteId }),
      });
      const result = await res.json();
      if (result.success) { setQuoteTemplates(result.templates || []); setQuoteEditorOpen(false); }
    } catch {}
  };

  const activeQuoteEditorCat = categories.find(c => c.value === quoteEditorCatValue);
  const quoteEditorSubtotal = editingLineItems.reduce((s, i) => s + i.amount, 0);
  const quoteEditorTaxAmount = quoteEditorSubtotal * (editingTaxRateValue / 100);
  const quoteEditorTotal = quoteEditorSubtotal + quoteEditorTaxAmount;
  const quoteEditorDeposit = depositFor(quoteEditorTotal, editingDepositType, editingDepositValue);
  const quoteEditorBalance = quoteEditorTotal - quoteEditorDeposit;

  if (!can((company.plan_tier || 'free') as PlanTier, 'categories')) {
    return <LockedCategoriesSection companySlug={company.slug} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-8 sm:px-8 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-5xl space-y-8 pb-32">
        
        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Service Categories</h1>
              {isDirty && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Configure job categories, automatic task checklists, and estimate line-item pricing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQuotePreview(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5 text-slate-500" /> Preview In Action
            </button>
            {isDirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition"
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>

        {/* ── NOTIFICATIONS & ALERTS ── */}
        {saveSuccess && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            Changes saved successfully.
          </div>
        )}
        {saveError && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            {saveError}
          </div>
        )}

        {/* ── APPLY DEFAULT PROMPT ── */}
        {applyTarget && (
          <div className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-indigo-950">
              Apply <span className="font-bold">{applyTarget === 'tax' ? `${taxRate}% tax` : depositLabel(depositType, depositValue)}</span> to your{' '}
              {quoteTemplates.length} existing pricing template{quoteTemplates.length !== 1 ? 's' : ''}?
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => applyDefaultToAllTemplates(applyTarget)}
                disabled={applyingToAll}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition"
              >
                {applyingToAll ? 'Applying...' : 'Apply to All Templates'}
              </button>
              <button
                onClick={() => setApplyTarget(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                New Ones Only
              </button>
            </div>
          </div>
        )}

        {/* ── GLOBAL DEFAULTS & CATEGORY CONTROLS ── */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="h-4 w-4" /> Global Settings & Additions
            </h2>

            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Plus className="h-3.5 w-3.5" /> Add Category
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {showAddForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}
                className="flex flex-col gap-2.5 sm:flex-row sm:items-center bg-slate-50 p-3 rounded-lg border border-slate-200"
              >
                <input
                  autoFocus
                  value={newCatLabel}
                  onChange={e => { setNewCatLabel(e.target.value); setNewCatError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  placeholder="Category Name (e.g., Plumbing, Roofing, HVAC)"
                  className={`flex-1 rounded-lg border px-3.5 py-2 text-sm font-medium text-slate-900 outline-none transition ${
                    newCatError ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200 focus:border-slate-900 bg-white'
                  }`}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddCategory}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                  >
                    Add Category
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewCatLabel(''); setNewCatError(''); }}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Quick Defaults Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Tax Rate Setting */}
            {editingTaxRate ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                <span className="text-xs font-semibold text-slate-600 pl-2">Tax:</span>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  value={taxRateDraft}
                  onChange={(e) => setTaxRateDraft(e.target.value)}
                  autoFocus
                  className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 outline-none"
                />
                <span className="text-xs font-bold text-slate-400">%</span>
                <button
                  onClick={saveTaxRate}
                  disabled={taxRateSaving}
                  className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {taxRateSaving ? '...' : 'Save'}
                </button>
                <button
                  onClick={() => { setEditingTaxRate(false); setTaxRateDraft(String(taxRate)); }}
                  className="px-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingTaxRate(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <Percent className="h-3.5 w-3.5 text-slate-400" />
                Default Tax: <span className="font-bold text-slate-900">{taxRate}%</span>
              </button>
            )}

            {/* Deposit Terms Setting */}
            {editingDepositDefault ? (
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5">
                <div className="flex rounded-md border border-slate-200 bg-white p-0.5">
                  {(['percent', 'fixed'] as DepositType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setDepositTypeDraft(t)}
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        depositTypeDraft === t ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {t === 'percent' ? '%' : '$'}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max={depositTypeDraft === 'percent' ? 100 : undefined}
                  value={depositValueDraft}
                  onChange={(e) => { setDepositValueDraft(e.target.value); setDepositError(''); }}
                  placeholder={depositTypeDraft === 'percent' ? '50' : '500'}
                  autoFocus
                  className={`w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 outline-none ${noSpinners}`}
                />
                <button
                  onClick={() => saveDepositDefault(false)}
                  disabled={depositSaving}
                  className="rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {depositSaving ? '...' : 'Save'}
                </button>
                {depositType && (
                  <button
                    onClick={() => saveDepositDefault(true)}
                    disabled={depositSaving}
                    className="px-1 text-xs font-semibold text-rose-600 hover:text-rose-800"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => {
                    setEditingDepositDefault(false);
                    setDepositTypeDraft(depositType ?? 'percent');
                    setDepositValueDraft(String(depositValue || ''));
                    setDepositError('');
                  }}
                  className="px-1 text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingDepositDefault(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <HandCoins className="h-3.5 w-3.5 text-slate-400" />
                Default Deposit:{' '}
                <span className="font-bold text-slate-900">
                  {depositType ? (depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)) : 'None'}
                </span>
              </button>
            )}
          </div>
          {depositError && <p className="text-xs font-semibold text-rose-600">{depositError}</p>}
        </div>

        {/* ── CATEGORY LIST GRID ── */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Category Name</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Templates & Actions</span>
          </div>

          {categories.map((cat, idx) => {
            const hasQuote = quoteTemplates.some(q => q.category === cat.value);
            const taskCount = cat.task_templates?.length || 0;

            return (
              <div
                key={cat.value || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 gap-4 hover:bg-slate-50/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900">{cat.label}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Task Checklist Button */}
                  <button
                    onClick={() => openTaskEditor(idx)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      taskCount > 0
                        ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        : 'border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <CheckSquare className={`h-3.5 w-3.5 ${taskCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {taskCount > 0 ? `${taskCount} Tasks` : '+ Task Checklist'}
                  </button>

                  {/* Pricing Template Button */}
                  <button
                    onClick={() => openQuoteEditor(cat.value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      hasQuote
                        ? 'border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/50'
                        : 'border-dashed border-slate-300 text-slate-400 hover:border-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <DollarSign className={`h-3.5 w-3.5 ${hasQuote ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {hasQuote ? 'Pricing Configured' : '+ Line Item Pricing'}
                  </button>

                  {/* Remove Category */}
                  <button
                    onClick={() => setDeleteConfirm({ index: idx, label: cat.label })}
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Remove Category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── STICKY UNSAVED CHANGE BAR ── */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4"
            >
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-2xl text-white">
                <p className="text-xs font-semibold flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  You have unsaved changes.
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-sm hover:bg-slate-100 disabled:opacity-50 transition shrink-0"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TASK EDITOR MODAL ── */}
        {taskEditorCatIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => { setTaskEditorCatIndex(null); setTaskInputError(false); }}
          >
            <div
              className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
                <span className="text-sm font-bold text-slate-900">
                  {categories[taskEditorCatIndex]?.label} Checklist
                </span>
                <button
                  onClick={() => { setTaskEditorCatIndex(null); setTaskInputError(false); }}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div className="flex gap-2">
                  <input
                    value={newTaskLabel}
                    onChange={e => { setNewTaskLabel(e.target.value); setTaskInputError(false); }}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder="Add checklist step..."
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium text-slate-900 outline-none transition ${
                      taskInputError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 focus:border-slate-900'
                    }`}
                  />
                  <button
                    onClick={addTask}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {taskInputError && (
                  <p className="text-xs font-semibold text-rose-600">Click the + button to append this task.</p>
                )}

                <div className="space-y-2 pt-2">
                  {editingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                      <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="flex-1 text-xs font-semibold text-slate-800">{task.label}</span>
                      <button
                        onClick={() => setEditingTasks(editingTasks.filter(t => t.id !== task.id))}
                        className="text-slate-300 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {editingTasks.length === 0 && (
                    <p className="text-center py-6 text-xs text-slate-400 font-medium">No tasks configured for this category.</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-4 bg-slate-50/50">
                <button
                  onClick={() => setTaskEditorCatIndex(null)}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTaskTemplates}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  Save Checklist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PRICING TEMPLATE MODAL ── */}
        {quoteEditorOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
            onClick={() => setQuoteEditorOpen(false)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Line Item Pricing Template</h3>
                  <p className="text-xs font-semibold text-indigo-600">{activeQuoteEditorCat?.label}</p>
                </div>
                <button
                  onClick={() => setQuoteEditorOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Line Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="space-y-2">
                  <div className="hidden sm:grid sm:grid-cols-[1fr_100px_70px_90px_32px] gap-3 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Item Description</span>
                    <span className="text-right">Unit Price</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Total</span>
                    <span></span>
                  </div>

                  {editingLineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:grid sm:grid-cols-[1fr_100px_70px_90px_32px] gap-2 sm:gap-3 items-center rounded-lg border border-slate-200 p-3 bg-white"
                    >
                      <input
                        value={item.description}
                        onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Item Description"
                        className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900"
                      />
                      <div className="flex items-center gap-1 w-full sm:w-auto">
                        <span className="text-xs font-medium text-slate-400">$</span>
                        <input
                          type="number"
                          value={item.unitPrice || ''}
                          onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)}
                          className={`w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-900 text-right outline-none focus:border-slate-900 ${noSpinners}`}
                        />
                      </div>
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={e => updateLineItem(item.id, 'quantity', e.target.value)}
                        className={`w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-900 text-center outline-none focus:border-slate-900 ${noSpinners}`}
                      />
                      <span className="text-xs font-bold text-slate-900 text-right w-full sm:w-auto">
                        {fmt(item.amount)}
                      </span>
                      <button
                        onClick={() => setEditingLineItems(prev => prev.filter(x => x.id !== item.id))}
                        className="p-1 text-slate-300 hover:text-rose-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Line Item Row */}
                <div className="rounded-lg border border-dashed border-slate-300 p-3 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Add New Item</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={newDesc}
                      onChange={e => { setNewDesc(e.target.value); setLineItemError(''); }}
                      onKeyDown={e => e.key === 'Enter' && addLineItem()}
                      placeholder="Line item description (e.g. Labor, Materials)"
                      className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={newPrice}
                        onChange={e => { setNewPrice(e.target.value); setLineItemError(''); }}
                        placeholder="Price ($)"
                        className={`w-20 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-slate-900 bg-white ${noSpinners}`}
                      />
                      <input
                        type="number"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                        placeholder="Qty"
                        className={`w-14 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-900 text-center outline-none focus:border-slate-900 bg-white ${noSpinners}`}
                      />
                      <button
                        onClick={addLineItem}
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {lineItemError && <p className="text-xs font-semibold text-rose-600">{lineItemError}</p>}
                {quoteError && <p className="text-xs font-semibold text-rose-600">{quoteError}</p>}

                {/* Subtotal & Totals Grid */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Subtotal</span>
                    <span>{fmt(quoteEditorSubtotal)}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Tax Settings */}
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Percent className="h-3.5 w-3.5 text-slate-400" /> Tax Rate
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          max="100"
                          value={editingTaxRateValue}
                          onChange={(e) => setEditingTaxRateValue(parseFloat(e.target.value) || 0)}
                          className="w-16 rounded border border-slate-200 px-2 py-1 text-xs font-bold text-slate-900 text-right bg-white"
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>

                    {/* Deposit Settings */}
                    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50/50 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <HandCoins className="h-3.5 w-3.5 text-slate-400" /> Deposit
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="flex rounded border border-slate-200 bg-white p-0.5">
                          {(['percent', 'fixed'] as DepositType[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => setEditingDepositType(t)}
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                                editingDepositType === t ? 'bg-slate-900 text-white' : 'text-slate-500'
                              }`}
                            >
                              {t === 'percent' ? '%' : '$'}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={editingDepositValue || ''}
                          onChange={(e) => setEditingDepositValue(parseFloat(e.target.value) || 0)}
                          className={`w-16 rounded border border-slate-200 px-2 py-1 text-xs font-bold text-slate-900 text-right bg-white ${noSpinners}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                    <span className="text-sm font-bold text-slate-900">Total Estimate</span>
                    <span className="text-base font-bold text-emerald-600">{fmt(quoteEditorTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50">
                {editingQuoteId ? (
                  <button
                    onClick={deleteQuoteTemplate}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
                  >
                    Delete Template
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuoteEditorOpen(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveQuoteTemplate}
                    disabled={quoteSaving}
                    className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition"
                  >
                    {quoteSaving ? 'Saving...' : 'Save Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── QUOTE PREVIEW MODAL ── */}
        {showQuotePreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowQuotePreview(false)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
                <span className="text-sm font-bold text-slate-900">Estimate Template Preview</span>
                <button
                  onClick={() => setShowQuotePreview(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-5 space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/quote-sheet-preview.webp"
                  alt="Quote preview"
                  className="w-full rounded-lg border border-slate-200 shadow-sm"
                />
                <p className="text-xs text-slate-600 leading-relaxed">
                  Configuring pricing templates allows line items to automatically load when creating quotes for leads.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CATEGORY CONFIRMATION MODAL ── */}
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Remove Category?</h3>
              <p className="mt-1 text-xs text-slate-500">
                Are you sure you want to remove <span className="font-semibold text-slate-900">&quot;{deleteConfirm.label}&quot;</span>?
              </p>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}