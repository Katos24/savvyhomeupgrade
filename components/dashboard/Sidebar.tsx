'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutGrid, Calendar, LogOut, X,
  User, Mail, Users as UsersIcon,
  ChevronRight, ChevronsLeft, ChevronsRight, Sparkles,
  DollarSign, Settings, ListChecks
} from 'lucide-react';

type SidebarProps = {
  companySlug: string;
  companyName: string;
  companyLogoUrl?: string | null;
  currentUser: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  currentView?: 'cards' | 'table';
    onViewChange?: (view: 'cards' | 'table') => void;
  brandColor1?: string;
  brandColor2?: string;
  /** Desktop-only slim mode. Left undefined/false for the mobile drawer
   *  instance — collapsing a full-screen overlay doesn't make sense there. */
  collapsed?: boolean;
  /** Presence of this (not just its value) is what decides whether the
   *  header shows a collapse toggle (desktop) or a close X (mobile). */
  onToggleCollapse?: () => void;
};

export default function Sidebar({
  companySlug,
  companyName,
  companyLogoUrl,
  currentUser,
  onLogout,
  isOpen,
  onClose,
  brandColor1 = '#2563eb',
  brandColor2 = '#4f46e5',
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string, exactMatch = false) => {
    if (exactMatch) return pathname === path;
    return pathname.includes(path);
  };

  const homeHref = `/${companySlug}/home`;
  const homeActive = isActive(homeHref, true);

  const navItems: Array<{
    href: string;
    icon: any;
    label: string;
    exactMatch: boolean;
    color: string | null;
  }> = [
    { href: `/${companySlug}/dashboard`,            icon: LayoutGrid, label: 'Dashboard',  exactMatch: true,  color: null },
    { href: `/${companySlug}/leads`,                icon: ListChecks, label: 'Leads',      exactMatch: false, color: '#38bdf8' },
        { href: `/${companySlug}/dashboard/calendar`,   icon: Calendar,   label: 'Calendar',   exactMatch: false, color: '#34d399' },

    { href: `/${companySlug}/dashboard/customers`,  icon: UsersIcon,  label: 'Customers',  exactMatch: false, color: '#fbbf24' },
    { href: `/${companySlug}/dashboard/financials`, icon: DollarSign, label: 'Financials', exactMatch: false, color: '#10b981' },
    { href: `/${companySlug}/outbox`,               icon: Mail,       label: 'Outbox',     exactMatch: false, color: '#fb923c' },
  ];

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    onClose();
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop only — desktop pinned instance never renders this
          (isOpen stays true, but this div is lg:hidden regardless). */}
      <div
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-20 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky left-0 top-0 h-full lg:h-screen z-30 flex flex-col transition-[transform,width] duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[72px]' : 'w-60'}`}
        style={{
          background: 'linear-gradient(180deg, #0f1117 0%, #0a0c10 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div
          className={`shrink-0 ${collapsed ? 'px-2 py-4' : 'px-4 py-5'}`}
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'justify-between gap-2'}`}>
            <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? '' : 'flex-1'}`}>
              {companyLogoUrl ? (
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <img src={companyLogoUrl} alt={companyName} className="h-7 w-auto object-contain" />
                </div>
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-base shrink-0 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
                >
                  {companyName.charAt(0)}
                </div>
              )}

              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate leading-tight">{companyName}</p>
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Workspace</p>
                </div>
              )}
            </div>

            <div className={`flex items-center gap-1.5 ${collapsed ? '' : 'shrink-0'}`}>
              {!collapsed && (
                <button
                  onClick={() => {
                    localStorage.removeItem(`tour-completed-${companySlug}`);
                    onClose();
                    window.location.href = `/${companySlug}/dashboard?tour=1`;
                  }}
                  title="Replay Dashboard Tour"
                  className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95"
                  style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                </button>
              )}

              {/* Collapse toggle (desktop) vs. close X (mobile) — distinguished
                  by whether onToggleCollapse was passed at all, not by a
                  breakpoint check, since these are two separate component
                  instances rendered by CompanyShell. */}
              {onToggleCollapse ? (
                <button
                  onClick={onToggleCollapse}
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto py-4 space-y-1.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {!collapsed && (
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 mb-2">Navigation</p>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exactMatch);
            const hasColor = !!item.color;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl font-semibold text-sm transition-all relative ${
                  collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-3'
                } ${active ? 'text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                style={
                  active
                    ? hasColor
                      ? { background: `${item.color}1f`, border: `1px solid ${item.color}33` }
                      : { border: '1px solid transparent' }
                    : { border: '1px solid transparent' }
                }
              >
                {active && hasColor && !collapsed && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: item.color as string }} />
                )}
                <Icon className="w-4 h-4 shrink-0" style={{ color: active && hasColor ? (item.color as string) : undefined }} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                  </>
                )}
              </Link>
            );
          })}

          <Link
            href={homeHref}
            title={collapsed ? 'Settings' : undefined}
            className={`flex items-center rounded-xl font-semibold text-sm transition-all relative ${
              collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-3'
            } ${homeActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            style={
              homeActive
                ? { background: `${brandColor1}1f`, border: `1px solid ${brandColor1}33` }
                : { border: '1px solid transparent' }
            }
          >
            {homeActive && !collapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: brandColor1 }} />
            )}
            <Settings className="w-4 h-4 shrink-0" style={{ color: homeActive ? brandColor1 : undefined }} />
            {!collapsed && (
              <>
                <span className="flex-1">Settings</span>
                {homeActive && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
              </>
            )}
          </Link>
        </nav>

        {/* User Section */}
        <div className={`shrink-0 ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {currentUser && (
            <div className="space-y-2">
              <Link
                href={`/${companySlug}/profile`}
                title={collapsed ? currentUser?.name : undefined}
                className={`flex items-center rounded-xl transition-all group ${collapsed ? 'justify-center p-2' : 'gap-3 p-3'}`}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
                >
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-xs truncate">{currentUser?.name}</p>
                      <p className="text-slate-500 text-[10px] truncate">{currentUser?.email}</p>
                    </div>
                    <User className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </>
                )}
              </Link>

              <button
                onClick={() => { onLogout(); onClose(); }}
                title={collapsed ? 'Sign Out' : undefined}
                className={`w-full flex items-center justify-center gap-2 rounded-xl text-red-400 font-bold text-xs uppercase tracking-widest transition-all hover:text-red-300 ${
                  collapsed ? 'py-2.5' : 'py-2.5'
                }`}
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}
              >
                <LogOut className="w-3.5 h-3.5" />
                {!collapsed && 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}