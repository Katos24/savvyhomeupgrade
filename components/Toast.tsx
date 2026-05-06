'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  darkText?: boolean; // Interface updated
}

// 1. Destructure darkText here
export default function Toast({ message, type, onClose, darkText }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 4000;
    const interval = 10;
    const step = (interval / duration) * 100;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - step));
    }, interval);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onClose]);

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
      bar: 'bg-emerald-500'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      border: 'border-red-500/20',
      bg: 'bg-red-500/5',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.1)]',
      bar: 'bg-red-500'
    },
    info: {
      icon: <Info className="w-5 h-5 text-indigo-400" />,
      border: 'border-indigo-500/20',
      bg: 'bg-indigo-500/5',
      glow: 'shadow-[0_0_20px_rgba(99,102,241,0.1)]',
      bar: 'bg-indigo-500'
    }
  };

  const current = config[type];

  return (
    <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-right-8 duration-500">
      <div className={`
        relative overflow-hidden min-w-[320px] max-w-md
        ${current.bg} ${current.border} ${current.glow}
        backdrop-blur-xl border rounded-2xl p-4 flex items-center gap-4
      `}>
        <div 
          className={`absolute bottom-0 left-0 h-[2px] transition-all linear ${current.bar}`}
          style={{ width: `${progress}%` }}
        />

        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
          {current.icon}
        </div>

        {/* 2. Text Content Update */}
        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 mb-0.5">
            System {type}
          </p>
          {/* We toggle text-white vs text-slate-900 based on darkText prop */}
          <p className={`text-sm font-bold tracking-tight leading-snug ${darkText ? 'text-slate-900' : 'text-white'}`}>
            {message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}