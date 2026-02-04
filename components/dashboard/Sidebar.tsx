'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

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
  
  const isActive = (path: string) => pathname.includes(path);

  const navItems = [
    { href: `/${companySlug}/dashboard`, icon: '📋', label: 'Leads', exactMatch: true },
    { href: `/${companySlug}/dashboard/calendar`, icon: '📅', label: 'Calendar' },
    { href: `/${companySlug}/admin/team`, icon: '⚙️', label: 'Admin' },
  ];

  // Close sidebar on route change
  useEffect(() => {
    onClose();
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-white/20 flex flex-col z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {companyLogoUrl ? (
              <img 
                src={companyLogoUrl} 
                alt={`${companyName} logo`}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {companyName.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-white font-bold text-lg">{companyName}</h2>
              <p className="text-white/60 text-xs">Dashboard</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-white/10 rounded text-white/80 hover:text-white transition"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.exactMatch 
              ? pathname === item.href 
              : isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                  active
                    ? 'bg-white text-gray-900'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* View Toggle */}
          {onViewChange && pathname === `/${companySlug}/dashboard` && (
            <div className="mt-6 pt-4 border-t border-white/20">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2 px-4">View Mode</p>
              <div className="space-y-1">
                <button
                  onClick={() => onViewChange('cards')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                    currentView === 'cards'
                      ? 'bg-white text-gray-900'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl">⬜</span>
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => onViewChange('table')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition ${
                    currentView === 'table'
                      ? 'bg-white text-gray-900'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl">📊</span>
                  <span>Table</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/30">
          {currentUser && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentUser?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{currentUser?.name}</p>
                  <p className="text-white/60 text-xs truncate">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg font-semibold transition border border-red-500/30 text-sm flex items-center justify-center gap-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}