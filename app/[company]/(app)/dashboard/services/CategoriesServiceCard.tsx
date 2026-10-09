'use client';

import { useState, type ElementType } from 'react';
import { Trash2, CheckSquare, DollarSign, HelpCircle, ChevronRight } from 'lucide-react';
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
        tile: 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.05]',
        tileEmpty: 'border-dashed border-white/15 hover:border-white/30 hover:bg-white/[0.03]',
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        icon: 'bg-white/[0.06] text-slate-300',
        iconEmpty: 'bg-white/[0.03] text-slate-500',
        btn: 'border-white/10 text-slate-300 hover:bg-white/10',
        input: 'border-white/15 bg-white/5 text-white focus:border-white/40',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        divider: 'border-white/10',
      }
    : {
        card: 'border-slate-200 bg-white',
        tile: 'border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50',
        tileEmpty: 'border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50',
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        icon: 'bg-slate-100 text-slate-700',
        iconEmpty: 'bg-slate-50 text-slate-400',
        btn: 'border-slate-200 text-slate-600 hover:bg-slate-50',
        input: 'border-slate-300 bg-white text-slate-900 focus:border-slate-500',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        divider: 'border-slate-100',
      };
}

function Tile({
  icon: Icon,
  title,
  value,
  detail,
  isSet,
  emptyText,
  onClick,
  c,
}: {
  icon: ElementType;
  title: string;
  value: string;
  detail: string;
  isSet: boolean;
  emptyText: string;
  onClick: () => void;
  c: ReturnType<typeof cardTokens>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition ${isSet ? c.tile : c.tileEmpty}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSet ? c.icon : c.iconEmpty}`}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-xs font-medium ${c.sub}`}>{title}</span>
        {isSet ? (
          <>
            <span className={`mt-0.5 block truncate text-base font-semibold ${c.text}`}>{value}</span>
            <span className={`block truncate text-[13px] ${c.faint}`}>{detail}</span>
          </>
        ) : (
          <>
            <span className={`mt-0.5 block text-sm font-semibold ${c.sub}`}>Set up</span>
            <span className={`block text-[13px] leading-snug ${c.faint}`}>{emptyText}</span>
          </>
        )}
      </span>
      <ChevronRight className={`mt-1 h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${c.faint}`} />
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
  const [editingRate, setEditingRate] = useState(false);
  const [rateDraft, setRateDraft] = useState(
    category.tax_rate_override != null ? String(category.tax_rate_override) : ''
  );
  const [rateError, setRateError] = useState('');

  const hasOverride = category.tax_rate_override != null;
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

  return (
    <div className={`rounded-2xl border ${c.card}`}>
      {/* Header: the service */}
      <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-4 sm:px-5">
        <div className="min-w-0">
          <h3 className={`truncate text-lg font-semibold ${c.text}`} title={category.label}>
            {category.label}
          </h3>
          <p className={`text-[13px] ${c.faint}`}>
            {setUpCount === 3 ? 'Fully set up' : `${setUpCount} of 3 set up`}
          </p>
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

      {/* What you can do with it */}
      <div className="grid grid-cols-1 gap-2 px-4 sm:grid-cols-3 sm:px-5">
        <Tile
          icon={DollarSign}
          title="Estimate template"
          isSet={!!quoteTemplate}
          value={quoteTemplate ? fmt(quoteTemplate.total) : ''}
          detail={
            quoteTemplate
              ? `${itemCount} item${itemCount === 1 ? '' : 's'}${
                  hasDeposit ? ` · ${depositLabel(quoteTemplate.deposit_type, quoteTemplate.deposit_value).toLowerCase()}` : ''
                }`
              : ''
          }
          emptyText="Starting price you load into quotes"
          onClick={onOpenPricing}
          c={c}
        />
        <Tile
          icon={HelpCircle}
          title="Booking questions"
          isSet={questionCount > 0}
          value={`${questionCount} question${questionCount === 1 ? '' : 's'}`}
          detail="Asked when customers pick this"
          emptyText="Extra questions on your booking form"
          onClick={onOpenQuestions}
          c={c}
        />
        <Tile
          icon={CheckSquare}
          title="Job checklist"
          isSet={taskCount > 0}
          value={`${taskCount} task${taskCount === 1 ? '' : 's'}`}
          detail="Added to every job"
          emptyText="Steps added to each job automatically"
          onClick={onOpenTasks}
          c={c}
        />
      </div>

      {/* Tax */}
      <div className={`mt-3 border-t px-4 py-2.5 sm:px-5 ${c.divider}`}>
        {editingRate ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[13px] ${c.sub}`}>Tax for this service</span>
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
                if (e.key === 'Escape') setEditingRate(false);
              }}
              autoFocus
              placeholder={String(taxRate)}
              className={`w-20 rounded-lg border px-2.5 py-1 text-base sm:text-xs font-semibold outline-none ${c.input}`}
            />
            <span className={`text-[13px] ${c.sub}`}>%</span>
            <button type="button" onClick={saveRate} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${c.primary}`}>
              Save
            </button>
            {hasOverride && (
              <button
                type="button"
                onClick={() => {
                  onSetTaxOverride(null);
                  setRateDraft('');
                  setEditingRate(false);
                }}
                className={`text-xs font-semibold hover:underline ${c.sub}`}
              >
                Use default ({taxRate}%)
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingRate(false);
                setRateError('');
                setRateDraft(category.tax_rate_override != null ? String(category.tax_rate_override) : '');
              }}
              className={`text-xs font-semibold hover:underline ${c.faint}`}
            >
              Cancel
            </button>
            {rateError && <span className="text-xs font-medium text-rose-500">{rateError}</span>}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingRate(true)}
            className={`text-xs transition hover:underline ${c.sub}`}
            title="Set a different tax rate for this service"
          >
            Tax:{' '}
            <span className={`font-semibold ${c.text}`}>
              {hasOverride ? category.tax_rate_override : taxRate}%
            </span>{' '}
            {hasOverride ? '· custom for this service' : '· your default'}
            <span className={`ml-1.5 ${c.faint}`}>Change</span>
          </button>
        )}
      </div>
    </div>
  );
}