'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, CheckSquare, Trash2, Save, AlertTriangle, Layers, DollarSign,
  AlertCircle, Lock, Tag, ClipboardList, Send, SlidersHorizontal, Check, Calculator,
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';
import { can, type PlanTier } from '@/lib/permissions';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type TaskTemplate = { id: string; label: string; order: number };
type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
type QuoteTemplate = { id: string; category: string; items: LineItem[]; total: number };
type Category = { value: string; label: string; task_templates?: TaskTemplate[] };

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(n) ? 0 : n);

const clean = (v: any): number => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };
const noSpinners = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

// ─── LOCKED STATE ────────────────────────────────────────────────────────────

function LockedCategoriesSection({ companySlug }: { companySlug: string }) {
  return (
    <div className="bg-[#F3F2FB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border-2 border-stone-300 bg-white py-16 text-center shadow-sm">
          <Lock className="mx-auto mb-3 h-6 w-6 text-stone-300" />
          <p className="text-sm font-bold text-stone-800">Categories &amp; pricing is on the Basic plan</p>
          <a
            href={`/${companySlug}/admin/settings`}
            className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-stone-800"
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
    setQuoteSaving(true); setQuoteError('');
    const total = editingLineItems.reduce((s, i) => s + i.amount, 0);
    const templateData = { id: editingQuoteId || `custom_${Date.now()}`, category: quoteEditorCatValue, items: editingLineItems, total };
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: editingQuoteId ? 'update' : 'create', template: templateData }),
      });
      const result = await res.json();
      if (result.success) {
        const r = await fetch(`/api/company/${company.slug}/quote-templates`);
        const d = await r.json();
        if (d.success) setQuoteTemplates(d.templates || []);
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
      if (result.success) { setQuoteTemplates(prev => prev.filter(t => t.id !== editingQuoteId)); setQuoteEditorOpen(false); }
    } catch {}
  };

  const activeQuoteEditorCat = categories.find(c => c.value === quoteEditorCatValue);
  const quoteEditorTotal = editingLineItems.reduce((s, i) => s + i.amount, 0);

  // Plan gate lives after every hook above, so hook order never changes
  // between renders regardless of plan_tier.
  if (!can((company.plan_tier || 'free') as PlanTier, 'categories')) {
    return <LockedCategoriesSection companySlug={company.slug} />;
  }

  return (
    <div className="bg-[#F3F2FB] px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl pb-24">
      {/* ── TITLE + ACTIONS ── */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Service categories</h2>
            {isDirty && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved changes
              </span>
            )}
          </div>
          {isDirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          )}
        </div>
        
