'use client';
import Link from 'next/link';
import { Zap, Settings, Plus } from 'lucide-react';
import { fmt } from '@/components/demo/types';

function TorresLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="#0f172a"/>
      <polygon points="20,7 33,17 33,34 7,34 7,17" fill="#6366f1"/>
      <polygon points="20,5 34,16 6,16" fill="#818cf8"/>
      <rect x="25" y="9" width="4" height="8" rx="1" fill="#818cf8"/>
      <rect x="15" y="23" width="10" height="11" rx="1.5" fill="#1e1b4b"/>
      <rect x="7" y="21" width="7" height="7" rx="1" fill="#1e1b4b"/>
      <line x1="10.5" y1="21" x2="10.5" y2="28" stroke="#6366f1" strokeWidth="1"/>
      <line x1="7" y1="24.5" x2="14" y2="24.5" stroke="#6366f1" strokeWidth="1"/>
    </svg>
  );
}

type Props = {
  darkMode: boolean;
  totalLeads: number;
  activeJobs: number;
  totalRevenue: number;
  pendingRevenue: number;
  onShowSettings: () => void;
  onCreateLead: () => void;
};

export default function DemoHeader({
  darkMode,
  totalLeads,
  activeJobs,
  totalRevenue,
  pendingRevenue,
  onShowSettings,
  onCreateLead,
}: Props) {
  const cardBg = darkMode ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textMuted = darkMode ? 'text-white/40' : 'text-gray-400';

  return (
    <>
      {/* Top bar */}
      <header className={`backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] px-4 py-3 sm:p-5 mb-6 border shadow-sm ${cardBg}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <TorresLogo size={36} />
            <div className={`border-l pl-3 ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              <h1 className={`text-sm sm:text-base font-black tracking-tight leading-none ${textPrimary}`}>
                Torres Roofing & Construction
              </h1>
              <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold block mt-1">
                Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onShowSettings}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${
                darkMode
                  ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Settings preview
            </button>
            <button
              onClick={onCreateLead}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-slate-900 hover:bg-blue-50 rounded-xl font-bold text-sm transition shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />
              <span className="hidden xs:inline">Create</span>
            </button>
           <Link
              href="/signup"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-lg"
            >
              <Zap className="w-4 h-4" /> Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Leads',       value: totalLeads,          sub: 'all time',         color: textPrimary        },
          { label: 'Active Jobs',       value: activeJobs,          sub: 'in pipeline',      color: 'text-blue-400'    },
          { label: 'Revenue Collected', value: fmt(totalRevenue),   sub: 'paid',             color: 'text-emerald-400' },
          { label: 'Pending',           value: fmt(pendingRevenue), sub: 'awaiting payment', color: 'text-amber-400'   },
        ].map((s, i) => (
          <div key={i} className={`border rounded-2xl px-4 py-4 ${cardBg}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${textMuted}`}>{s.label}</p>
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className={`text-[10px] mt-0.5 ${textMuted}`}>{s.sub}</p>
          </div>
        ))}
      </div>
    </>
  );
}