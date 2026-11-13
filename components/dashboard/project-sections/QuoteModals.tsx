'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Mail, Loader2, CheckCircle2, ArrowRightLeft, FileText, Trash2, Search, Plus, Check, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// Category values are stored as snake_case ("plumbing_repair") — display only.
const formatCategoryLabel = (value?: string) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// How many items the matching template shows before "Show all".
const MATCH_PREVIEW = 5;

// A template's line items, read-only, for previewing before loading it.
function TemplateItemList({ items }: { items: any[] }) {
  return (
    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {items.map((it: any, idx: number) => {
        const qty = parseFloat(it.quantity) || 1;
        const unit = parseFloat(it.unitPrice) || 0;
        const amount = it.amount != null ? parseFloat(it.amount) || 0 : unit * qty;
        return (
          <li key={idx} className="flex items-start justify-between gap-3 px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm text-slate-800 leading-snug">{it.description || it.label || 'Item'}</p>
              {qty !== 1 && unit > 0 && (
                <p className="text-xs text-slate-500">{qty} × {fmt(unit)}</p>
              )}
            </div>
            <p className="text-sm font-medium text-slate-900 tabular-nums shrink-0">{fmt(amount)}</p>
          </li>
        );
      })}
    </ul>
  );
}

// Shared look for the small confirm dialogs (bottom sheet on phones, centered on desktop).
const overlayCls = 'fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs';
const sheetCls = 'bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl';
const btnSecondary = 'py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition cursor-pointer disabled:opacity-50';
const btnPrimary = 'inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition cursor-pointer disabled:opacity-50';
const btnDanger = 'inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition cursor-pointer disabled:opacity-50';
const sheetMotion = {
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 24, opacity: 0 },
  transition: { type: 'spring' as const, damping: 28, stiffness: 320 },
};

// Every popup QuoteSection can show, in one place. QuoteSection owns all the
// state and handlers below — this component just renders whichever modal is
// currently open.
type QuoteModalsProps = {
  lead: any;
  companySlug: string;
  quoteData: any[];
  setQuoteData: React.Dispatch<React.SetStateAction<any[]>>;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;

  // Email preview
  previewHtml: string | null;
  setPreviewHtml: React.Dispatch<React.SetStateAction<string | null>>;

  // AI generator
  showAI: boolean;
  setShowAI: React.Dispatch<React.SetStateAction<boolean>>;
  leadPhotos: string[];
  handleAddItems: (items: any[]) => void;

  // Pending AI merge (existing items vs. freshly generated ones)
  pendingAiItems: any[] | null;
  setPendingAiItems: React.Dispatch<React.SetStateAction<any[] | null>>;

  // Template browser
  showTemplateBrowser: boolean;
  setShowTemplateBrowser: React.Dispatch<React.SetStateAction<boolean>>;
  allTemplates: any[];
  applyTemplate: (template: any) => void;

  // Clear all items (never touches saved templates)
  showClearAllConfirm: boolean;
  setShowClearAllConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  handleClearAllItems: () => void;

  // Pending template merge (existing items vs. template's items)
  pendingTemplate: any | null;
  setPendingTemplate: React.Dispatch<React.SetStateAction<any | null>>;
  loadTemplateNow: (template: any) => void;

  // Accept confirm
  showAcceptConfirm: boolean;
  setShowAcceptConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  markingAccepted: boolean;
  handleMarkAccepted: () => void;

  // Delete line item confirm
  deleteConfirmId: number | null;
  setDeleteConfirmId: React.Dispatch<React.SetStateAction<number | null>>;
  confirmRemoveRow: () => void;

  // Deposit terms
  showDepositEditor: boolean;
  setShowDepositEditor: React.Dispatch<React.SetStateAction<boolean>>;
  depositAmount: number;
  depositTypeDraft: 'percent' | 'fixed';
  setDepositTypeDraft: React.Dispatch<React.SetStateAction<'percent' | 'fixed'>>;
  depositValueDraft: string;
  setDepositValueDraft: React.Dispatch<React.SetStateAction<string>>;
  savingDeposit: boolean;
  handleSaveDepositTerms: (clear?: boolean) => void;

  // Tax rate
  editingTaxRate: boolean;
  setEditingTaxRate: React.Dispatch<React.SetStateAction<boolean>>;
  taxRate: number;
  setTaxRate: React.Dispatch<React.SetStateAction<number>>;
  taxRateDraft: string;
  setTaxRateDraft: React.Dispatch<React.SetStateAction<string>>;
  handleNumericKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, allowDecimal?: boolean) => void;
};

