'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, CheckCircle2, Circle, Trash2, CheckSquare } from 'lucide-react';

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
  activeCategory?: string;
};

export default function TasksSection({ lead, currentUser, onRefresh, hasProject, activeCategory }: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [companyCategories, setCompanyCategories] = useState<any[]>([]);
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  const templateCreatedRef = useRef(false);
  const prevCategoryRef = useRef(activeCategory || lead?.category);

  const category = activeCategory || lead?.category;

  useEffect(() => {
    async function fetchCompanyCategories() {
      try {
        const companySlug = window.location.pathname.split('/')[1];
        const res = await fetch(`/api/company/${companySlug}/settings`);
        const data = await res.json();
        if (data.success && data.company?.form_categories) {
          setCompanyCategories(data.company.form_categories);
        }
      } catch (e) {
        console.error('Failed to fetch categories:', e);
      } finally {
        setTemplatesLoaded(true);
      }
    }
    fetchCompanyCategories();
  }, []);

  useEffect(() => {
    if (hasProject && lead.project_id) fetchTasks();
    else setLoading(false);
  }, [lead.project_id, hasProject]);

  // Auto-load tasks from template when category changes
  useEffect(() => {
    if (!templatesLoaded || !hasProject || !lead.project_id) return;
    if (!category) return;

    const categoryChanged = prevCategoryRef.current !== category;
    prevCategoryRef.current = category;

    // On initial load only apply if no tasks exist
    // On category change always apply
    if (!categoryChanged && tasks.length > 0) return;
    if (templateCreatedRef.current && !categoryChanged) return;

    const match = companyCategories.find(c => c.value === category);
    if (!match?.task_templates?.length) return;

    // If category changed, delete existing tasks first then load new ones
    if (categoryChanged && tasks.length > 0) {
      templateCreatedRef.current = false;
      deleteAllAndCreateFromTemplate(match.task_templates);
    } else if (!templateCreatedRef.current) {
      templateCreatedRef.current = true;
      createTasksFromTemplate(match.task_templates);
    }
  }, [templatesLoaded, category, hasProject, tasks.length]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks?project_id=${lead.project_id}`);
      const data = await res.json();
      if (data.success) setTasks(data.tasks || []);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllAndCreateFromTemplate = async (templates: any[]) => {
    setSaving(true);
    try {
      // Delete all existing tasks
      for (const task of tasks) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', task_id: task.id }),
        });
      }
      // Create new ones from template
      const sorted = [...templates].sort((a, b) => a.order - b.order);
      for (let i = 0; i < sorted.length; i++) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            project_id: lead.project_id,
            company_id: lead.company_id,
            label: sorted[i].label,
            task_order: sorted[i].order,
          }),
        });
      }
      templateCreatedRef.current = true;
      await fetchTasks();
      await onRefresh();
      toast.success('Tasks updated for new category');
    } catch (e) {
      console.error('Failed to update tasks:', e);
    } finally {
      setSaving(false);
    }
  };

  const createTasksFromTemplate = async (templates: any[]) => {
    setSaving(true);
    try {
      const sorted = [...templates].sort((a, b) => a.order - b.order);
      for (let i = 0; i < sorted.length; i++) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            project_id: lead.project_id,
            company_id: lead.company_id,
            label: sorted[i].label,
            task_order: sorted[i].order,
          }),
        });
      }
      await fetchTasks();
      await onRefresh();
    } catch (e) {
      console.error('Failed to create tasks from template:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskLabel.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
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
      const data = await res.json();
      if (data.success) {
        setNewTaskLabel('');
        await fetchTasks();
        await onRefresh();
      } else {
        toast.error(data.error || 'Failed to add task');
      }
    } catch {
      toast.error('Failed to add task');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (taskId: number, currentCompleted: boolean) => {
    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle',
          task_id: taskId,
          completed: !currentCompleted,
          completed_by: currentUser?.name || currentUser?.email || 'Unknown',
        }),
      });
      const data = await res.json();
      if (data.success) { await fetchTasks(); await onRefresh(); }
      else toast.error('Failed to update task');
    } catch {
      toast.error('Failed to update task');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Delete this task?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', task_id: taskId }),
      });
      const data = await res.json();
      if (data.success) { await fetchTasks(); await onRefresh(); }
      else toast.error('Failed to delete task');
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setSaving(false);
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.task_order - b.task_order;
  });

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="overflow-hidden">

      {/* Section header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-5 h-5 bg-violet-50 flex items-center justify-center">
            <CheckSquare className="w-3 h-3 text-violet-400" />
          </span>
          Tasks
          {totalCount > 0 && (
            <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold">
              {completedCount}/{totalCount}
            </span>
          )}
        </h3>
        {totalCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-100 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  background: percentage === 100 ? '#22c55e' : '#6366f1',
                }}
              />
            </div>
            <span className={`text-xs font-bold ${percentage === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
              {percentage}%
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        </div>
      ) : !hasProject ? (
        <div className="py-10 text-center">
          <p className="text-sm text-gray-400">Convert to project to manage tasks</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">

          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group transition ${task.completed ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => handleToggleComplete(task.id, task.completed)}
                disabled={saving}
                className="flex-shrink-0"
              >
                {task.completed
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  : <Circle className="w-5 h-5 text-gray-300 hover:text-indigo-400 transition" />}
              </button>
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {task.label}
              </span>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-10 flex flex-col items-center gap-2 text-center">
              <CheckSquare className="w-8 h-8 text-gray-200" />
              <p className="text-sm font-semibold text-gray-400">No tasks yet</p>
              <p className="text-xs text-gray-300">Add a task below</p>
            </div>
          )}

          <div className="flex items-center gap-3 px-5 py-3">
            <Plus className="w-4 h-4 text-gray-300 flex-shrink-0" />
            <input
              type="text"
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !saving && handleAddTask()}
              placeholder="Add a task..."
              disabled={saving}
              className="flex-1 text-sm py-1 border-b border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none transition bg-transparent text-gray-700 placeholder-gray-300"
            />
            {newTaskLabel.trim() && (
              <button
                onClick={handleAddTask}
                disabled={saving}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 flex-shrink-0"
              >
                {saving ? '...' : 'Add'}
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}