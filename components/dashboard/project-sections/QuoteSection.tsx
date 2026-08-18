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
  CheckCircle2,
  Save,
  Eye,
  XCircle,
  ArrowRightLeft,
  DollarSign,
  Percent,
  FileText,
  Info,
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
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [markingAccepted, setMarkingAccepted] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [taxRateDraft, setTaxRateDraft] = useState('');

  const newRowRef = useRef<HTMLDivElement | null>(null);
  const newRowInputRef = useRef<HTMLInputElement | null>(null);

  // Keypress restriction for numeric fields
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
  }, [lead?.quote_data, lead?.quote_tax_rate, isDirty]);

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

  const handleMarkAccepted = async () => {
    setMarkingAccepted(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'mark_quote_accepted',
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Quote marked as accepted');
        setShowAcceptConfirm(false);
        await onRefresh();
      } else {
        toast.error(data.error || 'Could not update the quote');
      }
    } catch {
      toast.error('Could not update the quote');
    } finally {
      setMarkingAccepted(false);
    }
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
    setQuoteData((prev) => prev.filter((item: any) => item.id !== id));
    setIsDirty(true);
  };

  const handleAddRow = () => {
    const newItem = { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 };
    setQuoteData((prev) => [...prev, newItem]);
    setIsDirty(true);
  };

  const handleAddRowMobile = () => {
    const newItem = { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 };
    setQuoteData((prev) => [...prev, newItem]);
    setEditingItem(newItem);
    setIsDirty(true);
  };

  const handleDoneEditing = () => {
    if (!editingItem) return;
    setQuoteData((prev) =>
      prev.map((item: any) => (item.id === editingItem.id ? { ...editingItem } : item))
    );
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

  const depositType = (lead?.deposit_type || null) as 'percent' | 'fixed' | null;
  const depositValue = parseFloat(lead?.deposit_value || '0');
  const depositAmount =
    depositType && depositValue > 0 && total > 0
      ? Math.min(
          Math.round((depositType === 'percent' ? (total * depositValue) / 100 : depositValue) * 100) / 100,
          total
        )
      : 0;

  const quoteAccepted = !!(lead?.project_quote_accepted_at || lead?.quote_accepted_at);
  const quoteDeclined = !!(lead?.project_quote_declined_at || lead?.quote_declined_at);
  const quoteSent = !!(lead?.project_quote_sent_at || lead?.quote_sent_at);
  const acceptedAt = lead?.project_quote_accepted_at || lead?.quote_accepted_at;
  const declinedAt = lead?.project_quote_declined_at || lead?.quote_declined_at;
  const sentAt = lead?.project_quote_sent_at || lead?.quote_sent_at;

  const dateOnly = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const quoteState = quoteDeclined
    ? { label: `Declined (${declinedAt ? dateOnly(declinedAt) : ''})`, cls: 'bg-rose-50 text-rose-700 border-rose-200' }
    : quoteAccepted
    ? { label: `Approved (${acceptedAt ? dateOnly(acceptedAt) : ''})`, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    : quoteSent
    ? { label: `Sent (${sentAt ? dateOnly(sentAt) : ''})`, cls: 'bg-blue-50 text-blue-700 border-blue-200' }
    : { label: 'Draft', cls: 'bg-slate-100 text-slate-600 border-slate-200' };

  return (
    <>
      {/* EMAIL PREVIEW MODAL */}
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
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Proposal Email Preview</p>
                    <p className="text-sm font-semibold text-slate-900">{lead?.name || 'Customer'}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewHtml(null)} className="p-1.5 hover:bg-slate-200 rounded-lg transition cursor-pointer">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-100 p-3">
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

      {/* MAIN CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
      >
        {/* HEADER BAR */}
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-slate-50/50">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 leading-tight">Quote</h3>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${quoteState.cls}`}>
                {quoteState.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {quoteData.length} line item{quoteData.length === 1 ? '' : 's'}
              {isDirty && <span className="ml-2 text-amber-600 font-semibold">• Unsaved changes</span>}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total</p>
            <p className="text-2xl font-bold text-slate-900 tabular-nums leading-tight">{fmt(total)}</p>
          </div>
        </div>

        {/* TEMPLATE BANNER */}
        <AnimatePresence>
          {categoryTemplate && quoteData.length === 0 && !templateBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-indigo-100 bg-indigo-50/60"
            >
              <div className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-indigo-950 truncate">
                      Preset Pricing Template for {lead?.category || categoryTemplate.category}
                    </p>
                    <p className="text-xs text-indigo-700 mt-0.5">
                      Contains {categoryTemplate.items?.length || 0} standard line items with default pricing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleLoadTemplate}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition cursor-pointer shadow-xs"
                  >
                    Load Items
                  </button>
                  <button
                    onClick={() => setTemplateBannerDismissed(true)}
                    className="p-1.5 text-indigo-400 hover:text-indigo-600 transition"
                    aria-label="Dismiss template banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN BODY GRID */}
        <div className="p-5 lg:p-7 grid gap-6 lg:gap-8 lg:grid-cols-[1fr_300px] items-start">
          
          {/* LEFT: TABLE & LINE ITEMS */}
          <div className="space-y-4 min-w-0">
            {/* Desktop Table */}
            <div className="hidden md:block space-y-2">
              {quoteData.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white py-12 px-4 text-center">
                  <p className="text-sm font-semibold text-slate-700">No line items in quote</p>
                  <p className="text-xs text-slate-400 mt-1">Add items manually below or generate a draft using AI.</p>
                </div>
              ) : (
                quoteData.map((item: any) => {
                  const isNew = item.id === lastAddedId && !item.description;
                  return (
                    <div
                      key={item.id}
                      ref={isNew ? (el) => { newRowRef.current = el; } : undefined}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition-colors group"
                    >
                      {/* Top: full-width description — never shares a row with
                          anything but the delete button, so it can never be
                          squeezed by fixed-width siblings the way a single-row
                          table layout forces it to be. */}
                      <div className="flex items-center gap-2">
                        <input
                          ref={isNew ? newRowInputRef : undefined}
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                          placeholder="Describe line item or service..."
                          className="flex-1 min-w-0 px-1 py-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-300"
                        />
                        <button
                          onClick={() => handleRemoveRow(item.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                          title="Delete row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Bottom: price / qty / amount — small, natural widths,
                          never asked to share space with description. */}
                      <div className="flex items-center gap-6 pt-2 mt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-slate-400">
                            <span className="text-xs text-slate-400 font-medium">$</span>
                            <input
                              type="number"
                              step="any"
                              value={item.unitPrice || ''}
                              onKeyDown={(e) => handleNumericKeyDown(e, true)}
                              onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                              placeholder="0.00"
                              className={`w-16 bg-transparent text-sm font-semibold text-slate-900 outline-none tabular-nums ${noSpinners}`}
                            />
                          </div>
                          <span className="text-xs text-slate-300 font-bold">×</span>
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-slate-400">
                            <input
                              type="number"
                              step="any"
                              value={item.quantity || ''}
                              onKeyDown={(e) => handleNumericKeyDown(e, true)}
                              onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                              placeholder="1"
                              className={`w-8 bg-transparent text-sm font-semibold text-slate-900 outline-none text-center tabular-nums ${noSpinners}`}
                            />
                          </div>
                        </div>

                        <span className="text-sm font-bold text-slate-900 tabular-nums shrink-0">
                          {fmt(item.amount || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Add Row + AI Toolbar */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleAddRow}
                className="flex-1 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50/80 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-500" />
                Add Line Item
              </button>
              <button
                onClick={() => setShowAI((v) => !v)}
                className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  showAI
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                AI Draft Generator
              </button>
            </div>

            {/* Mobile View: Clean Touch Cards */}
            <div className="md:hidden space-y-2.5">
              {quoteData.length === 0 ? (
                <>
                  <button
                    onClick={handleAddRowMobile}
                    className="w-full py-10 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 active:bg-slate-50 transition cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">Tap to add first line item</span>
                  </button>
                  <button
                    onClick={() => setShowAI(true)}
                    className="w-full py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 active:scale-[0.99] transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Or generate with AI
                  </button>
                </>
              ) : (
                <>
                  {quoteData.map((item: any) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => setEditingItem({ ...item })}
                          className="flex-1 text-left min-w-0"
                        >
                          <p className="text-sm font-semibold text-slate-900 leading-snug">
                            {item.description || <span className="font-normal italic text-slate-400">No description</span>}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 font-medium tabular-nums">
                            {fmt(item.unitPrice || 0)} × {item.quantity || 1}
                          </p>
                        </button>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-slate-900 tabular-nums">
                            {fmt(item.amount || 0)}
                          </p>
                          <button
                            onClick={() => handleRemoveRow(item.id)}
                            className="mt-1 p-1 text-slate-300 hover:text-rose-500 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddRowMobile}
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold active:scale-[0.99] transition"
                    >
                      <Plus className="w-4 h-4" /> Add Line Item
                    </button>
                    <button
                      onClick={() => setShowAI(true)}
                      className="shrink-0 px-3.5 py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 active:scale-[0.99] transition"
                      aria-label="AI Draft Generator"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: SUMMARY, TAX, DEPOSIT & ACTIONS */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 lg:p-6 space-y-4 lg:sticky lg:top-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quote Summary</p>

            {/* BREAKDOWN SECTION */}
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900 tabular-nums">{fmt(subtotal)}</span>
              </div>

              {/* Deposit Card */}
              {depositAmount > 0 ? (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                      Deposit Due ({depositType === 'percent' ? `${depositValue}%` : 'Fixed'})
                    </span>
                    <span className="text-base font-extrabold text-indigo-950 tabular-nums">{fmt(depositAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-indigo-200/70 text-xs font-semibold text-slate-600">
                    <span>Balance due later</span>
                    <span className="text-slate-900 tabular-nums">{fmt(total - depositAmount)}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Deposit</span>
                  <span className="text-slate-400">Not set</span>
                </div>
              )}

              {/* Explicit Tax Control — pill when set, click to edit */}
              {editingTaxRate ? (
                <div className="p-3 bg-white border-2 border-slate-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor="taxRateInput" className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 text-slate-400" />
                      Tax Rate (%)
                    </label>
                    <span className="text-slate-900 tabular-nums">
                      +{fmt(subtotal * ((parseFloat(taxRateDraft) || 0) / 100))}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      {/* type="text" deliberately, not "number" — number inputs
                          have real browser/OS precision quirks; text inputs
                          hold exactly what's typed, nothing more. */}
                      <input
                        id="taxRateInput"
                        type="text"
                        inputMode="decimal"
                        value={taxRateDraft}
                        onKeyDown={(e) => handleNumericKeyDown(e, true)}
                        onChange={(e) => setTaxRateDraft(e.target.value)}
                        placeholder="0"
                        autoFocus
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 tabular-nums"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <button
                      onClick={() => {
                        const parsed = parseFloat(taxRateDraft);
                        setTaxRate(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                        setIsDirty(true);
                        setEditingTaxRate(false);
                      }}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer shrink-0"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setTaxRateDraft(taxRate ? String(taxRate) : '');
                    setEditingTaxRate(true);
                  }}
                  className="w-full p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Percent className="w-3.5 h-3.5 text-slate-400" />
                    {taxRate > 0 ? `Tax Rate — ${taxRate}%` : 'Tax Rate'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    {taxRate > 0 ? `+${fmt(taxAmount)}` : 'None set'}
                  </span>
                </button>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-2 pt-2 border-t border-slate-200/80">
              <button
                onClick={handleManualSave}
                disabled={!hasProject || quoteData.length === 0 || saving}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDirty
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isDirty ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {isDirty ? 'Save Changes' : 'Saved'}
              </button>

              <button
                onClick={() => setShowEmailModal(true)}
                disabled={!hasProject || quoteData.length === 0}
                className="w-full py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                Send Proposal to Customer
              </button>

              {!quoteAccepted && quoteData.length > 0 && (
                <button
                  onClick={() => setShowAcceptConfirm(true)}
                  className="w-full py-2 px-4 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Accepted Manually
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SHEET ITEM EDITOR (Mobile) */}
        <AnimatePresence>
          {editingItem && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingItem(null)}
                className="fixed inset-0 z-[400] bg-slate-900/60 backdrop-blur-xs md:hidden"
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl md:hidden shadow-2xl border-t border-slate-200"
                style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
              >
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-slate-200" />
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-900">Edit Line Item</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (!editingItem.description && !editingItem.unitPrice) {
                          handleRemoveRow(editingItem.id);
                        }
                        setEditingItem(null);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDoneEditing}
                      className="px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg transition"
                    >
                      Save
                    </button>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editingItem.description}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      placeholder="Item or service name..."
                      autoFocus
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Unit Price
                      </label>
                      <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 focus-within:bg-white">
                        <span className="text-xs font-semibold text-slate-400">$</span>
                        <input
                          type="number"
                          step="any"
                          value={editingItem.unitPrice || ''}
                          onKeyDown={(e) => handleNumericKeyDown(e, true)}
                          onChange={(e) => {
                            const unitPrice = parseFloat(e.target.value) || 0;
                            setEditingItem({
                              ...editingItem,
                              unitPrice,
                              amount: unitPrice * (editingItem.quantity || 0),
                            });
                          }}
                          placeholder="0.00"
                          className={`w-full bg-transparent text-sm font-bold text-slate-900 outline-none tabular-nums ${noSpinners}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={editingItem.quantity || ''}
                        onKeyDown={(e) => handleNumericKeyDown(e, true)}
                        onChange={(e) => {
                          const quantity = parseFloat(e.target.value) || 0;
                          setEditingItem({
                            ...editingItem,
                            quantity,
                            amount: (editingItem.unitPrice || 0) * quantity,
                          });
                        }}
                        placeholder="1"
                        className={`w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 text-center outline-none focus:border-slate-400 focus:bg-white tabular-nums ${noSpinners}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-100/70 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Line Total</span>
                    <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      {fmt((editingItem.unitPrice || 0) * (editingItem.quantity || 0))}
                    </span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* SENT OUTBOX LOG */}
        {outboxLog.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Proposal Email History ({outboxLog.length})</span>
            </div>
            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1">
              {outboxLog.map((entry: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {entry.sent_by_email && (
                        <p className="text-[11px] text-slate-400 truncate">{entry.sent_by_email}</p>
                      )}
                    </div>
                  </div>
                  {entry.html_body && (
                    <button
                      onClick={() => setPreviewHtml(entry.html_body)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> Preview
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* AI GENERATOR MODAL */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          >
            <motion.div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAI(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative bg-white w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-slate-200" />
              </div>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">AI Quote Draft</p>
                    <p className="text-[11px] text-slate-400">
                      {leadPhotos.length > 0
                        ? `Analysing description + ${leadPhotos.length} photo${leadPhotos.length > 1 ? 's' : ''}`
                        : 'Generating estimate from job details'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAI(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer">
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

      {/* PENDING AI ITEMS CONFIRMATION MODAL */}
      <AnimatePresence>
        {pendingAiItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Merge AI Draft?</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed px-2">
                You already have{' '}
                <span className="font-semibold text-slate-800">
                  {quoteData.length} item{quoteData.length > 1 ? 's' : ''}
                </span>
                . Would you like to append the new AI items or replace your existing list?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setQuoteData((prev) => [...prev, ...pendingAiItems]);
                    setPendingAiItems(null);
                    setShowAI(false);
                    setIsDirty(true);
                  }}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs"
                >
                  Append to existing items
                </button>
                <button
                  onClick={() => {
                    setQuoteData(pendingAiItems);
                    setPendingAiItems(null);
                    setShowAI(false);
                    setIsDirty(true);
                  }}
                  className="w-full py-3 bg-white border border-slate-200 text-rose-600 rounded-xl font-semibold text-xs hover:bg-rose-50 transition cursor-pointer"
                >
                  Replace all current items
                </button>
                <button
                  onClick={() => setPendingAiItems(null)}
                  className="mt-1 text-xs font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer py-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EMAIL COMPOSER MODAL */}
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

      {/* MANUAL ACCEPT CONFIRM MODAL */}
      <AnimatePresence>
        {showAcceptConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => !markingAccepted && setShowAcceptConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Mark quote as accepted?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                This manually records approval for {lead?.name?.split(' ')[0] || 'the client'} (e.g. verbally over phone or in-person).
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowAcceptConfirm(false)}
                  disabled={markingAccepted}
                  className="py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkAccepted}
                  disabled={markingAccepted}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {markingAccepted ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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