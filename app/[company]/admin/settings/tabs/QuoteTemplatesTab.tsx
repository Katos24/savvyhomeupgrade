'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, AlertCircle, FileText, DollarSign } from 'lucide-react';

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type CustomTemplate = {
  id: string;
  name: string;
  category: string;
  items: LineItem[];
  total: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export default function QuoteTemplatesTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [templateNotes, setTemplateNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: '1', unitPrice: '' });

  const categories = company.form_categories || [];

  useEffect(() => { loadTemplates(); }, []);

  async function loadTemplates() {
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`);
      const data = await res.json();
      if (data.success) setTemplates(data.templates || []);
    } catch { } finally { setLoading(false); }
  }

  function openEditor(template?: CustomTemplate) {
    if (template) {
      setEditingTemplate(template);
      setTemplateName(template.name);
      setTemplateCategory(template.category);
      setTemplateNotes(template.notes || '');
      setLineItems(template.items.map((item, i) => ({ ...item, id: `item_${Date.now()}_${i}` })));
      setShowEditor(true);
    }
  }

  function closeEditor() {
    setShowEditor(false); setShowCategorySelector(false);
    setEditingTemplate(null); setTemplateName(''); setTemplateCategory('');
    setTemplateNotes(''); setLineItems([]); setNewItem({ description: '', quantity: '1', unitPrice: '' });
    setError('');
  }

  function addLineItem() {
    if (!newItem.description || !newItem.unitPrice) { setError('Description and price are required'); setTimeout(() => setError(''), 3000); return; }
    const qty = parseFloat(newItem.quantity) || 1;
    const price = parseFloat(newItem.unitPrice);
    setLineItems([...lineItems, { id: `item_${Date.now()}`, description: newItem.description, quantity: qty, unitPrice: price, amount: qty * price }]);
    setNewItem({ description: '', quantity: '1', unitPrice: '' });
  }

  function updateLineItem(id: string, field: string, value: any) {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 };
      if (field === 'quantity' || field === 'unitPrice') updated.amount = (updated.quantity || 1) * (updated.unitPrice || 0);
      return updated;
    }));
  }

  async function saveTemplate() {
    if (!templateName.trim()) { setError('Template name is required'); return; }
    if (lineItems.length === 0) { setError('Add at least one line item'); return; }
    setSaving(true); setError('');
    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const templateData = { id: editingTemplate?.id || `custom_${Date.now()}`, name: templateName.trim(), category: templateCategory, items: lineItems, total, notes: templateNotes.trim(), created_at: editingTemplate?.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: editingTemplate ? 'update' : 'create', template: templateData }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(editingTemplate ? 'Template updated!' : 'Template created!');
        await loadTemplates(); closeEditor(); setTimeout(() => setSuccess(''), 3000);
      } else setError(result.error || 'Failed to save template');
    } catch { setError('Failed to save template'); }
    finally { setSaving(false); }
  }

  async function deleteTemplate(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', templateId: id }),
      });
      const result = await res.json();
      if (res.ok && result.success) { setSuccess('Template deleted!'); await loadTemplates(); setTimeout(() => setSuccess(''), 3000); }
      else setError('Failed to delete template');
    } catch { setError('Failed to delete template'); }
  }

  const filtered = selectedCategory === 'all' ? templates : templates.filter(t => t.category === selectedCategory);

  if (loading) return (
    <div className="py-16 text-center text-gray-400 text-sm">Loading templates...</div>
  );

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="border-b border-gray-100 pb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quote Templates</h2>
          <p className="text-sm text-gray-500 mt-1">Create reusable quote templates for faster estimates</p>
        </div>
        <button
          onClick={() => setShowCategorySelector(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Create Template
        </button>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <span>✓</span> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Filter card */}
      <div className="bg-white border border-gray-200 px-5 py-4 flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Filter</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-1 sm:flex-none sm:w-48 text-sm border border-gray-200 px-3 py-2 focus:border-indigo-400 focus:outline-none bg-white transition"
        >
          <option value="all">All Categories</option>
          {categories.map((cat: any) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} template{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Templates */}
      {filtered.length > 0 ? (
        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Templates</span>
          </div>
          <div className="p-4 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(template => {
              const cat = categories.find((c: any) => c.value === template.category);
              return (
                <div key={template.id} className="border border-gray-200 hover:border-indigo-200 hover:shadow-sm group transition overflow-hidden flex flex-col">
                  {/* Card header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{template.name}</p>
                      {cat && <p className="text-xs text-gray-400 mt-0.5">{cat.label}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => openEditor(template)}
                        className="p-1.5 hover:bg-indigo-50 text-indigo-400 transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteTemplate(template.id, template.name)}
                        className="p-1.5 hover:bg-red-50 text-red-400 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line items preview */}
                  <div className="px-4 py-3 flex-1 space-y-1.5">
                    {template.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-gray-500 truncate">{item.description}</span>
                        <span className="text-gray-700 font-semibold flex-shrink-0">{fmt(item.amount)}</span>
                      </div>
                    ))}
                    {template.items.length > 3 && (
                      <p className="text-xs text-gray-300">+{template.items.length - 3} more items</p>
                    )}
                  </div>

                  {/* Total footer */}
                  <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Total</span>
                    <span className="text-base font-bold text-emerald-600">{fmt(template.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 py-16 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-400 text-sm mb-1">No Templates Yet</p>
          <p className="text-xs text-gray-300 mb-4">
            {selectedCategory === 'all'
              ? 'Create your first quote template to speed up estimates'
              : `No templates for ${categories.find((c: any) => c.value === selectedCategory)?.label || 'this category'} yet`}
          </p>
          <button onClick={() => setShowCategorySelector(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition">
            <Plus className="w-4 h-4" /> Create Template
          </button>
        </div>
      )}

      {/* Category selector modal */}
      {showCategorySelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white border border-gray-200 w-full sm:max-w-lg shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-indigo-900 flex items-center justify-between" style={{ background: '#312e81' }}>
              <div>
                <p className="font-bold text-white">Select Category</p>
                <p className="text-xs text-indigo-300 mt-0.5">Which category is this template for?</p>
              </div>
              <button onClick={closeEditor} className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
              {categories.map((cat: any) => (
                <button
                  key={cat.value}
                  onClick={() => { setTemplateCategory(cat.value); setShowCategorySelector(false); setShowEditor(true); }}
                  className="flex items-center justify-center px-3 py-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition text-center"
                >
                  <span className="font-semibold text-gray-700 text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template editor modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 w-full sm:max-w-4xl sm:my-8 shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="px-5 py-4 border-b border-indigo-900 flex items-center justify-between flex-shrink-0" style={{ background: '#312e81' }}>
              <div>
                <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                  {editingTemplate ? 'Edit Template' : 'Create Template'}
                </p>
                <p className="text-white font-bold">
                  {categories.find((c: any) => c.value === templateCategory)?.label}
                </p>
              </div>
              <button onClick={closeEditor} className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5 flex-1 overflow-y-auto">

              {/* Name + Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Template Name *</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Standard AC Installation"
                    autoFocus
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Notes (Optional)</label>
                  <input
                    type="text"
                    value={templateNotes}
                    onChange={(e) => setTemplateNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Line items header */}
              <div className="border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</span>
                  {lineItems.length > 0 && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold">{lineItems.length}</span>}
                </div>

                {/* Existing items */}
                {lineItems.length > 0 && (
                  <div className="divide-y divide-gray-50">
                    {lineItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 group transition">
                        <span className="text-xs text-gray-300 w-5 text-center flex-shrink-0">{idx + 1}</span>
                        <input type="text" value={item.description} onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="flex-1 px-2 py-1.5 text-sm border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none bg-transparent transition" />
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                          className="w-16 px-2 py-1.5 text-sm text-center border border-gray-200 focus:border-indigo-400 focus:outline-none transition" />
                        <input type="number" step="0.01" min="0" value={item.unitPrice} onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                          className="w-24 px-2 py-1.5 text-sm text-right border border-gray-200 focus:border-indigo-400 focus:outline-none transition" />
                        <span className="w-24 text-right text-sm font-bold text-emerald-600 flex-shrink-0">{fmt(item.amount)}</span>
                        <button onClick={() => setLineItems(lineItems.filter(i => i.id !== item.id))}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 transition flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {/* Total row */}
                    <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-t border-emerald-100">
                      <span className="text-sm font-bold text-gray-600">Total</span>
                      <span className="text-lg font-bold text-emerald-600">{fmt(lineItems.reduce((s, i) => s + i.amount, 0))}</span>
                    </div>
                  </div>
                )}

                {/* Add new item row */}
                <div className="px-4 py-3 bg-indigo-50 border-t border-indigo-100 flex items-center gap-2">
                  <span className="text-xs text-indigo-300 w-5 text-center flex-shrink-0">+</span>
                  <input type="text" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && addLineItem()}
                    placeholder="Description"
                    className="flex-1 px-2 py-1.5 text-sm border border-indigo-200 focus:border-indigo-400 focus:outline-none bg-white transition" />
                  <input type="number" min="1" value={newItem.quantity} onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && addLineItem()}
                    className="w-16 px-2 py-1.5 text-sm text-center border border-indigo-200 focus:border-indigo-400 focus:outline-none bg-white transition" />
                  <input type="number" step="0.01" min="0" value={newItem.unitPrice} onChange={(e) => setNewItem({...newItem, unitPrice: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && addLineItem()}
                    placeholder="0.00"
                    className="w-24 px-2 py-1.5 text-sm text-right border border-indigo-200 focus:border-indigo-400 focus:outline-none bg-white transition" />
                  <span className="w-24 flex-shrink-0" />
                  <button onClick={addLineItem}
                    className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white transition flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={closeEditor}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">
                Cancel
              </button>
              <button onClick={saveTemplate} disabled={saving}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}