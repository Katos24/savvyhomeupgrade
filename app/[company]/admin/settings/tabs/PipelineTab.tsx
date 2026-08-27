'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  X,
  AlertCircle,
  Lock,
  Palette,
  Check,
  ChevronUp,
  ChevronDown,
  Trash2,
  Workflow,
  AlertTriangle,
  Loader2,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import {
  DEFAULT_STATUSES,
  STAGE_TRIGGERS,
  type StatusOption,
} from '@/lib/formCategories';

// Modern, high-contrast color options
const COLOR_OPTIONS = [
  { value: 'slate', label: 'Slate', hex: '#475569' },
  { value: 'blue', label: 'Ocean', hex: '#0284c7' },
  { value: 'teal', label: 'Teal', hex: '#0d9488' },
  { value: 'green', label: 'Emerald', hex: '#059669' },
  { value: 'yellow', label: 'Amber', hex: '#d97706' },
  { value: 'orange', label: 'Coral', hex: '#ea580c' },
  { value: 'red', label: 'Rose', hex: '#e11d48' },
  { value: 'gray', label: 'Zinc', hex: '#27272a' },
];

export default function PipelineTab({
  company,
}: {
  company: any;
  currentUser?: any;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{
    index: number;
    label: string;
  } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<number | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('slate');

  const initialStatuses = useMemo<StatusOption[]>(() => {
    const saved = company?.status_options;
    const list = Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_STATUSES;
    return JSON.parse(JSON.stringify(list));
  }, [company?.status_options]);

  const [statuses, setStatuses] = useState<StatusOption[]>(() =>
    JSON.parse(JSON.stringify(initialStatuses))
  );

  const isDirty = useMemo(() => {
    return JSON.stringify(statuses) !== JSON.stringify(initialStatuses);
  }, [statuses, initialStatuses]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const getColorHex = (name: string) =>
    COLOR_OPTIONS.find((c) => c.value === name)?.hex || '#475569';

  const isLockedStage = (s: StatusOption) =>
    s.value === 'new' || s.value === 'completed';

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3500);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 1 || index >= statuses.length - 1) return;
    setStatuses((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index - 1];
      next[index - 1] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index < 1 || index >= statuses.length - 2) return;
    setStatuses((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[index + 1];
      next[index + 1] = temp;
      return next;
    });
  };

  const handleRemoveStatus = (index: number) => {
    if (isLockedStage(statuses[index])) return;
    setDeleteConfirm({ index, label: statuses[index].label });
  };

  const confirmRemove = () => {
    if (!deleteConfirm) return;
    setStatuses((prev) => prev.filter((_, i) => i !== deleteConfirm.index));
    setDeleteConfirm(null);
  };

  const handleAddStatus = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return showError('Enter a stage name');
    const value = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (statuses.some((s) => s.value === value))
      return showError('A stage with this name already exists');

    const updated = statuses.map((s) => ({ ...s }));
    updated.splice(updated.length - 1, 0, {
      value,
      label: trimmed,
      color: newColor,
    });
    setStatuses(updated);
    setNewLabel('');
    setNewColor('slate');
    setShowAddForm(false);
  };

  const updateStatusLabel = (index: number, label: string) => {
    if (isLockedStage(statuses[index])) return;
    setStatuses((prev) =>
      prev.map((s, i) => (i === index ? { ...s, label } : s))
    );
  };

  const updateStatusColor = (index: number, color: string) => {
    if (isLockedStage(statuses[index])) return;
    setStatuses((prev) =>
      prev.map((s, i) => (i === index ? { ...s, color } : s))
    );
    setActiveColorPicker(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-pipeline',
          data: { status_options: statuses },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Pipeline updated successfully.');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showError(data.error || 'Failed to save pipeline changes');
      }
    } catch {
      showError('Network connection error while saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="w-full space-y-6">

        {/* HEADER & TOP CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Pipeline Stages
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Customize the progression of customer jobs from initial lead to completion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isDirty && (
              <button
                type="button"
                onClick={() => setStatuses(JSON.parse(JSON.stringify(initialStatuses)))}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
              >
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={loading || !isDirty}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition shadow-xs ${
                isDirty
                  ? 'bg-slate-900 text-white hover:bg-slate-800'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/60'
              }`}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {loading ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {(success || error || isDirty) && (
          <div className="space-y-2">
            {isDirty && !success && (
              <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span className="text-xs font-semibold text-amber-900">
                    You have unsaved changes in your pipeline workflow.
                  </span>
                </div>
              </div>
            )}
            {success && (
              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/80 px-3.5 py-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-900">{success}</span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/80 px-3.5 py-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span className="text-xs font-semibold text-rose-900">{error}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* STAGE LISTING TABLE (2 COLUMNS WIDE) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Table Header Banner */}
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Workflow Stages ({statuses.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(true);
                  setActiveColorPicker(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Stage
              </button>
            </div>

            {/* Inline Add Stage Form */}
            {showAddForm && (
              <div className="p-4 bg-slate-50/90 border-b border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    New Stage Configuration
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-600 rounded p-0.5"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Stage Label
                    </label>
                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
                      placeholder="e.g. Parts Ordered"
                      className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-900 outline-none focus:border-slate-400"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Color Theme
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          title={c.label}
                          onClick={() => setNewColor(c.value)}
                          className={`h-5 w-5 rounded-full border border-slate-300 transition-all ${
                            newColor === c.value
                              ? 'ring-2 ring-slate-900 ring-offset-1 scale-110'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddStatus}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Create Stage
                  </button>
                </div>
              </div>
            )}

            {/* Stage Item Rows */}
            <div className="divide-y divide-slate-100">
              {statuses.map((status, index) => {
                const locked = isLockedStage(status);
                const canMoveUp = !locked && index > 1;
                const canMoveDown = !locked && index < statuses.length - 2;

                return (
                  <div
                    key={status.value}
                    className={`relative flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition-colors group ${
                      locked ? 'bg-slate-50/40' : ''
                    }`}
                  >
                    {/* Left side: Reorder + Color + Name */}
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      
                      {/* Reorder Buttons */}
                      <div className="flex flex-col items-center justify-center shrink-0">
                        {locked ? (
                          <Lock className="h-3.5 w-3.5 text-slate-300" />
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={!canMoveUp}
                              onClick={() => handleMoveUp(index)}
                              className={`p-0.5 rounded transition ${
                                canMoveUp
                                  ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                                  : 'text-slate-200 cursor-not-allowed'
                              }`}
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={!canMoveDown}
                              onClick={() => handleMoveDown(index)}
                              className={`p-0.5 rounded transition ${
                                canMoveDown
                                  ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                                  : 'text-slate-200 cursor-not-allowed'
                              }`}
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Color Picker Swatch */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          disabled={locked}
                          onClick={() =>
                            setActiveColorPicker(activeColorPicker === index ? null : index)
                          }
                          className={`flex h-5 w-5 items-center justify-center rounded border border-black/10 transition-transform ${
                            locked ? 'cursor-not-allowed opacity-80' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: getColorHex(status.color) }}
                        >
                          {!locked && (
                            <Palette className="h-2.5 w-2.5 text-white/90 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>

                        {/* Color Picker Dropdown Popover */}
                        {activeColorPicker === index && !locked && (
                          <div className="absolute left-0 top-7 z-30 w-44 rounded-lg border border-slate-200 bg-white p-2.5 shadow-md">
                            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Select Color
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveColorPicker(null)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {COLOR_OPTIONS.map((c) => (
                                <button
                                  key={c.value}
                                  type="button"
                                  title={c.label}
                                  onClick={() => updateStatusColor(index, c.value)}
                                  className={`h-5 w-5 rounded-full border border-slate-200 transition-transform ${
                                    status.color === c.value
                                      ? 'ring-2 ring-slate-900 ring-offset-1'
                                      : 'hover:scale-110'
                                  }`}
                                  style={{ backgroundColor: c.hex }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Stage Name & Trigger */}
                      <div className="min-w-0">
                        <input
                          type="text"
                          value={status.label}
                          readOnly={locked}
                          onChange={(e) => updateStatusLabel(index, e.target.value)}
                          className={`text-xs sm:text-sm font-semibold transition text-slate-900 ${
                            locked
                              ? 'bg-transparent outline-none cursor-not-allowed text-slate-500'
                              : 'bg-transparent border-b border-transparent focus:border-slate-400 focus:outline-none'
                          }`}
                        />
                        <p className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">
                          {locked
                            ? 'System Required Stage'
                            : STAGE_TRIGGERS[status.value] || 'Custom User Stage'}
                        </p>
                      </div>
                    </div>

                    {/* Right side: Badge / Delete Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        locked
                          ? 'text-slate-500 bg-slate-100 border-slate-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}>
                        {locked ? 'Fixed' : 'Custom'}
                      </span>

                      {!locked && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStatus(index)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR PREVIEWS */}
          <div className="space-y-6">
            {/* Live Badges Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Live Stage Badges
                </span>
              </div>
              <div className="p-4 flex flex-wrap gap-1.5">
                {statuses.map((s) => (
                  <span
                    key={s.value}
                    className="inline-flex items-center rounded border border-black/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs"
                    style={{ backgroundColor: getColorHex(s.color) }}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Automated Triggers Info Card */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center gap-2">
                <Info className="h-4 w-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Automated Triggers
                </span>
              </div>
              <div className="p-4 space-y-3">
                {statuses
                  .filter((s) => STAGE_TRIGGERS[s.value] && s.value !== 'new')
                  .map((s) => (
                    <div key={s.value} className="text-xs text-slate-600 leading-normal border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                      <span
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase text-white mr-1.5"
                        style={{ backgroundColor: getColorHex(s.color) }}
                      >
                        {s.label}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {STAGE_TRIGGERS[s.value].replace(/^Moves here when |^You move jobs here when /, '')}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

        </div>

        {/* DELETE MODAL */}
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-2xs"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="text-sm font-bold text-slate-900">Remove Stage</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">&quot;{deleteConfirm.label}&quot;</strong>? Any jobs currently in this stage will need to be manually reassigned.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemove}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                >
                  Delete Stage
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}