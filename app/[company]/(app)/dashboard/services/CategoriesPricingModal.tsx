'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  X,
  Trash2,
  AlertCircle,
  Percent,
  HandCoins,
  Receipt,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  type Category,
  type QuoteTemplate,
  type LineItem,
  type DepositType,
  fmt,
  clean,
  depositFor,
  depositLabel,
  noSpinners,
} from './CategoriesTaskEditorModal';

type Props = {
  companySlug: string;
  category: Category;
  existingTemplate: QuoteTemplate | undefined;
  taxRate: number;
  depositType: DepositType | null;
  depositValue: number;
  isDark: boolean;
  onClose: () => void;
  onSaved: (updatedTemplates: QuoteTemplate[]) => void;
};

export default function CategoriesPricingModal({
  companySlug,
  category,
  existingTemplate,
  taxRate,
  depositType,
  depositValue,
  isDark,
  onClose,
  onSaved,
}: Props) {
  const mapExisting = (tpl: QuoteTemplate | undefined): LineItem[] =>
    tpl
      ? tpl.items.map((item: any, i: number) => {
          const qty = clean(item.quantity ?? item.qty ?? 1) || 1;
          const price = clean(item.unitPrice ?? item.unit_price ?? item.unitCost ?? item.unit_cost ?? 0);
          return {
            id: `item_${Date.now() + i}`,
            description: String(item.description || item.label || ''),
            quantity: qty,
            unitPrice: price,
            amount: qty * price,
          };
        })
      : [];

  const [editingLineItems, setEditingLineItems] = useState<LineItem[]>(mapExisting(existingTemplate));
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [lineItemError, setLineItemError] = useState('');
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  // Accordion state - closed by default
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const addLineItem = () => {
    if (!newDesc.trim()) {
      setLineItemError('Enter an item description.');
      return;
    }

    const price = Math.round(clean(newPrice) * 100) / 100;
    if (!newPrice || price === 0) {
      setLineItemError('Enter a valid price.');
      return;
    }

    const qty = clean(newQty) || 1;
    setEditingLineItems((prev) => [
      ...prev,
      { id: `item_${Date.now()}`, description: newDesc.trim(), quantity: qty, unitPrice: price, amount: qty * price },
    ]);
    setNewDesc('');
    setNewPrice('');
    setNewQty('1');
    setLineItemError('');
  };

  const updateLineItem = (id: string, field: 'description' | 'quantity' | 'unitPrice', value: string) => {
    setEditingLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'description') return { ...item, description: value };
        const rawNum = clean(value);
        const num = field === 'unitPrice' ? Math.round(rawNum * 100) / 100 : rawNum;
        const qty = field === 'quantity' ? num || 1 : item.quantity;
        const price = field === 'unitPrice' ? num : item.unitPrice;
        return { ...item, [field]: num, amount: qty * price };
      })
    );
  };

  const effectiveTaxRate = category.tax_rate_override ?? taxRate;
  const subtotal = editingLineItems.reduce((s, i) => s + i.amount, 0);
  const taxAmount = subtotal * (effectiveTaxRate / 100);
  const total = subtotal + taxAmount;
  const deposit = depositFor(total, depositType, depositValue);
  const balance = total - deposit;

  const save = async () => {
    if (newDesc.trim() || newPrice) {
      setLineItemError('Click + to add this item before saving.');
      return;
    }
    if (editingLineItems.length === 0) {
      setQuoteError('Add at least one line item.');
      return;
    }
    setQuoteSaving(true);
    setQuoteError('');

    const templateData = {
      id: existingTemplate?.id || `custom_${Date.now()}`,
      category: category.value,
      items: editingLineItems,
      total,
      tax_rate: effectiveTaxRate,
      deposit_type: depositValue > 0 ? depositType : null,
      deposit_value: depositValue > 0 ? depositValue : null,
    };

    try {
      const res = await fetch(`/api/company/${companySlug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: existingTemplate ? 'update' : 'create', template: templateData }),
      });
      const result = await res.json();
      if (result.success) {
        onSaved(result.templates || []);
        onClose();
      } else {
        setQuoteError(result.error || 'Failed to save template.');
      }
    } catch {
      setQuoteError('Network error. Please try again.');
    } finally {
      setQuoteSaving(false);
    }
  };

  const deleteTemplate = async () => {
    if (!existingTemplate || !confirm('Remove this pricing template?')) return;
    try {
      const res = await fetch(`/api/company/${companySlug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', templateId: existingTemplate.id }),
      });
      const result = await res.json();
      if (result.success) {
        onSaved(result.templates || []);
        onClose();
      }
    } catch {}
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all ${
          isDark
            ? 'border-slate-800 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex shrink-0 items-center justify-between border-b px-6 py-4.5 ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Estimate Template
              </h3>
              <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {category.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer ${
              isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Table Header (Desktop) */}
          <div
            className={`hidden grid-cols-[1fr_120px_80px_100px_40px] items-center border-b px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider ${
              isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-700'
            } sm:grid`}
          >
            <span>Description</span>
            <span className="text-right">Unit Price</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Amount</span>
            <span></span>
          </div>

          {/* Line Items List */}
          <div className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
            {editingLineItems.map((item) => (
              <div
                key={item.id}
                className={`relative flex flex-col gap-3 p-4 transition-colors sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:gap-2 sm:px-6 sm:py-3 ${
                  isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/80'
                }`}
              >
                <div>
                  <input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Line item description"
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none transition ${
                      isDark
                        ? 'border-slate-800 bg-slate-950 text-white focus:border-emerald-500'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:contents">
                  <div
                    className={`flex items-center rounded-xl border px-2.5 py-1.5 transition ${
                      isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-300 bg-white'
                    } focus-within:border-emerald-500`}
                  >
                    <span className="mr-1 text-xs font-bold text-emerald-500">$</span>
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                      className={`w-full bg-transparent py-0.5 text-xs font-bold outline-none sm:text-right ${noSpinners} ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-center">
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 text-center text-xs font-bold outline-none transition ${
                        isDark
                          ? 'border-slate-800 bg-slate-950 text-white focus:border-emerald-500'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-500'
                      } ${noSpinners}`}
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {fmt(item.amount)}
                    </span>
                  </div>
                </div>

                <div className="absolute right-3 top-3 sm:static sm:flex sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingLineItems((prev) => prev.filter((x) => x.id !== item.id))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 transition hover:bg-rose-500/10 cursor-pointer"
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Line Item Row */}
            <div
              className={`p-4 sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:gap-2 sm:px-6 sm:py-3 ${
                lineItemError ? 'bg-rose-500/5' : ''
              }`}
            >
              <div className="mb-2 sm:mb-0">
                <input
                  value={newDesc}
                  onChange={(e) => {
                    setNewDesc(e.target.value);
                    setLineItemError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && addLineItem()}
                  placeholder="Add item (e.g., Labor, Materials)"
                  className={`w-full rounded-xl border px-3 py-2 text-xs font-semibold outline-none transition ${
                    isDark
                      ? 'border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 focus:border-emerald-500'
                      : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-[1fr_65px_40px] gap-2 sm:contents">
                <div
                  className={`flex items-center rounded-xl border px-2.5 py-2 transition ${
                    isDark
                      ? 'border-slate-800 bg-slate-950'
                      : 'border-slate-300 bg-slate-50'
                  } focus-within:border-emerald-500`}
                >
                  <span className="mr-1 text-xs font-bold text-emerald-500">$</span>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => {
                      setNewPrice(e.target.value);
                      setLineItemError('');
                    }}
                    placeholder="0.00"
                    className={`w-full border-none bg-transparent p-0 text-xs font-bold outline-none focus:ring-0 sm:text-right ${noSpinners} ${
                      isDark
                        ? 'text-white placeholder:text-slate-500'
                        : 'text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-center">
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className={`w-full rounded-xl border px-3 py-2 text-center text-xs font-bold outline-none transition ${
                      isDark
                        ? 'border-slate-800 bg-slate-950 text-white focus:border-emerald-500'
                        : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-500'
                    } ${noSpinners}`}
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 cursor-pointer shadow-xs"
                    aria-label="Add line item"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          <div className="px-6 pt-2 space-y-2">
            {lineItemError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-bold text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0" /> {lineItemError}
              </div>
            )}
            {quoteError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-bold text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0" /> {quoteError}
              </div>
            )}
          </div>

          {/* Financial Summary Accordion */}
          <div className="p-6">
            <div
              className={`overflow-hidden rounded-2xl border transition-all ${
                isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50/60'
              }`}
            >
              {/* Accordion Trigger Header */}
              <button
                type="button"
                onClick={() => setIsSummaryExpanded((prev) => !prev)}
                className={`flex w-full items-center justify-between p-4 transition cursor-pointer ${
                  isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <span>Total Estimate:</span>
                  <span className="text-base font-extrabold">{fmt(total)}</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 text-xs font-bold ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <span>{isSummaryExpanded ? 'Hide Details' : 'View Breakdown'}</span>
                  {isSummaryExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {/* Collapsible Content */}
              <AnimatePresence initial={false}>
                {isSummaryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`border-t p-4 space-y-3 ${
                        isDark ? 'border-slate-800' : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-1.5 text-xs font-bold">
                        <div
                          className={`flex items-center justify-between ${
                            isDark ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          <span>Subtotal</span>
                          <span className={isDark ? 'text-white' : 'text-slate-900'}>{fmt(subtotal)}</span>
                        </div>
                        {effectiveTaxRate > 0 && (
                          <div
                            className={`flex items-center justify-between ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <Percent className="h-3 w-3 text-emerald-500" /> Tax ({effectiveTaxRate}%)
                              {category.tax_rate_override != null && (
                                <span className="text-[10px] text-amber-500">(custom)</span>
                              )}
                            </span>
                            <span className={isDark ? 'text-white' : 'text-slate-900'}>{fmt(taxAmount)}</span>
                          </div>
                        )}
                      </div>

                      {/* Deposit Ribbon */}
                      <div
                        className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                          isDark
                            ? 'border-slate-800 bg-slate-900 text-slate-300'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <HandCoins className="h-3.5 w-3.5 text-amber-500" />
                          Deposit Required:{' '}
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {depositLabel(depositType, depositValue)}
                          </span>
                        </span>
                        {deposit > 0 && (
                          <span className="sm:ml-auto">
                            Due at signing:{' '}
                            <span className="font-bold text-amber-600 dark:text-amber-400">{fmt(deposit)}</span>
                            {' '}· Balance:{' '}
                            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {fmt(balance)}
                            </span>
                          </span>
                        )}
                      </div>

                      {depositType === 'fixed' && depositValue > total && total > 0 && (
                        <p className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
                          <AlertCircle className="h-3 w-3 shrink-0" />
                          Fixed deposit exceeds the total estimate and will be capped at {fmt(total)}.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`flex items-center justify-between border-t px-6 py-4.5 ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
          }`}
        >
          {existingTemplate ? (
            <button
              type="button"
              onClick={deleteTemplate}
              className="rounded-xl border border-rose-500/30 px-4 py-2.5 text-xs font-bold text-rose-500 transition hover:bg-rose-500/10 cursor-pointer"
            >
              Delete Template
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                isDark
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={quoteSaving}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {quoteSaving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}