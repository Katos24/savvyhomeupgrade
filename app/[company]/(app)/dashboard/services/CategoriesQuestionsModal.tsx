'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Trash2, Edit2, AlertCircle, HelpCircle } from 'lucide-react';
import type { Category, CustomQuestion } from './CategoriesTaskEditorModal';
import { themeTokens } from './CategoriesTaskEditorModal';

type QuestionType = 'text' | 'select' | 'checkbox';

const QUESTION_TYPES: { val: QuestionType; label: string }[] = [
  { val: 'text', label: 'Text Input' },
  { val: 'select', label: 'Dropdown' },
  { val: 'checkbox', label: 'Yes/No' },
];

type Props = {
  companySlug: string;
  category: Category;
  allQuestions: CustomQuestion[];
  isDark: boolean;
  onClose: () => void;
  onSaved: (updatedQuestions: CustomQuestion[]) => void;
};

type QuestionItemProps = {
  question: CustomQuestion;
  t: ReturnType<typeof themeTokens>;
  onEdit: (q: CustomQuestion) => void;
  onRemove: (id: string) => void;
};

const QuestionItem = ({ question, t, onEdit, onRemove }: QuestionItemProps) => (
  <div className={`flex items-center gap-3 rounded-xl border ${t.border} px-4 py-2.5`}>
    <HelpCircle className={`h-4 w-4 shrink-0 ${t.subText}`} />
    <div className="min-w-0 flex-1">
      <p className={`truncate text-xs font-semibold ${t.cardText}`}>{question.label}</p>
      <p className={`mt-0.5 text-[11px] ${t.subText}`}>
        {question.type === 'text' && 'Text Response'}
        {question.type === 'checkbox' && 'Yes / No Choice'}
        {question.type === 'select' && `Dropdown (${question.options?.length || 0} options)`}
      </p>
    </div>
    <button
      type="button"
      onClick={() => onEdit(question)}
      aria-label={`Edit ${question.label}`}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${t.border} ${t.subText} transition hover:bg-white/5`}
    >
      <Edit2 className="h-3.5 w-3.5" />
    </button>
    <button
      type="button"
      onClick={() => onRemove(question.id)}
      aria-label={`Delete ${question.label}`}
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${t.border} text-rose-500 transition hover:bg-rose-500/10`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  </div>
);

