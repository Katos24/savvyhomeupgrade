'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, ArrowRight, ChevronRight, ChevronDown, Calculator,
  Thermometer, Droplets, Zap, Home, Sparkles, BookOpen,
  QrCode, LayoutDashboard, FileText, Mail, CalendarDays, CreditCard,
} from 'lucide-react';

type NavItem = { label: string; desc: string; href: string; icon: React.ReactNode };

// In the order a job actually moves: request → quote → paid → scheduled → tracked.
const FEATURE_LINKS: NavItem[] = [
  { label: 'Lead Capture', desc: 'Booking form, QR code & custom questions', href: '/features/lead-capture', icon: <QrCode size={16} /> },
  { label: 'Quoting', desc: 'Templates, send, customer accepts online', href: '/features/quoting', icon: <FileText size={16} /> },
  { label: 'Payments', desc: 'Deposits, card payments & auto invoices', href: '/features/payments', icon: <CreditCard size={16} /> },
  { label: 'Scheduling', desc: 'Calendar and schedule confirmations', href: '/features/scheduling', icon: <CalendarDays size={16} /> },
  { label: 'Operations', desc: 'One card per job, board & table views', href: '/features/operations', icon: <LayoutDashboard size={16} /> },
  { label: 'Outbox & Digest', desc: 'Every email sent, plus a morning summary', href: '/features/outbox', icon: <Mail size={16} /> },
];

const INDUSTRY_LINKS: NavItem[] = [
  { label: 'Roofing', desc: 'Repairs, replacements & installs', href: '/solutions/roofing', icon: <Home size={16} /> },
  { label: 'HVAC', desc: 'Heating, cooling & air systems', href: '/solutions/hvac', icon: <Thermometer size={16} /> },
  { label: 'Plumbing', desc: 'Pipes, drains & water systems', href: '/solutions/plumbing', icon: <Droplets size={16} /> },
  { label: 'Electrical', desc: 'Wiring, panels & installations', href: '/solutions/electrical', icon: <Zap size={16} /> },
  { label: 'Cleaning', desc: 'Residential & commercial cleaning', href: '/solutions/cleaning', icon: <Sparkles size={16} /> },
];

// Free tool — its own top-level nav item (and in the site footer).
// When there are more tools, turn this into a "Free Tools" dropdown.
const TOOL_LINK = { label: 'Deposit Calculator', href: '/tools/deposit-calculator' };

// Not a trade — shown as a footer row under Industries instead of an item in the list.
const PARTNER_LINK = { label: 'Bookkeeper? Join the free partner program', href: '/partners' };

type DropdownKey = 'features' | 'industries' | null;

