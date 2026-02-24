'use client';

import { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown, AlertCircle, AlertTriangle, Workflow, Lock } from 'lucide-react';

type StatusOption = {
  value: string;
  label: string;
  color: string;
  emoji?: string;
};

const LOCKED_STATUSES = ['new', 'completed'];

const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'pink', emoji: '✨' },
  { value: 'contacted', label: 'Contacted', color: 'blue', emoji: '📞' },
  { value: 'quoted', label: 'Quoted', color: 'yellow', emoji: '💰' },
  { value: 'scheduled', label: 'Scheduled', color: 'purple', emoji: '📅' },
  { value: 'in-progress', label: 'In Progress', color: 'orange', emoji: '🔨' },
  { value: 'completed', label: 'Completed', color: 'green', emoji: '✅' },
];

const COLOR_OPTIONS = [
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'yellow', label: 'Yellow', hex: '#eab308' },
  { value: 'purple', label: 'Purple', hex: '#a855f7' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
  { value: 'green', label: 'Green', hex: '#22c55e' },
  { value: 'red', label: 'Red', hex: '#ef4444' },
  { value: 'gray', label: 'Gray', hex: '#6b7280' },
  { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
];

const EMOJI_OPTIONS = ['✨', '📞', '💰', '📅', '🔨', '✅', '📋', '🎯', '⚡', '🚀', '💼', '🏆', '⏰', '📊', '🔔'];

export default function PipelineTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; label: string } | null>(null);
  const [statuses, setStatuses] = useState<StatusOption[]>(
    company.status_options?.length ? company.status_options : DEFAULT_STATUSES
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStatus, setNewStatus] = useState({ label: '', color: 'blue', emoji: '📋' });

  const getColorHex = (name: string) => COLOR_OPTIONS.find(c => c.value === name)?.hex || '#3b82f6';
  const isLocked = (s: StatusOption) => LOCKED_STATUSES.includes(s.value);

  const moveStatus = (from: number, to: number) => {
    if (to < 0 || to >= statuses.length) return;
    if (isLocked(statuses[from])) return;
    if (to === 0 && isLocked(statuses[0])) return;
    if (to === statuses.length - 1 && isLocked(statuses[statuses.length - 1])) return;
    const updated = [...statuses];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setStatuses(updated);
  };

  const handleRemoveStatus = (index: number) => {
    if (isLocked(statuses[index])) return;
    if (statuses.length <= 1) { setError('You must have at least 1 status'); setTimeout(() => setError(''), 3000); return; }
    setDeleteConfirm({ index, label: statuses[index].label });
  };

  const confirmRemove = () => {
    if (deleteConfirm) { setStatuses(statuses.filter((_, i) => i !== deleteConfirm.index)); setDeleteConfirm(null); }
  };

  const handleAddStatus = () => {
    if (!newStatus.label.trim()) { setError('Please enter a status label'); setTimeout(() => setError(''), 3000); return; }
    if (statuses.length >= 10) { setError('Maximum 10 statuses allowed'); setTimeout(() => setError(''), 3000); return; }
    const value = newStatus.label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (LOCKED_STATUSES.includes(value)) { setError(`"${newStatus.label}" is a reserved status name`); setTimeout(() => setError(''), 3000); return; }
    const updated = [...statuses];
    updated.splice(updated.length - 1, 0, { value, label: newStatus.label.trim(), color: newStatus.color, emoji: newStatus.emoji });
    setStatuses(updated);
    setNewStatus({ label: '', color: 'blue', emoji: '📋' });
    setShowAddForm(false);
  };

  const updateStatus = (index: number, field: 'label' | 'color' | 'emoji', value: string) => {
    if (isLocked(statuses[index])) return;
    const updated = [...statuses];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'label') updated[index].value = value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setStatuses(updated);
  };

  const handleSave = async () => {
    if (!statuses.length) { setError('You must have at least 1 status'); return; }
    const hasNew = statuses.some(s => s.value === 'new');
    const hasCompleted = statuses.some(s => s.value === 'completed');
    if (!hasNew || !hasCompleted) { setError('"New" and "Completed" statuses are required'); setTimeout(() => setError(''), 3000); return; }

    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-pipeline', data: { status_options: statuses } }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Pipeline saved! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save statuses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="border-b border-gray-100 pb-5">
        <h2 className="text-xl font-bold text-gray-900">Pipeline Statuses</h2>
        <p className="text-sm text-gray-500 mt-1">Customize the workflow stages for your leads and projects</p>
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
            <Workflow className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Statuses
            </span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold">
              {statuses.length} / 10
            </span>
          </div>
          {statuses.length < 10 && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Status
            </button>
          )}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="px-5 py-4 bg-indigo-50 border-b border-indigo-100">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest mb-4">New Status</p>
            <div className="space-y-4">

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Label</label>
                <input
                  type="text"
                  value={newStatus.label}
                  onChange={(e) => setNewStatus({ ...newStatus, label: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
                  placeholder="e.g., Awaiting Approval"
                  autoFocus
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 focus:border-indigo-400 focus:outline-none bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Emoji</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewStatus({ ...newStatus, emoji })}
                      className={`w-9 h-9 text-lg transition ${
                        newStatus.emoji === emoji
                          ? 'bg-indigo-100 ring-2 ring-indigo-500'
                          : 'bg-white border border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewStatus({ ...newStatus, color: color.value })}
                      className={`w-8 h-8 transition ${
                        newStatus.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAddStatus}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition"
                >
                  Add Status
                </button>
                <button
                  onClick={() => { setShowAddForm(false); setNewStatus({ label: '', color: 'blue', emoji: '📋' }); }}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status list */}
        <div className="divide-y divide-gray-50">
          {statuses.map((status, index) => {
            const locked = isLocked(status);
            return (
              <div
                key={index}
                className={`flex items-center gap-3 px-5 py-3.5 group transition ${
                  locked ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                {/* Color bar */}
                <div className="w-1 h-8 flex-shrink-0" style={{ backgroundColor: getColorHex(status.color) }} />

                {/* Emoji */}
                <span className="text-xl flex-shrink-0 w-8 text-center">{status.emoji || '📋'}</span>

                {/* Label input */}
                <input
                  type="text"
                  value={status.label}
                  onChange={(e) => updateStatus(index, 'label', e.target.value)}
                  readOnly={locked}
                  className={`flex-1 min-w-0 px-2 py-1 text-sm font-semibold border-b-2 border-transparent transition ${
                    locked
                      ? 'bg-transparent cursor-not-allowed text-gray-400 select-none'
                      : 'bg-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none text-gray-800'
                  }`}
                />

                {/* Locked badge */}
                {locked && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-bold px-2 py-0.5 bg-gray-100 flex-shrink-0">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}

                {/* Actions */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    disabled={index === 0 || locked}
                    onClick={() => moveStatus(index, index - 1)}
                    className="p-1.5 hover:bg-gray-200 transition disabled:opacity-20 disabled:cursor-not-allowed text-gray-500"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === statuses.length - 1 || locked}
                    onClick={() => moveStatus(index, index + 1)}
                    className="p-1.5 hover:bg-gray-200 transition disabled:opacity-20 disabled:cursor-not-allowed text-gray-500"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {!locked && (
                    <button
                      onClick={() => handleRemoveStatus(index)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {locked && <div className="w-7" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info + Save footer */}
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="font-bold text-gray-500">Tip:</span> Order matters — arrange statuses in the sequence leads move through your workflow.
            <span className="font-bold text-gray-500"> New</span> and <span className="font-bold text-gray-500">Completed</span> are locked system statuses.
          </p>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition"
          >
            {loading ? 'Saving...' : 'Save Pipeline'}
          </button>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 max-w-sm w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Delete "{deleteConfirm.label}"?</h3>
                  <p className="text-sm text-gray-500">Leads with this status will need to be reassigned. This cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition">
                  Cancel
                </button>
                <button onClick={confirmRemove}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}