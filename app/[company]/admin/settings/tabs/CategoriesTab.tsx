'use client';

import { useState } from 'react';
import { Plus, X, RotateCcw, CheckSquare, Trash2, Save, AlertCircle, AlertTriangle } from 'lucide-react';
import { CATEGORY_MAP } from '@/lib/formCategories';

type TaskTemplate = {
  id: string;
  label: string;
  order: number;
};

type Category = {
  value: string;
  label: string;
  emoji?: string;
  task_templates?: TaskTemplate[];
};

export default function CategoriesTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const defaultCategories = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
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

  const handleRemoveCategory = (index: number) => {
    if (categories.length <= 3) { setError('You must have at least 3 categories'); setTimeout(() => setError(''), 3000); return; }
    setDeleteConfirm({ type: 'category', index, label: categories[index].label });
  };

  const confirmRemoveCategory = () => {
    if (deleteConfirm?.type === 'category' && deleteConfirm.index !== undefined) {
      setCategories(categories.filter((_, i) => i !== deleteConfirm.index));
      setUseDefaults(false);
      setDeleteConfirm(null);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.label.trim()) { setError('Please enter a category label'); setTimeout(() => setError(''), 3000); return; }
    if (categories.length >= 20) { setError('Maximum 20 categories allowed'); setTimeout(() => setError(''), 3000); return; }
    const value = newCategory.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories([...categories, { value, label: newCategory.label.trim(), task_templates: [] }]);
    setNewCategory({ label: '' });
    setShowAddForm(false);
    setUseDefaults(false);
  };

  const openTaskEditor = (index: number) => {
    setEditingCategoryIndex(index);
    setEditingTasks(categories[index].task_templates || []);
    setNewTaskLabel('');
  };

  const closeTaskEditor = () => { setEditingCategoryIndex(null); setEditingTasks([]); setNewTaskLabel(''); };

  const addTask = () => {
    if (!newTaskLabel.trim()) return;
    setEditingTasks([...editingTasks, { id: `task_${Date.now()}`, label: newTaskLabel.trim(), order: editingTasks.length + 1 }]);
    setNewTaskLabel('');
  };

  const removeTask = (id: string, label: string) => setDeleteConfirm({ type: 'task', id, label });

  const confirmRemoveTask = () => {
    if (deleteConfirm?.type === 'task' && deleteConfirm.id) {
      setEditingTasks(editingTasks.filter(t => t.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    }
  };

  const updateTaskLabel = (id: string, label: string) =>
    setEditingTasks(editingTasks.map(t => t.id === id ? { ...t, label } : t));

  const moveTask = (id: string, dir: 'up' | 'down') => {
    const i = editingTasks.findIndex(t => t.id === id);
    if (i === -1 || (dir === 'up' && i === 0) || (dir === 'down' && i === editingTasks.length - 1)) return;
    const tasks = [...editingTasks];
    const swap = dir === 'up' ? i - 1 : i + 1;
    [tasks[i], tasks[swap]] = [tasks[swap], tasks[i]];
    tasks.forEach((t, idx) => { t.order = idx + 1; });
    setEditingTasks(tasks);
  };

  const saveTaskTemplates = () => {
    if (editingCategoryIndex === null) return;
    const updated = [...categories];
    updated[editingCategoryIndex] = { ...updated[editingCategoryIndex], task_templates: editingTasks };
    setCategories(updated);
    setUseDefaults(false);
    closeTaskEditor();
    setSuccess("Task templates updated! Don't forget to save categories.");
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = async () => {
    if (categories.length < 3) { setError('You must have at least 3 categories'); return; }
    if (categories.length > 20) { setError('Maximum 20 categories allowed'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-categories', data: { form_categories: useDefaults ? null : categories } }),
      });
      const data = await res.json();
      if (data.success) { setSuccess('Categories saved! Refreshing...'); setTimeout(() => window.location.reload(), 1500); }
      else setError(data.error || 'Failed to save categories');
    } catch { setError('Failed to save categories'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="border-b border-gray-100 pb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Service Categories</h2>
          <p className="text-sm text-gray-500 mt-1">
            {useDefaults
              ? `Using default categories for ${company.business_type}. Customize below if needed.`
              : 'Using custom categories with task templates.'}
          </p>
        </div>
        {!useDefaults && (
          <button
            onClick={() => { setCategories(defaultCategories); setUseDefaults(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold transition flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Defaults
          </button>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
          <span>✓</span> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Card */}
      <div className="bg-white border border-gray-200 overflow-hidden">

        {/* Card header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold">
              {categories.length} / 20
            </span>
          </div>
          {categories.length < 20 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          )}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">New Category</p>
            <div className="space-y-3">
              <input
                type="text"
                value={newCategory.label}
                onChange={(e) => setNewCategory({ label: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="e.g., Emergency Repair"
                autoFocus
                className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none bg-white transition"
              />
              <div className="flex gap-2">
                <button onClick={handleAddCategory}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition">
                  Add Category
                </button>
                <button onClick={() => { setShowAddForm(false); setNewCategory({ label: '' }); }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category list */}
        <div className="divide-y divide-gray-50">
          {categories.map((cat, index) => (
            <div key={index} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 group transition">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate">{cat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {cat.task_templates?.length || 0} task template{cat.task_templates?.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openTaskEditor(index)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-100 transition"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  Tasks {cat.task_templates?.length ? `(${cat.task_templates.length})` : ''}
                </button>
                <button
                  onClick={() => handleRemoveCategory(index)}
                  className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="font-bold text-gray-500">Tip:</span> Task templates automatically create a checklist when a project is created — ensuring consistent workflow every time.
          </p>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition"
          >
            {loading ? 'Saving...' : 'Save Categories'}
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 max-w-sm w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">
                    Delete {deleteConfirm.type === 'category' ? 'Category' : 'Task'}?
                  </h3>
                  <p className="text-sm text-gray-500">
                    "{deleteConfirm.label}" will be permanently removed.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">Cancel</button>
                <button
                  onClick={deleteConfirm.type === 'category' ? confirmRemoveCategory : confirmRemoveTask}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task editor modal */}
      {editingCategoryIndex !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

            {/* Modal header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: '#312e81' }}>
              <div className="flex items-center gap-3 min-w-0">
                <CheckSquare className="w-5 h-5 text-indigo-300 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Task Templates</p>
                  <p className="text-white font-bold truncate">{categories[editingCategoryIndex].label}</p>
                </div>
              </div>
              <button onClick={closeTaskEditor} className="text-white/60 hover:text-white p-1.5 hover:bg-white/10 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Add task */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Add a task template..."
                  className="flex-1 px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none transition"
                />
                <button onClick={addTask}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition">
                  Add
                </button>
              </div>

              {/* Task list */}
              {editingTasks.length > 0 ? (
                <div className="border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                  {editingTasks.map((task, idx) => (
                    <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group transition">
                      <span className="text-xs font-bold text-gray-300 w-5 text-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <button onClick={() => moveTask(task.id, 'up')} disabled={idx === 0}
                          className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none">▲</button>
                        <button onClick={() => moveTask(task.id, 'down')} disabled={idx === editingTasks.length - 1}
                          className="text-gray-300 hover:text-gray-500 disabled:opacity-20 leading-none">▼</button>
                      </div>
                      <input
                        type="text"
                        value={task.label}
                        onChange={(e) => updateTaskLabel(task.id, e.target.value)}
                        className="flex-1 min-w-0 px-2 py-1 text-sm border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none bg-transparent transition"
                      />
                      <button onClick={() => removeTask(task.id, task.label)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-400 transition flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-gray-200">
                  <CheckSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-400">No tasks yet</p>
                  <p className="text-xs text-gray-300 mt-1">Add your first task template above</p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 flex-shrink-0">
              <button onClick={closeTaskEditor}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">
                Cancel
              </button>
              <button onClick={saveTaskTemplates}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Templates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}