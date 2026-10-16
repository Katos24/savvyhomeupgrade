'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  X,
  Trash2,
  Pencil,
  AlertCircle,
  ArrowLeft,
  Type,
  List,
  ToggleRight,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import type { Category, CustomQuestion } from './CategoriesTaskEditorModal';

type QuestionType = 'text' | 'select' | 'checkbox';

// Step 1 choices: what it is, plus a real example so the choice is obvious.
const QUESTION_TYPES: { val: QuestionType; label: string; example: string; icon: typeof Type }[] = [
  { val: 'text', label: 'Short answer', example: '“How old is the roof?”', icon: Type },
  { val: 'checkbox', label: 'Yes / No', example: '“Is water coming inside?”', icon: ToggleRight },
  { val: 'select', label: 'Pick from a list', example: '“What type of roof?” Shingle · Flat · Metal', icon: List },
];

const typeLabel = (t: string) => QUESTION_TYPES.find((x) => x.val === t)?.label || 'Short answer';
const typeIcon = (t: string) => QUESTION_TYPES.find((x) => x.val === t)?.icon || Type;

// Neutral slate, same as the rest of the app. The selected/accent pieces use the
// dark fill (white in dark mode) so they still stand out.
function tokens(isDark: boolean) {
  return isDark
    ? {
        panel: 'border-white/10 bg-[#0f1420] text-slate-100',
        bar: 'border-white/10',
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        row: 'border-white/10 bg-white/[0.02]',
        iconBtn: 'text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent',
        btn: 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        input: 'border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-white/40',
        choice: 'border-white/10 hover:border-white/30 hover:bg-white/[0.04]',
        badge: 'bg-white/10 text-slate-100',
        accentIcon: 'bg-white text-slate-900',
        accentText: 'text-white',
        empty: 'border-white/15',
        preview: 'border-white/10 bg-black/20',
        previewField: 'border-white/15 bg-white/5 text-slate-400',
        previewPill: 'border-white/15 bg-white/5 text-slate-200',
      }
    : {
        panel: 'border-slate-200 bg-white text-slate-900',
        bar: 'border-slate-100',
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        row: 'border-slate-200 bg-white',
        iconBtn: 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent',
        btn: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        input: 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-500',
        choice: 'border-slate-200 hover:border-slate-400 hover:bg-slate-50',
        badge: 'bg-slate-100 text-slate-800',
        accentIcon: 'bg-slate-900 text-white',
        accentText: 'text-slate-900',
        empty: 'border-slate-300',
        preview: 'border-slate-200 bg-slate-50',
        previewField: 'border-slate-300 bg-white text-slate-400',
        previewPill: 'border-slate-300 bg-white text-slate-700',
      };
}

type Props = {
  companySlug: string;
  category: Category;
  allQuestions: CustomQuestion[];
  isDark: boolean;
  onClose: () => void;
  onSaved: (updatedQuestions: CustomQuestion[]) => void;
};

