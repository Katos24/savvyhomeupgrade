// app/[company]/CompanyShell.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import type { CompanyShellData, ShellUser } from './layout';

export default function CompanyShell({
  company,
  currentUser,
  children,
}: {
  company: CompanyShellData;
  currentUser: ShellUser | null;
  children: React.ReactNode;
}) {
    const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Home has its own dense sub-navigation rail — running the full-width
  // main sidebar at the same time leaves too little room for content
  // (this is what caused OverviewTab's fields to overflow). Nudge to
  // collapsed on entering Home; the manual toggle still works normally
  // from there if the user wants it back open.
  const isHomeSection = pathname?.startsWith(`/${company.slug}/home`);
  useEffect(() => {
    if (isHomeSection) setSidebarCollapsed(true);
  }, [isHomeSection]);
  // Desktop-only, persisted — mobile drawer never collapses, it's an
  // overlay that closes entirely instead.
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop: pinned, always visible, part of the layout flow.
          Mobile: same overlay-drawer behavior Sidebar already had —
          isOpen/onClose still control it, just triggered from here
          instead of from inside each individual page. */}
          <div className={`hidden lg:block lg:shrink-0 transition-[width] duration-200 ${sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-60'}`}>
        <Sidebar
          companySlug={company.slug}
          companyName={company.name}
          companyLogoUrl={company.logo_url}
          currentUser={currentUser}
          onLogout={handleLogout}
          isOpen={true}
          onClose={() => {}}
          brandColor1={company.email_brand_color_1 || undefined}
          brandColor2={company.email_brand_color_2 || undefined}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      </div>

      <div className="lg:hidden">
        <Sidebar
          companySlug={company.slug}
          companyName={company.name}
          companyLogoUrl={company.logo_url}
          currentUser={currentUser}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          brandColor1={company.email_brand_color_1 || undefined}
          brandColor2={company.email_brand_color_2 || undefined}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile-only top bar — the only trigger for opening the nav
            drawer on mobile now that individual pages (Home, etc.) no
            longer build their own header. Without this there was no way
            to open navigation on mobile outside of pages that happened
            to have their own leftover hamburger. */}
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 border-b border-[#e7e2d8] bg-white/90 backdrop-blur-sm px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1 rounded-lg text-[#57534e] hover:bg-[#f5f1e8] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-[#1c1917] truncate">{company.name}</span>
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}