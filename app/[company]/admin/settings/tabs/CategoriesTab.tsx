'use client';

import { useState, useEffect, useCallback } from 'react';
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CategoriesTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser?: any;
}) {
  // ── Category state ──
  const defaultCategories =
    CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;

  const [categories, setCategories] = useState<Category[]>(
    company.form_categories?.length > 0 ? company.form_categories : defaultCategories
  );
  const [useDefaults, setUseDefaults] = useState(!company.form_categories?.length);
  const [isDirty, setIsDirty] = useState(false);

  // ── Save state ──
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // ── Add category ──
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatError, setNewCatError] = useState('');

  // ── Delete confirm ──
  const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; label: string } | null>(null);

  // ── Task editor ──
  const [taskEditorCatIndex, setTaskEditorCatIndex] = useState<number | null>(null);
  const [editingTasks, setEditingTasks] = useState<TaskTemplate[]>([]);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [taskInputError, setTaskInputError] = useState(false);

  // ── Quote editor ──
  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quoteEditorCatValue, setQuoteEditorCatValue] = useState<string | null>(null);
  const [editingLineItems, setEditingLineItems] = useState<LineItem[]>([]);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [newLineItem, setNewLineItem] = useState({ description: '', quantity: '1', unitPrice: '' });
  const [lineItemError, setLineItemError] = useState('');
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  // ── Unsaved-changes banner ──
  const markDirty = useCallback(() => setIsDirty(true), []);

  // ─── LOAD QUOTE TEMPLATES ────────────────────────────────────────────────────

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

  // ─── CATEGORY ACTIONS ─────────────────────────────────────────────────────

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) {
      setNewCatError('Please enter a category name.');
      return;
    }
    const value = newCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories(prev => [...prev, { value, label: newCatLabel.trim(), task_templates: [] }]);
    setNewCatLabel('');
    setNewCatError('');
    setShowAddForm(false);
    setUseDefaults(false);
    markDirty();
  };

  const confirmDeleteCategory = () => {
    if (!deleteConfirm) return;
    setCategories(prev => prev.filter((_, i) => i !== deleteConfirm.index));
    setUseDefaults(false);
    setDeleteConfirm(null);
    markDirty();
  };

  const handleReset = () => {
    if (!confirm('Reset to default trade list? Any custom categories will be lost.')) return;
    setCategories(defaultCategories);
    setUseDefaults(true);
    markDirty();
  };

  // ─── SAVE CATEGORIES ──────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-categories',
          data: { form_categories: useDefaults ? null : categories },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setIsDirty(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError(data.error || 'Failed to save. Please try again.');
      }
    } catch {
      setSaveError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ─── TASK EDITOR ──────────────────────────────────────────────────────────

  const openTaskEditor = (index: number) => {
    setTaskEditorCatIndex(index);
    setEditingTasks(categories[index].task_templates || []);
    setNewTaskLabel('');
    setTaskInputError(false);
  };

  const addTask = () => {
    if (!newTaskLabel.trim()) { setTaskInputError(true); return; }
    setEditingTasks(prev => [
      ...prev,
      { id: `task_${Date.now()}`, label: newTaskLabel.trim(), order: prev.length + 1 },
    ]);
    setNewTaskLabel('');
    setTaskInputError(false);
  };

  const saveTaskTemplates = () => {
    if (newTaskLabel.trim()) { setTaskInputError(true); return; }
    if (taskEditorCatIndex === null) return;
    setCategories(prev => {
      const updated = [...prev];
      updated[taskEditorCatIndex] = { ...updated[taskEditorCatIndex], task_templates: editingTasks };
      return updated;
    });
    setUseDefaults(false);
    setTaskEditorCatIndex(null);
    markDirty();
  };

  // ─── QUOTE EDITOR ─────────────────────────────────────────────────────────

  const openQuoteEditor = (catValue: string) => {
    const existing = quoteTemplates.find(t => t.category === catValue);
    setQuoteEditorCatValue(catValue);
    setEditingLineItems(
      existing ? existing.items.map((item, i) => ({ ...item, id: `item_${Date.now()}_${i}` })) : []
    );
    setEditingQuoteId(existing?.id || null);
    setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
    setLineItemError('');
    setQuoteError('');
  };

  const addLineItem = () => {
    if (!newLineItem.description.trim()) {
      setLineItemError('Enter a description.');
      return;
    }
    if (!newLineItem.unitPrice || isNaN(parseFloat(newLineItem.unitPrice))) {
      setLineItemError('Enter a valid price.');
      return;
    }
    const qty = parseFloat(newLineItem.quantity) || 1;
    const price = parseFloat(newLineItem.unitPrice);
    setEditingLineItems(prev => [
      ...prev,
      { id: `item_${Date.now()}`, description: newLineItem.description.trim(), quantity: qty, unitPrice: price, amount: qty * price },
    ]);
    setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
    setLineItemError('');
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setEditingLineItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 };
        if (field === 'quantity' || field === 'unitPrice')
          updated.amount = (updated.quantity || 1) * (updated.unitPrice || 0);
        return updated;
      })
    );
  };

  const saveQuoteTemplate = async () => {
    if (newLineItem.description.trim() || newLineItem.unitPrice) {
      setLineItemError('Click + to add this item before saving.');
      return;
    }
    if (editingLineItems.length === 0) {
      setQuoteError('Add at least one line item to this template.');
      return;
    }
    setQuoteSaving(true);
    setQuoteError('');
    const total = editingLineItems.reduce((s, i) => s + i.amount, 0);
    const templateData: QuoteTemplate = {
      id: editingQuoteId || `custom_${Date.now()}`,
      category: quoteEditorCatValue!,
      items: editingLineItems,
      total,
    };
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: editingQuoteId ? 'update' : 'create', template: templateData }),
      });
      const result = await res.json();
      if (result.success) {
        // Refresh templates list
        const refreshed = await fetch(`/api/company/${company.slug}/quote-templates`);
        const refreshedData = await refreshed.json();
        if (refreshedData.success) setQuoteTemplates(refreshedData.templates || []);
        setQuoteEditorCatValue(null);
      } else {
        setQuoteError(result.error || 'Failed to save quote template.');
      }
    } catch {
      setQuoteError('Network error. Please try again.');
    } finally {
      setQuoteSaving(false);
    }
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
      if (result.success) {
        setQuoteTemplates(prev => prev.filter(t => t.id !== editingQuoteId));
        setQuoteEditorCatValue(null);
      }
    } catch {}
  };

  // ─── DERIVED ──────────────────────────────────────────────────────────────

  const activeQuoteEditorCat = categories.find(c => c.value === quoteEditorCatValue);
  const quoteEditorTotal = editingLineItems.reduce((s, i) => s + i.amount, 0);

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto pb-32 px-2 space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="pt-2">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Service Categories</h2>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-lg">
          When a new project is submitted, the system can automatically pre-load the right tasks and pricing — based on the category selected.
        </p>
      </div>

      {/* ── HOW IT WORKS BANNER ── */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-indigo-900">How this works</p>
          <p className="text-xs text-indigo-700 leading-relaxed">
            Each category can have a <span className="font-bold">Task Checklist</span> (steps your team should complete) and a <span className="font-bold">Pricing Template</span> (pre-filled line items for quotes). Both are optional — set up only what you need.
          </p>
        </div>
      </div>

      {/* ── UNSAVED CHANGES STICKY BANNER ── */}
      {isDirty && (
        <div className="sticky top-0 z-30 -mx-2">
          <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-bold">You have unsaved changes to your categories.</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-white text-amber-600 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl shrink-0 active:scale-95 transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Now'}
            </button>
          </div>
        </div>
      )}

      {/* ── STATUS MESSAGES ── */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-bold text-sm">
          Categories saved successfully.
        </div>
      )}
      {saveError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl font-bold text-sm flex gap-2 items-center">
          <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
        </div>
      )}

      {/* ── ADD CATEGORY ── */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-4">
        {showAddForm ? (
          <div className="space-y-3">
            <div>
              <input
                value={newCatLabel}
                onChange={e => { setNewCatLabel(e.target.value); setNewCatError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                className={`w-full bg-gray-50 border-2 rounded-2xl px-5 py-4 font-bold focus:outline-none text-gray-900 transition ${newCatError ? 'border-red-400 bg-red-50' : 'border-transparent focus:border-indigo-200'}`}
                placeholder="e.g. Plumbing, HVAC, Roofing..."
                autoFocus
              />
              {newCatError && (
                <p className="text-xs font-bold text-red-600 mt-1 ml-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {newCatError}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddCategory} className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-sm active:scale-95 transition">
                Add Category
              </button>
              <button onClick={() => { setShowAddForm(false); setNewCatLabel(''); setNewCatError(''); }} className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 flex items-center justify-center gap-2 text-indigo-500 font-black text-sm hover:bg-indigo-50/50 rounded-2xl transition-all"
          >
            <Plus className="w-5 h-5" /> Add New Category
          </button>
        )}
      </div>

      {/* ── CATEGORY GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat, index) => {
          const taskCount = cat.task_templates?.length || 0;
          const quoteTemplate = quoteTemplates.find(t => t.category === cat.value);
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-[2rem] p-5 hover:shadow-lg transition-all group">
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setDeleteConfirm({ index, label: cat.label })}
                  className="p-2 text-gray-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Category Name */}
              <h3 className="text-base font-black text-gray-900 leading-tight mb-3">{cat.label}</h3>

              {/* Status Pills */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${taskCount > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                  {taskCount > 0 ? `${taskCount} Tasks` : 'No Tasks'}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${quoteTemplate ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                  {quoteTemplate ? `${quoteTemplate.items.length} Pricing Items` : 'No Pricing'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => openTaskEditor(index)}
                  className="py-3 bg-gray-50 hover:bg-indigo-600 text-gray-500 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Tasks
                </button>
                <button
                  onClick={() => openQuoteEditor(cat.value)}
                  className="py-3 bg-gray-50 hover:bg-emerald-600 text-gray-500 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Pricing
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SAVE / RESET FOOTER ── */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-100 shadow-2xl px-4 py-4 flex gap-3 sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:px-0 sm:py-0 sm:flex">
     
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex-1 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 ${
            isDirty
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          <Save className="w-5 h-5" /> {saving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
        </button>
      </div>


      {/* ════════════════════════════════════════════
          TASK EDITOR MODAL
      ════════════════════════════════════════════ */}
      {taskEditorCatIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-xl sm:rounded-[3rem] h-[92vh] sm:h-auto overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-0.5">Task Checklist</p>
                <h3 className="text-lg font-black text-gray-900">{categories[taskEditorCatIndex].label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">These steps will auto-load when a new project uses this category.</p>
              </div>
              <button onClick={() => setTaskEditorCatIndex(null)} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Add input */}
              <div className={`flex gap-2 p-2 rounded-[2rem] border-2 transition-all ${taskInputError ? 'bg-red-50 border-red-400' : 'bg-indigo-50/50 border-dashed border-indigo-100'}`}>
                <input
                  value={newTaskLabel}
                  onChange={e => { setNewTaskLabel(e.target.value); setTaskInputError(false); }}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Add a step, e.g. Check for leaks..."
                  className="flex-1 bg-transparent border-none font-bold text-gray-900 focus:ring-0 px-4 text-sm"
                />
                <button onClick={addTask} className="bg-indigo-600 text-white p-3 rounded-2xl active:scale-90 transition">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {taskInputError && (
                <p className="text-xs font-black text-red-600 ml-4 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Click + to add the step first.
                </p>
              )}

              {/* Task list */}
              <div className="space-y-2">
                {editingTasks.length === 0 && (
                  <div className="py-8 text-center text-gray-300 text-sm font-bold">
                    No steps yet. Add your first one above.
                  </div>
                )}
                {editingTasks.map(task => (
                  <div key={task.id} className="bg-gray-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 border border-transparent hover:border-indigo-100 transition">
                    <span className="text-gray-900 font-bold text-sm flex-1">{task.label}</span>
                    <button onClick={() => setEditingTasks(editingTasks.filter(t => t.id !== task.id))} className="text-gray-300 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50/50 grid grid-cols-2 gap-3">
              <button onClick={() => setTaskEditorCatIndex(null)} className="py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 text-sm">
                Cancel
              </button>
              <button onClick={saveTaskTemplates} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 active:scale-95 transition">
                Apply Checklist
              </button>
            </div>

            {/* Reminder: still need to save categories */}
            <div className="px-5 pb-4 text-center">
              <p className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Remember to hit Save Changes on the main page to keep this.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════
          QUOTE / PRICING EDITOR MODAL
      ════════════════════════════════════════════ */}
      {quoteEditorCatValue !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl sm:rounded-[3rem] h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">

            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Pricing Template</p>
                <h3 className="text-lg font-black text-gray-900">{activeQuoteEditorCat?.label}</h3>
                <p className="text-xs text-gray-400 mt-0.5">These line items will pre-fill when you create a quote for this category.</p>
              </div>
              <div className="flex items-center gap-2">
                {editingQuoteId && (
                  <button onClick={deleteQuoteTemplate} className="p-2.5 text-gray-300 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setQuoteEditorCatValue(null)} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Existing line items */}
              <div className="space-y-2">
                {editingLineItems.length === 0 && (
                  <div className="py-6 text-center text-gray-300 text-sm font-bold">
                    No items yet. Add your first line item below.
                  </div>
                )}
                {editingLineItems.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-transparent hover:border-emerald-100 transition">
                    <input
                      value={item.description}
                      onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                      className="w-full bg-transparent border-none font-bold text-gray-900 focus:ring-0 text-sm p-0"
                      placeholder="Item description"
                    />
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Price</label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)}
                          className={`w-full bg-white border border-gray-200 rounded-xl text-right font-bold text-gray-900 p-2 text-sm ${noSpinners}`}
                        />
                      </div>
                      <div className="w-16">
                        <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => updateLineItem(item.id, 'quantity', e.target.value)}
                          className={`w-full bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-900 p-2 text-sm ${noSpinners}`}
                        />
                      </div>
                      <div className="text-right min-w-[72px]">
                        <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Total</label>
                        <span className="font-black text-emerald-600 text-sm">{fmt(item.amount)}</span>
                      </div>
                      <button onClick={() => setEditingLineItems(prev => prev.filter(i => i.id !== item.id))} className="text-gray-300 hover:text-red-500 transition mt-4">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new line item */}
              <div className={`rounded-[2rem] p-4 space-y-3 border-2 transition-all ${lineItemError ? 'bg-red-50 border-red-400' : 'bg-emerald-50/50 border-dashed border-emerald-100'}`}>
                <input
                  value={newLineItem.description}
                  onChange={e => { setNewLineItem({ ...newLineItem, description: e.target.value }); setLineItemError(''); }}
                  className="w-full bg-transparent border-none font-bold text-gray-900 focus:ring-0 text-sm placeholder:text-gray-300"
                  placeholder="Add line item, e.g. Labor – 2 hours..."
                />
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Price ($)</label>
                    <input
                      type="number"
                      value={newLineItem.unitPrice}
                      onChange={e => { setNewLineItem({ ...newLineItem, unitPrice: e.target.value }); setLineItemError(''); }}
                      placeholder="0.00"
                      className={`w-full bg-white border border-gray-200 rounded-xl text-right font-bold text-gray-900 p-2 text-sm ${noSpinners}`}
                    />
                  </div>
                  <div className="w-16">
                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Qty</label>
                    <input
                      type="number"
                      value={newLineItem.quantity}
                      onChange={e => setNewLineItem({ ...newLineItem, quantity: e.target.value })}
                      className={`w-full bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-900 p-2 text-sm ${noSpinners}`}
                    />
                  </div>
                  <button onClick={addLineItem} className="bg-emerald-600 text-white p-3 rounded-2xl active:scale-90 transition mt-4 shadow-md">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {lineItemError && (
                  <p className="text-xs font-black text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {lineItemError}
                  </p>
                )}
              </div>

              {quoteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-bold flex gap-2 items-center">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {quoteError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Template Total</span>
                <span className="text-2xl font-black text-emerald-600">{fmt(quoteEditorTotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setQuoteEditorCatValue(null)} className="py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500 text-sm">
                  Cancel
                </button>
                <button onClick={saveQuoteTemplate} disabled={quoteSaving} className="py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 active:scale-95 transition disabled:opacity-50">
                  {quoteSaving ? 'Saving...' : 'Save Pricing Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ════════════════════════════════════════════
          DELETE CATEGORY CONFIRM
      ════════════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mb-5 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Remove Category?</h3>
            <p className="text-sm text-gray-500 mb-2 leading-relaxed">
              This will remove <span className="font-bold text-gray-900">"{deleteConfirm.label}"</span> from your list.
            </p>
            <p className="text-xs text-amber-600 font-bold mb-8">
              Any task checklist for this category will also be removed. Pricing templates are stored separately and won't be deleted.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition">
                Keep it
              </button>
              <button onClick={confirmDeleteCategory} className="py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition">
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}