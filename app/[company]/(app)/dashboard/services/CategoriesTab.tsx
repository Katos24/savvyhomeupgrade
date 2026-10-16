'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, Check, Loader2, X, Wallet, Percent } from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';
import { can, type PlanTier } from '@/lib/permissions';
import {
  type Category,
  type CustomQuestion,
  fmt,
  depositLabel,
  clean,
  CategoriesLockedSection,
  QuoteSheetPreviewModal,
  DeleteServiceConfirmModal,
} from './CategoriesTaskEditorModal';
import { type DepositType } from '@/hooks/useQuoteTemplates';
import { useQueryClient } from '@tanstack/react-query';
import { useQuoteTemplates, useQuoteTemplateMutation } from '@/hooks/useQuoteTemplates';
import CategoriesServiceCard from './CategoriesServiceCard';
import CategoriesTaskEditorModal from './CategoriesTaskEditorModal';
import CategoriesPricingModal from './CategoriesPricingModal';
import CategoriesQuestionsModal from './CategoriesQuestionsModal';

type ActiveModal =
  | { type: 'tasks'; categoryIndex: number }
  | { type: 'pricing'; categoryValue: string }
  | { type: 'questions'; categoryValue: string }
  | null;

// Neutral slate tokens, same family as Dashboard / Financials.
function pageTokens(isDark: boolean) {
  return isDark
    ? {
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        card: 'border-white/10 bg-[#0f1420]',
        btn: 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        input: 'border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-white/40',
        seg: 'border-white/10 bg-white/5',
        segOn: 'bg-white text-slate-900',
        segOff: 'text-slate-300 hover:bg-white/10',
        note: 'border-white/10 bg-white/[0.03] text-slate-300',
        sticky: 'border-white/10 bg-[#0f1420]/95',
        tile: 'bg-white/[0.05]',
        tileIcon: 'bg-white/10 text-slate-100',
            }
    : {
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        card: 'border-slate-200 bg-white',
        btn: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        input: 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500',
        seg: 'border-slate-200 bg-white',
        segOn: 'bg-slate-900 text-white',
        segOff: 'text-slate-600 hover:bg-slate-50',
        note: 'border-slate-200 bg-slate-50 text-slate-600',
        sticky: 'border-slate-200 bg-white/95',
        tile: 'bg-slate-100',
        tileIcon: 'bg-white text-slate-700',
            };
}

