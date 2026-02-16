'use client';

import { useState } from 'react';
import { Sparkles, Plus, Trash2, AlertCircle, Check, Edit2, X, FileText, MessageSquare, Users } from 'lucide-react';

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

      setSuccess('Form appearance saved!');
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
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Customer Intake Form</h1>
            <p className="text-blue-100 text-sm">Customize how customers submit project requests</p>
          </div>
        </div>
        
        <div className="bg-white/10 rounded-lg p-4 mt-4">
          <p className="text-sm text-blue-50">
            <strong className="text-white">💡 What is this?</strong> This is the form your customers fill out on your website 
            to request quotes and services. Customize the text and add questions to gather the information you need to provide 
            accurate estimates.
          </p>
        </div>
      </div>

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

      {/* FORM APPEARANCE CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Form Appearance</h2>
              <p className="text-sm text-slate-600 mb-2">Customize the text customers see on your intake form</p>
              
              <div className="bg-purple-100 border border-purple-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-purple-900">
                  <strong>📝 What this controls:</strong> The heading, button text, and success message that appear 
                  when customers submit a project request on your website.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* CTA Heading */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Form Heading
            </label>
            <p className="text-xs text-slate-500 mb-2">
              The main headline customers see at the top of your request form
            </p>
            <input
              type="text"
              value={ctaHeading}
              onChange={(e) => setCtaHeading(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base"
              placeholder="Get Your Free Quote Today"
            />
            <p className="text-xs text-slate-400 mt-1">Example: "Get Your Free Quote" or "Request Service"</p>
          </div>

          {/* CTA Button Text */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Submit Button Text
            </label>
            <p className="text-xs text-slate-500 mb-2">
              The text displayed on the button customers click to submit their request
            </p>
            <input
              type="text"
              value={ctaButtonText}
              onChange={(e) => setCtaButtonText(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-base"
              placeholder="Submit My Project"
            />
            <p className="text-xs text-slate-400 mt-1">Example: "Get Quote" or "Submit Request"</p>
          </div>

          {/* CTA Success Message */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Success Message
            </label>
            <p className="text-xs text-slate-500 mb-2">
              The message customers see after successfully submitting their request
            </p>
            <textarea
              value={ctaSuccessMessage}
              onChange={(e) => setCtaSuccessMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none text-base"
              placeholder="Thank you! We'll get back to you within 24 hours."
            />
            <p className="text-xs text-slate-400 mt-1">Let them know what happens next and when to expect a response</p>
          </div>

          <button
            onClick={handleSaveCTA}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? 'Saving...' : 'Save Appearance Settings'}
          </button>
        </div>
      </div>

      {/* CUSTOM QUESTIONS CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Custom Questions</h2>
                <p className="text-sm text-slate-600 mb-2">Gather specific information from customers to better understand their projects</p>
                
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-blue-900 mb-2">
                    <strong>🎯 Why add questions?</strong> Custom questions help you:
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1 ml-4">
                    <li>• Get the details you need to provide accurate quotes</li>
                    <li>• Qualify leads before spending time on estimates</li>
                    <li>• Understand project scope and timeline expectations</li>
                    <li>• Reduce back-and-forth communication with customers</li>
                  </ul>
                </div>
              </div>
            </div>

            {!showAddQuestion && (
              <button
                onClick={() => setShowAddQuestion(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm flex-shrink-0"
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-slate-600">
                  {customQuestions.length} custom question{customQuestions.length !== 1 ? 's' : ''} active
                </p>
              </div>
              
              {customQuestions.map((question) => (
                <div
                  key={question.id}
                  className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition bg-slate-50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-slate-900">{question.label}</span>
                      {question.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
                      <span className="capitalize bg-slate-200 px-2 py-0.5 rounded text-xs font-medium">
                        {question.type === 'select' ? 'Dropdown' : question.type === 'checkbox' ? 'Yes/No' : 'Text Input'}
                      </span>
                      {question.type === 'select' && question.options && (
                        <span className="text-slate-500">• {question.options.length} option{question.options.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    
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
                      title="Edit question"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                      title="Delete question"
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
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-slate-700 font-semibold mb-2">No custom questions yet</p>
              <p className="text-sm text-slate-600 mb-1">Start gathering better information from your customers</p>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                Examples: "What's your budget range?", "When do you need this completed?", "Is this an emergency?"
              </p>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition text-sm shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Your First Question
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
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Question Label *
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  This is what customers will see on the form
                </p>
                <input
                  type="text"
                  value={newQuestion.label}
                  onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-base"
                  placeholder="e.g., What's your timeline for this project?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Answer Type
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Choose how customers will answer this question
                </p>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any, options: [] })}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer text-base"
                >
                  <option value="text">Short Text Input - Open-ended answer</option>
                  <option value="select">Dropdown - Choose from predefined options</option>
                  <option value="checkbox">Yes/No Checkbox - Simple yes or no</option>
                </select>
              </div>

              {newQuestion.type === 'select' && (
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Dropdown Options *
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Add the choices customers can select from
                  </p>
                  
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
                      placeholder="Type an option (e.g., Within 1 week)"
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

              <label className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition">
                <input
                  type="checkbox"
                  checked={newQuestion.required}
                  onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer mt-0.5 flex-shrink-0"
                />
                <div>
                  <span className="font-semibold text-slate-700 block">Make this question required</span>
                  <span className="text-xs text-slate-500">Customers must answer this before submitting the form</span>
                </div>
              </label>

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

          {customQuestions.length > 0 && !showAddQuestion && hasUnsavedChanges && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">You have unsaved changes</p>
                  <p className="text-sm text-amber-700">Your questions won't appear on the form until you save them</p>
                </div>
              </div>
              <button
                onClick={handleSaveQuestions}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? 'Saving...' : 'Save Custom Questions'}
              </button>
            </div>
          )}

          {customQuestions.length > 0 && !showAddQuestion && !hasUnsavedChanges && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-semibold">All questions are saved</p>
                <p className="text-xs text-green-700">These questions will appear on your customer intake form</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}