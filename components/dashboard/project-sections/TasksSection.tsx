'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { 
  Plus, 
  Loader2, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  ListTodo, 
  CheckSquare, 
  Square,
  ClipboardCheck
} from 'lucide-react';

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
const templateCreatedRef = useRef<number | null>(null);

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

 useEffect(() => {
    if (!templatesLoaded || !hasProject || !lead.project_id) return;
    if (loading) return; // ← wait for initial fetch to finish
    if (tasks.length > 0 || !lead?.category) return;
    if (templateCreatedRef.current === lead.project_id) return;
templateCreatedRef.current = lead.project_id;
    const match = companyCategories.find(c => c.value === lead?.category);
    if (match?.task_templates?.length > 0) {
      createTasksFromTemplate(match.task_templates);
    }
  }, [templatesLoaded, loading, lead?.category, lead?.id, hasProject, tasks.length]);

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header Section */}
      <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Tasks</h3>
            {totalCount > 0 && (
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                {completedCount} of {totalCount} completed
              </p>
            )}
          </div>
        </div>
        
        {totalCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: `${percentage}%`,
                  background: percentage === 100 ? '#10b981' : '#6366f1',
                }}
              />
            </div>
            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${percentage === 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="min-h-[100px]">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Checklist...</p>
          </div>
        ) : !hasProject ? (
          <div className="py-12 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <ListTodo className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-800">Checklist Locked</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Convert this lead to a project to start managing tasks.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            
            {/* Task List */}
            {sortedTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 px-5 py-4 group hover:bg-slate-50/50 transition-all ${task.completed ? 'opacity-60' : ''}`}
              >
                <button
                  onClick={() => handleToggleComplete(task.id, task.completed)}
                  disabled={saving}
                  className="flex-shrink-0 transition-transform active:scale-90"
                >
                  {task.completed ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white border-2 border-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 bg-white group-hover:border-blue-400 flex items-center justify-center transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {task.label}
                  </p>
                  {task.completed && task.completed_by && (
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mt-0.5">
                      By {task.completed_by}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-rose-400 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No tasks yet</p>
              </div>
            )}

            {/* Input Row */}
            <div className="p-4 bg-slate-50/30">
              <div className="relative flex items-center gap-3 px-3 py-1 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                <Plus className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <input
                  type="text"
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !saving && handleAddTask()}
                  placeholder="New task..."
                  disabled={saving}
                  className="flex-1 text-sm font-bold py-2.5 bg-transparent text-slate-700 placeholder-slate-300 outline-none"
                />
                {newTaskLabel.trim() && (
                  <button
                    onClick={handleAddTask}
                    disabled={saving}
                    className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}