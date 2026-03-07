'use client';

import { useState } from 'react';
import { 
  Plus, Trash2, AlertCircle, Check, Edit2, X, Users, 
  Settings2, Eye, Layout, Save, ChevronRight 
} from 'lucide-react';

type CustomQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
};

export default function FormTab({ company }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Form State
  const [ctaHeading, setCtaHeading] = useState(company.cta_heading || '');
  const [ctaSuccessMessage, setCtaSuccessMessage] = useState(company.cta_success_message || '');
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(company.custom_questions || []);
  
  // UI State
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<CustomQuestion>({ id: '', label: '', type: 'text', required: false, options: [] });
  const [newOption, setNewOption] = useState('');

  const handleSaveAll = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });
    
    try {
      const payload = {
        cta: { cta_heading: ctaHeading, cta_success_message: ctaSuccessMessage },
        questions: customQuestions
      };

      // Combined API call (Better for UX)
      const res = await fetch(`/api/company/${company.slug}/settings/form`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update settings');
      
      setStatus({ type: 'success', message: 'Form configuration updated successfully!' });
      setTimeout(() => setStatus({ type: null, message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateQuestion = () => {
    if (!newQuestion.label.trim()) return setStatus({ type: 'error', message: 'Label is required' });
    
    if (editingQuestionId) {
      setCustomQuestions(customQuestions.map(q => q.id === editingQuestionId ? newQuestion : q));
    } else {
      setCustomQuestions([...customQuestions, { ...newQuestion, id: `q_${Date.now()}` }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setNewQuestion({ id: '', label: '', type: 'text', required: false, options: [] });
    setNewOption('');
    setShowAddQuestion(false);
    setEditingQuestionId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
          <p className="text-gray-500 text-sm">Configure how customers request quotes from your business.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all shadow-sm shadow-indigo-200"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Notifications */}
      {status.type && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border animate-in fade-in slide-in-from-top-2 ${
          status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {status.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Editor */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section: Custom Questions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-700">
                <Settings2 className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-sm uppercase tracking-wider">Custom Fields</span>
              </div>
              {!showAddQuestion && (
                <button onClick={() => setShowAddQuestion(true)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded-lg text-sm font-bold transition flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Field
                </button>
              )}
            </div>

            <div className="p-6">
              {showAddQuestion ? (
                <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100 space-y-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-600 uppercase mb-1.5">Question Label</label>
                      <input
                        type="text"
                        value={newQuestion.label}
                        onChange={(e) => setNewQuestion({ ...newQuestion, label: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                        placeholder="e.g. Budget Range"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-600 uppercase mb-1.5">Input Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['text', 'select', 'checkbox'].map((t) => (
                          <button
                            key={t}
                            onClick={() => setNewQuestion({ ...newQuestion, type: t as any, options: [] })}
                            className={`py-2 text-xs font-bold rounded-lg border capitalize transition ${
                              newQuestion.type === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {newQuestion.type === 'select' && (
                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold text-indigo-600 uppercase">Dropdown Options</label>
                        <div className="space-y-2">
                          {newQuestion.options?.map((opt, i) => (
                            <div key={i} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100 group">
                              <span className="text-sm">{opt}</span>
                              <button onClick={() => setNewQuestion({...newQuestion, options: newQuestion.options?.filter((_, idx) => idx !== i)})} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <input 
                              type="text" value={newOption} onChange={(e) => setNewOption(e.target.value)}
                              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200" placeholder="Add option..."
                            />
                            <button onClick={() => { if(newOption) { setNewQuestion({...newQuestion, options: [...(newQuestion.options || []), newOption]}); setNewOption(''); }}} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">Add</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 cursor-pointer">
                      <input 
                        type="checkbox" checked={newQuestion.required} 
                        onChange={(e) => setNewQuestion({...newQuestion, required: e.target.checked})}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span className="text-sm font-medium text-gray-700">Mark as required field</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={addOrUpdateQuestion} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition">
                      {editingQuestionId ? 'Update Field' : 'Save Field'}
                    </button>
                    <button onClick={resetForm} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-300 transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {customQuestions.length > 0 ? (
                    customQuestions.map((q) => (
                      <div key={q.id} className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 text-gray-400 rounded-lg group-hover:bg-white group-hover:text-indigo-500 transition">
                            <Layout className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{q.label} {q.required && <span className="text-red-500">*</span>}</p>
                            <p className="text-[11px] text-gray-400 uppercase font-medium">{q.type} Field</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => { setNewQuestion(q); setEditingQuestionId(q.id); setShowAddQuestion(true); }} className="p-2 text-gray-400 hover:text-indigo-600 transition"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setCustomQuestions(customQuestions.filter(x => x.id !== q.id))} className="p-2 text-gray-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-sm text-gray-500">No custom fields yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section: Appearance */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 text-gray-700">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  <span className="font-bold text-sm uppercase tracking-wider">Form Copy</span>
                </div>
             </div>
             <div className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Main Heading</label>
                  <input 
                    type="text" value={ctaHeading} onChange={(e) => setCtaHeading(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    placeholder="e.g. Let's get started"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase">Success Message</label>
                  <textarea 
                    value={ctaSuccessMessage} onChange={(e) => setCtaSuccessMessage(e.target.value)}
                    rows={3} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"
                    placeholder="What happens next?"
                  />
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <div className="bg-gray-900 rounded-[2.5rem] p-4 border-[8px] border-gray-800 shadow-2xl overflow-hidden aspect-[9/16] max-h-[700px] flex flex-col">
              <div className="bg-white rounded-[1.5rem] flex-1 overflow-y-auto no-scrollbar">
                
                {/* Header of Preview */}
                <div className="bg-indigo-600 p-6 text-white">
                  <div className="w-10 h-1 text-white/20 bg-white/20 rounded-full mx-auto mb-6" />
                  <h3 className="text-xl font-bold leading-tight">{ctaHeading || 'Your Heading Here'}</h3>
                </div>

                {/* Form Body Preview */}
                <div className="p-6 space-y-6">
                  {customQuestions.length > 0 ? (
                    customQuestions.map((q) => (
                      <div key={q.id} className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 block">
                          {q.label} {q.required && <span className="text-red-500">*</span>}
                        </label>
                        {q.type === 'text' && (
                          <div className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg px-3 flex items-center text-gray-400 text-sm italic">User input...</div>
                        )}
                        {q.type === 'select' && (
                          <div className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg px-3 flex items-center justify-between text-gray-400 text-sm">
                            Select option... <ChevronRight className="w-4 h-4 rotate-90" />
                          </div>
                        )}
                        {q.type === 'checkbox' && (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-gray-200 rounded" />
                            <span className="text-sm text-gray-500">I agree to the terms</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-2">
                      <p className="text-gray-400 text-sm">No fields added yet</p>
                    </div>
                  )}

                  <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">
                    Submit Request
                  </button>
                  
                  <div className="pt-4 border-t border-gray-50 flex justify-center">
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Powered by Your Brand</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Eye className="w-3 h-3" /> Live Preview
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}