export default function CategoriesQuestionsModal({
  companySlug,
  category,
  allQuestions,
  isDark,
  onClose,
  onSaved,
}: Props) {
  const t = themeTokens(isDark);
  const [questions, setQuestions] = useState<CustomQuestion[]>(allQuestions);
  const [newQLabel, setNewQLabel] = useState('');
  const [newQType, setNewQType] = useState<QuestionType>('text');
  const [newQOptions, setNewQOptions] = useState<string[]>([]);
  const [newQOptionDraft, setNewQOptionDraft] = useState('');
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [questionLabelError, setQuestionLabelError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const questionsForThisService = questions.filter((q) => q.category === category.value);

  const resetForm = () => {
    setNewQLabel('');
    setNewQType('text');
    setNewQOptions([]);
    setNewQOptionDraft('');
    setEditingQId(null);
    setQuestionLabelError('');
  };

  const startEdit = (q: CustomQuestion) => {
    setEditingQId(q.id);
    setNewQLabel(q.label);
    setNewQType(q.type);
    setNewQOptions(q.options || []);
    setNewQOptionDraft('');
    setQuestionLabelError('');
  };

  const addOption = () => {
    const trimmed = newQOptionDraft.trim();
    if (trimmed) {
      setNewQOptions((prev) => [...prev, trimmed]);
      setNewQOptionDraft('');
    }
  };

  const addOrUpdate = () => {
    const trimmedLabel = newQLabel.trim();
    if (!trimmedLabel) {
      setQuestionLabelError('Enter a question.');
      return;
    }

    if (editingQId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQId
            ? { ...q, label: trimmedLabel, type: newQType, options: newQType === 'select' ? newQOptions : [] }
            : q
        )
      );
    } else {
      setQuestions((prev) => [
        ...prev,
        {
          id: `q_${Date.now()}`,
          label: trimmedLabel,
          type: newQType,
          required: false,
          options: newQType === 'select' ? newQOptions : [],
          category: category.value,
        },
      ]);
    }
    resetForm();
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const save = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`/api/company/${companySlug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-form', data: { questions } }),
      });
      const data = await res.json();
      if (data.success) {
        onSaved(questions);
        onClose();
      } else {
        setSaveError(data.error || 'Failed to save questions.');
      }
    } catch {
      setSaveError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`flex max-h-[92vh] sm:max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl ${t.overlayCard} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b ${t.border} px-5 py-4`}>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${t.cardText}`}>Custom Questions</p>
            <p className={`text-xs ${t.subText} truncate`}>{category.label} · only shown to customers requesting this service</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.subText} transition hover:bg-white/10`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-blue-500">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              These only appear on the booking form when a customer selects{' '}
              <span className="font-semibold">{category.label}</span> as their service.
            </span>
          </div>

          <div className={`space-y-3 rounded-xl border ${t.border} p-4`}>
            <div>
              <label className={`mb-1.5 block text-xs font-semibold ${t.cardText}`}>
                {editingQId ? 'Edit question' : 'New question'}
              </label>
              <input
                type="text"
                value={newQLabel}
                onChange={(e) => {
                  setNewQLabel(e.target.value);
                  setQuestionLabelError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && newQType !== 'select' && addOrUpdate()}
                placeholder='e.g., "How old is your roof?"'
                className={`w-full rounded-lg border bg-transparent px-3.5 py-2.5 text-[16px] sm:text-xs font-medium outline-none transition ${t.cardText} ${
                  questionLabelError ? 'border-rose-500/50' : t.border
                }`}
              />
              {questionLabelError && <p className="mt-1 text-[11px] font-medium text-rose-500">{questionLabelError}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {QUESTION_TYPES.map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setNewQType(opt.val)}
                  className={`min-h-[44px] rounded-lg border py-2.5 text-xs font-semibold transition ${
                    newQType === opt.val
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : `${t.border} ${t.cardText} hover:bg-white/5`
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {newQType === 'select' && (
              <div className={`space-y-2 border-t pt-3 ${t.border}`}>
                <label className={`block text-xs font-semibold ${t.cardText}`}>Dropdown Options</label>
                <div className="max-h-24 space-y-1.5 overflow-y-auto pr-1">
                  <AnimatePresence>
                    {newQOptions.map((opt, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className={`flex items-center justify-between rounded-lg border ${t.border} px-3 py-1.5`}
                      >
                        <span className={`text-xs font-medium ${t.cardText}`}>{opt}</span>
                        <button
                          type="button"
                          onClick={() => setNewQOptions((prev) => prev.filter((_, idx) => idx !== i))}
                          aria-label={`Remove ${opt}`}
                          className={`flex h-8 w-8 items-center justify-center ${t.subText} transition hover:text-rose-500`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newQOptionDraft}
                    onChange={(e) => setNewQOptionDraft(e.target.value)}
                    placeholder="Add option..."
                    className={`flex-1 rounded-lg border ${t.border} bg-transparent px-3 py-2.5 text-[16px] sm:text-xs font-medium outline-none ${t.cardText}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    aria-label="Add option"
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${t.border} ${t.subText} transition hover:bg-white/5`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              {editingQId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={`min-h-[44px] rounded-lg border ${t.border} px-3 text-xs font-semibold ${t.subText} transition hover:bg-white/5`}
                >
                  Cancel edit
                </button>
              )}
              <button
                type="button"
                onClick={addOrUpdate}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" /> {editingQId ? 'Update question' : 'Add question'}
              </button>
            </div>
          </div>

          {questionsForThisService.length > 0 && (
            <p className={`text-[10px] font-semibold uppercase tracking-wide ${t.subText}`}>
              Added questions — click Save questions below when you're done
            </p>
          )}
          <div className="space-y-2">
            {questionsForThisService.length === 0 ? (
              <p className={`py-4 text-center text-xs font-medium ${t.subText}`}>No custom questions for this service yet.</p>
            ) : (
              questionsForThisService.map((q) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  t={t}
                  onEdit={startEdit}
                  onRemove={removeQuestion}
                />
              ))
            )}
          </div>

          {saveError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs font-medium text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
            </div>
          )}
        </div>

        <div
          className={`grid grid-cols-2 gap-2 border-t ${t.border} p-4`}
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={onClose}
            className={`min-h-[44px] rounded-xl border ${t.border} text-sm font-semibold ${t.cardText} transition hover:bg-white/5`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="min-h-[44px] rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save questions'}
          </button>
        </div>
      </div>
    </div>
  );
}