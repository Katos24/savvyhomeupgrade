'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import {
  Plus,
  X,
  AlertCircle,
  AlertTriangle,
  Workflow,
  Lock,
  Palette,
  Save,
  Check,
  ChevronUp,
  ChevronDown,
  Trash2,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  DEFAULT_STATUSES,
  STAGE_TRIGGERS,
  type StatusOption,
} from '@/lib/formCategories';

// Modern, sophisticated SaaS color palette (Linear/Notion style)
const COLOR_OPTIONS = [
  { value: 'indigo', label: 'Indigo', hex: '#4f46e5' },
  { value: 'blue', label: 'Ocean', hex: '#0284c7' },
  { value: 'teal', label: 'Teal', hex: '#0d9488' },
  { value: 'green', label: 'Emerald', hex: '#059669' },
  { value: 'yellow', label: 'Amber', hex: '#d97706' },
  { value: 'orange', label: 'Coral', hex: '#ea580c' },
  { value: 'red', label: 'Rose', hex: '#e11d48' },
  { value: 'violet', label: 'Violet', hex: '#7c3aed' },
  { value: 'slate', label: 'Slate', hex: '#475569' },
  { value: 'gray', label: 'Zinc', hex: '#27272a' },
];

const spring = { type: 'spring' as const, damping: 25, stiffness: 300 };

/* ── SUB-COMPONENT FOR STAGE ROW WITH ARROW CONTROLS ── */
interface StatusRowProps {
  status: StatusOption;
  index: number;
  totalCount: number;
  locked: boolean;
  activeColorPicker: number | null;
  setActiveColorPicker: (index: number | null) => void;
  getColorHex: (color: string) => string;
  updateStatusColor: (index: number, color: string) => void;
  updateStatusLabel: (index: number, label: string) => void;
  handleRemoveStatus: (index: number) => void;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
}

