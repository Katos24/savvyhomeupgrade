'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutGrid, Table2, Calendar, Settings, LogOut, X, User, BarChart3 } from 'lucide-react';

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
    if (exactMatch) {
      return pathname === path;
    }
    return pathname.includes(path);
  };

  const navItems = [
    { 
      href: `/${companySlug}/dashboard`, 
      icon: LayoutGrid, 
      label: 'Leads', 
      exactMatch: true,
      color: '#60a5fa' // blue-400
    },
    { 
      href: `/${companySlug}/dashboard/analytics`, 
      icon: BarChart3, 
      label: 'Analytics',
      exactMatch: false,
      color: '#a78bfa' // violet-400
    },
    { 
      href: `/${companySlug}/dashboard/calendar`, 
      icon: Calendar, 
      label: 'Calendar',
      exactMatch: false,
      color: '#4ade80' // green-400
    },
    { 
      href: `/${companySlug}/admin/settings`, 
      icon: Settings, 
      label: 'Settings',
      exactMatch: false,
      color: '#c084fc'
    },
  ];

  // Close sidebar when route changes
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay - Click to close */}
      <div 
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/20 flex flex-col z-50 shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {companyLogoUrl ? (
                <img 
                  src={companyLogoUrl} 
                  alt={`${companyName} logo`}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {companyName.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-white font-bold text-lg">{companyName}</h2>
                <p className="text-white/60 text-xs">Dashboard</p>
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exactMatch);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                  active
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon 
                  className="w-5 h-5" 
                  style={{ color: active ? '#111827' : item.color }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* View Toggle (only show on Leads page) */}
          {pathname === `/${companySlug}/dashboard` && onViewChange && (
            <div className="pt-4 mt-4 border-t border-white/20">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 px-4">View Mode</p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onViewChange('cards');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                    currentView === 'cards'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <LayoutGrid 
                    className="w-5 h-5" 
                    style={{ color: currentView === 'cards' ? '#111827' : '#fb923c' }}
                  />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('table');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                    currentView === 'table'
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Table2 
                    className="w-5 h-5" 
                    style={{ color: currentView === 'table' ? '#111827' : '#22d3ee' }}
                  />
                  <span>Table</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/20 space-y-2">
          {currentUser && (
            <>
              {/* User Profile Card - Clickable */}
              <Link
                href={`/${companySlug}/profile`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                  {currentUser?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{currentUser?.name}</p>
                  <p className="text-white/60 text-xs truncate">{currentUser?.email}</p>
                </div>
                <User className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg font-semibold transition border border-red-500/30 text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" style={{ color: '#f87171' }} />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}