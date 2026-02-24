'use client';

import { useState } from 'react';
import { Plus, Trash2, AlertCircle, Check, Edit2, X, Users } from 'lucide-react';

type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

export default function FormTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [ctaHeading, setCtaHeading] = useState(company.cta_heading || '');
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');

  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({ id: '', label: '', type: 'text', required: false, options: [] });
  const [newOption, setNewOption] = useState('');

  const handleSaveCTA = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-cta', data: { cta_heading: ctaHeading, cta_button_text: company.cta_button_text, cta_success_message: ctaSuccessMessage } }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Form settings saved!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setLoading(false); }
  };

  const handleSaveQuestions = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-custom-questions', data: { custom_questions: customQuestions } }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Questions saved!');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setLoading(false); }
  };

  const addQuestion = () => {
    if (!newQuestion.label.trim()) { setError('Question label is required'); return; }
    if (newQuestion.type === 'select' && !newQuestion.options?.length) { setError('Add at least one option'); return; }
    setCustomQuestions([...customQuestions, { ...newQuestion, id: `q_${Date.now()}` }]);
    resetForm();
  };

  const updateQuestion = () => {
    if (!newQuestion.label.trim()) { setError('Question label is required'); return; }
    if (newQuestion.type === 'select' && !newQuestion.options?.length) { setError('Add at least one option'); return; }
    setCustomQuestions(customQuestions.map(q => q.id === editingQuestionId ? newQuestion : q));
    resetForm();
  };

  const resetForm = () => {
    setNewQuestion({ id: '', label: '', type: 'text', required: false, options: [] });
    setNewOption(''); setShowAddQuestion(false); setEditingQuestionId(null); setError('');
  };

  const startEdit = (q: CustomQuestion) => { setNewQuestion({ ...q }); setEditingQuestionId(q.id); setShowAddQuestion(true); };
  const addOption = () => { if (newOption.trim()) { setNewQuestion({ ...newQuestion, options: [...(newQuestion.options || []), newOption.trim()] }); setNewOption(''); } };
  const removeOption = (i: number) => setNewQuestion({ ...newQuestion, options: newQuestion.options?.filter((_, idx) => idx !== i) });

  const typeLabel = (t: string) => t === 'select' ? 'Dropdown' : t === 'checkbox' ? 'Yes / No' : 'Text';

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-bold text-gray-900">Customer Intake Form</h2>
        <p className="text-sm text-gray-500 mt-1">Customize the form customers fill out to request a quote</p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── CUSTOM QUESTIONS ─────────────────────────────── */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custom Questions</span>
            {customQuestions.length > 0 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold">{customQuestions.length}</span>
            )}
          </div>
          {!showAddQuestion && (
            <button onClick={() => setShowAddQuestion(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition">
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          )}
        </div>

        {/* Add/Edit form */}
        {showAddQuestion && (
          <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                {editingQuestionId ? 'Edit Question' : 'New Question'}
              </p>
              <button onClick={resetForm} className="text-indigo-400 hover:text-indigo-700 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Label */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Question *
              </label>
              <input
                type="text"
                value={newQuestion.label}
                onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                placeholder="e.g., What is your budget range?"
                autoFocus
                className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none bg-white transition"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Answer Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['text', 'select', 'checkbox'] as const).map(t => (
                  <button key={t}
                    onClick={() => setNewQuestion({ ...newQuestion, type: t, options: [] })}
                    className={`py-2.5 text-xs font-bold border transition ${newQuestion.type === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                    {typeLabel(t)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {newQuestion.type === 'text' && 'Customer types a free-form answer'}
                {newQuestion.type === 'select' && 'Customer picks from a list you define'}
                {newQuestion.type === 'checkbox' && 'Customer answers yes or no'}
              </p>
            </div>

            {/* Dropdown options */}
            {newQuestion.type === 'select' && (
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Options</span>
                </div>
                <div className="p-3 space-y-2">
                  {newQuestion.options?.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 group">
                      <span className="text-sm text-gray-700">{opt}</span>
                      <button onClick={() => removeOption(i)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input type="text" value={newOption} onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addOption()}
                      placeholder="Add an option..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition" />
                    <button onClick={addOption} disabled={!newOption.trim()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold transition">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Required toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={newQuestion.required}
                onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
              <div>
                <span className="text-sm font-semibold text-gray-700">Required</span>
                <p className="text-xs text-gray-400">Customer must answer before submitting</p>
              </div>
            </label>

            <div className="flex gap-2">
              <button onClick={editingQuestionId ? updateQuestion : addQuestion}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition">
                {editingQuestionId ? 'Update Question' : 'Add Question'}
              </button>
              <button onClick={resetForm}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Question list */}
        {customQuestions.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {customQuestions.map((q) => (
              <div key={q.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 group transition">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{q.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{typeLabel(q.type)}</span>
                    {q.type === 'select' && q.options?.length && (
                      <span className="text-xs text-gray-400">· {q.options.length} options</span>
                    )}
                    {q.required && (
                      <span className="text-xs font-bold text-red-500">Required</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                  <button onClick={() => startEdit(q)}
                    className="p-1.5 hover:bg-indigo-50 text-indigo-400 transition">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))}
                    className="p-1.5 hover:bg-red-50 text-red-400 transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : !showAddQuestion ? (
          <div className="py-12 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400 mb-1">No custom questions yet</p>
            <p className="text-xs text-gray-300 max-w-xs mx-auto">
              Add questions to gather the details you need — budget, timeline, project scope — before spending time on estimates
            </p>
          </div>
        ) : null}

        {/* Save footer */}
        {customQuestions.length > 0 && !showAddQuestion && (
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
            <button onClick={handleSaveQuestions} disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition">
              {loading ? 'Saving...' : 'Save Questions'}
            </button>
          </div>
        )}
      </div>

      {/* ── FORM APPEARANCE ──────────────────────────────── */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Form Appearance</span>
          <p className="text-xs text-gray-400 mt-1">Customize the text customers see when filling out the form</p>
        </div>
        <div className="p-5 space-y-4">

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Form Heading</label>
            <input type="text" value={ctaHeading} onChange={(e) => setCtaHeading(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
              placeholder="Get Your Free Quote Today" />
            <p className="text-xs text-gray-400 mt-1">The headline shown at the top of your request form</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Success Message</label>
            <textarea value={ctaSuccessMessage} onChange={(e) => setCtaSuccessMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition resize-none"
              placeholder="Thank you! We'll get back to you within 24 hours." />
            <p className="text-xs text-gray-400 mt-1">Shown after a customer submits — tell them what to expect next</p>
          </div>
        </div>

        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <button onClick={handleSaveCTA} disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition">
            {loading ? 'Saving...' : 'Save Form Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}