'use client';
import { Menu, Plus, Lock, Loader2, RefreshCw, Eye } from 'lucide-react';
import { can, type PlanTier } from '@/lib/permissions';
import { useState, useEffect } from 'react';

// Checks if color is dark (luminance < 0.5)
function checkIsColorDark(input: string): boolean {
  let c = input.trim().replace('#', '');

  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return false;
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance <= 0.5;
}

// Intelligent safe accent color for pure black / dark colors to avoid clashing
function getSafeAccentColor(input: string, isDark: boolean): string {
  let c = input.trim().replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return isDark ? '#3b82f6' : '#2563eb';
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Fallback for dark or near-black accent colors in dark mode to prevent clashing/blending
  if (luminance < 0.08) {
    return isDark ? '#60a5fa' : '#1e293b';
  }
  return input;
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
  accentColor = '#2563eb',
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
  const [newLeadHover, setNewLeadHover] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const safeAccent = getSafeAccentColor(accentColor, isDark);
  const isAccentDark = checkIsColorDark(safeAccent);

  // Track scrolling for "condense" effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Border logic for the primary button
  const getButtonBorder = () => {
    if (isAccentDark) {
      return newLeadHover 
        ? '1px solid rgba(255, 255, 255, 0.45)' 
        : '1px solid rgba(255, 255, 255, 0.25)';
    }
    return `1px solid ${safeAccent}${newLeadHover ? '80' : '59'}`;
  };

  return (
    <header
      className={`sticky z-50 transition-all duration-300 ease-in-out backdrop-blur-xl overflow-hidden relative border flex items-center justify-between gap-2 sm:gap-3
        ${isScrolled 
          ? 'top-2 mx-0 sm:mx-2 rounded-2xl px-3 py-1.5 mb-4 shadow-[0_4px_16px_rgba(0,0,0,0.1)]' 
          : 'top-4 mx-0 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 mb-8 shadow-sm'
        }
        ${isDark
          ? `bg-[#0A0C14]/${isScrolled ? '90' : '60'} border-white/5`
          : `bg-white/${isScrolled ? '95' : '80'} border-slate-200/80`
      }`}
      style={{ borderTop: `2px solid ${safeAccent}${isScrolled ? '80' : 'ff'}` }}
    >
      {/* Subtle top glow */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 transition-all duration-500 ${isScrolled ? 'h-8 opacity-[0.03]' : 'h-16 opacity-[0.06]'}`}
        style={{ background: `linear-gradient(180deg, ${safeAccent}, transparent)` }}
      />

      {/* LEFT SIDE: Brand & Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          data-tour="sidebar-toggle"
          onClick={onSidebarOpen}
          className={`p-2 rounded-xl transition-all active:scale-90 shrink-0 ${
            isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
          }`}
        >
          <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <div className={`flex items-center gap-3 border-l transition-all duration-300 ${isScrolled ? 'pl-2 sm:pl-3' : 'pl-3 sm:pl-4'} ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          
          {/* LOGO: Shrinks smoothly on scroll */}
          {company.logo_url ? (
            <div
              className={`shrink-0 transition-all duration-300 object-contain flex items-center justify-center p-0.5 rounded-lg border ${
                isScrolled ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-9 w-9 sm:h-11 sm:w-11'
              } ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-xs'}`}
            >
              <img src={company.logo_url} alt="Logo" className="max-h-full max-w-full rounded-md object-contain" />
            </div>
          ) : (
            <div
              className={`flex shrink-0 items-center justify-center font-bold transition-all duration-300 rounded-lg ${
                isScrolled ? 'h-7 w-7 sm:h-8 sm:w-8 text-sm' : 'h-9 w-9 sm:h-11 sm:w-11 text-lg'
              }`}
              style={{ backgroundColor: `${safeAccent}15`, color: safeAccent }}
            >
              {company.name.charAt(0)}
            </div>
          )}

          {/* TEXT: Tightens up on scroll */}
          <div className="min-w-0">
            <h1 className={`font-bold tracking-tight truncate transition-all duration-300 ${
              isDark ? 'text-white' : 'text-slate-900'
            } ${isScrolled ? 'text-sm sm:text-base leading-none' : 'text-base sm:text-lg leading-tight'}`}>
              {company.name}
            </h1>
            <div className={`flex items-center gap-1.5 transition-all duration-300 overflow-hidden ${isScrolled ? 'h-0 opacity-0 mt-0' : 'h-4 opacity-100 mt-0.5'}`}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: safeAccent }} />
              <p className={`text-[10px] font-bold uppercase tracking-wider truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Live Database
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh dashboard"
          className={`p-2 rounded-xl transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
          }`}
        >
          {isRefreshing ? (
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: safeAccent }} />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>

        {/* EYE BUTTON: Text hides on scroll to save space */}
        {onTestDrive && (
          <button
            onClick={onTestDrive}
            disabled={testDriveLoading}
            className={`hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 ${
              isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700'
            }`}
          >
            {testDriveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            {/* Collapse text smoothly when scrolled */}
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isScrolled ? 'w-0 opacity-0 max-w-0' : 'w-auto opacity-100 max-w-[150px]'}`}>
              See what customers see
            </span>
          </button>
        )}

        {/* PRIMARY BUTTON: Scales down slightly on scroll */}
        {can(planTier, 'create_lead_manual') ? (
          <button
            data-tour="create-lead"
            onClick={onCreateLead}
            onMouseEnter={() => setNewLeadHover(true)}
            onMouseLeave={() => setNewLeadHover(false)}
            style={{
              backgroundColor: newLeadHover ? `${safeAccent}3d` : `${safeAccent}26`,
              border: getButtonBorder(),
              boxShadow: newLeadHover ? `0 4px 14px ${safeAccent}40` : 'none',
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all duration-200 active:scale-95 ${
              isDark ? 'text-white' : 'text-slate-900'
            } ${isScrolled ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm'}`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        ) : (
          <button
            onClick={() => onLockedFeature('create_lead')}
            className={`inline-flex items-center gap-1.5 rounded-xl font-bold transition-all active:scale-95 ${
              isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
            } ${isScrolled ? 'px-3 py-1.5 text-xs sm:text-sm' : 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm'}`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Lead</span>
          </button>
        )}
      </div>
    </header>
  );
}