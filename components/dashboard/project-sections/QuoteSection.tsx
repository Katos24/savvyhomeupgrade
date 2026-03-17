'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, X, Edit2, MoreVertical, Mail,
  Loader2, Sparkles, LayoutGrid, ChevronDown,
} from 'lucide-react';
import SendCustomerEmailButtons from '../SendCustomerEmailButtons';
import AIQuoteGenerator from '../AIQuoteGenerator';

type QuoteSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const noSpinners =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function QuoteSection({
  lead,
  currentUser,
  onRefresh,
  hasProject,
  companySlug,
}: QuoteSectionProps) {
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState(lead?.quote_data || []);
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Self-fetched category template
  const [categoryTemplate, setCategoryTemplate] = useState<any | null>(null);
  const [templateBannerDismissed, setTemplateBannerDismissed] = useState(false);

  useEffect(() => {
    if (!lead?.category || !companySlug) return;
    fetch(`/api/company/${companySlug}/quote-templates`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const match = (data.templates || []).find(
            (t: any) => t.category === lead.category
          );
          setCategoryTemplate(match || null);
        }
      })
      .catch(() => {});
  }, [lead?.category, companySlug]);

  const showTemplateBanner =
    !templateBannerDismissed &&
    quoteData.length === 0 &&
    categoryTemplate &&
    categoryTemplate.items.length > 0;

  const handleLoadTemplate = () => {
    const items = categoryTemplate.items.map((item: any, i: number) => ({
      ...item,
      id: Date.now() + i,
    }));
    setQuoteData(items);
    setIsEditing(true);
    setTemplateBannerDismissed(true);
    toast.success('Template loaded — review and save when ready');
  };

  useEffect(() => {
    setQuoteData(lead?.quote_data || []);
    setTemplateBannerDismissed(false); // re-evaluate if lead changes
  }, [lead?.quote_data]);

  // Derive photos from lead
  const leadPhotos: string[] = useMemo(() => {
  const parse = (val: any): string[] => {
    if (!val) return [];
    const arr = typeof val === 'string' ? JSON.parse(val) : val;
    if (!Array.isArray(arr)) return [];
    return arr
      .map((f: any) => (typeof f === 'string' ? f : f?.url || f?.path || ''))
      .filter(Boolean);
  };

  return [
    ...parse(lead?.file_urls),      // customer submitted photos
    ...parse(lead?.before_photos),   // company added job site photos
  ];
}, [lead?.file_urls, lead?.before_photos]);

  const handleAddRow = () => {
    setQuoteData([
      ...quoteData,
      { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 },
    ]);
    setIsEditing(true);
  };

  const handleAddItems = (items: any[]) => {
    setQuoteData((prev: any[]) => [...prev, ...items]);
    setIsEditing(true);
    setShowAI(false);
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    setQuoteData(
      quoteData.map((item: any) => {
        if (item.id !== id) return item;
        const updated = { ...item };
        if (field === 'description') {
          updated[field] = value;
        } else {
          updated[field] = value === '' ? 0 : parseFloat(value) || 0;
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
          }
        }
        return updated;
      })
    );
  };

  const handleRemoveRow = (id: number) =>
    setQuoteData(quoteData.filter((item: any) => item.id !== id));

  const handleSave = async () => {
    if (!hasProject) { toast.error('Convert to project first'); return; }
    const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_quote',
          quote_data: quoteData,
          quote_total: total,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      if (res.ok) {
        toast.success('Quote saved');
        setIsEditing(false);
        await onRefresh();
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);

  const emailLog = useMemo(() => {
    try {
      const raw = lead?.quote_emails;
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw || [];
      return [...parsed].reverse();
    } catch {
      return [];
    }
  }, [lead?.quote_emails]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

      {/* ── HEADER ── */}
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
          {/* AI toggle button */}
          <button
            onClick={() => setShowAI((v) => !v)}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
              showAI
                ? 'bg-violet-600 text-white'
                : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI
            {leadPhotos.length > 0 && !showAI && (
              <span className="bg-violet-200 text-violet-700 px-1.5 rounded-full text-[9px]">
                {leadPhotos.length}📷
              </span>
            )}
          </button>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => { setQuoteData(lead?.quote_data || []); setIsEditing(false); }}
              className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1 bg-white shadow-xl border border-gray-100 z-50 w-56 rounded-xl p-2 animate-in fade-in zoom-in-95">
                <SendCustomerEmailButtons
                  leadId={lead.id}
                  type="quote"
                  currentUser={currentUser}
                  onRefresh={onRefresh}
                  hasQuote={quoteData.length > 0}
                  quoteSentAt={emailLog[0]?.sent_at || null}
                  disabled={!hasProject}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CATEGORY TEMPLATE BANNER ── */}
      {showTemplateBanner && (
        <div className="mx-4 mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-indigo-500 shrink-0" />
            <p className="text-sm font-bold text-indigo-900">
              There's a pricing template for this category — load it?
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLoadTemplate}
              className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition"
            >
              Load Template
            </button>
            <button
              onClick={() => setTemplateBannerDismissed(true)}
              className="p-1.5 text-indigo-300 hover:text-indigo-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── AI GENERATOR ── */}
      {showAI && (
        <div className="p-4 border-b border-gray-100">
          <AIQuoteGenerator
            leadDescription={lead?.description || ''}
            leadCategory={lead?.category || ''}
            leadPhotos={leadPhotos}
            onAddItems={handleAddItems}
          />
        </div>
      )}

      {/* ── QUOTE TABLE ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/30 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <th className="text-left px-4 py-3 font-black">Item Description</th>
              <th className="text-right px-4 py-3 w-32 font-black">Amount</th>
              <th className="text-right px-4 py-3 w-20 font-black">Qty</th>
              {isEditing && <th className="w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {quoteData.length === 0 && (
              <tr>
                <td colSpan={isEditing ? 4 : 3} className="px-4 py-10 text-center text-sm text-gray-300 font-bold">
                  No line items yet.
                </td>
              </tr>
            )}
            {quoteData.map((item: any) => (
              <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-2 py-1">
  <input
    type="text"
    disabled={!isEditing}
    value={item.description}
    onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
    placeholder="Enter item name..."
    className={`w-full px-2 py-2 text-sm font-medium bg-transparent border outline-none rounded-lg transition-colors disabled:text-gray-900 disabled:border-transparent ${isEditing ? 'border-gray-200 focus:border-indigo-400 focus:bg-indigo-50/30' : 'border-transparent'}`}
  />
</td>
              <td className="px-2 py-1">
  <div className={`flex items-center justify-end rounded-lg border transition-colors ${isEditing ? 'border-gray-200 focus-within:border-indigo-400 focus-within:bg-indigo-50/30' : 'border-transparent'}`}>
    <span className="text-sm font-black text-gray-400 pl-2">$</span>
    <input
      type="number"
      disabled={!isEditing}
      value={item.unitPrice || ''}
      onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
      className={`w-24 px-2 py-2 text-sm font-black text-right bg-transparent border-0 focus:ring-0 outline-none disabled:text-gray-900 ${noSpinners}`}
    />
  </div>
</td>
                <td className="px-2 py-1">
  <div className={`flex items-center justify-end rounded-lg border transition-colors ${isEditing ? 'border-gray-200 focus-within:border-indigo-400 focus-within:bg-indigo-50/30' : 'border-transparent'}`}>
    <input
      type="number"
      disabled={!isEditing}
      value={item.quantity || ''}
      onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
      className={`w-full px-2 py-2 text-sm font-bold text-right bg-transparent border-0 focus:ring-0 outline-none disabled:text-gray-500 ${noSpinners}`}
    />
  </div>
</td>
                {isEditing && (
                  <td className="px-2 py-1">
                    <button
                      onClick={() => handleRemoveRow(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

     {/* ── FOOTER ACTIONS ── */}
<div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2">
  <button
    onClick={handleAddRow}
    className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-black rounded-xl transition-all uppercase tracking-widest border border-indigo-100"
  >
    <Plus className="w-4 h-4" /> Add Line Item
  </button>

  {isEditing && (
    <button
      onClick={handleSave}
      disabled={saving}
      className="w-full h-14 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      Save Changes · {fmt(total)}
    </button>
  )}
</div>

      {/* ── TOTAL BAR ── */}
      <div className="px-4 py-4 bg-gray-900 text-white flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Quote Total</span>
        <span className="text-xl font-black">{fmt(total)}</span>
      </div>

      {/* ── EMAIL HISTORY ── */}
      {emailLog.length > 0 && (
        <div className="p-4 bg-gray-50/50 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Mail className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sent History</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {emailLog.map((entry: any, i: number) => (
              <div
                key={i}
                className="flex-shrink-0 bg-white border border-gray-200 px-3 py-2 rounded-lg flex items-center gap-3"
              >
                <span className="text-[10px] font-black text-indigo-600">{fmt(entry.quote_total)}</span>
                <span className="text-[9px] font-bold text-gray-400">
                  {new Date(entry.sent_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}