export default function QuoteModals({
  lead,
  quoteData,
  setQuoteData,
  setIsDirty,
  previewHtml,
  setPreviewHtml,
  setShowAI,
  pendingAiItems,
  setPendingAiItems,
  showTemplateBrowser,
  setShowTemplateBrowser,
  allTemplates,
  applyTemplate,
  showClearAllConfirm,
  setShowClearAllConfirm,
  handleClearAllItems,
  pendingTemplate,
  setPendingTemplate,
  loadTemplateNow,
  showAcceptConfirm,
  setShowAcceptConfirm,
  markingAccepted,
  handleMarkAccepted,
  deleteConfirmId,
  setDeleteConfirmId,
  confirmRemoveRow,
  showDepositEditor,
  setShowDepositEditor,
  depositAmount,
  depositTypeDraft,
  setDepositTypeDraft,
  depositValueDraft,
  setDepositValueDraft,
  savingDeposit,
  handleSaveDepositTerms,
  editingTaxRate,
  setEditingTaxRate,
  taxRate,
  setTaxRate,
  taxRateDraft,
  setTaxRateDraft,
  handleNumericKeyDown,
}: QuoteModalsProps) {
  const [browserMode, setBrowserMode] = useState<'templates' | 'items'>('templates');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  // Content key -> the quoteData row id that add created, so a second tap
  // removes that exact row instead of adding a duplicate.
  const [addedItems, setAddedItems] = useState<Map<string, number>>(new Map());
  // Which template card has its items expanded (one at a time).
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const toggleTemplate = (key: string) => setExpandedTemplate((cur) => (cur === key ? null : key));
  const templateKey = (t: any, fallback: string) => String(t?.id ?? fallback);

  const jobCategory: string | undefined = lead?.category || undefined;
  const firstName = lead?.name?.split(' ')[0] || 'the customer';

  // Reset each time the browser opens (this component never unmounts).
  useEffect(() => {
    if (showTemplateBrowser) {
      setBrowserMode(quoteData.length > 0 ? 'items' : 'templates');
      setItemSearchQuery('');
      setAddedItems(new Map());
      setExpandedTemplate(null);
    }
  }, [showTemplateBrowser]);

  // Templates: the one(s) matching this job's service go on top, big.
  const { matchingTemplates, otherTemplates } = useMemo(() => {
    const byName = (a: any, b: any) =>
      formatCategoryLabel(a.category).localeCompare(formatCategoryLabel(b.category));
    const matching = allTemplates.filter((t: any) => jobCategory && t.category === jobCategory);
    const others = allTemplates.filter((t: any) => !jobCategory || t.category !== jobCategory).sort(byName);
    return { matchingTemplates: matching, otherTemplates: others };
  }, [allTemplates, jobCategory]);

  // Every line item across every saved template, deduped on description+price+qty.
  // Items from this job's service come first.
  const lineItemPool = useMemo(() => {
    const pool: { description: string; unitPrice: number; quantity: number; category: string }[] = [];
    const seen = new Set<string>();
    const ordered = [...matchingTemplates, ...otherTemplates];
    ordered.forEach((t: any) => {
      (t.items || []).forEach((item: any) => {
        const description = String(item.description || item.label || '').trim();
        if (!description) return;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const quantity = parseFloat(item.quantity) || 1;
        const key = `${description.toLowerCase()}|${unitPrice}|${quantity}`;
        if (seen.has(key)) return;
        seen.add(key);
        pool.push({ description, unitPrice, quantity, category: t.category });
      });
    });
    return pool;
  }, [matchingTemplates, otherTemplates]);

  const filteredLineItems = useMemo(() => {
    const q = itemSearchQuery.trim().toLowerCase();
    if (!q) return lineItemPool;
    return lineItemPool.filter((item) => item.description.toLowerCase().includes(q));
  }, [lineItemPool, itemSearchQuery]);

  const poolItemKey = (item: { description: string; unitPrice: number; quantity: number }) =>
    `${item.description.toLowerCase()}|${item.unitPrice}|${item.quantity}`;

  // Checks the tracked row is still on the quote (it may have been deleted
  // from the table), so the checkmark never goes stale.
  const isPoolItemAdded = (item: { description: string; unitPrice: number; quantity: number }) => {
    const trackedId = addedItems.get(poolItemKey(item));
    if (trackedId === undefined) return false;
    return quoteData.some((i: any) => i.id === trackedId);
  };

  const togglePoolItem = (item: { description: string; unitPrice: number; quantity: number }) => {
    const key = poolItemKey(item);
    const trackedId = addedItems.get(key);
    const currentlyAdded = trackedId !== undefined && quoteData.some((i: any) => i.id === trackedId);

    if (currentlyAdded) {
      setQuoteData((prev) => prev.filter((i: any) => i.id !== trackedId));
      setAddedItems((prev) => {
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
      setIsDirty(true);
      toast.success(`Removed "${item.description}"`);
      return;
    }

    const newId = Date.now();
    setQuoteData((prev) => [
      ...prev,
      {
        id: newId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.unitPrice * item.quantity,
      },
    ]);
    setIsDirty(true);
    setAddedItems((prev) => new Map(prev).set(key, newId));
    toast.success(`Added "${item.description}"`);
  };

  const addedCount = lineItemPool.filter((i) => isPoolItemAdded(i)).length;
  const itemCount = quoteData.length;
  const itemsWord = `${itemCount} item${itemCount === 1 ? '' : 's'}`;

  // Quick deposit picks
  const percentPicks = ['10', '25', '33', '50'];

  return (
    <>
      {/* EMAIL PREVIEW */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/80 backdrop-blur-sm"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              {...sheetMotion}
              className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl h-[90vh] sm:h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">Quote email preview</p>
                    <p className="text-xs text-slate-500 truncate">What {lead?.name || 'the customer'} will see</p>
                  </div>
                </div>
                <button onClick={() => setPreviewHtml(null)} className="p-2 hover:bg-slate-100 rounded-lg transition cursor-pointer" aria-label="Close">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-100 p-2 sm:p-3">
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

      {/* PENDING AI ITEMS (legacy, kept working) */}
      <AnimatePresence>
        {pendingAiItems && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${overlayCls} z-[300]`}>
            <motion.div {...sheetMotion} className={sheetCls}>
              <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-4">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Add the draft items?</h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                This quote already has {itemsWord}. Add the new items to them, or replace them.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setQuoteData((prev) => [...prev, ...(pendingAiItems || [])]);
                    setPendingAiItems(null);
                    setShowAI(false);
                    setIsDirty(true);
                  }}
                  className={btnPrimary}
                >
                  Add to current items
                </button>
                <button
                  onClick={() => {
                    setQuoteData(pendingAiItems || []);
                    setPendingAiItems(null);
                    setShowAI(false);
                    setIsDirty(true);
                  }}
                  className={`${btnSecondary} text-rose-600`}
                >
                  Replace current items
                </button>
                <button onClick={() => setPendingAiItems(null)} className="py-2 text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD TO QUOTE: templates + saved line items */}
      <AnimatePresence>
        {showTemplateBrowser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center"
          >
            <motion.div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowTemplateBrowser(false)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative bg-white w-full sm:max-w-xl sm:mx-4 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] sm:max-h-[80vh]"
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1.5 rounded-full bg-slate-200" />
              </div>

              {/* Header */}
              <div className="px-5 sm:px-6 pt-3 sm:pt-5 pb-3 flex items-start justify-between gap-3 shrink-0">
                <div>
                  <p className="text-lg font-semibold text-slate-900 leading-tight">Add to quote</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {browserMode === 'templates'
                      ? 'Load a saved template. Tap the item count to see what\u2019s in it first.'
                      : 'Tap items to add them. Tap again to remove.'}
                  </p>
                </div>
                <button onClick={() => setShowTemplateBrowser(false)} className="p-2 -mr-2 hover:bg-slate-100 rounded-lg transition cursor-pointer" aria-label="Close">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="px-5 sm:px-6 pb-3 shrink-0">
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
                  {([
                    { key: 'templates', label: 'Templates', count: allTemplates.length },
                    { key: 'items', label: 'Single items', count: lineItemPool.length },
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setBrowserMode(tab.key)}
                      className={`py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                        browserMode === tab.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.label} <span className="font-normal text-slate-400">{tab.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {browserMode === 'templates' ? (
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-5">
                  {allTemplates.length === 0 ? (
                    <div className="text-center py-10">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No templates yet</p>
                      <p className="text-sm text-slate-500 mt-1">Set up pricing once per service under Services, then load it here in one tap.</p>
                    </div>
                  ) : (
                    <>
                      {/* Matches this job — big, on top, items listed */}
                      {matchingTemplates.length > 0 && (
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                            <Star className="w-3.5 h-3.5" /> Matches this job
                          </p>
                          <div className="space-y-2.5">
                            {matchingTemplates.map((template: any, i: number) => {
                              const key = templateKey(template, `m${i}`);
                              const items = template.items || [];
                              const showAll = expandedTemplate === key || items.length <= MATCH_PREVIEW;
                              const shown = showAll ? items : items.slice(0, MATCH_PREVIEW);
                              return (
                                <div key={key} className="rounded-2xl border-2 border-slate-900 bg-white p-4 sm:p-5">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                                        {formatCategoryLabel(template.category) || 'Untitled template'}
                                      </p>
                                      <p className="text-sm text-slate-500 mt-0.5">
                                        {items.length} item{items.length === 1 ? '' : 's'}
                                      </p>
                                    </div>
                                    <p className="text-lg font-bold text-slate-900 tabular-nums shrink-0">{fmt(template.total || 0)}</p>
                                  </div>
                                  {items.length > 0 && (
                                    <div className="mt-3">
                                      <TemplateItemList items={shown} />
                                      {items.length > MATCH_PREVIEW && (
                                        <button
                                          type="button"
                                          onClick={() => toggleTemplate(key)}
                                          className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                                        >
                                          {showAll ? 'Show less' : `Show all ${items.length} items`}
                                          <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => applyTemplate(template)}
                                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition cursor-pointer active:scale-[0.99]"
                                  >
                                    Use this template
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Everything else — peek at the items before loading */}
                      {otherTemplates.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                            {matchingTemplates.length > 0 ? 'Other templates' : 'Your templates'}
                          </p>
                          <div className="space-y-2">
                            {otherTemplates.map((template: any, i: number) => {
                              const key = templateKey(template, `o${i}`);
                              const items = template.items || [];
                              const open = expandedTemplate === key;
                              return (
                                <div
                                  key={key}
                                  className={`rounded-xl border transition ${open ? 'border-slate-300 bg-slate-50/60' : 'border-slate-200'}`}
                                >
                                  <div className="flex items-center gap-3 p-3.5">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold text-slate-900 truncate">
                                        {formatCategoryLabel(template.category) || 'Untitled template'}
                                      </p>
                                      <p className="text-sm text-slate-500 tabular-nums">{fmt(template.total || 0)}</p>
                                    </div>
                                    {items.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => toggleTemplate(key)}
                                        aria-expanded={open}
                                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer shrink-0"
                                      >
                                        {items.length} item{items.length === 1 ? '' : 's'}
                                        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => applyTemplate(template)}
                                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition cursor-pointer shrink-0"
                                    >
                                      Use
                                    </button>
                                  </div>
                                  <AnimatePresence initial={false}>
                                    {open && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.18 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="px-3.5 pb-3.5">
                                          <TemplateItemList items={items} />
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <>
                  <div className="px-5 sm:px-6 pb-3 shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={itemSearchQuery}
                        onChange={(e) => setItemSearchQuery(e.target.value)}
                        placeholder="Search your saved items…"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-base sm:text-sm outline-none focus:border-slate-400 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 sm:px-6 space-y-1.5 pb-3">
                    {filteredLineItems.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-10">
                        {itemSearchQuery ? 'No saved items match that search.' : 'No saved items yet. They come from your templates under Services.'}
                      </p>
                    ) : (
                      filteredLineItems.map((item) => {
                        const isAdded = isPoolItemAdded(item);
                        const isMatch = !!jobCategory && item.category === jobCategory;
                        return (
                          <button
                            key={poolItemKey(item)}
                            onClick={() => togglePoolItem(item)}
                            className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 border rounded-xl transition cursor-pointer text-left active:scale-[0.99] ${
                              isAdded ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-900 truncate">{item.description}</p>
                              <p className="text-xs text-slate-500 truncate">
                                {formatCategoryLabel(item.category)}
                                {isMatch && <span className="text-slate-700 font-medium"> · this job</span>}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-slate-900 tabular-nums shrink-0">
                              {fmt(item.unitPrice)}
                              {item.quantity !== 1 ? <span className="font-normal text-slate-500"> ×{item.quantity}</span> : null}
                            </span>
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                                isAdded ? 'bg-slate-900 text-white' : 'border border-slate-300 text-slate-500'
                              }`}
                              aria-hidden="true"
                            >
                              {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Done bar */}
                  <div className="shrink-0 border-t border-slate-100 px-5 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      {addedCount > 0 ? `${addedCount} added` : `Quote has ${itemsWord}`}
                    </p>
                    <button onClick={() => setShowTemplateBrowser(false)} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition cursor-pointer">
                      Done
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TEMPLATE: ADD OR REPLACE */}
      <AnimatePresence>
        {pendingTemplate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`${overlayCls} z-[300]`}>
            <motion.div {...sheetMotion} className={sheetCls}>
              <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                Use the {formatCategoryLabel(pendingTemplate.category)} template?
              </h3>
              <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                This quote already has {itemsWord}. Add the template&rsquo;s items to them, or start over with just the template (this also uses its tax rate).
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
                  className={btnPrimary}
                >
                  Add to current items
                </button>
                <button onClick={() => loadTemplateNow(pendingTemplate)} className={`${btnSecondary} text-rose-600`}>
                  Replace with template
                </button>
                <button onClick={() => setPendingTemplate(null)} className="py-2 text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MARK ACCEPTED */}
      <AnimatePresence>
        {showAcceptConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayCls} z-[600]`}
            onClick={() => !markingAccepted && setShowAcceptConfirm(false)}
          >
            <motion.div {...sheetMotion} className={sheetCls} onClick={(e) => e.stopPropagation()}>
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Mark as accepted?</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Use this when {firstName} said yes by phone or in person. It counts the same as them tapping Accept in the email, so if Auto invoices is on, the deposit request goes out.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setShowAcceptConfirm(false)} disabled={markingAccepted} className={btnSecondary}>
                  Cancel
                </button>
                <button onClick={handleMarkAccepted} disabled={markingAccepted} className={btnPrimary}>
                  {markingAccepted ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Mark accepted
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE LINE ITEM */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayCls} z-[600]`}
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div {...sheetMotion} className={sheetCls} onClick={(e) => e.stopPropagation()}>
              <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Remove this item?</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                It comes off this quote only. Your saved templates aren&rsquo;t changed.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setDeleteConfirmId(null)} className={btnSecondary}>
                  Cancel
                </button>
                <button onClick={confirmRemoveRow} className={btnDanger}>
                  <Trash2 className="w-4 h-4" /> Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CLEAR ALL ITEMS */}
      <AnimatePresence>
        {showClearAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayCls} z-[600]`}
            onClick={() => setShowClearAllConfirm(false)}
          >
            <motion.div {...sheetMotion} className={sheetCls} onClick={(e) => e.stopPropagation()}>
              <div className="w-11 h-11 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Clear all {itemsWord}?</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Start this quote over from scratch. Your saved templates aren&rsquo;t changed.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setShowClearAllConfirm(false)} className={btnSecondary}>
                  Cancel
                </button>
                <button onClick={handleClearAllItems} className={btnDanger}>
                  <Trash2 className="w-4 h-4" /> Clear all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEPOSIT */}
      <AnimatePresence>
        {showDepositEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayCls} z-[600]`}
            onClick={() => !savingDeposit && setShowDepositEditor(false)}
          >
            <motion.div {...sheetMotion} onClick={(e) => e.stopPropagation()} className={sheetCls}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {depositAmount > 0 ? 'Change the deposit' : 'Ask for a deposit'}
                </h3>
                <button
                  type="button"
                  onClick={() => !savingDeposit && setShowDepositEditor(false)}
                  disabled={savingDeposit}
                  className="p-2 -mr-2 -mt-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                What {firstName} pays to get on your schedule. The rest is due when the job is done.
                {depositAmount > 0 && <> Right now: <strong className="text-slate-900">{fmt(depositAmount)}</strong>.</>}
              </p>

              <div className="flex items-center gap-2">
                <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 shrink-0">
                  {(['percent', 'fixed'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDepositTypeDraft(t)}
                      className={`px-3.5 py-2.5 text-sm font-semibold transition-colors cursor-pointer ${
                        depositTypeDraft === t ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      aria-pressed={depositTypeDraft === t}
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
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-base font-semibold tabular-nums outline-none focus:border-slate-400"
                  aria-label={depositTypeDraft === 'percent' ? 'Deposit percent' : 'Deposit amount in dollars'}
                />
              </div>

              {depositTypeDraft === 'percent' && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {percentPicks.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDepositValueDraft(p)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition cursor-pointer ${
                        depositValueDraft === p ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => setShowDepositEditor(false)} disabled={savingDeposit} className={btnSecondary}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDepositTerms(false)}
                  disabled={savingDeposit || !depositValueDraft}
                  className={btnPrimary}
                >
                  {savingDeposit && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingDeposit ? 'Saving…' : 'Save'}
                </button>
              </div>
              {depositAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handleSaveDepositTerms(true)}
                  disabled={savingDeposit}
                  className="mt-3 w-full py-2 text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  Don&rsquo;t ask for a deposit
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAX RATE */}
      <AnimatePresence>
        {editingTaxRate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${overlayCls} z-[600]`}
            onClick={() => setEditingTaxRate(false)}
          >
            <motion.div {...sheetMotion} onClick={(e) => e.stopPropagation()} className={sheetCls}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-semibold text-slate-900">{taxRate > 0 ? 'Change the tax rate' : 'Add sales tax'}</h3>
                <button
                  type="button"
                  onClick={() => setEditingTaxRate(false)}
                  className="p-2 -mr-2 -mt-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4">Applies to this quote only. Use 0 for no tax.</p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={taxRateDraft}
                  onKeyDown={(e) => handleNumericKeyDown(e, true)}
                  onChange={(e) => setTaxRateDraft(e.target.value)}
                  placeholder="8.625"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-base font-semibold tabular-nums outline-none focus:border-slate-400"
                  aria-label="Tax rate percent"
                />
                <span className="text-base font-semibold text-slate-500 shrink-0">%</span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button type="button" onClick={() => setEditingTaxRate(false)} className={btnSecondary}>
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
                  className={btnPrimary}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}