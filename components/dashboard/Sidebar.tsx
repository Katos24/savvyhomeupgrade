'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutGrid, Calendar, Settings, LogOut, X,
  User, BarChart3, Mail, Users as UsersIcon,
  ChevronRight, Sparkles,
  DollarSign
} from 'lucide-react';

type SidebarProps = {
  companySlug: string;
  companyName: string;
  companyLogoUrl?: string | null;
  currentUser: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  currentView?: 'cards' | 'table' | 'calendar';
  onViewChange?: (view: 'cards' | 'table') => void;
};

export default function Sidebar({
  companySlug,
  companyName,
  companyLogoUrl,
  currentUser,
  onLogout,
  isOpen,
  onClose,
  currentView = 'cards',
  onViewChange,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string, exactMatch = false) => {
    if (exactMatch) return pathname === path;
    return pathname.includes(path);
  };

  const navItems = [
    { href: `/${companySlug}/dashboard`,           icon: LayoutGrid, label: 'Dashboard', exactMatch: true,  color: '#818cf8' },
    { href: `/${companySlug}/dashboard/customers`, icon: UsersIcon,  label: 'Customers', exactMatch: false, color: '#fbbf24' },
{ href: `/${companySlug}/dashboard/analytics`, icon: BarChart3,  label: 'Analytics', exactMatch: false, color: '#a78bfa' },
{ href: `/${companySlug}/dashboard/financials`, icon: DollarSign, label: 'Financials', exactMatch: false, color: '#10b981' },
    { href: `/${companySlug}/dashboard/calendar`,  icon: Calendar,   label: 'Calendar',  exactMatch: false, color: '#34d399' },
    { href: `/${companySlug}/outbox`,              icon: Mail,       label: 'Outbox',    exactMatch: false, color: '#fb923c' },
    { href: `/${companySlug}/admin/settings`,      icon: Settings,   label: 'Settings',  exactMatch: false, color: '#94a3b8' },
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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[140] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 z-[150] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0f1117 0%, #0a0c10 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-5 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {companyLogoUrl ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <img
                    src={companyLogoUrl}
                    alt={companyName}
                    className="h-8 w-auto object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {companyName.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate leading-tight">
                  {companyName}
                </p>
                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-0.5">
                  Workspace
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dashboard Tour Quick Access */}
              <button
  onClick={() => {
    localStorage.removeItem(`tour-completed-${companySlug}`);
    onClose();
    // Navigate with tour param
    window.location.href = `/${companySlug}/dashboard?tour=1`;
  }}
  title="Replay Dashboard Tour"
  className="group relative p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
  style={{
    background: 'rgba(59,130,246,0.08)',
    border: '1px solid rgba(59,130,246,0.15)',
  }}
>
  <Sparkles className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />

  {/* Tooltip desktop only */}
  <span
    className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-all"
    style={{
      background: '#0f172a',
      color: '#ffffff',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
    }}
  >
    Dashboard Tour
  </span>
</button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 mb-3">
            Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exactMatch);
            const isSettings = item.label === 'Settings';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all group relative ${
                  active
                    ? 'text-white'
                    : isSettings
                    ? 'text-blue-400/80 hover:text-blue-300'
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
                style={
                  active
                    ? {
                        background: isSettings
                          ? 'rgba(56, 189, 248, 0.1)'
                          : 'rgba(99,102,241,0.12)',
                        border:
                          active && isSettings
                            ? '1px solid rgba(56, 189, 248, 0.2)'
                            : '1px solid rgba(99,102,241,0.2)',
                      }
                    : { border: '1px solid transparent' }
                }
              >
                {active && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: item.color }}
                  />
                )}

                <Icon
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={{ color: active ? item.color : undefined }}
                />

                <span
                  className={`flex-1 ${
                    !active && isSettings ? 'text-blue-400/90 font-bold' : ''
                  }`}
                >
                  {item.label}
                </span>

                {active && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div
          className="px-3 py-4 shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          {currentUser && (
            <div className="space-y-2">
              <Link
                href={`/${companySlug}/profile`}
                className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #27299f, #280e63)',
                  }}
                >
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-xs truncate">
                    {currentUser?.name}
                  </p>
                  <p className="text-slate-500 text-[10px] truncate">
                    {currentUser?.email}
                  </p>
                </div>

                <User className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-400 font-bold text-xs uppercase tracking-widest transition-all hover:text-red-300"
                style={{
                  background: 'rgba(239,68,68,0.06)',
                  border: '1px solid rgba(239,68,68,0.12)',
                }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}