export default function CategoriesTab({
  company,
  currentUser,
  isDark,
  onToggleTheme,
  onDirtyChange,
  onRegisterSave,
}: {
  company: any;
  currentUser?: any;
  isDark: boolean;
  onToggleTheme: () => void;
  /** Tells the parent page there are unsaved service changes. */
  onDirtyChange?: (dirty: boolean) => void;
  /** Lets the parent's "Save" button in the leave prompt save the services. */
  onRegisterSave?: (fn: (() => Promise<boolean>) | null) => void;
}) {
  const defaultCategories = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;

  const p = pageTokens(isDark);
  const accentColor = company.email_brand_color_1 || '#2563eb';
  const queryClient = useQueryClient();

  const [categories, setCategories] = useState<Category[]>(
    company.form_categories?.length > 0 ? company.form_categories : defaultCategories
  );
  const [useDefaults, setUseDefaults] = useState(!company.form_categories?.length);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatError, setNewCatError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; label: string } | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [showQuotePreview, setShowQuotePreview] = useState(false);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const { data: quoteTemplates = [] } = useQuoteTemplates(company.slug, {
    enabled: can((company.plan_tier || 'free') as PlanTier, 'quote_templates'),
  });
  const { mutateAsync: mutateTemplates } = useQuoteTemplateMutation(company.slug);

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(() => {
    const raw = company.custom_questions || [];
    const fallbackCategory =
      (company.form_categories?.length > 0 ? company.form_categories : defaultCategories)[0]?.value || 'general';
    return raw.map((q: any) => ({ ...q, category: q.category || fallbackCategory }));
  });

  const taxRate = company.default_tax_rate ?? 0;

  const [depositType, setDepositType] = useState<DepositType | null>(company.default_deposit_type ?? null);
  const [depositValue, setDepositValue] = useState<number>(company.default_deposit_value ?? 0);
  const [editingDepositDefault, setEditingDepositDefault] = useState(false);
  const [depositTypeDraft, setDepositTypeDraft] = useState<DepositType>(company.default_deposit_type ?? 'percent');
  const [depositValueDraft, setDepositValueDraft] = useState(String(company.default_deposit_value ?? ''));
  const [depositSaving, setDepositSaving] = useState(false);
  const [depositError, setDepositError] = useState('');

  const [applyTarget, setApplyTarget] = useState<'tax' | 'deposit' | null>(null);
  const [applyingToAll, setApplyingToAll] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const saveDepositDefault = async (clearIt = false) => {
    const parsed = clearIt ? 0 : parseFloat(depositValueDraft);
    const nextType: DepositType | null = clearIt ? null : depositTypeDraft;

    if (!clearIt) {
      if (isNaN(parsed) || parsed <= 0) {
        setDepositError('Enter an amount above zero.');
        return;
      }
      if (depositTypeDraft === 'percent' && parsed > 100) {
        setDepositError("A percent deposit can't be more than 100.");
        return;
      }
    }

    setDepositSaving(true);
    setDepositError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-deposit-default',
          data: { default_deposit_type: nextType, default_deposit_value: clearIt ? null : parsed },
        }),
      });
      const result = await res.json();
      if (result.success) {
        setDepositType(nextType);
        setDepositValue(clearIt ? 0 : parsed);
        setEditingDepositDefault(false);
        if (quoteTemplates.length > 0) setApplyTarget('deposit');
      } else {
        setDepositError(result.error || 'Could not save the deposit default.');
      }
    } catch {
      setDepositError('Network error. Try again.');
    } finally {
      setDepositSaving(false);
    }
  };

  const applyDefaultToAllTemplates = async (target: 'tax' | 'deposit') => {
    setApplyingToAll(true);
    setSaveError('');
    try {
      const updatedTemplates = quoteTemplates.map((tpl) => {
        const normalizedItems = tpl.items.map((item: any, i: number) => {
          const qty = clean(item.quantity ?? item.qty ?? 1) || 1;
          const price = clean(item.unitPrice ?? item.unit_price ?? item.unitCost ?? item.unit_cost ?? 0);
          return {
            id: item.id || `item_${Date.now() + i}`,
            description: String(item.description || item.label || ''),
            quantity: qty,
            unitPrice: price,
            amount: Math.round(qty * price * 100) / 100,
          };
        });
        const subtotal = normalizedItems.reduce((s, i) => s + i.amount, 0);
        const nextTaxRate = target === 'tax' ? taxRate : tpl.tax_rate ?? 0;
        const nextTotal =
          target === 'tax' ? Math.round((subtotal + subtotal * (nextTaxRate / 100)) * 100) / 100 : tpl.total;

        return {
          ...tpl,
          items: normalizedItems,
          tax_rate: nextTaxRate,
          deposit_type: target === 'deposit' ? depositType : tpl.deposit_type ?? null,
          deposit_value:
            target === 'deposit'
              ? depositType && depositValue > 0
                ? depositValue
                : null
              : tpl.deposit_value ?? null,
          total: nextTotal,
        };
      });

      const data = await mutateTemplates({ action: 'update-many', templates: updatedTemplates });

      if (data.updated !== data.requested) {
        setSaveError(`Only ${data.updated} of ${data.requested} templates updated. Refresh and try again.`);
      }
      setApplyTarget(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Apply default to all failed:', err);
      setSaveError('Network error applying the change. Try again.');
    } finally {
      setApplyingToAll(false);
    }
  };

  const handleAddCategory = () => {
    const label = newCatLabel.trim();
    if (!label) {
      setNewCatError('Enter a service name.');
      return;
    }
    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (categories.some((c) => c.value === value || c.label.toLowerCase() === label.toLowerCase())) {
      setNewCatError('You already have a service with that name.');
      return;
    }
    setCategories((prev) => [...prev, { value, label, task_templates: [] }]);
    setNewCatLabel('');
    setNewCatError('');
    setShowAddForm(false);
    setUseDefaults(false);
    markDirty();
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setNewCatLabel('');
    setNewCatError('');
  };

  const confirmDeleteCategory = () => {
    if (!deleteConfirm) return;
    setCategories((prev) => prev.filter((_, i) => i !== deleteConfirm.index));
    setUseDefaults(false);
    setDeleteConfirm(null);
    markDirty();
  };

  const handleSetTaxOverride = async (index: number, rate: number | null) => {
    setCategories((prev) => prev.map((c, i) => (i === index ? { ...c, tax_rate_override: rate } : c)));
    setUseDefaults(false);
    markDirty();

    const categoryValue = categories[index]?.value;
    const existingTemplate = quoteTemplates.find((qt) => qt.category === categoryValue);
    if (!existingTemplate) return;

    const effectiveRate = rate ?? taxRate;
    const normalizedItems = existingTemplate.items.map((item: any, i: number) => {
      const qty = clean(item.quantity ?? item.qty ?? 1) || 1;
      const price = clean(item.unitPrice ?? item.unit_price ?? item.unitCost ?? item.unit_cost ?? 0);
      return {
        id: item.id || `item_${Date.now() + i}`,
        description: String(item.description || item.label || ''),
        quantity: qty,
        unitPrice: price,
        amount: Math.round(qty * price * 100) / 100,
      };
    });
    const subtotal = normalizedItems.reduce((s, i) => s + i.amount, 0);
    const nextTotal = Math.round((subtotal + subtotal * (effectiveRate / 100)) * 100) / 100;
    const updatedTemplate = { ...existingTemplate, items: normalizedItems, tax_rate: effectiveRate, total: nextTotal };

    try {
      await mutateTemplates({ action: 'update', template: updatedTemplate });
    } catch (err) {
      console.error('Failed to sync tax override to existing template:', err);
    }
  };

   const handleSave = async (): Promise<boolean> => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-categories',
          data: { form_categories: useDefaults ? null : categories },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
               setIsDirty(false);
        setTimeout(() => setSaveSuccess(false), 3000);
        return true;
      } else {
        setSaveError(data.error || 'Failed to save.');
        return false;
      }
    } catch {
      setSaveError('Network error.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ── Unsaved-changes guard ──
  // Report dirty state to the page; clear it when this view closes.
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

  // Let the page's leave prompt save the services.
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;
  useEffect(() => {
    onRegisterSave?.(() => handleSaveRef.current());
    return () => onRegisterSave?.(null);
  }, [onRegisterSave]);

  // Sidebar and other in-app links: ask before leaving with unsaved changes.
  // (Refresh / closing the tab is already covered by beforeunload above.)
  useEffect(() => {
    if (!isDirty) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm('You have unsaved changes to your services. Leave without saving?')) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [isDirty]);

  if (!can((company.plan_tier || 'free') as PlanTier, 'categories')) {
        return <CategoriesLockedSection companySlug={company.slug} isDark={isDark} />;
  }

  const activeModalCategory =
    activeModal?.type === 'tasks'
      ? categories[activeModal.categoryIndex]
      : activeModal
      ? categories.find((c) => c.value === activeModal.categoryValue)
      : undefined;

  return (
    <>
      <div className="transition-colors">
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-4 pb-28 sm:px-6">
                    {/* Banners */}
                   {applyTarget === 'tax' && (
            <div className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${p.card}`}>
              <p className={`text-sm ${p.text}`}>
                Apply{' '}
                {applyTarget === 'tax' ? `${taxRate}% tax` : depositLabel(depositType, depositValue).toLowerCase()} to your{' '}
                {quoteTemplates.length} existing estimate template{quoteTemplates.length !== 1 ? 's' : ''} too?
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyDefaultToAllTemplates(applyTarget)}
                  disabled={applyingToAll}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition disabled:opacity-60 ${p.primary}`}
                >
                  {applyingToAll ? 'Applying…' : 'Apply to all'}
                </button>
                <button
                  type="button"
                  onClick={() => setApplyTarget(null)}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition ${p.btn}`}
                >
                  Only new quotes
                </button>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${p.card} ${p.text}`}>
              <Check className="h-4 w-4 shrink-0 text-emerald-500" /> Saved.
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm font-medium text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
            </div>
          )}

          {/* Defaults: deposit (left) + tax (right). Tinted tiles, not cards, so they read differently from services. */}
          <section>
            <h2 className={`text-xl font-semibold tracking-tight sm:text-2xl ${p.text}`}>Defaults for new quotes</h2>
            <p className={`mb-3 mt-0.5 text-sm ${p.sub}`}>
              Every new quote starts with these. A service or a single quote can change them.
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Deposit */}
              <div className={`rounded-2xl p-4 sm:p-5 ${p.tile}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${p.tileIcon}`}>
                      <Wallet className="h-4 w-4" />
                    </span>
                    <p className={`text-sm font-semibold ${p.text}`}>Deposit</p>
                  </div>
                  {!editingDepositDefault && (
                    <button
                      type="button"
                      onClick={() => setEditingDepositDefault(true)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${p.btn}`}
                    >
                      {depositType ? 'Edit' : 'Set deposit'}
                    </button>
                  )}
                </div>

                {!editingDepositDefault ? (
                  <>
                    <p className={`mt-3 text-2xl font-semibold tabular-nums ${depositType ? p.text : p.faint}`}>
                      {depositType ? (depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)) : 'None'}
                    </p>
                    <p className={`mt-0.5 text-[13px] ${p.sub}`}>
                      {depositType
                        ? depositType === 'percent'
                          ? 'of the job total, due to get started'
                          : 'flat, due to get started'
                        : 'New quotes won’t ask for a deposit.'}
                    </p>
                  </>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={`flex overflow-hidden rounded-lg border ${p.seg}`}>
                        {(['percent', 'fixed'] as DepositType[]).map((dt) => (
                          <button
                            key={dt}
                            type="button"
                            onClick={() => setDepositTypeDraft(dt)}
                            className={`px-3 py-1.5 text-xs font-semibold transition ${depositTypeDraft === dt ? p.segOn : p.segOff}`}
                          >
                            {dt === 'percent' ? '% of job' : '$ flat'}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={depositTypeDraft === 'percent' ? 100 : undefined}
                        value={depositValueDraft}
                        onChange={(e) => {
                          setDepositValueDraft(e.target.value);
                          setDepositError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && saveDepositDefault(false)}
                        placeholder={depositTypeDraft === 'percent' ? '50' : '500'}
                        autoFocus
                        className={`w-28 rounded-lg border px-3 py-1.5 text-base font-semibold outline-none sm:text-sm ${p.input}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveDepositDefault(false)}
                        disabled={depositSaving}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${p.primary}`}
                      >
                        {depositSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDepositDefault(false);
                          setDepositTypeDraft(depositType ?? 'percent');
                          setDepositValueDraft(String(depositValue || ''));
                          setDepositError('');
                        }}
                        className={`px-2 text-xs font-semibold ${p.sub}`}
                      >
                        Cancel
                      </button>
                      {depositType && (
                        <button
                          type="button"
                          onClick={() => saveDepositDefault(true)}
                          disabled={depositSaving}
                          className="ml-auto px-2 text-xs font-semibold text-rose-500 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                )}

                             {depositError && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-rose-500">
                    <AlertCircle className="h-3 w-3" /> {depositError}
                  </p>
                )}

                {/* Right after a change: offer to update existing estimate templates too */}
                {applyTarget === 'deposit' && (
                                   <div
                    className={`mt-4 rounded-xl border p-3 ${
                      isDark ? 'border-amber-400/40 bg-amber-400/10' : 'border-amber-300 bg-amber-50'
                    }`}
                  >
                    <p className={`flex items-start gap-2 text-[13px] font-medium ${isDark ? 'text-amber-100' : 'text-amber-900'}`}>
                      <AlertCircle className={`mt-0.5 h-4 w-4 shrink-0 ${isDark ? 'text-amber-300' : 'text-amber-600'}`} />
                      <span>
                        Use this deposit on your {quoteTemplates.length} existing estimate template
                        {quoteTemplates.length !== 1 ? 's' : ''} too?
                      </span>
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => applyDefaultToAllTemplates('deposit')}
                        disabled={applyingToAll}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${p.primary}`}
                      >
                        {applyingToAll ? 'Updating…' : 'Update all templates'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setApplyTarget(null)}
                        disabled={applyingToAll}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${p.btn}`}
                      >
                        Only new quotes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Tax (read-only here; changed in Overview) */}
              <div className={`rounded-2xl p-4 sm:p-5 ${p.tile}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${p.tileIcon}`}>
                    <Percent className="h-4 w-4" />
                  </span>
                  <p className={`text-sm font-semibold ${p.text}`}>Sales tax</p>
                </div>
                <p className={`mt-3 text-2xl font-semibold tabular-nums ${taxRate > 0 ? p.text : p.faint}`}>
                  {taxRate > 0 ? `${taxRate}%` : 'No tax'}
                </p>
                <p className={`mt-0.5 text-[13px] ${p.sub}`}>
                  Your company rate. Change it in{' '}
                  <a href={`/${company.slug}/home?section=overview`} className={`font-semibold underline underline-offset-2 ${p.text}`}>
                    Overview
                  </a>
                  .
                </p>
                <p className={`mt-2 text-[13px] ${p.faint}`}>
                  {(() => {
                    const own = categories.filter((c: any) => c.tax_rate_override != null).length;
                    return own > 0
                      ? `${own} service${own === 1 ? '' : 's'} use${own === 1 ? 's' : ''} its own rate. Change it on that service's card below.`
                      : 'Need a different rate for one service? Set it on that service’s card below.';
                  })()}
                </p>
              </div>
            </div>
          </section>

          {/* Services */}
          <section>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className={`text-xl font-semibold tracking-tight sm:text-2xl ${p.text}`}>
                  Services <span className={`text-base font-normal ${p.faint}`}>{categories.length}</span>
                </h2>
                <p className={`mt-0.5 text-sm ${p.sub}`}>
                  What customers can book. Set a starting price, questions and a checklist for each.
                </p>
              </div>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => setShowAddForm(true)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${p.primary}`}
                >
                  <Plus className="h-4 w-4" /> Add service
                </button>
              )}
            </div>

            {useDefaults && categories.length > 0 && (
              <p className={`mb-3 rounded-xl border px-3.5 py-2.5 text-xs ${p.note}`}>
                These are suggested services for your trade. Remove any you don&apos;t offer and add your own.
              </p>
            )}

                       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Add a service */}
              <AnimatePresence initial={false}>
                {showAddForm && (
                  <motion.div
                    key="add"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                                       className={`rounded-2xl border p-4 sm:p-5 md:col-span-2 ${p.card}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className={`text-sm font-semibold ${p.text}`}>New service</p>
                      <button type="button" onClick={closeAddForm} className={`rounded-lg p-1 ${p.faint}`} aria-label="Cancel">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        autoFocus
                        value={newCatLabel}
                        onChange={(e) => {
                          setNewCatLabel(e.target.value);
                          setNewCatError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddCategory();
                          if (e.key === 'Escape') closeAddForm();
                        }}
                        placeholder="e.g. Roof repair, AC install, Panel upgrade"
                        className={`min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 text-base sm:text-sm outline-none transition ${
                          newCatError ? 'border-rose-500/60' : ''
                        } ${p.input}`}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${p.primary}`}
                      >
                        Add
                      </button>
                    </div>
                    {newCatError ? (
                      <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                        <AlertCircle className="h-3 w-3" /> {newCatError}
                      </p>
                    ) : (
                      <p className={`mt-1.5 text-[13px] ${p.faint}`}>You can add pricing, questions and a checklist after.</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {categories.length === 0 && !showAddForm ? (
                <div className={`rounded-2xl border px-4 py-10 text-center md:col-span-2 ${p.card}`}>
                                    <p className={`text-sm font-medium ${p.text}`}>No services yet</p>
                  <p className={`mt-1 text-[13px] ${p.sub}`}>Add what you offer so customers can pick it on your booking form.</p>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className={`mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold ${p.primary}`}
                  >
                    <Plus className="h-4 w-4" /> Add service
                  </button>
                </div>
              ) : (
                categories.map((cat, index) => (
                  <CategoriesServiceCard
                    key={cat.value}
                    category={cat}
                    index={index}
                    quoteTemplate={quoteTemplates.find((qt) => qt.category === cat.value)}
                    questions={customQuestions.filter((q) => q.category === cat.value)}
                    expanded={expandedService === cat.value}
                    isDark={isDark}
                    accentColor={accentColor}
                    onToggleExpand={() => setExpandedService(expandedService === cat.value ? null : cat.value)}
                    onDelete={() => setDeleteConfirm({ index, label: cat.label })}
                    onOpenTasks={() => setActiveModal({ type: 'tasks', categoryIndex: index })}
                    onOpenPricing={() => setActiveModal({ type: 'pricing', categoryValue: cat.value })}
                    onOpenQuestions={() => setActiveModal({ type: 'questions', categoryValue: cat.value })}
                    onSetTaxOverride={(rate) => handleSetTaxOverride(index, rate)}
                    taxRate={taxRate}
                  />
                ))
              )}
            </div>
          </section>

          {/* Unsaved changes */}
          <AnimatePresence>
            {isDirty && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                               className={`sticky bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl rounded-2xl border-2 border-amber-400 p-3 pl-4 shadow-2xl ${
                  isDark ? 'bg-white' : 'bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-slate-900' : 'text-white'}`}>
                    <span className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-amber-400" />
                    Unsaved changes to your services
                  </p>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
                      isDark ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      {activeModal?.type === 'tasks' && activeModalCategory && (
        <CategoriesTaskEditorModal
          companySlug={company.slug}
          category={activeModalCategory}
          categoryIndex={activeModal.categoryIndex}
          allCategories={categories}
          isDark={isDark}
          onClose={() => setActiveModal(null)}
          onSaved={(updated) => {
            setCategories(updated);
            setUseDefaults(false);
          }}
        />
      )}

      {activeModal?.type === 'pricing' && activeModalCategory && (
        <CategoriesPricingModal
          companySlug={company.slug}
          category={activeModalCategory}
          existingTemplate={quoteTemplates.find((qt) => qt.category === activeModal.categoryValue)}
          taxRate={taxRate}
          depositType={depositType}
          depositValue={depositValue}
          isDark={isDark}
          onClose={() => setActiveModal(null)}
          onSaved={(templates) => queryClient.setQueryData(['quoteTemplates', company.slug], templates)}
        />
      )}

      {activeModal?.type === 'questions' && activeModalCategory && (
        <CategoriesQuestionsModal
          companySlug={company.slug}
          category={activeModalCategory}
          allQuestions={customQuestions}
          isDark={isDark}
          onClose={() => setActiveModal(null)}
          onSaved={setCustomQuestions}
        />
      )}

      {showQuotePreview && <QuoteSheetPreviewModal onClose={() => setShowQuotePreview(false)} isDark={isDark} />}

      {deleteConfirm && (
        <DeleteServiceConfirmModal
          label={deleteConfirm.label}
          isDark={isDark}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={confirmDeleteCategory}
        />
      )}
    </>
  );
}