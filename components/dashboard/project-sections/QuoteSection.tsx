'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  X,
  Mail,
  Loader2,
  Send,
  Sparkles,
  Receipt,
  CheckCircle2,
  Save,
  Eye,
  ArrowRightLeft,
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
  onDirtyChange?: (dirty: boolean) => void;
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
  onDirtyChange,
}: QuoteSectionProps) {
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [quoteData, setQuoteData] = useState<any[]>(lead?.quote_data || []);
  const [taxRate, setTaxRate] = useState<number>(lead?.quote_tax_rate ?? 0);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [pendingAiItems, setPendingAiItems] = useState<any[] | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [outboxLog, setOutboxLog] = useState<any[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [lastHtmlBody, setLastHtmlBody] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [categoryTemplate, setCategoryTemplate] = useState<any | null>(null);
  const [templateBannerDismissed, setTemplateBannerDismissed] = useState(false);

  const newRowRef = useRef<HTMLDivElement | HTMLTableRowElement | null>(null);
  const newRowInputRef = useRef<HTMLInputElement | null>(null);

  // Restrict key presses for numeric fields
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, allowDecimal = true) => {
    if (
      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
        e.key
      ) ||
      (e.ctrlKey || e.metaKey)
    ) {
      return;
    }

    if (allowDecimal && e.key === '.') {
      if (e.currentTarget.value.includes('.')) {
        e.preventDefault();
      }
      return;
    }

    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

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

  // Sync with lead data — only when clean
  useEffect(() => {
    if (isDirty) return;
    setQuoteData(lead?.quote_data || []);
    setTaxRate(lead?.quote_tax_rate ?? 0);
    setTemplateBannerDismissed(false);
  }, [lead?.quote_data, lead?.quote_tax_rate]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

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

  useEffect(() => {
    fetchOutbox();
  }, [lead?.id, companySlug]);

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

  const doSave = async (data: any[], rate: number = taxRate) => {
    setSaving(true);
    const subtotalAmount = data.reduce((s: number, i: any) => s + (i.amount || 0), 0);
    const totalAmount = subtotalAmount + subtotalAmount * (rate / 100);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_quote',
          quote_data: data,
          quote_tax_rate: rate,
          quote_total: totalAmount,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      if (res.ok) {
        toast.success('Quote saved successfully');
        setIsDirty(false);
        await onRefresh();
      } else {
        toast.error('Failed to save quote');
      }
    } catch {
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = () => {
    if (!hasProject) return;
    doSave(quoteData, taxRate);
  };

  const handleLoadTemplate = () => {
    if (!categoryTemplate?.items) return;
    const items = categoryTemplate.items.map((item: any, i: number) => ({ ...item, id: Date.now() + i }));
    setQuoteData(items);
    setTaxRate(categoryTemplate.tax_rate ?? 0);
    setTemplateBannerDismissed(true);
    setIsDirty(true);
    toast.success('Template loaded');
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    const updated = quoteData.map((item: any) => {
      if (item.id !== id) return item;
      const next = { ...item };
      if (field === 'description') {
        next[field] = value;
      } else {
        next[field] = value === '' ? 0 : parseFloat(value) || 0;
      }
      next.amount = parseFloat(String(next.quantity || 0)) * parseFloat(String(next.unitPrice || 0));
      return next;
    });
    setQuoteData(updated);
    setIsDirty(true);
  };

  const handleRemoveRow = (id: number) => {
    const updated = quoteData.filter((item: any) => item.id !== id);
    setQuoteData(updated);
    setIsDirty(true);
  };

  const handleAddRow = () => {
    const newItem = { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 };
    setQuoteData([...quoteData, newItem]);
    setIsDirty(true);
  };

  const handleAddRowMobile = () => {
    const newItem = { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 };
    setQuoteData([...quoteData, newItem]);
    setEditingItem(newItem);
    setIsDirty(true);
  };

  const handleDoneEditing = () => {
    if (!editingItem) return;
    const updated = quoteData.map((item: any) => (item.id === editingItem.id ? editingItem : item));
    setQuoteData(updated);
    setEditingItem(null);
    setIsDirty(true);
  };

  const handleAddItems = (newItems: any[]) => {
    if (quoteData.length > 0) {
      setPendingAiItems(newItems);
    } else {
      setQuoteData(newItems);
      setShowAI(false);
      setIsDirty(true);
    }
  };

  const subtotal = useMemo(() => quoteData.reduce((s: number, i: any) => s + (i.amount || 0), 0), [quoteData]);
  const taxAmount = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
  const total = subtotal + taxAmount;
  const lastAddedId = quoteData.length > 0 ? quoteData[quoteData.length - 1].id : null;

  const quoteAccepted = !!(lead?.project_quote_accepted_at || lead?.quote_accepted_at);
  const quoteSent = !!(lead?.project_quote_sent_at || lead?.quote_sent_at);

  /* Borderless until you touch it — the box appears on hover/focus so the row
     reads as a line of a quote rather than a row of form fields. */
  const cellInput =
    'w-full rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-right text-[15px] font-medium text-gray-900 tabular-nums outline-none transition-colors hover:border-gray-200 hover:bg-gray-50 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100';

  return (
    <>
      {/* ── EMAIL PREVIEW MODAL ── */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ scale: 0.97, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.97, y: 16 }}
              className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Preview</p>
                    <p className="text-sm font-semibold text-gray-900">Client Proposal</p>
                  </div>
                </div>
                <button onClick={() => setPreviewHtml(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-gray-50 p-3">
                <iframe
                  title="Email Preview"
                  srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;cursor:default!important;}</style>`}
                  className="w-full h-full border-0 rounded-xl bg-white shadow-sm"
                  sandbox="allow-same-origin"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTAINER ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        // No overflow-hidden — it silently breaks `sticky` on the totals bar.
        // Corners are rounded on the first and last children instead.
        className="bg-white rounded-2xl border border-gray-200 shadow-sm"
      >
        {/* ── HEADER ── */}
        <div className="px-5 py-4 flex items-center justify-between gap-3 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gray-100 text-gray-600 rounded-xl shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">Quote</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {quoteData.length} item{quoteData.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Status as a chip rather than a line under the title */}
            {quoteAccepted ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200/70 shrink-0">
                <CheckCircle2 className="w-3 h-3" /> Approved
              </span>
            ) : quoteSent ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 border border-blue-200/70 shrink-0">
                <Send className="w-3 h-3" /> Sent
              </span>
            ) : null}
          </div>

          <button
            onClick={() => setShowAI((v) => !v)}
            className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium transition shrink-0 ${
              showAI
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI draft
          </button>
        </div>

        {/* TEMPLATE BANNER */}
        <AnimatePresence>
          {categoryTemplate && quoteData.length === 0 && !templateBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-5 mb-4 flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">
                    Pricing template for {lead?.category || categoryTemplate.category}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {categoryTemplate.items?.length || 0} standard items ready to load
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleLoadTemplate}
                    className="px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition"
                  >
                    Load items
                  </button>
                  <button
                    onClick={() => setTemplateBannerDismissed(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col />
              <col className="w-32" />
              <col className="w-20" />
              <col className="w-32" />
              <col className="w-12" />
            </colgroup>
            <thead>
              <tr className="text-[11px] font-medium uppercase tracking-wider text-gray-400 border-y border-gray-100">
                <th className="text-left px-5 py-2 font-medium">Item</th>
                <th className="text-right px-2 py-2 font-medium">Unit price</th>
                <th className="text-right px-2 py-2 font-medium">Qty</th>
                <th className="text-right px-5 py-2 font-medium">Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {quoteData.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="py-14 flex flex-col items-center justify-center gap-3 text-center">
                      <p className="text-sm text-gray-400">Nothing on this quote yet.</p>
                      <button
                        onClick={handleAddRow}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add first item
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                quoteData.map((item: any) => {
                  const isNew = item.id === lastAddedId && !item.description;
                  return (
                    <tr
                      key={item.id}
                      ref={isNew ? (el) => { newRowRef.current = el; } : undefined}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* The item name is what you read — give it the weight. */}
                      <td className="px-5 py-1">
                        <input
                          ref={isNew ? newRowInputRef : undefined}
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                          placeholder="Describe this line…"
                          className="w-full rounded-lg border border-transparent bg-transparent px-2 py-2 text-[15px] font-semibold text-gray-900 outline-none transition-colors placeholder:font-normal placeholder:text-gray-300 hover:border-gray-200 hover:bg-white focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                      </td>

                      <td className="px-2 py-1">
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                            $
                          </span>
                          <input
                            type="number"
                            step="any"
                            value={item.unitPrice || ''}
                            onKeyDown={(e) => handleNumericKeyDown(e, true)}
                            onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                            placeholder="0.00"
                            className={`${cellInput} pl-6 ${noSpinners}`}
                          />
                        </div>
                      </td>

                      <td className="px-2 py-1">
                        <input
                          type="number"
                          step="any"
                          value={item.quantity || ''}
                          onKeyDown={(e) => handleNumericKeyDown(e, true)}
                          onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                          placeholder="1"
                          className={`${cellInput} text-center ${noSpinners}`}
                        />
                      </td>

                      <td className="px-5 py-1 text-right text-[15px] font-semibold text-gray-900 tabular-nums">
                        {fmt(item.amount || 0)}
                      </td>

                      {/* Visible but quiet, rather than appearing on hover */}
                      <td className="pr-4 py-1 text-right">
                        <button
                          onClick={() => handleRemoveRow(item.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {quoteData.length > 0 && (
            <button
              onClick={handleAddRow}
              className="w-full py-3 flex items-center justify-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-t border-gray-100 transition"
            >
              <Plus className="w-4 h-4" /> Add item
            </button>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden">
          {quoteData.length === 0 ? (
            <button
              onClick={handleAddRowMobile}
              className="w-full py-14 flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-11 h-11 rounded-full bg-gray-900 flex items-center justify-center transition-transform group-active:scale-95">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-[13px] font-medium text-gray-500">Add line item</span>
            </button>
          ) : (
            <div className="px-4 pb-4 flex flex-col gap-2">
              {quoteData.map((item: any) => {
                const isNew = item.id === lastAddedId && !item.description;
                return (
                  <div
                    key={item.id}
                    ref={isNew ? (el) => { newRowRef.current = el; } : undefined}
                    onClick={() => setEditingItem(item)}
                    className="rounded-xl border border-gray-200 bg-white p-4 cursor-pointer active:scale-[0.99] active:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[15px] font-semibold text-gray-900 leading-snug min-w-0">
                        {item.description || <span className="font-normal text-gray-300">No description</span>}
                      </p>
                      <p className="text-[15px] font-semibold text-gray-900 tabular-nums shrink-0">
                        {fmt(item.amount || 0)}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs text-gray-400 tabular-nums">
                        {fmt(item.unitPrice || 0)} × {item.quantity}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveRow(item.id);
                        }}
                        className="p-1.5 -mr-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={handleAddRowMobile}
                className="w-full rounded-xl border border-dashed border-gray-300 py-3 flex items-center justify-center gap-1.5 text-[13px] font-medium text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <Plus className="w-4 h-4" /> Add line item
              </button>
            </div>
          )}
        </div>

        {/* ── BOTTOM SHEET EDITOR (mobile) ── */}
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
                  <p className="text-sm font-semibold text-gray-900">Edit item</p>
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
                      className="px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg transition-colors hover:bg-gray-800"
                    >
                      Done
                    </button>
                  </div>
                </div>

                <div className="px-5 py-4 flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                    <input
                      type="text"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      placeholder="Item name or description…"
                      autoFocus
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-900 placeholder-gray-300 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Unit price</label>
                      <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <span className="text-[15px] text-gray-400">$</span>
                        <input
                          type="number"
                          step="any"
                          value={editingItem.unitPrice || ''}
                          onKeyDown={(e) => handleNumericKeyDown(e, true)}
                          onChange={(e) => {
                            const unitPrice = parseFloat(e.target.value) || 0;
                            setEditingItem({ ...editingItem, unitPrice, amount: unitPrice * (editingItem.quantity || 0) });
                          }}
                          placeholder="0.00"
                          className={`flex-1 bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder-gray-300 tabular-nums ${noSpinners}`}
                        />
                      </div>
                    </div>
                    <div className="w-28">
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Qty</label>
                      <input
                        type="number"
                        step="any"
                        value={editingItem.quantity || ''}
                        onKeyDown={(e) => handleNumericKeyDown(e, true)}
                        onChange={(e) => {
                          const quantity = parseFloat(e.target.value) || 0;
                          setEditingItem({ ...editingItem, quantity, amount: (editingItem.unitPrice || 0) * quantity });
                        }}
                        placeholder="1"
                        className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-medium text-gray-900 text-center tabular-nums outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all ${noSpinners}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-medium text-gray-500">Line total</span>
                    <span className="text-lg font-semibold text-gray-900 tabular-nums">
                      {fmt((editingItem.unitPrice || 0) * (editingItem.quantity || 0))}
                    </span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── TOTALS + ACTIONS ──
             Light instead of near-black: the dark bar paired visually with the
             modal header and made the item list look like a gap between them. */}
        <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-gray-50/95 backdrop-blur-sm md:relative">
          <div className="px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-center gap-5 min-w-0">
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400">Subtotal</p>
                <p className="text-sm font-medium text-gray-600 tabular-nums">{fmt(subtotal)}</p>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-gray-400">Tax</p>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => { setTaxRate(parseFloat(e.target.value) || 0); setIsDirty(true); }}
                    className={`w-12 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-sm font-medium text-gray-900 text-right tabular-nums outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${noSpinners}`}
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

              <div className="min-w-0 pl-5 border-l border-gray-200">
                <p className="text-[11px] text-gray-400">
                  Total
                  {isDirty && <span className="ml-1.5 text-amber-600 font-medium">Unsaved</span>}
                </p>
                <motion.p
                  key={total}
                  initial={{ opacity: 0, y: -3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-semibold text-emerald-600 tabular-nums leading-tight whitespace-nowrap"
                >
                  {fmt(total)}
                </motion.p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleManualSave}
                disabled={!hasProject || quoteData.length === 0 || saving}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 h-10 text-[13px] font-medium rounded-lg transition disabled:opacity-40 ${
                  isDirty
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'text-gray-500 border border-gray-200'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isDirty ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isDirty ? 'Save' : 'Saved'}
              </button>

              <button
                onClick={() => setShowEmailModal(true)}
                disabled={!hasProject || quoteData.length === 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 h-10 rounded-lg border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
              >
                <Mail className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* SENT HISTORY */}
        {outboxLog.length > 0 && (
          <div className="px-5 pb-4 pt-3 border-t border-gray-100 bg-gray-50/60">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Mail className="w-3 h-3 text-gray-400" />
              <span className="text-[11px] text-gray-400">Sent history ({outboxLog.length})</span>
            </div>
            <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5">
              {outboxLog.map((entry: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 bg-white border border-gray-200 rounded-lg gap-3 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-gray-700">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {entry.sent_by_email && (
                        <p className="text-[11px] text-gray-400 truncate">{entry.sent_by_email}</p>
                      )}
                    </div>
                  </div>
                  {entry.html_body && (
                    <button
                      onClick={() => setPreviewHtml(entry.html_body)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg text-[11px] font-medium transition-colors"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          >
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAI(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">AI quote draft</p>
                    <p className="text-[11px] text-gray-400">
                      {leadPhotos.length > 0
                        ? `Description + ${leadPhotos.length} photo${leadPhotos.length > 1 ? 's' : ''}`
                        : 'Using job description'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAI(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                  <X className="w-4 h-4 text-gray-500" />
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-2xl p-7 text-center shadow-2xl"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sync AI items?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed px-2">
                You already have{' '}
                <span className="font-medium text-gray-800">
                  {quoteData.length} line item{quoteData.length > 1 ? 's' : ''}
                </span>
                . Add AI items to existing, or replace everything?
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    const updated = [...quoteData, ...pendingAiItems];
                    setQuoteData(updated);
                    setPendingAiItems(null);
                    setShowAI(false);
                    setIsDirty(true);
                  }}
                  className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium text-sm hover:bg-gray-800 transition"
                >
                  Add to existing
                </button>
                <button
                  onClick={() => {
                    setQuoteData(pendingAiItems);
                    setPendingAiItems(null);
                    setShowAI(false);
                    setIsDirty(true);
                  }}
                  className="w-full py-3.5 bg-white border border-gray-200 text-rose-600 rounded-xl font-medium text-sm hover:bg-rose-50 transition"
                >
                  Replace all
                </button>
                <button
                  onClick={() => setPendingAiItems(null)}
                  className="mt-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EMAIL COMPOSER MODAL ── */}
      {showEmailModal && (
        <SendEmailModal
          open={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSuccess={async () => {
            setShowEmailModal(false);
            await onRefresh();
            await fetchOutbox();
          }}
          type="quote"
          leadId={lead.id}
          currentUser={currentUser}
          customerName={lead.name}
          customerEmail={lead.email}
          contextLine={quoteData.length > 0 ? fmt(total) : null}
          lastSentAt={outboxLog[0]?.created_at || null}
          lastHtmlBody={lastHtmlBody}
        />
      )}

      <style jsx>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </>
  );
}