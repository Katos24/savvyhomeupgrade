'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutGrid, Table2, Calendar, Settings, LogOut, X, User, BarChart3, Mail, Users as UsersIcon } from 'lucide-react';

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

  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[140] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose} 
      />

      {/* Sidebar Container */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-[280px] bg-slate-900 border-r border-white/10 flex flex-col z-[150] transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header - Fixed */}
        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-indigo-600/20">
                {companyName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-sm truncate uppercase tracking-tight">{companyName}</h2>
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.1em]">Admin</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg lg:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto flex flex-col p-4 space-y-6">
          
          {/* View Mode Toggle - Only on Dashboard Page AND ONLY visible on Mobile (lg:hidden) */}
          {pathname === `/${companySlug}/dashboard` && onViewChange && (
            <div className="px-2 lg:hidden">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-3 block">View Layout</label>
              <div className="relative bg-slate-950 p-1 rounded-2xl flex items-center border border-white/5">
                {/* Sliding Background */}
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-xl transition-all duration-300 ease-out shadow-lg ${
                    currentView === 'table' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'
                  }`}
                />
                
                <button
                  onClick={() => onViewChange('cards')}
                  className={`relative flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold transition-colors duration-300 z-10 ${
                    currentView === 'cards' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Cards
                </button>
                
                <button
                  onClick={() => onViewChange('table')}
                  className={`relative flex-1 py-2.5 flex items-center justify-center gap-2 text-xs font-bold transition-colors duration-300 z-10 ${
                    currentView === 'table' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Table2 className="w-4 h-4" />
                  Table
                </button>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <nav className="space-y-1">
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Main Menu</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exactMatch);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm ${
                    active 
                      ? 'bg-white/10 text-white border border-white/10' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" style={{ color: active ? '#818cf8' : item.color }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Section - Fixed Bottom */}
        <div className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-md shrink-0">
          {currentUser && (
            <div className="space-y-3">
              <Link
                href={`/${companySlug}/profile`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-xs truncate">{currentUser?.name}</p>
                  <p className="text-slate-500 text-[10px] truncate">{currentUser?.email}</p>
                </div>
              </Link>
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl font-black transition-all border border-red-500/10 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}