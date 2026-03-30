'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };

export default function DemoAIButton({ showNudge, onToggle }: { showNudge: boolean; onToggle: () => void }) {
  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3">
      <AnimatePresence>
        {showNudge && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={spring}
            className="bg-white rounded-2xl shadow-2xl border border-indigo-100 p-4 w-64"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-0.5">AI Assistant</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Ask anything — "which leads need follow-up?", "what's my revenue this month?" Sign up to unlock.
                </p>
              </div>
            </div>
            <Link href="/signup" className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition">
              Try free <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.08 }}
        onClick={onToggle}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
        }}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}