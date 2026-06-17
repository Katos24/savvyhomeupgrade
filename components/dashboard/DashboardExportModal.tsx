'use client';

import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardExportModal({
  isOpen,
  onClose,
  companySlug,
  isDark,
}: {
  isOpen: boolean;
  onClose: () => void;
  companySlug: string;
  isDark: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`relative rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl ${
              isDark ? 'bg-[#0A0C14] border border-white/10' : 'bg-white'
            }`}
          >
            <div className="flex justify-center mb-6 sm:hidden">
              <div className="w-12 h-1.5 rounded-full bg-slate-200" />
            </div>

            <div className="text-center mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                isDark ? 'bg-white/5' : 'bg-slate-50'
              }`}>
                <Download className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-700'}`} />
              </div>
              <h3 className={`text-lg font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Export Data
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Choose your export format
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`/api/company/${companySlug}/export-csv`}
                onClick={onClose}
                className={`flex items-start gap-4 w-full p-4 rounded-2xl border transition-all text-left ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-white/10' : 'bg-white border border-slate-200'
                }`}>
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-0.5">
                    Export All
                  </p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Full data export with all fields
                  </p>
                </div>
              </a>

              <a
                href={`/api/company/${companySlug}/export-csv?format=quickbooks`}
                onClick={onClose}
                className={`flex items-start gap-4 w-full p-4 rounded-2xl border transition-all text-left ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                    : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-900'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-white/10' : 'bg-white border border-slate-200'
                }`}>
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest mb-0.5">
                    QuickBooks Format
                  </p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Optimized for QuickBooks import
                  </p>
                </div>
              </a>
            </div>

            <button
              onClick={onClose}
              className={`w-full mt-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
                isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}