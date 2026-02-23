'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FileText, Plus, Trash2, Save, X, Edit2, DollarSign, MoreVertical, Mail } from 'lucide-react';
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

  useEffect(() => {
    async function fetchCustomTemplates() {
      setLoadingTemplates(true);
      try {
        const companySlug = window.location.pathname.split('/')[1];
        const res = await fetch(`/api/company/${companySlug}/quote-templates`);
        const data = await res.json();
        if (data.success) setCustomTemplates(data.templates || []);
      } catch (e) {
        console.error('Failed to fetch templates:', e);
      } finally {
        setLoadingTemplates(false);
      }
    }
    fetchCustomTemplates();
  }, []);

  useEffect(() => {
    if (customTemplates.length === 0 || !lead?.category) return;
    if (quoteData.length > 0 || lead?.quote_total) return;

    const match = customTemplates.find(t => t.category === lead?.category);
    if (match) {
      const items = match.items.map((item: any, i: number) => ({
        id: Date.now() + i,
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.amount / (item.quantity || 1),
        amount: item.amount,
      }));
      setQuoteData(items);

      if (!lead?.quote_total && hasProject && items.length > 0) {
        const total = items.reduce((s: number, i: any) => s + i.amount, 0);
        fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id, action: 'save_quote', quote_data: items, quote_total: total,
            user_name: currentUser?.name || 'Unknown', user_email: currentUser?.email || '',
          }),
        })
          .then(r => r.json())
          .then(result => { if (result.success) { toast.success('Quote auto-saved!'); onRefresh(); } })
          .catch(err => console.error('Auto-save failed:', err));
      }
    } else {
      setQuoteData([]);
    }
  }, [customTemplates, lead?.category, lead?.id, hasProject]);

  const availableTemplates = customTemplates.filter(t => t.category === lead?.category);

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) return;
    const template = availableTemplates.find(t => t.id === templateId);
    if (!template) return;
    const items = template.items.map((item: any, i: number) => ({
      id: Date.now() + i,
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.amount / (item.quantity || 1),
      amount: item.amount,
    }));
    setQuoteData(items);
    toast.success('Template loaded!');
  };

  const handleAddRow = () => {
    setQuoteData([...quoteData, { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    setQuoteData(quoteData.map((item: any) => {
      if (item.id !== id) return item;
      const updated = { ...item };
      if (field === 'description') {
        updated[field] = value;
      } else {
        const num = value === '' ? 0 : parseFloat(value) || 0;
        updated[field] = num;
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
      }
      return updated;
    }));
  };

  const handleRemoveRow = (id: number) => setQuoteData(quoteData.filter((item: any) => item.id !== id));

  const handleSave = async () => {
    if (!hasProject) { toast.error('Convert to project first'); return; }
    if (quoteData.length === 0) { toast.error('Add at least one line item'); return; }

    const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id, action: 'save_quote', quote_data: quoteData, quote_total: total,
          user_name: currentUser?.name || 'Unknown', user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Quote saved!');
        setIsEditing(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to save quote');
      }
    } catch {
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const colCount = isEditing ? 5 : 4;

  // Empty state
  if (quoteData.length === 0 && !isEditing && !loadingTemplates) {
    return (
      <div className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-50 flex items-center justify-center text-xs">💰</span>
            Quote
          </h3>
        </div>
        <div className="p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 bg-blue-50 flex items-center justify-center">
            <FileText className="w-7 h-7 text-blue-500" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No quote yet</p>
          {availableTemplates.length === 0 && (
            <p className="text-xs text-gray-400 max-w-xs">
              💡 Create a quote template in Settings to auto-populate quotes for this category.
            </p>
          )}
          <button
            onClick={() => { handleAddRow(); setIsEditing(true); }}
            className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 text-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-5 h-5 bg-blue-50 flex items-center justify-center text-xs">💰</span>
          Quote
          {quoteData.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold">
              {fmt(total)}
            </span>
          )}
        </h3>

        {/* Action buttons in header */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              {availableTemplates.length > 1 && (
                <select
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="text-xs border border-gray-200 px-2 py-1.5 focus:outline-none focus:border-blue-400 text-gray-600"
                >
                  <option value="">Load template...</option>
                  {availableTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
              <button onClick={handleAddRow}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                <Plus className="w-3 h-3" /> Row
              </button>
              <button onClick={() => { setQuoteData(lead?.quote_data || []); setIsEditing(false); }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 transition">
                <X className="w-3 h-3" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white transition">
                <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <div className="relative">
                <button onClick={() => setShowMoreActions(!showMoreActions)}
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMoreActions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreActions(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white shadow-2xl border border-gray-100 z-50 w-64 p-2">
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Description
              </th>
              <th className="text-center py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 w-20">
                Qty
              </th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 w-32">
                Unit Price
              </th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100 w-32">
                Amount
              </th>
              {isEditing && <th className="w-10 border-b border-gray-100" />}
            </tr>
          </thead>
          <tbody>
            {quoteData.map((item: any) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="p-0">
                  {isEditing ? (
                    <input type="text" value={item.description}
                      onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                      className="w-full px-4 py-3 text-sm focus:outline-none focus:bg-blue-50 bg-transparent"
                      placeholder="Description..." />
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-900">{item.description}</div>
                  )}
                </td>
                <td className="p-0 text-center">
                  {isEditing ? (
                    <input type="number" min="1" step="1" value={item.quantity || ''}
                      onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                      className="w-full px-4 py-3 text-sm text-center focus:outline-none focus:bg-blue-50 bg-transparent"
                      style={{ MozAppearance: 'textfield' } as any} />
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-900">{item.quantity}</div>
                  )}
                </td>
                <td className="p-0 text-right">
                  {isEditing ? (
                    <input type="number" step="0.01" min="0" value={item.unitPrice || ''}
                      onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                      className="w-full px-4 py-3 text-sm text-right focus:outline-none focus:bg-blue-50 bg-transparent"
                      style={{ MozAppearance: 'textfield' } as any}
                      placeholder="0.00" />
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-900">{fmt(item.unitPrice)}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                  {fmt(item.amount)}
                </td>
                {isEditing && (
                  <td className="px-2 py-3 text-center">
                    <button onClick={() => handleRemoveRow(item.id)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {/* Total row - full width spanning all columns */}
          <tfoot>
            <tr style={{ background: '#f0fdf4' }}>
              <td
                colSpan={isEditing ? 4 : 3}
                className="px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-widest border-t-2 border-gray-200"
              >
                Total
              </td>
              <td className="px-4 py-4 text-right font-extrabold text-green-600 text-base border-t-2 border-gray-200">
                {fmt(total)}
              </td>
              {isEditing && <td className="border-t-2 border-gray-200" />}
            </tr>
          </tfoot>
        </table>

        <style jsx>{`
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        `}</style>
      </div>

      {/* Email sent log */}
      {!isEditing && (() => {
        let emailLog: any[] = [];
        try {
          const raw = lead?.quote_emails;
          emailLog = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
        } catch { emailLog = []; }
        if (emailLog.length === 0) return null;
        return (
          <div className="px-5 py-4 border-t border-gray-50 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Email History
            </p>
            {[...emailLog].reverse().map((entry: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-blue-900">{fmt(entry.quote_total)}</span>
                  <span className="text-xs text-blue-500">by {entry.sent_by_email}</span>
                </div>
                <span className="text-xs text-blue-500">
                  {new Date(entry.sent_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
}