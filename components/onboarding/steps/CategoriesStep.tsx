'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Plus, X, Trash2, CheckSquare, Save, RotateCcw } from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';
import type { Category, TaskTemplate } from '../types';

export interface CategoriesStepRef {
  getData: () => { categories: Category[] };
}

const CategoriesStep = forwardRef<CategoriesStepRef, { company: any; showErr: (msg: string) => void }>(
  ({ company, showErr }, ref) => {
    const defaultCategories = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
    const [categories, setCategories] = useState<Category[]>(
      company.form_categories?.length > 0 ? company.form_categories : defaultCategories
    );
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryLabel, setNewCategoryLabel] = useState('');
    const [editingCatIdx, setEditingCatIdx] = useState<number | null>(null);
    const [editingTasks, setEditingTasks] = useState<TaskTemplate[]>([]);
    const [newTaskLabel, setNewTaskLabel] = useState('');

    useImperativeHandle(ref, () => ({ getData: () => ({ categories }) }));

    const addCategory = () => {
      if (!newCategoryLabel.trim()) return;
      if (categories.length >= 20) { showErr('Maximum 20 categories'); return; }
      const value = newCategoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      setCategories([...categories, { value, label: newCategoryLabel.trim(), task_templates: [] }]);
      setNewCategoryLabel(''); setShowAddCategory(false);
    };

    const removeCategory = (idx: number) => {
      if (categories.length <= 3) { showErr('Minimum 3 categories'); return; }
      setCategories(categories.filter((_, i) => i !== idx));
    };

    const openTaskEditor = (idx: number) => {
      setEditingCatIdx(idx);
      setEditingTasks(categories[idx].task_templates || []);
      setNewTaskLabel('');
    };

    const saveTaskTemplates = () => {
      if (editingCatIdx === null) return;
      const updated = [...categories];
      updated[editingCatIdx] = { ...updated[editingCatIdx], task_templates: editingTasks };
      setCategories(updated);
      setEditingCatIdx(null); setEditingTasks([]); setNewTaskLabel('');
    };

    const addTask = () => {
      if (!newTaskLabel.trim()) return;
      setEditingTasks([...editingTasks, { id: `t_${Date.now()}`, label: newTaskLabel.trim(), order: editingTasks.length + 1 }]);
      setNewTaskLabel('');
    };

    return (
      <div className="space-y-4">
        <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{categories.length}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCategories(defaultCategories)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg transition">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              {categories.length < 20 && (
                <button onClick={() => setShowAddCategory(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition">
                  <Plus className="w-3 h-3" /> Add
                </button>
              )}
            </div>
          </div>

          {showAddCategory && (
            <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
              <div className="flex gap-2">
                <input type="text" value={newCategoryLabel} onChange={(e) => setNewCategoryLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                  placeholder="e.g., Emergency Repair" autoFocus
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />
                <button onClick={addCategory} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">Add</button>
                <button onClick={() => { setShowAddCategory(false); setNewCategoryLabel(''); }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition">Cancel</button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-50">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 group transition">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{cat.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {cat.task_templates?.length || 0} task{cat.task_templates?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button onClick={() => openTaskEditor(idx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-100 rounded-lg transition">
                  <CheckSquare className="w-3.5 h-3.5" /> Tasks
                </button>
                <button onClick={() => removeCategory(idx)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded-lg transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400"><span className="font-bold text-gray-500">Tip:</span> Add task templates to auto-create checklists when leads convert to projects.</p>
          </div>
        </div>

        {/* Task editor modal */}
        {editingCatIdx !== null && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl sm:rounded-xl">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: '#312e81' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <CheckSquare className="w-5 h-5 text-indigo-300 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Task Templates</p>
                    <p className="text-white font-bold truncate">{categories[editingCatIdx].label}</p>
                  </div>
                </div>
                <button onClick={() => setEditingCatIdx(null)} className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="flex gap-2">
                  <input type="text" value={newTaskLabel} onChange={(e) => setNewTaskLabel(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                    placeholder="Add a task..."
                    className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none transition" />
                  <button onClick={addTask}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">Add</button>
                </div>

                {editingTasks.length > 0 ? (
                  <div className="border border-gray-100 divide-y divide-gray-50 overflow-hidden rounded-lg">
                    {editingTasks.map((task, idx) => (
                      <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group transition">
                        <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">{idx + 1}</span>
                        <input type="text" value={task.label}
                          onChange={(e) => setEditingTasks(editingTasks.map(t => t.id === task.id ? { ...t, label: e.target.value } : t))}
                          className="flex-1 min-w-0 px-2 py-1 text-sm border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none bg-transparent transition" />
                        <button onClick={() => setEditingTasks(editingTasks.filter(t => t.id !== task.id))}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 rounded-lg transition flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center border border-dashed border-gray-200 rounded-lg">
                    <CheckSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">No tasks yet</p>
                    <p className="text-xs text-gray-300 mt-1">Type above and press Enter</p>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
                <button onClick={() => setEditingCatIdx(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-lg transition">Cancel</button>
                <button onClick={saveTaskTemplates}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg transition flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Save Tasks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

CategoriesStep.displayName = 'CategoriesStep';
export default CategoriesStep;