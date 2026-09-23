'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  LayoutGrid, Calendar, LogOut, X,
  User, Users as UsersIcon,
  ChevronRight, ChevronsLeft, ChevronsRight, Sparkles,
  DollarSign, Settings, ListChecks, Wrench
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
  collapsed?: boolean;
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

  // Real cause of the tooltip being invisible: <nav> below has
  // overflow-y-auto, and per the CSS spec, that forces overflow-x to
  // also compute as "auto" — clipping the tooltip since it's positioned
  // outside nav's own width. Rendering it here, at the <aside> level
  // (no overflow set), sidesteps that clipping entirely. Position is
  // tracked via a plain ref + getBoundingClientRect on hover, since a
  // CSS-only group-hover tooltip can't escape its scrolling ancestor.
  const [hoveredTooltip, setHoveredTooltip] = useState<{ label: string; top: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const showTooltip = (e: React.MouseEvent, label: string) => {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({ label, top: rect.top + rect.height / 2 });
  };
  const hideTooltip = () => setHoveredTooltip(null);

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
    { href: `/${companySlug}/dashboard`,            icon: LayoutGrid, label: 'Dashboard',  exactMatch: true,  color: '#6366f1' },
    { href: `/${companySlug}/leads`,                icon: ListChecks, label: 'Leads',      exactMatch: false, color: '#38bdf8' },
    { href: `/${companySlug}/dashboard/calendar`,   icon: Calendar,   label: 'Calendar',   exactMatch: false, color: '#34d399' },
    { href: `/${companySlug}/dashboard/customers`,  icon: UsersIcon,  label: 'Customers',  exactMatch: false, color: '#fbbf24' },
       { href: `/${companySlug}/dashboard/financials`, icon: DollarSign, label: 'Financials', exactMatch: false, color: '#10b981' },
    { href: `/${companySlug}/dashboard/services`,   icon: Wrench,     label: 'Services & Form',   exactMatch: false, color: '#f59e0b' },
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
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/80 z-20 transition-opacity duration-200 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky left-0 top-0 h-full lg:h-screen z-30 flex flex-col bg-[#0f1117] border-r border-slate-800/80 transform-gpu transition-[transform,width] duration-200 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-[72px]' : 'w-60'}`}
      >
        {/* Brand Accent Top Stripe */}
        <div
          className="h-1 w-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${brandColor1}, ${brandColor2})` }}
        />

        {/* Header */}
        <div className={`shrink-0 border-b border-slate-800/60 ${collapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
          <div className={`flex items-center ${collapsed ? 'flex-col gap-3' : 'justify-between gap-2'}`}>
            <div className={`flex items-center gap-2.5 min-w-0 ${collapsed ? '' : 'flex-1'}`}>
              {companyLogoUrl ? (
                <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 shadow-sm">
                  <img src={companyLogoUrl} alt={companyName} className="h-7 w-auto object-contain" />
                </div>
              ) : (
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-base shrink-0 shadow-md"
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
                  className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 transition-colors hover:bg-blue-500/20 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              )}

              {onToggleCollapse ? (
                <button
                  onClick={onToggleCollapse}
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav ref={navRef} className={`flex-1 overflow-y-auto py-4 space-y-1.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {!collapsed && (
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-3 mb-2">Navigation</p>
          )}

                  {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exactMatch);
            const itemColor = item.color || brandColor1;

            return (
                           <Link
                key={item.href}
                href={item.href}
                onMouseEnter={(e) => showTooltip(e, item.label)}
                onMouseLeave={hideTooltip}
                className={`relative flex items-center rounded-xl font-semibold text-sm transition-all ${
                  collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
                } ${active ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
                style={
                  active
                    ? {
                        backgroundColor: `${itemColor}1a`,
                        border: `1px solid ${itemColor}40`,
                      }
                    : { border: '1px solid transparent' }
                }
              >
                {/* Active Left Indicator Bar */}
                {active && !collapsed && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{ backgroundColor: itemColor }}
                  />
                )}

                <Icon
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={{ color: active ? itemColor : undefined }}
                />

                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <ChevronRight
                        className="w-3.5 h-3.5"
                        style={{ color: itemColor }}
                      />
                    )}
                  </>
                )}

             
              </Link>
            );
          })}

                   <Link
            href={homeHref}
            onMouseEnter={(e) => showTooltip(e, 'Settings')}
            onMouseLeave={hideTooltip}
            className={`relative flex items-center rounded-xl font-semibold text-sm transition-all ${
              collapsed ? 'justify-center py-3' : 'gap-3 px-3 py-2.5'
            } ${homeActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'}`}
            style={
              homeActive
                ? {
                    backgroundColor: `${brandColor1}1a`,
                    border: `1px solid ${brandColor1}40`,
                  }
                : { border: '1px solid transparent' }
            }
          >
            {homeActive && !collapsed && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                style={{ backgroundColor: brandColor1 }}
              />
            )}
                      <Settings className="w-4 h-4 shrink-0" style={{ color: homeActive ? brandColor1 : undefined }} />
            {!collapsed && (
              <>
                <span className="flex-1">Settings</span>
                {homeActive && <ChevronRight className="w-3.5 h-3.5" style={{ color: brandColor1 }} />}
              </>
            )}
          
          </Link>
                </nav>

        {/* Rendered here, outside <nav>'s clipping overflow context —
            fixed positioning means this floats above everything,
            correctly placed via the hovered item's real screen
            coordinates rather than CSS-relative positioning. */}
        {hoveredTooltip && (
                   <div
            className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white shadow-lg"
            style={{ left: 'calc(72px + 12px)', top: hoveredTooltip.top }}
          >
            {hoveredTooltip.label}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
          </div>
        )}

        {/* User Footer */}
        <div className={`shrink-0 border-t border-slate-800/60 ${collapsed ? 'px-2 py-3' : 'px-3 py-4'}`}>
          {currentUser && (
            <div className="space-y-2">
              <Link
                href={`/${companySlug}/profile`}
                title={collapsed ? currentUser?.name : undefined}
                className={`flex items-center rounded-xl bg-slate-900/80 border border-slate-800 transition-colors group ${
                  collapsed ? 'justify-center p-2' : 'gap-3 p-2.5'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${brandColor1}, ${brandColor2})` }}
                >
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-xs truncate">{currentUser?.name}</p>
                      <p className="text-slate-400 text-[10px] truncate">{currentUser?.email}</p>
                    </div>
                    <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
                  </>
                )}
              </Link>

              <button
                onClick={() => { onLogout(); onClose(); }}
                title={collapsed ? 'Sign Out' : undefined}
                className={`w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-xs uppercase tracking-wider transition-colors hover:bg-red-500/20 ${
                  collapsed ? 'py-2.5' : 'py-2.5'
                }`}
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