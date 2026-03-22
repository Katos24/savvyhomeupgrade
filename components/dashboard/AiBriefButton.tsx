'use client';

import { Sparkles } from 'lucide-react';

type AiBriefButtonProps = {
  hasSavedBrief: boolean;
  onClick: () => void;
};

/**
 * Small chip in the LeadModal hero header.
 * Clicking jumps the user to the AI Brief tab.
 * Shows a ✓ and slightly brighter style when a brief is already saved.
 */
export default function AiBriefButton({ hasSavedBrief, onClick }: AiBriefButtonProps) {
  if (hasSavedBrief) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-black transition-all hover:opacity-90 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: 'white',
          boxShadow: '0 0 12px rgba(124,58,237,0.4)',
        }}
      >
        <Sparkles className="w-3 h-3" />
        AI Brief ✓
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition-all hover:opacity-80 active:scale-95"
      style={{
        background: 'rgba(167,139,250,0.12)',
        border: '1px solid rgba(167,139,250,0.35)',
        color: 'rgba(196,181,253,0.75)',
      }}
    >
      <Sparkles className="w-3 h-3" />
      AI Brief
    </button>
  );
}