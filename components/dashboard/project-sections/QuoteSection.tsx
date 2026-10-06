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
  FileText,
  Lock,
  ChevronDown,
  Sparkles,
   CheckCircle2,
  X,
  Pencil
} from 'lucide-react';
import SendEmailModal from '@/components/dashboard/SendEmailModal';
import QuoteModals from './QuoteModals';
import { getDepositAmount } from '@/lib/billing';
import { useQuoteTemplates } from '@/hooks/useQuoteTemplates';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

type QuoteSectionProps = {
  lead: any;
  company: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
   onDirtyChange?: (dirty: boolean) => void;
  onRegisterSave?: (fn: (() => Promise<boolean>) | null) => void;
};
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const formatCategoryLabel = (value?: string) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const MOBILE_ITEM_LIMIT = 6;

const noSpinners =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function QuoteSection({
  lead,
  company,
  currentUser,
  onRefresh,
  hasProject,
  companySlug,
    onDirtyChange,
  onRegisterSave,
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

  const { data: allTemplates = [], isLoading: templatesLoading } = useQuoteTemplates(companySlug);
  const categoryTemplate = useMemo(
    () => (lead?.category ? allTemplates.find((t: any) => t.category === lead.category) : null),
    [allTemplates, lead?.category]
  );

    // Every service + whether it has a template, this lead's service first.
  const serviceTemplateStatus = useMemo(() => {
    let cats: any = company?.form_categories;
    if (typeof cats === 'string') {
      try { cats = JSON.parse(cats); } catch { cats = []; }
    }
    if (!Array.isArray(cats)) return [];
    return cats
      .filter((c: any) => c?.value)
      .map((c: any) => ({
        value: c.value as string,
        label: (c.label || formatCategoryLabel(c.value)) as string,
        template: allTemplates.find((t: any) => t.category === c.value) || null,
      }))
      .sort((a: any, b: any) => (a.value === lead?.category ? -1 : b.value === lead?.category ? 1 : 0));
  }, [company?.form_categories, allTemplates, lead?.category]);
  const servicesWithTemplate = serviceTemplateStatus.filter((s: any) => s.template).length;

  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [templateBannerDismissed, setTemplateBannerDismissed] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [markingAccepted, setMarkingAccepted] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [taxRateDraft, setTaxRateDraft] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);
    const [focusedRowId, setFocusedRowId] = useState<number | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ── DEPOSIT TERMS ──
  const [showDepositEditor, setShowDepositEditor] = useState(false);
  const [depositTypeDraft, setDepositTypeDraft] = useState<'percent' | 'fixed'>('percent');
  const [depositValueDraft, setDepositValueDraft] = useState('');
  const [savingDeposit, setSavingDeposit] = useState(false);
  // Deposit from a just-loaded template, shown now and saved with the quote
  const [pendingDeposit, setPendingDeposit] = useState<{ type: 'percent' | 'fixed'; value: number } | null>(null);

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
      e.ctrlKey ||
      e.metaKey
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
    if (isDirty) return;
    setQuoteData(lead?.quote_data || []);
       setTaxRate(lead?.quote_tax_rate ?? 0);
    setTemplateBannerDismissed(false);
    setPendingDeposit(null);
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
      const result = await res.json().catch(() => null);
           if (res.ok && result?.success !== false) {
        // Apply the picked template's deposit (overrides the server's category-based auto-fill)
        if (pendingDeposit) {
          await fetch('/api/leads/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: lead.id,
              action: 'save_deposit_terms',
              deposit_type: pendingDeposit.type,
              deposit_value: pendingDeposit.value,
              user_name: currentUser?.name || 'Unknown',
              user_email: currentUser?.email || '',
            }),
          }).catch(() => {});
        }
        toast.success('Quote saved successfully');
        await onRefresh();
                setIsDirty(false);
        return true;
      } else {
        toast.error(result?.error || 'Failed to save quote');
        return false;
      }
    } catch {
      toast.error('Failed to save quote');
      return false;
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

  const paidAmount = parseFloat(lead?.payment_amount || '0');
  const depositLocked = paidAmount > 0;
  const taxLocked = paidAmount > 0;

  const openDepositEditor = () => {
    if (!hasProject) {
      toast.error('Convert to project first');
      return;
    }
       setDepositTypeDraft((lead?.deposit_type as 'percent' | 'fixed') || pendingDeposit?.type || 'percent');
    setDepositValueDraft(
      lead?.deposit_value ? String(lead.deposit_value) : pendingDeposit ? String(pendingDeposit.value) : ''
    );
    setShowDepositEditor(true);
  };

  const handleSaveDepositTerms = async (
    clear = false,
    explicitType?: 'percent' | 'fixed',
    explicitValue?: number
  ) => {
    setSavingDeposit(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_deposit_terms',
          deposit_type: clear ? null : explicitType ?? depositTypeDraft,
          deposit_value: clear ? null : explicitValue ?? parseFloat(depositValueDraft || '0'),
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setPendingDeposit(null);
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
    // Same rule as the server: only fill a deposit when none is set and nothing's been paid
    if (
      !lead?.deposit_type &&
      !(parseFloat(lead?.payment_amount || '0') > 0) &&
      template.deposit_type &&
      Number(template.deposit_value) > 0
    ) {
      setPendingDeposit({ type: template.deposit_type, value: Number(template.deposit_value) });
    }
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
    setShowAllItems(true);
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

  const hasIncompleteItems = useMemo(
    () =>
      quoteData.some(
        (item: any) => !item.description?.trim() || !item.unitPrice || parseFloat(String(item.unitPrice)) <= 0
      ),
    [quoteData]
  );

  useEffect(() => {
    onRegisterSave?.(async () => {
      if (hasIncompleteItems) {
        toast.error('Add a description and price to every item before saving.');
        return false;
      }
      return doSave(quoteData, taxRate);
    });
    return () => onRegisterSave?.(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteData, taxRate, hasIncompleteItems, pendingDeposit]);

  const depositType = (lead?.deposit_type || pendingDeposit?.type || null) as 'percent' | 'fixed' | null;
  const depositValue = lead?.deposit_type ? parseFloat(lead?.deposit_value || '0') : pendingDeposit?.value ?? 0;
    const depositAmount = getDepositAmount({ total, depositType, depositValue });

  const quoteAccepted = !!(lead?.project_quote_accepted_at || lead?.quote_accepted_at);

  return (
    <>
      {/* MAIN CONTAINER */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
      >
        {/* TOP ACTION BAR */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Quote</h3>
            {quoteAccepted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepted
              </span>
            )}
          </div>
                    <div className="flex items-center gap-2">
            {!isDirty && !saving && outboxLog.length === 0 && quoteData.length > 0 ? (
              <button
                onClick={() => setShowEmailModal(true)}
                disabled={!hasProject || hasIncompleteItems}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
                              >
                <Mail className="w-3.5 h-3.5" /> Send Estimate
              </button>
            ) : (
            <button
              onClick={handleManualSave}
              disabled={!hasProject || saving || hasIncompleteItems}
              title={hasIncompleteItems ? 'Every item needs a description and a price first' : undefined}
              className={`${
                quoteData.length === 0 ? 'hidden ' : ''
              }inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isDirty
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
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
            )}

            {quoteData.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowActionsMenu((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  Actions
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showActionsMenu ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showActionsMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            setShowActionsMenu(false);
                            setShowEmailModal(true);
                          }}
                          disabled={!hasProject || quoteData.length === 0 || hasIncompleteItems}
                          title={hasIncompleteItems ? 'Every item needs a description and a price first' : undefined}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-left"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {outboxLog.length > 0 ? 'Resend Estimate' : 'Send Estimate'}
                        </button>
                        {!quoteAccepted && (
                          <button
                            onClick={() => {
                              setShowActionsMenu(false);
                              setShowAcceptConfirm(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer border-t border-slate-100 text-left"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Mark Accepted Manually
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setShowActionsMenu(false);
                            setShowClearAllConfirm(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer border-t border-slate-100 text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Clear All Items
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="p-3.5 sm:p-5 lg:p-6 space-y-5">
                   {/* EMPTY STATE */}
          {quoteData.length === 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templatesLoading ? (
                  <div className="h-[104px] md:h-[150px] rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
                ) : allTemplates.length > 0 ? (
                  <button
                    onClick={() => setShowTemplateBrowser(true)}
                    className="text-left p-4 md:p-5 md:min-h-[150px] md:flex md:flex-col md:justify-between rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-3 md:mb-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-950">Choose a Template</p>
                      <p className="text-xs text-indigo-700 mt-1">
                        {categoryTemplate
                          ? `${formatCategoryLabel(lead?.category)} template suggested`
                          : `Pick from ${allTemplates.length} saved template${allTemplates.length === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  </button>
                ) : (
                  <a
                    href={`/${companySlug}/dashboard/services`}
                    className="text-left p-4 md:p-5 md:min-h-[150px] md:flex md:flex-col md:justify-between rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 hover:border-indigo-300 transition cursor-pointer block group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center mb-3 md:mb-0 shadow-2xs group-hover:scale-105 transition-transform">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-indigo-950">Set Up Pricing Templates</p>
                      <p className="text-xs text-indigo-700 mt-1">Save reusable pricing so future quotes take seconds</p>
                    </div>
                  </a>
                )}

                <button
                  onClick={handleAddRow}
                  className="text-left p-4 md:p-5 md:min-h-[150px] md:flex md:flex-col md:justify-between rounded-xl border border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-3 md:mb-0 shadow-2xs group-hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Create from Scratch</p>
                    <p className="text-xs text-slate-500 mt-1">Add line items one at a time</p>
                  </div>
                </button>
              </div>

              {!templatesLoading &&
                serviceTemplateStatus.length > 0 &&
                servicesWithTemplate < serviceTemplateStatus.length && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Templates set up: {servicesWithTemplate} of {serviceTemplateStatus.length}
                      </p>
                      <a
                        href={`/${companySlug}/dashboard/services`}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Manage
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {serviceTemplateStatus.slice(0, 6).map((s: any) => {
                        const base = `inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                          s.value === lead?.category ? 'ring-2 ring-indigo-300' : ''
                        }`;
                        return s.template ? (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => applyTemplate(s.template)}
                            title={`Load ${s.label} template`}
                            className={`${base} cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
                          >
                            <CheckCircle2 className="h-3 w-3" /> {s.label}
                          </button>
                        ) : (
                          <a
                            key={s.value}
                            href={`/${companySlug}/dashboard/services`}
                            title={`Set up a ${s.label} template`}
                            className={`${base} border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700`}
                          >
                            <X className="h-3 w-3 text-rose-400" /> {s.label}
                          </a>
                        );
                      })}
                      {serviceTemplateStatus.length > 6 && (
                        <a
                          href={`/${companySlug}/dashboard/services`}
                          className="px-1 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                        >
                          +{serviceTemplateStatus.length - 6} more
                        </a>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* DESKTOP TABLE */}
          {quoteData.length > 0 && (
            <div className="hidden md:block rounded-xl border border-slate-200 overflow-hidden font-sans antialiased">
              <table className="w-full text-sm border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-medium text-[11px] uppercase tracking-wider">
                    <th className="text-left px-4 py-2.5 w-auto">Description</th>
                    <th className="text-right px-2 py-2.5 w-28">Price</th>
                    <th className="text-center px-2 py-2.5 w-20">Qty</th>
                    <th className="text-right px-3 py-2.5 w-28">Amount</th>
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
                          isFocused ? 'bg-indigo-50/40' : 'hover:bg-slate-50/60'
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

                        {/* PRICE INPUT */}
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
                              className={`w-full min-w-0 bg-transparent text-sm font-mono font-medium tracking-tight text-slate-900 outline-none text-right tabular-nums ${noSpinners}`}
                            />
                          </div>
                        </td>

                        {/* QUANTITY INPUT */}
                        <td className="px-2 py-2 align-middle">
                          <div className="flex items-center justify-center gap-1 rounded-md bg-slate-50 px-2 py-1 border border-slate-100">
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

                  {/* HOVER-REVEAL ADD ROW */}
                  <tr
                    onClick={handleAddRow}
                    className="group/addrow cursor-pointer border-t border-dashed border-slate-200 transition-colors hover:bg-slate-50/80"
                  >
                    <td colSpan={5} className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 transition-colors group-hover/addrow:text-slate-700">
                        <Plus className="w-3.5 h-3.5" /> Add line item
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* DESKTOP TOOLBAR */}
          {quoteData.length > 0 && (
            <div className="hidden md:flex items-center gap-2">
              {templatesLoading ? (
                <div className="h-[38px] w-36 rounded-xl bg-slate-100 animate-pulse" />
              ) : (
                allTemplates.length > 0 && (
                  <button
                    onClick={() => setShowTemplateBrowser(true)}
                    className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                  >
                                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    Add from Saved
                  </button>
                )
              )}
              <button
                onClick={handleManualSave}
                disabled={!hasProject || saving || hasIncompleteItems}
                title={hasIncompleteItems ? 'Every item needs a description and a price first' : undefined}
                className={`ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isDirty
                    ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
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
          )}

          {hasIncompleteItems && quoteData.length > 0 && (
            <p className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-amber-700">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              Add a description and price to every item before saving or sending.
            </p>
          )}

          {/* MOBILE VIEW */}
          {quoteData.length > 0 && (
                      <div className="md:hidden space-y-2.5">
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-2xs">
                {(showAllItems ? quoteData : quoteData.slice(0, MOBILE_ITEM_LIMIT)).map((item: any) => {
                  const isIncomplete =
                    !item.description?.trim() || !item.unitPrice || parseFloat(String(item.unitPrice)) <= 0;
                  return (
                    <div key={item.id} className={`flex items-center gap-3 px-3.5 py-3 ${isIncomplete ? 'bg-amber-50/50' : ''}`}>
                      <button onClick={() => setEditingItem({ ...item })} className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
                          {item.description || <span className="font-normal italic text-amber-600">No description</span>}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                          {item.unitPrice && parseFloat(String(item.unitPrice)) > 0 ? (
                            `${fmt(item.unitPrice)} × ${item.quantity || 1}`
                          ) : (
                            <span className="italic text-amber-600">No price set</span>
                          )}
                        </p>
                      </button>
                      <span className="text-sm font-bold text-slate-900 tabular-nums shrink-0">{fmt(item.amount || 0)}</span>
                      <button
                        onClick={() => requestRemoveRow(item.id)}
                        className="p-2 -mr-2 text-slate-300 active:text-rose-500 shrink-0"
                        aria-label="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
                {quoteData.length > MOBILE_ITEM_LIMIT && (
                  <button
                    onClick={() => setShowAllItems((v) => !v)}
                    className="w-full py-2.5 text-xs font-semibold text-slate-600 active:bg-slate-50"
                  >
                    {showAllItems ? 'Show less' : `Show all ${quoteData.length} items`}
                  </button>
                )}
              </div>

                            <div className={`grid gap-2 ${!templatesLoading && allTemplates.length > 0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <button
                  onClick={handleAddRowMobile}
                  className="py-3 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-semibold active:scale-[0.99] transition"
                >
                  <Plus className="w-4 h-4" /> New Item
                </button>
                {!templatesLoading && allTemplates.length > 0 && (
                  <button
                    onClick={() => setShowTemplateBrowser(true)}
                    className="py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 active:scale-[0.99] transition"
                  >
                    <FileText className="w-4 h-4 text-indigo-500" /> Add from Saved
                  </button>
                )}
              </div>
            </div>
          )}

       

                   {/* FINANCIAL BREAKDOWN — tax + deposit pills on top, receipt below */}
          {quoteData.length > 0 && (
            <>
              <div className="w-full rounded-xl border border-slate-200 bg-white text-sm shadow-2xs overflow-hidden">
                {/* Pills row */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
                  {/* Tax pill */}
                                   {taxLocked ? (
                    <button
                      type="button"
                      aria-label="Tax rate is locked"
                      className="group relative inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400 cursor-help focus:outline-none"
                    >
                      Tax {taxRate > 0 ? `${taxRate}%` : 'none'}
                      <Lock className="w-3 h-3" />
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-64 max-w-[80vw] rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-medium leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
                      >
                        Tax rate is locked because a payment has already been received on this job. To change it,
                        reverse the payment in the Invoice tab.
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setTaxRateDraft(taxRate ? String(taxRate) : '');
                        setEditingTaxRate(true);
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        taxRate > 0
                          ? 'border border-slate-900 bg-white text-slate-900 hover:bg-slate-100'
                          : 'border border-dashed border-slate-300 bg-white text-slate-500 hover:border-slate-900 hover:text-slate-900'
                      }`}
                    >
                      {taxRate > 0 ? (
                        <>
                          Tax {taxRate}%
                          <Pencil className="w-3 h-3 opacity-60" />
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" /> Add tax
                        </>
                      )}
                    </button>
                  )}

                  {/* Deposit pill */}
                                 {depositLocked ? (
                    <button
                      type="button"
                      aria-label="Deposit terms are locked"
                      className="group relative inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400 cursor-help focus:outline-none"
                    >
                      {depositAmount > 0
                        ? `Deposit ${depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)}`
                        : 'No deposit'}
                      <Lock className="w-3 h-3" />
                      <span
                        role="tooltip"
                        className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-64 max-w-[80vw] rounded-lg bg-slate-900 px-3 py-2 text-left text-xs font-medium leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
                      >
                        Deposit terms are locked because a payment has already been received on this job. To change
                        them, reverse the payment in the Invoice tab.
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={openDepositEditor}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        depositAmount > 0
                          ? 'border border-slate-900 bg-white text-slate-900 hover:bg-slate-100'
                          : 'border border-dashed border-slate-300 bg-white text-slate-500 hover:border-slate-900 hover:text-slate-900'
                      }`}
                    >
                      {depositAmount > 0 ? (
                        <>
                          Deposit {depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)}
                          <Pencil className="w-3 h-3 opacity-60" />
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" /> Add deposit
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Receipt */}
                <div className="px-4">
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="tabular-nums text-slate-900 font-medium">{fmt(subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-t border-slate-100">
                    <span className="text-slate-600">{taxRate > 0 ? `Tax (${taxRate}%)` : 'Tax'}</span>
                    <span className={`tabular-nums ${taxRate > 0 ? 'text-slate-900 font-medium' : 'text-slate-300'}`}>
                      {taxRate > 0 ? fmt(taxAmount) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-slate-200">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-lg font-bold tabular-nums text-slate-900">{fmt(total)}</span>
                  </div>
                </div>

                {/* Deposit strip */}
                {depositAmount > 0 && (
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3.5 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-slate-900">
                        Deposit due{depositType === 'percent' ? ` (${depositValue}%)` : ''}
                      </span>
                      <span className="text-base font-bold tabular-nums text-slate-900">{fmt(depositAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Balance after deposit</span>
                      <span className="tabular-nums text-slate-700 font-medium">
                        {fmt(Math.max(total - depositAmount, 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

                           {/* BOTTOM SAVE BUTTON — always on desktop, mobile only when there are unsaved changes */}
              <div className={`${isDirty || saving ? 'flex' : 'hidden'} md:hidden justify-end sticky bottom-3 z-10`}>

                <button
                  onClick={handleManualSave}
                  disabled={!hasProject || saving || hasIncompleteItems}
                  title={hasIncompleteItems ? 'Every item needs a description and a price first' : undefined}
                  className={`w-full md:w-auto justify-center inline-flex items-center gap-1.5 px-4 py-3 md:py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDirty
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
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
            </>
          )}
        </div>

                {/* BOTTOM SHEET ITEM EDITOR (Mobile) */}
        {mounted && createPortal(
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
                        <span className="text-sm font-bold text-slate-500">$</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={editingItem.unitPrice === 0 || editingItem.unitPrice === '0' ? '' : editingItem.unitPrice ?? ''}
                          onKeyDown={(e) => handleNumericKeyDown(e, true)}
                          onChange={(e) => {
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
                      <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-slate-400 focus-within:bg-white">
                        <span className="text-sm font-bold text-slate-500">×</span>
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
                                               className="w-full bg-transparent text-sm font-bold text-slate-900 outline-none tabular-nums"
                      />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-100/70 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 tabular-nums">
                      {fmt(parseFloat(String(editingItem.unitPrice)) || 0)} × {parseFloat(String(editingItem.quantity)) || 0}
                    </span>
                                        <span className="text-base font-extrabold text-slate-900 tabular-nums">
                      {fmt((parseFloat(String(editingItem.unitPrice)) || 0) * (parseFloat(String(editingItem.quantity)) || 0))}
                    </span>
                  </div>
                </div>
              </motion.div>
                     </>
          )}
        </AnimatePresence>,
        document.body
        )}

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

      {/* MODALS HOOKUP */}
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
    </>
  );
}