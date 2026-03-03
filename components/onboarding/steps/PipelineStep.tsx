'use client';

import { useState, useImperativeHandle, forwardRef } from 'react';
import { Plus, X, ChevronUp, ChevronDown, Lock, Workflow } from 'lucide-react';
import { DEFAULT_STATUSES, LOCKED_STATUSES, COLOR_OPTIONS, getColorHex } from '../types';
import type { StatusOption } from '../types';

export interface PipelineStepRef {
  getData: () => { statuses: StatusOption[] };
}

const PipelineStep = forwardRef<PipelineStepRef, { company: any; showErr: (msg: string) => void }>(
  ({ company, showErr }, ref) => {
    const [statuses, setStatuses] = useState<StatusOption[]>(() => {
      const saved = company.status_options;
      if (Array.isArray(saved) && saved.length > 0) return saved;
      return DEFAULT_STATUSES;
    });
    const [showAddStatus, setShowAddStatus] = useState(false);
    const [newStatusLabel, setNewStatusLabel] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('blue');
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    useImperativeHandle(ref, () => ({ getData: () => ({ statuses }) }));

    const addStatus = () => {
      if (!newStatusLabel.trim()) return;
      if (statuses.length >= 10) { showErr('Maximum 10 statuses'); return; }
      const value = newStatusLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const updated = [...statuses];
      updated.splice(updated.length - 1, 0, { value, label: newStatusLabel.trim(), color: newStatusColor });
      setStatuses(updated);
      setNewStatusLabel(''); setNewStatusColor('blue'); setShowAddStatus(false);
    };

    const moveStatus = (from: number, to: number) => {
      if (to < 0 || to >= statuses.length) return;
      if (LOCKED_STATUSES.includes(statuses[from].value)) return;
      if (to === 0 || to === statuses.length - 1) return;
      const updated = [...statuses];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      setStatuses(updated);
      setExpandedIdx(to);
    };

    const updateColor = (index: number, color: string) => {
      const updated = [...statuses];
      updated[index] = { ...updated[index], color };
      setStatuses(updated);
    };

    return (
      <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pipeline Statuses</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded">{statuses.length}</span>
          </div>
          {statuses.length < 10 && !showAddStatus && (
            <button onClick={() => setShowAddStatus(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition">
              <Plus className="w-3 h-3" /> Add Status
            </button>
          )}
        </div>

        {showAddStatus && (
          <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100 space-y-3">
            <input type="text" value={newStatusLabel} onChange={(e) => setNewStatusLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStatus()}
              placeholder="e.g., Awaiting Approval" autoFocus
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none bg-white transition" />
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c.value} onClick={() => setNewStatusColor(c.value)}
                  className={`w-7 h-7 rounded-full transition ${newStatusColor === c.value ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c.hex }} />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={addStatus} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition">Add</button>
              <button onClick={() => { setShowAddStatus(false); setNewStatusLabel(''); }}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-lg transition">Cancel</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {statuses.map((s, i) => {
            const locked = LOCKED_STATUSES.includes(s.value);
            const isExpanded = expandedIdx === i && !locked;

            return (
              <div key={`${s.value}-${i}`}>
                <div
                  className={`flex items-center gap-3 px-5 py-3.5 group transition ${locked ? 'bg-gray-50/60' : 'hover:bg-gray-50 cursor-pointer'}`}
                  onClick={() => {
                    if (locked) return;
                    setExpandedIdx(isExpanded ? null : i);
                  }}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: getColorHex(s.color) }} />
                  <span className={`flex-1 text-sm font-semibold ${locked ? 'text-gray-400' : 'text-gray-800'}`}>{s.label}</span>
                  {locked && (
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-semibold px-2 py-0.5 bg-gray-100 rounded">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                  {!locked && (
                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <button disabled={i <= 1} onClick={() => moveStatus(i, i - 1)}
                        className="p-1.5 hover:bg-gray-200 rounded transition disabled:opacity-20 text-gray-500">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button disabled={i >= statuses.length - 2} onClick={() => moveStatus(i, i + 1)}
                        className="p-1.5 hover:bg-gray-200 rounded transition disabled:opacity-20 text-gray-500">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button onClick={() => setStatuses(statuses.filter((_, idx) => idx !== i))}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 rounded transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded color picker */}
                {isExpanded && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c.value} onClick={() => updateColor(i, c.value)}
                          className={`w-7 h-7 rounded-full transition ${s.color === c.value ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105'}`}
                          style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400"><span className="font-bold text-gray-500">Tip:</span> Tap a status to change its color. New and Completed are locked.</p>
        </div>
      </div>
    );
  }
);

PipelineStep.displayName = 'PipelineStep';
export default PipelineStep;