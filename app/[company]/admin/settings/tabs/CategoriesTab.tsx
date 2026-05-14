'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, CheckSquare, Trash2, Calculator, Save, AlertTriangle, Layers, DollarSign, AlertCircle, Info } from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';


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

  return (
    <div className="max-w-4xl mx-auto pb-32 px-3 space-y-5">

      {/* ── HEADER WITH TOP SAVE ─────────────────────────────────────────── */}

       {(company.plan_tier === 'free') && (
       <SettingsUpgradeBanner
         planLabel="Basic"
         price="$49.99/mo"
         message="configure your categories now, then upgrade to auto-load tasks and pricing on new projects."
         companySlug={company.slug}
       />
     )}
   
<div className="pt-2">
  <div className="flex items-start justify-between gap-4 mb-4">
    <div>
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Service Categories</h2>
      <p className="text-sm text-gray-400 mt-1">Auto-load tasks and pricing when a project category is selected.</p>
    </div>
  </div>
  <div className="flex items-center gap-3">
    <AnimatePresence mode="wait">
      {showAddForm ? (
        <motion.div key="form" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring} className="flex-1 flex gap-2">
          <input
            autoFocus
            value={newCatLabel}
            onChange={e => { setNewCatLabel(e.target.value); setNewCatError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="e.g. Plumbing, HVAC, Roofing..."
            className={`flex-1 border-2 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none transition ${newCatError ? 'border-red-400 bg-red-50' : 'border-emerald-200 focus:border-emerald-400'}`}
          />
          <button onClick={handleAddCategory} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm transition active:scale-95">Add</button>
          <button onClick={() => { setShowAddForm(false); setNewCatLabel(''); setNewCatError(''); }} className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-50 transition">Cancel</button>
        </motion.div>
      ) : (
        <motion.button key="trigger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition active:scale-95 shadow-md shadow-emerald-100"
        >
          <Plus className="w-4 h-4" /> Add Category
        </motion.button>
      )}
    </AnimatePresence>

    <button
      onClick={handleSave}
      disabled={saving || !isDirty}
      className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition active:scale-95 ${
        isDirty
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 animate-pulse'
          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
      }`}
    >
      <Save className="w-4 h-4" />
      {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
    </button>
  </div>
  {newCatError && <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-2"><AlertCircle className="w-3 h-3" />{newCatError}</p>}
</div>

      {/* Info banner */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-indigo-500" />
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Add categories to match your trades. Attach{' '}
          <span className="font-bold text-indigo-600">Task Checklists</span> or{' '}
          <span className="font-bold text-emerald-600">Pricing Templates</span>{' '}
          to auto-populate new projects when a category is selected.
        </p>
      </div>

      {/* Status */}
      {saveSuccess && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-sm">Saved successfully.</div>}
      {saveError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex gap-2 items-center"><AlertCircle className="w-4 h-4 shrink-0" />{saveError}</div>}

 

  {/* ── CATEGORY GRID ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-24"> {/* Added pb-24 to prevent grid from hiding behind the Save bar */}
        {categories.map((cat, index) => {
          const taskCount = cat.task_templates?.length || 0;
          const quoteTemplate = quoteTemplates.find(t => t.category === cat.value);
          return (
            <motion.div
              key={cat.value}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-[#0F172A] border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>
                <button 
                  onClick={() => setDeleteConfirm({ index, label: cat.label })} 
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-black text-white mb-3">{cat.label}</h3>
              <div className="flex gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${taskCount > 0 ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-gray-800/50 border-gray-700 text-gray-600'}`}>
                  <CheckSquare className="w-3 h-3" />
                  {taskCount > 0 ? `${taskCount} Task${taskCount !== 1 ? 's' : ''}` : 'No Tasks'}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${quoteTemplate ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-800/50 border-gray-700 text-gray-600'}`}>
                  <DollarSign className="w-3 h-3" />
                  {quoteTemplate ? `${quoteTemplate.items.length} Item${quoteTemplate.items.length !== 1 ? 's' : ''}` : 'No Pricing'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => openTaskEditor(index)} className="py-2.5 flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-gray-800 border border-gray-700 text-gray-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                  <Plus className="w-3 h-3" /> Tasks
                </button>
                <button onClick={() => openQuoteEditor(cat.value)} className="py-2.5 flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest bg-gray-800 border border-gray-700 text-gray-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all">
                  <Plus className="w-3 h-3" /> Pricing
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── SMART MOBILE SAVE BAR ────────────────────────────────────────── */}
      <AnimatePresence>
        {isDirty && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-4 pt-4 pb-safe sm:pb-6"
          >
            <div className="max-w-4xl mx-auto flex flex-col gap-3">
              {/* Optional "Unsaved Changes" text for clarity */}
              <div className="flex items-center justify-center gap-2 text-amber-600">
                 <AlertCircle className="w-3 h-3 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-tighter">You have unsaved changes</span>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-blue-200"
              >
                {saving ? (
                   <div className="flex items-center gap-2">
                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     <span>Syncing...</span>
                   </div>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save All Categories
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SUCCESS TOAST (Floats above everything) ─────────────────────── */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[120] bg-emerald-600 text-white px-6 py-3 rounded-full font-black text-sm shadow-2xl flex items-center gap-2 whitespace-nowrap"
          >
            <CheckSquare className="w-4 h-4" /> Changes Saved Successfully
          </motion.div>
        )}
      </AnimatePresence>

 {/* ── TASK EDITOR MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {taskEditorCatIndex !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={spring} className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="flex justify-center pt-3 sm:hidden"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>
              
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900">{categories[taskEditorCatIndex]?.label} Tasks</h3>
                <button onClick={() => { setTaskEditorCatIndex(null); setTaskInputError(false); }} className="p-2 bg-gray-100 rounded-xl"><X className="w-4 h-4" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className={`p-1 rounded-2xl border-2 transition-all duration-200 ${taskInputError ? 'bg-red-50 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-gray-50 border-transparent focus-within:border-indigo-500'}`}>
                  <div className="flex gap-2">
                    <input 
                      value={newTaskLabel} 
                      onChange={e => { setNewTaskLabel(e.target.value); setTaskInputError(false); }} 
                      onKeyDown={e => e.key === 'Enter' && addTask()} 
                      placeholder="Type a task step..." 
                      className="flex-1 bg-transparent border-none font-bold text-gray-900 focus:ring-0 px-3 text-sm outline-none" 
                    />
                    <button onClick={addTask} className="bg-indigo-600 text-white p-3 rounded-xl active:scale-90 transition"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>

                {taskInputError && (
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-black text-red-600 flex items-center gap-1 px-1">
                    <AlertCircle className="w-3 h-3" /> Click the + button to add your task before saving!
                  </motion.p>
                )}

                <div className="space-y-2">
                  {editingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                      <div className="w-5 h-5 rounded-md border-2 border-indigo-200 shrink-0" />
                      <span className="text-gray-800 font-bold text-sm flex-1">{task.label}</span>
                      <button onClick={() => setEditingTasks(editingTasks.filter(t => t.id !== task.id))} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 border-t border-gray-100 grid grid-cols-2 gap-3">
                <button onClick={() => setTaskEditorCatIndex(null)} className="py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Cancel</button>
                <button 
                 onClick={saveTaskTemplates}
                  className="py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100"
                >
                  Save Checklist
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

{/* ── QUOTE EDITOR — RESPONSIVE SPREADSHEET/CARD ────────────────────────────── */}
<AnimatePresence>
  {quoteEditorOpen && (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={spring}
        className="bg-[#0F172A] w-full max-w-3xl rounded-t-3xl sm:rounded-3xl h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-white/10"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-[#1E293B] shrink-0">
          <div>
            <h3 className="text-lg font-black text-white">Pricing Template</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{activeQuoteEditorCat?.label}</p>
          </div>
          <button onClick={() => setQuoteEditorOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* TABLE HEADERS (Desktop Only) */}
        <div className="hidden sm:grid grid-cols-[1fr_120px_80px_100px_40px] gap-0 px-6 py-3 bg-[#020617] border-b border-white/10">
          {['Item Description', 'Unit Price', 'Qty', 'Total', ''].map((h, i) => (
            <span key={i} className={`text-[10px] font-black uppercase tracking-widest text-gray-400 ${i > 0 && i < 4 ? 'text-right' : ''}`}>{h}</span>
          ))}
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05] pb-24 sm:pb-0">
          {editingLineItems.map((item) => (
            <div key={item.id} className="relative flex flex-col sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] gap-3 sm:gap-0 p-5 sm:p-0 sm:items-center hover:bg-white/[0.02]">
              
              {/* Description */}
              <div className="sm:px-6">
                <span className="sm:hidden text-[10px] font-black text-indigo-400 uppercase block mb-1">Description</span>
                <input 
                  value={item.description} 
                  onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                  className="w-full bg-white/5 sm:bg-transparent border border-white/10 sm:border-none rounded-lg px-3 py-2 sm:py-4 text-white font-bold text-sm focus:ring-1 focus:ring-indigo-500 outline-none" 
                />
              </div>

              {/* Mobile Triple Row (Price, Qty, Total) */}
              <div className="grid grid-cols-3 sm:contents gap-2">
                <div className="flex flex-col sm:border-l border-white/5 sm:px-4">
                  <span className="sm:hidden text-[10px] font-black text-indigo-400 uppercase block mb-1 text-center">Price</span>
                  <div className="flex items-center sm:justify-end bg-white/5 sm:bg-transparent border border-white/10 sm:border-none rounded-lg px-2">
                    <span className="text-gray-500 text-xs">$</span>
                    <input 
                      type="number" 
                      value={item.unitPrice || ''} 
                      onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)}
                      className={`w-full bg-transparent border-none text-white sm:text-right font-black text-sm py-2 focus:ring-0 ${noSpinners}`} 
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:border-l border-white/5 sm:px-4">
                  <span className="sm:hidden text-[10px] font-black text-indigo-400 uppercase block mb-1 text-center">Qty</span>
                  <input 
                    type="number" 
                    value={item.quantity || ''} 
                    onChange={e => updateLineItem(item.id, 'quantity', e.target.value)}
                    className={`w-full bg-white/5 sm:bg-transparent border border-white/10 sm:border-none rounded-lg text-white text-center sm:text-right font-bold text-sm py-2 focus:ring-0 ${noSpinners}`} 
                  />
                </div>

                <div className="flex flex-col sm:border-l border-white/5 sm:px-4">
                  <span className="sm:hidden text-[10px] font-black text-indigo-400 uppercase block mb-1 text-center">Total</span>
                  <div className="text-emerald-400 font-black text-sm text-center sm:text-right sm:py-4 h-full flex items-center justify-center sm:justify-end">
                    {fmt(item.amount)}
                  </div>
                </div>
              </div>

              {/* Delete (Floating on mobile) */}
              <div className="absolute top-4 right-4 sm:static flex justify-end sm:justify-center">
                <button onClick={() => setEditingLineItems(prev => prev.filter(x => x.id !== item.id))} className="p-2 text-gray-500 hover:text-red-400 bg-white/5 sm:bg-transparent rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* ADD NEW ITEM SECTION */}
          <div className={`p-5 sm:p-0 border-t border-dashed border-white/10 sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center ${lineItemError ? 'bg-red-500/5' : 'bg-emerald-500/5'}`}>
            <div className="sm:px-6 mb-3 sm:mb-0">
              <input 
                value={newDesc} 
                onChange={e => {setNewDesc(e.target.value); setLineItemError('');}} 
                onKeyDown={e => e.key === 'Enter' && addLineItem()}
                placeholder="Item name (e.g. Labor)" 
                className="w-full bg-white/10 sm:bg-transparent border border-white/10 sm:border-none rounded-xl px-4 py-3 sm:py-4 text-white font-black text-sm focus:ring-1 focus:ring-emerald-500 placeholder:text-gray-600 outline-none" 
              />
            </div>
            
            <div className="grid grid-cols-[1fr_80px_60px] sm:contents gap-2">
              <div className="sm:border-l border-white/10 sm:px-4 flex items-center bg-white/10 sm:bg-transparent border border-white/10 sm:border-none rounded-xl px-3">
                <span className="text-emerald-500 mr-1 text-xs">$</span>
                <input 
                  type="number" 
                  value={newPrice} 
                  onChange={e => {setNewPrice(e.target.value); setLineItemError('');}} 
                  placeholder="0.00"
                  className={`w-full bg-transparent border-none text-white sm:text-right font-black text-sm py-3 focus:ring-0 ${noSpinners}`} 
                />
              </div>
              <div className="sm:border-l border-white/10 sm:px-4">
                <input 
                  type="number" 
                  value={newQty} 
                  onChange={e => setNewQty(e.target.value)} 
                  className={`w-full bg-white/10 sm:bg-transparent border border-white/10 sm:border-none rounded-xl text-white text-center sm:text-right font-bold text-sm py-3 focus:ring-0 ${noSpinners}`} 
                />
              </div>
              <div className="flex items-center justify-center sm:border-l border-white/10">
                <button onClick={addLineItem} className="bg-emerald-600 text-white w-full h-full sm:w-10 sm:h-10 rounded-xl flex items-center justify-center active:scale-90 transition shadow-lg shadow-emerald-900/20">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER - Sticky */}
        <div className="p-6 bg-[#020617] border-t border-white/10 shrink-0">
          {lineItemError && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-black rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {lineItemError}
            </motion.div>
          )}
          
          <div className="flex justify-between items-center mb-6 px-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Estimate</span>
            <span className="text-2xl font-black text-emerald-400">{fmt(quoteEditorTotal)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setQuoteEditorOpen(false)} className="py-4 bg-white/5 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
            <button 
              onClick={saveQuoteTemplate}
              className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-900/40 active:scale-95 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

      {/* ── DELETE CONFIRM ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.94, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 12 }} transition={spring} className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-5 mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Remove category?</h3>
              <p className="text-sm text-gray-500 mb-2">This will remove <span className="font-bold text-gray-900">"{deleteConfirm.label}"</span>.</p>
              <p className="text-xs text-amber-600 font-bold mb-8">Task checklists will also be removed. Pricing templates are stored separately.</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition">Keep it</button>
                <button onClick={confirmDeleteCategory} className="py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl active:scale-95 transition">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}