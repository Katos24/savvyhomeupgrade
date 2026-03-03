'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Plus, X, Trash2, FileText, DollarSign } from 'lucide-react';
import type { Category, LineItem, QuoteTemplate } from '../types';
import { fmt } from '../types';

export interface QuotesStepRef {
  getData: () => { templates: QuoteTemplate[] };
}

const QuotesStep = forwardRef<QuotesStepRef, { company: any; categories: Category[]; showErr: (msg: string) => void }>(
  ({ company, categories, showErr }, ref) => {
    const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
    const [showQuoteEditor, setShowQuoteEditor] = useState(false);
    const [showQuoteCatSelector, setShowQuoteCatSelector] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
    const [templateName, setTemplateName] = useState('');
    const [templateCategory, setTemplateCategory] = useState('');
    const [templateNotes, setTemplateNotes] = useState('');
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [newLineItem, setNewLineItem] = useState({ description: '', quantity: '1', unitPrice: '' });
    const [saving, setSaving] = useState(false);

    useImperativeHandle(ref, () => ({ getData: () => ({ templates: quoteTemplates }) }));

    useEffect(() => {
      fetch(`/api/company/${company.slug}/quote-templates`)
        .then(r => r.json())
        .then(data => { if (data.success) setQuoteTemplates(data.templates || []); })
        .catch(() => {});
    }, [company.slug]);

    const closeQuoteEditor = () => {
      setShowQuoteEditor(false); setShowQuoteCatSelector(false);
      setEditingTemplate(null); setTemplateName(''); setTemplateCategory('');
      setTemplateNotes(''); setLineItems([]); setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
    };

    const addLineItem = () => {
      if (!newLineItem.description || !newLineItem.unitPrice) return;
      const qty = parseFloat(newLineItem.quantity) || 1;
      const price = parseFloat(newLineItem.unitPrice);
      if (isNaN(price) || price <= 0) { showErr('Enter a valid price'); return; }
      setLineItems([...lineItems, {
        id: `li_${Date.now()}`, description: newLineItem.description,
        quantity: qty, unitPrice: price, amount: qty * price,
      }]);
      setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
    };

    const saveQuoteTemplate = async () => {
      if (!templateName.trim()) { showErr('Template name required'); return; }
      if (lineItems.length === 0) { showErr('Add at least one line item'); return; }
      setSaving(true);
      const total = lineItems.reduce((s, i) => s + i.amount, 0);
      const templateData = {
        id: editingTemplate?.id || `custom_${Date.now()}`,
        name: templateName.trim(),
        category: templateCategory,
        items: lineItems,
        total,
        notes: templateNotes.trim(),
        created_at: editingTemplate?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      try {
        const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: editingTemplate ? 'update' : 'create', template: templateData }),
        });
        const result = await res.json();
        if (result.success) {
          const refresh = await fetch(`/api/company/${company.slug}/quote-templates`);
          const data = await refresh.json();
          if (data.success) setQuoteTemplates(data.templates || []);
          closeQuoteEditor();
        } else showErr(result.error || 'Failed to save');
      } catch { showErr('Failed to save template'); }
      finally { setSaving(false); }
    };

    const deleteQuoteTemplate = async (id: string) => {
      try {
        await fetch(`/api/company/${company.slug}/quote-templates`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', templateId: id }),
        });
        setQuoteTemplates(quoteTemplates.filter(t => t.id !== id));
      } catch {}
    };

    const runningTotal = lineItems.reduce((s, i) => s + i.amount, 0);

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
         <div className="px-5 py-5 border-b border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quote Templates</span>
                    {quoteTemplates.length > 0 && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{quoteTemplates.length}</span>}
                  </div>
                  <button onClick={() => setShowQuoteCatSelector(true)} className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"><Plus className="w-3 h-3" /> Create Template</button>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Create reusable quote templates for each service category. When you send a quote for a roofing job, it auto-fills with your roofing prices — just adjust the amounts and send. No retyping every time.
                </p>
                <div className="flex items-start gap-3 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-base flex-shrink-0">💡</span>
                  <p className="text-xs text-amber-800">Each template is tied to a category. When a lead comes in for "Kitchen Remodel," your Kitchen Remodel template is ready to go.</p>
                </div>
            <button onClick={() => setShowQuoteCatSelector(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition">
              <Plus className="w-3 h-3" /> Create Template
            </button>
          </div>

          {quoteTemplates.length > 0 ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quoteTemplates.map(t => {
                const cat = categories.find(c => c.value === t.category);
                return (
                  <div key={t.id} className="border border-gray-200 hover:border-indigo-200 group transition overflow-hidden flex flex-col rounded-lg">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">{t.name}</p>
                        {cat && <p className="text-xs text-gray-400 mt-0.5">{cat.label}</p>}
                      </div>
                      <button onClick={() => deleteQuoteTemplate(t.id)}
                        className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="px-4 py-3 flex-1 space-y-1.5">
                      {t.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between gap-2 text-xs">
                          <span className="text-gray-500 truncate">{item.description}</span>
                          <span className="text-gray-700 font-semibold flex-shrink-0">{fmt(item.amount)}</span>
                        </div>
                      ))}
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
              <p className="text-xs text-gray-300 mt-1">Optional — create templates to auto-fill quotes for each category</p>
            </div>
          )}
        </div>

        {/* Category selector modal */}
        {showQuoteCatSelector && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-lg shadow-2xl overflow-hidden sm:rounded-xl">
              <div className="px-5 py-4 flex items-center justify-between" style={{ background: '#312e81' }}>
                <div>
                  <p className="font-bold text-white">Select Category</p>
                  <p className="text-xs text-indigo-300 mt-0.5">Which category is this template for?</p>
                </div>
                <button onClick={() => setShowQuoteCatSelector(false)}
                  className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button key={cat.value}
                    onClick={() => { setTemplateCategory(cat.value); setShowQuoteCatSelector(false); setShowQuoteEditor(true); }}
                    className="px-3 py-3 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition text-center rounded-lg">
                    <span className="font-semibold text-gray-700 text-sm">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quote editor modal */}
        {showQuoteEditor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-3xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col sm:rounded-xl">
              <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ background: '#312e81' }}>
                <div>
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                    {editingTemplate ? 'Edit' : 'New'} Quote Template
                  </p>
                  <p className="text-white font-bold">{categories.find(c => c.value === templateCategory)?.label}</p>
                </div>
                <button onClick={closeQuoteEditor}
                  className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Template Name *</label>
                    <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Standard Roof Repair" autoFocus
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Notes</label>
                    <input type="text" value={templateNotes} onChange={(e) => setTemplateNotes(e.target.value)}
                      placeholder="Optional notes..."
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" />
                  </div>
                </div>

                {/* Line items table */}
                <div className="border border-gray-100 overflow-hidden rounded-lg">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</span>
                    {lineItems.length > 0 && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-bold rounded">{lineItems.length}</span>
                    )}
                  </div>

                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Unit Price</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Existing items */}
                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-50 items-center group hover:bg-gray-50 transition">
                      <div className="col-span-5 text-sm text-gray-800 truncate">{item.description}</div>
                      <div className="col-span-2 text-sm text-gray-600 text-center">{item.quantity}</div>
                      <div className="col-span-2 text-sm text-gray-600 text-right">{fmt(item.unitPrice)}</div>
                      <div className="col-span-2 text-sm font-semibold text-gray-800 text-right">{fmt(item.amount)}</div>
                      <div className="col-span-1 flex justify-end">
                        <button onClick={() => setLineItems(lineItems.filter(li => li.id !== item.id))}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 rounded transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add new item row */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-100 items-center bg-white">
                    <div className="col-span-5">
                      <input type="text" value={newLineItem.description}
                        onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') addLineItem(); }}
                        placeholder="Item description"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-indigo-400 focus:outline-none transition" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={newLineItem.quantity} min="1"
                        onChange={(e) => setNewLineItem({ ...newLineItem, quantity: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded text-center focus:border-indigo-400 focus:outline-none transition" />
                    </div>
                    <div className="col-span-2">
                      <input type="number" value={newLineItem.unitPrice} min="0" step="0.01"
                        onChange={(e) => setNewLineItem({ ...newLineItem, unitPrice: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') addLineItem(); }}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded text-right focus:border-indigo-400 focus:outline-none transition" />
                    </div>
                    <div className="col-span-2 text-sm text-gray-400 text-right">
                      {newLineItem.unitPrice ? fmt((parseFloat(newLineItem.quantity) || 1) * (parseFloat(newLineItem.unitPrice) || 0)) : '—'}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={addLineItem}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Total row */}
                  {lineItems.length > 0 && (
                    <div className="px-4 py-3 flex justify-between items-center" style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total</span>
                      <span className="text-lg font-bold text-emerald-600">{fmt(runningTotal)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
                <button onClick={closeQuoteEditor}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg transition">
                  Cancel
                </button>
                <button onClick={saveQuoteTemplate} disabled={saving}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

QuotesStep.displayName = 'QuotesStep';
export default QuotesStep;