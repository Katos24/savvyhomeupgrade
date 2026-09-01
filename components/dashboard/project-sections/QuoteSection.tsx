'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Mail,
  Loader2,
  Save,
  Eye,
  Pencil,
  FileText,
  Lock,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import SendEmailModal from '@/components/dashboard/SendEmailModal';
import QuoteModals from './QuoteModals';
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

// Category values are stored as snake_case ("plumbing_repair") — this is
// purely a display fix, the underlying value used elsewhere stays as stored.
const formatCategoryLabel = (value?: string) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

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
  // Which row is currently focused, for the subtle active-row highlight in
  // the desktop table — tracked at the row level (not per-input) so moving
  // focus between description/price/qty within the same row doesn't flicker.
  const [focusedRowId, setFocusedRowId] = useState<number | null>(null);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  // Send/Accept/Clear now live in one Actions menu instead of separate
  // buttons scattered around the card — was causing Save and Send to sit
  // next to each other and get mixed up.
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

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
    setTemplatesLoading(true);
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
      .catch(() => {})
      .finally(() => setTemplatesLoading(false));
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
    if (hasIncompleteItems) {
      toast.error('Add a description and price to every item before saving.');
      return;
    }
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

  // Clears every line item on the CURRENT quote so someone can start over
  // from scratch. This does not touch saved templates in any way.
  const handleClearAllItems = () => {
    setQuoteData([]);
    setIsDirty(true);
    setShowClearAllConfirm(false);
    toast.success('Quote cleared — start fresh');
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

  // Every item needs a description and a real price before this quote can
  // be saved or sent — half-filled rows shouldn't quietly go out to a client.
  const hasIncompleteItems = useMemo(
    () =>
      quoteData.some(
        (item: any) => !item.description?.trim() || !item.unitPrice || parseFloat(String(item.unitPrice)) <= 0
      ),
    [quoteData]
  );

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
      {/* MAIN CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
      >
               {/* TOP ACTION BAR — Quote label left, Save right. Send Estimate
            moved into the Actions menu below (with Accept/Clear) since it
            was sitting right next to Save and getting mixed up with it. */}
        <div className="px-4 sm:px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900">Quote</h3>
          <button
            onClick={handleManualSave}
            disabled={!hasProject || saving || hasIncompleteItems}
            title={hasIncompleteItems ? "Every item needs a description and a price first" : undefined}
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
        </div>

            {/* MAIN BODY GRID */}
        <div className="p-4 sm:p-5 lg:p-6 grid gap-5 lg:gap-6 lg:grid-cols-[1fr_240px] items-start">

                    {/* LEFT: TABLE & LINE ITEMS */}
          <div className="space-y-3 min-w-0">
            {/* EMPTY STATE — one deliberate choice, same on every screen size.
                Previously scattered across a dismissible template banner, a
                text-only empty table row, and a separate stack of mobile
                buttons — none of which agreed on which options existed or
                what happened by default. */}
            {quoteData.length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryTemplate && (
                  <button
                    onClick={handleLoadTemplate}
                    className="text-left p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-3">
                      <FileText className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-indigo-950">
                      Load {formatCategoryLabel(lead?.category || categoryTemplate.category)} Template
                    </p>
                    <p className="text-xs text-indigo-700 mt-1">
                      {categoryTemplate.items?.length || 0} standard line items with default pricing
                    </p>
                  </button>
                )}

                {allTemplates.length > 0 && (
                  <button
                    onClick={() => setShowTemplateBrowser(true)}
                    className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                      <FileText className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Browse Templates</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Pick from {allTemplates.length} saved template{allTemplates.length === 1 ? '' : 's'}
                    </p>
                  </button>
                )}

                <button
                  onClick={() => setShowAI(true)}
                  className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Generate with AI</p>
                  <p className="text-xs text-slate-500 mt-1">Draft line items from the job description and photos</p>
                </button>

                <button
                  onClick={handleAddRowMobile}
                  className="text-left p-4 rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-3">
                    <Plus className="w-4 h-4" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Start from Scratch</p>
                  <p className="text-xs text-slate-500 mt-1">Add line items one at a time</p>
                </button>
              </div>
            )}

            {/* Desktop — real table, one header row, full column labels */}
{quoteData.length > 0 && (
  <div className="hidden md:block rounded-xl border border-slate-200 overflow-hidden font-sans antialiased">
    <table className="w-full text-sm border-collapse table-fixed">
      <thead>
        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
          <th className="text-left px-4 py-2.5 w-auto">Description</th>
          <th className="text-right px-2 py-2.5 w-24">Price</th>
          <th className="text-center px-2 py-2.5 w-16">Qty</th>
          <th className="text-right px-3 py-2.5 w-24">Amount</th>
          <th className="w-9 px-2" />
        </tr>
      </thead>
      <tbody>
        {quoteData.map((item: any) => {
          const isNew = item.id === lastAddedId && !item.description;
          const isFocused = focusedRowId === item.id;
          return (
            <tr
              key={item.id}
              ref={isNew ? (el) => { newRowRef.current = el; } : undefined}
              onFocus={() => setFocusedRowId(item.id)}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusedRowId(null);
              }}
              className={`border-b border-slate-100 last:border-b-0 group transition-colors ${
                isFocused ? 'bg-indigo-50/50' : 'hover:bg-slate-50/60'
              }`}
            >
              {/* DESCRIPTION FIELD */}
              <td className={`px-4 py-2 align-middle transition-colors ${!item.description?.trim() ? 'bg-amber-50/50' : ''}`}>
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
                  className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal outline-none resize-none overflow-hidden leading-relaxed block py-0.5"
                />
              </td>

              {/* PRICE INPUT — $ is glued directly to the digits in a
                  bordered box, so it reads as one unit regardless of how
                  many digits are typed, and the box itself (not red text)
                  signals an unset price. */}
              <td className="px-2 py-2 align-middle">
                <div
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 transition-colors ${
                    !item.unitPrice || parseFloat(String(item.unitPrice)) <= 0
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-transparent'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-400 shrink-0">$</span>
                  <input
                    type="number"
                    step="any"
                    value={item.unitPrice || ''}
                    onKeyDown={(e) => handleNumericKeyDown(e, true)}
                    onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                    placeholder="0.00"
                    className={`w-full min-w-0 bg-transparent text-sm font-mono font-medium tracking-tight text-slate-900 outline-none text-left tabular-nums ${noSpinners}`}
                  />
                </div>
              </td>

              {/* QUANTITY INPUT — a × prefix on a plain grey box, so at a
                  glance it reads as a different kind of field than Price,
                  not just another number in an identical box. */}
              <td className="px-2 py-2 align-middle">
                <div className="flex items-center justify-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                  <span className="text-xs font-semibold text-slate-400 shrink-0">×</span>
                  <input
                    type="number"
                    step="any"
                    value={item.quantity || ''}
                    onKeyDown={(e) => handleNumericKeyDown(e, true)}
                    onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                    placeholder="1"
                    className={`w-full min-w-0 bg-transparent text-sm font-mono font-medium tracking-tight text-slate-900 outline-none text-center tabular-nums ${noSpinners}`}
                  />
                </div>
              </td>

              {/* TOTAL AMOUNT */}
              <td className="px-3 py-2 text-right align-middle">
                <span className="text-sm font-mono font-semibold tracking-tight text-slate-900 tabular-nums">
                  {fmt(item.amount || 0)}
                </span>
              </td>

              {/* DELETE BUTTON */}
              <td className="px-2 py-2 align-middle">
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
        })}

        {/* HOVER-REVEAL ADD ROW — a faint "+" when idle that darkens on
            hover, built into the table itself. Adding a line now happens
            right where the lines are, instead of a separate button below. */}
        <tr
          onClick={handleAddRow}
          className="group/addrow cursor-pointer border-t border-dashed border-slate-200 transition-colors hover:bg-slate-50/80"
        >
          <td colSpan={5} className="px-4 py-2.5 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 transition-colors group-hover/addrow:text-slate-600">
              <Plus className="w-3.5 h-3.5" /> Add line item
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)}

            {/* Desktop Templates + AI Toolbar — Add Line Item now lives in
                the table itself as a hover row, so this is just the two
                bulk-entry options. */}
            {quoteData.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              {templatesLoading ? (
                <div className="h-[42px] w-40 rounded-xl bg-slate-100 animate-pulse" />
              ) : (
                allTemplates.length > 0 && (
                <button
                  onClick={() => setShowTemplateBrowser(true)}
                  className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  Browse Templates
                </button>
                )
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
            )}

            {hasIncompleteItems && quoteData.length > 0 && (
              <p className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-amber-700">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                Add a description and price to every item before saving or sending.
              </p>
            )}

            {/* Mobile View: Clean Touch Cards (line items only — empty state
                is the shared card grid above, same on every screen size) */}
            {quoteData.length > 0 && (
            <div className="md:hidden space-y-2.5">
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
                          {quoteData.map((item: any) => {
                            const isIncomplete =
                              !item.description?.trim() || !item.unitPrice || parseFloat(String(item.unitPrice)) <= 0;
                            return (
                            <div
                              key={item.id}
                              className={`border rounded-xl p-3.5 shadow-xs space-y-2 transition-colors ${
                                isIncomplete ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <button
                                  onClick={() => setEditingItem({ ...item })}
                                  className="flex-1 text-left min-w-0"
                                >
                                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                                    {item.description || <span className="font-normal italic text-amber-600">No description</span>}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1 font-medium tabular-nums">
                                    {item.unitPrice && parseFloat(String(item.unitPrice)) > 0 ? (
                                      `${fmt(item.unitPrice)} × ${item.quantity || 1}`
                                    ) : (
                                      <span className="italic text-amber-600">No price set</span>
                                    )}
                                  </p>
                                </button>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-bold text-slate-900 tabular-nums">
                                    {fmt(item.amount || 0)}
                                  </p>
                                  <button
                                    onClick={() => requestRemoveRow(item.id)}
                                    className="mt-1 p-2 -m-1 text-slate-300 hover:text-rose-500 rounded transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            );
                          })}

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
            </div>
            )}
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

            {quoteData.length > 0 && (
              <div className="border-t border-slate-100">
                <button
                  onClick={() => setShowActionsMenu((v) => !v)}
                  className="w-full py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Actions
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showActionsMenu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showActionsMenu && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-slate-100"
                    >
                      <button
                        onClick={() => { setShowActionsMenu(false); setShowEmailModal(true); }}
                        disabled={!hasProject || quoteData.length === 0 || hasIncompleteItems}
                        title={hasIncompleteItems ? "Every item needs a description and a price first" : undefined}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {outboxLog.length > 0 ? 'Resend Estimate' : 'Send Estimate'}
                      </button>
                      {!quoteAccepted && (
                        <button
                          onClick={() => { setShowActionsMenu(false); setShowAcceptConfirm(true); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer border-t border-slate-100"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Mark Accepted Manually
                        </button>
                      )}
                      <button
                        onClick={() => { setShowActionsMenu(false); setShowClearAllConfirm(true); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer border-t border-slate-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear All Items
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

               {/* BOTTOM SAVE — plain, in-flow, not sticky, on every screen
            size. A second copy of the top Save button, reachable after
            scrolling. Send Estimate lives in the Actions menu now, so this
            only needs to handle the one job: saving. */}
        {!editingItem && isDirty && (
          <div className="px-4 sm:px-5 pb-5">
            <button
              onClick={handleManualSave}
              disabled={!hasProject || saving || hasIncompleteItems}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
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

      {/* EMAIL COMPOSER MODAL — already its own component, so it's just
          invoked here rather than living in QuoteModals. */}
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

      {/* Every popup — email preview, AI, templates, accept/delete confirms,
          deposit, tax — lives in QuoteModals now. See that file for any
          change to wording or behavior of a specific dialog. */}
      <QuoteModals
        lead={lead}
        companySlug={companySlug}
        quoteData={quoteData}
        setQuoteData={setQuoteData}
        setIsDirty={setIsDirty}
        previewHtml={previewHtml}
        setPreviewHtml={setPreviewHtml}
        showAI={showAI}
        setShowAI={setShowAI}
        leadPhotos={leadPhotos}
        handleAddItems={handleAddItems}
        pendingAiItems={pendingAiItems}
        setPendingAiItems={setPendingAiItems}
        showTemplateBrowser={showTemplateBrowser}
        setShowTemplateBrowser={setShowTemplateBrowser}
        allTemplates={allTemplates}
        applyTemplate={applyTemplate}
        showClearAllConfirm={showClearAllConfirm}
        setShowClearAllConfirm={setShowClearAllConfirm}
        handleClearAllItems={handleClearAllItems}
        pendingTemplate={pendingTemplate}
        setPendingTemplate={setPendingTemplate}
        loadTemplateNow={loadTemplateNow}
        showAcceptConfirm={showAcceptConfirm}
        setShowAcceptConfirm={setShowAcceptConfirm}
        markingAccepted={markingAccepted}
        handleMarkAccepted={handleMarkAccepted}
        deleteConfirmId={deleteConfirmId}
        setDeleteConfirmId={setDeleteConfirmId}
        confirmRemoveRow={confirmRemoveRow}
        showDepositEditor={showDepositEditor}
        setShowDepositEditor={setShowDepositEditor}
        depositAmount={depositAmount}
        depositTypeDraft={depositTypeDraft}
        setDepositTypeDraft={setDepositTypeDraft}
        depositValueDraft={depositValueDraft}
        setDepositValueDraft={setDepositValueDraft}
        savingDeposit={savingDeposit}
        handleSaveDepositTerms={handleSaveDepositTerms}
        editingTaxRate={editingTaxRate}
        setEditingTaxRate={setEditingTaxRate}
        taxRate={taxRate}
        setTaxRate={setTaxRate}
        taxRateDraft={taxRateDraft}
        setTaxRateDraft={setTaxRateDraft}
        handleNumericKeyDown={handleNumericKeyDown}
      />

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