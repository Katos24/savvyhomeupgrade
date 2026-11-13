'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, X, Trash2, AlertCircle, Lock, AlertTriangle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// SHARED TYPES & HELPERS — used by every Categories-tab file.
// ═══════════════════════════════════════════════════════════════════════

export type TaskTemplate = { id: string; label: string; order: number };
export type LineItem = { id: string; description: string; quantity: number; unitPrice: number; amount: number };
export type DepositType = 'percent' | 'fixed';
export type QuoteTemplate = {
  id: string;
  category: string;
  items: LineItem[];
  total: number;
  tax_rate?: number;
  deposit_type?: DepositType | null;
  deposit_value?: number | null;
};
export type Category = { value: string; label: string; task_templates?: TaskTemplate[]; tax_rate_override?: number | null };

export type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  category: string;
};

export const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(isNaN(n) ? 0 : n);

export const clean = (v: any): number => {
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
};

export const depositFor = (
  total: number,
  type: DepositType | null | undefined,
  value: number | null | undefined
): number => {
  const v = Number(value) || 0;
  if (!type || v <= 0 || total <= 0) return 0;
  const raw = type === 'percent' ? (total * v) / 100 : v;
  return Math.min(Math.round(raw * 100) / 100, total);
};

export const depositLabel = (type: DepositType | null | undefined, value: number | null | undefined) => {
  const v = Number(value) || 0;
  if (!type || v <= 0) return 'No deposit';
  return type === 'percent' ? `${v}% deposit` : `${fmt(v)} deposit`;
};

export const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };
export const noSpinners =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

// Dashboard's own token system, reused here so Categories reads as the
// same product instead of a visually separate settings page bolted on.
export function themeTokens(isDark: boolean) {
  return {
    bg: isDark ? 'bg-[#0b0f17]' : 'bg-slate-50',
    cardBg: isDark ? 'bg-[#0f1420] border border-white/10' : 'bg-white border border-slate-200',
    cardText: isDark ? 'text-white' : 'text-slate-900',
    subText: isDark ? 'text-slate-400' : 'text-slate-600',
    heading: isDark ? 'text-slate-100' : 'text-slate-900',
    border: isDark ? 'border-white/10' : 'border-slate-200',
    hoverBg: isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50',
    inputBg: isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900',
    overlayCard: isDark ? 'bg-[#0f1420] border border-white/10' : 'bg-white',
  };
}

// ═══════════════════════════════════════════════════════════════════════
// LOCKED / PLAN-GATE VIEW
// ═══════════════════════════════════════════════════════════════════════

