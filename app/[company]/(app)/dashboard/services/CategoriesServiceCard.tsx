'use client';

import { motion } from 'framer-motion';
import { Layers, Trash2, CheckSquare, DollarSign, HandCoins, HelpCircle, ArrowRight } from 'lucide-react';
import { useState, type ElementType } from 'react';
import type { Category, QuoteTemplate, CustomQuestion } from './CategoriesTaskEditorModal';
import { fmt, depositLabel, themeTokens } from './CategoriesTaskEditorModal';

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
  t: ReturnType<typeof themeTokens>;
};

// Stacked full-width rows instead of a 3-across row
const StatRow = ({ icon: Icon, label, active, onClick, accentColor, t }: StatRowProps) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`group/stat flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${t.border} ${t.hoverBg}`}
  >
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
      style={active ? { backgroundColor: `${accentColor}1a`, color: accentColor } : {}}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? '' : t.subText}`} />
    </div>
    <p className={`min-w-0 flex-1 truncate text-xs font-semibold ${t.cardText}`}>{label}</p>
    <ArrowRight className={`h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover/stat:opacity-100 ${t.subText}`} />
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
  const t = themeTokens(isDark);
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
      className={`flex h-full flex-col rounded-2xl ${t.cardBg} p-4 transition-colors border ${t.border}`}
    >
      {/* ── Header Area with Prominent Title ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}1a` }}
          >
            <Layers className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          
          {/* Prominent, bold title */}
          <h3 
            className={`min-w-0 truncate text-base sm:text-lg font-bold tracking-tight ${t.cardText}`}
            title={category.label}
          >
            {category.label}
          </h3>
        </div>

        <button
          onClick={onDelete}
          className={`rounded-lg p-1.5 shrink-0 ${t.subText} transition hover:bg-rose-500/10 hover:text-rose-500`}
          aria-label={`Delete ${category.label}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* ── Action Rows ── */}
      <div className="mt-4 space-y-2">
        <StatRow
          icon={DollarSign}
          label={quoteTemplate ? `${quoteTemplate.items.length} line items` : 'No pricing'}
          active={!!quoteTemplate}
          onClick={onOpenPricing}
          accentColor={accentColor}
          t={t}
        />
        <StatRow
          icon={HelpCircle}
          label={questionCount > 0 ? `${questionCount} questions` : 'No questions'}
          active={questionCount > 0}
          onClick={onOpenQuestions}
          accentColor={accentColor}
          t={t}
        />
        <StatRow
          icon={CheckSquare}
          label={taskCount > 0 ? `${taskCount} tasks` : 'No tasks'}
          active={taskCount > 0}
          onClick={onOpenTasks}
          accentColor={accentColor}
          t={t}
        />
      </div>

      {/* ── Card Footer ── */}
      <div className={`mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t pt-3 mt-3 text-xs ${t.border} ${t.subText}`}>
        {quoteTemplate && (
          <span>
            Total: <span className={`font-semibold ${t.cardText}`}>{fmt(quoteTemplate.total)}</span>
          </span>
        )}
        {hasDeposit && (
          <span className="flex items-center gap-1">
            <HandCoins className="h-3 w-3" />
            {depositLabel(quoteTemplate!.deposit_type, quoteTemplate!.deposit_value)}
          </span>
        )}
        {editingRate ? (
          <div className="flex w-full flex-wrap items-center gap-1.5">
            <input
              type="number"
              step="0.001"
              min="0"
              max="100"
              value={rateDraft}
              onChange={(e) => setRateDraft(e.target.value)}
              autoFocus
              placeholder={String(taxRate)}
              className={`w-16 rounded-md border px-2 py-1 text-xs font-semibold outline-none ${t.border} bg-transparent ${t.cardText}`}
            />
            <span className={`text-xs ${t.subText}`}>%</span>
            <button
              onClick={() => {
                const parsed = parseFloat(rateDraft);
                if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
                  onSetTaxOverride(parsed);
                  setEditingRate(false);
                }
              }}
              className="rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
            >
              Save
            </button>
            {hasOverride && (
              <button
                onClick={() => {
                  onSetTaxOverride(null);
                  setRateDraft('');
                  setEditingRate(false);
                }}
                className="text-[11px] font-semibold text-rose-500 hover:text-rose-600"
              >
                Use default
              </button>
            )}
            <button
              onClick={() => {
                setEditingRate(false);
                setRateDraft(category.tax_rate_override != null ? String(category.tax_rate_override) : '');
              }}
              className={`text-[11px] font-semibold ${t.subText} hover:text-current`}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingRate(true)}
            className={`ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
              hasOverride
                ? isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                : `${t.hoverBg}${t.subText}`
            }`}
            title="Click to set a custom tax rate for this service, or leave it using the company default"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${hasOverride ? 'bg-amber-500' : 'bg-slate-400'}`} />
            {hasOverride ? `${category.tax_rate_override}% tax (custom)` : `${taxRate}% tax`}
          </button>
        )}
      </div>
    </motion.div>
  );
}