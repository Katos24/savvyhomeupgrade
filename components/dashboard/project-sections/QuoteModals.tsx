'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Mail, Loader2, Sparkles, CheckCircle2, ArrowRightLeft, FileText, Trash2, Search, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import AIQuoteGenerator from '../AIQuoteGenerator';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

// Category values are stored as snake_case ("plumbing_repair") — this is
// purely a display fix, the underlying value passed to applyTemplate etc.
// stays exactly as stored.
const formatCategoryLabel = (value?: string) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Every popup QuoteSection can show, in one place. QuoteSection owns all the
// state and handlers below — this component just renders whichever modal is
// currently open. Nothing here mutates state on its own except through the
// setters/handlers passed in, so there's one source of truth for quote data
// regardless of which file you're reading.
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

  // Clear all items (start the current quote over from scratch — this
  // never touches saved templates)
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
  companySlug,
  quoteData,
  setQuoteData,
  setIsDirty,
  previewHtml,
  setPreviewHtml,
  showAI,
  setShowAI,
  leadPhotos,
  handleAddItems,
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
  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());

  // Reset to a clean state each time the browser opens, since this
  // component never unmounts — only the modal's visibility toggles.
  useEffect(() => {
    if (showTemplateBrowser) {
      setBrowserMode('templates');
      setItemSearchQuery('');
      setAddedKeys(new Set());
    }
  }, [showTemplateBrowser]);

  // Every line item across every saved template, flattened into one
  // searchable pool. Deduped on description+price+quantity so the same
  // "Labor" line saved in three templates doesn't show up three times.
  const lineItemPool = useMemo(() => {
    const pool: { description: string; unitPrice: number; quantity: number; category: string }[] = [];
    const seen = new Set<string>();
    allTemplates.forEach((t: any) => {
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
  }, [allTemplates]);

  const filteredLineItems = useMemo(() => {
    const q = itemSearchQuery.trim().toLowerCase();
    if (!q) return lineItemPool;
    return lineItemPool.filter((item) => item.description.toLowerCase().includes(q));
  }, [lineItemPool, itemSearchQuery]);

  // Content-based key (not array index) so the "added" state stays correct
  // even as the search filter reorders or narrows the visible list.
  const poolItemKey = (item: { description: string; unitPrice: number; quantity: number }) =>
    `${item.description.toLowerCase()}|${item.unitPrice}|${item.quantity}`;

  // Adds just this one item to the current quote — doesn't touch or
  // replace anything already on it, and the modal stays open so several
  // can be added in a row. Marks it "added" persistently (not just a
  // toast) since a toast alone was too easy to miss.
  const addPoolItemToQuote = (item: { description: string; unitPrice: number; quantity: number }) => {
    setQuoteData((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.unitPrice * item.quantity,
      },
    ]);
    setIsDirty(true);
    setAddedKeys((prev) => new Set(prev).add(poolItemKey(item)));
    toast.success(`Added "${item.description}"`);
  };

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
                    setQuoteData((prev) => [...prev, ...(pendingAiItems || [])]);
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
                    setQuoteData(pendingAiItems || []);
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
              className="relative bg-white w-full sm:max-w-lg sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
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
                  <p className="text-sm font-bold text-slate-900 leading-tight">Add to Quote</p>
                </div>
                <button
                  onClick={() => setShowTemplateBrowser(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Mode switcher — whole templates vs. individual saved
                  line items pulled from every template */}
              <div className="px-4 pt-3 shrink-0">
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                  <button
                    onClick={() => setBrowserMode('templates')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      browserMode === 'templates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Templates
                  </button>
                  <button
                    onClick={() => setBrowserMode('items')}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                      browserMode === 'items' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Search Line Items
                  </button>
                </div>
              </div>

              {browserMode === 'templates' ? (
                <div className="flex-1 overflow-y-auto p-4">
                  {allTemplates.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">No templates set up yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {allTemplates.map((template: any, i: number) => (
                        <button
                          key={template.id ?? i}
                          onClick={() => applyTemplate(template)}
                          className="flex flex-col gap-1.5 text-left p-3.5 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                        >
                          {template.category === lead?.category && (
                            <span className="self-start text-[9px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              Matches lead
                            </span>
                          )}
                          <p className="text-sm font-semibold text-slate-900 leading-snug">
                            {formatCategoryLabel(template.category) || 'Untitled Template'}
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-1">
                            <span className="text-[11px] text-slate-400">
                              {template.items?.length || 0} item{(template.items?.length || 0) === 1 ? '' : 's'}
                            </span>
                            <span className="text-xs font-bold text-emerald-600">{fmt(template.total || 0)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="relative shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      placeholder="Search saved line items..."
                      className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-slate-400 focus:bg-white transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    {filteredLineItems.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8">
                        {itemSearchQuery ? 'No matching line items found.' : 'No line items saved in any template yet.'}
                      </p>
                    ) : (
                      filteredLineItems.map((item, i) => {
                        const isAdded = addedKeys.has(poolItemKey(item));
                        return (
                          <button
                            key={i}
                            onClick={() => addPoolItemToQuote(item)}
                            className={`w-full flex items-center justify-between gap-2 sm:gap-3 p-3 border rounded-lg transition cursor-pointer text-left active:scale-[0.98] ${
                              isAdded
                                ? 'border-emerald-200 bg-emerald-50/60'
                                : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">{item.description}</p>
                              <p className="text-[11px] text-slate-400">{formatCategoryLabel(item.category)}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-bold text-slate-900 tabular-nums">
                                {fmt(item.unitPrice)}
                                {item.quantity !== 1 ? ` ×${item.quantity}` : ''}
                              </span>
                              {isAdded ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700 shrink-0">
                                  <Check className="w-3 h-3" />
                                  <span className="hidden sm:inline">Added</span>
                                </span>
                              ) : (
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50">
                                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
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
              <h3 className="text-base font-bold text-slate-900 mb-1">Apply "{formatCategoryLabel(pendingTemplate.category)}" template?</h3>
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

      {/* CLEAR ALL ITEMS CONFIRM MODAL — starts the current quote over from
          scratch. This never touches saved templates. */}
      <AnimatePresence>
        {showClearAllConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowClearAllConfirm(false)}
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
              <h3 className="text-base font-bold text-slate-900 mb-1">Clear all items?</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                This removes every line item on this quote so you can start fresh. It doesn't touch any saved
                templates — just this quote.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowClearAllConfirm(false)}
                  className="py-2.5 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllItems}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
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
    </>
  );
}