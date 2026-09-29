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
  MessageSquarePlus,
} from 'lucide-react';
import type { Category, CustomQuestion } from './CategoriesTaskEditorModal';

type QuestionType = 'text' | 'select' | 'checkbox';

const QUESTION_TYPES: {
  val: QuestionType;
  label: string;
  description: string;
  icon: typeof Type;
}[] = [
  {
    val: 'text',
    label: 'Text Field',
    description: 'Freeform input box for short or long responses',
    icon: Type,
  },
  {
    val: 'select',
    label: 'Dropdown List',
    description: 'Select a single option from a custom list',
    icon: ListFilter,
  },
  {
    val: 'checkbox',
    label: 'Yes / No',
    description: 'Simple Yes / No or True / False confirmation',
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
  const [questions, setQuestions] = useState<CustomQuestion[]>(allQuestions);

  // View State: 'list' | 'editor'
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
    if (trimmed && !newQOptions.includes(trimmed)) {
      setNewQOptions((prev) => [...prev, trimmed]);
      setNewQOptionDraft('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setNewQOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirmQuestion = () => {
    const trimmedLabel = newQLabel.trim();
    if (!trimmedLabel) {
      setQuestionLabelError('Question prompt cannot be empty.');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className={`flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all ${
          isDark
            ? 'border-slate-800 bg-slate-900 text-slate-100'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className={`flex items-center justify-between border-b px-6 py-4.5 ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {viewMode === 'editor' && (
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition cursor-pointer ${
                  isDark
                    ? 'border-slate-800 bg-slate-800/50 text-slate-300 hover:text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900'
                }`}
                aria-label="Back to questions list"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {viewMode === 'editor'
                  ? editingQId
                    ? 'Edit Service Question'
                    : 'Create Custom Question'
                  : 'Service Questions'}
              </h3>
              <p className={`text-xs font-semibold truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {category.label}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer ${
              isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* ── Body Content ── */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
                className="space-y-5"
              >
                {/* Banner */}
                <div className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-semibold leading-relaxed ${
                  isDark
                    ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
                    : 'border-sky-200 bg-sky-50 text-sky-800'
                }`}>
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Questions added here will be prompted on the booking form specifically when customers select{' '}
                    <strong className={`font-bold ${isDark ? 'text-sky-200' : 'text-sky-950'}`}>{category.label}</strong>.
                  </span>
                </div>

                {/* Question List Header */}
                <div className="flex items-center justify-between pt-1">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Active Questions ({questionsForThisService.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenAddForm}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New Question</span>
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-2.5">
                  {questionsForThisService.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center ${
                      isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-300 bg-slate-50'
                    }`}>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                        <MessageSquarePlus className="h-5 w-5" />
                      </div>
                      <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        No custom questions created
                      </p>
                      <p className={`mt-1 text-xs max-w-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Ask customers for measurements, preferences, or specific scope details.
                      </p>
                    </div>
                  ) : (
                    questionsForThisService.map((q) => (
                      <div
                        key={q.id}
                        className={`group flex items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                          isDark
                            ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                            : 'border-slate-200 bg-slate-50/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {q.label}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {q.type === 'text' && 'Text Input'}
                              {q.type === 'checkbox' && 'Yes/No'}
                              {q.type === 'select' && `Dropdown (${q.options?.length || 0} options)`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(q)}
                            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition cursor-pointer ${
                              isDark
                                ? 'border-slate-800 text-slate-300 hover:border-slate-700 hover:text-blue-400 hover:bg-slate-800'
                                : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:text-blue-600 hover:bg-white'
                            }`}
                            title="Edit question"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Delete question"
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
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Field 1: Question Title */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Question Prompt
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
                    className={`w-full rounded-xl border px-4 py-3 text-xs font-semibold outline-none transition ${
                      questionLabelError
                        ? 'border-rose-500 bg-rose-500/5'
                        : isDark
                        ? 'border-slate-800 bg-slate-950 text-white placeholder:text-slate-500 focus:border-blue-500'
                        : 'border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                    }`}
                  />
                  {questionLabelError && (
                    <p className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500">
                      <AlertCircle className="h-3.5 w-3.5" /> {questionLabelError}
                    </p>
                  )}
                </div>

                {/* Field 2: Answer Format Cards */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-700'
                  }`}>
                    Response Format
                  </label>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                    {QUESTION_TYPES.map((typeObj) => {
                      const Icon = typeObj.icon;
                      const isSelected = newQType === typeObj.val;
                      return (
                        <button
                          key={typeObj.val}
                          type="button"
                          onClick={() => setNewQType(typeObj.val)}
                          className={`relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                              : isDark
                              ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${
                              isSelected ? 'bg-blue-600 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                            }`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            {isSelected && <Check className="h-4 w-4 text-blue-500" />}
                          </div>
                          <div className="mt-3">
                            <p className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {typeObj.label}
                            </p>
                            <p className={`mt-0.5 text-[10px] font-medium leading-tight ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {typeObj.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Field 3: Dropdown Option Pills */}
                {newQType === 'select' && (
                  <div className={`space-y-3 rounded-2xl border p-4 ${
                    isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <label className={`block text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-slate-400' : 'text-slate-700'
                    }`}>
                      Dropdown Options
                    </label>

                    {/* Option Pills Box */}
                    {newQOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newQOptions.map((opt, i) => (
                          <span
                            key={i}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold ${
                              isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-300 bg-white text-slate-900'
                            }`}
                          >
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(i)}
                              className="text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add Input */}
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
                        placeholder="Add option (e.g. 1-2 Stories)..."
                        className={`flex-1 rounded-xl border px-3.5 py-2 text-xs font-semibold outline-none ${
                          isDark
                            ? 'border-slate-800 bg-slate-900 text-white placeholder:text-slate-500 focus:border-blue-500'
                            : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            : 'bg-slate-800 text-white hover:bg-slate-900'
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setViewMode('list');
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-xs font-bold transition cursor-pointer ${
                      isDark
                        ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmQuestion}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer shadow-xs"
                  >
                    {editingQId ? 'Update Question' : 'Add Question'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {saveError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-semibold text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {viewMode === 'list' && (
          <div className={`grid grid-cols-2 gap-3 border-t p-4.5 ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`rounded-xl border py-2.5 text-xs font-bold transition cursor-pointer ${
                isDark
                  ? 'border-slate-800 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}