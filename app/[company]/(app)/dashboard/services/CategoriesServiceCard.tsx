'use client';

import { ChevronRight } from 'lucide-react';
import type { Category, QuoteTemplate, CustomQuestion } from './CategoriesTaskEditorModal';
import { fmt } from './CategoriesTaskEditorModal';

type Props = {
  category: Category;
  quoteTemplate: QuoteTemplate | undefined;
  questions: CustomQuestion[];
  isDark: boolean;
  taxRate: number;
  onOpen: () => void;
};

/* One service in the grid. Tap it to open the service panel. */
export default function CategoriesServiceCard({ category, quoteTemplate, questions, isDark, taxRate, onOpen }: Props) {
  const c = isDark
    ? {
        card: 'border-white/10 bg-[#0f1420] hover:border-white/25 hover:bg-white/[0.03]',
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        pillDone: 'bg-white/10 text-slate-200',
        pillTodo: 'bg-amber-400/15 text-amber-200',
      }
    : {
        card: 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm',
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        pillDone: 'bg-slate-100 text-slate-700',
        pillTodo: 'bg-amber-50 text-amber-800',
      };

  const taskCount = category.task_templates?.length || 0;
  const questionCount = questions.length;
  const setUpCount = [!!quoteTemplate, questionCount > 0, taskCount > 0].filter(Boolean).length;
  const hasOwnTax = category.tax_rate_override != null && category.tax_rate_override !== taxRate;

  const summary = [
    `${questionCount} question${questionCount === 1 ? '' : 's'}`,
    `${taskCount} checklist step${taskCount === 1 ? '' : 's'}`,
    hasOwnTax ? `${category.tax_rate_override}% tax` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex w-full flex-col rounded-xl border p-4 text-left transition ${c.card}`}
    >
      <div className="flex w-full items-start gap-2">
        <h3 className={`min-w-0 flex-1 truncate text-[15px] font-semibold ${c.text}`} title={category.label}>
          {category.label}
        </h3>
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${setUpCount === 3 ? c.pillDone : c.pillTodo}`}
        >
          {setUpCount === 3 ? 'All set' : `${setUpCount} of 3`}
        </span>
      </div>

      <p className={`mt-3 text-lg font-semibold tabular-nums ${quoteTemplate ? c.text : c.faint}`}>
        {quoteTemplate ? fmt(quoteTemplate.total) : <span className="text-sm font-medium">No price yet</span>}
      </p>

      <div className="mt-1 flex w-full items-center gap-2">
        <p className={`min-w-0 flex-1 truncate text-xs ${c.faint}`}>{summary}</p>
        <ChevronRight className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${c.faint}`} />
      </div>
    </button>
  );
}