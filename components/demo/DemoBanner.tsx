'use client';

import Link from 'next/link';
import { ArrowLeft, Eye, Sun, Moon } from 'lucide-react';

// AFTER
export default function DemoBanner({ darkMode, onToggleDark }: { darkMode: boolean; onToggleDark: () => void }) {
  return (
    <div className="bg-indigo-600 px-3 py-2 flex items-center justify-between gap-2">
      <Link href="/" className="flex items-center gap-1 text-indigo-200 hover:text-white text-xs font-bold transition shrink-0">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      <div className="flex items-center gap-1.5 min-w-0">
        <Eye className="w-3.5 h-3.5 text-indigo-200 shrink-0" />
        <p className="text-xs font-bold text-white hidden sm:block truncate">You're viewing a live demo — data resets on refresh</p>
        <p className="text-xs font-bold text-white sm:hidden">Live Demo</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onToggleDark}
          className="p-1.5 bg-indigo-700 hover:bg-indigo-800 rounded-lg text-white transition"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
        <Link href="/signup" className="px-3 py-1.5 bg-white text-indigo-600 text-xs font-black rounded-full hover:bg-indigo-50 transition whitespace-nowrap">
          Get Started
        </Link>
      </div>
    </div>
  );
}