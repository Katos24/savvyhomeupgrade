'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Copy, Save, X, AlertCircle, FileText, DollarSign } from 'lucide-react';
import { getTemplatesByCategory, getAllTemplates, QuoteTemplate } from '@/lib/quoteTemplates';

type QuoteTemplatesTabProps = {
  company: any;
  currentUser: any;
};

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

export default function QuoteTemplatesTab({ company, currentUser }: QuoteTemplatesTabProps) {
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [templateNotes, setTemplateNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [newLineItem, setNewLineItem] = useState({
    description: '',
    quantity: '1',
    unitPrice: ''
  });

  const categories = company.form_categories || [];
  const hardcodedTemplates = selectedCategory === 'all' 
    ? getAllTemplates() 
    : getTemplatesByCategory(selectedCategory);

  useEffect(() => {
    loadCustomTemplates();
  }, []);

  async function loadCustomTemplates() {
    try {
      const response = await fetch(`/api/company/${company.slug}/quote-templates`);
      const data = await response.json();
      
      if (data.success) {
        setCustomTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }

  function openEditor(template?: CustomTemplate | QuoteTemplate, isHardcoded = false) {
    if (template) {
      const items = template.items.map((item, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.amount / (item.quantity || 1),
        amount: item.amount
      }));

      setEditingTemplate(isHardcoded ? null : (template as CustomTemplate));
      setTemplateName(isHardcoded ? `${template.name} (Copy)` : template.name);
      setTemplateCategory(template.category);
      setTemplateNotes(template.notes || '');
      setLineItems(items);
    } else {
      setEditingTemplate(null);
      setTemplateName('');
      setTemplateCategory(categories[0]?.value || '');
      setTemplateNotes('');
      setLineItems([]);
    }
    
    setShowEditor(true);
    setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
  }

  function closeEditor() {
    setShowEditor(false);
    setEditingTemplate(null);
    setTemplateName('');
    setTemplateCategory('');
    setTemplateNotes('');
    setLineItems([]);
    setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
    setError('');
  }

  function addLineItem() {
    if (!newLineItem.description || !newLineItem.unitPrice) {
      setError('Description and price are required');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const qty = parseFloat(newLineItem.quantity) || 1;
    const price = parseFloat(newLineItem.unitPrice);
    
    setLineItems([...lineItems, {
      id: `item_${Date.now()}`,
      description: newLineItem.description,
      quantity: qty,
      unitPrice: price,
      amount: qty * price
    }]);
    
    setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
  }

  function updateLineItem(id: string, field: string, value: any) {
    setLineItems(lineItems.map(item => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 };
      
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = (updated.quantity || 1) * (updated.unitPrice || 0);
      }
      
      return updated;
    }));
  }

  function removeLineItem(id: string) {
    setLineItems(lineItems.filter(item => item.id !== id));
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    if (!templateCategory) {
      setError('Category is required');
      return;
    }

    if (lineItems.length === 0) {
      setError('Add at least one line item');
      return;
    }

    setSaving(true);
    setError('');

    const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
    
    const templateData: CustomTemplate = {
      id: editingTemplate?.id || `custom_${Date.now()}`,
      name: templateName.trim(),
      category: templateCategory,
      items: lineItems,
      total,
      notes: templateNotes.trim(),
      created_at: editingTemplate?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const response = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingTemplate ? 'update' : 'create',
          template: templateData
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(editingTemplate ? 'Template updated!' : 'Template created!');
        await loadCustomTemplates();
        closeEditor();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Save template error:', error);
      setError('Failed to save template');
    } finally {
      setSaving(false);
    }
  }

  async function deleteTemplate(templateId: string, templateName: string) {
    if (!confirm(`Delete "${templateName}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          templateId
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Template deleted!');
        await loadCustomTemplates();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete template');
      }
    } catch (error) {
      console.error('Delete template error:', error);
      setError('Failed to delete template');
    }
  }

  const filteredCustomTemplates = selectedCategory === 'all'
    ? customTemplates
    : customTemplates.filter(t => t.category === selectedCategory);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Quote Templates</h2>
          <p className="text-sm sm:text-base text-slate-600">
            Create reusable quote templates for faster estimates
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <span className="text-lg flex-shrink-0">✓</span>
          <span className="flex-1">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Category Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-64 px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
        >
          <option value="all">All Categories</option>
          {categories.map((cat: any) => (
            <option key={cat.value} value={cat.value}>
              {cat.emoji} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Templates Section */}
      {filteredCustomTemplates.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Your Custom Templates ({filteredCustomTemplates.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomTemplates.map(template => (
              <div key={template.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{template.name}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {categories.find((c: any) => c.value === template.category)?.label || template.category}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => openEditor(template)}
                      className="p-1.5 hover:bg-blue-200 rounded-lg transition text-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id, template.name)}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1 mb-3">
                  {template.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex justify-between">
                      <span className="truncate flex-1">{item.description}</span>
                      <span className="font-semibold ml-2">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  {template.items.length > 3 && (
                    <p className="text-xs text-slate-500">+{template.items.length - 3} more...</p>
                  )}
                </div>
                
                <div className="pt-3 border-t border-blue-300 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Total</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(template.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hardcoded Templates (Default Library) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              📚 Template Library ({hardcodedTemplates.length})
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Pre-built templates you can copy and customize
            </p>
          </div>
        </div>
        
        {hardcodedTemplates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hardcodedTemplates.map(template => (
              <div key={template.id} className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{template.name}</h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {categories.find((c: any) => c.value === template.category)?.label || template.category}
                    </p>
                  </div>
                  <button
                    onClick={() => openEditor(template, true)}
                    className="p-1.5 hover:bg-slate-200 rounded-lg transition text-slate-600 flex-shrink-0 ml-2"
                    title="Copy & Customize"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-1 mb-3">
                  {template.items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-600 flex justify-between">
                      <span className="truncate flex-1">{item.description}</span>
                      <span className="font-semibold ml-2">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  {template.items.length > 3 && (
                    <p className="text-xs text-slate-500">+{template.items.length - 3} more...</p>
                  )}
                </div>
                
                <div className="pt-3 border-t border-slate-300 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Total</span>
                  <span className="text-lg font-bold text-slate-600">{formatCurrency(template.total)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-8">No templates available for this category</p>
        )}
      </div>

      {/* TEMPLATE EDITOR MODAL */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6" />
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h3>
              <button
                onClick={closeEditor}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Template Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Template Name *</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Standard Kitchen Remodel"
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                  <select
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat: any) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={templateNotes}
                  onChange={(e) => setTemplateNotes(e.target.value)}
                  placeholder="Any additional notes about this template..."
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Line Items */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Line Items
                </h4>

                {/* Existing Items */}
                {lineItems.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4 mb-4 space-y-2">
                    {lineItems.map(item => (
                      <div key={item.id} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Description"
                        />
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                          className="w-20 px-3 py-2 text-sm text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                          className="w-28 px-3 py-2 text-sm text-right border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                        <span className="w-28 text-right font-bold text-sm">{formatCurrency(item.amount)}</span>
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Item */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Add Line Item</p>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newLineItem.description}
                        onChange={(e) => setNewLineItem({...newLineItem, description: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addLineItem()}
                        placeholder="Description"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={newLineItem.quantity}
                        onChange={(e) => setNewLineItem({...newLineItem, quantity: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addLineItem()}
                        className="w-20 px-3 py-2 text-sm text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newLineItem.unitPrice}
                        onChange={(e) => setNewLineItem({...newLineItem, unitPrice: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addLineItem()}
                        placeholder="Price"
                        className="w-28 px-3 py-2 text-sm text-right border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={addLineItem}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Total */}
                {lineItems.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(lineItems.reduce((sum, item) => sum + item.amount, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 flex gap-3">
              <button
                onClick={closeEditor}
                className="flex-1 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
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