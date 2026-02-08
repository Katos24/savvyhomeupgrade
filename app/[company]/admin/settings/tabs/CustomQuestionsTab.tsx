'use client';

import { useState } from 'react';
import { HelpCircle, Plus, Trash2, Check, GripVertical } from 'lucide-react';

export default function CustomQuestionsTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [questions, setQuestions] = useState<Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox';
    options?: string[];
    required: boolean;
  }>>(company.custom_questions || []);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        label: '',
        type: 'text',
        required: false,
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleSave = async () => {
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
            custom_questions: questions,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Custom questions saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Custom Questions</h2>
        <p className="text-slate-600">Add custom fields to your lead capture form</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <HelpCircle className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 mb-4">No custom questions yet</p>
            <button
              onClick={addQuestion}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-slate-400" />
                      <span className="font-semibold text-slate-700">Question {index + 1}</span>
                    </div>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="text-red-600 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Question Label
                    </label>
                    <input
                      type="text"
                      value={question.label}
                      onChange={(e) => updateQuestion(question.id, 'label', e.target.value)}
                      placeholder="e.g., What is your budget?"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Field Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="select">Dropdown</option>
                        <option value="checkbox">Checkbox</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Required?
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm text-slate-700">
                          {question.required ? 'Yes' : 'No'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {question.type === 'select' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Dropdown Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={question.options?.join(', ') || ''}
                        onChange={(e) => updateQuestion(question.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addQuestion}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Another Question
            </button>
          </>
        )}

        {questions.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Custom Questions'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
