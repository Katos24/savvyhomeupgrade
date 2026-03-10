'use client';

import { useState } from 'react';
import { Plus, X, ChevronUp, ChevronDown, AlertCircle, AlertTriangle, Workflow, Lock, Palette } from 'lucide-react';

type StatusOption = {
  value: string;
  label: string;
  color: string;
};

const LOCKED_NAMES = ['new', 'completed'];

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

export default function PipelineTab({ company, currentUser }: { company: any; currentUser: any }) {
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
      { value: 'new', label: 'New', color: 'pink' },
      { value: 'contacted', label: 'Contacted', color: 'blue' },
      { value: 'quoted', label: 'Quoted', color: 'yellow' },
      { value: 'in-progress', label: 'In Progress', color: 'orange' },
      { value: 'completed', label: 'Completed', color: 'green' },
    ];
  });

  const getColorHex = (name: string) => COLOR_OPTIONS.find(c => c.value === name)?.hex || '#3b82f6';
  const isNameLocked = (s: StatusOption) => LOCKED_NAMES.includes(s.value);

  const showError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

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
    if (statuses.length >= 10) return showError('Max 10 statuses');
    
    const value = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (statuses.some(s => s.value === value)) return showError('Status already exists');

    const updated = [...statuses];
    updated.splice(updated.length - 1, 0, { value, label: trimmed, color: newColor });
    setStatuses(updated);
    setNewLabel('');
    setShowAddForm(false);
  };

  const updateStatusColor = (index: number, color: string) => {
    const updated = [...statuses];
    updated[index] = { ...updated[index], color };
    setStatuses(updated);
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
        body: JSON.stringify({ action: 'update-pipeline', data: { status_options: statuses } }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Pipeline updated!');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        showError(data.error || 'Failed to save');
      }
    } catch {
      showError('Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 sm:pb-8">
      {/* Alerts */}
      {success && <div className="mb-4 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">✓ {success}</div>}
      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold flex items-center gap-2 animate-in shake duration-300"><AlertCircle className="w-4 h-4" /> {error}</div>}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Pipeline</span>
            </div>
            {/* HELPER TEXT ADDED HERE */}
            <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Tap color box to change style</span>
          </div>
          {statuses.length < 10 && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="p-2 bg-indigo-600 text-white rounded-lg active:scale-90 transition-transform shadow-md shadow-indigo-100 px-3 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-bold">Add</span>
            </button>
          )}
        </div>

        {showAddForm && (
          <div className="p-5 border-b border-indigo-100 bg-indigo-50/30 animate-in slide-in-from-top duration-200">
             <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-tight">Status Name & Color</span>
                <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-white rounded-full transition">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
             </div>
             <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Awaiting Parts"
                className="w-full p-4 text-base border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 outline-none mb-4 bg-white shadow-sm"
                autoFocus
             />
             <div className="grid grid-cols-5 gap-3 mb-6 px-1">
                {COLOR_OPTIONS.map(c => (
                  <button 
                    key={c.value}
                    onClick={() => setNewColor(c.value)}
                    className={`aspect-square rounded-full flex items-center justify-center transition-all ${newColor === c.value ? 'ring-4 ring-indigo-200 scale-110 shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {newColor === c.value && <div className="w-2 h-2 bg-white rounded-full" />}
                  </button>
                ))}
             </div>
             <button onClick={handleAddStatus} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl active:scale-[0.98] transition shadow-lg shadow-indigo-100">
                Create Status
             </button>
          </div>
        )}

        <div className="divide-y divide-gray-50">
          {statuses.map((status, index) => {
            const lockedName = isNameLocked(status);
            const canMoveUp = index > 1 && !lockedName;
            const canMoveDown = index < statuses.length - 2 && !lockedName;

            return (
              <div key={`${status.value}-${index}`} className={`relative flex items-center gap-4 p-4 sm:p-5 ${lockedName ? 'bg-gray-50/40' : 'bg-white'}`}>
                
                {/* COLOR BOX WITH TEXT HELP */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setActiveColorPicker(activeColorPicker === index ? null : index)}
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-sm border-2 border-white ring-1 ring-gray-100"
                    style={{ backgroundColor: getColorHex(status.color) }}
                  >
                    <Palette className="w-5 h-5 text-white/90 drop-shadow-sm" />
                  </button>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Color</span>
                </div>

                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={status.label}
                    readOnly={lockedName}
                    onChange={(e) => {
                      const updated = [...statuses];
                      updated[index].label = e.target.value;
                      setStatuses(updated);
                    }}
                    className={`w-full bg-transparent text-base font-bold outline-none border-b-2 border-transparent focus:border-indigo-100 transition-colors ${lockedName ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800'}`}
                  />
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-tight">
                    {lockedName ? 'System Position' : 'Editable Status'}
                  </p>
                </div>

                <div className="flex items-center gap-0.5">
                  <button 
                    disabled={!canMoveUp} 
                    onClick={() => moveStatus(index, index - 1)}
                    className="p-2 text-gray-300 active:text-indigo-500 active:bg-indigo-50 rounded-lg disabled:opacity-0 transition-colors"
                  >
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <button 
                    disabled={!canMoveDown} 
                    onClick={() => moveStatus(index, index + 1)}
                    className="p-2 text-gray-300 active:text-indigo-500 active:bg-indigo-50 rounded-lg disabled:opacity-0 transition-colors"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                  {!lockedName && (
                    <button 
                      onClick={() => handleRemoveStatus(index)}
                      className="p-2 text-red-200 active:text-red-500 active:bg-red-50 rounded-lg ml-1"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                  {lockedName && <Lock className="w-4 h-4 text-gray-200 ml-2" />}
                </div>

                {/* OVERLAY COLOR PICKER */}
                {activeColorPicker === index && (
                  <div className="absolute inset-0 bg-white z-20 flex items-center px-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex-1 flex justify-around items-center px-1">
                       {COLOR_OPTIONS.map(c => (
                         <button 
                           key={c.value} 
                           onClick={() => updateStatusColor(index, c.value)}
                           className={`w-9 h-9 rounded-full border-2 border-white shadow-md transition-transform active:scale-125 ${status.color === c.value ? 'ring-2 ring-indigo-400 ring-offset-2 scale-110' : ''}`}
                           style={{ backgroundColor: c.hex }}
                         />
                       ))}
                    </div>
                    <button onClick={() => setActiveColorPicker(null)} className="ml-4 p-2 bg-gray-100 rounded-full active:scale-90">
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6 sm:static sm:mt-8">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-4 bg-indigo-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Saving Changes...' : 'Save Pipeline'}
        </button>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Remove status?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Confirm you want to delete <span className="text-gray-900 font-bold underline">"{deleteConfirm.label}"</span>. Any leads in this status will need updating.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl">Cancel</button>
              <button onClick={confirmRemove} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}