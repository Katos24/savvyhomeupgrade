'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, CheckCircle2, Circle, Edit2, Trash2 } from 'lucide-react';

type Task = {
  id: number;
  project_id: number;
  company_id: number;
  label: string;
  completed: boolean;
  task_order: number;
  completed_at?: string | null;
  completed_by?: string | null;
  created_at: string;
};

type TasksSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function TasksSection({ lead, currentUser, onRefresh, hasProject }: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [companyCategories, setCompanyCategories] = useState<any[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);

  // Fetch company categories (which contain task templates)
  useEffect(() => {
    async function fetchCompanyCategories() {
      try {
        const companySlug = window.location.pathname.split('/')[1];
        const response = await fetch(`/api/company/${companySlug}/settings`);
        const data = await response.json();
        
        if (data.success && data.company?.form_categories) {
          setCompanyCategories(data.company.form_categories);
        }
      } catch (error) {
        console.error('Failed to fetch company categories:', error);
      } finally {
        setTemplatesLoaded(true);
      }
    }
    
    fetchCompanyCategories();
  }, []);

  // Fetch tasks from database
  useEffect(() => {
    if (hasProject && lead.project_id) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [lead.project_id, hasProject]);

  // Auto-populate tasks from category template when category changes
  useEffect(() => {
    if (!templatesLoaded || !hasProject || !lead.project_id) return;
    if (tasks.length > 0) return; // Don't overwrite existing tasks
    if (!lead?.category) return;
    
    // Find category matching lead
    const matchingCategory = companyCategories.find(
      cat => cat.value === lead?.category
    );
    
    if (matchingCategory?.task_templates && matchingCategory.task_templates.length > 0) {
      // Auto-create tasks from template
      createTasksFromTemplate(matchingCategory.task_templates);
    }
  }, [templatesLoaded, lead?.category, lead?.id, hasProject, tasks.length]);

  const createTasksFromTemplate = async (taskTemplates: any[]) => {
    try {
      setSaving(true);
      
      // Sort by order
      const sortedTemplates = [...taskTemplates].sort((a, b) => a.order - b.order);
      
      // Create all tasks in sequence
      for (let i = 0; i < sortedTemplates.length; i++) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            project_id: lead.project_id,
            company_id: lead.company_id,
            label: sortedTemplates[i].label,
            task_order: sortedTemplates[i].order,
          }),
        });
      }
      
      await fetchTasks();
      await onRefresh();
    } catch (error) {
      console.error('Failed to create tasks from template:', error);
    } finally {
      setSaving(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks?project_id=${lead.project_id}`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed).sort((a, b) => a.task_order - b.task_order);
  const completedTasks = tasks.filter(t => t.completed).sort((a, b) => a.task_order - b.task_order);

  const handleAddTask = async () => {
    if (!newTaskLabel.trim()) {
      toast.error('Please enter a task');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          project_id: lead.project_id,
          company_id: lead.company_id,
          label: newTaskLabel.trim(),
          task_order: tasks.length + 1,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Task added!');
        setNewTaskLabel('');
        await fetchTasks();
        await onRefresh();
      } else {
        toast.error(data.error || 'Failed to add task');
      }
    } catch (error) {
      console.error('Add task error:', error);
      toast.error('Failed to add task');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (taskId: number, currentCompleted: boolean) => {
    setSaving(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          task_id: taskId,
          completed: !currentCompleted,
          completed_by: currentUser?.name || currentUser?.email || 'Unknown',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(currentCompleted ? 'Task uncompleted!' : 'Task completed!');
        await fetchTasks();
        await onRefresh();
      } else {
        toast.error('Failed to update task');
      }
    } catch (error) {
      console.error('Toggle task error:', error);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Delete this task?')) return;

    setSaving(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          task_id: taskId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Task deleted!');
        await fetchTasks();
        await onRefresh();
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      toast.error('Failed to delete task');
    } finally {
      setSaving(false);
    }
  };

  const handleEditTask = async (taskId: number) => {
    if (!editLabel.trim()) {
      toast.error('Task cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          task_id: taskId,
          label: editLabel.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Task updated!');
        setEditingTaskId(null);
        setEditLabel('');
        await fetchTasks();
        await onRefresh();
      } else {
        toast.error('Failed to update task');
      }
    } catch (error) {
      console.error('Edit task error:', error);
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  if (!hasProject) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full mb-3">
          <CheckCircle2 className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium">Convert to project to manage tasks</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Add New Task */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-green-600" />
          Add Task
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskLabel}
            onChange={(e) => setNewTaskLabel(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !saving && handleAddTask()}
            placeholder="What needs to be done?"
            className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            disabled={saving}
          />
          <button
            onClick={handleAddTask}
            disabled={saving || !newTaskLabel.trim()}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      {tasks.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm font-bold text-blue-600">
              {completedTasks.length} / {tasks.length} completed
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {tasks.length - completedTasks.length} remaining
          </p>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span>To Do</span>
            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
              {pendingTasks.length}
            </span>
          </h4>
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-sm transition group"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(task.id, task.completed)}
                  disabled={saving}
                  className="mt-0.5 w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                >
                  {task.completed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </button>

                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEditTask(task.id)}
                        className="flex-1 px-3 py-2 text-sm rounded-lg border-2 border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditTask(task.id)}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-semibold rounded-lg transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditLabel('');
                        }}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-900 font-medium">{task.label}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </>
                  )}
                </div>

                {editingTaskId !== task.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditLabel(task.label);
                      }}
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Completed</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              {completedTasks.length}
            </span>
          </h4>
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-green-50 border border-green-200 rounded-lg p-3 opacity-75 hover:opacity-100 transition group"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(task.id, task.completed)}
                  disabled={saving}
                  className="mt-0.5 w-5 h-5 rounded border-2 border-green-500 bg-green-500 transition flex items-center justify-center flex-shrink-0 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-green-800 line-through font-medium">{task.label}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Completed {task.completed_at && new Date(task.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {task.completed_by && ` by ${task.completed_by}`}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition opacity-0 group-hover:opacity-100"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !saving && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">No tasks yet</p>
          <p className="text-xs text-gray-500">Add a task above to get started!</p>
        </div>
      )}
    </div>
  );
}