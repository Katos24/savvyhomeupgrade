'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, RotateCcw, CheckSquare, Trash2, Save,
  AlertTriangle, Layers, DollarSign, ChevronRight,
  AlertCircle, ArrowLeft, Info
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';

// ─── TYPES ────────────────────────────────────────────────────────────────────

type TaskTemplate = { id: string; label: string; order: number };
type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
type QuoteTemplate = { id: string; category: string; items: LineItem[]; total: number };
type Category = { value: string; label: string; task_templates?: TaskTemplate[] };

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const noSpinners =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CategoriesTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser?: any;
}) {
  const defaultCategories =
    CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;

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
  const [quoteEditorCatValue, setQuoteEditorCatValue] = useState<string | null>(null);
  const [editingLineItems, setEditingLineItems] = useState<LineItem[]>([]);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [newLineItem, setNewLineItem] = useState({ description: '', quantity: '1', unitPrice: '' });
  const [lineItemError, setLineItemError] = useState('');
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const markDirty = useCallback(() => setIsDirty(true), []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/company/${company.slug}/quote-templates`);
        const data = await res.json();
        if (data.success) setQuoteTemplates(data.templates || []);
      } catch {}
      finally { setQuotesLoading(false); }
    }
    load();
  }, [company.slug]);

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) { setNewCatError('Please enter a category name.'); return; }
    const value = newCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories(prev => [...prev, { value, label: newCatLabel.trim(), task_templates: [] }]);
    setNewCatLabel(''); setNewCatError(''); setShowAddForm(false); setUseDefaults(false); markDirty();
  };

  const confirmDeleteCategory = () => {
    if (!deleteConfirm) return;
    setCategories(prev => prev.filter((_, i) => i !== deleteConfirm.index));
    setUseDefaults(false); setDeleteConfirm(null); markDirty();
  };

  const handleReset = () => {
    if (!confirm('Reset to default trade list? Any custom categories will be lost.')) return;
    setCategories(defaultCategories); setUseDefaults(true); markDirty();
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
      else setSaveError(data.error || 'Failed to save. Please try again.');
    } catch { setSaveError('Network error. Please try again.'); }
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

  const saveTaskTemplates = () => {
    if (newTaskLabel.trim()) { setTaskInputError(true); return; }
    if (taskEditorCatIndex === null) return;
    setCategories(prev => {
      const updated = [...prev];
      updated[taskEditorCatIndex] = { ...updated[taskEditorCatIndex], task_templates: editingTasks };
      return updated;
    });
    setUseDefaults(false); setTaskEditorCatIndex(null); markDirty();
  };

  const openQuoteEditor = (catValue: string) => {
    const existing = quoteTemplates.find(t => t.category === catValue);
    setQuoteEditorCatValue(catValue);
    setEditingLineItems(existing ? existing.items.map((item, i) => ({ ...item, id: `item_${Date.now()}_${i}` })) : []);
    setEditingQuoteId(existing?.id || null);
    setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
    setLineItemError(''); setQuoteError('');
  };

  const addLineItem = () => {
    if (!newLineItem.description.trim()) { setLineItemError('Enter a description.'); return; }
    if (!newLineItem.unitPrice || isNaN(parseFloat(newLineItem.unitPrice))) { setLineItemError('Enter a valid price.'); return; }
    const qty = parseFloat(newLineItem.quantity) || 1;
    const price = parseFloat(newLineItem.unitPrice);
    setEditingLineItems(prev => [...prev, { id: `item_${Date.now()}`, description: newLineItem.description.trim(), quantity: qty, unitPrice: price, amount: qty * price }]);
    setNewLineItem({ description: '', quantity: '1', unitPrice: '' }); setLineItemError('');
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setEditingLineItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 };
        if (field === 'quantity' || field === 'unitPrice') updated.amount = (updated.quantity || 1) * (updated.unitPrice || 0);
        return updated;
      })
    );
  };

  const saveQuoteTemplate = async () => {
    if (newLineItem.description.trim() || newLineItem.unitPrice) { setLineItemError('Click + to add this item before saving.'); return; }
    if (editingLineItems.length === 0) { setQuoteError('Add at least one line item to this template.'); return; }
    setQuoteSaving(true); setQuoteError('');
    const total = editingLineItems.reduce((s, i) => s + i.amount, 0);
    const templateData: QuoteTemplate = { id: editingQuoteId || `custom_${Date.now()}`, category: quoteEditorCatValue!, items: editingLineItems, total };
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: editingQuoteId ? 'update' : 'create', template: templateData }),
      });
      const result = await res.json();
      if (result.success) {
        const refreshed = await fetch(`/api/company/${company.slug}/quote-templates`);
        const refreshedData = await refreshed.json();
        if (refreshedData.success) setQuoteTemplates(refreshedData.templates || []);
        setQuoteEditorCatValue(null);
      } else setQuoteError(result.error || 'Failed to save quote template.');
    } catch { setQuoteError('Network error. Please try again.'); }
    finally { setQuoteSaving(false); }
  };

  const deleteQuoteTemplate = async () => {
    if (!editingQuoteId) return;
    if (!confirm('Remove this pricing template?')) return;
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', templateId: editingQuoteId }),
      });
      const result = await res.json();
      if (result.success) { setQuoteTemplates(prev => prev.filter(t => t.id !== editingQuoteId)); setQuoteEditorCatValue(null); }
    } catch {}
  };

  const activeQuoteEditorCat = categories.find(c => c.value === quoteEditorCatValue);
  const quoteEditorTotal = editingLineItems.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="max-w-4xl mx-auto pb-32 px-2 space-y-6">

      {/* PAGE HEADER — untouched */}
      <div className="pt-2">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Service Categories</h2>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-lg">
          When a new project is submitted, the system can automatically pre-load the right tasks and pricing — based on the category selected.
        </p>
      </div>

      {/* HOW IT WORKS BANNER — untouched */}
{/* ── UPDATED STEALTH WORKFLOW BANNER ── */}
<div className="relative group mb-8 overflow-hidden rounded-[2rem] border border-white/5 bg-[#0B0F1A] p-px shadow-2xl">
  {/* Animated Gradient Border Effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-transparent to-emerald-500/20 opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
  
  <div className="relative bg-[#0F172A] rounded-[calc(2rem-1px)] p-6 flex items-start gap-6">
    {/* Icon with Neon Glow */}
    <div className="relative shrink-0">
      <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
      <div className="relative w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center shadow-inner">
        <div className="w-2 h-2 rounded-full bg-indigo-500 absolute top-3 right-3 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        <Info className="w-7 h-7 text-indigo-400" />
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Automation Guide
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
      </div>
      
      <p className="text-sm leading-relaxed text-gray-400 max-w-2xl">
        Add or delete categories to match your trades. Attach 
        <span className="text-white font-bold px-1.5 py-0.5 bg-indigo-500/10 rounded-md border border-indigo-500/20 mx-1">
          Task Checklists
        </span> 
        or 
        <span className="text-white font-bold px-1.5 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20 mx-1">
          Pricing Templates
        </span> 
        to instantly pre-populate new projects when a category is selected.
      </p>
    </div>
  </div>
</div>

      {/* UNSAVED CHANGES BANNER — untouched */}
      {isDirty && (
        <div className="sticky top-0 z-30 -mx-2">
          <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">You have unsaved changes to your categories.</span>
            </div>
            <button onClick={handleSave} disabled={saving} className="bg-white text-amber-600 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl shrink-0 active:scale-95 transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Now'}
            </button>
          </div>
        </div>
      )}

      {/* STATUS — untouched */}
      {saveSuccess && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-sm">Categories saved successfully.</div>}
      {saveError && <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl font-bold text-sm flex gap-2 items-center"><AlertCircle className="w-4 h-4 shrink-0" /> {saveError}</div>}

      {/* ── ADD CATEGORY ── */}
      <div className={`rounded-2xl border-2 border-dashed transition-all ${showAddForm ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-200'}`}>
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.div key="form" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={spring} className="p-4 space-y-3">
              <input
                value={newCatLabel}
                onChange={e => { setNewCatLabel(e.target.value); setNewCatError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold focus:outline-none text-gray-900 text-sm transition ${newCatError ? 'border-red-400' : 'border-indigo-200 focus:border-indigo-400'}`}
                placeholder="e.g. Plumbing, HVAC, Roofing..."
                autoFocus
              />
              {newCatError && <p className="text-xs font-bold text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {newCatError}</p>}
              <div className="flex gap-2">
                <button onClick={handleAddCategory} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm transition active:scale-95">Add Category</button>
                <button onClick={() => { setShowAddForm(false); setNewCatLabel(''); setNewCatError(''); }} className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-50 transition">Cancel</button>
              </div>
            </motion.div>
          ) : (
            <motion.button key="trigger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddForm(true)} className="w-full py-5 flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-600 font-bold text-sm transition">
              <Plus className="w-4 h-4" /> Add new category
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── CATEGORY GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {categories.map((cat, index) => {
            const taskCount = cat.task_templates?.length || 0;
            const quoteTemplate = quoteTemplates.find(t => t.category === cat.value);
            return (
              <motion.div
  key={cat.value}
  layout
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="group relative bg-[#111827] border border-gray-800 rounded-[2rem] p-6 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] transition-all duration-300"
>
  {/* Card Top: Icon & Delete */}
  <div className="flex items-start justify-between mb-5">
    <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
      <Layers className="w-6 h-6 text-indigo-400" />
    </div>
    <button
      onClick={() => setDeleteConfirm({ index, label: cat.label })}
      className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>

  <h3 className="text-base font-black text-white mb-4 tracking-tight">{cat.label}</h3>

  {/* ── UPDATED PILLS ── */}
  <div className="flex flex-wrap gap-2 mb-6">
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
      taskCount > 0 
        ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
        : 'bg-gray-800/50 border-gray-700 text-gray-500'
    }`}>
      <CheckSquare className="w-3 h-3" />
      {taskCount > 0 ? `${taskCount} ${taskCount === 1 ? 'Task' : 'Tasks'}` : 'No Tasks'}
    </span>

    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${
      quoteTemplate 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
        : 'bg-gray-800/50 border-gray-700 text-gray-500'
    }`}>
      <DollarSign className="w-3 h-3" />
      {quoteTemplate ? `${quoteTemplate.items.length} ${quoteTemplate.items.length === 1 ? 'Item' : 'Items'}` : 'No Pricing'}
    </span>
  </div>

  {/* ── UPDATED BUTTONS ── */}
  <div className="grid grid-cols-2 gap-3">
    <button
      onClick={() => openTaskEditor(index)}
      className="py-3 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-gray-900 border border-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all"
    >
      <Plus className="w-3 h-3" /> Tasks
    </button>
    <button
      onClick={() => openQuoteEditor(cat.value)}
      className="py-3 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black uppercase tracking-widest bg-gray-900 border border-gray-800 text-gray-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
    >
      <Plus className="w-3 h-3" /> Pricing
    </button>
  </div>
</motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* SAVE FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-2xl px-4 py-4 flex gap-3 sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:shadow-none sm:px-0 sm:py-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 ${
            isDirty ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
        </button>
      </div>


      {/* ════════════════════════════════════════════
          TASK EDITOR MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {taskEditorCatIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={spring}
              className="bg-white w-full max-w-xl rounded-t-[2rem] sm:rounded-[2rem] h-[92vh] sm:h-auto overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Task checklist</p>
                  <h3 className="text-lg font-black text-gray-900">{categories[taskEditorCatIndex]?.label}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Auto-loads when a project uses this category.</p>
                </div>
                <button onClick={() => setTaskEditorCatIndex(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition mt-0.5">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {/* Add input */}
                <div className={`flex gap-2 p-2 rounded-2xl border-2 transition-all ${taskInputError ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-transparent focus-within:border-indigo-200'}`}>
                  <input
                    value={newTaskLabel}
                    onChange={e => { setNewTaskLabel(e.target.value); setTaskInputError(false); }}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder="Add a step, e.g. Check for leaks..."
                    className="flex-1 bg-transparent border-none font-medium text-gray-900 focus:ring-0 px-3 text-sm placeholder-gray-300 outline-none"
                  />
                  <button onClick={addTask} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition active:scale-90">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {taskInputError && <p className="text-xs font-bold text-red-500 flex items-center gap-1 ml-1"><AlertCircle className="w-3 h-3" /> Click + to add the step first.</p>}

                {/* Task list */}
                <AnimatePresence>
                  {editingTasks.length === 0 ? (
                    <div className="py-10 text-center text-gray-300 text-sm font-medium">No steps yet. Add your first one above.</div>
                  ) : (
                    editingTasks.map((task, i) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                        transition={{ ...spring, delay: i * 0.03 }}
                        className="group flex items-center gap-3 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl px-4 py-3 transition-all"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 shrink-0" />
                        <span className="text-gray-800 font-medium text-sm flex-1">{task.label}</span>
                        <button
                          onClick={() => setEditingTasks(editingTasks.filter(t => t.id !== task.id))}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-50 grid grid-cols-2 gap-3">
                <button onClick={() => setTaskEditorCatIndex(null)} className="py-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-500 text-sm transition">Cancel</button>
                <button onClick={saveTaskTemplates} className="py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-100 active:scale-95 transition">Apply checklist</button>
              </div>
              <div className="px-5 pb-4 text-center">
                <p className="text-[10px] font-bold text-amber-500 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Save changes on the main page to keep this.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ════════════════════════════════════════════
          QUOTE / PRICING EDITOR MODAL
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {quoteEditorCatValue !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={spring}
              className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-[2rem] h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Pricing template</p>
                  <h3 className="text-lg font-black text-gray-900">{activeQuoteEditorCat?.label}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {editingQuoteId && (
                    <button onClick={deleteQuoteTemplate} className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => setQuoteEditorCatValue(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-2">

                {/* Column headers — desktop */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_110px_70px_80px_32px] gap-2 px-1 mb-1">
                  {['Item', '$ Price', 'Qty', 'Total', ''].map((h, i) => (
                    <span key={i} className={`text-[10px] font-bold uppercase tracking-widest text-gray-400 ${i > 0 ? 'text-right' : ''}`}>{h}</span>
                  ))}
                </div>

                {/* Empty state */}
                {editingLineItems.length === 0 && (
                  <div className="py-10 text-center text-gray-300 text-sm font-medium">No items yet. Add your first line item below.</div>
                )}

                {/* Line items */}
                <AnimatePresence>
                  {editingLineItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ ...spring, delay: i * 0.03 }}
                    >
                      {/* Desktop */}
                      <div className="hidden sm:grid sm:grid-cols-[1fr_110px_70px_80px_32px] gap-2 items-center bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-xl px-3 py-2 transition-all group">
                        <input value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} className="bg-transparent border-none font-medium text-gray-900 focus:ring-0 text-sm w-full outline-none" placeholder="Description" />
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <span className="pl-2 text-gray-400 text-sm font-bold">$</span>
                          <input type="number" value={item.unitPrice} onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)} className={`flex-1 bg-transparent border-none text-right font-bold text-gray-900 text-sm pr-2 focus:ring-0 outline-none ${noSpinners}`} />
                        </div>
                        <input type="number" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', e.target.value)} className={`bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-900 text-sm py-1.5 focus:ring-0 outline-none ${noSpinners}`} />
                        <span className="text-right font-black text-emerald-600 text-sm">{fmt(item.amount)}</span>
                        <button onClick={() => setEditingLineItems(prev => prev.filter(i => i.id !== item.id))} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all flex justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mobile */}
                      <div className="sm:hidden bg-gray-50 rounded-xl p-3 space-y-2 group">
                        <div className="flex items-center justify-between gap-2">
                          <input value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} className="flex-1 bg-transparent border-none font-medium text-gray-900 focus:ring-0 text-sm outline-none" placeholder="Description" />
                          <button onClick={() => setEditingLineItems(prev => prev.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-400 shrink-0"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
                            <span className="pl-2 text-gray-400 text-sm font-bold">$</span>
                            <input type="number" value={item.unitPrice} onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)} className={`flex-1 bg-transparent border-none text-right font-bold text-gray-900 text-sm pr-2 py-2 focus:ring-0 outline-none ${noSpinners}`} placeholder="0.00" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400 font-bold">Qty</span>
                            <input type="number" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', e.target.value)} className={`w-12 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-900 text-sm py-2 focus:ring-0 outline-none ${noSpinners}`} />
                          </div>
                          <span className="font-black text-emerald-600 text-sm ml-auto">{fmt(item.amount)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add new line item */}
                <div className={`rounded-xl border-2 border-dashed transition-all ${lineItemError ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50/50 focus-within:border-indigo-200'}`}>
                  {/* Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_110px_70px_80px_32px] gap-2 items-center px-3 py-2">
                    <input value={newLineItem.description} onChange={e => { setNewLineItem({ ...newLineItem, description: e.target.value }); setLineItemError(''); }} onKeyDown={e => e.key === 'Enter' && addLineItem()} className="bg-transparent border-none font-medium text-gray-900 focus:ring-0 text-sm placeholder:text-gray-300 outline-none w-full" placeholder="Add item, e.g. Labor – 2 hrs..." />
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <span className="pl-2 text-gray-400 text-sm font-bold">$</span>
                      <input type="number" value={newLineItem.unitPrice} onChange={e => { setNewLineItem({ ...newLineItem, unitPrice: e.target.value }); setLineItemError(''); }} onKeyDown={e => e.key === 'Enter' && addLineItem()} placeholder="0.00" className={`flex-1 bg-transparent border-none text-right font-bold text-gray-900 text-sm pr-2 focus:ring-0 outline-none ${noSpinners}`} />
                    </div>
                    <input type="number" value={newLineItem.quantity} onChange={e => setNewLineItem({ ...newLineItem, quantity: e.target.value })} className={`bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-900 text-sm py-1.5 focus:ring-0 outline-none ${noSpinners}`} />
                    <span className="text-right font-black text-gray-300 text-sm">
                      {newLineItem.unitPrice && newLineItem.quantity ? fmt(parseFloat(newLineItem.unitPrice) * parseFloat(newLineItem.quantity)) : '—'}
                    </span>
                    <button onClick={addLineItem} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg w-7 h-7 flex items-center justify-center active:scale-90 transition">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile */}
                  <div className="sm:hidden p-3 space-y-2">
                    <input value={newLineItem.description} onChange={e => { setNewLineItem({ ...newLineItem, description: e.target.value }); setLineItemError(''); }} className="w-full bg-transparent border-none font-medium text-gray-900 focus:ring-0 text-sm placeholder:text-gray-300 outline-none" placeholder="Add item, e.g. Labor – 2 hrs..." />
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden flex-1">
                        <span className="pl-2 text-gray-400 text-sm font-bold">$</span>
                        <input type="number" value={newLineItem.unitPrice} onChange={e => { setNewLineItem({ ...newLineItem, unitPrice: e.target.value }); setLineItemError(''); }} placeholder="0.00" className={`flex-1 bg-transparent border-none text-right font-bold text-gray-900 text-sm pr-2 py-2 focus:ring-0 outline-none ${noSpinners}`} />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 font-bold">Qty</span>
                        <input type="number" value={newLineItem.quantity} onChange={e => setNewLineItem({ ...newLineItem, quantity: e.target.value })} className={`w-12 bg-white border border-gray-200 rounded-lg text-center font-bold text-gray-900 text-sm py-2 focus:ring-0 outline-none ${noSpinners}`} />
                      </div>
                      <button onClick={addLineItem} className="bg-emerald-600 text-white rounded-lg w-9 h-9 flex items-center justify-center active:scale-90 transition shrink-0">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {lineItemError && <p className="px-3 pb-2 text-xs font-bold text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {lineItemError}</p>}
                </div>

                {quoteError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {quoteError}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-50 bg-gray-50/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Template total</span>
                  <span className="text-2xl font-black text-emerald-600">{fmt(quoteEditorTotal)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setQuoteEditorCatValue(null)} className="py-3.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-gray-500 text-sm transition">Cancel</button>
                  <button onClick={saveQuoteTemplate} disabled={quoteSaving} className="py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm active:scale-95 transition disabled:opacity-50 shadow-lg shadow-emerald-100">
                    {quoteSaving ? 'Saving...' : 'Save template'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ════════════════════════════════════════════
          DELETE CONFIRM
      ════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 12 }}
              transition={spring}
              className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center"
            >
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5 mx-auto">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Remove category?</h3>
              <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                This will remove <span className="font-bold text-gray-900">"{deleteConfirm.label}"</span> from your list.
              </p>
              <p className="text-xs text-amber-600 font-bold mb-8">
                Task checklists for this category will also be removed. Pricing templates are stored separately and won't be deleted.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition">Keep it</button>
                <button onClick={confirmDeleteCategory} className="py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}