export default function CategoriesQuestionsModal({ companySlug, category, allQuestions, isDark, onClose, onSaved }: Props) {
  const c = tokens(isDark);
  const [questions, setQuestions] = useState<CustomQuestion[]>(allQuestions);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  // list → (new) pick type → fill in. Editing an existing question skips the type step.
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [typePicked, setTypePicked] = useState(false);

  // Editor state
  const [editingQId, setEditingQId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [type, setType] = useState<QuestionType>('text');
  const [options, setOptions] = useState<string[]>([]);
  const [optionDraft, setOptionDraft] = useState('');
  const [labelError, setLabelError] = useState('');
  const [optionsError, setOptionsError] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const mine = useMemo(() => questions.filter((q) => q.category === category.value), [questions, category.value]);

  const resetEditor = () => {
    setEditingQId(null);
    setLabel('');
    setType('text');
    setOptions([]);
    setOptionDraft('');
    setLabelError('');
    setOptionsError('');
  };

  const openNew = () => {
    resetEditor();
    setTypePicked(false);
    setViewMode('editor');
  };

  const openEdit = (q: CustomQuestion) => {
    setEditingQId(q.id);
    setLabel(q.label);
    setType(q.type as QuestionType);
    setOptions(q.options || []);
    setOptionDraft('');
    setLabelError('');
    setOptionsError('');
    setTypePicked(true);
    setViewMode('editor');
  };

  const pickType = (t: QuestionType) => {
    setType(t);
    setOptionsError('');
    setTypePicked(true);
  };

  const backToList = () => {
    resetEditor();
    setTypePicked(false);
    setViewMode('list');
  };

  const requestClose = () => {
    if (saving) return;
    if (dirty) setConfirmDiscard(true);
    else onClose();
  };

  // Esc: editor → list, list → close (asks first if there are unsaved changes).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (confirmDiscard) setConfirmDiscard(false);
      else if (viewMode === 'editor') backToList();
      else requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, dirty, saving, confirmDiscard]);

  const addOption = () => {
    const v = optionDraft.trim();
    if (!v) return;
    if (options.some((o) => o.toLowerCase() === v.toLowerCase())) {
      setOptionsError('That choice is already in the list.');
      return;
    }
    setOptions((prev) => [...prev, v]);
    setOptionDraft('');
    setOptionsError('');
  };

  const confirmQuestion = () => {
    const trimmed = label.trim();
    if (!trimmed) {
      setLabelError('Write the question first.');
      return;
    }
    // Include anything still typed in the choice box.
    let finalOptions = options;
    const pending = optionDraft.trim();
    if (type === 'select' && pending && !options.some((o) => o.toLowerCase() === pending.toLowerCase())) {
      finalOptions = [...options, pending];
    }
    if (type === 'select' && finalOptions.length < 2) {
      setOptionsError('Add at least 2 choices.');
      return;
    }

    if (editingQId) {
      setQuestions((prev) =>
        prev.map((q) => (q.id === editingQId ? { ...q, label: trimmed, type, options: type === 'select' ? finalOptions : [] } : q))
      );
    } else {
      setQuestions((prev) => [
        ...prev,
        {
          id: `q_${Date.now()}`,
          label: trimmed,
          type,
          required: false,
          options: type === 'select' ? finalOptions : [],
          category: category.value,
        },
      ]);
    }
    setDirty(true);
    backToList();
  };

  const removeQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    setDirty(true);
  };

  // Move within this service's questions; other services' questions keep their spots.
  const move = (id: string, dir: -1 | 1) => {
    setQuestions((prev) => {
      const idxs = prev.map((q, i) => (q.category === category.value ? i : -1)).filter((i) => i >= 0);
      const pos = idxs.findIndex((i) => prev[i].id === id);
      const swapPos = pos + dir;
      if (pos < 0 || swapPos < 0 || swapPos >= idxs.length) return prev;
      const next = [...prev];
      const a = idxs[pos];
      const b = idxs[swapPos];
      [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
    setDirty(true);
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
        setSaveError(data.error || 'Could not save questions.');
      }
    } catch {
      setSaveError('Network error. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // What the customer sees on the booking form (pills, like the real form).
  const previewChoices = type === 'select' ? [...options, ...(optionDraft.trim() ? [optionDraft.trim()] : [])] : [];
  const Preview = () => (
    <div className={`rounded-xl border p-4 ${c.preview}`}>
      <p className={`mb-2 text-xs font-semibold ${c.faint}`}>Customer sees</p>
      <p className={`mb-2.5 text-sm font-semibold ${c.text}`}>{label.trim() || 'Your question'}</p>
      {type === 'text' && <div className={`h-10 rounded-lg border ${c.previewField}`} />}
      {type === 'checkbox' && (
        <div className="flex gap-2">
          {['Yes', 'No'].map((v) => (
            <span key={v} className={`rounded-xl border px-5 py-2 text-sm font-semibold ${c.previewPill}`}>
              {v}
            </span>
          ))}
        </div>
      )}
      {type === 'select' &&
        (previewChoices.length ? (
          <div className="flex flex-wrap gap-2">
            {previewChoices.map((o, i) => (
              <span key={`${o}-${i}`} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${c.previewPill}`}>
                {o}
              </span>
            ))}
          </div>
        ) : (
          <p className={`text-sm ${c.faint}`}>Your choices show here as buttons.</p>
        ))}
    </div>
  );

  const TypeBadge = ({ t, extra }: { t: string; extra?: string }) => {
    const Icon = typeIcon(t);
    return (
      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${c.badge}`}>
        <Icon className="h-3 w-3" />
        {typeLabel(t)}
        {extra}
      </span>
    );
  };

  const editorTitle = editingQId ? 'Edit question' : typePicked ? 'New question' : 'What kind of question?';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={requestClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Booking questions for ${category.label}`}
        className={`flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border shadow-2xl sm:rounded-2xl ${c.panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${c.bar}`}>
          <div className="flex min-w-0 items-center gap-2.5">
            {viewMode === 'editor' ? (
              <button
                type="button"
                onClick={backToList}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.iconBtn}`}
                aria-label="Back to questions"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.accentIcon}`}>
                <List className="h-4 w-4" />
              </span>
            )}
            <div className="min-w-0">
              <h3 className={`truncate text-base font-semibold ${c.text}`}>
                {viewMode === 'editor' ? editorTitle : 'Booking questions'}
              </h3>
              <p className={`truncate text-sm ${c.sub}`}>{category.label}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${c.iconBtn}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <AnimatePresence mode="wait" initial={false}>
            {viewMode === 'list' ? (
              /* ── List of questions ── */
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="space-y-4"
              >
                <p className={`text-[15px] leading-relaxed ${c.sub}`}>
                  Customers who pick <span className={`font-semibold ${c.text}`}>{category.label}</span> answer these on your
                  booking form. You see the answers on the lead.
                </p>

                {mine.length === 0 ? (
                  <div className={`rounded-xl border border-dashed px-4 py-8 text-center ${c.empty}`}>
                    <p className={`text-[15px] font-semibold ${c.text}`}>No questions yet</p>
                    <p className={`mx-auto mt-1 max-w-xs text-sm ${c.sub}`}>
                      Ask what you need to quote it, like size, age, or how many rooms.
                    </p>
                    <button
                      type="button"
                      onClick={openNew}
                      className={`mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold ${c.primary}`}
                    >
                      <Plus className="h-4 w-4" /> Add question
                    </button>
                  </div>
                ) : (
                  <>
                    <ol className="space-y-2">
                      {mine.map((q, i) => (
                        <li key={q.id} className={`flex items-center gap-2 rounded-xl border p-3 ${c.row}`}>
                          <span className={`w-5 shrink-0 text-center text-sm font-semibold tabular-nums ${c.faint}`}>{i + 1}</span>
                          <button type="button" onClick={() => openEdit(q)} className="min-w-0 flex-1 text-left">
                            <p className={`truncate text-[15px] font-semibold ${c.text}`}>{q.label}</p>
                            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                              <TypeBadge
                                t={q.type}
                                extra={q.type === 'select' ? ` · ${q.options?.length || 0}` : undefined}
                              />
                              {q.type === 'select' && q.options?.length ? (
                                <span className={`truncate text-[13px] ${c.faint}`}>{q.options.join(', ')}</span>
                              ) : null}
                            </div>
                          </button>
                          <div className="flex shrink-0 items-center">
                            <button
                              type="button"
                              onClick={() => move(q.id, -1)}
                              disabled={i === 0}
                              className={`flex h-9 w-8 items-center justify-center rounded-lg ${c.iconBtn}`}
                              aria-label="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(q.id, 1)}
                              disabled={i === mine.length - 1}
                              className={`flex h-9 w-8 items-center justify-center rounded-lg ${c.iconBtn}`}
                              aria-label="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(q)}
                              className={`hidden h-9 w-9 items-center justify-center rounded-lg sm:flex ${c.iconBtn}`}
                              aria-label="Edit question"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                              aria-label="Delete question"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <button
                      type="button"
                      onClick={openNew}
                      className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed py-3 text-sm font-semibold transition hover:opacity-80 ${c.empty} ${c.text}`}
                    >
                      <Plus className="h-4 w-4" /> Add question
                    </button>
                  </>
                )}
              </motion.div>
            ) : !typePicked ? (
              /* ── Step 1: pick the kind of question ── */
              <motion.div
                key="pick"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="space-y-2.5"
              >
                <p className={`mb-1 text-[15px] ${c.sub}`}>Pick how customers will answer. You&rsquo;ll write the question next.</p>
                {QUESTION_TYPES.map(({ val, label: tl, example, icon: Icon }) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => pickType(val)}
                    className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition ${c.choice}`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.accentIcon}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[15px] font-semibold ${c.text}`}>{tl}</span>
                      <span className={`block text-sm ${c.faint}`}>{example}</span>
                    </span>
                    <ChevronRight className={`h-4 w-4 shrink-0 transition group-hover:translate-x-0.5 ${c.faint}`} />
                  </button>
                ))}
              </motion.div>
            ) : (
              /* ── Step 2: write the question (and choices, for lists) ── */
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.12 }}
                className="space-y-5"
              >
                {/* Chosen type, with a way to change it */}
                <div className="flex items-center justify-between gap-3">
                  <TypeBadge t={type} />
                  <button
                    type="button"
                    onClick={() => setTypePicked(false)}
                    className={`text-sm font-semibold underline-offset-2 hover:underline ${c.accentText}`}
                  >
                    Change type
                  </button>
                </div>

                {/* Question */}
                <div>
                  <label htmlFor="q-label" className={`mb-1.5 block text-sm font-semibold ${c.text}`}>
                    Question
                  </label>
                  <input
                    id="q-label"
                    type="text"
                    value={label}
                    autoFocus
                    maxLength={200}
                    onChange={(e) => {
                      setLabel(e.target.value);
                      setLabelError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && type !== 'select' && confirmQuestion()}
                    placeholder={
                      type === 'checkbox'
                        ? 'e.g. Is water coming inside?'
                        : type === 'select'
                        ? 'e.g. What type of roof is it?'
                        : 'e.g. About how old is the roof?'
                    }
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-base outline-none transition sm:text-sm ${
                      labelError ? 'border-rose-500' : ''
                    } ${c.input}`}
                  />
                  {labelError && (
                    <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-rose-500">
                      <AlertCircle className="h-3.5 w-3.5" /> {labelError}
                    </p>
                  )}
                </div>

                {/* Choices (list questions only) */}
                {type === 'select' && (
                  <div>
                    <p className={`mb-1.5 text-sm font-semibold ${c.text}`}>
                      Choices <span className={`font-normal ${c.faint}`}>· at least 2</span>
                    </p>
                    {options.length > 0 && (
                      <ul className={`mb-2 divide-y overflow-hidden rounded-xl border ${c.row} ${isDark ? 'divide-white/10' : 'divide-slate-100'}`}>
                        {options.map((opt, i) => (
                          <li key={`${opt}-${i}`} className="flex items-center gap-2 px-3 py-2">
                            <span className={`w-5 text-center text-xs font-semibold tabular-nums ${c.faint}`}>{i + 1}</span>
                            <span className={`min-w-0 flex-1 truncate text-[15px] ${c.text}`}>{opt}</span>
                            <button
                              type="button"
                              onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500"
                              aria-label={`Remove ${opt}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={optionDraft}
                        maxLength={80}
                        onChange={(e) => {
                          setOptionDraft(e.target.value);
                          setOptionsError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addOption();
                          }
                        }}
                        placeholder={options.length ? 'Add another choice' : 'e.g. Shingle'}
                        className={`min-w-0 flex-1 rounded-xl border px-3.5 py-2.5 text-base outline-none sm:text-sm ${c.input}`}
                      />
                      <button
                        type="button"
                        onClick={addOption}
                        className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${c.btn}`}
                      >
                        <Plus className="h-4 w-4" /> Add
                      </button>
                    </div>
                    {optionsError ? (
                      <p className="mt-1.5 flex items-center gap-1 text-sm font-medium text-rose-500">
                        <AlertCircle className="h-3.5 w-3.5" /> {optionsError}
                      </p>
                    ) : (
                      <p className={`mt-1.5 text-[13px] ${c.faint}`}>Press Enter to add each one.</p>
                    )}
                  </div>
                )}

                {type === 'checkbox' && (
                  <p className={`text-[13px] ${c.faint}`}>Nothing else to set up. Customers tap Yes or No.</p>
                )}

                <Preview />
              </motion.div>
            )}
          </AnimatePresence>

          {saveError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-medium text-rose-500">
              <AlertCircle className="h-4 w-4 shrink-0" /> {saveError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] ${c.bar}`}>
          {confirmDiscard ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={`text-sm ${c.text}`}>Discard your changes?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDiscard(false)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold ${c.btn}`}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  Discard
                </button>
              </div>
            </div>
          ) : viewMode === 'editor' ? (
            <div className="flex justify-end gap-2">
              <button type="button" onClick={backToList} className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${c.btn}`}>
                Cancel
              </button>
              {typePicked && (
                <button
                  type="button"
                  onClick={confirmQuestion}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${c.primary}`}
                >
                  {editingQId ? 'Update question' : 'Add question'}
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className={`text-sm ${dirty ? (isDark ? 'text-amber-300' : 'text-amber-700') : c.faint}`}>
                {dirty ? 'Changes not saved yet' : `${mine.length} question${mine.length === 1 ? '' : 's'}`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={requestClose}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold ${c.btn}`}
                >
                  {dirty ? 'Cancel' : 'Close'}
                </button>
                {dirty && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${c.primary}`}
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}