'use client';

import { useState, type ElementType } from 'react';
import { Trash2, CheckSquare, DollarSign, HelpCircle, ChevronRight, Percent } from 'lucide-react';
import type { Category, QuoteTemplate, CustomQuestion } from './CategoriesTaskEditorModal';
import { fmt, depositLabel } from './CategoriesTaskEditorModal';

type Props = {
  category: Category;
  index: number;
  quoteTemplate: QuoteTemplate | undefined;
  questions: CustomQuestion[];
  expanded: boolean;
  isDark: boolean;
  accentColor: string; // kept for compatibility; the app UI stays neutral
  onToggleExpand: () => void;
  onDelete: () => void;
  onOpenTasks: () => void;
  onOpenPricing: () => void;
  onOpenQuestions: () => void;
  onSetTaxOverride: (rate: number | null) => void;
  taxRate: number;
};

function cardTokens(isDark: boolean) {
  return isDark
    ? {
        card: 'border-white/10 bg-[#0f1420]',
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        divide: 'divide-white/10',
        border: 'border-white/10',
        rowHover: 'hover:bg-white/[0.04]',
        icon: 'bg-white/[0.07] text-slate-200',
        iconEmpty: 'bg-white/[0.03] text-slate-500',
        pillDone: 'bg-white/10 text-white',
        pillTodo: 'bg-amber-400/15 text-amber-200',
        input: 'border-white/15 bg-white/5 text-white focus:border-white/40',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        btn: 'border-white/15 text-slate-200 hover:bg-white/10',
      }
    : {
        card: 'border-slate-200 bg-white',
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        divide: 'divide-slate-100',
        border: 'border-slate-200',
        rowHover: 'hover:bg-slate-50',
        icon: 'bg-slate-100 text-slate-700',
        iconEmpty: 'bg-slate-50 text-slate-400',
        pillDone: 'bg-slate-100 text-slate-800',
        pillTodo: 'bg-amber-50 text-amber-800',
        input: 'border-slate-300 bg-white text-slate-900 focus:border-slate-500',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        btn: 'border-slate-300 text-slate-700 hover:bg-slate-50',
      };
}

