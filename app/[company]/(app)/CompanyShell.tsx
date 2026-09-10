'use client';

import { useState, useEffect, useRef } from 'react';
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
  // Same localStorage key Dashboard/Leads already read/write for their own
  // theme state. CompanyShell doesn't own theme — it just needs to match
  // whatever the current page is showing, so its own mobile top bar
  // (rendered outside any individual page's control) doesn't look like a
  // leftover light-mode bar stacked on top of a dark-themed page.
  const [isDark, setIsDark] = useState<boolean>(true);
  useEffect(() => {
    // Corrects from localStorage after mount, not inside the useState
    // initializer above. Reading localStorage there ran on both server
    // (where window doesn't exist, so it fell back to the true default)
    // and client (where it read the REAL stored value immediately) — if
    // that real value was 'light', the client's very first render
    // disagreed with what the server had already sent down, which is
    // exactly what a hydration mismatch is. Always matching the server's
    // default first, then correcting once mounted, avoids that at the
    // cost of a brief flash to the wrong theme on first load.
    //
    // FIXED: was keyed on an empty dependency array — meaning this only
    // ever re-ran on a hard reload, since neither 'storage' nor 'focus'
    // fire for an ordinary in-app navigation (storage only fires in
    // OTHER tabs, focus only fires when the whole browser window regains
    // focus, not on a route change within an already-focused tab). Since
    // CompanyShell persists across every page as a shared layout, it
    // never remounts on navigation either — so toggling theme on
    // Dashboard, then clicking into another page, could leave this
    // wrapper's own background/mobile bar showing the stale theme until
    // a hard refresh. Keying on pathname makes it re-check on every
    // actual navigation, matching how someone really moves through the app.
    const onStorage = () => setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
    onStorage();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onStorage);
    };
  }, [pathname]);
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
  //
  // Same hydration-mismatch fix as isDark above: always start with the
  // server's default (false), correct from localStorage after mount.
  // skipNextWrite guards against the write-back effect below firing on
  // that same initial pass and immediately overwriting the just-read
  // real value with the stale false default — without it, the corrected
  // value would be set, then clobbered back to false a tick later.
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const skipNextWrite = useRef(true);
  useEffect(() => {
    // Reproduces exactly what the original synchronous-read version
    // produced on first mount: isHomeSection wins if true, otherwise the
    // stored preference. Intentionally empty deps — this is the one-time
    // hydration correction only; the isHomeSection effect declared above
    // already handles subsequent navigation into/out of Home on its own,
    // this doesn't need to duplicate that.
    const stored = localStorage.getItem('sidebar-collapsed') === 'true';
    setSidebarCollapsed(isHomeSection ? true : stored);
  }, []);
  useEffect(() => {
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className={`min-h-screen lg:flex ${isDark ? 'bg-[#0b0f17]' : 'bg-[#faf9f5]'}`}>
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
            drawer on mobile. Now theme-aware: previously hardcoded light
            (bg-white/90, dark text) regardless of the page underneath, so
            a dark-themed page (Dashboard, Leads with isDark on) showed
            this bar looking like a stray leftover light-mode strip on top
            of dark content — the same category of mismatch fixed in
            Scheduling earlier, just at the shared-layout level this time. */}
        <div className={`lg:hidden sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-sm transition-colors ${
          isDark
            ? 'bg-[#0b0f17]/90 border-white/10'
            : 'bg-white/90 border-[#e7e2d8]'
        }`}>
          <button
            onClick={() => setSidebarOpen(true)}
            className={`p-1.5 -ml-1 rounded-lg transition-colors ${
              isDark ? 'text-slate-300 hover:bg-white/10' : 'text-[#57534e] hover:bg-[#f5f1e8]'
            }`}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>
            {company.name}
          </span>
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}