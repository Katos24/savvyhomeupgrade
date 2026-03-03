'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Plus, X, Trash2, Edit2, Users } from 'lucide-react';
import type { CustomQuestion } from '../types';

export interface FormStepRef {
  getData: () => { ctaHeading: string; ctaSuccessMessage: string; customQuestions: CustomQuestion[] };
}

const typeLabel = (t: string) => t === 'select' ? 'Dropdown' : t === 'checkbox' ? 'Yes / No' : 'Text';

const FormStep = forwardRef<FormStepRef, { company: any; showErr: (msg: string) => void }>(
  ({ company, showErr }, ref) => {
    const [ctaHeading, setCtaHeading] = useState(company.cta_heading || '');
    const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');
    const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [newQuestion, setNewQuestion] = useState<CustomQuestion>({ id: '', label: '', type: 'text', required: false, options: [] });
    const [newOption, setNewOption] = useState('');

    useImperativeHandle(ref, () => ({
      getData: () => ({ ctaHeading, ctaSuccessMessage, customQuestions }),
    }));

    const addQuestion = () => {
      if (!newQuestion.label.trim()) { showErr('Question is required'); return; }
      if (newQuestion.type === 'select' && !newQuestion.options?.length) { showErr('Add at least one option'); return; }
      if (editingQuestionId) {
        setCustomQuestions(customQuestions.map(q => q.id === editingQuestionId ? newQuestion : q));
      } else {
        setCustomQuestions([...customQuestions, { ...newQuestion, id: `q_${Date.now()}` }]);
      }
      setNewQuestion({ id: '', label: '', type: 'text', required: false, options: [] });
      setNewOption(''); setShowAddQuestion(false); setEditingQuestionId(null);
    };

    const startEdit = (q: CustomQuestion) => {
      setNewQuestion({ ...q });
      setEditingQuestionId(q.id);
      setShowAddQuestion(true);
    };

    const cancelAdd = () => {
      setShowAddQuestion(false);
      setEditingQuestionId(null);
      setNewQuestion({ id: '', label: '', type: 'text', required: false, options: [] });
      setNewOption('');
    };

    const addOptionToQuestion = () => {
      if (!newOption.trim()) return;
      setNewQuestion({ ...newQuestion, options: [...(newQuestion.options || []), newOption.trim()] });
      setNewOption('');
    };

    return (
      <div className="space-y-4">
        {/* Form Appearance */}
        <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Form Appearance</span>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Form Heading</label>
              <input type="text" value={ctaHeading} onChange={(e) => setCtaHeading(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition"
                placeholder="Get Your Free Quote Today" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Success Message</label>
              <textarea value={ctaSuccessMessage} onChange={(e) => setCtaSuccessMessage(e.target.value)} rows={2}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition resize-none"
                placeholder="Thank you! We'll get back to you within 24 hours." />
            </div>
          </div>
        </div>

        {/* Custom Questions */}
        <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Custom Questions</span>
              {customQuestions.length > 0 && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{customQuestions.length}</span>
              )}
            </div>
            {!showAddQuestion && (
              <button onClick={() => { setShowAddQuestion(true); setEditingQuestionId(null); setNewQuestion({ id: '', label: '', type: 'text', required: false, options: [] }); }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition">
                <Plus className="w-3 h-3" /> Add Question
              </button>
            )}
          </div>

          {showAddQuestion && (
            <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100 space-y-4">
              <input type="text" value={newQuestion.label}
                onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                placeholder="e.g., What is your budget range?" autoFocus
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />

              <div className="grid grid-cols-3 gap-2">
                {(['text', 'select', 'checkbox'] as const).map(t => (
                  <button key={t} onClick={() => setNewQuestion({ ...newQuestion, type: t, options: [] })}
                    className={`py-2 text-xs font-bold border rounded-lg transition ${newQuestion.type === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {typeLabel(t)}
                  </button>
                ))}
              </div>

              {newQuestion.type === 'select' && (
                <div className="space-y-2">
                  {newQuestion.options?.map((opt, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg">
                      <span className="text-sm text-gray-700">{opt}</span>
                      <button onClick={() => setNewQuestion({ ...newQuestion, options: newQuestion.options?.filter((_, idx) => idx !== i) })}
                        className="text-red-400 hover:text-red-600 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input type="text" value={newOption} onChange={(e) => setNewOption(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addOptionToQuestion(); }}
                      placeholder="Add option..."
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />
                    <button onClick={addOptionToQuestion}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition">Add</button>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={newQuestion.required}
                  onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm font-semibold text-gray-700">Required</span>
              </label>

              <div className="flex gap-2">
                <button onClick={addQuestion}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">
                  {editingQuestionId ? 'Update' : 'Add Question'}
                </button>
                <button onClick={cancelAdd}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition">Cancel</button>
              </div>
            </div>
          )}

          {customQuestions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {customQuestions.map(q => (
                <div key={q.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 group transition">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{q.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400">{typeLabel(q.type)}</span>
                      {q.required && <span className="text-xs font-bold text-red-500">Required</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => startEdit(q)}
                      className="p-1.5 hover:bg-indigo-50 text-indigo-400 rounded-lg transition">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))}
                      className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !showAddQuestion && (
            <div className="py-10 text-center">
              <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">No custom questions yet</p>
              <p className="text-xs text-gray-300 mt-1">Optional — you can add them later in Settings</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

FormStep.displayName = 'FormStep';
export default FormStep;