export function CategoriesLockedSection({ companySlug, isDark }: { companySlug: string; isDark: boolean }) {
  const t = themeTokens(isDark);
  return (
    <div className={`min-h-screen ${t.bg} transition-colors`}>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <div className={`rounded-2xl ${t.cardBg} px-6 py-12 sm:px-10 text-center`}>
          <Lock className={`mx-auto mb-4 h-6 w-6 ${t.subText}`} />
          <p className={`text-lg sm:text-xl font-bold ${t.cardText}`}>Set your prices once. Every quote uses them.</p>
          <p className={`mt-2 text-sm ${t.subText}`}>Services &amp; pricing is on the Pro plan.</p>
          <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left">
            {[
              'Each service with its line items and prices',
              'A default deposit, percent or flat amount',
              'A task checklist for every job of that type',
              'Loads into the quote on any job in one tap',
            ].map((item) => (
              <li key={item} className={`flex items-start gap-2.5 text-sm ${t.cardText}`}>
                <span className={`mt-0.5 font-bold ${t.cardText}`}>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <a
            href={`/${companySlug}/home?section=billing`}
            className={`mt-7 inline-block rounded-xl px-5 py-3 text-sm font-semibold transition ${isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
                        Start 14-day free trial

          </a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// QUOTE SHEET PREVIEW MODAL
// ═══════════════════════════════════════════════════════════════════════

export function QuoteSheetPreviewModal({ onClose, isDark }: { onClose: () => void; isDark: boolean }) {
  const t = themeTokens(isDark);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl ${t.overlayCard} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b ${t.border} px-5 py-4`}>
          <span className={`text-sm font-semibold ${t.cardText}`}>Your pricing template, on the job</span>
          <button
            onClick={onClose}
            className={`rounded-xl p-1.5 ${t.subText} transition hover:bg-white/10`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/quote-sheet-preview.webp"
            alt="Quote sheet with pricing template line items loaded"
            className={`w-full rounded-xl border ${t.border}`}
          />
          <p className={`mt-3 text-sm leading-relaxed ${t.subText}`}>
            This is the Quote tab on a job — your estimate builder, not the invoice. Set a
            pricing template for a service and these line items load in automatically here.
            Everything stays editable, and sending the invoice is a separate step once the quote
            is approved.
          </p>
          <p className={`mt-2 text-sm leading-relaxed ${t.subText}`}>
            A deposit on the template carries over as the amount due on signing, with the rest as
            the balance. You can change it per job before the quote goes out.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// DELETE SERVICE CONFIRM MODAL
// ═══════════════════════════════════════════════════════════════════════

export function DeleteServiceConfirmModal({
  label,
  isDark,
  onCancel,
  onConfirm,
}: {
  label: string;
  isDark: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = themeTokens(isDark);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div
        className={`w-full max-w-sm rounded-2xl ${t.overlayCard} p-6 text-center shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10">
          <AlertTriangle className="h-6 w-6 text-rose-500" />
        </div>
        <h3 className={`mb-2 text-base font-semibold ${t.cardText}`}>Remove service?</h3>
        <p className={`mb-2 text-sm ${t.subText}`}>
          This will remove <span className={`font-semibold ${t.cardText}`}>&quot;{label}&quot;</span>.
        </p>
        <p className="mb-6 text-xs font-medium text-amber-500">
          Task checklists will also be removed. Pricing templates and custom questions are stored
          separately and won't be deleted, but won't be reachable from this list anymore.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCancel}
            className={`rounded-xl border ${t.border} py-2.5 text-sm font-semibold ${t.cardText} transition hover:bg-white/5`}
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TASK EDITOR MODAL — the file's primary export
// ═══════════════════════════════════════════════════════════════════════

type TaskEditorProps = {
  companySlug: string;
  category: Category;
  categoryIndex: number;
  allCategories: Category[];
  isDark: boolean;
  onClose: () => void;
  onSaved: (updatedCategories: Category[]) => void;
  /** Rendered inside the service panel (no popup frame; stays open after saving). */
  embedded?: boolean;
  onDirtyChange?: (dirty: boolean) => void;
  /** Panel only: hands this tab's save to the panel ("Save and switch"). Resolves true if it saved. */
  onRegisterSave?: (fn: (() => Promise<boolean>) | null) => void;
};

export default function CategoriesTaskEditorModal({
  companySlug,
  category,
  categoryIndex,
  allCategories,
  isDark,
  onClose,
  onSaved,
  embedded = false,
  onDirtyChange,
  onRegisterSave,
}: TaskEditorProps) {
  const t = themeTokens(isDark);
  const primaryBtn = isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-slate-800';
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [editingTasks, setEditingTasks] = useState<TaskTemplate[]>(category.task_templates || []);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [taskInputError, setTaskInputError] = useState(false);

  useEffect(() => {
    setEditingTasks(category.task_templates || []);
  }, [category]);

  const dirty =
    !!newTaskLabel.trim() ||
    JSON.stringify(editingTasks) !== JSON.stringify(category.task_templates || []);
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const addTask = () => {
    if (!newTaskLabel.trim()) {
      setTaskInputError(true);
      return;
    }
    setEditingTasks((prev) => [
      ...prev,
      { id: `task_${Date.now()}`, label: newTaskLabel.trim(), order: prev.length + 1 },
    ]);
    setNewTaskLabel('');
    setTaskInputError(false);
  };

  const save = async (): Promise<boolean> => {
    // A step still typed in the box gets added instead of being lost.
    const tasks = newTaskLabel.trim()
      ? [...editingTasks, { id: `task_${Date.now()}`, label: newTaskLabel.trim(), order: editingTasks.length + 1 }]
      : editingTasks;
    const updated = [...allCategories];
    updated[categoryIndex] = { ...updated[categoryIndex], task_templates: tasks };
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/company/${companySlug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-categories', data: { form_categories: updated } }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result?.success === false) throw new Error(result?.error || 'Could not save the checklist.');
    } catch (err) {
      // Used to fail silently and still say it saved.
      setSaveError(err instanceof Error ? err.message : 'Could not save the checklist.');
      setSaving(false);
      return false;
    }
    setSaving(false);
    setEditingTasks(tasks);
    setNewTaskLabel('');
    setTaskInputError(false);
    onSaved(updated);
    if (embedded) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
    } else {
      onClose();
    }
    return true;
  };
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    if (!onRegisterSave) return;
    onRegisterSave(() => saveRef.current());
    return () => onRegisterSave(null);
  }, [onRegisterSave]);


  const inner = (
    <>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div
            className={`flex gap-2 rounded-xl border p-1 transition-colors ${
              taskInputError ? 'border-rose-500/50 bg-rose-500/5' : t.border
            }`}
          >
            <input
              value={newTaskLabel}
              onChange={(e) => {
                setNewTaskLabel(e.target.value);
                setTaskInputError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a step, e.g. Take before photos"
              className={`flex-1 bg-transparent px-3 py-2 text-sm font-medium outline-none ${t.cardText} placeholder:${t.subText}`}
            />
            <button onClick={addTask} className={`rounded-lg p-2.5 transition ${primaryBtn}`} aria-label="Add task">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {taskInputError ? (
            <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle className="h-3 w-3" /> Tap + to add that step first.
            </p>
          ) : (
            <p className={`text-xs ${t.subText}`}>Steps your crew checks off on every {category.label} job.</p>
          )}
          {saveError && (
            <p className="flex items-center gap-1 text-xs font-medium text-rose-500">
              <AlertCircle className="h-3 w-3" /> {saveError}
            </p>
          )}
          {editingTasks.length === 0 && (
            <p className={`rounded-xl border border-dashed px-4 py-6 text-center text-sm ${t.border} ${t.subText}`}>No steps yet.</p>
          )}

          <div className="space-y-2">
            {editingTasks.map((task) => (
              <div key={task.id} className={`flex items-center gap-3 rounded-xl border ${t.border} px-4 py-2.5`}>
                <div className={`h-4 w-4 shrink-0 rounded border-2 ${isDark ? 'border-white/20' : 'border-slate-300'}`} />
                <span className={`flex-1 text-sm font-medium ${t.cardText}`}>{task.label}</span>
                <button
                  onClick={() => setEditingTasks(editingTasks.filter((tt) => tt.id !== task.id))}
                  className={`${t.subText} transition hover:text-rose-500`}
                  aria-label={`Remove ${task.label}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={`grid grid-cols-2 gap-2 border-t ${t.border} p-4`}>
          <button onClick={embedded ? () => { setEditingTasks(category.task_templates || []); setNewTaskLabel(''); } : onClose} disabled={embedded && !dirty} className={`rounded-xl border ${t.border} py-2.5 text-sm font-semibold ${t.cardText} transition hover:bg-white/5 disabled:opacity-40`}>
            {embedded ? 'Undo changes' : 'Cancel'}
          </button>
          <button onClick={() => save()} disabled={saving} className={`rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-60 ${primaryBtn}`}>
            {saving ? 'Saving…' : savedFlash ? 'Saved' : 'Save checklist'}
          </button>
        </div>
    </>
  );

  if (embedded) return <div className="flex min-h-0 flex-1 flex-col">{inner}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl ${t.overlayCard} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b ${t.border} px-5 py-4`}>
          <span className={`text-sm font-semibold ${t.cardText}`}>{category.label} tasks</span>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${t.subText} transition hover:bg-white/10`} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {inner}
      </div>
    </div>
  );
}