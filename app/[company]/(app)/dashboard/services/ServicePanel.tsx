'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import {
  type Category,
  type CustomQuestion,
  type QuoteTemplate,
  type DepositType,
  fmt,
} from './CategoriesTaskEditorModal';
import CategoriesTaskEditorModal from './CategoriesTaskEditorModal';
import CategoriesPricingModal from './CategoriesPricingModal';
import CategoriesQuestionsModal from './CategoriesQuestionsModal';

export type ServiceTab = 'price' | 'questions' | 'checklist' | 'tax';

type Props = {
  companySlug: string;
  category: Category;
  categoryIndex: number;
  allCategories: Category[];
  quoteTemplate: QuoteTemplate | undefined;
  allQuestions: CustomQuestion[];
  taxRate: number;
  depositType: DepositType | null;
  depositValue: number;
  isDark: boolean;
  initialTab?: ServiceTab;
  onClose: () => void;
  onDelete: () => void;
  /** Saves this service's own tax rate (null = use the default). Resolves false on failure. */
  onSetTaxOverride: (rate: number | null) => Promise<boolean>;
  onSavedTemplates: (templates: QuoteTemplate[]) => void;
  onSavedQuestions: (questions: CustomQuestion[]) => void;
  onSavedCategories: (categories: Category[]) => void;
};

function panelTokens(isDark: boolean) {
  return isDark
    ? {
        panel: 'bg-[#0f1420] text-white',
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        border: 'border-white/10',
        iconBtn: 'text-slate-400 hover:bg-white/10 hover:text-white',
        tabOn: 'border-white text-white',
        tabOff: 'border-transparent text-slate-400 hover:text-slate-200',
        pillDone: 'bg-white/10 text-slate-200',
        pillTodo: 'bg-amber-400/15 text-amber-200',
        input: 'border-white/15 bg-white/5 text-white focus:border-white/40',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        btn: 'border-white/15 text-slate-200 hover:bg-white/10',
        choiceOn: 'border-white bg-white/[0.06]',
        choiceOff: 'border-white/10 hover:bg-white/[0.04]',
      }
    : {
        panel: 'bg-white text-slate-900',
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        border: 'border-slate-200',
        iconBtn: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
        tabOn: 'border-slate-900 text-slate-900',
        tabOff: 'border-transparent text-slate-500 hover:text-slate-800',
        pillDone: 'bg-slate-100 text-slate-700',
        pillTodo: 'bg-amber-50 text-amber-800',
        input: 'border-slate-300 bg-white text-slate-900 focus:border-slate-500',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        btn: 'border-slate-300 text-slate-700 hover:bg-slate-50',
        choiceOn: 'border-slate-900 bg-slate-50',
        choiceOff: 'border-slate-200 hover:bg-slate-50',
      };
}

