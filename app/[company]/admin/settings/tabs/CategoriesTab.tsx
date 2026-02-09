'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  X, 
  RotateCcw, 
  CheckSquare, 
  Edit2,
  Trash2,
  GripVertical,
  Save,
  AlertCircle
} from 'lucide-react';
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const defaultCategories = CATEGORY_MAP[company.business_type || 'general'] || CATEGORY_MAP.general;
  const [categories, setCategories] = useState<Category[]>(
    company.form_categories && company.form_categories.length > 0 
      ? company.form_categories 
      : defaultCategories
  );
  const [useDefaults, setUseDefaults] = useState(
    !company.form_categories || company.form_categories.length === 0
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ label: '' });
  
  // Task Template Management
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingTasks, setEditingTasks] = useState<TaskTemplate[]>([]);
  const [newTaskLabel, setNewTaskLabel] = useState('');

  const handleRemoveCategory = (index: number) => {
    if (categories.length <= 3) {
      setError('You must have at least 3 categories');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setCategories(categories.filter((_, i) => i !== index));
    setUseDefaults(false);
  };

  const handleAddCategory = () => {
    if (!newCategory.label.trim()) {
      setError('Please enter a category label');
      return;
    }

    if (categories.length >= 20) {
      setError('Maximum 20 categories allowed');
      return;
    }

    const value = newCategory.label.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setCategories([...categories, { 
      value, 
      label: newCategory.label.trim(),
      task_templates: []
    }]);
    setNewCategory({ label: '' });
    setShowAddForm(false);
    setUseDefaults(false);
  };

  const handleRestoreDefaults = () => {
    setCategories(defaultCategories);
    setUseDefaults(true);
  };

  // Task Template Functions
  const openTaskEditor = (categoryIndex: number) => {
    const category = categories[categoryIndex];
    setEditingCategoryIndex(categoryIndex);
    setEditingTasks(category.task_templates || []);
    setNewTaskLabel('');
  };

  const closeTaskEditor = () => {
    setEditingCategoryIndex(null);
    setEditingTasks([]);
    setNewTaskLabel('');
  };

  const addTask = () => {
    if (!newTaskLabel.trim()) {
      setError('Please enter a task name');
      setTimeout(() => setError(''), 2000);
      return;
    }

    const newTask: TaskTemplate = {
      id: `task_${Date.now()}`,
      label: newTaskLabel.trim(),
      order: editingTasks.length + 1
    };

    setEditingTasks([...editingTasks, newTask]);
    setNewTaskLabel('');
  };

  const removeTask = (taskId: string) => {
    setEditingTasks(editingTasks.filter(t => t.id !== taskId));
  };

  const updateTaskLabel = (taskId: string, newLabel: string) => {
    setEditingTasks(editingTasks.map(t => 
      t.id === taskId ? { ...t, label: newLabel } : t
    ));
  };

  const moveTask = (taskId: string, direction: 'up' | 'down') => {
    const index = editingTasks.findIndex(t => t.id === taskId);
    if (index === -1) return;
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editingTasks.length - 1) return;

    const newTasks = [...editingTasks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newTasks[index], newTasks[swapIndex]] = [newTasks[swapIndex], newTasks[index]];
    
    // Update order
    newTasks.forEach((task, idx) => {
      task.order = idx + 1;
    });
    
    setEditingTasks(newTasks);
  };

  const saveTaskTemplates = () => {
    if (editingCategoryIndex === null) return;

    const updatedCategories = [...categories];
    updatedCategories[editingCategoryIndex] = {
      ...updatedCategories[editingCategoryIndex],
      task_templates: editingTasks
    };

    setCategories(updatedCategories);
    setUseDefaults(false);
    closeTaskEditor();
    
    setSuccess('Task templates updated! Don\'t forget to save categories.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = async () => {
    if (categories.length < 3) {
      setError('You must have at least 3 categories');
      return;
    }

    if (categories.length > 20) {
      setError('Maximum 20 categories allowed');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-categories',
          data: {
            form_categories: useDefaults ? null : categories,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Categories saved successfully! Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || 'Failed to save categories');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Service Categories</h2>
          <p className="text-slate-600">
            {useDefaults 
              ? `Using default categories for ${company.business_type}. Customize below if needed.`
              : 'Using custom categories with task templates.'}
          </p>
        </div>
        {!useDefaults && (
          <button
            onClick={handleRestoreDefaults}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            Restore Defaults
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg">✓</span>
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-600">
              {categories.length} categories • Min: 3, Max: 20
            </p>
            {categories.length < 20 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            )}
          </div>

          {/* Add Category Form */}
          {showAddForm && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-bold mb-3 text-slate-900">Add Custom Category</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Category Label *
                  </label>
                  <input
                    type="text"
                    value={newCategory.label}
                    onChange={(e) => setNewCategory({ label: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    placeholder="e.g., Emergency Repair"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition"
                  >
                    Add Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategory({ label: '' });
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories List with Task Counts */}
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between gap-3 bg-slate-50 hover:bg-slate-100 p-4 rounded-lg border border-slate-200 group transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.emoji || '📋'}</span>
                    <span className="font-semibold text-slate-900">{category.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {category.task_templates?.length || 0} task template{category.task_templates?.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Manage Tasks Button */}
                  <button
                    onClick={() => openTaskEditor(index)}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-semibold transition shadow-sm"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Manage Tasks
                  </button>

                  {/* Remove Category */}
                  <button
                    onClick={() => handleRemoveCategory(index)}
                    className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                    title="Remove category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Pro Tip:</strong> Task templates automatically create a checklist when a project is created. 
            This ensures consistent workflow and nothing gets missed!
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Saving...' : 'Save Categories'}
          </button>
        </div>
      </div>

      {/* TASK TEMPLATE EDITOR MODAL */}
      {editingCategoryIndex !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Task Templates
                  </h3>
                  <p className="text-sm text-indigo-100">
                    {categories[editingCategoryIndex].label}
                  </p>
                </div>
              </div>
              <button
                onClick={closeTaskEditor}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Add New Task */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Add Task Template
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskLabel}
                    onChange={(e) => setNewTaskLabel(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="e.g., Initial Consultation"
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={addTask}
                    className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Task List */}
              {editingTasks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-600 mb-3">
                    {editingTasks.length} Task{editingTasks.length !== 1 ? 's' : ''}
                  </p>
                  {editingTasks.map((task, idx) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200 group"
                    >
                      {/* Order Controls */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveTask(task.id, 'up')}
                          disabled={idx === 0}
                          className="text-slate-400 hover:text-slate-600 disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                          <GripVertical className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Order Number */}
                      <span className="text-xs font-bold text-slate-400 w-6 text-center">
                        #{idx + 1}
                      </span>

                      {/* Task Label (Editable) */}
                      <input
                        type="text"
                        value={task.label}
                        onChange={(e) => updateTaskLabel(task.id, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />

                      {/* Delete Button */}
                      <button
                        onClick={() => removeTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                  <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No tasks yet</p>
                  <p className="text-sm text-slate-400 mt-1">Add your first task template above</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 px-6 py-4 flex gap-3">
              <button
                onClick={closeTaskEditor}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 px-4 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={saveTaskTemplates}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Task Templates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}