'use client';

import { Sparkles } from 'lucide-react';

type AiBriefButtonProps = {
  hasSavedBrief: boolean;
  onClick: () => void;
};

export default function AiBriefButton({ hasSavedBrief, onClick }: AiBriefButtonProps) {
  if (hasSavedBrief) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all hover:opacity-90 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', // blue gradient
          color: 'white',
          boxShadow: '0 6px 16px rgba(37,99,235,0.35)',
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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:opacity-90 active:scale-95"
      style={{
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.35)',
        color: '#2563eb',
      }}
    >
      <Sparkles className="w-3 h-3" />
      AI Brief
    </button>
  );
}