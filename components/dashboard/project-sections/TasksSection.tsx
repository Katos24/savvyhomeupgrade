'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  created_by: string;
};

type TasksSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function TasksSection({ lead, currentUser, onRefresh, hasProject }: TasksSectionProps) {
  const [newTaskText, setNewTaskText] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  // Parse tasks from lead
  const tasks: Task[] = lead?.tasks 
    ? (typeof lead.tasks === 'string' ? JSON.parse(lead.tasks) : lead.tasks)
    : [];

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleAddTask = async () => {
    if (!newTaskText.trim()) {
      toast.error('Please enter a task');
      return;
    }

    setSaving(true);
    try {
      const newTask: Task = {
        id: `task_${Date.now()}`,
        text: newTaskText.trim(),
        completed: false,
        created_at: new Date().toISOString(),
        created_by: currentUser?.name || currentUser?.email || 'Unknown',
      };

      const updatedTasks = [...tasks, newTask];

      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          tasks: JSON.stringify(updatedTasks),
          action: 'update_tasks',
        }),
      });

      if (response.ok) {
        toast.success('Task added!');
        setNewTaskText('');
        await onRefresh();
      } else {
        toast.error('Failed to add task');
      }
    } catch (error) {
      console.error('Add task error:', error);
      toast.error('Failed to add task');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    setSaving(true);
    try {
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );

      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          tasks: JSON.stringify(updatedTasks),
          action: 'update_tasks',
        }),
      });

      if (response.ok) {
        toast.success('Task updated!');
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;

    setSaving(true);
    try {
      const updatedTasks = tasks.filter(t => t.id !== taskId);

      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          tasks: JSON.stringify(updatedTasks),
          action: 'update_tasks',
        }),
      });

      if (response.ok) {
        toast.success('Task deleted!');
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

  const handleEditTask = async (taskId: string) => {
    if (!editText.trim()) {
      toast.error('Task cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, text: editText.trim() } : t
      );

      const response = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          tasks: JSON.stringify(updatedTasks),
          action: 'update_tasks',
        }),
      });

      if (response.ok) {
        toast.success('Task updated!');
        setEditingTaskId(null);
        setEditText('');
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
      <div className="p-6 text-center text-gray-500">
        <p className="text-sm">Convert to project to manage tasks</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Add New Task */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
        <h4 className="text-sm font-bold text-gray-900 mb-2">Add Task</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="What needs to be done?"
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            disabled={saving}
          />
          <button
            onClick={handleAddTask}
            disabled={saving || !newTaskText.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold text-sm rounded-lg transition"
          >
            {saving ? '...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      {tasks.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm font-bold text-blue-600">
              {completedTasks.length} / {tasks.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <span>To Do</span>
            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{pendingTasks.length}</span>
          </h4>
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition group"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  disabled={saving}
                  className="mt-0.5 w-5 h-5 rounded border-2 border-gray-300 hover:border-green-500 transition flex items-center justify-center flex-shrink-0"
                >
                  {task.completed && <span className="text-green-600 text-sm">✓</span>}
                </button>

                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEditTask(task.id)}
                        className="flex-1 px-2 py-1 text-sm rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleEditTask(task.id)}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditText('');
                        }}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-900 font-medium">{task.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added by {task.created_by} • {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>

                {editingTaskId !== task.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditText(task.text);
                      }}
                      className="p-1.5 hover:bg-blue-50 rounded text-blue-600 text-xs"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 hover:bg-red-50 rounded text-red-600 text-xs"
                      title="Delete"
                    >
                      🗑️
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
            <span>Completed</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{completedTasks.length}</span>
          </h4>
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-75 hover:opacity-100 transition group"
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  disabled={saving}
                  className="mt-0.5 w-5 h-5 rounded border-2 border-green-500 bg-green-500 transition flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-white text-sm">✓</span>
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 line-through">{task.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Added by {task.created_by} • {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 hover:bg-red-50 rounded text-red-600 text-xs opacity-0 group-hover:opacity-100 transition"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">✓</div>
          <p className="text-sm">No tasks yet. Add one above to get started!</p>
        </div>
      )}
    </div>
  );
}