'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';
import { can, type PlanTier } from '@/lib/permissions';
import {
  type Category,
  type CustomQuestion,
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
import { type QuoteTemplate, type DepositType } from '@/hooks/useQuoteTemplates';
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

export default function CategoriesTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser?: any;
}) {
  const defaultCategories =
    CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;

  const [isDark, setIsDark] = useState<boolean>(true);
  const skipFirstThemeWrite = useRef(true);

  useEffect(() => {
    setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
  }, []);

  useEffect(() => {
    if (skipFirstThemeWrite.current) {
      skipFirstThemeWrite.current = false;
      return;
    }
    localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDark]);

  const t = themeTokens(isDark);
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

   const { data: quoteTemplates = [] } = useQuoteTemplates(company.slug);
  const { mutateAsync: mutateTemplates } = useQuoteTemplateMutation(company.slug);

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(() => {
    const raw = company.custom_questions || [];
    const fallbackCategory =
      (company.form_categories?.length > 0 ? company.form_categories : defaultCategories)[0]?.value ||
      'general';
    return raw.map((q: any) => ({ ...q, category: q.category || fallbackCategory }));
  });

  const taxRate = company.default_tax_rate ?? 0;

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

           const data = await mutateTemplates({ action: 'update-many', templates: updatedTemplates });

      if (data.updated !== data.requested) {
        setSaveError(
          `Only ${data.updated} of ${data.requested} templates updated. Refresh and try again.`
        );
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

  const handleSetTaxOverride = async (index: number, rate: number | null) => {
    setCategories((prev) =>
      prev.map((c, i) => (i === index ? { ...c, tax_rate_override: rate } : c))
    );
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
    const updatedTemplate = {
      ...existingTemplate,
      items: normalizedItems,
      tax_rate: effectiveRate,
      total: nextTotal,
    };

       try {
      await mutateTemplates({ action: 'update', template: updatedTemplate });
    } catch (err) {
      console.error('Failed to sync tax override to existing template:', err);
    }
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
      <div className={`min-h-screen ${t.bg} transition-colors`}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6 sm:space-y-8 pb-24">
          
          {/* ── Page Header ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${t.heading}`}>Services</h1>
              <p className={`mt-0.5 text-xs sm:text-sm font-medium ${t.subText}`}>
                What customers can request, how it&apos;s priced, and what you ask them.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => setIsDark((v) => !v)}
                className={`rounded-xl border p-2.5 transition-colors ${
                  isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-[#e7e2d8] bg-white text-[#57534e] hover:bg-slate-50'
                }`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            
            </div>
          </div>

          {/* ── Banners & Notifications ── */}
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

          {/* ── Top Controls: Add Service & Default Deposit Cards ── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            
            {/* Add Service Card */}
            <div className={`lg:col-span-1 rounded-2xl border ${t.border} p-5 ${t.cardBg} flex flex-col justify-between`}>
              <div>
                <h2 className={`text-sm font-bold ${t.cardText}`}>Service Menu</h2>
                <p className={`text-xs mt-0.5 ${t.subText}`}>
                  Add new service options to your booking workflow.
                </p>
              </div>

              <div className="mt-4">
                <AnimatePresence mode="wait">
                  {showAddForm ? (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-2"
                    >
                      <input
                        autoFocus
                        value={newCatLabel}
                        onChange={(e) => {
                          setNewCatLabel(e.target.value);
                          setNewCatError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                        placeholder="e.g. Plumbing, HVAC..."
                        className={`w-full rounded-xl border px-3.5 py-2 text-xs font-medium outline-none transition ${t.cardText} ${
                          newCatError ? 'border-rose-500/50 bg-rose-500/5' : t.border
                        }`}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddCategory}
                          className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          Add
                        </button>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            setNewCatLabel('');
                            setNewCatError('');
                          }}
                          className={`rounded-xl border ${t.border} px-3 py-2 text-xs font-semibold ${t.cardText} transition ${t.hoverBg}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Service Category
                    </button>
                  )}
                </AnimatePresence>
                {newCatError && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                    <AlertCircle className="h-3 w-3" /> {newCatError}
                  </p>
                )}
              </div>
            </div>

            {/* Dedicated Default Deposit Control Card */}
            <div className={`lg:col-span-2 rounded-2xl border ${t.border} p-5 ${t.cardBg} flex flex-col justify-between`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <HandCoins className="h-4 w-4 text-blue-600" />
                    <h2 className={`text-sm font-bold ${t.cardText}`}>Company Default Deposit</h2>
                  </div>
                  <p className={`text-xs mt-0.5 ${t.subText}`}>
                    Applied automatically to newly created quotes unless overridden.
                  </p>
                </div>

                {!editingDepositDefault && (
                  <button
                    onClick={() => setEditingDepositDefault(true)}
                    className={`rounded-lg border ${t.border} px-3 py-1.5 text-xs font-semibold ${t.cardText} transition ${t.hoverBg}`}
                  >
                    Configure
                  </button>
                )}
              </div>

              <div className="mt-4">
                {editingDepositDefault ? (
                  <div className={`flex flex-wrap items-center gap-3 rounded-xl border ${t.border} p-3 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className={`flex overflow-hidden rounded-lg border ${t.border} ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                      {(['percent', 'fixed'] as DepositType[]).map((dt) => (
                        <button
                          key={dt}
                          onClick={() => setDepositTypeDraft(dt)}
                          className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                            depositTypeDraft === dt
                              ? 'bg-blue-600 text-white'
                              : `${t.cardText} ${t.hoverBg}`
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
                      className={`w-24 rounded-lg border ${t.border} ${isDark ? 'bg-slate-900' : 'bg-white'} px-3 py-1.5 text-xs font-semibold outline-none ${t.cardText}`}
                    />

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => saveDepositDefault(false)}
                        disabled={depositSaving}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                      >
                        {depositSaving ? '...' : 'Save'}
                      </button>
                      {depositType && (
                        <button
                          onClick={() => saveDepositDefault(true)}
                          disabled={depositSaving}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-2"
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
                        className={`text-xs font-semibold ${t.subText} hover:text-current px-2`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center justify-between rounded-xl border ${t.border} ${isDark ? 'bg-white/5' : 'bg-slate-50/80'} px-4 py-2.5`}>
                    <span className={`text-xs font-semibold ${t.subText}`}>Active Deposit Rule:</span>
                    <span className={`text-xs font-bold ${t.cardText} rounded-md border ${t.border} ${isDark ? 'bg-slate-900' : 'bg-white'} px-2.5 py-1`}>
                      {depositType
                        ? depositType === 'percent'
                          ? `${depositValue}% of total job quote`
                          : `${fmt(depositValue)} fixed deposit`
                        : 'No default deposit set'}
                    </span>
                  </div>
                )}

                {depositError && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-500">
                    <AlertCircle className="h-3 w-3" /> {depositError}
                  </p>
                )}
              </div>
            </div>

          </div>

                   <div className="flex justify-end">
            <button
              onClick={() => setShowQuotePreview(true)}
              className={`text-xs font-medium underline ${t.subText} hover:text-current`}
            >
              See where this shows up on a job →
            </button>
          </div>

          {/* First-visit explainer — shows only when genuinely nothing is
              priced anywhere yet, and disappears permanently the moment
              even one template exists. A one-time onboarding moment, not
              a persistent fixture — the "Tap Pricing below..." hint on
              each unconfigured card (CategoriesServiceCard.tsx) handles
              ongoing guidance after this point. */}
          {quoteTemplates.length === 0 && (
            <div className={`rounded-2xl border p-5 ${isDark ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-200 bg-blue-50/60'}`}>
              <p className={`text-sm font-bold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                Set up your first service to speed up every quote
              </p>
              <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-blue-300/80' : 'text-blue-800/80'}`}>
                Add line items and a price to any service below, and it&rsquo;ll be one click to load into a real quote —
                no retyping the same prices every time. Set a deposit if you collect one, and you&rsquo;re done.
              </p>
            </div>
          )}

          {/* ── Service Cards Grid ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => (
              <CategoriesServiceCard
                key={cat.value}
                category={cat}
                index={index}
                quoteTemplate={quoteTemplates.find((qt) => qt.category === cat.value)}
                questions={customQuestions.filter((q) => q.category === cat.value)}
                expanded={expandedService === cat.value}
                isDark={isDark}
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
                onSetTaxOverride={(rate) => handleSetTaxOverride(index, rate)}
                taxRate={taxRate}
              />
            ))}
          </div>

          {/* ── Unsaved Changes Banner ── */}
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

      {/* ── Modals ── */}
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

      {showQuotePreview && (
        <QuoteSheetPreviewModal onClose={() => setShowQuotePreview(false)} isDark={isDark} />
      )}

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