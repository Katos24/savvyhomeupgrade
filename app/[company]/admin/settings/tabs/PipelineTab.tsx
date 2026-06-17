'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, ChevronUp, ChevronDown, AlertCircle,
  AlertTriangle, Workflow, Lock, Palette,
  Save, Check
} from 'lucide-react';

type StatusOption = {
  value: string;
  label: string;
  color: string;
};

const LOCKED_NAMES = ['new', 'completed'];

const COLOR_OPTIONS = [
  { value: 'blue',   label: 'Blue',   hex: '#3b82f6' },
  { value: 'yellow', label: 'Yellow', hex: '#eab308' },
  { value: 'purple', label: 'Purple', hex: '#a855f7' },
  { value: 'orange', label: 'Orange', hex: '#f97316' },
  { value: 'green',  label: 'Green',  hex: '#22c55e' },
  { value: 'red',    label: 'Red',    hex: '#ef4444' },
  { value: 'gray',   label: 'Gray',   hex: '#6b7280' },
  { value: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { value: 'pink',   label: 'Pink',   hex: '#ec4899' },
];

const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };

export default function PipelineTab({ company }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ index: number; label: string } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<number | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('blue');

  const [statuses, setStatuses] = useState<StatusOption[]>(() => {
    const saved = company.status_options;
    return Array.isArray(saved) && saved.length > 0 ? saved : [
      { value: 'new',         label: 'New',         color: 'pink'   },
      { value: 'contacted',   label: 'Contacted',   color: 'blue'   },
      { value: 'quoted',      label: 'Quoted',      color: 'yellow' },
      { value: 'in-progress', label: 'In Progress', color: 'orange' },
      { value: 'completed',   label: 'Completed',   color: 'green'  },
    ];
  });

  const getColorHex = (name: string) => COLOR_OPTIONS.find(c => c.value === name)?.hex || '#3b82f6';
  const isNameLocked = (s: StatusOption) => LOCKED_NAMES.includes(s.value);

  const showError = (msg: string) => { setError(msg); setTimeout(() => setError(''), 3000); };

  const moveStatus = (from: number, to: number) => {
    if (to <= 0 || to >= statuses.length - 1) return;
    const updated = [...statuses];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setStatuses(updated);
  };

  const handleRemoveStatus = (index: number) => {
    if (isNameLocked(statuses[index])) return;
    setDeleteConfirm({ index, label: statuses[index].label });
  };

  const confirmRemove = () => {
    if (!deleteConfirm) return;
    setStatuses(prev => prev.filter((_, i) => i !== deleteConfirm.index));
    setDeleteConfirm(null);
  };

  const handleAddStatus = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return showError('Enter a label');
    const value = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (statuses.some(s => s.value === value)) return showError('Status already exists');
    const updated = [...statuses];
    updated.splice(updated.length - 1, 0, { value, label: trimmed, color: newColor });
    setStatuses(updated);
    setNewLabel('');
    setNewColor('blue');
    setShowAddForm(false);
  };

  const updateStatusColor = (index: number, color: string) => {
    const updated = [...statuses];
    updated[index] = { ...updated[index], color };
    setStatuses(updated);
    setActiveColorPicker(null);
  };

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-pipeline', data: { status_options: statuses } }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Pipeline saved!');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showError(data.error || 'Failed to save changes');
      }
    } catch {
      showError('Network error while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 min-w-0">

      {/* ── PAGE HEADER ── */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900">Pipeline stages</h2>
        <p className="text-sm text-gray-500 mt-1">Define the stages every job moves through — from first contact to completed.</p>
      </div>

      {/* ── ALERTS ── */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN GRID — stages left, preview right ── */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-8 items-start">
        {/* LEFT — PIPELINE EDITOR */}
        <div className="space-y-3">

          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Workflow className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Stages</p>
                  <p className="text-[11px] text-gray-400">{statuses.length} stages configured</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAddForm(true); setActiveColorPicker(null); }}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add stage
              </button>
            </div>

            {/* Add form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={spring}
                  className="overflow-hidden border-b border-indigo-50"
                >
                  <div className="p-5 bg-indigo-50/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-medium text-indigo-500">New stage</p>
                      <button onClick={() => setShowAddForm(false)} className="p-1 text-gray-400 hover:text-gray-600 transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddStatus()}
                      placeholder="Stage name, e.g. Parts Ordered"
                      className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-300"
                      autoFocus
                    />
                    <div>
                      <p className="text-[11px] font-medium text-gray-400 mb-2">Color</p>
                      <div className="flex gap-2 flex-wrap">
                        {COLOR_OPTIONS.map(c => (
                          <button
                            key={c.value}
                            onClick={() => setNewColor(c.value)}
                            className={`w-7 h-7 rounded-full transition-all ${newColor === c.value ? 'ring-2 ring-offset-2 ring-indigo-400 scale-110' : 'opacity-50 hover:opacity-100'}`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleAddStatus}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition"
                    >
                      Add stage
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stages */}
            <div className="divide-y divide-gray-50">
              <AnimatePresence>
                {statuses.map((status, index) => {
                  const locked = isNameLocked(status);
                  const canMoveUp   = index > 1 && !locked;
                  const canMoveDown = index < statuses.length - 2 && !locked;

                  return (
                    <motion.div
                      key={`${status.value}-${index}`}
                      layout
                      transition={spring}
                      className={`relative flex items-center gap-3 px-4 py-3.5 group transition-colors ${locked ? 'bg-gray-50/50' : 'hover:bg-gray-50/60'}`}
                    >
                      <button
                        onClick={() => !locked && setActiveColorPicker(activeColorPicker === index ? null : index)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${!locked ? 'hover:scale-105 active:scale-95' : 'cursor-default'}`}
                        style={{ backgroundColor: getColorHex(status.color) }}
                      >
                        {!locked && <Palette className="w-3.5 h-3.5 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={status.label}
                          readOnly={locked}
                          onChange={e => {
                            const updated = [...statuses];
                            updated[index].label = e.target.value;
                            setStatuses(updated);
                          }}
                          className={`w-full bg-transparent text-sm font-medium outline-none transition-all ${
                            locked
                              ? 'text-gray-400 cursor-default'
                              : 'text-gray-900 border-b border-transparent focus:border-indigo-300'
                          }`}
                        />
                        <div className="flex items-center gap-1 mt-0.5">
                          {locked && <Lock className="w-2.5 h-2.5 text-gray-300" />}
                          <span className="text-[10px] font-medium text-gray-300">
                            {locked ? 'System required' : 'Custom stage'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          disabled={!canMoveUp}
                          onClick={() => moveStatus(index, index - 1)}
                          className="p-1.5 text-gray-300 hover:text-indigo-500 disabled:opacity-0 transition-colors rounded-lg hover:bg-indigo-50"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={!canMoveDown}
                          onClick={() => moveStatus(index, index + 1)}
                          className="p-1.5 text-gray-300 hover:text-indigo-500 disabled:opacity-0 transition-colors rounded-lg hover:bg-indigo-50"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {!locked && (
                          <button
                            onClick={() => handleRemoveStatus(index)}
                            className="p-1.5 text-gray-200 hover:text-red-400 hover:bg-red-50 transition-colors rounded-lg ml-1 opacity-0 group-hover:opacity-100"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {activeColorPicker === index && (
                          <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex items-center px-4 gap-3 rounded-none border-y border-indigo-100"
                          >
                            <div className="flex gap-2 flex-wrap flex-1">
                              {COLOR_OPTIONS.map(c => (
                                <button
                                  key={c.value}
                                  onClick={() => updateStatusColor(index, c.value)}
                                  className={`w-8 h-8 rounded-full border-2 border-white transition-all hover:scale-110 active:scale-95 ${status.color === c.value ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}`}
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                            <button onClick={() => setActiveColorPicker(null)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition shrink-0">
                              <X className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? 'Saving...' : 'Save pipeline'}
          </button>
        </div>

        {/* RIGHT — REFERENCE IMAGES */}
        <div className="hidden lg:block lg:sticky lg:top-6 space-y-4">
          <div>
            <p className="text-[11px] font-medium text-gray-400 mb-3">How stages appear</p>

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-3">
              <img
                src="/images/pipelineimage.webp"
                alt="Card badges"
                className="w-full h-auto object-cover"
              />
              <div className="px-4 py-3 border-t border-gray-50">
                <p className="text-sm font-medium text-gray-700">Card badges</p>
                <p className="text-[12px] text-gray-400 mt-0.5">Each lead card shows its current stage as a colored badge.</p>
              </div>
            </div>
          </div>

          {/* Live stage preview */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-medium text-gray-400 mb-3">Your current stages</p>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map(s => (
                <motion.span
                  key={s.value}
                  layout
                  transition={spring}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium text-white"
                  style={{ backgroundColor: getColorHex(s.color) }}
                >
                  {s.label}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 10 }}
              transition={spring}
              className="bg-white rounded-2xl w-full max-w-sm p-7 shadow-2xl text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove stage?</h3>
              <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                This will permanently remove <span className="font-medium text-gray-900">"{deleteConfirm.label}"</span>.
              </p>
              <p className="text-xs text-amber-600 mb-6">
                Any leads in this stage will need to be reassigned manually.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => setDeleteConfirm(null)} className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded-xl transition">Keep it</button>
                <button onClick={confirmRemove} className="py-3 bg-red-600 hover:bg-red-700 text-white font-medium text-sm rounded-xl active:scale-95 transition">Remove</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}