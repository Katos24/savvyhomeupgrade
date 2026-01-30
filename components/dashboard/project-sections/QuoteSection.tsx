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
  const [newLineItem, setNewLineItem] = useState({ description: '', amount: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const availableTemplates = getTemplatesByCategory(lead?.category || 'general');

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId || templateId === '') return;
    
    const template = availableTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const templateItems = template.items.map((item, index) => ({
      id: Date.now() + index,
      description: item.description,
      amount: item.amount
    }));
    
    setQuoteData(templateItems);
    setSelectedTemplate('');
    toast.success(`Template "${template.name}" loaded!`);
  };

  const handleAddQuoteItem = () => {
    if (!newLineItem.description || !newLineItem.amount) {
      toast.error('Please fill in description and amount');
      return;
    }
    
    setQuoteData([...quoteData, {
      id: Date.now(),
      description: newLineItem.description,
      amount: parseFloat(newLineItem.amount)
    }]);
    setNewLineItem({ description: '', amount: '' });
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
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            {quoteData.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0 gap-2">
                <span className="text-gray-700 text-sm">{item.description}</span>
                <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">{formatCurrency(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
              <span className="text-base font-bold text-gray-900">TOTAL</span>
              <span className="text-lg font-bold text-emerald-600">
                {formatCurrency(calculateQuoteTotal())}
              </span>
            </div>
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
            
            {quoteData.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center py-1.5 mb-2 bg-white rounded px-2 gap-2">
                <span className="text-gray-700 text-sm flex-1">{item.description}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-semibold text-gray-900 text-sm">{formatCurrency(item.amount)}</span>
                  <button
                    onClick={() => handleRemoveQuoteItem(item.id)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-[1fr_auto] gap-2 mt-2">
              <input
                type="text"
                value={newLineItem.description}
                onChange={(e) => setNewLineItem({...newLineItem, description: e.target.value})}
                placeholder="Description"
                className="px-3 py-2 text-sm rounded border border-gray-300 focus:border-emerald-500 focus:outline-none"
              />
              <input
                type="number"
                step="0.01"
                value={newLineItem.amount}
                onChange={(e) => setNewLineItem({...newLineItem, amount: e.target.value})}
                placeholder="Amount"
                className="w-24 px-3 py-2 text-sm rounded border border-gray-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddQuoteItem}
              className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 text-sm rounded transition"
            >
              Add Line Item
            </button>

            {quoteData.length > 0 && (
              <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-300">
                <span className="text-base font-bold text-gray-900">TOTAL</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatCurrency(calculateQuoteTotal())}
                </span>
              </div>
            )}
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
              {saving ? 'Saving...' : 'Save'}
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