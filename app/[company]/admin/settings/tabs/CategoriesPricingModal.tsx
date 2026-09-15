'use client';

import { useState } from 'react';
import { Plus, X, Trash2, AlertCircle, Percent, HandCoins } from 'lucide-react';
import {
  type Category, type QuoteTemplate, type LineItem, type DepositType,
  fmt, clean, depositFor, depositLabel, noSpinners, themeTokens,
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
      setLineItemError('Enter a description.');
      return;
    }
    // Same cents-rounding as updateLineItem above, applied before the
    // zero-check so "0.001" doesn't slip through as a nonzero price.
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
        // Rounded to cents at the point of commit — a price with more
        // than 2 decimal places doesn't correspond to real currency and
        // would otherwise propagate into the quote total and deposit math.
        // FOUND A SECOND BUG FIXING THIS: the original stored the raw
        // unrounded `num` into the field while computing `amount` off a
        // separate `price` variable — meaning the displayed unit price and
        // the amount it was multiplied into could silently disagree.
        const num = field === 'unitPrice' ? Math.round(rawNum * 100) / 100 : rawNum;
        const qty = field === 'quantity' ? num || 1 : item.quantity;
        const price = field === 'unitPrice' ? num : item.unitPrice;
        return { ...item, [field]: num, amount: qty * price };
      })
    );
  };

    // Exempt categories always compute at 0%, regardless of the
  // company-wide rate — the toggle lives on the category itself, set
  // from the Services list, not editable from inside this modal.
  const effectiveTaxRate = category.tax_exempt ? 0 : taxRate;
  const subtotal = editingLineItems.reduce((s, i) => s + i.amount, 0);
  const taxAmount = subtotal * (effectiveTaxRate / 100);
  const total = subtotal + taxAmount;
  const deposit = depositFor(total, depositType, depositValue);
  const balance = total - deposit;

  const save = async () => {
    if (newDesc.trim() || newPrice) {
      setLineItemError('Click + to add this item first.');
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
        setQuoteError(result.error || 'Failed to save.');
      }
    } catch {
      setQuoteError('Network error.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`flex max-h-[85vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl ${t.overlayCard} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`sticky top-0 z-10 flex shrink-0 items-center justify-between border-b ${t.border} ${t.overlayCard} px-6 py-5`}>
          <div>
            <p className={`text-sm font-semibold ${t.cardText}`}>Pricing Template</p>
            <p className={`text-xs ${t.subText}`}>{category.label}</p>
          </div>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${t.subText} transition hover:bg-white/10`} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={`hidden shrink-0 grid-cols-[1fr_120px_80px_100px_40px] gap-0 border-b ${t.border} px-6 py-3 sm:grid`}>
          {['Item Description', 'Unit Price', 'Qty', 'Total', ''].map((h, i) => (
            <span key={i} className={`text-[10px] font-semibold uppercase tracking-wide ${t.subText} ${i > 0 && i < 4 ? 'text-right' : ''}`}>
              {h}
            </span>
          ))}
        </div>

        <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-slate-100'}`}>
          {editingLineItems.map((item) => (
            <div
              key={item.id}
              className={`relative flex flex-col gap-3 p-5 transition-colors sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:gap-0 sm:p-0 ${t.hoverBg}`}
            >
              <div className="sm:px-6">
                <input
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  className={`w-full rounded-lg border ${t.border} bg-transparent px-3 py-2 text-sm font-medium outline-none sm:border-none sm:py-4 ${t.cardText}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:contents">
                <div className={`flex flex-col sm:border-l sm:px-4 ${t.border}`}>
                  <div className="flex items-center rounded-lg px-2 sm:justify-end">
                    <span className={`text-xs ${t.subText}`}>$</span>
                    <input
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', e.target.value)}
                      className={`w-full border-none bg-transparent py-2 text-sm font-semibold outline-none focus:ring-0 sm:text-right ${noSpinners} ${t.cardText}`}
                    />
                  </div>
                </div>

                <div className={`flex flex-col sm:border-l sm:px-4 ${t.border}`}>
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                    className={`w-full bg-transparent py-2 text-center text-sm font-semibold outline-none focus:ring-0 sm:text-right ${noSpinners} ${t.cardText}`}
                  />
                </div>

                <div className={`flex flex-col sm:border-l sm:px-4 ${t.border}`}>
                  <div className="flex h-full items-center justify-center text-center text-sm font-semibold text-emerald-500 sm:justify-end sm:py-4 sm:text-right">
                    {fmt(item.amount)}
                  </div>
                </div>
              </div>

              <div className="absolute right-4 top-4 sm:static sm:flex sm:items-center sm:justify-center">
                <button
                  onClick={() => setEditingLineItems((prev) => prev.filter((x) => x.id !== item.id))}
                  className={`rounded-lg p-2 ${t.subText} transition hover:text-rose-500`}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className={`border-t border-dashed p-5 sm:grid sm:grid-cols-[1fr_120px_80px_100px_40px] sm:items-center sm:p-0 ${t.border} ${lineItemError ? 'bg-rose-500/5' : ''}`}>
            <div className="mb-3 sm:mb-0 sm:px-6">
              <input
                value={newDesc}
                onChange={(e) => {
                  setNewDesc(e.target.value);
                  setLineItemError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && addLineItem()}
                placeholder="Item name (e.g. Labor)"
                className={`w-full rounded-lg border ${t.border} bg-transparent px-4 py-3 text-sm font-medium outline-none placeholder:${t.subText} sm:border-none sm:py-4 ${t.cardText}`}
              />
            </div>

            <div className="grid grid-cols-[1fr_80px_60px] gap-2 sm:contents">
              <div className={`flex items-center rounded-lg border ${t.border} px-3 sm:border-none sm:px-4`}>
                <span className="mr-1 text-xs text-emerald-500">$</span>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => {
                    setNewPrice(e.target.value);
                    setLineItemError('');
                  }}
                  placeholder="0.00"
                  className={`w-full border-none bg-transparent py-3 text-sm font-semibold outline-none focus:ring-0 sm:text-right ${noSpinners} ${t.cardText}`}
                />
              </div>
              <div className={`sm:border-l sm:px-4 ${t.border}`}>
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  className={`w-full rounded-lg border ${t.border} bg-transparent py-3 text-center text-sm font-semibold outline-none focus:ring-0 sm:border-none sm:text-right ${noSpinners} ${t.cardText}`}
                />
              </div>
              <div className={`flex items-center justify-center sm:border-l ${t.border}`}>
                <button
                  onClick={addLineItem}
                  className="flex h-full w-full items-center justify-center rounded-lg bg-emerald-600 text-white transition active:scale-95 sm:h-10 sm:w-10"
                  aria-label="Add item"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
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

          <div className="space-y-1.5">
            <div className={`flex items-center justify-between text-xs font-medium ${t.subText}`}>
              <span>Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
                        {effectiveTaxRate > 0 && (
              <div className={`flex items-center justify-between text-xs font-medium ${t.subText}`}>
                <span>Tax ({effectiveTaxRate}%)</span>
                <span>{fmt(taxAmount)}</span>
              </div>
            )}
            <div className={`flex items-center justify-between border-t pt-2 ${t.border}`}>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${t.subText}`}>Total estimate</span>
              <span className="text-xl font-bold text-emerald-500">{fmt(total)}</span>
            </div>
          </div>

          <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border ${t.border} px-4 py-3 text-xs font-medium ${t.subText}`}>
                        <span className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-emerald-500" />
              Tax: <span className={`font-semibold ${t.cardText}`}>{effectiveTaxRate}%</span>
              {category.tax_exempt && <span className="text-amber-500">(exempt)</span>}
            </span>
            <span className="flex items-center gap-1.5">
              <HandCoins className="h-3.5 w-3.5 text-amber-500" />
              Deposit: <span className={`font-semibold ${t.cardText}`}>{depositLabel(depositType, depositValue)}</span>
            </span>
            {deposit > 0 && (
              <span className={`text-[11px] sm:ml-auto ${t.subText}`}>
                Due at signing: <span className="font-semibold text-amber-500">{fmt(deposit)}</span>
                {' '}· Balance: <span className={`font-semibold ${t.cardText}`}>{fmt(balance)}</span>
              </span>
            )}
          </div>

          {depositType === 'fixed' && depositValue > total && total > 0 && (
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-500">
              <AlertCircle className="h-3 w-3 shrink-0" />
              Deposit is more than the estimate. It will be capped at the total.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            {existingTemplate ? (
              <button
                onClick={deleteTemplate}
                className={`rounded-xl border ${t.border} py-3 text-[11px] font-semibold uppercase tracking-wide text-rose-500 transition hover:bg-rose-500/10`}
              >
                Delete Template
              </button>
            ) : (
              <button
                onClick={onClose}
                className={`rounded-xl border ${t.border} py-3 text-[11px] font-semibold uppercase tracking-wide ${t.subText} transition hover:bg-white/5`}
              >
                Cancel
              </button>
            )}
            <button
              onClick={save}
              disabled={quoteSaving}
              className="rounded-xl bg-emerald-600 py-3 text-[11px] font-semibold uppercase tracking-wide text-white transition active:scale-[0.98] disabled:opacity-60 hover:bg-emerald-700"
            >
              {quoteSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}