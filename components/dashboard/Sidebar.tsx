'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import {
  LayoutGrid, Calendar, LogOut, X,
  User, Mail, Users as UsersIcon,
  ChevronRight, Sparkles,
  DollarSign, Home
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
  brandColor1?: string;
  brandColor2?: string;
};

function getContrastTextColor(input: string): string {
  let c = input.trim().replace('#', '');

  // Expand shorthand hex (#7e6 -> #77ee66)
  if (c.length === 3) {
    c = c.split('').map((ch) => ch + ch).join('');
  }

  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);

  // If parsing failed (NaN) or input wasn't a valid 6-digit hex, default to dark text —
  // safer fallback since most brand colors people pick tend to be mid-to-light.
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return '#0f172a';
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0f172a' : '#ffffff';
}

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
  brandColor1 = '#2563eb',
  brandColor2 = '#4f46e5',
}: SidebarProps) {


  const pathname = usePathname();

  const isActive = (path: string, exactMatch = false) => {
    if (exactMatch) return pathname === path;
    return pathname.includes(path);
  };

  const homeHref = `/${companySlug}/home`;
  const homeActive = isActive(homeHref, true);

  // Analytics and Settings removed — Settings now lives inside Home.
 const navItems = [
    { href: `/${companySlug}/dashboard`,            icon: LayoutGrid, label: 'Dashboard',  exactMatch: true,  color: null },
    { href: `/${companySlug}/dashboard/customers`,  icon: UsersIcon,  label: 'Customers',  exactMatch: false, color: '#fbbf24' },
    { href: `/${companySlug}/dashboard/financials`, icon: DollarSign, label: 'Financials', exactMatch: false, color: '#10b981' },
    { href: `/${companySlug}/dashboard/calendar`,   icon: Calendar,   label: 'Calendar',   exactMatch: false, color: '#34d399' },
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
                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                  <img
                    src={companyLogoUrl}
                    alt={companyName}
                    className="h-8 w-auto lg:h-11 object-contain"
                  />
                </div>
              ) : (
                <div
                  className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center text-white font-black text-lg lg:text-2xl shrink-0 shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
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

        {/* HOME — pulled out of the nav list as its own featured hub button,
            since it's conceptually different from the other pages (it now
            also holds Settings), not just another item in the list. */}
   <div className="px-3 pt-3 pb-2 shrink-0">
          <Link
            href={homeHref}
            className="relative flex items-center gap-2.5 overflow-hidden rounded-xl pl-4 pr-3 py-2.5 font-bold text-sm text-white shadow-lg transition-all hover:brightness-110 hover:scale-[1.015]"
            style={{
              background: `${brandColor1}26`,
              border: `1px solid ${brandColor1}59`,
              boxShadow: homeActive
                ? `0 4px 16px ${brandColor1}40`
                : `0 2px 10px ${brandColor1}22`,
            }}
          >
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
              style={{ background: brandColor1 }}
            />
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${brandColor1}33` }}
            >
              <Home className="h-4 w-4" style={{ color: brandColor1 }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="leading-tight">Home</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/70" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 mb-3">
            Navigation
          </p>

        {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exactMatch);
            const hasColor = !!item.color;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm transition-all group relative ${
                  active ? 'text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
               style={
                  active
                    ? hasColor
                      ? {
                          background: `${item.color}1f`,
                          border: `1px solid ${item.color}33`,
                        }
                      : { border: '1px solid transparent' }
                    : { border: '1px solid transparent' }
                }
              >
                {active && hasColor && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: item.color as string }}
                  />
                )}

                <Icon
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={{ color: active && hasColor ? (item.color as string) : undefined }}
                />

                <span className="flex-1">{item.label}</span>

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
                    background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})`,
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