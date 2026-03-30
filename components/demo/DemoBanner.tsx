'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, Sun, Moon } from 'lucide-react';

export default function DemoBanner({ darkMode, onToggleDark }: { darkMode: boolean; onToggleDark: () => void }) {
  return (
    <div className="bg-indigo-600 px-4 py-2.5 flex items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-1.5 text-indigo-200 hover:text-white text-xs font-bold transition shrink-0">
        <ArrowLeft className="w-3.5 h-3.5" /> Home
      </Link>
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-indigo-200 shrink-0" />
        <p className="text-sm font-bold text-white hidden sm:block">You're viewing a live demo — data resets on refresh</p>
        <p className="text-sm font-bold text-white sm:hidden">Live Demo</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleDark}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 rounded-lg text-white text-xs font-bold transition"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
        <Link href="/signup" className="px-4 py-1.5 bg-white text-indigo-600 text-xs font-black rounded-full hover:bg-indigo-50 transition">
          Start Free Trial →
        </Link>
      </div>
    </div>
  );
}