export default function Nav() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [mobileAccordion, setMobileAccordion] = useState<DropdownKey>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const sectionActive = (links: NavItem[]) => links.some((l) => isActive(l.href));

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Close menus on outside click and on Esc.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Close everything when the page changes.
  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [pathname]);

  // Small delay before closing on mouse-leave so moving between the trigger
  // and the panel doesn't feel twitchy.
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };
  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const linkTone = (active: boolean) =>
    scrolled
      ? active
        ? 'text-slate-900'
        : 'text-slate-600 hover:text-slate-900'
      : active
      ? 'text-white'
      : 'text-white/75 hover:text-white';

  const navLinkClass = (active: boolean) =>
    `relative text-sm font-semibold transition-colors ${linkTone(active)} ${
      active ? 'after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[#00828A]' : ''
    }`;

  const DropdownItem = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href);
    return (
      <Link
        href={item.href}
        onClick={() => setOpenDropdown(null)}
        className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${active ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {item.icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-900">{item.label}</span>
          <span className="block text-xs leading-snug text-slate-500">{item.desc}</span>
        </span>
      </Link>
    );
  };

  const renderDesktopDropdown = (key: Exclude<DropdownKey, null>, label: string, links: NavItem[]) => {
    const open = openDropdown === key;
    const isFeatures = key === 'features';
    return (
      <div className="relative" onMouseEnter={() => { cancelClose(); setOpenDropdown(key); }} onMouseLeave={scheduleClose}>
        <button
          onClick={() => setOpenDropdown(open ? null : key)}
          className={`flex items-center gap-1 ${navLinkClass(sectionActive(links))}`}
          aria-expanded={open}
          aria-haspopup="true"
        >
          {label}
          <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <div
          className={`absolute left-1/2 top-full -translate-x-1/2 pt-4 transition-all duration-200 ease-out ${
            isFeatures ? 'w-[560px]' : 'w-[320px]'
          } ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className={`grid gap-1 p-2 ${isFeatures ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {links.map((item) => (
                <DropdownItem key={item.href} item={item} />
              ))}
            </div>

            {isFeatures ? (
              <Link
                href="/pricing"
                onClick={() => setOpenDropdown(null)}
                className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <span>Free plan, or Pro with everything · unlimited users</span>
                <span className="inline-flex items-center gap-1 text-slate-900">
                  See pricing <ArrowRight size={13} />
                </span>
              </Link>
            ) : (
              <Link
                href={PARTNER_LINK.href}
                onClick={() => setOpenDropdown(null)}
                className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
              >
                <span className="inline-flex items-center gap-2">
                  <BookOpen size={14} className="text-slate-500" />
                  {PARTNER_LINK.label}
                </span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMobileAccordion = (key: Exclude<DropdownKey, null>, label: string, links: NavItem[]) => {
    const open = mobileAccordion === key;
    return (
      <div>
        <button
          onClick={() => setMobileAccordion(open ? null : key)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-semibold text-white transition-colors hover:bg-white/10"
          aria-expanded={open}
        >
          {label}
          <ChevronDown size={18} className={`text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-[640px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-0.5 pb-2 pl-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                  isActive(item.href) ? 'bg-white/10' : 'hover:bg-white/10'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">{item.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white">{item.label}</span>
                  <span className="block truncate text-xs text-white/50">{item.desc}</span>
                </span>
              </Link>
            ))}
            {key === 'industries' && (
              <Link
                href={PARTNER_LINK.href}
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white/60 hover:bg-white/10"
              >
                <BookOpen size={14} />
                {PARTNER_LINK.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  const mobileLinkClass = (active: boolean) =>
    `flex items-center justify-between rounded-xl px-4 py-3.5 font-semibold text-white transition-colors ${
      active ? 'bg-white/10' : 'hover:bg-white/10'
    }`;

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed left-0 right-0 top-0 z-50 px-4 transition-all duration-300 sm:px-6 ${
          scrolled ? 'border-b border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur-md' : 'bg-slate-900 py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Lead2Project home">
            <img
              src="/Lead2ProjectLogo.webp"
              alt=""
              width={28}
              height={28}
              className={`h-7 w-7 transition-all ${scrolled ? '' : 'brightness-0 invert'}`}
            />
            <span
              className={`text-lg font-extrabold tracking-tight transition-colors sm:text-xl ${scrolled ? 'text-slate-900' : 'text-white'}`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Lead2Project
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {renderDesktopDropdown('features', 'Features', FEATURE_LINKS)}
            {renderDesktopDropdown('industries', 'Industries', INDUSTRY_LINKS)}
            <Link href="/pricing" className={navLinkClass(isActive('/pricing'))}>
              Pricing
            </Link>
            <Link href={TOOL_LINK.href} className={`inline-flex items-center gap-1.5 ${navLinkClass(isActive(TOOL_LINK.href))}`}>
              <Calculator size={15} />
              {TOOL_LINK.label}
            </Link>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className={`px-3 py-2 text-sm font-semibold transition-colors ${linkTone(false)}`}>
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00828A] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#00828A]/20 transition-all hover:bg-[#006e75] active:scale-[0.98]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start free
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1.5 md:hidden">
            <Link href="/signup" className="rounded-xl bg-[#00828A] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#006e75]">
              Start free
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className={`rounded-lg p-2 ${scrolled ? 'text-slate-700' : 'text-white'}`}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={24} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed right-0 top-0 z-[70] flex h-full w-[85%] max-w-[340px] flex-col bg-slate-900 transition-transform duration-300 ease-out md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between px-6 pb-6 pt-6">
          <div className="flex items-center gap-2">
            <img src="/Lead2ProjectLogo.webp" width={24} height={24} className="h-6 w-6 brightness-0 invert" alt="" />
            <span className="text-base font-extrabold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Lead2Project
            </span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 text-white/50 hover:text-white" aria-label="Close menu">
            <X size={22} strokeWidth={2.25} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4">
          {renderMobileAccordion('features', 'Features', FEATURE_LINKS)}
          {renderMobileAccordion('industries', 'Industries', INDUSTRY_LINKS)}
          <Link href="/pricing" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isActive('/pricing'))}>
            Pricing
            <ChevronRight size={18} className="text-white/40" />
          </Link>
          <Link href={TOOL_LINK.href} onClick={() => setMobileOpen(false)} className={mobileLinkClass(isActive(TOOL_LINK.href))}>
            <span className="inline-flex items-center gap-2">
              <Calculator size={17} className="text-white/60" />
              {TOOL_LINK.label}
            </span>
            <ChevronRight size={18} className="text-white/40" />
          </Link>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 border-t border-white/10 px-4 pb-8 pt-4">
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#00828A] py-3.5 font-bold text-white shadow-sm hover:bg-[#006e75]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Start free
            <ArrowRight size={17} strokeWidth={2.5} />
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center rounded-xl border border-white/20 py-3 font-semibold text-white/80 transition-colors hover:bg-white/10"
          >
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}