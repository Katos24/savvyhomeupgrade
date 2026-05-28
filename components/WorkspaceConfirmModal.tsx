'use client';

import React, { useEffect } from 'react';
import { ArrowRight, Globe, Info, Lock, Pencil, X } from 'lucide-react';

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

  const getSlugFontSize = (text: string) => {
    const len = text.length;
    if (len > 20) return 'text-xl';
    if (len > 15) return 'text-2xl';
    if (len > 12) return 'text-3xl';
    return 'text-4xl';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div
        onClick={onEdit}
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
      />

      <div className="relative w-full max-w-md bg-white shadow-2xl 
                      rounded-t-[2rem] sm:rounded-2xl 
                      animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 duration-300 ease-out
                      flex flex-col max-h-[95vh]">
        
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        <button 
          onClick={onEdit}
          className="hidden sm:flex absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto px-6 pt-6 sm:pt-8 pb-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              Confirm your link
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              This is your permanent address. <br className="hidden sm:block" />
              <span className="text-red-600 font-bold italic underline decoration-red-200 underline-offset-2">
                It cannot be changed later.
              </span>
            </p>
          </div>

          <div className="mb-6">
            <div className="rounded-2xl bg-gray-950 p-6 text-center ring-4 ring-gray-100 flex flex-col items-center justify-center min-h-[120px]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3">
                Unique Workspace Name
              </p>
              <div className={`font-mono font-black text-white tracking-tight leading-tight transition-all duration-200 break-all sm:whitespace-nowrap ${getSlugFontSize(slug)}`}>
                {slug}
              </div>
            </div>
            
            <button
              onClick={onEdit}
              className="mt-4 mx-auto flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-full transition-all active:scale-95"
            >
              <Pencil className="w-4 h-4" /> 
              Change Name
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Live Preview
            </label>
            
            <div className="flex items-center gap-4 rounded-xl bg-emerald-50 border-2 border-emerald-100 p-4">
              <div className="bg-emerald-500 p-2 rounded-lg shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-emerald-700 uppercase">Client Form</p>
                <p className="font-mono text-xs sm:text-sm font-semibold text-emerald-950 break-words leading-relaxed">
                  lead2project.com/<span className="font-bold underline decoration-emerald-300">{slug}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl bg-blue-50 border-2 border-blue-100 p-4">
              <div className="bg-blue-500 p-2 rounded-lg shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-blue-700 uppercase">Private Dashboard</p>
                <p className="font-mono text-xs sm:text-sm font-semibold text-blue-950 break-words leading-relaxed">
                  lead2project.com/{slug}/<span className="font-bold">dashboard</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-gray-50 p-4 border border-gray-100">
            <Info className="w-5 h-5 text-gray-400 shrink-0" />
            <p className="text-xs font-medium text-gray-500 leading-relaxed">
              <span className="text-gray-900 font-bold">Pro-tip:</span> Spaces are turned into dashes. &quot;Blue Line&quot; → &quot;blue-line&quot;
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 sm:rounded-b-2xl">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-lg shadow-blue-200 transition-all active:scale-[0.97] touch-manipulation"
          >
            Confirm & Create Workspace
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="h-[env(safe-area-inset-bottom)] sm:hidden" />
        </div>
      </div>
    </div>
  );
}