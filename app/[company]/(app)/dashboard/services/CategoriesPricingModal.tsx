'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import {
  type Category,
  type QuoteTemplate,
  type LineItem,
  type DepositType,
  fmt,
  clean,
  depositFor,
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

type DepositMode = 'default' | 'custom' | 'none';

const cents = (n: number) => Math.round(n * 100) / 100;

function tokens(isDark: boolean) {
  return isDark
    ? {
        panel: 'border-white/10 bg-[#0f1420] text-slate-100',
        bar: 'border-white/10',
        text: 'text-white',
        sub: 'text-slate-400',
        faint: 'text-slate-500',
        divide: 'divide-white/10',
        iconBtn: 'text-slate-400 hover:bg-white/10 hover:text-white',
        btn: 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        input: 'border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-white/40',
        box: 'border-white/10 bg-white/[0.02]',
        seg: 'border-white/10 bg-white/5',
        segOn: 'bg-white text-slate-900',
        segOff: 'text-slate-300 hover:bg-white/10',
      }
    : {
        panel: 'border-slate-200 bg-white text-slate-900',
        bar: 'border-slate-100',
        text: 'text-slate-900',
        sub: 'text-slate-500',
        faint: 'text-slate-400',
        divide: 'divide-slate-100',
        iconBtn: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        btn: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        input: 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500',
        box: 'border-slate-200 bg-slate-50',
        seg: 'border-slate-200 bg-white',
        segOn: 'bg-slate-900 text-white',
        segOff: 'text-slate-600 hover:bg-slate-50',
      };
}

