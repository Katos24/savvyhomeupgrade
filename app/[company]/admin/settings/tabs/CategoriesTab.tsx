'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, CheckSquare, Trash2, Save, AlertTriangle, Layers, DollarSign,
  AlertCircle, Lock, Check, Percent, HandCoins, Loader2,
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

// Deposit is calculated on the grand total, tax included — that's what the
// customer is actually being asked to put down. Capped at the total so a
// fixed $500 deposit on a $300 job can't exceed the job.
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
    <div className="min-h-screen bg-slate-50/50 px-4 py-6 sm:px-6 sm:py-10 lg:px-12 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-slate-200/80 bg-white py-16 text-center shadow-lg shadow-slate-200/60">
          <Lock className="mx-auto mb-3 h-6 w-6 text-slate-300" />
          <p className="text-sm font-bold text-slate-800">Categories &amp; pricing is on the Basic plan</p>
          <a
            href={`/${companySlug}/home?section=billing`}
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
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
  const [addingItem, setAddingItem] = useState(false);
  const [lineItemError, setLineItemError] = useState('');
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteError, setQuoteError] = useState('');
  const [showQuotePreview, setShowQuotePreview] = useState(false);

  // Per-template values being edited in the pricing modal. Moved up here with
  // the rest of the state — it was previously declared mid-component.
  const [editingTaxRateValue, setEditingTaxRateValue] = useState<number>(0);
  const [editingDepositType, setEditingDepositType] = useState<DepositType | null>(null);
  const [editingDepositValue, setEditingDepositValue] = useState<number>(0);

  // Company-wide defaults.
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

  // Which default is being offered for backfill onto existing templates.
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
        setDepositError(result.error || 'Could not save the deposit default.');
      }
    } catch {
      setDepositError('Network error. Try again.');
    } finally {
      setDepositSaving(false);
    }
  };

  // Pushes one company default onto every saved template. Deliberately touches
  // a single field so applying a deposit can't quietly reset tax rates.
  const applyDefaultToAllTemplates = async (target: 'tax' | 'deposit') => {
    setApplyingToAll(true);
    setSaveError('');

    try {
      // Normalize items the way openQuoteEditor does. Stored items don't
      // reliably carry `amount`, so summing it directly yields NaN totals.
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
        // Applying a deposit shouldn't rewrite pricing. Only recompute the
        // total when the tax rate is what changed.
        const nextTotal =
          target === 'tax' ? subtotal + subtotal * (nextTaxRate / 100) : t.total;

        return {
          ...t,
          items: normalizedItems,
          tax_rate: nextTaxRate,
          // Both columns go null together — deposit_value of 0 alongside a
          // null type violates the paired CHECK constraint and throws the
          // whole batch.
          deposit_type: target === 'deposit' ? depositType : (t.deposit_type ?? null),
          deposit_value:
            target === 'deposit'
              ? (depositType && depositValue > 0 ? depositValue : null)
              : (t.deposit_value ?? null),
          total: nextTotal,
        };
      });

      // One request, one statement server-side. The old version fired N
      // parallel updates that overwrote each other.
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

      if (data.updated !== data.requested) {
        setSaveError(
          `Only ${data.updated} of ${data.requested} templates updated. Refresh and try again.`
        );
      }

      setQuoteTemplates(data.templates || updatedTemplates);
      setApplyTarget(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Apply default to all failed:', err);
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
    // New templates inherit the company's current tax rate and deposit terms.
    // Existing templates keep whatever they were saved with — changing a
    // company default later doesn't retroactively touch saved templates.
    setEditingTaxRateValue(existing ? (existing.tax_rate ?? 0) : taxRate);
    setEditingDepositType(existing ? (existing.deposit_type ?? null) : depositType);
    setEditingDepositValue(existing ? (existing.deposit_value ?? 0) : depositValue);
    setNewDesc(''); setNewPrice(''); setNewQty('1');
    setAddingItem(false); setLineItemError(''); setQuoteError('');
    setQuoteEditorCatValue(catValue);
    setQuoteEditorOpen(true);
  };

  const addLineItem = () => {
    if (!newDesc.trim()) { setLineItemError('Enter a description.'); return; }
    const price = clean(newPrice);
    if (!newPrice || price === 0) { setLineItemError('Enter a valid price.'); return; }
    const qty = clean(newQty) || 1;
    setEditingLineItems(prev => [...prev, { id: `item_${Date.now()}`, description: newDesc.trim(), quantity: qty, unitPrice: price, amount: qty * price }]);
    setNewDesc(''); setNewPrice(''); setNewQty('1'); setLineItemError(''); setAddingItem(false);
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

  // Plan gate lives after every hook above, so hook order never changes
  // between renders regardless of plan_tier.
  if (!can((company.plan_tier || 'free') as PlanTier, 'categories')) {
    return <LockedCategoriesSection companySlug={company.slug} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 px-4 py-6 sm:px-6 sm:py-10 lg:px-12 font-sans text-slate-900 antialiased">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 pb-24">

        {/* ── TITLE + ACTIONS ── */}
        <div className="pb-2 border-b border-slate-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Service Categories</h1>
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Unsaved changes
              </span>
            )}
          </div>
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          )}
        </div>

        {/* ── HEADLINE CARD ── */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-lg shadow-slate-200/60">
          <h2 className="text-sm sm:text-base font-bold leading-snug text-slate-900">
            Set up your estimate templates to create invoices faster
          </h2>
          <ul className="mt-3 space-y-1.5 text-xs sm:text-sm font-medium leading-relaxed text-slate-600 list-disc pl-4">
            <li>Adjust quantity and price per job — templates are just a starting point.</li>
            <li>Add or remove line items whenever a job needs it.</li>
            <li>Set a deposit and the quote splits into an amount due on signing and a balance.</li>
          </ul>
          <button
            onClick={() => setShowQuotePreview(true)}
            className="mt-3 text-xs font-semibold text-slate-500 underline hover:text-slate-800 transition"
          >
            See where this shows up
          </button>
        </div>

        {/* ── APPLY A CHANGED DEFAULT TO EXISTING TEMPLATES ── */}
        {applyTarget && (
          <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <p className="text-xs sm:text-sm font-semibold text-emerald-800">
              Apply {applyTarget === 'tax' ? `${taxRate}% tax` : depositLabel(depositType, depositValue).toLowerCase()} to your{' '}
              {quoteTemplates.length} existing pricing template{quoteTemplates.length !== 1 ? 's' : ''} too?
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => applyDefaultToAllTemplates(applyTarget)}
                disabled={applyingToAll}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-60 transition"
              >
                {applyingToAll ? 'Applying...' : 'Apply to all'}
              </button>
              <button
                onClick={() => setApplyTarget(null)}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                No, just new ones
              </button>
            </div>
          </div>
        )}

        {/* ── STATUS ── */}
        {saveSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-800 shadow-xs">
            <Check className="h-4 w-4 shrink-0" /> Saved successfully.
          </div>
        )}
        {saveError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
          </div>
        )}

        {/* ── ADD CATEGORY + COMPANY DEFAULTS ── */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-lg shadow-slate-200/60 space-y-2">
          <AnimatePresence mode="wait">
            {showAddForm ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <input
                  autoFocus
                  value={newCatLabel}
                  onChange={e => { setNewCatLabel(e.target.value); setNewCatError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                  placeholder="e.g. Plumbing, HVAC, Roofing..."
                  className={`flex-1 rounded-md border px-4 py-2.5 text-sm font-semibold outline-none transition ${
                    newCatError ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900'
                  }`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 sm:flex-none"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewCatLabel(''); setNewCatError(''); }}
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:flex-none"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <motion.button
                  key="trigger"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 sm:w-auto sm:py-2"
                >
                  <Plus className="h-3.5 w-3.5" /> Add category
                </motion.button>

                {editingTaxRate ? (
                  <div className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 sm:w-auto">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        max="100"
                        value={taxRateDraft}
                        onChange={(e) => setTaxRateDraft(e.target.value)}
                        autoFocus
                        className="w-16 border-none bg-transparent text-sm font-semibold text-slate-900 outline-none"
                      />
                      <span className="text-xs font-semibold text-slate-500">%</span>
                    </div>
                    <div className="ml-auto flex items-center gap-3 sm:ml-0">
                      <button
                        onClick={saveTaxRate}
                        disabled={taxRateSaving}
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition"
                      >
                        {taxRateSaving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setEditingTaxRate(false); setTaxRateDraft(String(taxRate)); }}
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingTaxRate(true)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition sm:w-auto sm:justify-start sm:py-2"
                  >
                    <Percent className="h-3.5 w-3.5 text-slate-500" />
                    Tax rate: {taxRate}%
                  </button>
                )}

                {editingDepositDefault ? (
                  <div className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 sm:w-auto">
                    <div className="flex items-center gap-2">
                      <div className="flex overflow-hidden rounded-md border border-slate-300">
                        {(['percent', 'fixed'] as DepositType[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => setDepositTypeDraft(t)}
                            className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                              depositTypeDraft === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
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
                        className={`w-16 border-none bg-transparent text-sm font-semibold text-slate-900 outline-none ${noSpinners}`}
                      />
                    </div>
                    <div className="ml-auto flex items-center gap-3 sm:ml-0">
                      <button
                        onClick={() => saveDepositDefault(false)}
                        disabled={depositSaving}
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:opacity-60 transition"
                      >
                        {depositSaving ? '...' : 'Save'}
                      </button>
                      {depositType && (
                        <button
                          onClick={() => saveDepositDefault(true)}
                          disabled={depositSaving}
                          className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition"
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
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingDepositDefault(true)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition sm:w-auto sm:justify-start sm:py-2"
                  >
                    <HandCoins className="h-3.5 w-3.5 text-slate-500" />
                    {depositType ? `Deposit: ${depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)}` : 'Deposit: none'}
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
          {newCatError && (
            <p className="flex items-center gap-1 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-3 w-3" /> {newCatError}
            </p>
          )}
          {depositError && (
            <p className="flex items-center gap-1 text-xs font-semibold text-rose-600">
              <AlertCircle className="h-3 w-3" /> {depositError}
            </p>
          )}
        </div>

        {/* ── CATEGORY GRID ── */}
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-slate-700" /> Update your categories, tasks, and templates
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categories.map((cat, index) => {
              const taskCount = cat.task_templates?.length || 0;
              const quoteTemplate = quoteTemplates.find(t => t.category === cat.value);
              const hasDeposit = !!quoteTemplate?.deposit_type && (quoteTemplate.deposit_value ?? 0) > 0;
              return (
                <motion.div
                  key={cat.value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white rounded-xl border border-slate-200/80 p-5 shadow-lg shadow-slate-200/60 transition-shadow hover:shadow-slate-300/60"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Layers className="h-5 w-5 text-slate-600" />
                    </div>
                    <button
                      onClick={() => setDeleteConfirm({ index, label: cat.label })}
                      className="rounded-lg p-2 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                      aria-label={`Delete ${cat.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="mb-3 text-sm font-bold text-slate-900">{cat.label}</h3>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      taskCount > 0 ? 'border-slate-300 bg-slate-100 text-slate-700' : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}>
                      <CheckSquare className="h-3 w-3" />
                      {taskCount > 0 ? `${taskCount} Task${taskCount !== 1 ? 's' : ''}` : 'No Tasks'}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      quoteTemplate ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}>
                      <DollarSign className="h-3 w-3" />
                      {quoteTemplate ? `${quoteTemplate.items.length} Item${quoteTemplate.items.length !== 1 ? 's' : ''}` : 'No Pricing'}
                    </span>
                    {hasDeposit && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                        <HandCoins className="h-3 w-3" />
                        {quoteTemplate!.deposit_type === 'percent'
                          ? `${quoteTemplate!.deposit_value}% Down`
                          : `${fmt(quoteTemplate!.deposit_value ?? 0)} Down`}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openTaskEditor(index)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 shadow-xs transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                    >
                      <Plus className="h-3 w-3" /> Tasks
                    </button>
                    <button
                      onClick={() => openQuoteEditor(cat.value)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 shadow-xs transition hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                    >
                      <Plus className="h-3 w-3" /> Pricing
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── STICKY UNSAVED-CHANGES PROMPT ── */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="sticky bottom-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)]"
            >
              <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  You have unsaved changes.
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TASK EDITOR MODAL ── */}
        {taskEditorCatIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
            onClick={() => { setTaskEditorCatIndex(null); setTaskInputError(false); }}
          >
            <div
              className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <span className="text-sm font-bold text-slate-900">
                  {categories[taskEditorCatIndex]?.label} tasks
                </span>
                <button
                  onClick={() => { setTaskEditorCatIndex(null); setTaskInputError(false); }}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div className={`flex gap-2 rounded-lg border p-1 transition-colors ${
                  taskInputError ? 'border-rose-400 bg-rose-50' : 'border-slate-300 bg-slate-50'
                }`}>
                  <input
                    value={newTaskLabel}
                    onChange={e => { setNewTaskLabel(e.target.value); setTaskInputError(false); }}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder="Type a task step..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm font-semibold text-slate-900 outline-none"
                  />
                  <button
                    onClick={addTask}
                    className="rounded-md bg-slate-900 p-2.5 text-white transition hover:bg-slate-800"
                    aria-label="Add task"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {taskInputError && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-rose-700">
                    <AlertCircle className="h-3 w-3" /> Click the + button to add your task before saving.
                  </p>
                )}

                <div className="space-y-2">
                  {editingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
                      <div className="h-4 w-4 shrink-0 rounded border-2 border-slate-300" />
                      <span className="flex-1 text-sm font-semibold text-slate-800">{task.label}</span>
                      <button
                        onClick={() => setEditingTasks(editingTasks.filter(t => t.id !== task.id))}
                        className="text-slate-400 hover:text-rose-600 transition"
                        aria-label={`Remove ${task.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-200 p-4">
                <button
                  onClick={() => setTaskEditorCatIndex(null)}
                  className="rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTaskTemplates}
                  className="rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-slate-800"
                >
                  Save checklist
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── PRICING TEMPLATE MODAL ── */}
        {quoteEditorOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
            onClick={() => setQuoteEditorOpen(false)}
          >
            <div
              className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
                <div>
                  <p className="text-sm font-bold text-slate-900">Pricing Template</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {activeQuoteEditorCat?.label}
                  </p>
                </div>
                <button
                  onClick={() => setQuoteEditorOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Table headers, desktop only */}
              <div className="hidden shrink-0 grid-cols-[1fr_120px_80px_100px_40px] gap-0 border-b border-slate-200 bg-slate-50 px-6 py-3 sm:grid">
                {['Item Description', 'Unit Price', 'Qty', 'Total', ''].map((h, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-bold uppercase tracking-wide text-slate-500 ${i > 0 && i < 4 ? 'text-right' : ''}`}
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div className="divide-y divide-slate-100">
                {editingLineItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex flex-col gap-3 p-5 hover:bg-slate-50/60 transition-colors sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:gap-0 sm:p-0"
                  >
                    <div className="sm:px-6">
                      <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400 sm:hidden">
                        Description
                      </span>
                      <input
                        value={item.description}
                        onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 focus:bg-white sm:border-none sm:bg-transparent sm:py-4"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:contents">
                      <div className="flex flex-col sm:border-l sm:border-slate-100 sm:px-4">
                        <span className="mb-1 block text-center text-[10px] font-bold uppercase text-slate-400 sm:hidden">Price</span>
                        <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 sm:justify-end sm:border-none sm:bg-transparent">
                          <span className="text-xs text-slate-400">$</span>
                          <input
                            type="number"
                            value={item.unitPrice || ''}
                            onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)}
                            className={`w-full border-none bg-transparent py-2 text-sm font-semibold text-slate-900 outline-none focus:ring-0 sm:text-right ${noSpinners}`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:border-l sm:border-slate-100 sm:px-4">
                        <span className="mb-1 block text-center text-[10px] font-bold uppercase text-slate-400 sm:hidden">Qty</span>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={e => updateLineItem(item.id, 'quantity', e.target.value)}
                          className={`w-full rounded-md border border-slate-200 bg-slate-50 py-2 text-center text-sm font-semibold text-slate-900 outline-none focus:ring-0 sm:border-none sm:bg-transparent sm:text-right ${noSpinners}`}
                        />
                      </div>

                      <div className="flex flex-col sm:border-l sm:border-slate-100 sm:px-4">
                        <span className="mb-1 block text-center text-[10px] font-bold uppercase text-slate-400 sm:hidden">Total</span>
                        <div className="flex h-full items-center justify-center text-center text-sm font-bold text-emerald-600 sm:justify-end sm:py-4 sm:text-right">
                          {fmt(item.amount)}
                        </div>
                      </div>
                    </div>

                    <div className="absolute right-4 top-4 sm:static sm:flex sm:items-center sm:justify-center">
                      <button
                        onClick={() => setEditingLineItems(prev => prev.filter(x => x.id !== item.id))}
                        className="rounded-lg p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition sm:bg-transparent"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add new item */}
                <div className={`border-t border-dashed border-slate-200 p-5 sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:p-0 ${
                  lineItemError ? 'bg-rose-50/50' : 'bg-emerald-50/40'
                }`}>
                  <div className="mb-3 sm:mb-0 sm:px-6">
                    <input
                      value={newDesc}
                      onChange={e => { setNewDesc(e.target.value); setLineItemError(''); }}
                      onKeyDown={e => e.key === 'Enter' && addLineItem()}
                      placeholder="Item name (e.g. Labor)"
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 sm:border-none sm:bg-transparent sm:py-4"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_80px_60px] gap-2 sm:contents">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 sm:border-none sm:bg-transparent sm:px-4">
                      <span className="mr-1 text-xs text-emerald-600">$</span>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={e => { setNewPrice(e.target.value); setLineItemError(''); }}
                        placeholder="0.00"
                        className={`w-full border-none bg-transparent py-3 text-sm font-semibold text-slate-900 outline-none focus:ring-0 sm:text-right ${noSpinners}`}
                      />
                    </div>
                    <div className="sm:border-l sm:border-slate-200 sm:px-4">
                      <input
                        type="number"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                        className={`w-full rounded-lg border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-900 outline-none focus:ring-0 sm:border-none sm:bg-transparent sm:text-right ${noSpinners}`}
                      />
                    </div>
                    <div className="flex items-center justify-center sm:border-l sm:border-slate-200">
                      <button
                        onClick={addLineItem}
                        className="flex h-full w-full items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs transition active:scale-95 sm:h-10 sm:w-10"
                        aria-label="Add item"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 space-y-4">
                {lineItemError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {lineItemError}
                  </div>
                )}
                {quoteError && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {quoteError}
                  </div>
                )}

                {/* ── SUBTOTAL & TOTAL DISPLAY ── */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>Subtotal</span>
                    <span>{fmt(quoteEditorSubtotal)}</span>
                  </div>
                  {editingTaxRateValue > 0 && (
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Tax ({editingTaxRateValue}%)</span>
                      <span>{fmt(quoteEditorTaxAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Total estimate</span>
                    <span className="text-xl font-bold text-emerald-600">{fmt(quoteEditorTotal)}</span>
                  </div>
                </div>

                {/* ── TAX RATE & DEPOSIT GRID (LEFT TO RIGHT) ── */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                  {/* Tax Rate Block */}
                  <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <Percent className="h-3.5 w-3.5 text-emerald-600" />
                        Tax Rate
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          max="100"
                          value={editingTaxRateValue}
                          onChange={(e) => setEditingTaxRateValue(parseFloat(e.target.value) || 0)}
                          className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-xs font-semibold text-slate-900 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                        />
                        <span className="text-xs font-semibold text-slate-500">%</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-2 mt-2 text-[11px] font-medium text-slate-500">
                      Amount: <span className="font-semibold text-slate-800">{fmt(quoteEditorTaxAmount)}</span>
                    </div>
                  </div>

                  {/* Deposit Terms Block */}
                  <div className="flex flex-col justify-between space-y-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                        <HandCoins className="h-3.5 w-3.5 text-amber-600" />
                        Deposit
                      </label>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <div className="flex overflow-hidden rounded-md border border-slate-200">
                          {(['percent', 'fixed'] as DepositType[]).map((t) => (
                            <button
                              key={t}
                              onClick={() => setEditingDepositType(t)}
                              className={`px-2 py-1 text-[11px] font-bold transition-colors ${
                                editingDepositType === t
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-white text-slate-500 hover:bg-slate-50'
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
                          max={editingDepositType === 'percent' ? 100 : undefined}
                          value={editingDepositValue || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const v = parseFloat(e.target.value) || 0;
                            setEditingDepositValue(v);
                            if (v > 0 && !editingDepositType) setEditingDepositType('percent');
                          }}
                          className={`w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-right text-xs font-semibold text-slate-900 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 ${noSpinners}`}
                        />
                        {editingDepositValue > 0 && (
                          <button
                            onClick={() => { setEditingDepositValue(0); setEditingDepositType(null); }}
                            className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {quoteEditorDeposit > 0 ? (
                      <div className="space-y-0.5 border-t border-slate-200 pt-2 text-[11px] font-semibold">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Signing:</span>
                          <span className="text-amber-700">{fmt(quoteEditorDeposit)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Balance:</span>
                          <span className="text-slate-700">{fmt(quoteEditorBalance)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="border-t border-slate-200 pt-2 text-[11px] font-medium text-slate-400">
                        No deposit required.
                      </p>
                    )}
                  </div>

                </div>

                {editingDepositType === 'fixed' && editingDepositValue > quoteEditorTotal && quoteEditorTotal > 0 && (
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700">
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    Deposit is more than the estimate. It will be capped at the total.
                  </p>
                )}

                {/* Modal Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {editingQuoteId ? (
                    <button
                      onClick={deleteQuoteTemplate}
                      className="rounded-lg border border-slate-200 bg-white py-3 text-[11px] font-bold uppercase tracking-wide text-rose-600 transition hover:bg-rose-50"
                    >
                      Delete Template
                    </button>
                  ) : (
                    <button
                      onClick={() => setQuoteEditorOpen(false)}
                      className="rounded-lg border border-slate-200 bg-white py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={saveQuoteTemplate}
                    disabled={quoteSaving}
                    className="rounded-lg bg-emerald-600 py-3 text-[11px] font-bold uppercase tracking-wide text-white shadow-xs transition active:scale-[0.98] disabled:opacity-60 hover:bg-emerald-700"
                  >
                    {quoteSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── QUOTE SHEET PREVIEW ── */}
        {showQuotePreview && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
            onClick={() => setShowQuotePreview(false)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <span className="text-sm font-bold text-slate-900">Your pricing template, on the job</span>
                <button
                  onClick={() => setShowQuotePreview(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/quote-sheet-preview.webp"
                  alt="Quote sheet with pricing template line items loaded"
                  className="w-full rounded-lg border border-slate-200"
                />
                <p className="mt-3 text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                  This is the Quote tab on a job — your estimate builder, not
                  the invoice. Set a pricing template for a category and
                  these line items — description, unit price, and quantity —
                  load in automatically here. Everything stays editable, and
                  sending the invoice is a separate step once the quote is
                  approved.
                </p>
                <p className="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                  A deposit on the template carries over as the amount due on
                  signing, with the rest as the balance. You can change it per
                  job before the quote goes out.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM ── */}
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-rose-200 bg-rose-50">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="mb-2 text-base font-bold text-slate-900">Remove category?</h3>
              <p className="mb-2 text-sm font-medium text-slate-600">
                This will remove <span className="font-bold text-slate-900">&quot;{deleteConfirm.label}&quot;</span>.
              </p>
              <p className="mb-6 text-xs font-semibold text-amber-700">
                Task checklists will also be removed. Pricing templates are stored separately.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Keep it
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-rose-700"
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