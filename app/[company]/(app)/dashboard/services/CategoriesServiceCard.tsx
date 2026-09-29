'use client';

import { motion } from 'framer-motion';
import { Layers, Trash2, CheckSquare, DollarSign, HandCoins, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, type ElementType } from 'react';
import type { Category, QuoteTemplate, CustomQuestion } from './CategoriesTaskEditorModal';
import { fmt, depositLabel } from './CategoriesTaskEditorModal';

type Props = {
  category: Category;
  index: number;
  quoteTemplate: QuoteTemplate | undefined;
  questions: CustomQuestion[];
  expanded: boolean;
  isDark: boolean;
  accentColor: string;
  onToggleExpand: () => void;
  onDelete: () => void;
  onOpenTasks: () => void;
  onOpenPricing: () => void;
  onOpenQuestions: () => void;
  onSetTaxOverride: (rate: number | null) => void;
  taxRate: number;
};

type StatRowProps = {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  accentColor: string;
  isDark: boolean;
};

const StatRow = ({ icon: Icon, label, active, onClick, accentColor, isDark }: StatRowProps) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`group/stat flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${
      isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-200/60'
    }`}
  >
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
        !active ? (isDark ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-200/80 text-slate-600') : ''
      }`}
      style={active ? { backgroundColor: `${accentColor}20`, color: accentColor } : {}}
    >
      <Icon className="h-4 w-4" />
    </div>
    <span
      className={`min-w-0 flex-1 truncate text-xs font-semibold ${
        isDark ? 'text-slate-200' : 'text-slate-800'
      }`}
    >
      {label}
    </span>
    <ArrowRight
      className={`h-3.5 w-3.5 shrink-0 opacity-0 transition-all group-hover/stat:opacity-100 group-hover/stat:translate-x-0.5 ${
        isDark ? 'text-slate-400' : 'text-slate-500'
      }`}
    />
  </button>
);

export default function CategoriesServiceCard({
  category,
  quoteTemplate,
  questions,
  isDark,
  accentColor,
  onDelete,
  onOpenTasks,
  onOpenPricing,
  onOpenQuestions,
  onSetTaxOverride,
  taxRate,
}: Props) {
  const [editingRate, setEditingRate] = useState(false);
  const [rateDraft, setRateDraft] = useState(
    category.tax_rate_override != null ? String(category.tax_rate_override) : ''
  );

  const hasOverride = category.tax_rate_override != null;
  const taskCount = category.task_templates?.length || 0;
  const hasDeposit = !!quoteTemplate?.deposit_type && (quoteTemplate.deposit_value ?? 0) > 0;
  const questionCount = questions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex h-full flex-col rounded-2xl border p-4 sm:p-5 shadow-xs transition-all ${
        isDark
          ? 'border-slate-800 bg-slate-900 text-slate-100'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      {/* ── Header Area ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Layers className="h-5 w-5" style={{ color: accentColor }} />
          </div>

          <h3
            className={`min-w-0 truncate text-base font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            title={category.label}
          >
            {category.label}
          </h3>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className={`rounded-xl p-2 shrink-0 transition-colors hover:bg-rose-500/10 hover:text-rose-500 cursor-pointer ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
          aria-label={`Delete ${category.label}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* ── Action Rows ── */}
      <div
        className={`mt-4 space-y-1 rounded-2xl p-1 transition-colors ${
          isDark ? 'bg-slate-950/50' : 'bg-slate-100/70'
        }`}
      >
        <StatRow
          icon={DollarSign}
          label={quoteTemplate ? `${quoteTemplate.items.length} line items` : 'No pricing'}
          active={!!quoteTemplate}
          onClick={onOpenPricing}
          accentColor={accentColor}
          isDark={isDark}
        />
        <StatRow
          icon={HelpCircle}
          label={questionCount > 0 ? `${questionCount} questions` : 'No questions'}
          active={questionCount > 0}
          onClick={onOpenQuestions}
          accentColor={accentColor}
          isDark={isDark}
        />
        <StatRow
          icon={CheckSquare}
          label={taskCount > 0 ? `${taskCount} tasks` : 'No tasks'}
          active={taskCount > 0}
          onClick={onOpenTasks}
          accentColor={accentColor}
          isDark={isDark}
        />
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {quoteTemplate && (
            <span className={`font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Total:{' '}
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {fmt(quoteTemplate.total)}
              </span>
            </span>
          )}
          {hasDeposit && (
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              <HandCoins className="h-3.5 w-3.5 text-amber-500" />
              {depositLabel(quoteTemplate!.deposit_type, quoteTemplate!.deposit_value)}
            </span>
          )}
        </div>

        {editingRate ? (
          <div className="flex w-full items-center gap-1.5 pt-1">
            <input
              type="number"
              step="0.001"
              min="0"
              max="100"
              value={rateDraft}
              onChange={(e) => setRateDraft(e.target.value)}
              autoFocus
              placeholder={String(taxRate)}
              className={`w-16 rounded-xl border px-2.5 py-1 text-xs font-bold outline-none transition ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-white focus:border-blue-500'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
              }`}
            />
            <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>%</span>
            <button
              type="button"
              onClick={() => {
                const parsed = parseFloat(rateDraft);
                if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                  onSetTaxOverride(parsed);
                  setEditingRate(false);
                }
              }}
              className="rounded-xl bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 cursor-pointer transition shadow-xs"
            >
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
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingRate(false);
                setRateDraft(category.tax_rate_override != null ? String(category.tax_rate_override) : '');
              }}
              className={`text-[11px] font-bold hover:underline cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingRate(true)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              hasOverride
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                : isDark
                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Click to set a custom tax rate for this service"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                hasOverride ? (isDark ? 'bg-amber-400' : 'bg-amber-600') : 'bg-slate-400'
              }`}
            />
            {hasOverride ? `${category.tax_rate_override}% tax` : `${taxRate}% tax`}
          </button>
        )}
      </div>
    </motion.div>
  );
}