const describeDeposit = (type: DepositType | null, value: number) =>
  !type || !(value > 0) ? 'None' : type === 'percent' ? `${value}% of the total` : `${fmt(value)} flat`;

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
  const c = tokens(isDark);

  const [items, setItems] = useState<LineItem[]>(() =>
    existingTemplate
      ? existingTemplate.items.map((item: any, i: number) => {
          const qty = clean(item.quantity ?? item.qty ?? 1) || 1;
          const price = clean(item.unitPrice ?? item.unit_price ?? item.unitCost ?? item.unit_cost ?? 0);
          return {
            id: `item_${Date.now() + i}`,
            description: String(item.description || item.label || ''),
            quantity: qty,
            unitPrice: price,
            amount: cents(qty * price),
          };
        })
      : []
  );

  // Deposit for this service: follow the default, set its own, or none.
  const hasDefault = !!depositType && depositValue > 0;
  const [depositMode, setDepositMode] = useState<DepositMode>(() => {
    if (!existingTemplate) return hasDefault ? 'default' : 'none';
    const tType = existingTemplate.deposit_type ?? null;
    const tVal = Number(existingTemplate.deposit_value ?? 0);
    if (!tType || !(tVal > 0)) return 'none';
    if (hasDefault && tType === depositType && tVal === depositValue) return 'default';
    return 'custom';
  });
  const [customType, setCustomType] = useState<DepositType>(
    (existingTemplate?.deposit_type as DepositType) || depositType || 'percent'
  );
  const [customValue, setCustomValue] = useState(
    existingTemplate?.deposit_value ? String(existingTemplate.deposit_value) : ''
  );

  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [itemError, setItemError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const touch = () => setDirty(true);

  const requestClose = () => {
    if (saving || deleting) return;
    if (dirty || newDesc.trim() || newPrice) setConfirmDiscard(true);
    else onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirmDiscard) setConfirmDiscard(false);
      else if (confirmDelete) setConfirmDelete(false);
      else requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmDiscard, confirmDelete, dirty, newDesc, newPrice, saving, deleting]);

  // Builds the typed "new item" row; returns null and shows an error if invalid.
  const buildNewItem = (): LineItem | null => {
    if (!newDesc.trim()) {
      setItemError('Describe the item.');
      return null;
    }
    const price = cents(clean(newPrice));
    if (!newPrice || price === 0) {
      setItemError('Enter a price.');
      return null;
    }
    const qty = clean(newQty) || 1;
    return { id: `item_${Date.now()}`, description: newDesc.trim(), quantity: qty, unitPrice: price, amount: cents(qty * price) };
  };

  const addItem = () => {
    const item = buildNewItem();
    if (!item) return;
    setItems((prev) => [...prev, item]);
    setNewDesc('');
    setNewPrice('');
    setNewQty('1');
    setItemError('');
    touch();
  };

  const updateItem = (id: string, field: 'description' | 'quantity' | 'unitPrice', value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (field === 'description') return { ...item, description: value };
        const raw = clean(value);
        const num = field === 'unitPrice' ? cents(raw) : raw;
        const qty = field === 'quantity' ? num || 1 : item.quantity;
        const price = field === 'unitPrice' ? num : item.unitPrice;
        return { ...item, [field]: num, amount: cents(qty * price) };
      })
    );
    touch();
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((x) => x.id !== id));
    touch();
  };

  // Totals
  const effectiveTaxRate = category.tax_rate_override ?? taxRate;
  const subtotal = cents(items.reduce((s, i) => s + i.amount, 0));
  const taxAmount = cents(subtotal * (effectiveTaxRate / 100));
  const total = cents(subtotal + taxAmount);

  const customNum = clean(customValue);
  const chosen = useMemo((): { type: DepositType | null; value: number } => {
    if (depositMode === 'default') return hasDefault ? { type: depositType, value: depositValue } : { type: null, value: 0 };
    if (depositMode === 'custom') return customNum > 0 ? { type: customType, value: customNum } : { type: null, value: 0 };
    return { type: null, value: 0 };
  }, [depositMode, hasDefault, depositType, depositValue, customType, customNum]);

  const deposit = chosen.type ? depositFor(total, chosen.type, chosen.value) : 0;
  const balance = cents(total - deposit);

  const save = async () => {
    let finalItems = items;
    if (newDesc.trim() || newPrice) {
      const pending = buildNewItem();
      if (!pending) return;
      finalItems = [...items, pending];
    }
    if (finalItems.length === 0) {
      setError('Add at least one item.');
      return;
    }
    if (finalItems.some((i) => !i.description.trim())) {
      setError('Every item needs a description.');
      return;
    }
    if (depositMode === 'custom') {
      if (!(customNum > 0)) {
        setError('Enter a deposit amount, or pick None.');
        return;
      }
      if (customType === 'percent' && customNum > 100) {
        setError("A percent deposit can't be more than 100.");
        return;
      }
    }

    const finalSubtotal = cents(finalItems.reduce((s, i) => s + i.amount, 0));
    const finalTotal = cents(finalSubtotal + finalSubtotal * (effectiveTaxRate / 100));

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/company/${companySlug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: existingTemplate ? 'update' : 'create',
          template: {
            id: existingTemplate?.id || `custom_${Date.now()}`,
            category: category.value,
            items: finalItems.map((i) => ({ ...i, description: i.description.trim() })),
            total: finalTotal,
            tax_rate: effectiveTaxRate,
            deposit_type: chosen.type,
            deposit_value: chosen.type ? chosen.value : null,
          },
        }),
      });
      const result = await res.json();
      if (result.success) {
        onSaved(result.templates || []);
        onClose();
      } else {
        setError(result.error || 'Could not save the estimate template.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async () => {
    if (!existingTemplate) return;
    setDeleting(true);
    setError('');
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
      } else {
        setError(result.error || 'Could not remove the template.');
        setConfirmDelete(false);
      }
    } catch {
      setError('Network error. Try again.');
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const numInput = `w-full rounded-lg border px-2.5 py-2 text-base sm:text-sm outline-none transition ${c.input} ${noSpinners}`;
  const COLS = 'sm:grid-cols-[minmax(0,1fr)_110px_64px_96px_32px]';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={requestClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Estimate template for ${category.label}`}
        className={`flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border shadow-2xl sm:rounded-2xl ${c.panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${c.bar}`}>
          <div className="min-w-0">
            <h3 className={`truncate text-base font-semibold ${c.text}`}>Estimate template</h3>
            <p className={`truncate text-xs ${c.sub}`}>{category.label}</p>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${c.iconBtn}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <p className={`text-sm ${c.sub}`}>
            Your usual price for <span className={`font-semibold ${c.text}`}>{category.label}</span>. Load it into any
            quote in one click, then adjust it for that job.
          </p>

          {/* Items */}
          <section>
            <h4 className={`mb-2 text-sm font-semibold ${c.text}`}>Items</h4>
            <div className={`overflow-hidden rounded-xl border ${c.box}`}>
              <div className={`hidden gap-2 border-b px-3 py-2 text-xs font-medium sm:grid ${COLS} ${c.bar} ${c.faint}`}>
                <span>Description</span>
                <span className="text-right">Price</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Amount</span>
                <span />
              </div>

              <ul className={`divide-y ${c.divide}`}>
                {items.map((item) => (
                  <li key={item.id} className={`grid grid-cols-[1fr_auto] gap-2 px-3 py-2.5 sm:items-center ${COLS}`}>
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Description"
                      maxLength={200}
                      className={`col-span-2 w-full rounded-lg border px-2.5 py-2 text-base sm:text-sm outline-none transition sm:col-span-1 ${c.input}`}
                    />
                    <div className="col-span-2 grid grid-cols-[1fr_64px_auto_32px] items-center gap-2 sm:contents">
                      <label className="relative block">
                        <span className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm ${c.faint}`}>$</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)}
                          aria-label="Price"
                          className={`${numInput} pl-6 text-right`}
                        />
                      </label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        aria-label="Quantity"
                        className={`${numInput} text-center`}
                      />
                      <span className={`min-w-[72px] text-right text-sm font-semibold tabular-nums ${c.text}`}>
                        {fmt(item.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                        aria-label={`Remove ${item.description || 'item'}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}

                {/* New item */}
                <li className={`grid grid-cols-[1fr_auto] gap-2 px-3 py-2.5 sm:items-center ${COLS}`}>
                  <input
                    value={newDesc}
                    onChange={(e) => {
                      setNewDesc(e.target.value);
                      setItemError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                    placeholder={items.length ? 'Add another item' : 'e.g. Labor, Materials, Disposal'}
                    maxLength={200}
                    className={`col-span-2 w-full rounded-lg border px-2.5 py-2 text-base sm:text-sm outline-none transition sm:col-span-1 ${
                      itemError ? 'border-rose-500' : ''
                    } ${c.input}`}
                  />
                  <div className="col-span-2 grid grid-cols-[1fr_64px_auto_32px] items-center gap-2 sm:contents">
                    <label className="relative block">
                      <span className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm ${c.faint}`}>$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={newPrice}
                        onChange={(e) => {
                          setNewPrice(e.target.value);
                          setItemError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && addItem()}
                        placeholder="0.00"
                        aria-label="Price"
                        className={`${numInput} pl-6 text-right`}
                      />
                    </label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addItem()}
                      aria-label="Quantity"
                      className={`${numInput} text-center`}
                    />
                    <span className={`min-w-[72px] text-right text-sm tabular-nums ${c.faint}`}>
                      {newPrice ? fmt(cents(clean(newPrice) * (clean(newQty) || 1))) : '—'}
                    </span>
                    <button
                      type="button"
                      onClick={addItem}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${c.primary}`}
                      aria-label="Add item"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>
            {itemError ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle className="h-3.5 w-3.5" /> {itemError}
              </p>
            ) : (
              <p className={`mt-1.5 text-xs ${c.faint}`}>Press Enter or + to add an item.</p>
            )}
          </section>

          {/* Deposit */}
          <section>
            <h4 className={`mb-2 text-sm font-semibold ${c.text}`}>Deposit</h4>
            <div className={`inline-flex overflow-hidden rounded-lg border ${c.seg}`}>
              {(
                [
                  ['default', hasDefault ? `Default (${depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)})` : 'Default (none)'],
                  ['custom', 'Custom'],
                  ['none', 'None'],
                ] as [DepositMode, string][]
              ).map(([mode, lbl]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setDepositMode(mode);
                    setError('');
                    touch();
                  }}
                  aria-pressed={depositMode === mode}
                  className={`px-3 py-1.5 text-xs font-semibold transition ${depositMode === mode ? c.segOn : c.segOff}`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            {depositMode === 'custom' && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <div className={`flex overflow-hidden rounded-lg border ${c.seg}`}>
                  {(['percent', 'fixed'] as DepositType[]).map((dt) => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => {
                        setCustomType(dt);
                        touch();
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold transition ${customType === dt ? c.segOn : c.segOff}`}
                    >
                      {dt === 'percent' ? '% of total' : '$ flat'}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  value={customValue}
                  onChange={(e) => {
                    setCustomValue(e.target.value);
                    setError('');
                    touch();
                  }}
                  placeholder={customType === 'percent' ? '50' : '500'}
                  aria-label="Deposit amount"
                  className={`w-28 rounded-lg border px-3 py-1.5 text-base sm:text-sm outline-none ${c.input} ${noSpinners}`}
                />
              </div>
            )}

            {depositMode === 'default' && !hasDefault && (
              <p className={`mt-2 text-xs ${c.faint}`}>No default deposit is set. Set one at the top of the Services page.</p>
            )}
          </section>

          {/* Summary */}
          <section className={`rounded-xl border p-4 ${c.box}`}>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className={c.sub}>Subtotal</dt>
                <dd className={`tabular-nums ${c.text}`}>{fmt(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className={c.sub}>
                  Tax ({effectiveTaxRate}%{category.tax_rate_override != null ? ', this service' : ''})
                </dt>
                <dd className={`tabular-nums ${c.text}`}>{fmt(taxAmount)}</dd>
              </div>
              <div className={`flex justify-between border-t pt-2 ${c.bar}`}>
                <dt className={`font-semibold ${c.text}`}>Total</dt>
                <dd className={`text-base font-semibold tabular-nums ${c.text}`}>{fmt(total)}</dd>
              </div>
              {deposit > 0 && (
                <>
                  <div className="flex justify-between pt-1">
                    <dt className={c.sub}>Deposit due when accepted</dt>
                    <dd className={`font-medium tabular-nums ${c.text}`}>{fmt(deposit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className={c.sub}>Balance after the job</dt>
                    <dd className={`tabular-nums ${c.text}`}>{fmt(balance)}</dd>
                  </div>
                </>
              )}
            </dl>
            {chosen.type === 'fixed' && chosen.value > total && total > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-500">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                The flat deposit is more than the total, so it will be capped at {fmt(total)}.
              </p>
            )}
          </section>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-medium text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${c.bar}`}>
          {confirmDiscard ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm ${c.text}`}>Discard your changes?</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setConfirmDiscard(false)} className={`rounded-xl border px-4 py-2 text-sm font-medium ${c.btn}`}>
                  Keep editing
                </button>
                <button type="button" onClick={onClose} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                  Discard
                </button>
              </div>
            </div>
          ) : confirmDelete ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm ${c.text}`}>Remove this estimate template?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium ${c.btn}`}
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={deleteTemplate}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              {existingTemplate ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="rounded-xl px-2 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-500/10"
                >
                  Remove template
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button type="button" onClick={requestClose} className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${c.btn}`}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${c.primary}`}
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}