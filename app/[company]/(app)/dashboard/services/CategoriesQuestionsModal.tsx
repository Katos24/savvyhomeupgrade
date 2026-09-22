'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  X,
  Trash2,
  Edit2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Type,
  ListFilter,
  ToggleRight,
  Check,
  Sparkles,
} from 'lucide-react';
import type { Category, CustomQuestion } from './CategoriesTaskEditorModal';
import { themeTokens } from './CategoriesTaskEditorModal';

type QuestionType = 'text' | 'select' | 'checkbox';

const QUESTION_TYPES: {
  val: QuestionType;
  label: string;
  description: string;
  icon: typeof Type;
}[] = [
  {
    val: 'text',
    label: 'Text Response',
    description: 'Freeform text box for short or long answers',
    icon: Type,
  },
  {
    val: 'select',
    label: 'Dropdown Menu',
    description: 'Let customers choose one option from a list',
    icon: ListFilter,
  },
  {
    val: 'checkbox',
    label: 'Yes / No Choice',
    description: 'A simple toggle for boolean confirmation',
    icon: ToggleRight,
  },
];

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
  
  // View State: 'list' = view all questions | 'editor' = add/edit question form
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');

  // Form State
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [newQLabel, setNewQLabel] = useState('');
  const [newQType, setNewQType] = useState<QuestionType>('text');
  const [newQOptions, setNewQOptions] = useState<string[]>([]);
  const [newQOptionDraft, setNewQOptionDraft] = useState('');
  const [questionLabelError, setQuestionLabelError] = useState('');

  // API State
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

  const handleOpenAddForm = () => {
    resetForm();
    setViewMode('editor');
  };

  const handleStartEdit = (q: CustomQuestion) => {
    setEditingQId(q.id);
    setNewQLabel(q.label);
    setNewQType(q.type);
    setNewQOptions(q.options || []);
    setNewQOptionDraft('');
    setQuestionLabelError('');
    setViewMode('editor');
  };

  const handleAddOption = () => {
    const trimmed = newQOptionDraft.trim();
    if (trimmed) {
      setNewQOptions((prev) => [...prev, trimmed]);
      setNewQOptionDraft('');
    }
  };

  const handleConfirmQuestion = () => {
    const trimmedLabel = newQLabel.trim();
    if (!trimmedLabel) {
      setQuestionLabelError('Please enter a question prompt.');
      return;
    }

    if (editingQId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQId
            ? {
                ...q,
                label: trimmedLabel,
                type: newQType,
                options: newQType === 'select' ? newQOptions : [],
              }
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
    setViewMode('list');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[92vh] sm:max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl ${t.overlayCard} shadow-2xl transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between border-b ${t.border} px-5 py-4`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {viewMode === 'editor' && (
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${t.border} ${t.subText} hover:bg-white/5 transition`}
                aria-label="Back to questions list"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <h3 className={`text-sm font-bold ${t.cardText}`}>
                {viewMode === 'editor'
                  ? editingQId
                    ? 'Edit Question'
                    : 'New Question Builder'
                  : 'Custom Service Questions'}
              </h3>
              <p className={`text-xs ${t.subText} truncate`}>{category.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${t.subText} transition hover:bg-white/10`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                {/* Information Banner */}
                <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3.5 py-3 text-xs font-medium leading-relaxed text-blue-500">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Questions configured here will only appear on the booking form when a customer selects{' '}
                    <strong className="font-semibold">{category.label}</strong>.
                  </span>
                </div>

                {/* Question List Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider ${t.subText}`}>
                    Questions ({questionsForThisService.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-2">
                  {questionsForThisService.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed ${t.border} p-8 text-center`}>
                      <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500`}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <p className={`text-xs font-semibold ${t.cardText}`}>No questions added yet</p>
                      <p className={`mt-1 text-[11px] ${t.subText}`}>
                        Ask customers for specific details when booking this service.
                      </p>
                    </div>
                  ) : (
                    questionsForThisService.map((q) => (
                      <div
                        key={q.id}
                        className={`group flex items-center justify-between gap-3 rounded-xl border ${t.border} p-3.5 transition hover:border-blue-500/30`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-xs font-semibold ${t.cardText}`}>
                            {q.label}
                          </p>
                          <p className={`mt-0.5 text-[11px] ${t.subText}`}>
                            {q.type === 'text' && 'Text Response'}
                            {q.type === 'checkbox' && 'Yes / No Choice'}
                            {q.type === 'select' && `Dropdown (${q.options?.length || 0} options)`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(q)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${t.border} ${t.subText} hover:text-blue-500 transition hover:bg-blue-500/5`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border ${t.border} text-rose-500 hover:bg-rose-500/10 transition`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="editor-view"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5"
              >
                {/* Step 1: Question Title */}
                <div className="space-y-1.5">
                  <label className={`block text-xs font-bold ${t.cardText}`}>
                    1. Question Prompt
                  </label>
                  <input
                    type="text"
                    value={newQLabel}
                    autoFocus
                    onChange={(e) => {
                      setNewQLabel(e.target.value);
                      setQuestionLabelError('');
                    }}
                    placeholder='e.g., "What is the square footage of the roof?"'
                    className={`w-full rounded-xl border bg-transparent px-3.5 py-2.5 text-xs font-medium outline-none transition ${t.cardText} ${
                      questionLabelError ? 'border-rose-500 bg-rose-500/5' : t.border
                    }`}
                  />
                  {questionLabelError && (
                    <p className="flex items-center gap-1 text-[11px] font-medium text-rose-500">
                      <AlertCircle className="h-3 w-3" /> {questionLabelError}
                    </p>
                  )}
                </div>

                {/* Step 2: Answer Format Selector */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold ${t.cardText}`}>
                    2. Select Answer Type
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {QUESTION_TYPES.map((typeObj) => {
                      const Icon = typeObj.icon;
                      const isSelected = newQType === typeObj.val;
                      return (
                        <button
                          key={typeObj.val}
                          type="button"
                          onClick={() => setNewQType(typeObj.val)}
                                                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? 'border-blue-600 bg-blue-600/10 text-blue-600 ring-1 ring-blue-600'
                              : `${t.border} ${t.cardText} hover:bg-white/5`
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <Icon className="h-4 w-4" />
                            {isSelected && <Check className="h-3.5 w-3.5 text-blue-600" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold">{typeObj.label}</p>
                            <p className={`text-[10px] leading-tight ${t.subText}`}>
                              {typeObj.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Options (If Dropdown selected) */}
                {newQType === 'select' && (
                  <div className={`space-y-3 rounded-xl border ${t.border} p-4 bg-white/5`}>
                    <label className={`block text-xs font-bold ${t.cardText}`}>
                      3. Dropdown Options
                    </label>
                    <div className="space-y-2">
                      {newQOptions.map((opt, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between rounded-lg border ${t.border} px-3 py-1.5 text-xs font-medium ${t.cardText}`}
                        >
                          <span>{opt}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setNewQOptions((prev) => prev.filter((_, idx) => idx !== i))
                            }
                            className={`text-rose-500 hover:text-rose-600`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newQOptionDraft}
                        onChange={(e) => setNewQOptionDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                        placeholder="Add an option (e.g. 1-2 Stories)..."
                        className={`flex-1 rounded-lg border ${t.border} bg-transparent px-3 py-2 text-xs outline-none ${t.cardText}`}
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className={`rounded-lg border ${t.border} px-3 py-2 text-xs font-semibold ${t.cardText} hover:bg-white/5`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Controls */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setViewMode('list');
                    }}
                    className={`rounded-xl border ${t.border} px-4 py-2.5 text-xs font-semibold ${t.cardText} hover:bg-white/5 transition`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmQuestion}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    {editingQId ? 'Update Question' : 'Add to List'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {saveError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-xs font-medium text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {viewMode === 'list' && (
          <div className={`grid grid-cols-2 gap-2 border-t ${t.border} p-4`}>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border ${t.border} py-2.5 text-xs font-semibold ${t.cardText} transition hover:bg-white/5`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}