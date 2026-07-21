'use client';
import { Menu, Plus, Lock, Loader2, RefreshCw, Eye, Home } from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
import { useState } from 'react';



// Picks readable text color against an arbitrary background color
function getContrastTextColor(input: string): string {
  let c = input.trim().replace('#', '');

  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return '#0f172a';
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0f172a' : '#ffffff';
}




export default function DashboardHeader({
  company,
  isDark,
  isRefreshing,
  planTier,
  onSidebarOpen,
  onCreateLead,
  onLockedFeature,
  onRefresh,
  onTestDrive,
  testDriveLoading = false,
  accentColor = '#2563eb', // matches the original bg-blue-600 default exactly
}: {
  company: { name: string; logo_url?: string | null; slug: string };
  isDark: boolean;
  isRefreshing: boolean;
  planTier: PlanTier;
  onSidebarOpen: () => void;
  onCreateLead: () => void;
  onLockedFeature: (key: string) => void;
  onRefresh: () => void;
  onTestDrive?: () => void;
  testDriveLoading?: boolean;
  accentColor?: string;
}) {
const buttonTextColor = getContrastTextColor(accentColor);
  const [newLeadHover, setNewLeadHover] = useState(false);

  return (
 <header
      className={`sticky top-3 z-50 rounded-2xl px-3 py-2.5 sm:px-5 sm:py-3 mb-5 transition-all backdrop-blur-xl overflow-hidden relative ${
        isDark
          ? 'bg-[#0A0C14]/80 border border-white/5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]'
          : 'bg-white/90 border border-slate-300 shadow-[0_4px_16px_rgba(0,0,0,0.03)]'
      }`}
      style={{ borderTop: `2.5px solid ${accentColor}` }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 opacity-[0.06]"
        style={{ background: `linear-gradient(180deg, ${accentColor}, transparent)` }}
      />
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            data-tour="sidebar-toggle"
            onClick={onSidebarOpen}
            className={`p-2 rounded-xl transition-all active:scale-90 shrink-0 ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
       <div className={`flex items-center gap-3 sm:gap-4 min-w-0 border-l pl-2.5 sm:pl-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            {company.logo_url ? (
              <div
                className="h-11 sm:h-16 w-11 sm:w-16 shrink-0 rounded-xl p-1 ring-2"
                style={{
                  '--tw-ring-color': `${accentColor}55`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                } as React.CSSProperties}
              >
                <img
                  src={company.logo_url}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : (
              <div
                className="flex h-11 w-11 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl font-bold text-lg sm:text-2xl ring-2"
                style={{
                  backgroundColor: `${accentColor}22`,
                  color: accentColor,
                  '--tw-ring-color': `${accentColor}55`,
                } as React.CSSProperties}
              >
                {company.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className={`text-base sm:text-lg font-bold tracking-tight truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {company.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: accentColor }} />
                <p className={`text-[10px] font-semibold uppercase tracking-wide truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live</p>
              </div>
            </div>
          </div>
        </div>

       <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh dashboard"
            className={`p-2 rounded-xl transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: accentColor }} />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </button>

          {onTestDrive && (
            <button
              onClick={onTestDrive}
              disabled={testDriveLoading}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all active:scale-95 disabled:opacity-50 ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
              }`}
            >
              {testDriveLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              See what customers see
            </button>
          )}

          {can(planTier, 'create_lead_manual') ? (
            <button
              data-tour="create-lead"
              onClick={onCreateLead}
              onMouseEnter={() => setNewLeadHover(true)}
              onMouseLeave={() => setNewLeadHover(false)}
              style={{
                backgroundColor: newLeadHover ? `${accentColor}3d` : `${accentColor}26`,
                border: `1px solid ${accentColor}${newLeadHover ? '80' : '59'}`,
                boxShadow: newLeadHover ? `0 4px 14px ${accentColor}40` : 'none',
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-sm transition-all duration-150 active:scale-95 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Lead</span>
            </button>
          ) : (
            <button
              onClick={() => onLockedFeature('create_lead')}
              className={`inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ${
                isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Lead</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}