function StatusRow({
  status,
  index,
  totalCount,
  locked,
  activeColorPicker,
  setActiveColorPicker,
  getColorHex,
  updateStatusColor,
  updateStatusLabel,
  handleRemoveStatus,
  moveUp,
  moveDown,
}: StatusRowProps) {
  const canMoveUp = !locked && index > 1;
  const canMoveDown = !locked && index < totalCount - 2;

  return (
    <motion.div
      layout
      transition={spring}
      className={`group relative flex items-center gap-3 bg-white px-4 py-3.5 transition-colors ${
        locked ? 'bg-slate-50/60' : 'hover:bg-slate-50/60'
      }`}
    >
      {/* Up / Down Arrow Controls */}
      <div className="flex flex-col items-center justify-center gap-0.5 shrink-0">
        {locked ? (
          <div className="flex h-10 w-6 items-center justify-center text-slate-300">
            <Lock className="h-4 w-4 text-slate-300" />
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={!canMoveUp}
              onClick={() => moveUp(index)}
              className={`rounded-md p-0.5 transition ${
                canMoveUp
                  ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                  : 'text-slate-200 cursor-not-allowed'
              }`}
              title="Move Up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!canMoveDown}
              onClick={() => moveDown(index)}
              className={`rounded-md p-0.5 transition ${
                canMoveDown
                  ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer'
                  : 'text-slate-200 cursor-not-allowed'
              }`}
              title="Move Down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Color Swatch Picker Toggle */}
      <div className="relative">
        <button
          type="button"
          disabled={locked}
          onClick={() =>
            setActiveColorPicker(activeColorPicker === index ? null : index)
          }
          className={`group/picker flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-xs ring-1 ring-black/5 transition-transform ${
            locked ? 'cursor-not-allowed opacity-90' : 'hover:scale-105'
          }`}
          style={{ backgroundColor: getColorHex(status.color) }}
        >
          {!locked && (
            <Palette className="h-3.5 w-3.5 text-white/90 opacity-0 transition-opacity group-hover/picker:opacity-100" />
          )}
        </button>

        {/* Color Popover Menu */}
        <AnimatePresence>
          {activeColorPicker === index && !locked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 5 }}
              className="absolute left-0 top-9 z-30 w-52 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md"
            >
              <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Stage Color
                </span>
                <button
                  type="button"
                  onClick={() => setActiveColorPicker(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => updateStatusColor(index, c.value)}
                    className={`h-6 w-6 rounded-full border border-black/10 transition-transform hover:scale-115 ${
                      status.color === c.value
                        ? 'ring-2 ring-indigo-500 ring-offset-2'
                        : ''
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage Title Input */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={status.label}
          readOnly={locked}
          onChange={(e) => updateStatusLabel(index, e.target.value)}
          className={`w-full rounded-md border border-transparent px-1.5 py-0.5 text-sm font-semibold text-slate-800 transition ${
            locked
              ? 'cursor-not-allowed bg-transparent focus:outline-none'
              : 'bg-transparent focus:border-indigo-300 focus:bg-white focus:outline-none'
          }`}
        />
        <div className="ml-1.5 flex items-center gap-1.5">
          {locked ? (
            <span className="text-[11px] font-medium text-slate-400">
              System Fixed Stage
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400">
              {STAGE_TRIGGERS[status.value] || 'Custom Stage'}
            </span>
          )}
        </div>
      </div>

      {/* Delete Action */}
      {!locked && (
        <button
          type="button"
          onClick={() => handleRemoveStatus(index)}
          className="rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 sm:p-1.5 sm:text-slate-300 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}

/* ── MAIN PIPELINE TAB COMPONENT ── */
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
  const [newColor, setNewColor] = useState('indigo');

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
    COLOR_OPTIONS.find((c) => c.value === name)?.hex || '#4f46e5';

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
    setNewColor('indigo');
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
        setSuccess('Pipeline updated successfully!');
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
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* ── HEADER ── */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Pipeline Stages
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Customize the linear progression of your customer jobs from initial lead to finished job.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !isDirty}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-xs transition sm:text-sm ${
            isDirty
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading
            ? 'Saving Changes...'
            : isDirty
            ? 'Save Changes'
            : 'Saved'}
        </button>
      </div>

      {/* ── ALERTS ── */}
      <AnimatePresence>
        {isDirty && !success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs font-medium text-amber-800 shadow-xs sm:text-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>You have unsaved changes in your pipeline workflow.</span>
            </div>
            <button
              onClick={() => setStatuses(JSON.parse(JSON.stringify(initialStatuses)))}
              className="text-xs font-semibold text-amber-900 underline hover:text-amber-700 cursor-pointer"
            >
              Reset
            </button>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 shadow-xs sm:text-sm"
          >
            <Check className="h-4 w-4 shrink-0 text-emerald-600" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-700 shadow-xs sm:text-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN LAYOUT ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* PIPELINE EDITOR */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Workflow className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Active Workflow Stages
                  </p>
                  <p className="text-xs text-slate-400">
                    {statuses.length} stages configured
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowAddForm(true);
                  setActiveColorPicker(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Add Stage
              </button>
            </div>

            {/* Inline Add Stage Drawer */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={spring}
                  className="overflow-hidden border-b border-indigo-100 bg-indigo-50/30"
                >
                  <div className="space-y-4 p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                        <Sparkles className="h-3.5 w-3.5" /> New Stage Configuration
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="rounded-md p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
                      placeholder="e.g. Parts Ordered"
                      className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      autoFocus
                    />

                    <div>
                      <p className="mb-2 text-[11px] font-semibold text-slate-500">
                        Select Badge Color
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((c) => (
                          <button
                            key={c.value}
                            type="button"
                            title={c.label}
                            onClick={() => setNewColor(c.value)}
                            className={`h-6 w-6 rounded-full border border-black/10 transition cursor-pointer ${
                              newColor === c.value
                                ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2'
                                : 'opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAddStatus}
                        className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700 cursor-pointer"
                      >
                        Create Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* List with Animated Position Swapping */}
            <div className="divide-y divide-slate-100">
              {statuses.map((status, index) => (
                <StatusRow
                  key={status.value}
                  status={status}
                  index={index}
                  totalCount={statuses.length}
                  locked={isLockedStage(status)}
                  activeColorPicker={activeColorPicker}
                  setActiveColorPicker={setActiveColorPicker}
                  getColorHex={getColorHex}
                  updateStatusColor={updateStatusColor}
                  updateStatusLabel={updateStatusLabel}
                  handleRemoveStatus={handleRemoveStatus}
                  moveUp={handleMoveUp}
                  moveDown={handleMoveDown}
                />
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR PREVIEWS */}
        <div className="space-y-4 lg:sticky lg:top-6">
          {/* Card Badges Preview */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <p className="mb-3 text-xs font-semibold text-slate-500">
              Live Stage Badges
            </p>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map((s) => (
                <span
                  key={s.value}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-2xs"
                  style={{ backgroundColor: getColorHex(s.color) }}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Automation Rules */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Info className="h-4 w-4 text-indigo-500" /> Automated Triggers
            </div>
            <div className="space-y-2.5">
              {statuses
                .filter((s) => STAGE_TRIGGERS[s.value] && s.value !== 'new')
                .map((s) => (
                  <div key={s.value} className="text-xs leading-relaxed text-slate-600">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: getColorHex(s.color) }}
                    >
                      {s.label}
                    </span>{' '}
                    — {STAGE_TRIGGERS[s.value].replace(/^Moves here when |^You move jobs here when /, '')}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── DELETE MODAL ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={spring}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-center text-base font-bold text-slate-900">
                Remove Stage?
              </h3>
              <p className="mt-2 text-center text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800">&quot;{deleteConfirm.label}&quot;</strong>? Any jobs currently in this stage will need to be manually reassigned.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemove}
                  className="rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white transition hover:bg-rose-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}