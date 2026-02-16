'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, CheckCircle2, Circle, Trash2 } from 'lucide-react';

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

  // Auto-populate tasks from category template
  useEffect(() => {
    if (!templatesLoaded || !hasProject || !lead.project_id) return;
    if (tasks.length > 0) return;
    if (!lead?.category) return;
    
    const matchingCategory = companyCategories.find(
      cat => cat.value === lead?.category
    );
    
    if (matchingCategory?.task_templates && matchingCategory.task_templates.length > 0) {
      createTasksFromTemplate(matchingCategory.task_templates);
    }
  }, [templatesLoaded, lead?.category, lead?.id, hasProject, tasks.length]);

  const createTasksFromTemplate = async (taskTemplates: any[]) => {
    try {
      setSaving(true);
      const sortedTemplates = [...taskTemplates].sort((a, b) => a.order - b.order);
      
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

  const sortedTasks = [...tasks].sort((a, b) => {
    // Incomplete first, then by order
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.task_order - b.task_order;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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

  if (!hasProject) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Convert to project to manage tasks</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      
      {/* Header with progress */}
      {tasks.length > 0 && (
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Tasks</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{completedCount}/{totalCount}</span>
            <span className="text-sm font-bold text-green-600">{percentage}%</span>
          </div>
        </div>
      )}

      {/* Task List */}
      {sortedTasks.map((task) => (
        <div
          key={task.id}
          className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group ${
            task.completed ? 'opacity-60' : ''
          }`}
        >
          <button
            onClick={() => handleToggleComplete(task.id, task.completed)}
            disabled={saving}
            className="flex-shrink-0"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 hover:text-green-500 transition" />
            )}
          </button>

          <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.label}
          </span>

          <button
            onClick={() => handleDeleteTask(task.id)}
            className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ))}

      {/* Add new task */}
      <div className="flex items-center gap-2 pt-2">
        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={newTaskLabel}
          onChange={(e) => setNewTaskLabel(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !saving && handleAddTask()}
          placeholder="Add a task..."
          className="flex-1 px-3 py-2 text-sm border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none transition"
          disabled={saving}
        />
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">No tasks yet. Add one above!</p>
        </div>
      )}
    </div>
  );
}