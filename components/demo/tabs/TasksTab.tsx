'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lead, Task } from '@/components/demo/types'


const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };

export default function TasksTab({ lead, onUpdate }: { lead: Lead; onUpdate: (u: Partial<Lead>) => void }) {
  const [tasks, setTasks] = useState<Task[]>(lead.tasks || []);
  const [newLabel, setNewLabel] = useState('');

  const persist = (updated: Task[]) => {
    setTasks(updated);
    onUpdate({ tasks: updated });
  };

  const toggle = (id: string) => persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => persist(tasks.filter(t => t.id !== id));

  const addTask = () => {
    if (!newLabel.trim()) return;
    persist([...tasks, { id: `task_${Date.now()}`, label: newLabel.trim(), done: false }]);
    setNewLabel('');
  };

  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      {total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-700">{done} of {total} complete</span>
            <span className={`text-sm font-black ${pct === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>{pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={spring}
            />
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-bold text-gray-800">Checklist</span>
        </div>

        {tasks.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-300 font-medium">No tasks yet</p>
            <p className="text-xs text-gray-200 mt-1">Add steps for this job below</p>
          </div>
        )}

        <AnimatePresence>
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ ...spring, delay: i * 0.03 }}
              className="group flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
            >
              <button
                onClick={() => toggle(task.id)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  task.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-indigo-400'
                }`}
              >
                {task.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
              <span className={`flex-1 text-sm font-medium transition-all ${task.done ? 'line-through text-gray-300' : 'text-gray-800'}`}>
                {task.label}
              </span>
              <button
                onClick={() => remove(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add task */}
        <div className="px-4 py-3 border-t border-dashed border-gray-100 flex gap-2">
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
            placeholder="Add a task..."
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-300"
          />
          <button
            onClick={addTask}
            className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition active:scale-90 shrink-0"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400">
        In your real account, task templates auto-load based on job category.
      </p>
    </div>
  );
}