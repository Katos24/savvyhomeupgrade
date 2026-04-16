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
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-4">

      {/* Backdrop */}
      <div onClick={onEdit} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-7 pb-5">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Confirm your URL
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            This is permanent — it can't be changed after you continue.
          </p>
        </div>

        {/* URLs */}
        <div className="px-6 pb-5 space-y-4">

          {/* Public */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-gray-700">Customer Booking Page</span>
              <span className="ml-auto text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">Public</span>
            </div>
            <div className="rounded-lg bg-gray-100 px-4 py-3 font-mono text-sm text-gray-900 break-all">
              <span className="text-gray-500">lead2project.com/</span><span className="font-bold text-gray-900">{slug}</span>
            </div>
          </div>

          {/* Dashboard */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-gray-700">Your Dashboard</span>
              <span className="ml-auto text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">Private</span>
            </div>
            <div className="rounded-lg bg-gray-100 px-4 py-3 font-mono text-sm text-gray-900 break-all">
              <span className="text-gray-500">lead2project.com/</span><span className="font-bold text-gray-900">{slug}</span><span className="text-gray-500">/dashboard</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Spaces auto-convert to dashes. "Blue Line" → "blue-line"
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Actions */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-3"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 py-2 px-3 rounded-lg hover:bg-gray-100 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all active:scale-[0.98]"
          >
            Confirm <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}