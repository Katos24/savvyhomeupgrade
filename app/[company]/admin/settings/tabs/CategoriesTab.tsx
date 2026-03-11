'use client';

import { useState } from 'react';
import { Plus, X, RotateCcw, CheckSquare, Trash2, Save, AlertCircle, AlertTriangle, Layers } from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';

type TaskTemplate = {
  id: string;
  label: string;
  order: number;
};

type Category = {
  value: string;
  label: string;
  task_templates?: TaskTemplate[];
};

export default function CategoriesTab({ company, currentUser }: { company: any; currentUser?: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const defaultCategories = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
  
  // Initial State: Look at company data, fallback to defaults
  const [categories, setCategories] = useState<Category[]>(
    company.form_categories?.length > 0 ? company.form_categories : defaultCategories
  );
  
  const [useDefaults, setUseDefaults] = useState(!company.form_categories?.length);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ label: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'task'; index?: number; id?: string; label?: string } | null>(null);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingTasks, setEditingTasks] = useState<TaskTemplate[]>([]);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [inputError, setInputError] = useState(false);

  // --- ACTIONS ---

  const handleAddCategory = () => {
    if (!newCategory.label.trim()) return;
    const value = newCategory.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    
    setCategories([...categories, { 
      value, 
      label: newCategory.label.trim(), 
      task_templates: [] 
    }]);
    
    setNewCategory({ label: '' });
    setShowAddForm(false);
    setUseDefaults(false); // Switch to custom mode
  };

  const confirmDeleteCategory = () => {
    if (deleteConfirm?.type === 'category' && deleteConfirm.index !== undefined) {
      const updated = categories.filter((_, i) => i !== deleteConfirm.index);
      setCategories(updated);
      setUseDefaults(false); // Critical: Ensures save sends the updated list, not 'null'
      setDeleteConfirm(null);
      setSuccess("Removed locally. Hit 'Save Changes' to update database.");
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const openTaskEditor = (index: number) => {
    setEditingCategoryIndex(index);
    setEditingTasks(categories[index].task_templates || []);
    setNewTaskLabel('');
    setInputError(false);
  };

  const addTask = () => {
    if (!newTaskLabel.trim()) return;
    setEditingTasks([...editingTasks, { 
      id: `task_${Date.now()}`, 
      label: newTaskLabel.trim(), 
      order: editingTasks.length + 1 
    }]);
    setNewTaskLabel('');
    setInputError(false);
  };

  const saveTaskTemplates = () => {
    if (newTaskLabel.trim()) {
      setInputError(true);
      return;
    }
    if (editingCategoryIndex === null) return;
    
    const updated = [...categories];
    updated[editingCategoryIndex] = { 
      ...updated[editingCategoryIndex], 
      task_templates: editingTasks 
    };
    
    setCategories(updated);
    setUseDefaults(false);
    setEditingCategoryIndex(null);
    setSuccess("Checklist updated locally.");
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'update-categories', 
          data: { form_categories: useDefaults ? null : categories } 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Settings saved successfully');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Network error: Failed to save categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-2">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Service Categories</h2>
          <p className="text-sm text-gray-500 font-medium">Manage trades and checklists</p>
        </div>
        <div className="flex gap-2">
          {!useDefaults && (
            <button 
              onClick={() => { if(confirm("Reset to default trade list?")) { setCategories(defaultCategories); setUseDefaults(true); }}} 
              className="p-3 bg-gray-100 text-gray-400 rounded-2xl hover:text-gray-600 transition"
              title="Reset to Defaults"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            <Save className="w-5 h-5" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {success && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold animate-in slide-in-from-top-2">✓ {success}</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-bold">✕ {error}</div>}

      {/* Add Category Section */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-4">
        {showAddForm ? (
          <div className="space-y-4">
            <input 
              value={newCategory.label} 
              onChange={(e) => setNewCategory({ label: e.target.value })} 
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 font-bold focus:ring-2 focus:ring-indigo-100 text-gray-900" 
              placeholder="New category name (e.g. Plumbing)..." 
              autoFocus 
            />
            <div className="flex gap-2">
              <button onClick={handleAddCategory} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-md">Add Category</button>
              <button onClick={() => setShowAddForm(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} className="w-full py-4 flex items-center justify-center gap-2 text-indigo-500 font-black hover:bg-indigo-50/50 rounded-2xl transition-all">
            <Plus className="w-5 h-5" /> Add A New Trade Category
          </button>
        )}
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-[2rem] p-6 hover:shadow-xl transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                <Layers className="w-6 h-6" />
              </div>
              <button 
                onClick={() => setDeleteConfirm({ type: 'category', index, label: cat.label })} 
                className="p-2 text-gray-300 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{cat.label}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
              {cat.task_templates?.length || 0} Checklist Items
            </p>
            <button 
              onClick={() => openTaskEditor(index)} 
              className="w-full py-3 bg-gray-50 hover:bg-indigo-600 text-gray-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <CheckSquare className="w-4 h-4" /> Edit Checklist
            </button>
          </div>
        ))}
      </div>

      {/* TASK EDITOR MODAL */}
      {editingCategoryIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-2xl sm:rounded-[3rem] h-[90vh] sm:h-auto overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl">
            
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div>
                <h3 className="text-xl font-black text-gray-900">Task Checklist</h3>
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                  {categories[editingCategoryIndex].label}
                </p>
              </div>
              <button onClick={() => setEditingCategoryIndex(null)} className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Input Area */}
              <div className="space-y-2">
                <div className={`flex gap-2 p-2 rounded-[2rem] border-2 transition-all duration-300 ${
                  inputError ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-indigo-50/50 border-indigo-100 border-dashed'
                }`}>
                  <input 
                    value={newTaskLabel} 
                    onChange={(e) => { setNewTaskLabel(e.target.value); setInputError(false); }} 
                    onKeyDown={(e) => e.key === 'Enter' && addTask()} 
                    placeholder="Add step (e.g. Check for leaks)..." 
                    className="flex-1 bg-transparent border-none font-bold text-gray-900 focus:ring-0 px-4" 
                  />
                  <button onClick={addTask} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-md active:scale-90 transition-all">
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
                {inputError && (
                  <p className="text-xs font-black text-red-600 uppercase tracking-widest ml-4 animate-bounce flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Click the + button to add the task!
                  </p>
                )}
              </div>

              {/* Task List */}
              <div className="space-y-3">
                {editingTasks.map((task) => (
                  <div key={task.id} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 group border border-transparent hover:border-indigo-100 transition-all">
                    <span className="text-gray-900 font-bold flex-1">{task.label}</span>
                    <button 
                      onClick={() => setEditingTasks(editingTasks.filter(t => t.id !== task.id))} 
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button onClick={() => setEditingCategoryIndex(null)} className="flex-1 py-4 bg-white border border-gray-200 rounded-2xl font-bold text-gray-500">Cancel</button>
              <button onClick={saveTaskTemplates} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all">Apply Tasks</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4 text-center">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Trade?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              This will remove <span className="text-gray-900 font-bold">"{deleteConfirm.label}"</span>. 
              Checklists for this trade will be deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition">Keep it</button>
              <button 
                onClick={confirmDeleteCategory} 
                className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100 active:scale-95 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}