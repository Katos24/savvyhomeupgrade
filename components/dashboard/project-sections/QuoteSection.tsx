'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, X, Mail, Loader2, Send, Sparkles, Eye, Receipt, ArrowRightLeft, CheckCircle2, Save,
} from 'lucide-react';
import SendEmailModal from '@/components/dashboard/SendEmailModal';
import AIQuoteGenerator from '../AIQuoteGenerator';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [quoteData, setQuoteData] = useState(lead?.quote_data || []);
  const [showAI, setShowAI] = useState(false);
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [lastHtmlBody, setLastHtmlBody] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [pendingAiItems, setPendingAiItems] = useState<any[] | null>(null);
  const [categoryTemplate, setCategoryTemplate] = useState<any | null>(null);
  const [templateBannerDismissed, setTemplateBannerDismissed] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null);

  const newRowRef = useRef<HTMLDivElement | HTMLTableRowElement | null>(null);
  const newRowInputRef = useRef<HTMLInputElement | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false); // ← add this


  // Load category template
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

  // Sync with lead data
  useEffect(() => {
  if (isSavingRef.current) return; // ← guard moved here
  setQuoteData(lead?.quote_data || []);
  setTemplateBannerDismissed(false);
}, [lead?.quote_data]);

  const fetchOutbox = async () => {
    if (!lead?.id || !companySlug) return;
    try {
      const res = await fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=quote`);
      const data = await res.json();
      if (data.entries) {
        setOutboxLog(data.entries);
        const latest = data.entries.find((e: any) => e.html_body);
        if (latest) setLastHtmlBody(latest.html_body);
      }
    } catch {}
  };

  useEffect(() => { fetchOutbox(); }, [lead?.id, companySlug]);

  // Scroll new row into view once it's rendered
  useEffect(() => {
    if (newRowRef.current) {
      newRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      newRowInputRef.current?.focus();
      newRowRef.current = null;
      newRowInputRef.current = null;
    }
  }, [quoteData]);

  const leadPhotos: string[] = useMemo(() => {
    const parse = (val: any): string[] => {
      if (!val) return [];
      const arr = typeof val === 'string' ? JSON.parse(val) : val;
      if (!Array.isArray(arr)) return [];
      return arr.map((f: any) => (typeof f === 'string' ? f : f?.url || f?.path || '')).filter(Boolean);
    };
    return [...parse(lead?.file_urls), ...parse(lead?.before_photos)];
  }, [lead?.file_urls, lead?.before_photos]);

  // ── AUTOSAVE — fires after any change, debounced slightly ──
 const doSave = async (data: any[]) => {
  isSavingRef.current = true; // ← add this
  const totalAmount = data.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  try {
    const res = await fetch('/api/leads/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: lead.id,
        action: 'save_quote',
        quote_data: data,
        quote_total: totalAmount,
        user_name: currentUser?.name || 'Unknown',
        user_email: currentUser?.email || '',
      }),
    });
    if (res.ok) {
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus('idle'), 1500);
      await onRefresh();
    } else {
      setAutosaveStatus('idle');
      toast.error('Failed to save');
    }
  } catch {
    setAutosaveStatus('idle');
    toast.error('Failed to save');
  } finally {
    isSavingRef.current = false; // ← add this, releases the guard only after refresh truly finishes
  }
};

  const persistQuote = (data: any[]) => {
    if (!hasProject) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setAutosaveStatus('saving');
    saveTimeoutRef.current = setTimeout(() => { doSave(data); }, 500);
  };

  const handleManualSave = () => {
    if (!hasProject) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setAutosaveStatus('saving');
    doSave(quoteData);
  };

  const handleLoadTemplate = () => {
    const items = categoryTemplate.items.map((item: any, i: number) => ({ ...item, id: Date.now() + i }));
    setQuoteData(items);
    setTemplateBannerDismissed(true);
    persistQuote(items);
    toast.success('Template loaded');
  };

  const handleAddItems = (items: any[]) => {
    if (quoteData.length > 0) {
      setPendingAiItems(items);
    } else {
      setQuoteData(items);
      setShowAI(false);
      persistQuote(items);
    }
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    const updated = quoteData.map((item: any) => {
      if (item.id !== id) return item;
      const next = { ...item };
      if (field === 'description') {
        next[field] = value;
      } else {
        next[field] = value === '' ? 0 : parseFloat(value) || 0;
        if (field === 'quantity' || field === 'unitPrice') {
          next.amount = parseFloat(String(next.quantity || 0)) * parseFloat(String(next.unitPrice || 0));
        }
      }
      return next;
    });
    setQuoteData(updated);
  };

  const commitRow = () => {
    persistQuote(quoteData);
  };

  const handleRemoveRow = (id: number) => {
    const updated = quoteData.filter((item: any) => item.id !== id);
    setQuoteData(updated);
    persistQuote(updated);
  };

  const handleAddRow = () => {
    const newItem = { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 };
    const updated = [...quoteData, newItem];
    setQuoteData(updated);
    return newItem;
  };

  const handleAddRowMobile = () => {
    const newItem = handleAddRow();
    // Open the bottom sheet directly from the click handler — not from a ref
    // callback, since ref callbacks can re-fire on every re-render and reset
    // editingItem while the user is mid-type.
    setEditingItem(newItem);
  };

  const handleDoneEditing = () => {
    const updated = quoteData.map((item: any) => (item.id === editingItem.id ? editingItem : item));
    setQuoteData(updated);
    setEditingItem(null);
    persistQuote(updated);
  };

  const total = quoteData.reduce((s: number, i: any) => s + (i.amount || 0), 0);
  const lastAddedId = quoteData.length > 0 ? quoteData[quoteData.length - 1].id : null;

  return (
    <>
      {/* ── EMAIL PREVIEW MODAL ── */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ scale: 0.97, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl"
              style={{ height: '88vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Email preview</p>
                    <p className="text-sm font-medium text-slate-800">Client proposal</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-50 p-3" style={{ minHeight: 0 }}>
                <iframe
                  title="Email Preview"
                  srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;cursor:default!important;}</style>`}
                  className="w-full h-full border-0 rounded-xl bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-gray-200"
      >

        {/* HEADER */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-4 h-4 text-slate-400" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 leading-none">Quote sheet</h3>
              {(lead?.project_quote_accepted_at || lead?.quote_accepted_at) ? (
                <span className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1">
                  <CheckCircle2 className="w-3 h-3" /> Accepted {new Date(lead.project_quote_accepted_at || lead.quote_accepted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ) : (lead?.project_quote_declined_at || lead?.quote_declined_at) ? (
                <span className="text-[11px] text-red-500 mt-1 block">Declined</span>
              ) : (lead?.project_quote_sent_at || lead?.quote_sent_at) ? (
                <span className="flex items-center gap-1 text-[11px] text-blue-500 mt-1">
                  <Send className="w-3 h-3" /> Sent {new Date(lead.project_quote_sent_at || lead.quote_sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              ) : (
                <p className="text-[11px] text-slate-400 mt-1">Line item breakdown</p>
              )}
            </div>
          </div>

        <div className="flex items-center gap-2">
            {/* Autosave indicator */}
            {autosaveStatus === 'saving' && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving
              </span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Saved
              </span>
            )}

            <button
              onClick={handleManualSave}
              disabled={!hasProject || quoteData.length === 0 || autosaveStatus === 'saving'}
              title="Save now"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
            </button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowAI(v => !v)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition ${
                showAI
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI
              {leadPhotos.length > 0 && !showAI && (
                <span className="bg-blue-200 text-blue-700 px-1.5 rounded-full text-[10px]">
                  {leadPhotos.length}
                </span>
              )}
            </motion.button>
          </div>
        </div>

        {/* TEMPLATE BANNER */}
        <AnimatePresence>
          {categoryTemplate && quoteData.length === 0 && !templateBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-4 mt-3 flex items-center justify-between gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-800 truncate">Template: {categoryTemplate.name}</p>
                  <p className="text-[11px] text-blue-500">
                    {categoryTemplate.items?.length || 0} pre-filled items for {lead.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleLoadTemplate}
                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => setTemplateBannerDismissed(true)}
                    className="w-6 h-6 flex items-center justify-center text-blue-400 hover:text-blue-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DESKTOP TABLE — every cell tap-to-edit, no global edit mode ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Line item</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 w-28">Unit price</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 w-24">Qty</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 w-28">Amount</th>
                <th className="w-9" />
              </tr>
            </thead>
            <tbody>
              {quoteData.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <button
                      onClick={handleAddRow}
                      className="w-full py-14 flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="w-11 h-11 rounded-full bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center transition-all group-hover:scale-105">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-blue-500 group-hover:text-blue-600 transition-colors">Add line item</span>
                    </button>
                  </td>
                </tr>
              ) : (
                <>
                  {quoteData.map((item: any) => {
                    const isNew = item.id === lastAddedId && !item.description;
                    return (
                      <tr
                        key={item.id}
                        ref={isNew ? (el) => { newRowRef.current = el; } : undefined}
                        className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors group"
                      >
                        <td className="px-5 py-2.5">
                          <input
                            ref={isNew ? newRowInputRef : undefined}
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                            onBlur={commitRow}
                            placeholder="Item description…"
                            className="w-full outline-none text-sm font-medium text-gray-900 placeholder-gray-300 bg-transparent rounded-lg px-2 py-1 -mx-2 focus:bg-white focus:border focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                          />
                        </td>
                        <td className="px-5 py-2.5">
                          <div className="flex items-center justify-end gap-0.5">
                            <span className="text-xs text-gray-400">$</span>
                            <input
                              type="number"
                              value={item.unitPrice || ''}
                              onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                              onBlur={commitRow}
                              className={`w-20 outline-none text-sm text-right text-gray-900 bg-transparent rounded-lg px-1.5 py-1 focus:bg-white focus:border focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all ${noSpinners}`}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-2.5">
                          <input
                            type="number"
                            value={item.quantity || ''}
                            onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                            onBlur={commitRow}
                            className={`w-full outline-none text-sm text-right text-gray-900 bg-transparent rounded-lg px-2 py-1 focus:bg-white focus:border focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all ${noSpinners}`}
                          />
                        </td>
                        <td className="px-5 py-2.5 text-right text-sm font-medium text-gray-900">
                          ${(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="pr-3 py-2.5">
                          <button
                            onClick={() => handleRemoveRow(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan={5} className="px-5 py-2.5">
                      <button
                        onClick={handleAddRow}
                        className="flex items-center gap-2 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </div>
                        Add line item
                      </button>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARDS — tap any card to edit in bottom sheet ── */}
        <div className="md:hidden">
          {quoteData.length === 0 ? (
            <button
              onClick={handleAddRowMobile}
              className="w-full py-14 flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-full bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center transition-all group-hover:scale-105">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-blue-500 group-hover:text-blue-600 transition-colors">Add line item</span>
            </button>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              {quoteData.map((item: any) => {
                const isNew = item.id === lastAddedId && !item.description;
                return (
                  <div
                    key={item.id}
                    ref={isNew ? (el) => { newRowRef.current = el; } : undefined}
                    onClick={() => setEditingItem(item)}
                    className="bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer active:scale-[0.98] active:bg-gray-50 transition-all"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      {item.description || <span className="text-gray-300 font-normal">No description</span>}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-[10px] font-medium text-gray-500 mb-0.5">Amount</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xs font-medium text-gray-500">$</span>
                          <span className="text-lg font-semibold text-gray-900">
                            {(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-gray-100" />
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 mb-0.5">Unit price</p>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xs font-medium text-gray-400">$</span>
                          <span className="text-sm font-medium text-gray-700">
                            {(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-gray-100" />
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 mb-0.5">Qty</p>
                        <span className="text-sm font-medium text-gray-700">{item.quantity}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveRow(item.id); }}
                        className="ml-auto p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={handleAddRowMobile}
                className="w-full border-2 border-dashed border-blue-200 rounded-2xl py-3 flex items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50/40 transition-all group"
              >
                <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-blue-400 flex items-center justify-center transition-colors">
                  <Plus className="w-3 h-3 text-gray-400 group-hover:text-blue-500" />
                </div>
                <span className="text-xs font-medium text-gray-400 group-hover:text-blue-500 transition-colors">Add line item</span>
              </button>
            </div>
          )}
        </div>

        {/* ── BOTTOM SHEET EDITOR (mobile) — autosaves on Done ── */}
        <AnimatePresence>
          {editingItem && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingItem(null)}
                className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm md:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl md:hidden"
                style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-gray-200" />
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Edit item</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!editingItem.description && !editingItem.unitPrice) {
                          handleRemoveRow(editingItem.id);
                        }
                        setEditingItem(null);
                      }}
                      className="px-4 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDoneEditing}
                      className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-xl transition-colors hover:bg-blue-700"
                    >
                      Done
                    </button>
                  </div>
                </div>

                <div className="px-5 py-4 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
                    <input
                      type="text"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      placeholder="Item name or description…"
                      autoFocus
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Unit price</label>
                      <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <span className="text-sm font-medium text-gray-400">$</span>
                        <input
                          type="number"
                          value={editingItem.unitPrice || ''}
                          onChange={(e) => {
                            const unitPrice = parseFloat(e.target.value) || 0;
                            setEditingItem({ ...editingItem, unitPrice, amount: unitPrice * editingItem.quantity });
                          }}
                          placeholder="0.00"
                          className={`flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder-gray-300 ${noSpinners}`}
                        />
                      </div>
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Qty</label>
                      <input
                        type="number"
                        value={editingItem.quantity || ''}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 0;
                          setEditingItem({ ...editingItem, quantity, amount: editingItem.unitPrice * quantity });
                        }}
                        placeholder="1"
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 text-center outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all ${noSpinners}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-medium text-gray-500">Line total</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-xs font-medium text-gray-500">$</span>
                      <span className="text-base font-semibold text-gray-900">
                        {((editingItem.unitPrice || 0) * (editingItem.quantity || 0)).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

    {/* ── BOTTOM BAR — total + Save + Send ── */}
        <div className="md:relative md:rounded-b-xl sticky bottom-0 z-10 bg-slate-900 border-t border-slate-800">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-[11px] text-slate-500">Total</p>
              <motion.p key={total} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="text-base font-semibold text-white whitespace-nowrap">
                {fmt(total)}
              </motion.p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualSave}
                disabled={!hasProject || quoteData.length === 0 || autosaveStatus === 'saving'}
                title="Save now"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => setShowEmailModal(true)}
                disabled={!hasProject || quoteData.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium transition hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                Send
              </motion.button>
            </div>
          </div>
        </div>

        {/* SENT HISTORY */}
        {outboxLog.length > 0 && (
          <div className="px-4 pb-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5 px-1">
              <Mail className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-400">
                Sent history ({outboxLog.length})
              </span>
            </div>

            <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5">
              {outboxLog.map((entry: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl gap-3 hover:border-slate-200 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-700">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {entry.sent_by_email && (
                        <p className="text-[10px] text-slate-400 truncate">{entry.sent_by_email}</p>
                      )}
                    </div>
                  </div>

                  {entry.html_body && (
                    <button
                      onClick={() => setPreviewHtml(entry.html_body)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-lg text-[10px] font-medium transition-colors"
                    >
                      <Eye className="w-3 h-3" /> Preview
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── AI MODAL ── */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAI(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white w-full sm:max-w-md sm:mx-4 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 leading-tight">AI quote draft</p>
                    <p className="text-[11px] text-gray-400">
                      {leadPhotos.length > 0
                        ? `Description + ${leadPhotos.length} photo${leadPhotos.length > 1 ? 's' : ''}`
                        : 'Using job description'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAI(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
                <AIQuoteGenerator
                  leadDescription={lead?.description || ''}
                  leadCategory={lead?.category || ''}
                  leadInternalNotes={lead?.project_internal_notes || ''}
                  leadPhotos={leadPhotos}
                  onAddItems={handleAddItems}
                  companySlug={companySlug}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PENDING AI ITEMS MODAL ── */}
      <AnimatePresence>
        {pendingAiItems && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-2xl p-7 text-center shadow-2xl"
            >
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sync AI items?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
                You already have{' '}
                <span className="font-medium text-gray-800">{quoteData.length} line item{quoteData.length > 1 ? 's' : ''}</span>.
                Add AI items to existing, or replace everything?
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    const updated = [...quoteData, ...pendingAiItems];
                    setQuoteData(updated);
                    setPendingAiItems(null);
                    setShowAI(false);
                    persistQuote(updated);
                  }}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition"
                >
                  Add to existing
                </button>
                <button
                  onClick={() => {
                    setQuoteData(pendingAiItems);
                    setPendingAiItems(null);
                    setShowAI(false);
                    persistQuote(pendingAiItems);
                  }}
                  className="w-full py-3.5 bg-white border border-slate-200 text-rose-500 rounded-xl font-medium text-sm hover:bg-rose-50 transition"
                >
                  Replace all
                </button>
                <button
                  onClick={() => setPendingAiItems(null)}
                  className="mt-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SendEmailModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSuccess={async () => { await onRefresh(); await fetchOutbox(); }}
        type="quote"
        leadId={lead.id}
        currentUser={currentUser}
        customerName={lead.name}
        customerEmail={lead.email}
        contextLine={quoteData.length > 0 ? fmt(total) : null}
        lastSentAt={outboxLog[0]?.created_at || null}
        lastHtmlBody={lastHtmlBody}
      />

      <style jsx>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </>
  );
}