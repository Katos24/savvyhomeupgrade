'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { getTemplatesByCategory } from '@/lib/quoteTemplates';
import SendCustomerEmailButtons from '../SendCustomerEmailButtons';

type QuoteSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function QuoteSection({ lead, currentUser, onRefresh, hasProject }: QuoteSectionProps) {
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState(lead?.quote_data || []);
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [newLineItem, setNewLineItem] = useState({ 
    description: '', 
    quantity: '1', 
    unitPrice: '' 
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const availableTemplates = getTemplatesByCategory(lead?.category || 'general');

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId || templateId === '') return;
    
    const template = availableTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const templateItems = template.items.map((item, index) => ({
      id: Date.now() + index,
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.amount / (item.quantity || 1),
      amount: item.amount
    }));
    
    setQuoteData(templateItems);
    setSelectedTemplate('');
    toast.success(`Template "${template.name}" loaded!`);
  };

 const handleAddQuoteItem = () => {
  if (!newLineItem.description || !newLineItem.unitPrice) {
    toast.error('Fill in description and price');
    return;
  }
  
  const qty = parseFloat(newLineItem.quantity) || 1;
  const price = parseFloat(newLineItem.unitPrice);
  
  setQuoteData([...quoteData, {
    id: Date.now(),
    description: newLineItem.description,
    quantity: qty,
    unitPrice: price,
    amount: qty * price
  }]);
  setNewLineItem({ description: '', quantity: '1', unitPrice: '' });
  toast.success('Line item added!');
};

  const handleUpdateLineItem = (id: number, field: string, value: string) => {
    setQuoteData(quoteData.map((item: any) => {
      if (item.id !== id) return item;
      
      const updated = { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 };
      
      if (field === 'quantity' || field === 'unitPrice') {
        updated.amount = (updated.quantity || 1) * (updated.unitPrice || 0);
      }
      
      return updated;
    }));
  };

  const handleRemoveQuoteItem = (itemId: number) => {
    setQuoteData(quoteData.filter((item: any) => item.id !== itemId));
  };

  const handleSaveQuote = async () => {
    if (!hasProject) {
      toast.error('Please convert to project first');
      return;
    }

    if (quoteData.length === 0) {
      toast.error('Add at least one line item');
      return;
    }

    const total = quoteData.reduce((sum: number, item: any) => sum + item.amount, 0);

    setSaving(true);
    try {
      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_quote',
          quote_data: quoteData,
          quote_total: total,
          user_name: currentUser?.name || 'Unknown User',
          user_email: currentUser?.email || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('Quote saved!');
        setShowQuoteBuilder(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to save quote');
      }
    } catch (error) {
      console.error('Save quote error:', error);
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const calculateQuoteTotal = () => {
    return quoteData.reduce((sum: number, item: any) => sum + item.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-4 space-y-3">
      {quoteData.length > 0 && !showQuoteBuilder ? (
        <div className="space-y-3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs uppercase">Description</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs uppercase w-16">Qty</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700 text-xs uppercase w-24">Unit Price</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700 text-xs uppercase w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {quoteData.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-200 last:border-0">
                    <td className="py-2 px-3 text-gray-900">{item.description}</td>
                    <td className="py-2 px-3 text-center text-gray-600">{item.quantity || 1}</td>
                    <td className="py-2 px-3 text-right text-gray-600">{formatCurrency(item.unitPrice || item.amount)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                <tr>
                  <td colSpan={3} className="py-3 px-3 text-right font-bold text-gray-900">TOTAL</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600 text-lg">{formatCurrency(calculateQuoteTotal())}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowQuoteBuilder(true)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 text-sm rounded-lg transition"
            >
              Edit Quote
            </button>
            
            <SendCustomerEmailButtons
              leadId={lead.id}
              type="quote"
              currentUser={currentUser}
              onRefresh={onRefresh}
              hasQuote={quoteData.length > 0}
              quoteSentAt={lead?.quote_sent_at}
              disabled={!hasProject}
            />
          </div>
        </div>
      ) : showQuoteBuilder ? (
        <div className="space-y-3">
          {availableTemplates.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
              <label className="block text-xs font-semibold text-gray-900 mb-1">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-blue-300 focus:border-emerald-500 focus:outline-none bg-white text-gray-900"
              >
                <option value="">Choose...</option>
                {availableTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {formatCurrency(template.total)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <h5 className="font-semibold text-gray-900 mb-2 text-sm">Line Items</h5>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs uppercase">Description</th>
                    <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs uppercase w-20">Qty</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700 text-xs uppercase w-28">Unit Price</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-700 text-xs uppercase w-28">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.map((item: any) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity || 1}
                          onChange={(e) => handleUpdateLineItem(item.id, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-center focus:border-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice || 0}
                          onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:border-emerald-500 focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleRemoveQuoteItem(item.id)}
                          className="text-red-600 hover:text-red-800 font-bold text-lg"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {/* New row input - inline in table */}
                  <tr className="bg-green-50 border-t-2 border-gray-300">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={newLineItem.description}
                        onChange={(e) => setNewLineItem({...newLineItem, description: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddQuoteItem()}
                        placeholder="Description"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={newLineItem.quantity}
                        onChange={(e) => setNewLineItem({...newLineItem, quantity: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddQuoteItem()}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-center focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newLineItem.unitPrice}
                        onChange={(e) => setNewLineItem({...newLineItem, unitPrice: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddQuoteItem()}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:border-emerald-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 text-sm">
                      {newLineItem.unitPrice ? formatCurrency(parseFloat(newLineItem.unitPrice) * parseFloat(newLineItem.quantity || '1')) : '$0.00'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={handleAddQuoteItem}
                        disabled={!newLineItem.description || !newLineItem.unitPrice}
                        className="text-green-600 hover:text-green-800 font-bold text-lg disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </td>
                  </tr>
                </tbody>
                {quoteData.length > 0 && (
                  <tfoot className="border-t-2 border-gray-300 bg-gray-50">
                    <tr>
                      <td colSpan={3} className="py-3 px-3 text-right font-bold text-gray-900">TOTAL</td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 text-lg">{formatCurrency(calculateQuoteTotal())}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowQuoteBuilder(false)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 text-sm rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveQuote}
              disabled={saving || quoteData.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-2 text-sm rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Quote'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-3 text-sm">No quote yet</p>
          <button
            onClick={() => setShowQuoteBuilder(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 text-sm rounded-lg transition"
          >
            Create Quote
          </button>
        </div>
      )}
    </div>
  );
}