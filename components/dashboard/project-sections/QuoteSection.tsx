'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  X,
  Mail,
  Loader2,
  Sparkles,
  CheckCircle2,
  Save,
  Eye,
  ArrowRightLeft,
  Pencil,
  FileText,
  Lock,
  ChevronDown,
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
  const [allTemplates, setAllTemplates] = useState<any[]>([]);
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [templateBannerDismissed, setTemplateBannerDismissed] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [markingAccepted, setMarkingAccepted] = useState(false);
    const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [taxRateDraft, setTaxRateDraft] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showLineItems, setShowLineItems] = useState(false);

  // ── DEPOSIT TERMS ── (same save_deposit_terms action BillingSection uses)
  const [showDepositEditor, setShowDepositEditor] = useState(false);
  const [depositTypeDraft, setDepositTypeDraft] = useState<'percent' | 'fixed'>('percent');
  const [depositValueDraft, setDepositValueDraft] = useState('');
  const [savingDeposit, setSavingDeposit] = useState(false);

  const newRowRef = useRef<HTMLTableRowElement | null>(null);
  const newRowInputRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

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
      if (e.currentTarget.value.includes('.')) e.preventDefault();
      return;
    }
    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
  };

  useEffect(() => {
    if (!companySlug) return;
    fetch(`/api/company/${companySlug}/quote-templates`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const templates = data.templates || [];
          setAllTemplates(templates);
          const match = lead?.category
            ? templates.find((t: any) => t.category === lead.category)
            : null;
          setCategoryTemplate(match || null);
        }
      })
      .catch(() => {});
  }, [lead?.category, companySlug]);

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
        await onRefresh();
        setIsDirty(false);
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

  // Same lock rule as BillingSection: once money's moved, deposit terms
  // (and tax rate) describe what the customer already agreed to and paid
  // against — changing them after the fact would silently rewrite that.
  const paidAmount = parseFloat(lead?.payment_amount || '0');
  const depositLocked = paidAmount > 0;
  const taxLocked = paidAmount > 0;

  const openDepositEditor = () => {
    if (!hasProject) {
      toast.error('Convert to project first');
      return;
    }
    setDepositTypeDraft((lead?.deposit_type as 'percent' | 'fixed') || 'percent');
    setDepositValueDraft(lead?.deposit_value ? String(lead.deposit_value) : '');
    setShowDepositEditor(true);
  };

  const handleSaveDepositTerms = async (clear = false) => {
    setSavingDeposit(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_deposit_terms',
          deposit_type: clear ? null : depositTypeDraft,
          deposit_value: clear ? null : parseFloat(depositValueDraft || '0'),
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success(clear ? 'Deposit removed' : 'Deposit saved');
        setShowDepositEditor(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Could not save deposit');
      }
    } catch {
      toast.error('Could not save deposit');
    } finally {
      setSavingDeposit(false);
    }
  };

  const [pendingTemplate, setPendingTemplate] = useState<any | null>(null);

  const loadTemplateNow = (template: any) => {
    if (!template?.items) return;
    const items = template.items.map((item: any, i: number) => ({ ...item, id: Date.now() + i }));
    setQuoteData(items);
    setTaxRate(template.tax_rate ?? 0);
    setTemplateBannerDismissed(true);
    setIsDirty(true);
    setShowTemplateBrowser(false);
    setPendingTemplate(null);
    toast.success('Template loaded');
  };

  const applyTemplate = (template: any) => {
    if (!template?.items) return;
    if (quoteData.length > 0) {
      setPendingTemplate(template);
      return;
    }
    loadTemplateNow(template);
  };

  const handleLoadTemplate = () => applyTemplate(categoryTemplate);

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

  const requestRemoveRow = (id: number) => {
    const item = quoteData.find((i: any) => i.id === id);
    // Skip the confirmation for a still-blank row someone just added.
    if (item && !item.description && !item.unitPrice) {
      handleRemoveRow(id);
      return;
    }
    setDeleteConfirmId(id);
  };

  const confirmRemoveRow = () => {
    if (deleteConfirmId !== null) {
      handleRemoveRow(deleteConfirmId);
      setDeleteConfirmId(null);
    }
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
    const unitPrice = parseFloat(String(editingItem.unitPrice)) || 0;
    const quantity = parseFloat(String(editingItem.quantity)) || 0;
    const finalized = { ...editingItem, unitPrice, quantity, amount: unitPrice * quantity };
    setQuoteData((prev) =>
      prev.map((item: any) => (item.id === finalized.id ? finalized : item))
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
                    <p className="text-xs text-slate-400 font-medium">Estimate Email Preview</p>
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
               {/* TOP ACTION BAR — Quote label left, Save + Send right, mobile-wrapping */}
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900">Quote</h3>
          <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleManualSave}
            disabled={!hasProject || quoteData.length === 0 || saving}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDirty
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isDirty ? (
              <Save className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            )}
            {isDirty ? 'Save Changes' : 'Saved'}
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            disabled={!hasProject || quoteData.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-700 hover:bg-brand-800 rounded-lg text-xs font-bold text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Mail className="w-3.5 h-3.5" />
            {outboxLog.length > 0 ? 'Resend Estimate' : 'Send Estimate'}
          </button>
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
        <div className="p-4 sm:p-5 lg:p-6 grid gap-5 lg:gap-6 lg:grid-cols-[1fr_240px] items-start">

          {/* LEFT: TABLE & LINE ITEMS */}
          <div className="space-y-3 min-w-0">
            {/* Desktop — real table, one header row, full column labels */}
            <div className="hidden md:block rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left font-semibold text-slate-500 text-xs uppercase tracking-wide px-4 py-2 w-auto">
                      Description
                    </th>
                    <th className="text-right font-semibold text-slate-500 text-[10px] uppercase tracking-wide px-2 py-2 w-20">
                      Price
                    </th>
                    <th className="text-center font-semibold text-slate-500 text-[10px] uppercase tracking-wide px-2 py-2 w-12">
                      Qty
                    </th>
                    <th className="text-right font-semibold text-slate-500 text-[10px] uppercase tracking-wide px-3 py-2 w-20">
                      Amount
                    </th>
                    <th className="w-9 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {quoteData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 px-4 text-center">
                        <p className="text-sm font-semibold text-slate-700">No line items in quote</p>
                        <p className="text-xs text-slate-400 mt-1">Add items manually below or generate a draft using AI. Need templates for different service types? Set them up on the home page.</p>
                      </td>
                    </tr>
                  ) : (
                    quoteData.map((item: any) => {
                      const isNew = item.id === lastAddedId && !item.description;
                      return (
                        <tr
                          key={item.id}
                          ref={isNew ? (el) => { newRowRef.current = el; } : undefined}
                          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 group"
                        >
                          <td className="px-4 py-1.5 align-middle">
                            <textarea
                              ref={(el) => {
                                if (isNew) newRowInputRef.current = el;
                                autoResizeTextarea(el);
                              }}
                              rows={1}
                              value={item.description}
                              onChange={(e) => {
                                handleUpdateCell(item.id, 'description', e.target.value);
                                autoResizeTextarea(e.target);
                              }}
                              placeholder="Describe line item or service..."
                              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-300 resize-none overflow-hidden leading-snug block py-0.5"
                            />
                          </td>
                          <td className="px-2 py-1.5">
                            <div className="flex items-center justify-end gap-0.5">
                              <span className="text-xs text-slate-400">$</span>
                              <input
                                type="number"
                                step="any"
                                value={item.unitPrice || ''}
                                onKeyDown={(e) => handleNumericKeyDown(e, true)}
                                onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                                placeholder="0.00"
                                className={`w-14 bg-transparent text-sm text-slate-900 outline-none text-right tabular-nums ${noSpinners}`}
                              />
                            </div>
                          </td>
                          <td className="px-2 py-1.5">
                            <input
                              type="number"
                              step="any"
                              value={item.quantity || ''}
                              onKeyDown={(e) => handleNumericKeyDown(e, true)}
                              onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                              placeholder="1"
                              className={`w-full bg-transparent text-sm text-slate-900 outline-none text-center tabular-nums ${noSpinners}`}
                            />
                          </td>
                          <td className="px-3 py-1.5 text-right">
                            <span className="text-sm font-semibold text-slate-900 tabular-nums">
                              {fmt(item.amount || 0)}
                            </span>
                          </td>
                          <td className="px-2 py-1.5">
                            <button
                              onClick={() => requestRemoveRow(item.id)}
                              className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer opacity-0 group-hover:opacity-100"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
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
              {allTemplates.length > 0 && (
                <button
                  onClick={() => setShowTemplateBrowser(true)}
                  className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Browse Templates
                </button>
              )}
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
                  {allTemplates.length > 0 && (
                    <button
                      onClick={() => setShowTemplateBrowser(true)}
                      className="w-full py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 active:scale-[0.99] transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      Browse Templates
                    </button>
                  )}
                </>
                          ) : (
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowLineItems((v) => !v)}
                    className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="text-sm font-bold text-slate-700">
                      Line Items ({quoteData.length})
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${showLineItems ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence>
                    {showLineItems && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 space-y-2.5 border-t border-slate-100">
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
                                    onClick={() => requestRemoveRow(item.id)}
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
                            {allTemplates.length > 0 && (
                              <button
                                onClick={() => setShowTemplateBrowser(true)}
                                className="shrink-0 px-3.5 py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-700 active:scale-[0.99] transition"
                                aria-label="Browse Templates"
                              >
                                <FileText className="w-4 h-4 text-indigo-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

                     {/* RIGHT: SUMMARY — plain table, no color, subtotal/deposit/tax/total */}
          <div className="border border-slate-200 rounded-xl overflow-hidden lg:sticky lg:top-4">
            <table className="w-full text-sm border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-600">Subtotal</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900 tabular-nums">
                    {fmt(subtotal)}
                  </td>
                </tr>

                               <tr className="border-b border-slate-100 group">
                  <td className="px-4 py-2.5 text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      Deposit{depositAmount > 0 ? ` (${depositType === 'percent' ? `${depositValue}%` : 'Fixed'})` : ''}
                      {depositLocked ? (
                                                  depositAmount > 0 && (
                                                       <span
                              title="Locked — a payment has already been collected against these terms. Refund it in Billing to make changes."
                              className="p-0.5 inline-flex"
                            >
                              <Lock className="w-3 h-3 text-slate-300" />
                            </span>
                          )
                      ) : (
                        <button
                          onClick={openDepositEditor}
                          className="p-0.5 text-slate-300 hover:text-slate-600 rounded transition cursor-pointer opacity-70 group-hover:opacity-100"
                          title={depositAmount > 0 ? 'Edit deposit terms' : 'Require a deposit'}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900 tabular-nums">
                    {depositAmount > 0 ? fmt(depositAmount) : '—'}
                  </td>
                </tr>

                               <tr className="border-b border-slate-100 group">
                  <td className="px-4 py-2.5 text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      Tax{taxRate > 0 ? ` (${taxRate}%)` : ''}
                      {taxLocked ? (
                                                <span
                          title="Locked — a payment has already been collected against these terms. Refund it in Billing to make changes."
                          className="p-0.5 inline-flex"
                        >
                          <Lock className="w-3 h-3 text-slate-300" />
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setTaxRateDraft(taxRate ? String(taxRate) : '');
                            setEditingTaxRate(true);
                          }}
                          className="p-0.5 text-slate-300 hover:text-slate-600 rounded transition cursor-pointer opacity-70 group-hover:opacity-100"
                          title="Edit tax rate"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-slate-900 tabular-nums">
                    {taxRate > 0 ? fmt(taxAmount) : '—'}
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">Total</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                    {fmt(total)}
                  </td>
                </tr>
              </tbody>
            </table>

            {!quoteAccepted && quoteData.length > 0 && (
              <div className="px-4 py-2.5 border-t border-slate-100">
                <button
                  onClick={() => setShowAcceptConfirm(true)}
                  className="w-full py-2 px-3 bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Accepted Manually
                </button>
              </div>
            )}
          </div>
        </div>

               {/* MOBILE BOTTOM ACTION — plain, in-flow, not sticky. Was a fixed
            floating bar; swapped per feedback: permanent floating UI eats
            screen space and risks accidental taps. Just a second copy of
            the top action, reachable after scrolling the quote. */}
        {!editingItem && (isDirty || quoteData.length > 0) && (
          <div className="md:hidden px-4 sm:px-5 pb-5">
            {isDirty ? (
              <button
                onClick={handleManualSave}
                disabled={!hasProject || quoteData.length === 0 || saving}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <button
                onClick={() => setShowEmailModal(true)}
                disabled={!hasProject}
                className="w-full py-3 bg-brand-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                {outboxLog.length > 0 ? 'Resend Estimate' : 'Send Estimate'}
              </button>
            )}
          </div>
        )}

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
                    <textarea
                      ref={(el) => autoResizeTextarea(el)}
                      rows={1}
                      value={editingItem.description}
                      onChange={(e) => {
                        setEditingItem({ ...editingItem, description: e.target.value });
                        autoResizeTextarea(e.target);
                      }}
                                           placeholder="Item or service name..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 outline-none focus:border-slate-400 focus:bg-white resize-none overflow-hidden leading-snug"
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
                          type="text"
                          inputMode="decimal"
                                                   value={editingItem.unitPrice ?? ''}
                          onKeyDown={(e) => handleNumericKeyDown(e, true)}
                          onChange={(e) => {
                            // Keep the raw typed string, not a parsed number —
                            // parseFloat("30.") === 30, and storing that number
                            // silently strips the trailing "." the user just typed.
                            const raw = e.target.value;
                            const parsedPrice = parseFloat(raw) || 0;
                            const parsedQty = parseFloat(String(editingItem.quantity)) || 0;
                            setEditingItem({
                              ...editingItem,
                              unitPrice: raw,
                              amount: parsedPrice * parsedQty,
                            });
                          }}
                          placeholder="0.00"
                          className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Quantity
                      </label>
                                           <input
                        type="text"
                        inputMode="decimal"
                                               value={editingItem.quantity ?? ''}
                        onKeyDown={(e) => handleNumericKeyDown(e, true)}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const parsedQty = parseFloat(raw) || 0;
                          const parsedPrice = parseFloat(String(editingItem.unitPrice)) || 0;
                          setEditingItem({
                            ...editingItem,
                            quantity: raw,
                            amount: parsedPrice * parsedQty,
                          });
                        }}
                        placeholder="1"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 text-center outline-none focus:border-slate-400 focus:bg-white tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-100/70 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Line Total</span>
                                        <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      {fmt((parseFloat(String(editingItem.unitPrice)) || 0) * (parseFloat(String(editingItem.quantity)) || 0))}
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
              <span className="text-xs font-semibold text-slate-500">Estimate Email History ({outboxLog.length})</span>
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

      {/* TEMPLATE BROWSER MODAL */}
      <AnimatePresence>
        {showTemplateBrowser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setShowTemplateBrowser(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative bg-white w-full sm:max-w-md sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '80vh' }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-slate-200" />
              </div>
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-tight">Quote Templates</p>
                </div>
                <button
                  onClick={() => setShowTemplateBrowser(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {allTemplates.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No templates set up yet.</p>
                ) : (
                  allTemplates.map((template: any, i: number) => (
                    <button
                      key={template.id ?? i}
                      onClick={() => applyTemplate(template)}
                      className="w-full text-left p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {template.category || 'Untitled Template'}
                        </p>
                        {template.category === lead?.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Matches this lead
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {template.items?.length || 0} line item{(template.items?.length || 0) === 1 ? '' : 's'}
                        {template.tax_rate ? ` · ${template.tax_rate}% tax` : ''}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PENDING TEMPLATE CONFIRMATION MODAL */}
      <AnimatePresence>
        {pendingTemplate && (
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
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Apply "{pendingTemplate.category}" template?</h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed px-2">
                You already have{' '}
                <span className="font-semibold text-slate-800">
                  {quoteData.length} item{quoteData.length > 1 ? 's' : ''}
                </span>
                . Append the template's items, or replace your current list (and its tax rate)?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    const items = (pendingTemplate.items || []).map((item: any, i: number) => ({
                      ...item,
                      id: Date.now() + i,
                    }));
                    setQuoteData((prev) => [...prev, ...items]);
                    setPendingTemplate(null);
                    setShowTemplateBrowser(false);
                    setIsDirty(true);
                    toast.success('Template items added');
                  }}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-semibold text-xs hover:bg-slate-800 transition cursor-pointer shadow-xs"
                >
                  Append to existing items
                </button>
                <button
                  onClick={() => loadTemplateNow(pendingTemplate)}
                  className="w-full py-3 bg-white border border-slate-200 text-rose-600 rounded-xl font-semibold text-xs hover:bg-rose-50 transition cursor-pointer"
                >
                  Replace all current items
                </button>
                <button
                  onClick={() => setPendingTemplate(null)}
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

      {/* DELETE LINE ITEM CONFIRM MODAL */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Delete this line item?</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                This removes it from the quote. You'll need to re-add it if this was a mistake.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveRow}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
           </AnimatePresence>

      {/* DEPOSIT TERMS MODAL */}
      <AnimatePresence>
        {showDepositEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !savingDeposit && setShowDepositEditor(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {depositAmount > 0 ? 'Edit Deposit Terms' : 'Require a Deposit?'}
                </h3>
                <button
                  type="button"
                  onClick={() => !savingDeposit && setShowDepositEditor(false)}
                  disabled={savingDeposit}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <p className="text-xs font-medium text-slate-600">
                  {depositAmount > 0 ? 'Change the deposit amount' : 'How much is the deposit?'}
                </p>
                <div className="flex items-center gap-2">
                  <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 shrink-0">
                    {(['percent', 'fixed'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setDepositTypeDraft(t)}
                        className={`px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          depositTypeDraft === t
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t === 'percent' ? '%' : '$'}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={depositValueDraft}
                    onChange={(e) => setDepositValueDraft(e.target.value)}
                    placeholder={depositTypeDraft === 'percent' ? '25' : '500'}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold tabular-nums outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDepositEditor(false)}
                  disabled={savingDeposit}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                {depositAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSaveDepositTerms(true)}
                    disabled={savingDeposit}
                    className="px-3 py-2 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
                  >
                    Remove deposit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveDepositTerms(false)}
                  disabled={savingDeposit || !depositValueDraft}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {savingDeposit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {savingDeposit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

           {/* TAX RATE MODAL — mirrors the Deposit modal above. Previously this
          was an inline table row, which worked on desktop but was
          invisible on mobile once that table became hidden lg:block —
          the mobile accordion's edit trigger had nothing to open. */}
      <AnimatePresence>
        {editingTaxRate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setEditingTaxRate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">
                  {taxRate > 0 ? 'Edit Tax Rate' : 'Add Tax'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingTaxRate(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <p className="text-xs font-medium text-slate-600">Tax rate for this quote</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={taxRateDraft}
                    onKeyDown={(e) => handleNumericKeyDown(e, true)}
                    onChange={(e) => setTaxRateDraft(e.target.value)}
                    placeholder="8.625"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold tabular-nums outline-none focus:border-slate-400"
                  />
                  <span className="text-sm font-semibold text-slate-500 shrink-0">%</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTaxRate(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseFloat(taxRateDraft);
                    setTaxRate(isNaN(parsed) || parsed < 0 ? 0 : parsed);
                    setIsDirty(true);
                    setEditingTaxRate(false);
                  }}
                  disabled={!taxRateDraft}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                >
                  Done
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