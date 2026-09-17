'use client';

import { useState, ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Trash2, CheckSquare, DollarSign, HandCoins, HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
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

type StatusItemProps = {
  icon: ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
  accentColor: string;
  t: ReturnType<typeof themeTokens>;
};

const StatusItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  accentColor,
  t,
}: StatusItemProps) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`group/item flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${t.hoverBg}`}
  >
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
      style={active ? { backgroundColor: `${accentColor}1a`, color: accentColor } : {}}
    >
      <Icon className={`h-3.5 w-3.5 ${active ? '' : t.subText}`} />
    </div>
    <div className="min-w-0">
      <p className={`text-xs font-semibold ${t.cardText}`}>{label}</p>
    </div>
    <ArrowRight className={`ml-auto h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover/item:opacity-100 ${t.subText}`} />
  </button>
);

export default function CategoriesServiceCard({
  category,
  quoteTemplate,
  questions,
  expanded,
  isDark,
  accentColor,
  onToggleExpand,
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
      className={`rounded-2xl ${t.cardBg} p-4 sm:p-5 transition-colors`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-3" onClick={onToggleExpand}>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${accentColor}1a` }}
          >
            <Layers className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          <div className="min-w-0">
            <h3 className={`truncate text-sm font-semibold ${t.cardText}`}>{category.label}</h3>
            <p className={`text-xs ${t.subText}`}>
              {[
                taskCount > 0 ? `${taskCount} task${taskCount !== 1 ? 's' : ''}` : null,
                quoteTemplate ? 'Pricing set' : null,
                questionCount > 0 ? `${questionCount} question${questionCount !== 1 ? 's' : ''}` : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Not configured yet'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={`rounded-lg p-1.5 ${t.subText} transition hover:bg-rose-500/10 hover:text-rose-500`}
            aria-label={`Delete ${category.label}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onToggleExpand}
            className={`rounded-lg p-1.5 ${t.subText} transition hover:bg-white/5`}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className={`mt-4 grid grid-cols-1 gap-1 border-t pt-3 sm:grid-cols-3 ${t.border}`}>
              <StatusItem
                icon={CheckSquare}
                label={taskCount > 0 ? `${taskCount} tasks` : 'No tasks'}
                active={taskCount > 0}
                onClick={onOpenTasks}
                accentColor={accentColor}
                t={t}
              />
              <StatusItem
                icon={DollarSign}
                label={quoteTemplate ? `${quoteTemplate.items.length} line items` : 'No pricing'}
                active={!!quoteTemplate}
                onClick={onOpenPricing}
                accentColor={accentColor}
                t={t}
              />
              <StatusItem
                icon={HelpCircle}
                label={questionCount > 0 ? `${questionCount} questions` : 'No questions'}
                active={questionCount > 0}
                onClick={onOpenQuestions}
                accentColor={accentColor}
                t={t}
              />
            </div>

            <div className={`mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t pt-3 text-xs ${t.border} ${t.subText}`}>
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
                <div className="ml-auto flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingRate(true);
                  }}
                  className={`ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors ${
                    hasOverride
                      ? isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700'
                      : `${t.hoverBg} ${t.subText}`
                  }`}
                  title="Click to set a custom tax rate for this service, or leave it using the company default"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${hasOverride ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  {hasOverride ? `${category.tax_rate_override}% tax (custom)` : `${taxRate}% tax`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}