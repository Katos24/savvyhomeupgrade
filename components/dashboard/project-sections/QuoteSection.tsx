'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, X, Edit2, Mail,
  Loader2, Sparkles, Eye, Receipt, 
  ChevronRight, ArrowRightLeft, FileText
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

export default function QuoteSection({ lead, currentUser, onRefresh, hasProject, companySlug }: QuoteSectionProps) {
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState(lead?.quote_data || []);
  const [isEditing, setIsEditing] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [categoryTemplate, setCategoryTemplate] = useState<any | null>(null);
  const [pendingAiItems, setPendingAiItems] = useState<any[] | null>(null);

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

  const fetchOutbox = async () => {
    if (!lead?.id || !companySlug) return;
    try {
      const res = await fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=quote`);
      const data = await res.json();
      if (data.entries) setOutboxLog(data.entries);
    } catch {}
  };

  useEffect(() => { fetchOutbox(); }, [lead?.id, companySlug]);

  useEffect(() => {
    setQuoteData(lead?.quote_data || []);
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
    if (quoteData.length > 0) setPendingAiItems(items);
    else {
      setQuoteData(items);
      setIsEditing(true);
      setShowAI(false);
    }
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    setQuoteData(quoteData.map((item: any) => {
      if (item.id !== id) return item;
      const updated = { ...item };
      if (field === 'description') updated[field] = value;
      else {
        updated[field] = value === '' ? 0 : parseFloat(value) || 0;
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = parseFloat(String(updated.quantity || 0)) * parseFloat(String(updated.unitPrice || 0));
        }
      }
      return updated;
    }));
  };

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
    } catch { toast.error('Save failed'); } finally { setSaving(false); }
  };

  const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);

  return (
    <>
      {/* Email Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm" onClick={() => setPreviewHtml(null)}>
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300" style={{ height: '85vh' }} onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sent Proposal</p>
                  <p className="text-sm font-bold text-slate-800">Preview Mode</p>
                </div>
              </div>
              <button onClick={() => setPreviewHtml(null)} className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center transition">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
               <iframe title="Email Preview" srcDoc={previewHtml} className="w-full h-full border-0 rounded-2xl bg-white shadow-inner" sandbox="allow-same-origin" />
            </div>
          </div>
        </div>
      )}

      {/* Main Quote Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        
        {/* Header Section */}
        <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-200">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Quote Sheet</h3>
              {lead?.quote_accepted_at ? (
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tight">Status: Accepted</span>
              ) : (
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Draft Proposal</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAI(v => !v)}
              className={`flex items-center gap-2 px-3 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                showAI ? 'bg-violet-600 text-white shadow-lg shadow-violet-200 scale-105' : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Magic
            </button>

            {isEditing ? (
              <div className="flex gap-1 bg-white border border-slate-200 p-1 rounded-xl">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-3 h-7 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
                <button onClick={() => { setQuoteData(lead?.quote_data || []); setIsEditing(false); }} className="w-7 h-7 flex items-center justify-center text-rose-500 hover:bg-rose-50 rounded-lg transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 rounded-xl transition shadow-sm">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quote Table UI */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100">
                <th className="text-left pl-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Description</th>
                <th className="text-right px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-32">Unit Price</th>
                <th className="text-right px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-20">Qty</th>
                <th className="text-right pr-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-32">Amount</th>
                {isEditing && <th className="w-12" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {quoteData.length === 0 && (
                <tr>
                  <td colSpan={isEditing ? 5 : 4} className="py-20 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-slate-200" />
                    </div>
                    <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Empty Quote</p>
                    <p className="text-[11px] text-slate-400 mt-1">Start adding items manually or use AI.</p>
                  </td>
                </tr>
              )}
              {quoteData.map((item: any) => (
                <tr key={item.id} className={`group transition-all ${isEditing ? 'hover:bg-indigo-50/20' : 'hover:bg-slate-50/50'}`}>
                  <td className="pl-6 py-3">
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={item.description}
                      onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                      placeholder="Line item description..."
                      className={`w-full bg-transparent text-sm font-bold outline-none transition-all ${isEditing ? 'text-slate-800 focus:text-indigo-600' : 'text-slate-700'}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center justify-end gap-1 ${isEditing ? 'bg-slate-50 rounded-lg px-2 py-1 border border-slate-100 focus-within:border-indigo-200 transition-all' : ''}`}>
                      <span className="text-[10px] font-black text-slate-400">$</span>
                      <input
                        type="number"
                        disabled={!isEditing}
                        value={item.unitPrice || ''}
                        onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                        className={`w-20 text-right text-sm font-black bg-transparent outline-none ${noSpinners} ${isEditing ? 'text-slate-800' : 'text-slate-600'}`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      disabled={!isEditing}
                      value={item.quantity || ''}
                      onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                      className={`w-full text-right text-sm font-black bg-transparent outline-none ${noSpinners} ${isEditing ? 'bg-slate-50 rounded-lg px-2 py-1 border border-slate-100 focus:border-indigo-200' : 'text-slate-400'}`}
                    />
                  </td>
                  <td className="pr-6 py-3 text-right">
                    <span className="text-sm font-black text-slate-900">{fmt(item.amount || 0)}</span>
                  </td>
                  {isEditing && (
                    <td className="pr-4 py-3">
                      <button onClick={() => setQuoteData(quoteData.filter((i: any) => i.id !== item.id))} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/30 space-y-4">
          {isEditing && (
            <button onClick={handleAddRow} className="w-full h-11 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Line Item
            </button>
          )}

          <div className="bg-slate-800 rounded-2xl p-5 text-white flex items-center justify-between shadow-xl shadow-slate-200">
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Grand Total</p>
               <p className="text-2xl font-black">{fmt(total)}</p>
             </div>
             {isEditing ? (
               <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                 Save Quote
               </button>
             ) : (
               <div className="flex gap-2">
                 <SendCustomerEmailButtons
                    leadId={lead.id}
                    type="quote"
                    currentUser={currentUser}
                    onRefresh={async () => { await onRefresh(); await fetchOutbox(); }}
                    hasQuote={quoteData.length > 0}
                    quoteSentAt={outboxLog[0]?.created_at || null}
                    disabled={!hasProject}
                  />
               </div>
             )}
          </div>
        </div>

        {/* Sent History Section */}
        {outboxLog.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-white">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> Proposals Sent
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {outboxLog.map((entry: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${entry.status === 'failed' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                        {new Date(entry.created_at).toLocaleDateString()} at {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 truncate max-w-[180px]">By {entry.sent_by_email}</p>
                    </div>
                  </div>
                  <button onClick={() => setPreviewHtml(entry.html_body)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Modal Overlays (Logic Intact) */}
      {showAI && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">AI Draft</p>
              </div>
              <button onClick={() => setShowAI(false)} className="p-2 hover:bg-slate-50 rounded-full transition"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="p-8">
              <AIQuoteGenerator leadDescription={lead?.description || ''} leadCategory={lead?.category || ''} leadPhotos={leadPhotos} onAddItems={handleAddItems} companySlug={companySlug} />
            </div>
          </div>
        </div>
      )}

      {pendingAiItems && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl">
            <div className="w-16 h-16 bg-violet-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <ArrowRightLeft className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Sync AI Items?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium">
              You have {quoteData.length} existing items. Would you like to replace them or append the new AI suggestions?
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setQuoteData([...quoteData, ...pendingAiItems]); setPendingAiItems(null); setIsEditing(true); setShowAI(false); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition shadow-xl shadow-slate-200">Append Items</button>
              <button onClick={() => { setQuoteData(pendingAiItems); setPendingAiItems(null); setIsEditing(true); setShowAI(false); }} className="w-full py-4 bg-violet-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-violet-700 transition shadow-xl shadow-violet-200">Replace Current</button>
              <button onClick={() => setPendingAiItems(null)} className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Nevermind</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}