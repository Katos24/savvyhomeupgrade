'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  LayoutGrid, Calendar, LogOut, X,
  User, Users as UsersIcon,
  ChevronRight, ChevronsLeft, ChevronsRight,
  DollarSign, Settings, ListChecks, Wrench, FileText, Sun, Moon,
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
  // Kept so existing callers don't break. The sidebar intentionally
  // ignores brand colors: dark brand colors disappear on the dark
  // background, and brand colors belong on customer-facing pages.
  brandColor1?: string;
  brandColor2?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

type NavItem = { href: string; icon: any; label: string; exactMatch: boolean; view?: 'services' | 'form' };

export default function Sidebar({
  companySlug,
  companyName,
  companyLogoUrl,
  currentUser,
  onLogout,
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Light / dark for the whole app. Same saved key + event the pages use.
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const read = () => {
      try { setIsDark(localStorage.getItem('dashboard-theme') !== 'light'); } catch {}
    };
    read();
    window.addEventListener('theme-changed', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('theme-changed', read);
      window.removeEventListener('storage', read);
    };
  }, []);
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem('dashboard-theme', next ? 'dark' : 'light'); } catch {}
    window.dispatchEvent(new Event('theme-changed'));
  };
  const currentView = searchParams?.get('view');

  // Services and Booking form share one page (?view=services / ?view=form).
  const isActive = (item: NavItem) => {
    const path = item.href.split('?')[0];
    if (item.view) {
      if (!pathname.includes(path)) return false;
      return item.view === 'form' ? currentView === 'form' : currentView !== 'form';
    }
    if (item.exactMatch) return pathname === path;
    return pathname.includes(path);
  };

  // Grouped by how often they're used: daily work, money & people, then
  // one-time setup. A thin divider separates groups (labels when expanded).
  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: 'Work',
      items: [
        { href: `/${companySlug}/dashboard`,           icon: LayoutGrid, label: 'Dashboard', exactMatch: true },
        { href: `/${companySlug}/leads`,               icon: ListChecks, label: 'Leads',     exactMatch: false },
        { href: `/${companySlug}/dashboard/calendar`,  icon: Calendar,   label: 'Calendar',  exactMatch: false },
      ],
    },
    {
      title: 'Money & customers',
      items: [
        { href: `/${companySlug}/dashboard/financials`, icon: DollarSign, label: 'Financials', exactMatch: false },
        { href: `/${companySlug}/dashboard/customers`,  icon: UsersIcon,  label: 'Customers',  exactMatch: false },
      ],
    },
    {
      title: 'Setup',
      items: [
        { href: `/${companySlug}/dashboard/services?view=services`, icon: Wrench,   label: 'Services',     exactMatch: false, view: 'services' },
        { href: `/${companySlug}/dashboard/services?view=form`,     icon: FileText, label: 'Booking form', exactMatch: false, view: 'form' },
        { href: `/${companySlug}/home`,               icon: Settings, label: 'Settings',     exactMatch: true },
      ],
    },
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

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item);

    // Collapsed: icon with a small label underneath, so nothing needs a hover.
    if (collapsed) {
      return (
        <Link
          key={item.href}
          href={item.href}
          title={item.label}
          aria-current={active ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 rounded-xl border px-1 py-2 transition-colors ${
            active
              ? 'border-slate-700 bg-slate-800/70 text-white'
              : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-white'
          }`}
        >
          <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-teal-400' : ''}`} />
          <span className="w-full truncate text-center text-[10px] font-medium leading-tight">{item.label}</span>
        </Link>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={`relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
          active
            ? 'border-slate-700 bg-slate-800/70 text-white'
            : 'border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-white'
        }`}
      >
        {active && <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-teal-400" />}
        <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? 'text-teal-400' : ''}`} />
        <span className="flex-1">{item.label}</span>
        {active && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-20 bg-slate-950/80 transition-opacity duration-200 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-30 flex h-full transform-gpu flex-col border-r border-slate-800/80 bg-[#0f1117] transition-[transform,width] duration-200 ease-out lg:sticky lg:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[84px]' : 'w-60'}`}
      >
        {/* Header */}
        <div className={`shrink-0 border-b border-slate-800/60 ${collapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'justify-between gap-2'}`}>
            <div className={`flex min-w-0 items-center gap-2.5 ${collapsed ? '' : 'flex-1'}`}>
              {companyLogoUrl ? (
                // White tile so dark logos (black text on transparent) stay visible.
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-white p-1 shadow-sm">
                  <img src={companyLogoUrl} alt={companyName} className="max-h-7 w-auto object-contain" />
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-base font-black text-white shadow-sm">
                  {companyName.charAt(0)}
                </div>
              )}

              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-tight text-white">{companyName}</p>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-slate-500">Workspace</p>
                </div>
              )}
            </div>

            {onToggleCollapse ? (
              <button
                onClick={onToggleCollapse}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
              </button>
            ) : (
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto py-4 ${collapsed ? 'px-2' : 'px-3'}`} aria-label="Main">
          {groups.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? 'mt-4 border-t border-slate-800/70 pt-4' : ''}>
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{group.title}</p>
              )}
              <div className="space-y-1">{group.items.map(renderItem)}</div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className={`shrink-0 border-t border-slate-800/60 ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`}>
          {currentUser && (
            <div className="space-y-2">
              {/* Theme: a small two-option switch, so it doesn't look like a page link */}
              {collapsed ? (
                <div className="flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-colors hover:border-slate-500 hover:text-white"
                  >
                    {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between px-1 pb-1">
                  <span className="text-[11px] font-medium text-slate-500">Theme</span>
                  <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/80 p-0.5" role="group" aria-label="Theme">
                    {([
                      { dark: false, Icon: Sun, label: 'Light' },
                      { dark: true, Icon: Moon, label: 'Dark' },
                    ] as const).map(({ dark, Icon, label }) => {
                      const on = isDark === dark;
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => { if (!on) toggleTheme(); }}
                          aria-pressed={on}
                          title={`${label} mode`}
                          className={`flex h-6 w-8 items-center justify-center rounded-full transition-colors ${
                            on ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="sr-only">{label} mode</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <Link
                href={`/${companySlug}/profile`}
                title={collapsed ? currentUser?.name : undefined}
                className={`group flex items-center rounded-xl border border-slate-800 bg-slate-900/80 transition-colors hover:border-slate-700 ${
                  collapsed ? 'justify-center p-2' : 'gap-3 p-2.5'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                {!collapsed && (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-white">{currentUser?.name}</p>
                      <p className="truncate text-[10px] text-slate-400">{currentUser?.email}</p>
                    </div>
                    <User className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300" />
                  </>
                )}
              </Link>

              <button
                onClick={() => { onLogout(); onClose(); }}
                title={collapsed ? 'Sign out' : undefined}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-2.5 text-xs font-bold text-red-400 transition-colors hover:bg-red-500/20 ${
                  collapsed ? 'flex-col gap-1' : 'uppercase tracking-wider'
                }`}
              >
                <LogOut className="h-3.5 w-3.5" />
                {collapsed ? <span className="text-[10px] font-medium normal-case tracking-normal">Sign out</span> : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}