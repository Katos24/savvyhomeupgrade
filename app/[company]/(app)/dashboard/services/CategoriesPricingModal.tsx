'use client';

import { useState } from 'react';
import { Plus, X, Trash2, AlertCircle, Percent, HandCoins, Receipt, Tag } from 'lucide-react';
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
  themeTokens,
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
  const t = themeTokens(isDark);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl ${t.overlayCard} shadow-2xl transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex shrink-0 items-center justify-between border-b ${t.border} px-6 py-4`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${t.cardText}`}>Pricing Template</h3>
              <p className={`text-xs ${t.subText}`}>{category.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`rounded-xl p-1.5 ${t.subText} transition hover:bg-white/10`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Table Header (Desktop) */}
          <div className={`hidden grid-cols-[1fr_120px_80px_100px_40px] items-center border-b ${t.border} px-6 py-2.5 text-[10px] font-semibold uppercase tracking-wider ${t.subText} sm:grid`}>
            <span>Description</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Amount</span>
            <span></span>
          </div>

          {/* Line Items List */}
          <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
            {editingLineItems.map((item) => (
              <div
                key={item.id}
                className={`relative flex flex-col gap-3 p-4 transition-colors sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:gap-2 sm:px-6 sm:py-3 ${t.hoverBg}`}
              >
                <div>
                  <input
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Line item description"
                    className={`w-full rounded-lg border ${t.border} bg-transparent px-3 py-1.5 text-xs font-medium outline-none focus:border-emerald-500/50 ${t.cardText}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:contents">
                  <div className="flex items-center rounded-lg border border-transparent focus-within:border-emerald-500/50 sm:justify-end">
                    <span className={`text-xs ${t.subText}`}>$</span>
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                      className={`w-full bg-transparent py-1.5 pl-1 text-xs font-semibold outline-none sm:text-right ${noSpinners} ${t.cardText}`}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                      className={`w-full rounded-lg border ${t.border} bg-transparent py-1.5 text-center text-xs font-semibold outline-none focus:border-emerald-500/50 sm:border-none sm:text-right ${noSpinners} ${t.cardText}`}
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <span className="text-xs font-semibold text-emerald-500">{fmt(item.amount)}</span>
                  </div>
                </div>

                <div className="absolute right-3 top-3 sm:static sm:flex sm:items-center sm:justify-end">
                  <button
                    onClick={() => setEditingLineItems((prev) => prev.filter((x) => x.id !== item.id))}
                    className={`rounded-lg p-1.5 ${t.subText} transition hover:bg-rose-500/10 hover:text-rose-500`}
                    aria-label="Remove line item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Line Item Row */}
            <div className={`p-4 sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:gap-2 sm:px-6 sm:py-3 ${lineItemError ? 'bg-rose-500/5' : ''}`}>
              <div className="mb-2 sm:mb-0">
                <input
                  value={newDesc}
                  onChange={(e) => {
                    setNewDesc(e.target.value);
                    setLineItemError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && addLineItem()}
                  placeholder="Add item (e.g., Labor, Materials)"
                  className={`w-full rounded-lg border ${t.border} bg-transparent px-3 py-1.5 text-xs font-medium outline-none focus:border-emerald-500/50 placeholder:${t.subText} ${t.cardText}`}
                />
              </div>

              <div className="grid grid-cols-[1fr_60px_40px] gap-2 sm:contents">
                <div className={`flex items-center rounded-lg border ${t.border} px-2.5 py-1.5 focus-within:border-emerald-500/50`}>
                  <span className="mr-1 text-xs text-emerald-500">$</span>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => {
                      setNewPrice(e.target.value);
                      setLineItemError('');
                    }}
                    placeholder="0.00"
                    className={`w-full border-none bg-transparent p-0 text-xs font-semibold outline-none focus:ring-0 sm:text-right ${noSpinners} ${t.cardText}`}
                  />
                </div>

                <div>
                  <input
                    type="number"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                    className={`w-full rounded-lg border ${t.border} bg-transparent py-1.5 text-center text-xs font-semibold outline-none focus:border-emerald-500/50 sm:text-right ${noSpinners} ${t.cardText}`}
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={addLineItem}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 active:scale-95"
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
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs font-medium text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0" /> {lineItemError}
              </div>
            )}
            {quoteError && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs font-medium text-rose-500">
                <AlertCircle className="h-4 w-4 shrink-0" /> {quoteError}
              </div>
            )}
          </div>

          {/* Financial Summary Box */}
          <div className="p-6">
            <div className={`rounded-xl border ${t.border} ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'} p-4 space-y-3`}>
              <div className="space-y-1.5 text-xs font-medium">
                <div className={`flex items-center justify-between ${t.subText}`}>
                  <span>Subtotal</span>
                  <span className={`font-semibold ${t.cardText}`}>{fmt(subtotal)}</span>
                </div>
                {effectiveTaxRate > 0 && (
                  <div className={`flex items-center justify-between ${t.subText}`}>
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3 text-emerald-500" /> Tax ({effectiveTaxRate}%)
                      {category.tax_rate_override != null && <span className="text-[10px] text-amber-500">(custom)</span>}
                    </span>
                    <span className={`font-semibold ${t.cardText}`}>{fmt(taxAmount)}</span>
                  </div>
                )}
              </div>

              <div className={`flex items-center justify-between border-t pt-2.5 ${t.border}`}>
                <span className={`text-xs font-bold uppercase tracking-wider ${t.cardText}`}>Total Estimate</span>
                <span className="text-lg font-bold text-emerald-500">{fmt(total)}</span>
              </div>

              {/* Deposit Ribbon */}
              <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border ${t.border} bg-transparent px-3 py-2 text-xs ${t.subText}`}>
                <span className="flex items-center gap-1.5">
                  <HandCoins className="h-3.5 w-3.5 text-amber-500" />
                  Deposit Required: <span className={`font-semibold ${t.cardText}`}>{depositLabel(depositType, depositValue)}</span>
                </span>
                {deposit > 0 && (
                  <span className="sm:ml-auto">
                    Due at signing: <span className="font-semibold text-amber-500">{fmt(deposit)}</span>
                    {' '}· Balance: <span className={`font-semibold ${t.cardText}`}>{fmt(balance)}</span>
                  </span>
                )}
              </div>

              {depositType === 'fixed' && depositValue > total && total > 0 && (
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-500">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  Fixed deposit exceeds the total estimate and will be capped at {fmt(total)}.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-between border-t ${t.border} px-6 py-4`}>
          {existingTemplate ? (
            <button
              onClick={deleteTemplate}
              className="rounded-xl border border-rose-500/20 px-4 py-2.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-500/10"
            >
              Delete Template
            </button>
          ) : (
            <button
              onClick={onClose}
              className={`rounded-xl border ${t.border} px-4 py-2.5 text-xs font-semibold ${t.subText} transition hover:bg-white/5`}
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={quoteSaving}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
            >
              {quoteSaving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}