{/* ── HEADLINE ── */}
        <div className="mb-6">
          <h3 className="text-[18px] font-bold leading-snug text-stone-900">
            Set up your estimate templates to create invoices faster
          </h3>
          <ul className="mt-3 space-y-1.5 text-[14px] font-medium leading-relaxed text-stone-600">
            <li>Adjust quantity and price per job — templates are just a starting point.</li>
            <li>Add or remove line items whenever a job needs it.</li>
          </ul>
          <button
            onClick={() => setShowQuotePreview(true)}
            className="mt-3 text-[12px] font-semibold text-stone-500 underline hover:text-stone-700"
          >
            See where this shows up
          </button>
        </div>

        {/* ── STATUS ── */}
        {saveSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">
            <Check className="h-4 w-4 shrink-0" /> Saved successfully.
          </div>
        )}
        {saveError && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-rose-300 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
          </div>
        )}

        {/* ── ADD CATEGORY ── */}
        <div className="mb-6">
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
                  className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-bold outline-none transition ${
                    newCatError ? 'border-rose-400 bg-rose-50' : 'border-stone-300 bg-white focus:border-stone-900'
                  }`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 sm:flex-none"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setNewCatLabel(''); setNewCatError(''); }}
                    className="flex-1 rounded-lg border-2 border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50 sm:flex-none"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="trigger"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-2 text-[12px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
              >
                <Plus className="h-3.5 w-3.5" /> Add category
              </motion.button>
            )}
          </AnimatePresence>
          {newCatError && (
            <p className="mt-2 flex items-center gap-1 text-xs font-bold text-rose-600">
              <AlertCircle className="h-3 w-3" /> {newCatError}
            </p>
          )}
        </div>

        {/* ── CATEGORY GRID ── */}
        <p className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-stone-700">
          Update your categories, tasks, and templates below
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {categories.map((cat, index) => {
            const taskCount = cat.task_templates?.length || 0;
            const quoteTemplate = quoteTemplates.find(t => t.category === cat.value);
            return (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl border border-gray-800 bg-[#0F172A] p-5 shadow-sm transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/10"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800">
                    <Layers className="h-5 w-5 text-indigo-400" />
                  </div>
                  <button
                    onClick={() => setDeleteConfirm({ index, label: cat.label })}
                    className="rounded-lg p-2 text-gray-600 transition-all hover:bg-red-500/10 hover:text-red-400"
                    aria-label={`Delete ${cat.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="mb-3 text-sm font-black text-white">{cat.label}</h3>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    taskCount > 0 ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400' : 'border-gray-700 bg-gray-800/50 text-gray-600'
                  }`}>
                    <CheckSquare className="h-3 w-3" />
                    {taskCount > 0 ? `${taskCount} Task${taskCount !== 1 ? 's' : ''}` : 'No Tasks'}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                    quoteTemplate ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-gray-700 bg-gray-800/50 text-gray-600'
                  }`}>
                    <DollarSign className="h-3 w-3" />
                    {quoteTemplate ? `${quoteTemplate.items.length} Item${quoteTemplate.items.length !== 1 ? 's' : ''}` : 'No Pricing'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openTaskEditor(index)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-400 transition-all hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
                  >
                    <Plus className="h-3 w-3" /> Tasks
                  </button>
                  <button
                    onClick={() => openQuoteEditor(cat.value)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-700 bg-gray-800 py-2.5 text-[11px] font-black uppercase tracking-widest text-gray-400 transition-all hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                  >
                    <Plus className="h-3 w-3" /> Pricing
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── STICKY UNSAVED-CHANGES PROMPT ── */}
        <AnimatePresence>
          {isDirty && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="sticky bottom-0 z-40 border-t-2 border-stone-300 bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
            >
              <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-stone-800">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  You have unsaved changes.
                </p>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-stone-800 disabled:opacity-60 sm:w-auto"
                >
                  {saving && <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TASK EDITOR MODAL ── */}
        {taskEditorCatIndex !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4"
            onClick={() => { setTaskEditorCatIndex(null); setTaskInputError(false); }}
          >
            <div
              className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-lg bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b-2 border-stone-200 px-5 py-4">
                <span className="text-[15px] font-extrabold text-stone-900">
                  {categories[taskEditorCatIndex]?.label} tasks
                </span>
                <button
                  onClick={() => { setTaskEditorCatIndex(null); setTaskInputError(false); }}
                  className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div className={`flex gap-2 rounded-lg border-2 p-1 transition-colors ${
                  taskInputError ? 'border-rose-400 bg-rose-50' : 'border-stone-300 bg-stone-50'
                }`}>
                  <input
                    value={newTaskLabel}
                    onChange={e => { setNewTaskLabel(e.target.value); setTaskInputError(false); }}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder="Type a task step..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm font-semibold text-stone-900 outline-none"
                  />
                  <button
                    onClick={addTask}
                    className="rounded-lg bg-blue-600 p-2.5 text-white transition-colors hover:bg-blue-700"
                    aria-label="Add task"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {taskInputError && (
                  <p className="flex items-center gap-1 text-[12px] font-bold text-rose-700">
                    <AlertCircle className="h-3 w-3" /> Click the + button to add your task before saving.
                  </p>
                )}

                <div className="space-y-2">
                  {editingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg border-2 border-stone-200 bg-stone-50 px-4 py-2.5">
                      <div className="h-4 w-4 shrink-0 rounded border-2 border-blue-300" />
                      <span className="flex-1 text-sm font-bold text-stone-800">{task.label}</span>
                      <button
                        onClick={() => setEditingTasks(editingTasks.filter(t => t.id !== task.id))}
                        className="text-stone-400 hover:text-rose-600"
                        aria-label={`Remove ${task.label}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t-2 border-stone-200 p-4">
                <button
                  onClick={() => setTaskEditorCatIndex(null)}
                  className="rounded-lg border-2 border-stone-300 bg-white py-2.5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTaskTemplates}
                  className="rounded-lg bg-stone-900 py-2.5 text-sm font-bold text-white transition-colors hover:bg-stone-800"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
            onClick={() => setQuoteEditorOpen(false)}
          >
            <div
              className="flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0F172A] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#1E293B] px-6 py-5">
                <div>
                  <p className="text-lg font-black text-white">Pricing Template</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {activeQuoteEditorCat?.label}
                  </p>
                </div>
                <button
                  onClick={() => setQuoteEditorOpen(false)}
                  className="rounded-xl bg-white/5 p-2 transition hover:bg-white/10"
                  aria-label="Close"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Table headers, desktop only */}
              <div className="hidden shrink-0 grid-cols-[1fr_120px_80px_100px_40px] gap-0 border-b border-white/10 bg-[#020617] px-6 py-3 sm:grid">
                {['Item Description', 'Unit Price', 'Qty', 'Total', ''].map((h, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-black uppercase tracking-widest text-gray-400 ${i > 0 && i < 4 ? 'text-right' : ''}`}
                  >
                    {h}
                  </span>
                ))}
              </div>

              <div className="flex-1 divide-y divide-white/[0.05] overflow-y-auto pb-24 sm:pb-0">
                {editingLineItems.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex flex-col gap-3 p-5 hover:bg-white/[0.02] sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:gap-0 sm:p-0"
                  >
                    <div className="sm:px-6">
                      <span className="mb-1 block text-[10px] font-black uppercase text-indigo-400 sm:hidden">
                        Description
                      </span>
                      <input
                        value={item.description}
                        onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-indigo-500 sm:border-none sm:bg-transparent sm:py-4"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:contents">
                      <div className="flex flex-col sm:border-l sm:border-white/5 sm:px-4">
                        <span className="mb-1 block text-center text-[10px] font-black uppercase text-indigo-400 sm:hidden">Price</span>
                        <div className="flex items-center rounded-lg border border-white/10 bg-white/5 px-2 sm:justify-end sm:border-none sm:bg-transparent">
                          <span className="text-xs text-gray-500">$</span>
                          <input
                            type="number"
                            value={item.unitPrice || ''}
                            onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)}
                            className={`w-full border-none bg-transparent py-2 text-sm font-black text-white outline-none focus:ring-0 sm:text-right ${noSpinners}`}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:border-l sm:border-white/5 sm:px-4">
                        <span className="mb-1 block text-center text-[10px] font-black uppercase text-indigo-400 sm:hidden">Qty</span>
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={e => updateLineItem(item.id, 'quantity', e.target.value)}
                          className={`w-full rounded-lg border border-white/10 bg-white/5 py-2 text-center text-sm font-bold text-white outline-none focus:ring-0 sm:border-none sm:bg-transparent sm:text-right ${noSpinners}`}
                        />
                      </div>

                      <div className="flex flex-col sm:border-l sm:border-white/5 sm:px-4">
                        <span className="mb-1 block text-center text-[10px] font-black uppercase text-indigo-400 sm:hidden">Total</span>
                        <div className="flex h-full items-center justify-center text-center text-sm font-black text-emerald-400 sm:justify-end sm:py-4 sm:text-right">
                          {fmt(item.amount)}
                        </div>
                      </div>
                    </div>

                    <div className="absolute right-4 top-4 sm:static sm:flex sm:items-center sm:justify-center">
                      <button
                        onClick={() => setEditingLineItems(prev => prev.filter(x => x.id !== item.id))}
                        className="rounded-lg bg-white/5 p-2 text-gray-500 hover:text-red-400 sm:bg-transparent"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add new item */}
                <div className={`border-t border-dashed border-white/10 p-5 sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:p-0 ${
                  lineItemError ? 'bg-red-500/5' : 'bg-emerald-500/5'
                }`}>
                  <div className="mb-3 sm:mb-0 sm:px-6">
                    <input
                      value={newDesc}
                      onChange={e => { setNewDesc(e.target.value); setLineItemError(''); }}
                      onKeyDown={e => e.key === 'Enter' && addLineItem()}
                      placeholder="Item name (e.g. Labor)"
                      className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-black text-white outline-none placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500 sm:border-none sm:bg-transparent sm:py-4"
                    />
                  </div>

                  <div className="grid grid-cols-[1fr_80px_60px] gap-2 sm:contents">
                    <div className="flex items-center rounded-xl border border-white/10 bg-white/10 px-3 sm:border-none sm:bg-transparent sm:px-4">
                      <span className="mr-1 text-xs text-emerald-500">$</span>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={e => { setNewPrice(e.target.value); setLineItemError(''); }}
                        placeholder="0.00"
                        className={`w-full border-none bg-transparent py-3 text-sm font-black text-white outline-none focus:ring-0 sm:text-right ${noSpinners}`}
                      />
                    </div>
                    <div className="sm:border-l sm:border-white/10 sm:px-4">
                      <input
                        type="number"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                        className={`w-full rounded-xl border border-white/10 bg-white/10 py-3 text-center text-sm font-bold text-white outline-none focus:ring-0 sm:border-none sm:bg-transparent sm:text-right ${noSpinners}`}
                      />
                    </div>
                    <div className="flex items-center justify-center sm:border-l sm:border-white/10">
                      <button
                        onClick={addLineItem}
                        className="flex h-full w-full items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 transition active:scale-90 sm:h-10 sm:w-10"
                        aria-label="Add item"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-white/10 bg-[#020617] p-6">
                {lineItemError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/20 p-3 text-[10px] font-black text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {lineItemError}
                  </div>
                )}
                {quoteError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/50 bg-red-500/20 p-3 text-[10px] font-black text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {quoteError}
                  </div>
                )}

                <div className="mb-6 flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Estimate</span>
                  <span className="text-2xl font-black text-emerald-400">{fmt(quoteEditorTotal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {editingQuoteId ? (
                    <button
                      onClick={deleteQuoteTemplate}
                      className="rounded-2xl bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-red-400 transition hover:bg-red-500/10"
                    >
                      Delete Template
                    </button>
                  ) : (
                    <button
                      onClick={() => setQuoteEditorOpen(false)}
                      className="rounded-2xl bg-white/5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={saveQuoteTemplate}
                    disabled={quoteSaving}
                    className="rounded-2xl bg-emerald-600 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-900/40 transition active:scale-95 disabled:opacity-60"
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4"
            onClick={() => setShowQuotePreview(false)}
          >
            <div
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b-2 border-stone-200 px-5 py-4">
                <span className="text-[15px] font-extrabold text-stone-900">Your pricing template, on the job</span>
                <button
                  onClick={() => setShowQuotePreview(false)}
                  className="rounded-full p-1 text-stone-500 hover:bg-stone-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/quote-sheet-preview.webp"
                  alt="Quote sheet with pricing template line items loaded"
                  className="w-full rounded-lg border-2 border-stone-200"
                />
                <p className="mt-3 text-[13px] font-semibold leading-relaxed text-stone-600">
                  This is the Quote tab on a job — your estimate builder, not
                  the invoice. Set a pricing template for a category and
                  these line items — description, unit price, and quantity —
                  load in automatically here. Everything stays editable, and
                  sending the invoice is a separate step once the quote is
                  approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM ── */}
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="w-full max-w-sm rounded-lg bg-white p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border-2 border-rose-200 bg-rose-50">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="mb-2 text-lg font-extrabold text-stone-900">Remove category?</h3>
              <p className="mb-2 text-sm font-medium text-stone-600">
                This will remove <span className="font-bold text-stone-900">&quot;{deleteConfirm.label}&quot;</span>.
              </p>
              <p className="mb-6 text-xs font-bold text-amber-700">
                Task checklists will also be removed. Pricing templates are stored separately.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg border-2 border-stone-300 bg-white py-2.5 text-sm font-bold text-stone-700 transition-colors hover:bg-stone-50"
                >
                  Keep it
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="rounded-lg bg-rose-600 py-2.5 text-sm font-bold text-white transition-colors hover:bg-rose-700"
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