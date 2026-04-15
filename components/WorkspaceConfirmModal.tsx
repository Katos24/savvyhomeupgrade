'use client';

import { ArrowRight, Globe, Lock, Pencil } from 'lucide-react';

interface WorkspaceConfirmModalProps {
  isOpen: boolean;
  slug: string;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function WorkspaceConfirmModal({
  isOpen,
  slug,
  onConfirm,
  onEdit,
}: WorkspaceConfirmModalProps) {
  if (!isOpen || !slug) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-2 sm:p-4">

      {/* Backdrop */}
      <div
        onClick={onEdit}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* Header */}
        <div className="p-4 sm:p-6 text-center border-b border-slate-100">

          <div className="inline-flex px-3 py-1 mb-3 rounded-full bg-red-50 border border-red-100">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">
              Double-check before continuing
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-slate-900">
            Does your URL look right?
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            This becomes your permanent workspace URL and cannot be changed later.
          </p>

          {/* ✅ SIMPLE CLARITY FIX */}
          <p className="mt-2 text-[11px] font-semibold text-slate-500">
  Your URL will be auto-formatted (e.g. “blue line” → “blue-line”)
          </p>

        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">

          {/* Public URL */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">

            <div className="flex items-center gap-2 px-4 py-2 bg-blue-100">
              <Globe size={12} className="text-blue-800" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-800">
                Customer form
              </span>
              <span className="ml-auto text-[10px] font-bold text-blue-800 bg-blue-200 px-2 py-0.5 rounded-full">
                Public
              </span>
            </div>

            <div className="p-3 sm:p-4">
              <div className="rounded-lg border border-blue-200 bg-white px-3 py-2 font-mono text-xs sm:text-sm break-all">
                <span className="text-slate-400">lead2project.com/</span>
                <span className="font-black text-slate-800">{slug}</span>
              </div>
            </div>
          </div>

          {/* Dashboard URL */}
          <div className="rounded-xl border border-slate-700 bg-slate-900 overflow-hidden">

            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800">
              <Lock size={12} className="text-indigo-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                Dashboard
              </span>
              <span className="ml-auto text-[10px] font-bold text-indigo-300 bg-slate-700 px-2 py-0.5 rounded-full">
                Private
              </span>
            </div>

            <div className="p-3 sm:p-4">
              <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-xs sm:text-sm break-all">
                <span className="text-slate-500">lead2project.com/</span>
                <span className="text-indigo-300 font-black">{slug}</span>
                <span className="text-slate-500">/dashboard</span>
              </div>
            </div>
          </div>

        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 space-y-3">

          <button
            onClick={onConfirm}
            className="w-full h-12 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.99] transition"
          >
            Looks good — continue
            <ArrowRight size={16} />
          </button>

          <button
            onClick={onEdit}
            className="w-full h-11 rounded-xl border border-slate-200 text-slate-500 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition"
          >
            <Pencil size={14} />
            Fix spelling
          </button>
        </div>

      </div>
    </div>
  );
}