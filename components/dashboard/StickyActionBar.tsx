'use client';

import { Loader2, Send } from 'lucide-react';
import { motion } from 'framer-motion';

type Props = {
  summary: string;
  primaryLabel: string;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  onPrimary: () => void;
  secondaryLabel?: string;
  secondaryDisabled?: boolean;
  onSecondary?: () => void;
};

export default function StickyActionBar({
  summary,
  primaryLabel,
  primaryLoading = false,
  primaryDisabled = false,
  onPrimary,
  secondaryLabel,
  secondaryDisabled = false,
  onSecondary,
}: Props) {
  return (
   <div className="sticky bottom-0 z-10 bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-end gap-2">
  <div className="flex items-center gap-2">
        {secondaryLabel && onSecondary && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSecondary}
            disabled={secondaryDisabled}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 text-[11px] font-black uppercase tracking-widest transition-all hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{secondaryLabel}</span>
            <span className="sm:hidden">Send</span>
          </motion.button>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onPrimary}
          disabled={primaryDisabled || primaryLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
        >
          {primaryLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {primaryLabel}
        </motion.button>
      </div>
    </div>
  );
}