'use client';

import { useState } from 'react';
import { 
  Plus, X, ChevronUp, ChevronDown, AlertCircle, 
  AlertTriangle, Workflow, Lock, Palette, 
  Save, Check, Info 
} from 'lucide-react';

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
        setSuccess('Workflow changes saved!');
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
    <div className="max-w-4xl mx-auto px-4 pb-16 pt-6">
      
  {/* ── MOBILE-OPTIMIZED REFERENCE PREVIEW ── */}
      <div className="mb-10 max-w-2xl mx-auto px-2"> 
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">Reference Preview</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Workflow appearance</p>
          </div>
        </div>

        {/* - grid-cols-1: Stacks on mobile
            - sm:grid-cols-2: Side-by-side on tablets/desktop
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-center p-4 sm:p-6 group overflow-hidden">
              <div className="w-full relative">
                <div className="aspect-[16/10] w-full max-w-[280px] mx-auto rounded-[1.2rem] overflow-hidden border border-slate-100 shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src="/images/status-guide-1.png" 
                    alt="Card View" 
                    className="w-full h-full object-cover" 
                  />
                  {/* Label moved INSIDE the image container for mobile safety */}
                  <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/10">
                     <p className="text-[8px] font-black text-white uppercase tracking-widest">1. Card Badges</p>
                  </div>
                </div>
              </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm flex items-center justify-center p-4 sm:p-6 group overflow-hidden">
              <div className="w-full relative">
                <div className="aspect-[16/10] w-full max-w-[280px] mx-auto rounded-[1.2rem] overflow-hidden border border-slate-100 shadow-lg group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src="/images/status-guide-2.png" 
                    alt="Menu View" 
                    className="w-full h-full object-cover" 
                  />
                  {/* Label moved INSIDE the image container for mobile safety */}
                  <div className="absolute bottom-2 right-2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-white/10">
                     <p className="text-[8px] font-black text-white uppercase tracking-widest">2. Selection Menu</p>
                  </div>
                </div>
              </div>
          </div>

        </div>
      </div>
      
      {/* ── ALERTS ── */}
      {success && <div className="mb-6 p-5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-[1.5rem] text-sm font-black animate-in fade-in slide-in-from-top-4 flex items-center justify-center gap-2 shadow-sm"> <Check className="w-5 h-5" /> {success}</div>}
      {error && <div className="mb-6 p-5 bg-red-50 text-red-700 border border-red-100 rounded-[1.5rem] text-sm font-black flex items-center justify-center gap-2 animate-in shake"> <AlertCircle className="w-5 h-5" /> {error}</div>}

      {/* ── THE EDITOR ── */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
                <Workflow className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Pipeline Stages</h3>
            </div>
            {/* HELPER TEXT */}
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Customize your workflow by dragging or editing stages below</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="h-10 px-4 bg-indigo-600 text-white rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-md shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Add Stage</span>
          </button>
        </div>

        {showAddForm && (
          <div className="p-6 border-b border-indigo-50 bg-indigo-50/20 animate-in slide-in-from-top duration-300 relative z-10">
             <div className="flex justify-between items-center mb-5">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">New Workflow Stage</span>
                <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-white rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
             </div>
             <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Stage Name (e.g. Parts Ordered)"
                className="w-full p-4 text-base font-bold border-2 border-slate-100 rounded-xl focus:border-indigo-400 outline-none mb-5 bg-white shadow-sm"
                autoFocus
             />
             <div className="grid grid-cols-5 sm:grid-cols-9 gap-3 mb-6">
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
                Confirm & Create Stage
             </button>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {statuses.map((status, index) => {
            const lockedName = isNameLocked(status);
            const canMoveUp = index > 1 && !lockedName;
            const canMoveDown = index < statuses.length - 2 && !lockedName;

            return (
              <div key={`${status.value}-${index}`} className={`relative flex items-center gap-4 p-4 sm:p-5 ${lockedName ? 'bg-slate-50/30' : 'bg-white'}`}>
                
                <button
                    onClick={() => setActiveColorPicker(activeColorPicker === index ? null : index)}
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md border-2 border-white ring-1 ring-slate-100 shrink-0 transition-all active:scale-90"
                    style={{ backgroundColor: getColorHex(status.color) }}
                >
                    <Palette className="w-5 h-5 text-white/90" />
                </button>

                <div className="flex-1 min-w-0 px-1">
                  <input
                    type="text"
                    value={status.label}
                    readOnly={lockedName}
                    onChange={(e) => {
                      const updated = [...statuses];
                      updated[index].label = e.target.value;
                      setStatuses(updated);
                    }}
                    className={`w-full bg-transparent text-lg font-bold outline-none ${lockedName ? 'text-slate-400' : 'text-slate-900 border-b-2 border-slate-50 focus:border-indigo-100'}`}
                  />
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {lockedName && <Lock className="w-3 h-3 text-slate-300" />}
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {lockedName ? 'System Requirement' : 'Customizable Stage'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <button disabled={!canMoveUp} onClick={() => moveStatus(index, index - 1)} className="p-2 text-slate-300 hover:text-indigo-600 disabled:opacity-0">
                    <ChevronUp className="w-6 h-6" />
                  </button>
                  <button disabled={!canMoveDown} onClick={() => moveStatus(index, index + 1)} className="p-2 text-slate-300 hover:text-indigo-600 disabled:opacity-0">
                    <ChevronDown className="w-6 h-6" />
                  </button>
                  {!lockedName && (
                    <button onClick={() => handleRemoveStatus(index)} className="p-2 text-red-200 hover:text-red-500 rounded-lg ml-1">
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {activeColorPicker === index && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 flex items-center px-6 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex-1 flex justify-around">
                       {COLOR_OPTIONS.map(c => (
                         <button key={c.value} onClick={() => updateStatusColor(index, c.value)} className="w-9 h-9 rounded-full border-2 border-white shadow-lg active:scale-125" style={{ backgroundColor: c.hex }} />
                       ))}
                    </div>
                    <button onClick={() => setActiveColorPicker(null)} className="ml-4 p-2 bg-slate-100 rounded-2xl"><X className="w-4 h-4 text-slate-600" /></button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── STICKY SAVE BUTTON AREA ── */}
      <div className="fixed bottom-6 left-6 right-6 sm:static sm:mt-8 z-[100] max-w-4xl mx-auto">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-slate-800"
        >
          {loading ? 'Processing...' : 'Save Pipeline Configuration'}
        </button>
      </div>

      {/* ── DELETE MODAL ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-10 animate-in zoom-in-95 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Remove Stage?</h3>
            <p className="text-slate-500 text-sm mb-10 font-bold uppercase tracking-tight leading-relaxed">Confirm deletion of <span className="text-red-600 underline">"{deleteConfirm.label}"</span>. Any leads in this stage must be re-categorized.</p>
            <div className="space-y-3">
              <button onClick={confirmRemove} className="w-full h-14 bg-red-600 text-white font-black rounded-xl active:scale-95 shadow-lg shadow-red-100">Delete Forever</button>
              <button onClick={() => setDeleteConfirm(null)} className="w-full h-14 bg-slate-100 text-slate-500 font-black rounded-xl">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}