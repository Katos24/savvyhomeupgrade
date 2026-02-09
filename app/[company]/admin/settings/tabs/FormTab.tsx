'use client';

import { useState } from 'react';
import { Sparkles, Plus, Trash2, AlertCircle, Check, Edit2, X } from 'lucide-react';

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

  // CTA Settings
  const [ctaHeading, setCtaHeading] = useState(company.cta_heading || '');
  const [ctaButtonText, setCtaButtonText] = useState(company.cta_button_text || '');
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');

  // Custom Questions
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(
    company.custom_questions || []
  );
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({
    id: '',
    label: '',
    type: 'text',
    required: false,
    options: [],
  });
  const [newOption, setNewOption] = useState('');

  const handleSaveCTA = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-cta',
          data: {
            cta_heading: ctaHeading,
            cta_button_text: ctaButtonText,
            cta_success_message: ctaSuccessMessage,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to update CTA settings');

      setSuccess('CTA settings saved!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestions = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-custom-questions',
          data: {
            custom_questions: customQuestions,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to update custom questions');

      setSuccess('Custom questions saved!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!newQuestion.label.trim()) {
      setError('Question label is required');
      return;
    }

    if (newQuestion.type === 'select' && (!newQuestion.options || newQuestion.options.length === 0)) {
      setError('Dropdown questions need at least one option');
      return;
    }

    const question: CustomQuestion = {
      ...newQuestion,
      id: `q_${Date.now()}`,
    };

    setCustomQuestions([...customQuestions, question]);
    resetQuestionForm();
  };

  const updateQuestion = () => {
    if (!newQuestion.label.trim()) {
      setError('Question label is required');
      return;
    }

    if (newQuestion.type === 'select' && (!newQuestion.options || newQuestion.options.length === 0)) {
      setError('Dropdown questions need at least one option');
      return;
    }

    setCustomQuestions(
      customQuestions.map(q => q.id === editingQuestionId ? newQuestion : q)
    );
    resetQuestionForm();
  };

  const resetQuestionForm = () => {
    setNewQuestion({
      id: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
    });
    setNewOption('');
    setShowAddQuestion(false);
    setEditingQuestionId(null);
    setError('');
  };

  const startEditQuestion = (question: CustomQuestion) => {
    setNewQuestion({ ...question });
    setEditingQuestionId(question.id);
    setShowAddQuestion(true);
  };

  const removeQuestion = (id: string) => {
    setCustomQuestions(customQuestions.filter(q => q.id !== id));
  };

  const addOption = () => {
    if (newOption.trim()) {
      setNewQuestion({
        ...newQuestion,
        options: [...(newQuestion.options || []), newOption.trim()],
      });
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options?.filter((_, i) => i !== index) || [],
    });
  };

  const hasUnsavedChanges = customQuestions.length > 0 && 
    JSON.stringify(customQuestions) !== JSON.stringify(company.custom_questions || []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Alert Messages */}
      {success && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CTA SETTINGS CARD */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Form Appearance</h2>
              <p className="text-sm text-slate-600">Customize your intake form text</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* CTA Heading */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Form Heading
            </label>
            <input
              type="text"
              value={ctaHeading}
              onChange={(e) => setCtaHeading(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base"
              placeholder="Get Your Free Quote"
            />
          </div>

          {/* CTA Button Text */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Submit Button Text
            </label>
            <input
              type="text"
              value={ctaButtonText}
              onChange={(e) => setCtaButtonText(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base"
              placeholder="Submit Project"
            />
          </div>

          {/* CTA Success Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Success Message
            </label>
            <textarea
              value={ctaSuccessMessage}
              onChange={(e) => setCtaSuccessMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none text-base"
              placeholder="Thank you! We'll get back to you within 24 hours."
            />
          </div>

          <button
            onClick={handleSaveCTA}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? 'Saving...' : 'Save Appearance'}
          </button>
        </div>
      </div>

      {/* CUSTOM QUESTIONS CARD */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Custom Questions</h2>
                <p className="text-sm text-slate-600">Add extra fields to your form</p>
              </div>
            </div>

            {!showAddQuestion && (
              <button
                onClick={() => setShowAddQuestion(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Existing Questions */}
          {customQuestions.length > 0 && !showAddQuestion && (
            <div className="space-y-3">
              {customQuestions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition bg-slate-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{question.label}</span>
                      {question.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="capitalize bg-slate-200 px-2 py-0.5 rounded text-xs font-medium">
                        {question.type === 'select' ? 'Dropdown' : question.type === 'checkbox' ? 'Checkbox' : 'Text'}
                      </span>
                      {question.type === 'select' && question.options && (
                        <span className="text-slate-500">• {question.options.length} options</span>
                      )}
                    </div>
                    
                    {/* Show options preview for dropdown */}
                    {question.type === 'select' && question.options && question.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {question.options.slice(0, 3).map((opt, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {opt}
                          </span>
                        ))}
                        {question.options.length > 3 && (
                          <span className="text-xs text-slate-500">+{question.options.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEditQuestion(question)}
                      className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {customQuestions.length === 0 && !showAddQuestion && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-slate-600 font-medium mb-3">No custom questions yet</p>
              <p className="text-sm text-slate-500 mb-4">Add questions to collect more information from your customers</p>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition text-sm shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add First Question
              </button>
            </div>
          )}

          {/* Add/Edit Question Form */}
          {showAddQuestion && (
            <div className="border-2 border-blue-200 rounded-lg p-5 bg-blue-50/50 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingQuestionId ? 'Edit Question' : 'New Question'}
                </h3>
                <button
                  onClick={resetQuestionForm}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Question Label */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Question Label *
                </label>
                <input
                  type="text"
                  value={newQuestion.label}
                  onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                  placeholder="e.g., What's your budget range?"
                />
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Answer Type
                </label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any, options: [] })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer text-base"
                >
                  <option value="text">Short Text Input</option>
                  <option value="select">Dropdown (Multiple Choice)</option>
                  <option value="checkbox">Checkbox (Yes/No)</option>
                </select>
              </div>

              {/* Options for Dropdown */}
              {newQuestion.type === 'select' && (
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Dropdown Options *
                  </label>
                  
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOption();
                        }
                      }}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                      placeholder="Type an option and click Add..."
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      disabled={!newOption.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-lg font-semibold transition"
                    >
                      Add
                    </button>
                  </div>

                  {newQuestion.options && newQuestion.options.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 mb-2">
                        {newQuestion.options.length} option{newQuestion.options.length !== 1 ? 's' : ''}
                      </p>
                      {newQuestion.options.map((option, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                            <span className="text-slate-700 font-medium">{option}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeOption(idx)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <p className="text-sm text-slate-500">No options added yet</p>
                      <p className="text-xs text-slate-400 mt-1">Add at least one option to continue</p>
                    </div>
                  )}
                </div>
              )}

              {/* Required Toggle */}
              <label className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={newQuestion.required}
                  onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-700 block">Make this question required</span>
                  <span className="text-xs text-slate-500">Customers must answer before submitting</span>
                </div>
              </label>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={editingQuestionId ? updateQuestion : addQuestion}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition shadow-md"
                >
                  {editingQuestionId ? 'Update Question' : 'Add Question'}
                </button>
                <button
                  type="button"
                  onClick={resetQuestionForm}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 px-4 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Save Questions Button */}
          {customQuestions.length > 0 && !showAddQuestion && hasUnsavedChanges && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">You have unsaved changes</p>
                  <p className="text-sm text-amber-700">Click "Save Questions" to apply your changes</p>
                </div>
              </div>
              <button
                onClick={handleSaveQuestions}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? 'Saving...' : 'Save Questions'}
              </button>
            </div>
          )}

          {/* Info when no changes */}
          {customQuestions.length > 0 && !showAddQuestion && !hasUnsavedChanges && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">All questions are saved</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}