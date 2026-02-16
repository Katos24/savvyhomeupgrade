'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Edit2,
  DollarSign,
  MoreVertical,
  Mail,
  Lock
} from 'lucide-react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Fetch custom templates on mount
  useEffect(() => {
    async function fetchCustomTemplates() {
      setLoadingTemplates(true);
      try {
        const companySlug = window.location.pathname.split('/')[1]; // Extract company slug from URL
        const response = await fetch(`/api/company/${companySlug}/quote-templates`);
        const data = await response.json();
        
        if (data.success) {
          setCustomTemplates(data.templates || []);
        }
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    }
    
    fetchCustomTemplates();
  }, []);

  // Auto-populate quote with first matching template
  useEffect(() => {
    if (customTemplates.length === 0) return;
    if (!lead?.category) return;
    
    // Only auto-populate if:
    // 1. Quote is empty, OR
    // 2. Quote exists but hasn't been saved yet (no quote_total on lead)
    const shouldAutoPopulate = quoteData.length === 0 || !lead?.quote_total;
    
    if (!shouldAutoPopulate) return;
    
    // Find first template matching lead category
    const matchingTemplate = customTemplates.find(
      template => template.category === lead?.category
    );
    
    if (matchingTemplate) {
      const templateItems = matchingTemplate.items.map((item: any, index: number) => ({
        id: Date.now() + index,
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || (item.amount / (item.quantity || 1)),
        amount: item.amount
      }));
      
      setQuoteData(templateItems);
    } else {
      // No template found for this category, clear the quote
      setQuoteData([]);
    }
  }, [customTemplates, lead?.category, lead?.id]); // Re-run when category OR lead changes

  // Filter templates by lead category
  const availableTemplates = customTemplates.filter(
    template => template.category === lead?.category
  );

  // Parse activity log
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
  } : null;

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) return;
    
    const template = availableTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    const templateItems = template.items.map((item: any, index: number) => ({
      id: Date.now() + index,
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.amount / (item.quantity || 1),
      amount: item.amount
    }));
    
    setQuoteData(templateItems);
    toast.success(`Template loaded!`);
  };

  const handleAddRow = () => {
    setQuoteData([...quoteData, {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    }]);
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    setQuoteData(quoteData.map((item: any) => {
      if (item.id !== id) return item;
      
      const updated = { ...item };
      
      if (field === 'description') {
        updated[field] = value;
      } else {
        // For number fields, parse the value properly
        const numValue = value === '' ? 0 : parseFloat(value) || 0;
        updated[field] = numValue;
        
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
      }
      
      return updated;
    }));
  };

  const handleRemoveRow = (id: number) => {
    setQuoteData(quoteData.filter((item: any) => item.id !== id));
  };

  const handleSave = async () => {
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
        setIsEditing(false);
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

  const total = quoteData.reduce((sum: number, item: any) => sum + item.amount, 0);
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Check if quote is saved
  const hasQuote = lead?.quote_total && parseFloat(lead.quote_total) > 0;

  // No quote yet AND no template found
  if (quoteData.length === 0 && !isEditing && !loadingTemplates) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <p className="text-gray-500 mb-4">No quote created yet</p>
        
        {availableTemplates.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4 max-w-md mx-auto">
            💡 <strong>Tip:</strong> Create a quote template for {lead?.category} in Settings to auto-populate quotes.
          </div>
        )}
        
        <button
          onClick={() => {
            handleAddRow();
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Create Quote
        </button>
        
        {/* Payment Locked Notice */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-md mx-auto">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-700">Payment Tracking Locked</p>
              <p className="text-xs text-gray-500 mt-1">
                Save a quote to unlock payment tracking and billing features
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Template Selector - Switch between templates while editing */}
      {isEditing && availableTemplates.length > 1 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Switch Template
          </label>
          <select
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none bg-white font-medium shadow-sm"
          >
            <option value="">Load different template...</option>
            {availableTemplates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {formatCurrency(template.total)}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* No templates message */}
      {quoteData.length === 0 && availableTemplates.length === 0 && !loadingTemplates && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-4">
          💡 <strong>Tip:</strong> Create quote templates in Settings to auto-populate quotes for this category.
        </div>
      )}

      {/* Google Sheets-style Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm border-b border-r border-gray-200">
                  Description
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm border-b border-r border-gray-200 w-24">
                  Qty
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm border-b border-r border-gray-200 w-32">
                  Unit Price
                </th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 text-sm border-b border-gray-200 w-32">
                  Amount
                </th>
                {isEditing && <th className="w-12 border-b border-gray-200"></th>}
              </tr>
            </thead>
            <tbody>
              {quoteData.map((item: any, idx: number) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-0 border-b border-r border-gray-200">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                        className="w-full px-4 py-3 text-sm border-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-transparent"
                        placeholder="Enter description..."
                      />
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-900">{item.description}</div>
                    )}
                  </td>
                  <td className="p-0 border-b border-r border-gray-200">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity || ''}
                        onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                        style={{ 
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'none',
                          appearance: 'none'
                        }}
                        className="w-full px-4 py-3 text-sm text-center border-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-transparent"
                      />
                    ) : (
                      <div className="px-4 py-3 text-sm text-center text-gray-900">{item.quantity}</div>
                    )}
                  </td>
                  <td className="p-0 border-b border-r border-gray-200">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                        style={{ 
                          MozAppearance: 'textfield',
                          WebkitAppearance: 'none',
                          appearance: 'none'
                        }}
                        className="w-full px-4 py-3 text-sm text-right border-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-transparent"
                        placeholder="0.00"
                      />
                    ) : (
                      <div className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(item.unitPrice)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900 border-b border-gray-200">
                    {formatCurrency(item.amount)}
                  </td>
                  {isEditing && (
                    <td className="p-0 border-b border-gray-200 text-center">
                      <button
                        onClick={() => handleRemoveRow(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-green-50">
                <td colSpan={isEditing ? 3 : 2} className="px-4 py-4 text-right font-bold text-gray-900 border-t-2 border-gray-300">
                  TOTAL
                </td>
                <td className="px-4 py-4 text-right font-bold text-green-600 text-lg border-t-2 border-gray-300">
                  {formatCurrency(total)}
                </td>
                {isEditing && <td className="border-t-2 border-gray-300"></td>}
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Inline CSS to remove spinners */}
        <style jsx>{`
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
            <button
              onClick={() => {
                setQuoteData(lead?.quote_data || []);
                setIsEditing(false);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition shadow-lg"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Quote'}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>

            {/* More Actions */}
            <div className="relative">
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMoreActions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMoreActions(false)} />
                  <div className="absolute right-0 bottom-full mb-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 w-64 p-2">
                    <div onClick={() => setShowMoreActions(false)}>
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
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Email Sent Log */}
      {lastEmailSent && !isEditing && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900">Quote Sent to Customer</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-800">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">{formatCurrency(lastEmailSent.quoteTotal)}</span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Sent by <span className="font-semibold">{lastEmailSent.userName}</span> on{' '}
                {new Date(lastEmailSent.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}