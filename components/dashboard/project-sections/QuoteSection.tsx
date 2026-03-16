'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save, X, Edit2, MoreVertical, Mail, Loader2 } from 'lucide-react';
import SendCustomerEmailButtons from '../SendCustomerEmailButtons';

type QuoteSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  activeCategory?: string;
};

export default function QuoteSection({ lead, currentUser, onRefresh, hasProject, activeCategory }: QuoteSectionProps) {
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState(lead?.quote_data || []);
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const category = activeCategory || lead?.category;
  const prevCategoryRef = React.useRef(category);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const companySlug = lead?.company_slug || lead?.slug;
        if (!companySlug) return;
        const res = await fetch(`/api/company/${companySlug}/quote-templates`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) setTemplates(data.templates || []);
        }
      } catch (err) {
        console.error('Failed to load templates', err);
      }
    };
    fetchTemplates();
  }, []);

  useEffect(() => {
    setQuoteData(lead?.quote_data || []);
  }, [lead?.quote_data]);

  useEffect(() => {
    if (!category) return;
    if (templates.length === 0) return;

    const categoryChanged = prevCategoryRef.current !== category;
    prevCategoryRef.current = category;

    setQuoteData((current: any[]) => {
      if (current.length > 0 && !categoryChanged) return current;

      const match = templates.find((t: any) => t.category === category);
      if (!match?.items?.length) return categoryChanged ? [] : current;

      toast.success('Pricing template loaded');
      return match.items.map((item: any) => ({
        id: Date.now() + Math.random(),
        description: item.description || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        amount: item.amount || (item.quantity || 1) * (item.unitPrice || 0),
      }));
    });
  }, [category, templates]);

  const handleAddRow = () => {
    setQuoteData([...quoteData, { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
    setIsEditing(true);
  };

  const handleAddTemplate = (template: any) => {
    const newRow = {
      id: Date.now(),
      description: template.name,
      quantity: 1,
      unitPrice: template.price || 0,
      amount: template.price || 0,
    };
    setQuoteData([...quoteData, newRow]);
    toast.success(`Added ${template.name}`);
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
      if (res.ok) {
        toast.success('Quote Saved');
        setIsEditing(false);
        await onRefresh();
      }
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const emailLog = useMemo(() => {
    try {
      const raw = lead?.quote_emails;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
      return [...parsed].reverse();
    } catch { return []; }
  }, [lead?.quote_emails]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

      {/* HEADER */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Quote Sheet</h3>
          {lead?.quote_accepted_at && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">✓ Accepted</span>
          )}
          {lead?.quote_declined_at && !lead?.quote_accepted_at && (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">✗ Declined</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing && templates.length > 0 && (
            <select
              onChange={(e) => {
                const t = templates.find(tpl => String(tpl.id) === e.target.value);
                if (t) handleAddTemplate(t);
                e.target.value = '';
              }}
              className="text-[10px] font-black uppercase tracking-tight bg-white border border-gray-200 rounded-lg px-2 h-8 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">+ Add Template</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => { setQuoteData(lead?.quote_data || []); setIsEditing(false); }} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="relative">
            <button onClick={() => setShowMoreActions(!showMoreActions)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1 bg-white shadow-xl border border-gray-100 z-50 w-56 rounded-xl p-2 animate-in fade-in zoom-in-95">
                <SendCustomerEmailButtons leadId={lead.id} type="quote" currentUser={currentUser} onRefresh={onRefresh} hasQuote={quoteData.length > 0} quoteSentAt={emailLog[0]?.sent_at || null} disabled={!hasProject} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THE SHEET GRID */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="text-left px-4 py-3 font-black">Item Description</th>
              <th className="text-right px-4 py-3 w-32 font-black">Amount</th>
              <th className="text-right px-4 py-3 w-20 font-black">Qty</th>
              {isEditing && <th className="w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {quoteData.map((item: any) => (
              <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-2 py-1">
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={item.description}
                    onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                    placeholder="Enter item name..."
                    className="w-full px-2 py-2 text-sm font-medium bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 rounded outline-none disabled:text-gray-900"
                  />
                </td>
                <td className="px-2 py-1">
                  <div className="relative flex items-center justify-end">
                    <span className="text-sm font-black text-gray-400 mr-0.5">$</span>
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={item.unitPrice || ''}
                      onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                      className="w-24 px-1 py-2 text-sm font-black text-right bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 rounded outline-none disabled:text-gray-900"
                    />
                  </div>
                </td>
                <td className="px-2 py-1 bg-gray-50/80">
                  <input
                    type="number"
                    disabled={!isEditing}
                    value={item.quantity || ''}
                    onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                    className="w-full px-2 py-2 text-sm font-bold text-right bg-transparent border-0 focus:ring-1 focus:ring-indigo-500 rounded outline-none disabled:text-gray-500"
                  />
                </td>
                {isEditing && (
                  <td className="px-2 py-1">
                    <button onClick={() => handleRemoveRow(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddRow}
          className="flex-1 h-12 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-black rounded-xl transition-all uppercase tracking-widest border border-indigo-100"
        >
          <Plus className="w-4 h-4" /> Add Line Item
        </button>

        {isEditing && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes ({fmt(total)})
          </button>
        )}
      </div>

      <div className="px-4 py-4 bg-gray-900 text-white flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Quote Total</span>
        <span className="text-xl font-black">{fmt(total)}</span>
      </div>

      {emailLog.length > 0 && (
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sent History</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {emailLog.map((entry: any, i: number) => (
              <div key={i} className="flex-shrink-0 bg-white border border-gray-200 px-3 py-2 rounded-lg flex items-center gap-3">
                <span className="text-[10px] font-black text-indigo-600">{fmt(entry.quote_total)}</span>
                <span className="text-[9px] font-bold text-gray-400">{new Date(entry.sent_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}