/* One row: icon · label · value (or "Set up") · chevron. */
function Row({
  icon: Icon,
  label,
  value,
  detail,
  isSet,
  onClick,
  c,
  tone,
}: {
  icon: ElementType;
  label: string;
  value: string;
  detail?: string;
   isSet: boolean;
  onClick: () => void;
  c: ReturnType<typeof cardTokens>;
  /** Icon colors for this row type (used when it's set up). */
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 px-4 py-3.5 text-left transition sm:px-5 ${c.rowHover}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSet ? tone || c.icon : c.iconEmpty}`}>
                <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm ${c.sub}`}>{label}</span>
        {isSet ? (
          <span className={`block truncate text-[15px] font-semibold ${c.text}`}>
            {value}
            {detail && <span className={`font-normal ${c.faint}`}> · {detail}</span>}
          </span>
        ) : (
          <span className={`block text-[15px] font-medium ${c.faint}`}>Not set up</span>
        )}
      </span>
      <span className={`flex shrink-0 items-center gap-1 text-sm font-semibold ${isSet ? c.faint : c.text}`}>
        {!isSet && 'Set up'}
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export default function CategoriesServiceCard({
  category,
  quoteTemplate,
  questions,
  isDark,
  onDelete,
  onOpenTasks,
  onOpenPricing,
  onOpenQuestions,
  onSetTaxOverride,
  taxRate,
}: Props) {
   const c = cardTokens(isDark);
  // One icon color per row type, the same on every card. Not green/amber/red,
  // which mean paid / attention / overdue elsewhere in the app.
  const tones = isDark
    ? {
        price: 'bg-sky-400/15 text-sky-300',
        questions: 'bg-violet-400/15 text-violet-300',
        checklist: 'bg-slate-400/15 text-slate-200',
        tax: 'bg-white/[0.07] text-slate-300',
      }
    : {
        price: 'bg-sky-100 text-sky-700',
        questions: 'bg-violet-100 text-violet-700',
        checklist: 'bg-slate-200 text-slate-700',
        tax: 'bg-slate-100 text-slate-600',
      };
  const [editingRate, setEditingRate] = useState(false);
  const [rateDraft, setRateDraft] = useState(category.tax_rate_override != null ? String(category.tax_rate_override) : '');
  const [rateError, setRateError] = useState('');

  const hasOverride = category.tax_rate_override != null;
  const effectiveRate = hasOverride ? category.tax_rate_override : taxRate;
  const taskCount = category.task_templates?.length || 0;
  const questionCount = questions.length;
  const itemCount = quoteTemplate?.items?.length || 0;
  const hasDeposit = !!quoteTemplate?.deposit_type && (quoteTemplate?.deposit_value ?? 0) > 0;

  const setUpCount = [!!quoteTemplate, questionCount > 0, taskCount > 0].filter(Boolean).length;

  const saveRate = () => {
    const parsed = parseFloat(rateDraft);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      setRateError('Enter 0 to 100');
      return;
    }
    onSetTaxOverride(parsed);
    setRateError('');
    setEditingRate(false);
  };

  const cancelRate = () => {
    setEditingRate(false);
    setRateError('');
    setRateDraft(category.tax_rate_override != null ? String(category.tax_rate_override) : '');
  };

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border ${c.card}`}>
      {/* Header */}
      <div className={`flex items-start justify-between gap-3 border-b px-4 py-4 sm:px-5 ${c.border}`}>
        <div className="min-w-0">
          <h3 className={`truncate text-lg font-semibold sm:text-xl ${c.text}`} title={category.label}>
            {category.label}
          </h3>
          <span
            className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
              setUpCount === 3 ? c.pillDone : c.pillTodo
            }`}
          >
            {setUpCount === 3 ? 'Fully set up' : `${setUpCount} of 3 set up`}
          </span>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className={`shrink-0 rounded-lg p-2 transition hover:bg-rose-500/10 hover:text-rose-500 ${c.faint}`}
          aria-label={`Remove ${category.label}`}
          title="Remove service"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Rows */}
      <div className={`flex-1 divide-y ${c.divide}`}>
        <Row
          icon={DollarSign}
          label="Starting price"
          isSet={!!quoteTemplate}
          value={quoteTemplate ? fmt(quoteTemplate.total) : ''}
          detail={
            quoteTemplate
              ? `${itemCount} item${itemCount === 1 ? '' : 's'}${
                  hasDeposit ? ` · ${depositLabel(quoteTemplate.deposit_type, quoteTemplate.deposit_value).toLowerCase()}` : ''
                }`
              : undefined
          }
          onClick={onOpenPricing}
          c={c}
                    tone={tones.price}
        />
        <Row
          icon={HelpCircle}
          label="Booking questions"
          isSet={questionCount > 0}
          value={`${questionCount} question${questionCount === 1 ? '' : 's'}`}
          onClick={onOpenQuestions}
          c={c}
                    tone={tones.questions}
        />
        <Row
          icon={CheckSquare}
          label="Job checklist"
          isSet={taskCount > 0}
          value={`${taskCount} task${taskCount === 1 ? '' : 's'}`}
          onClick={onOpenTasks}
          c={c}
                    tone={tones.checklist}

        />

        {/* Tax: same size as the other rows; edits in place */}
        {editingRate ? (
          <div className="px-4 py-3.5 sm:px-5">
            <p className={`mb-2 text-sm ${c.sub}`}>Tax for {category.label}</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  value={rateDraft}
                  onChange={(e) => {
                    setRateDraft(e.target.value);
                    setRateError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRate();
                    if (e.key === 'Escape') cancelRate();
                  }}
                  autoFocus
                  placeholder={String(taxRate)}
                  className={`w-28 rounded-lg border py-2 pl-3 pr-7 text-base font-semibold outline-none ${c.input}`}
                />
                <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm ${c.faint}`}>%</span>
              </div>
              <button type="button" onClick={saveRate} className={`rounded-lg px-3.5 py-2 text-sm font-semibold ${c.primary}`}>
                Save
              </button>
              <button type="button" onClick={cancelRate} className={`rounded-lg border px-3.5 py-2 text-sm font-semibold ${c.btn}`}>
                Cancel
              </button>
            </div>
            {hasOverride && (
              <button
                type="button"
                onClick={() => {
                  onSetTaxOverride(null);
                  setRateDraft('');
                  setEditingRate(false);
                }}
                className={`mt-2 text-sm font-semibold underline-offset-2 hover:underline ${c.sub}`}
              >
                Use your default ({taxRate}%) instead
              </button>
            )}
            {rateError && <p className="mt-1.5 text-sm font-medium text-rose-500">{rateError}</p>}
          </div>
        ) : (
          <Row
            icon={Percent}
            label="Sales tax"
            isSet
            value={`${effectiveRate}%`}
            detail={hasOverride ? 'this service only' : 'your default'}
            onClick={() => setEditingRate(true)}
            c={c}
                        tone={tones.tax}

          />
        )}
      </div>
    </div>
  );
}