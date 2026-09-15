'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Layers,
  AlertCircle,
  Check,
  Percent,
  HandCoins,
  Loader2,
  CheckSquare,
  DollarSign,
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';
import { can, type PlanTier } from '@/lib/permissions';
import {
  type Category,
  type QuoteTemplate,
  type CustomQuestion,
  type DepositType,
  fmt,
  depositLabel,
  spring,
  noSpinners,
  clean,
  themeTokens,
  CategoriesLockedSection,
  QuoteSheetPreviewModal,
  DeleteServiceConfirmModal,
} from './CategoriesTaskEditorModal';
import CategoriesServiceCard from './CategoriesServiceCard';
import CategoriesTaskEditorModal from './CategoriesTaskEditorModal';
import CategoriesPricingModal from './CategoriesPricingModal';
import CategoriesQuestionsModal from './CategoriesQuestionsModal';

type ActiveModal =
  | { type: 'tasks'; categoryIndex: number }
  | { type: 'pricing'; categoryValue: string }
  | { type: 'questions'; categoryValue: string }
  | null;

export default function CategoriesTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser?: any;
}) {
  const defaultCategories =
    CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;

  // Tab is permanently pinned to light mode to match Setup Guide & Payments.
  const t = themeTokens(false);
  const accentColor = company.email_brand_color_1 || '#2563eb';

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

  const [quoteTemplates, setQuoteTemplates] = useState<QuoteTemplate[]>([]);
  const [, setQuotesLoading] = useState(true);

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(() => {
    const raw = company.custom_questions || [];
    const fallbackCategory =
      (company.form_categories?.length > 0 ? company.form_categories : defaultCategories)[0]?.value ||
      'general';
    return raw.map((q: any) => ({ ...q, category: q.category || fallbackCategory }));
  });

  const [taxRate, setTaxRate] = useState<number>(company.default_tax_rate ?? 0);
  const [editingTaxRate, setEditingTaxRate] = useState(false);
  const [taxRateDraft, setTaxRateDraft] = useState(String(company.default_tax_rate ?? 0));
  const [taxRateSaving, setTaxRateSaving] = useState(false);

  const [depositType, setDepositType] = useState<DepositType | null>(
    company.default_deposit_type ?? null
  );
  const [depositValue, setDepositValue] = useState<number>(company.default_deposit_value ?? 0);
  const [editingDepositDefault, setEditingDepositDefault] = useState(false);
  const [depositTypeDraft, setDepositTypeDraft] = useState<DepositType>(
    company.default_deposit_type ?? 'percent'
  );
  const [depositValueDraft, setDepositValueDraft] = useState(
    String(company.default_deposit_value ?? '')
  );
  const [depositSaving, setDepositSaving] = useState(false);
  const [depositError, setDepositError] = useState('');

  const [applyTarget, setApplyTarget] = useState<'tax' | 'deposit' | null>(null);
  const [applyingToAll, setApplyingToAll] = useState(false);

  useEffect(() => {
    fetch(`/api/company/${company.slug}/quote-templates`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setQuoteTemplates(d.templates || []);
      })
      .catch(() => {})
      .finally(() => setQuotesLoading(false));
  }, [company.slug]);

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

  const saveTaxRate = async () => {
    const parsed = parseFloat(taxRateDraft);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) return;
    setTaxRateSaving(true);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-tax-rate', data: { default_tax_rate: parsed } }),
      });
      const result = await res.json();
      if (result.success) {
        setTaxRate(parsed);
        setEditingTaxRate(false);
        if (quoteTemplates.length > 0) setApplyTarget('tax');
      }
    } catch {
    } finally {
      setTaxRateSaving(false);
    }
  };

  const saveDepositDefault = async (clearIt = false) => {
    const parsed = clearIt ? 0 : parseFloat(depositValueDraft);
    const nextType: DepositType | null = clearIt ? null : depositTypeDraft;

    if (!clearIt) {
      if (isNaN(parsed) || parsed <= 0) {
        setDepositError('Enter an amount above zero.');
        return;
      }
      if (depositTypeDraft === 'percent' && parsed > 100) {
        setDepositError("A percent deposit can't exceed 100.");
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
          const price = clean(
            item.unitPrice ?? item.unit_price ?? item.unitCost ?? item.unit_cost ?? 0
          );
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
        
        // Ensure rounded floating point math for currency
        const nextTotal =
          target === 'tax'
            ? Math.round((subtotal + subtotal * (nextTaxRate / 100)) * 100) / 100
            : tpl.total;

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

      const res = await fetch(`/api/company/${company.slug}/quote-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-many', templates: updatedTemplates }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setSaveError(data.error || 'Could not apply the change. Try again.');
        return;
      }
      if (data.updated !== data.requested) {
        setSaveError(
          `Only ${data.updated} of ${data.requested} templates updated. Refresh and try again.`
        );
      }
      setQuoteTemplates(data.templates || updatedTemplates);
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
    if (!newCatLabel.trim()) {
      setNewCatError('Enter a service name.');
      return;
    }
    const value = newCatLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories((prev) => [...prev, { value, label: newCatLabel.trim(), task_templates: [] }]);
    setNewCatLabel('');
    setNewCatError('');
    setShowAddForm(false);
    setUseDefaults(false);
    markDirty();
  };

  const confirmDeleteCategory = () => {
    if (!deleteConfirm) return;
    setCategories((prev) => prev.filter((_, i) => i !== deleteConfirm.index));
    setUseDefaults(false);
    setDeleteConfirm(null);
    markDirty();
  };

  const handleSave = async () => {
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
      } else {
        setSaveError(data.error || 'Failed to save.');
      }
    } catch {
      setSaveError('Network error.');
    } finally {
      setSaving(false);
    }
  };

  if (!can((company.plan_tier || 'free') as PlanTier, 'categories')) {
    return <CategoriesLockedSection companySlug={company.slug} isDark={false} />;
  }

  const activeModalCategory =
    activeModal?.type === 'tasks'
      ? categories[activeModal.categoryIndex]
      : activeModal
      ? categories.find((c) => c.value === activeModal.categoryValue)
      : undefined;

  const totalTasks = categories.reduce((s, c) => s + (c.task_templates?.length || 0), 0);
  const withPricing = categories.filter((c) =>
    quoteTemplates.some((qt) => qt.category === c.value)
  ).length;

  return (
    <>
      <div className={`w-full ${t.bg} transition-colors`}>
        <div className="w-full space-y-6 sm:space-y-8 pb-24">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Services</h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              What customers can request, how it&apos;s priced, and what you ask them.
            </p>
          </div>

          {/* Stat Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Services', value: categories.length, icon: Layers },
              { label: 'With pricing', value: `${withPricing}/${categories.length}`, icon: DollarSign },
              { label: 'Total tasks', value: totalTasks, icon: CheckSquare },
            ].map((s) => (
              <div key={s.label} className={`rounded-2xl p-4 sm:p-5 ${t.cardBg}`}>
                <s.icon className={`h-4 w-4 mb-2 ${t.subText}`} />
                <p className={`text-xl sm:text-2xl font-semibold tabular-nums ${t.cardText}`}>
                  {s.value}
                </p>
                <p className={`text-xs ${t.subText}`}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Sync Default Banner */}
          {applyTarget && (
            <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-emerald-600">
                Apply{' '}
                {applyTarget === 'tax'
                  ? `${taxRate}% tax`
                  : depositLabel(depositType, depositValue).toLowerCase()}{' '}
                to your {quoteTemplates.length} existing pricing template
                {quoteTemplates.length !== 1 ? 's' : ''} too?
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => applyDefaultToAllTemplates(applyTarget)}
                  disabled={applyingToAll}
                  className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {applyingToAll ? 'Applying...' : 'Apply to all'}
                </button>
                <button
                  onClick={() => setApplyTarget(null)}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  No, just new ones
                </button>
              </div>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4 shrink-0" /> Saved successfully.
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm font-medium text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
            </div>
          )}

          {/* Add Service + Company Defaults Controls */}
          <div className={`rounded-2xl p-4 sm:p-6 space-y-2 ${t.cardBg}`}>
            <AnimatePresence mode="wait">
              {showAddForm ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={spring}
                  className="flex flex-col gap-2 sm:flex-row"
                >
                  <input
                    autoFocus
                    value={newCatLabel}
                    onChange={(e) => {
                      setNewCatLabel(e.target.value);
                      setNewCatError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    placeholder="e.g. Plumbing, HVAC, Roofing..."
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition ${t.cardText} ${
                      newCatError ? 'border-rose-500/50 bg-rose-500/5' : t.border
                    }`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:flex-none"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewCatLabel('');
                        setNewCatError('');
                      }}
                      className={`flex-1 rounded-xl border ${t.border} px-4 py-2.5 text-sm font-semibold ${t.cardText} transition hover:bg-slate-100 sm:flex-none`}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <motion.button
                    key="trigger"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAddForm(true)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add service
                  </motion.button>

                  {editingTaxRate ? (
                    <div
                      className={`flex w-full flex-wrap items-center gap-2 rounded-xl border ${t.border} px-3 py-2 sm:w-auto`}
                    >
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          max="100"
                          value={taxRateDraft}
                          onChange={(e) => setTaxRateDraft(e.target.value)}
                          autoFocus
                          className={`w-16 border-none bg-transparent text-sm font-semibold outline-none ${t.cardText}`}
                        />
                        <span className={`text-xs font-semibold ${t.subText}`}>%</span>
                      </div>
                      <div className="ml-auto flex items-center gap-3 sm:ml-0">
                        <button
                          onClick={saveTaxRate}
                          disabled={taxRateSaving}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700"
                        >
                          {taxRateSaving ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingTaxRate(false);
                            setTaxRateDraft(String(taxRate));
                          }}
                          className={`text-[11px] font-semibold ${t.subText} hover:text-current`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingTaxRate(true)}
                      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border ${t.border} px-4 py-2.5 text-xs font-semibold ${t.cardText} transition hover:bg-slate-50 sm:w-auto sm:justify-start`}
                    >
                      <Percent className={`h-3.5 w-3.5 ${t.subText}`} />
                      Tax rate: {taxRate}%
                    </button>
                  )}

                  {editingDepositDefault ? (
                    <div
                      className={`flex w-full flex-wrap items-center gap-2 rounded-xl border ${t.border} px-3 py-2 sm:w-auto`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex overflow-hidden rounded-lg border ${t.border}`}>
                          {(['percent', 'fixed'] as DepositType[]).map((dt) => (
                            <button
                              key={dt}
                              onClick={() => setDepositTypeDraft(dt)}
                              className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                                depositTypeDraft === dt
                                  ? 'bg-blue-600 text-white'
                                  : `${t.cardText} hover:bg-slate-100`
                              }`}
                            >
                              {dt === 'percent' ? '%' : '$'}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          max={depositTypeDraft === 'percent' ? 100 : undefined}
                          value={depositValueDraft}
                          onChange={(e) => {
                            setDepositValueDraft(e.target.value);
                            setDepositError('');
                          }}
                          placeholder={depositTypeDraft === 'percent' ? '50' : '500'}
                          autoFocus
                          className={`w-16 border-none bg-transparent text-sm font-semibold outline-none ${noSpinners} ${t.cardText}`}
                        />
                      </div>
                      <div className="ml-auto flex items-center gap-3 sm:ml-0">
                        <button
                          onClick={() => saveDepositDefault(false)}
                          disabled={depositSaving}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                          {depositSaving ? '...' : 'Save'}
                        </button>
                        {depositType && (
                          <button
                            onClick={() => saveDepositDefault(true)}
                            disabled={depositSaving}
                            className="text-[11px] font-semibold text-rose-500 hover:text-rose-600"
                          >
                            Clear
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingDepositDefault(false);
                            setDepositTypeDraft(depositType ?? 'percent');
                            setDepositValueDraft(String(depositValue || ''));
                            setDepositError('');
                          }}
                          className={`text-[11px] font-semibold ${t.subText} hover:text-current`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingDepositDefault(true)}
                      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border ${t.border} px-4 py-2.5 text-xs font-semibold ${t.cardText} transition hover:bg-slate-50 sm:w-auto sm:justify-start`}
                    >
                      <HandCoins className={`h-3.5 w-3.5 ${t.subText}`} />
                      {depositType
                        ? `Deposit: ${
                            depositType === 'percent' ? `${depositValue}%` : fmt(depositValue)
                          }`
                        : 'Deposit: none'}
                    </button>
                  )}
                </div>
              )}
            </AnimatePresence>
            {newCatError && (
              <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle className="h-3 w-3" /> {newCatError}
              </p>
            )}
            {depositError && (
              <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
                <AlertCircle className="h-3 w-3" /> {depositError}
              </p>
            )}
          </div>

          <button
            onClick={() => setShowQuotePreview(true)}
            className={`text-xs font-medium underline ${t.subText} hover:text-current`}
          >
            See where this shows up on a job
          </button>

          {/* Service Cards List */}
          <div className="space-y-3">
            {categories.map((cat, index) => (
              <CategoriesServiceCard
                key={cat.value}
                category={cat}
                index={index}
                quoteTemplate={quoteTemplates.find((qt) => qt.category === cat.value)}
                questions={customQuestions.filter((q) => q.category === cat.value)}
                expanded={expandedService === cat.value}
                isDark={false}
                accentColor={accentColor}
                onToggleExpand={() =>
                  setExpandedService(expandedService === cat.value ? null : cat.value)
                }
                onDelete={() => setDeleteConfirm({ index, label: cat.label })}
                onOpenTasks={() => setActiveModal({ type: 'tasks', categoryIndex: index })}
                onOpenPricing={() => setActiveModal({ type: 'pricing', categoryValue: cat.value })}
                onOpenQuestions={() =>
                  setActiveModal({ type: 'questions', categoryValue: cat.value })
                }
              />
            ))}
          </div>

          {/* Unsaved Changes Banner */}
          <AnimatePresence>
            {isDirty && (
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                className={`sticky bottom-4 z-40 mx-auto max-w-xl rounded-2xl border p-4 shadow-xl backdrop-blur-md ${t.overlayCard}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p className={`flex items-center gap-2 text-sm font-semibold ${t.cardText}`}>
                    <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
                    You have unsaved changes.
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {saving ? 'Saving...' : 'Save changes'}
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
          isDark={false}
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
          isDark={false}
          onClose={() => setActiveModal(null)}
          onSaved={setQuoteTemplates}
        />
      )}

      {activeModal?.type === 'questions' && activeModalCategory && (
        <CategoriesQuestionsModal
          companySlug={company.slug}
          category={activeModalCategory}
          allQuestions={customQuestions}
          isDark={false}
          onClose={() => setActiveModal(null)}
          onSaved={setCustomQuestions}
        />
      )}

      {showQuotePreview && (
        <QuoteSheetPreviewModal onClose={() => setShowQuotePreview(false)} isDark={false} />
      )}

      {deleteConfirm && (
        <DeleteServiceConfirmModal
          label={deleteConfirm.label}
          isDark={false}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={confirmDeleteCategory}
        />
      )}
    </>
  );
}