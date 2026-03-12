'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutGrid, Table2, Calendar, Settings, LogOut, X, User, BarChart3, Mail, Users as UsersIcon, ChevronRight } from 'lucide-react';

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
  onViewChange
}: SidebarProps) {
  const pathname = usePathname();
  
  const isActive = (path: string, exactMatch: boolean = false) => {
    if (exactMatch) return pathname === path;
    return pathname.includes(path);
  };

  const navItems = [
    { href: `/${companySlug}/dashboard`, icon: LayoutGrid, label: 'Dashboard', exactMatch: true, color: '#60a5fa' },
    { href: `/${companySlug}/dashboard/customers`, icon: UsersIcon, label: 'Customers', exactMatch: false, color: '#fbbf24' },
    { href: `/${companySlug}/dashboard/analytics`, icon: BarChart3, label: 'Analytics', exactMatch: false, color: '#a78bfa' },
    { href: `/${companySlug}/dashboard/calendar`, icon: Calendar, label: 'Calendar', exactMatch: false, color: '#4ade80' },
    { href: `/${companySlug}/outbox`, icon: Mail, label: 'Outbox', exactMatch: false, color: '#f97316' },
    { href: `/${companySlug}/admin/settings`, icon: Settings, label: 'Settings', exactMatch: false, color: '#c084fc' },
  ];

  // Logic to handle body lock and navigation
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <>
      {/* 1. Improved Backdrop: Smoother blur and darker tint */}
      <div 
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] transition-all duration-500 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose} 
      />

      {/* 2. Moored Sidebar: Premium Gradient and Flex layout */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-[280px] bg-slate-900 border-r border-white/5 flex flex-col z-[110] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 ${
        isOpen ? 'translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]' : '-translate-x-full'
      }`}>
        
        {/* Header: Centered on mobile, better logo handling */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              {companyLogoUrl ? (
                <img src={companyLogoUrl} alt="Logo" className="h-9 w-9 object-contain rounded-lg" />
              ) : (
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                  {companyName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-white font-black text-lg tracking-tight truncate leading-none uppercase">{companyName}</h2>
                <span className="text-indigo-400 text-[10px] font-bold tracking-[0.2em] uppercase">Enterprise</span>
              </div>
            </Link>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition lg:hidden">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation: Better touch targets (48px+) */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 mt-2">Main Menu</p>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exactMatch);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-300 ${active ? 'text-white' : 'group-hover:text-white'}`} 
                    style={{ color: !active ? item.color : undefined }}
                  />
                  <span className="font-bold text-[15px]">{item.label}</span>
                </div>
                {active && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* User & Settings Section: Improved footer with Logout UI */}
        <div className="p-4 bg-slate-950/50 backdrop-blur-xl border-t border-white/5">
          {currentUser && (
            <div className="space-y-3">
              <Link
                href={`/${companySlug}/profile`}
                className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-indigo-500 transition-colors">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{currentUser?.name || 'Admin User'}</p>
                  <p className="text-slate-500 text-[11px] truncate font-medium">{currentUser?.email}</p>
                </div>
              </Link>
              
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-black transition-all border border-red-500/10 text-xs flex items-center justify-center gap-2 uppercase tracking-widest active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4 stroke-[3px]" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}