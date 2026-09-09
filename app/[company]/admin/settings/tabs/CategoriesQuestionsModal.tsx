'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Trash2, Edit2, AlertCircle, HelpCircle } from 'lucide-react';
import type { Category, CustomQuestion } from './CategoriesTaskEditorModal';
import { themeTokens } from './CategoriesTaskEditorModal';

type Props = {
  companySlug: string;
  category: Category;
  allQuestions: CustomQuestion[];
  isDark: boolean;
  onClose: () => void;
  onSaved: (updatedQuestions: CustomQuestion[]) => void;
};

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
  const [newQType, setNewQType] = useState<'text' | 'select' | 'checkbox'>('text');
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

  const addOrUpdate = () => {
    if (!newQLabel.trim()) {
      setQuestionLabelError('Enter a question.');
      return;
    }
    if (editingQId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQId
            ? { ...q, label: newQLabel.trim(), type: newQType, options: newQType === 'select' ? newQOptions : [] }
            : q
        )
      );
    } else {
      setQuestions((prev) => [
        ...prev,
        {
          id: `q_${Date.now()}`,
          label: newQLabel.trim(),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl ${t.overlayCard} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b ${t.border} px-5 py-4`}>
          <div>
            <p className={`text-sm font-semibold ${t.cardText}`}>Custom Questions</p>
            <p className={`text-xs ${t.subText}`}>{category.label} · only shown to customers requesting this service</p>
          </div>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${t.subText} transition hover:bg-white/10`} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-blue-500">
            <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
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
                className={`w-full rounded-lg border bg-transparent px-3.5 py-2 text-xs font-medium outline-none transition ${t.cardText} ${
                  questionLabelError ? 'border-rose-500/50' : t.border
                }`}
              />
              {questionLabelError && <p className="mt-1 text-[11px] font-medium text-rose-500">{questionLabelError}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'text', label: 'Text Input' },
                { val: 'select', label: 'Dropdown' },
                { val: 'checkbox', label: 'Yes/No' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setNewQType(opt.val as any)}
                  className={`rounded-lg border py-2.5 text-xs font-semibold transition ${
                    newQType === opt.val ? 'border-blue-600 bg-blue-600 text-white' : `${t.border} ${t.cardText} hover:bg-white/5`
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
                          onClick={() => setNewQOptions((prev) => prev.filter((_, idx) => idx !== i))}
                          className={`${t.subText} transition hover:text-rose-500`}
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
                    className={`flex-1 rounded-lg border ${t.border} bg-transparent px-3 py-1.5 text-xs font-medium outline-none ${t.cardText}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newQOptionDraft) {
                        e.preventDefault();
                        setNewQOptions((prev) => [...prev, newQOptionDraft]);
                        setNewQOptionDraft('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newQOptionDraft) {
                        setNewQOptions((prev) => [...prev, newQOptionDraft]);
                        setNewQOptionDraft('');
                      }
                    }}
                    aria-label="Add option"
                    className={`shrink-0 rounded-lg border ${t.border} p-2.5 ${t.subText} transition hover:bg-white/5`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              {editingQId && (
                <button
                  onClick={resetForm}
                  className={`rounded-lg border ${t.border} px-3 py-1.5 text-xs font-semibold ${t.subText} transition hover:bg-white/5`}
                >
                  Cancel edit
                </button>
              )}
              <button
                onClick={addOrUpdate}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
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
                <div key={q.id} className={`flex items-center gap-3 rounded-xl border ${t.border} px-4 py-2.5`}>
                  <HelpCircle className={`h-4 w-4 shrink-0 ${t.subText}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-semibold ${t.cardText}`}>{q.label}</p>
                    <p className={`mt-0.5 text-[11px] ${t.subText}`}>
                      {q.type === 'text' && 'Text Response'}
                      {q.type === 'checkbox' && 'Yes / No Choice'}
                      {q.type === 'select' && `Dropdown (${q.options?.length || 0} options)`}
                    </p>
                  </div>
                  <button onClick={() => startEdit(q)} className={`rounded-lg border ${t.border} p-1.5 ${t.subText} transition hover:bg-white/5`}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className={`rounded-lg border ${t.border} p-1.5 text-rose-500 transition hover:bg-rose-500/10`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {saveError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs font-medium text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
            </div>
          )}
        </div>

        <div className={`grid grid-cols-2 gap-2 border-t ${t.border} p-4`}>
          <button onClick={onClose} className={`rounded-xl border ${t.border} py-2.5 text-sm font-semibold ${t.cardText} transition hover:bg-white/5`}>
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save questions'}
          </button>
        </div>
      </div>
    </div>
  );
}