/* ── Tax tab: "use my default" or "this service has its own rate" ── */
function TaxTab({
  category,
  taxRate,
  isDark,
  onSave,
  onDirtyChange,
  onRegisterSave,
}: {
  category: Category;
  taxRate: number;
  isDark: boolean;
  onSave: (rate: number | null) => Promise<boolean>;
  onDirtyChange: (dirty: boolean) => void;
  onRegisterSave: (fn: (() => Promise<boolean>) | null) => void;
}) {
  const c = panelTokens(isDark);
  const savedOwn = category.tax_rate_override != null;
  const [own, setOwn] = useState(savedOwn);
  const [draft, setDraft] = useState(savedOwn ? String(category.tax_rate_override) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const dirty = own !== savedOwn || (own && draft !== (savedOwn ? String(category.tax_rate_override) : ''));
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const save = async (): Promise<boolean> => {
    let rate: number | null = null;
    if (own) {
      const parsed = parseFloat(draft);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) {
        setError('Enter a rate from 0 to 100.');
        return false;
      }
      rate = parsed;
    }
    setSaving(true);
    setError('');
    const ok = await onSave(rate);
    setSaving(false);
    if (!ok) {
      setError('Could not save. Try again.');
      return false;
    }
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
    return true;
  };

  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    onRegisterSave(() => saveRef.current());
    return () => onRegisterSave(null);
  }, [onRegisterSave]);

  const undo = () => {
    setOwn(savedOwn);
    setDraft(savedOwn ? String(category.tax_rate_override) : '');
    setError('');
  };

  const choice = (on: boolean) => `flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${on ? c.choiceOn : c.choiceOff}`;
  const dot = (on: boolean) =>
    `mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
      on ? (isDark ? 'border-white' : 'border-slate-900') : isDark ? 'border-white/30' : 'border-slate-300'
    }`;
  const dotFill = isDark ? 'bg-white' : 'bg-slate-900';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        <p className={`text-sm ${c.sub}`}>Sales tax added to {category.label} quotes.</p>

        <button type="button" onClick={() => { setOwn(false); setError(''); }} className={choice(!own)}>
          <span className={dot(!own)}>{!own && <span className={`h-1.5 w-1.5 rounded-full ${dotFill}`} />}</span>
          <span>
            <span className={`block text-sm font-semibold ${c.text}`}>Use my default ({taxRate}%)</span>
            <span className={`block text-xs ${c.faint}`}>Changes if you change your default.</span>
          </span>
        </button>

        <div className={choice(own)}>
          <button type="button" onClick={() => setOwn(true)} className="flex flex-1 items-start gap-3 text-left">
            <span className={dot(own)}>{own && <span className={`h-1.5 w-1.5 rounded-full ${dotFill}`} />}</span>
            <span>
              <span className={`block text-sm font-semibold ${c.text}`}>A different rate for this service</span>
              <span className={`block text-xs ${c.faint}`}>For example, labor-only work in some areas.</span>
            </span>
          </button>
        </div>

        {own && (
          <div className="flex items-center gap-2 pl-1">
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0"
                max="100"
                inputMode="decimal"
                value={draft}
                autoFocus
                onChange={(e) => {
                  setDraft(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                placeholder={String(taxRate)}
                className={`w-28 rounded-lg border py-2 pl-3 pr-7 text-base font-semibold outline-none ${c.input}`}
              />
              <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm ${c.faint}`}>%</span>
            </div>
          </div>
        )}

        {error && (
          <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        )}
      </div>

      <div className={`grid grid-cols-2 gap-2 border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${c.border}`}>
        <button
          type="button"
          onClick={undo}
          disabled={!dirty || saving}
          className={`rounded-xl border py-2.5 text-sm font-semibold transition disabled:opacity-40 ${c.btn}`}
        >
          Undo changes
        </button>
        <button
          type="button"
          onClick={() => save()}
          disabled={(!dirty && !savedFlash) || saving}
          className={`rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50 ${c.primary}`}
        >
          {saving ? 'Saving…' : savedFlash ? 'Saved' : 'Save'}
        </button>
      </div>
    </div>
  );
}

/* ── The panel ── */
export default function ServicePanel({
  companySlug,
  category,
  categoryIndex,
  allCategories,
  quoteTemplate,
  allQuestions,
  taxRate,
  depositType,
  depositValue,
  isDark,
  initialTab = 'price',
  onClose,
  onDelete,
  onSetTaxOverride,
  onSavedTemplates,
  onSavedQuestions,
  onSavedCategories,
}: Props) {
  const c = panelTokens(isDark);
  const [tab, setTab] = useState<ServiceTab>(initialTab);
  const [tabDirty, setTabDirty] = useState(false);
  const reportDirty = useCallback((d: boolean) => setTabDirty(d), []);

  // The open tab's save, so "Save and switch" can run it.
  const tabSave = useRef<(() => Promise<boolean>) | null>(null);
  const registerSave = useCallback((fn: (() => Promise<boolean>) | null) => {
    tabSave.current = fn;
  }, []);

  // Unsaved-changes prompt: where the person was trying to go.
  type Leaving = { to: ServiceTab } | { to: 'close' };
  const [leaving, setLeaving] = useState<Leaving | null>(null);
  const [promptSaving, setPromptSaving] = useState(false);

  const questionCount = allQuestions.filter((q) => q.category === category.value).length;
  const taskCount = category.task_templates?.length || 0;
  const hasOwnTax = category.tax_rate_override != null;
  const setUpCount = [!!quoteTemplate, questionCount > 0, taskCount > 0].filter(Boolean).length;

  const go = (dest: Leaving) => {
    setLeaving(null);
    if (dest.to === 'close') return onClose();
    setTabDirty(false);
    setTab(dest.to);
  };

  const attempt = (dest: Leaving) => {
    if (dest.to === tab) return;
    if (tabDirty) setLeaving(dest);
    else go(dest);
  };

  const saveThenGo = async () => {
    if (!leaving) return;
    const dest = leaving;
    setPromptSaving(true);
    const ok = tabSave.current ? await tabSave.current() : true;
    setPromptSaving(false);
    // If it didn't save, close the prompt so the tab's own message shows what's missing.
    if (ok) go(dest);
    else setLeaving(null);
  };

  const requestClose = () => attempt({ to: 'close' });

  // Esc: closes the prompt first. Price and Questions handle their own Esc otherwise.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (leaving) {
        e.stopImmediatePropagation();
        if (!promptSaving) setLeaving(null);
        return;
      }
      if (tab === 'price' || tab === 'questions') return;
      requestClose();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, tabDirty, leaving, promptSaving]);

  // Stop the page behind from scrolling.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const tabs: { id: ServiceTab; label: string; hint: string }[] = [
    { id: 'price', label: 'Price', hint: quoteTemplate ? fmt(quoteTemplate.total) : '' },
    { id: 'questions', label: 'Questions', hint: questionCount ? String(questionCount) : '' },
    { id: 'checklist', label: 'Checklist', hint: taskCount ? String(taskCount) : '' },
    { id: 'tax', label: 'Tax', hint: hasOwnTax ? `${category.tax_rate_override}%` : '' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={requestClose}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`${category.label} settings`}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 340 }}
        className={`relative flex h-full w-full flex-col overflow-hidden shadow-2xl sm:h-[min(760px,90vh)] sm:max-w-2xl sm:rounded-2xl sm:border ${c.panel} ${c.border}`}
      >
        {/* Header */}
        <div className={`flex items-center gap-2 px-5 pb-2 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-4`}>
          <div className="min-w-0 flex-1">
            <h2 className={`truncate text-lg font-semibold ${c.text}`} title={category.label}>
              {category.label}
            </h2>
            <span
              className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                setUpCount === 3 ? c.pillDone : c.pillTodo
              }`}
            >
              {setUpCount === 3 ? 'All set' : `${setUpCount} of 3 set up`}
            </span>
          </div>
          <button
            type="button"
            onClick={onDelete}
            className={`rounded-lg p-2 transition hover:bg-rose-500/10 hover:text-rose-500 ${c.faint}`}
            aria-label={`Remove ${category.label}`}
            title="Remove service"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={requestClose} className={`rounded-lg p-2 transition ${c.iconBtn}`} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 overflow-x-auto border-b px-3 ${c.border}`} role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => attempt({ to: t.id })}
              className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
                tab === t.id ? c.tabOn : c.tabOff
              }`}
            >
              {t.label}
              {t.hint && <span className={`text-xs font-medium ${c.faint}`}>{t.hint}</span>}
            </button>
          ))}
        </div>

        {/* Tab content (each tab saves on its own) */}
        <div className="flex min-h-0 flex-1 flex-col">
          {tab === 'price' && (
            <CategoriesPricingModal
              onRegisterSave={registerSave}
              key={`price-${category.value}`}
              embedded
              onDirtyChange={reportDirty}
              companySlug={companySlug}
              category={category}
              existingTemplate={quoteTemplate}
              taxRate={taxRate}
              depositType={depositType}
              depositValue={depositValue}
              isDark={isDark}
              onClose={onClose}
              onSaved={onSavedTemplates}
            />
          )}
          {tab === 'questions' && (
            <CategoriesQuestionsModal
              onRegisterSave={registerSave}
              key={`questions-${category.value}`}
              embedded
              onDirtyChange={reportDirty}
              companySlug={companySlug}
              category={category}
              allQuestions={allQuestions}
              isDark={isDark}
              onClose={onClose}
              onSaved={onSavedQuestions}
            />
          )}
          {tab === 'checklist' && (
            <CategoriesTaskEditorModal
              onRegisterSave={registerSave}
              key={`checklist-${category.value}`}
              embedded
              onDirtyChange={reportDirty}
              companySlug={companySlug}
              category={category}
              categoryIndex={categoryIndex}
              allCategories={allCategories}
              isDark={isDark}
              onClose={requestClose}
              onSaved={onSavedCategories}
            />
          )}
          {tab === 'tax' && (
            <TaxTab
              key={`tax-${category.value}`}
              category={category}
              taxRate={taxRate}
              isDark={isDark}
              onSave={onSetTaxOverride}
              onDirtyChange={reportDirty}
              onRegisterSave={registerSave}
            />
          )}
        </div>
        {/* Unsaved changes prompt */}
        {leaving && (
          <div className="absolute inset-0 z-10 flex items-end justify-center bg-black/40 p-4 sm:items-center">
            <div
              role="alertdialog"
              aria-modal="true"
              className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${c.panel} ${c.border}`}
            >
              <p className={`text-base font-semibold ${c.text}`}>Save your changes?</p>
              <p className={`mt-1 text-sm ${c.sub}`}>
                You changed {tabs.find((x) => x.id === tab)?.label} for {category.label} and haven&apos;t saved yet.
              </p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  autoFocus
                  onClick={saveThenGo}
                  disabled={promptSaving}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60 ${c.primary}`}
                >
                  {promptSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {promptSaving
                    ? 'Saving…'
                    : leaving.to === 'close'
                    ? 'Save and close'
                    : 'Save and continue'}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => go(leaving)}
                    disabled={promptSaving}
                    className="rounded-xl border border-rose-500/30 py-2.5 text-sm font-semibold text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-50"
                  >
                    Discard changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaving(null)}
                    disabled={promptSaving}
                    className={`rounded-xl border py-2.5 text-sm font-semibold transition disabled:opacity-50 ${c.btn}`}
                  >
                    Keep editing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}