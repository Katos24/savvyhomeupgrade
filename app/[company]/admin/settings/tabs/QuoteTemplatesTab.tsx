'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertCircle, DollarSign, Layers } from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';


type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

type CustomTemplate = {
  id: string;
  category: string;
  items: LineItem[];
  total: number;
};

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// CSS to kill the up/down arrows (spinners) in all browsers
const noSpinners = "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export default function QuoteTemplatesTab({ company, currentUser }: { company: any; currentUser?: any }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [inputError, setInputError] = useState(false);

  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  
  const [templateCategory, setTemplateCategory] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: '1', unitPrice: '' });

  const defaultCategories =
  CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;

const categories =
  company.form_categories?.length > 0 ? company.form_categories : defaultCategories;


  useEffect(() => { loadTemplates(); }, []);

  async function loadTemplates() {
    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`);
      const data = await res.json();
      if (data.success) setTemplates(data.templates || []);
    } catch { } finally { setLoading(false); }
  }

  function openEditor(template?: CustomTemplate) {
    setInputError(false);
    if (template) {
      setEditingTemplate(template);
      setTemplateCategory(template.category);
      setLineItems(template.items.map((item, i) => ({ ...item, id: `item_${Date.now()}_${i}` })));
    } else {
        setLineItems([]);
    }
    setShowEditor(true);
  }

  function closeEditor() {
    setShowEditor(false); setShowCategorySelector(false);
    setEditingTemplate(null); setTemplateCategory('');
    setLineItems([]); setNewItem({ description: '', quantity: '1', unitPrice: '' });
    setError(''); setInputError(false);
  }

  function addLineItem() {
    if (!newItem.description || !newItem.unitPrice) { 
        setInputError(true);
        return; 
    }
    const qty = parseFloat(newItem.quantity) || 1;
    const price = parseFloat(newItem.unitPrice);
    setLineItems([...lineItems, { id: `item_${Date.now()}`, description: newItem.description, quantity: qty, unitPrice: price, amount: qty * price }]);
    setNewItem({ description: '', quantity: '1', unitPrice: '' });
    setInputError(false);
  }

  function updateLineItem(id: string, field: string, value: any) {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 };
      if (field === 'quantity' || field === 'unitPrice') updated.amount = (updated.quantity || 1) * (updated.unitPrice || 0);
      return updated;
    }));
  }

  async function deleteTemplate() {
    if (!editingTemplate) return;
    if (!confirm('Are you sure you want to delete this kit?')) return;
    
    try {
        const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', templateId: editingTemplate.id }),
        });
        if ((await res.json()).success) {
            setSuccess('Kit removed');
            await loadTemplates(); closeEditor();
        }
    } catch { setError('Failed to delete'); }
  }

  async function saveTemplate() {
    if (newItem.description.trim() || newItem.unitPrice) {
        setInputError(true);
        return;
    }

    if (lineItems.length === 0) { setError('Add at least one item'); return; }
    
    setSaving(true);
    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const templateData = { 
        id: editingTemplate?.id || `custom_${Date.now()}`, 
        category: templateCategory, 
        items: lineItems, 
        total
    };

    try {
      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: editingTemplate ? 'update' : 'create', template: templateData }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccess('Template saved');
        await loadTemplates(); closeEditor(); setTimeout(() => setSuccess(''), 3000);
      } else setError(result.error);
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 px-2">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Kits</h2>
            <p className="text-sm text-gray-400 font-medium">Standard pricing for your trades</p>
        </div>
        <button
          onClick={() => setShowCategorySelector(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Kit
        </button>
      </div>

      {success && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold animate-in fade-in">✓ {success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
            <div key={template.id} onClick={() => openEditor(template)} className="bg-white border border-gray-200 rounded-[2rem] p-6 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group">
                <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-black text-gray-900 text-xl leading-tight">
                    {categories.find((c: any) => c.value === template.category)?.label || template.category}
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{template.items.length} Items</p>
                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-300 uppercase">Total</span>
                    <span className="text-xl font-black text-emerald-600">{fmt(template.total)}</span>
                </div>
            </div>
        ))}
      </div>

      {showEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full max-w-4xl sm:rounded-[3rem] h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Configure Kit</h3>
                            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                                {categories.find((c: any) => c.value === templateCategory)?.label}
                            </p>
                        </div>
                        {editingTemplate && (
                            <button onClick={deleteTemplate} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <button onClick={closeEditor} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
                    <div className="space-y-4">
                        {/* EXISTING LIST */}
                        <div className="space-y-3">
                            {lineItems.map((item) => (
                                <div key={item.id} className="bg-gray-50 rounded-[2rem] p-4 flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex-1 w-full">
                                        <input 
                                            value={item.description} 
                                            onChange={e => updateLineItem(item.id, 'description', e.target.value)}
                                            className="w-full bg-transparent border-none font-bold text-gray-900 focus:ring-0 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                        <div className="flex flex-col items-end">
                                            <label className="text-[9px] font-black text-gray-400 uppercase mb-1">Price</label>
                                            <input 
                                                type="number" 
                                                value={item.unitPrice} 
                                                onChange={e => updateLineItem(item.id, 'unitPrice', e.target.value)}
                                                className={`w-24 bg-white border border-gray-200 rounded-xl text-right font-bold text-gray-900 p-2 text-sm ${noSpinners}`}
                                            />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <label className="text-[9px] font-black text-gray-400 uppercase mb-1">Qty</label>
                                            <input 
                                                type="number" 
                                                value={item.quantity} 
                                                onChange={e => updateLineItem(item.id, 'quantity', e.target.value)}
                                                className={`w-16 bg-white border border-gray-200 rounded-xl text-center font-bold text-gray-900 p-2 text-sm ${noSpinners}`}
                                            />
                                        </div>
                                        <div className="flex flex-col items-end min-w-[80px]">
                                            <label className="text-[9px] font-black text-gray-400 uppercase mb-1">Total</label>
                                            <span className="font-black text-indigo-600 text-sm">{fmt(item.amount)}</span>
                                        </div>
                                        <button onClick={() => setLineItems(lineItems.filter(i => i.id !== item.id))} className="p-2 text-red-200 hover:text-red-500 transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* NEW ITEM INPUTS */}
                        <div className="space-y-2">
                            <div className={`rounded-[2rem] p-4 flex flex-col sm:flex-row items-center gap-4 border-2 transition-all ${
                                inputError ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-indigo-50/50 border-indigo-100 border-dashed'
                            }`}>
                                <div className="flex-1 w-full">
                                    <input 
                                        value={newItem.description}
                                        onChange={e => { setNewItem({...newItem, description: e.target.value}); setInputError(false); }}
                                        className="w-full bg-transparent border-none font-bold text-indigo-900 placeholder:text-indigo-200 focus:ring-0"
                                        placeholder="Add work item..."
                                    />
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                                    <div className="flex flex-col items-end">
                                        <label className="text-[9px] font-black text-indigo-300 uppercase mb-1">Price</label>
                                        <input 
                                            type="number"
                                            value={newItem.unitPrice}
                                            onChange={e => { setNewItem({...newItem, unitPrice: e.target.value}); setInputError(false); }}
                                            className={`w-24 bg-white border border-indigo-100 rounded-xl text-right font-bold text-indigo-900 p-2 text-sm ${noSpinners}`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <label className="text-[9px] font-black text-indigo-300 uppercase mb-1">Qty</label>
                                        <input 
                                            type="number"
                                            value={newItem.quantity}
                                            onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                                            className={`w-16 bg-white border border-indigo-100 rounded-xl text-center font-bold text-indigo-900 p-2 text-sm ${noSpinners}`}
                                            placeholder="1"
                                        />
                                    </div>
                                    <button onClick={addLineItem} className="bg-indigo-600 text-white p-4 rounded-2xl shadow-md active:scale-90 transition-all">
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            {inputError && (
                                <p className="text-xs font-black text-red-600 uppercase tracking-widest ml-6 flex items-center gap-1 animate-bounce">
                                    <AlertCircle className="w-3 h-3" /> Click the + button first!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-3xl font-black text-emerald-600">
                        {fmt(lineItems.reduce((s, i) => s + i.amount, 0))}
                    </div>
                    <div className="flex w-full sm:w-auto gap-3">
                        <button onClick={closeEditor} className="flex-1 sm:flex-none px-8 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500">
                            Cancel
                        </button>
                        <button 
                            onClick={saveTemplate} 
                            disabled={saving}
                            className="flex-1 sm:flex-none px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl"
                        >
                            {saving ? 'Saving...' : 'Save Kit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Category Selection */}
      {showCategorySelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-lg sm:rounded-[2.5rem] rounded-t-[2.5rem] p-8 flex flex-col max-h-[90vh]">
            <h3 className="text-2xl font-black text-center mb-6">Which trade?</h3>
            <div className="overflow-y-auto space-y-2" style={{ flex: 1 }}>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat: any) => (
                  <button
                    key={cat.value}
                    onClick={() => { setTemplateCategory(cat.value); setShowCategorySelector(false); openEditor(); }}
                    className="py-4 bg-gray-50 hover:bg-indigo-600 hover:text-white rounded-2xl font-black transition-all text-sm"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowCategorySelector(false)} className="mt-6 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl text-xs uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}