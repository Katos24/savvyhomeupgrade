'use client';

import React, { useEffect } from 'react';

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
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !slug) return null;

  // Replace hyphens with spaces for display, then capitalize the first letter
  const formattedDisplayName = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
      <div onClick={onEdit} className="absolute inset-0 bg-black/60" />

      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-950">Confirm your details</h2>
          <button onClick={onEdit} className="text-sm font-semibold text-gray-600 hover:text-black">
            Close
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Workspace Name Display */}
          <div>
            <p className="text-[11px] font-extrabold text-gray-900 uppercase tracking-widest mb-2">
              Workspace name
            </p>
            <div className="text-sm font-bold text-gray-800 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {formattedDisplayName}
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Note: Hyphens are automatically added to your URL for multi-word names.
            </p>
          </div>

          {/* Customer Link */}
          <div>
            <p className="text-[11px] font-extrabold text-gray-900 uppercase tracking-widest mb-2">
              Customer facing link
            </p>
            <div className="text-sm font-bold text-gray-900 break-all bg-blue-50 p-4 rounded-lg border border-blue-200">
              lead2project.com/<span className="text-blue-700 underline decoration-blue-400 decoration-2 underline-offset-4">{slug}</span>
            </div>
          </div>

          {/* Dashboard Link */}
          <div>
            <p className="text-[11px] font-extrabold text-gray-900 uppercase tracking-widest mb-2">
              Private dashboard link
            </p>
            <div className="text-sm font-bold text-gray-900 break-all bg-gray-100 p-4 rounded-lg border border-gray-200">
              lead2project.com/<span className="underline decoration-gray-400 decoration-2 underline-offset-4">{slug}</span>/dashboard
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-[13px] text-gray-900">
            <p className="font-bold mb-1">Permanent URL</p>
            This address cannot be changed once the workspace is created.
          </div>

          <button
            onClick={onEdit}
            className="w-full text-sm font-bold text-gray-700 hover:text-black py-3 border-2 border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
          >
            Edit workspace details
          </button>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-gray-950 text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors"
          >
            Confirm and create workspace
          </button>
        </div>
      </div>
    </div>
  );
}