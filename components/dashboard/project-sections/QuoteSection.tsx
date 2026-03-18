'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, X, Edit2, MoreVertical, Mail,
  Loader2, Sparkles, LayoutGrid, ChevronDown, Eye,
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
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const [categoryTemplate, setCategoryTemplate] = useState<any | null>(null);
  const [templateBannerDismissed, setTemplateBannerDismissed] = useState(false);

  useEffect(() => {
    if (!lead?.category || !companySlug) return;
    fetch(`/api/company/${companySlug}/quote-templates`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const match = (data.templates || []).find((t: any) => t.category === lead.category);
          setCategoryTemplate(match || null);
        }
      })
      .catch(() => {});
  }, [lead?.category, companySlug]);

  useEffect(() => {
    if (!lead?.id || !companySlug) return;
    async function fetchOutbox() {
      try {
        const res = await fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=quote`);
        const data = await res.json();
        if (data.entries) setOutboxLog(data.entries);
      } catch {}
    }
    fetchOutbox();
  }, [lead?.id, companySlug]);

  const showTemplateBanner =
    !templateBannerDismissed &&
    quoteData.length === 0 &&
    categoryTemplate &&
    categoryTemplate.items.length > 0;

  const handleLoadTemplate = () => {
    const items = categoryTemplate.items.map((item: any, i: number) => ({ ...item, id: Date.now() + i }));
    setQuoteData(items);
    setIsEditing(true);
    setTemplateBannerDismissed(true);
    toast.success('Template loaded — review and save when ready');
  };

  useEffect(() => {
    setQuoteData(lead?.quote_data || []);
    setTemplateBannerDismissed(false);
  }, [lead?.quote_data]);

  const leadPhotos: string[] = useMemo(() => {
    const parse = (val: any): string[] => {
      if (!val) return [];
      const arr = typeof val === 'string' ? JSON.parse(val) : val;
      if (!Array.isArray(arr)) return [];
      return arr.map((f: any) => (typeof f === 'string' ? f : f?.url || f?.path || '')).filter(Boolean);
    };
    return [...parse(lead?.file_urls), ...parse(lead?.before_photos)];
  }, [lead?.file_urls, lead?.before_photos]);

  const handleAddRow = () => {
    setQuoteData([...quoteData, { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
    setIsEditing(true);
  };

  const handleAddItems = (items: any[]) => {
    setQuoteData((prev: any[]) => [...prev, ...items]);
    setIsEditing(true);
    setShowAI(false);
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    setQuoteData(quoteData.map((item: any) => {
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

  return (
    <>
      {/* Email preview modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewHtml(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            style={{ height: '88vh' }} onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Email Preview</p>
              </div>
              <button onClick={() => setPreviewHtml(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-3" style={{ minHeight: 0 }}>
              <iframe
  title="Email Preview"
  srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;cursor:default!important;}</style>`}
  className="w-full border-0 rounded-xl bg-white"
  style={{ height: '100%', width: '100%', display: 'block' }}
  sandbox="allow-same-origin"
/>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

        {/* Header */}
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
            <button onClick={() => setShowAI((v) => !v)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${showAI ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              AI
              {leadPhotos.length > 0 && !showAI && (
                <span className="bg-violet-200 text-violet-700 px-1.5 rounded-full text-[9px]">{leadPhotos.length}📷</span>
              )}
            </button>
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
                  <SendCustomerEmailButtons
                    leadId={lead.id} type="quote" currentUser={currentUser}
                    onRefresh={onRefresh} hasQuote={quoteData.length > 0}
                    quoteSentAt={outboxLog[0]?.created_at || null} disabled={!hasProject}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Template banner */}
        {showTemplateBanner && (
          <div className="mx-4 mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-500 shrink-0" />
              <p className="text-sm font-bold text-indigo-900">There's a pricing template for this category — load it?</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleLoadTemplate} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition">Load Template</button>
              <button onClick={() => setTemplateBannerDismissed(true)} className="p-1.5 text-indigo-300 hover:text-indigo-500 transition"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* AI generator */}
        {showAI && (
          <div className="p-4 border-b border-gray-100">
            <AIQuoteGenerator leadDescription={lead?.description || ''} leadCategory={lead?.category || ''}
              leadPhotos={leadPhotos} onAddItems={handleAddItems} />
          </div>
        )}

        {/* Quote table */}
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
                  <td colSpan={isEditing ? 4 : 3} className="px-4 py-10 text-center text-sm text-gray-300 font-bold">No line items yet.</td>
                </tr>
              )}
              {quoteData.map((item: any) => (
                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-2 py-1">
                    <input type="text" disabled={!isEditing} value={item.description}
                      onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                      placeholder="Enter item name..."
                      className={`w-full px-2 py-2 text-sm font-medium bg-transparent border outline-none rounded-lg transition-colors disabled:text-gray-900 disabled:border-transparent ${isEditing ? 'border-gray-200 focus:border-indigo-400 focus:bg-indigo-50/30' : 'border-transparent'}`} />
                  </td>
                  <td className="px-2 py-1">
                    <div className={`flex items-center justify-end rounded-lg border transition-colors ${isEditing ? 'border-gray-200 focus-within:border-indigo-400 focus-within:bg-indigo-50/30' : 'border-transparent'}`}>
                      <span className="text-sm font-black text-gray-400 pl-2">$</span>
                      <input type="number" disabled={!isEditing} value={item.unitPrice || ''}
                        onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                        className={`w-24 px-2 py-2 text-sm font-black text-right bg-transparent border-0 focus:ring-0 outline-none disabled:text-gray-900 ${noSpinners}`} />
                    </div>
                  </td>
                  <td className="px-2 py-1">
                    <div className={`flex items-center justify-end rounded-lg border transition-colors ${isEditing ? 'border-gray-200 focus-within:border-indigo-400 focus-within:bg-indigo-50/30' : 'border-transparent'}`}>
                      <input type="number" disabled={!isEditing} value={item.quantity || ''}
                        onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                        className={`w-full px-2 py-2 text-sm font-bold text-right bg-transparent border-0 focus:ring-0 outline-none disabled:text-gray-500 ${noSpinners}`} />
                    </div>
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

        {/* Footer actions */}
        <div className="p-3 bg-white border-t border-gray-100 flex flex-col gap-2">
          <button onClick={handleAddRow}
            className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-black rounded-xl transition-all uppercase tracking-widest border border-indigo-100">
            <Plus className="w-4 h-4" /> Add Line Item
          </button>
          {isEditing && (
            <button onClick={handleSave} disabled={saving}
              className="w-full h-14 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes · {fmt(total)}
            </button>
          )}
        </div>

        {/* Total bar */}
        <div className="px-4 py-4 bg-gray-900 text-white flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Quote Total</span>
          <span className="text-xl font-black">{fmt(total)}</span>
        </div>

        {/* Email history */}
        {outboxLog.length > 0 && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Sent History
            </p>
            <div className="space-y-2">
              {outboxLog.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-xl gap-3">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${entry.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                        {entry.status === 'failed' ? 'Failed' : 'Sent'}
                      </span>
                      <span className="text-xs font-black text-slate-700">
                        {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {entry.sent_by_email && <span className="text-[10px] text-slate-400 truncate">{entry.sent_by_email}</span>}
                    {entry.status === 'failed' && entry.error_message && <span className="text-[10px] text-red-500 font-bold truncate">{entry.error_message}</span>}
                  </div>
                  {entry.html_body && (
                    <button onClick={() => setPreviewHtml(entry.html_body)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition">
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <style jsx>{`
          input[type='number']::-webkit-inner-spin-button,
          input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        `}</style>
      </div>
    </>
  );
}