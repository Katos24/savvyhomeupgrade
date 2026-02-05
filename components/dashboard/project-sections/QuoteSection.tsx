'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Edit2,
  DollarSign,
  Package,
  MoreVertical,
  Mail
} from 'lucide-react';
import { getTemplatesByCategory } from '@/lib/quoteTemplates';
import { parseNotes } from '@/lib/utils';
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
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [newLineItem, setNewLineItem] = useState({ 
    description: '', 
    quantity: '1', 
    unitPrice: '' 
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const availableTemplates = getTemplatesByCategory(lead?.category || 'general');

  // Parse activity log and find quote emails
  const notesArray = parseNotes(lead.notes);
  const quoteEmails = notesArray.filter((note: any) => {
    if (typeof note === 'string') return false;
    return (note.type === 'email_sent' || note.type === 'quote_sent') && 
           (note.text?.toLowerCase().includes('quote') || note.email_type === 'quote');
  });

  const lastEmailSent = quoteEmails.length > 0 ? {
    timestamp: quoteEmails[quoteEmails.length - 1].timestamp,
    userName: quoteEmails[quoteEmails.length - 1].user_name || 'Unknown',
    quoteTotal: quoteEmails[quoteEmails.length - 1].quote_total,
    count: quoteEmails.length
  } : null;

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
    <div className="p-4 space-y-4">
      {quoteData.length > 0 && !showQuoteBuilder ? (
        <div className="space-y-4">
          {/* Quote Display - Mobile Optimized */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5" />
                        Description
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide w-20">
                      <div className="flex items-center justify-center gap-2">
                        <Package className="w-3.5 h-3.5" />
                        Qty
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide w-28">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="w-3.5 h-3.5" />
                        Unit Price
                      </div>
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide w-32">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.map((item: any, idx: number) => (
                    <tr key={item.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="py-3 px-4 text-gray-900">{item.description}</td>
                      <td className="py-3 px-4 text-center text-gray-600 font-medium">{item.quantity || 1}</td>
                      <td className="py-3 px-4 text-right text-gray-600">{formatCurrency(item.unitPrice || item.amount)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-300 bg-gradient-to-r from-emerald-50 to-green-50">
                  <tr>
                    <td colSpan={3} className="py-4 px-4 text-right font-bold text-gray-900 uppercase tracking-wide">Total</td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-600 text-xl">{formatCurrency(calculateQuoteTotal())}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-4">
              {quoteData.map((item: any, idx: number) => (
                <div key={item.id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
                  <div className="mb-3">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Package className="w-3 h-3 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Qty</p>
                      <p className="text-lg font-bold text-gray-900">{item.quantity || 1}</p>
                    </div>
                    
                    <div className="text-center bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <DollarSign className="w-3 h-3 text-gray-500" />
                      </div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unit</p>
                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.unitPrice || item.amount)}</p>
                    </div>
                    
                    <div className="text-center bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <p className="text-xs text-emerald-700 uppercase tracking-wide mb-1 font-semibold">Total</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(item.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Mobile Total */}
              <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-4 border-2 border-emerald-300 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 uppercase tracking-wide">Grand Total</span>
                  <span className="text-2xl font-bold text-emerald-600">{formatCurrency(calculateQuoteTotal())}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuoteBuilder(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 text-sm rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit Quote
              </button>

              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="px-3 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition shadow-sm"
                  aria-label="More actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMoreActions && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowMoreActions(false)}
                    />
                    
                    <div 
                      className="absolute right-0 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 w-64"
                      style={{ bottom: '100%', marginBottom: '8px' }}
                    >
                      <div className="p-2">
                        <div onClick={() => {
                          setEmailSent(true);
                          setShowMoreActions(false);
                        }}>
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
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Email Sent Log */}
            {(emailSent || lastEmailSent) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800">
                      Quote emailed to customer
                    </p>
                    
                    {lastEmailSent?.quoteTotal && (
                      <div className="mt-1.5 flex items-center gap-2 text-xs text-green-700">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="font-medium">
                          {formatCurrency(lastEmailSent.quoteTotal)}
                        </span>
                      </div>
                    )}
                    
                    {lastEmailSent && (
                      <p className="text-xs text-green-700 mt-1.5">
                        Last sent by <span className="font-medium">{lastEmailSent.userName}</span> on{' '}
                        {new Date(lastEmailSent.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                    {emailSent && !lastEmailSent && (
                      <p className="text-xs text-green-700 mt-1.5">
                        Just sent by <span className="font-medium">{currentUser?.name || 'you'}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : showQuoteBuilder ? (
        <div className="space-y-4">
          {/* Template Selector */}
          {availableTemplates.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <FileText className="w-4 h-4" style={{ color: '#3b82f6' }} />
                Load Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white text-gray-900 transition"
              >
                <option value="">Choose a template...</option>
                {availableTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {formatCurrency(template.total)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quote Builder */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
            <h5 className="flex items-center gap-2 font-bold text-gray-900 mb-3 text-sm">
              <Package className="w-4 h-4" style={{ color: '#10b981' }} />
              Line Items
            </h5>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-3 font-semibold text-gray-700 text-xs uppercase tracking-wide">Description</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-20">Qty</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-28">Unit Price</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-700 text-xs uppercase tracking-wide w-28">Total</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quoteData.map((item: any) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity || 1}
                            onChange={(e) => handleUpdateLineItem(item.id, 'quantity', e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice || 0}
                            onChange={(e) => handleUpdateLineItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => handleRemoveQuoteItem(item.id)}
                            className="p-1 text-red-600 hover:text-white hover:bg-red-600 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {/* New Line Item Row */}
                    <tr className="bg-green-50 border-t-2 border-emerald-300">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={newLineItem.description}
                          onChange={(e) => setNewLineItem({...newLineItem, description: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddQuoteItem()}
                          placeholder="New item description..."
                          className="w-full px-2 py-2 text-sm border border-emerald-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition"
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
                          className="w-full px-2 py-2 text-sm border border-emerald-300 rounded-lg text-center focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition"
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
                          className="w-full px-2 py-2 text-sm border border-emerald-300 rounded-lg text-right focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none transition"
                        />
                      </td>
                      <td className="py-2 px-3 text-right text-gray-600 font-medium text-sm">
                        {newLineItem.unitPrice ? formatCurrency(parseFloat(newLineItem.unitPrice) * parseFloat(newLineItem.quantity || '1')) : '$0.00'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={handleAddQuoteItem}
                          disabled={!newLineItem.description || !newLineItem.unitPrice}
                          className="p-1 text-green-600 hover:text-white hover:bg-green-600 rounded transition disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                  {quoteData.length > 0 && (
                    <tfoot className="border-t-2 border-gray-300 bg-gradient-to-r from-emerald-50 to-green-50">
                      <tr>
                        <td colSpan={3} className="py-3 px-3 text-right font-bold text-gray-900 uppercase tracking-wide">Total</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600 text-lg">{formatCurrency(calculateQuoteTotal())}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowQuoteBuilder(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 text-sm rounded-lg transition"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSaveQuote}
              disabled={saving || quoteData.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-semibold py-3 text-sm rounded-lg transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Quote'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <FileText className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-gray-500 mb-4 text-sm">No quote created yet</p>
          <button
            onClick={() => setShowQuoteBuilder(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 text-sm rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Quote
          </button>
        </div>
      )}
    </div>
  );
}