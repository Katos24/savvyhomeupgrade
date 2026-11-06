'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  Menu, X, ArrowRight, ChevronRight, ChevronDown, Calculator,
  Thermometer, Droplets, Zap, Home, Sparkles, BookOpen,
  QrCode, LayoutDashboard, FileText, Mail, CalendarDays, CreditCard, Receipt,
  FileCheck, PiggyBank, Banknote, TrendingUp, Star, Upload, Phone,
  Target, Wallet, HardHat, Users,
  type LucideIcon,
} from 'lucide-react';

type NavItem = { label: string; desc: string; href: string; icon: React.ReactNode };
type NavGroup = { title?: string; icon?: LucideIcon; items: NavItem[] };

// Optional phone number shown in the desktop nav (e.g. '(631) 555-0100'). Leave empty to hide it.
const PHONE: string = '';

// Features mega menu, grouped the way a job moves: win it → get paid → run it → keep the customer.
// Links with a #section go to a section on an existing feature page. Make sure each page has an
// element with that id (e.g. <section id="deposits">), or point the link somewhere else.
const FEATURE_GROUPS: NavGroup[] = [
  {
    title: 'Win the Job',
    icon: Target,
    items: [
      { label: 'Lead Capture', desc: 'Booking link, QR code & custom questions', href: '/features/lead-capture', icon: <QrCode size={18} /> },
      { label: 'Quoting', desc: 'Price templates you can send in minutes', href: '/features/quoting', icon: <FileText size={18} /> },
      { label: 'Online Acceptance', desc: 'Customers approve quotes from their phone', href: '/features/quoting#accept', icon: <FileCheck size={18} /> },
    ],
  },
  {
    title: 'Get Paid',
    icon: Wallet,
    items: [
      { label: 'Card Payments', desc: 'Customers pay by card through Stripe', href: '/features/payments', icon: <CreditCard size={18} /> },
      { label: 'Deposits', desc: 'Collect up front before work starts', href: '/features/payments#deposits', icon: <PiggyBank size={18} /> },
      { label: 'Invoices & Receipts', desc: 'Balance invoices when the job is done', href: '/features/payments#invoices', icon: <Receipt size={18} /> },
      { label: 'Cash & Check', desc: 'Record offline payments on the job card', href: '/features/payments#cash-check', icon: <Banknote size={18} /> },
    ],
  },
  {
    title: 'Run the Job',
    icon: HardHat,
    items: [
      { label: 'Job Board', desc: 'One card per job, board & table views', href: '/features/operations', icon: <LayoutDashboard size={18} /> },
      { label: 'Scheduling', desc: 'Calendar and schedule confirmations', href: '/features/scheduling', icon: <CalendarDays size={18} /> },
      { label: 'Expenses & Profit', desc: 'See what every job actually made', href: '/features/operations#expenses', icon: <TrendingUp size={18} /> },
    ],
  },
  {
    title: 'Keep Customers',
    icon: Users,
    items: [
      { label: 'Outbox & Digest', desc: 'Every email sent, plus a morning summary', href: '/features/outbox', icon: <Mail size={18} /> },
      { label: 'Review Requests', desc: 'Ask for a Google review when a job closes', href: '/features/outbox#reviews', icon: <Star size={18} /> },
      { label: 'Customer Import', desc: 'Bring your list over from a spreadsheet', href: '/features/operations#import', icon: <Upload size={18} /> },
    ],
  },
];

const FEATURE_LINKS: NavItem[] = FEATURE_GROUPS.flatMap((g) => g.items);

const INDUSTRY_LINKS: NavItem[] = [
  { label: 'Roofing', desc: 'Repairs, replacements & installs', href: '/solutions/roofing', icon: <Home size={16} /> },
  { label: 'HVAC', desc: 'Heating, cooling & air systems', href: '/solutions/hvac', icon: <Thermometer size={16} /> },
  { label: 'Plumbing', desc: 'Pipes, drains & water systems', href: '/solutions/plumbing', icon: <Droplets size={16} /> },
  { label: 'Electrical', desc: 'Wiring, panels & installations', href: '/solutions/electrical', icon: <Zap size={16} /> },
  { label: 'Cleaning', desc: 'Residential & commercial cleaning', href: '/solutions/cleaning', icon: <Sparkles size={16} /> },
];

// Free tools: no sign-up needed. Also listed in the site footer.
const TOOL_LINKS: NavItem[] = [
  { label: 'Deposit Calculator', desc: 'Deposit and balance for any job, with sales tax', href: '/tools/deposit-calculator', icon: <Calculator size={16} /> },
  { label: 'Invoice Maker', desc: 'Make a clean invoice and save it as a PDF', href: '/tools/invoice-generator', icon: <Receipt size={16} /> },
];

// Not a trade — shown as a footer row under Industries instead of an item in the list.
const PARTNER_LINK = { label: 'Bookkeeper? Join the free partner program', href: '/partners' };

type DropdownKey = 'features' | 'industries' | 'tools' | null;

export default function Nav() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);
  const [mobileAccordion, setMobileAccordion] = useState<DropdownKey>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) => {
    const path = href.split('#')[0];
    return pathname === path || pathname.startsWith(path + '/');
  };
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

  // The nav turns white while the mega menu is open so it joins the panel cleanly.
  const solid = scrolled || openDropdown === 'features';

  const linkTone = (active: boolean) =>
    solid
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

  const MegaItem = ({ item }: { item: NavItem }) => {
    const active = isActive(item.href) && !item.href.includes('#');
    return (
      <Link
        href={item.href}
        onClick={() => setOpenDropdown(null)}
        className={`group flex items-start gap-3 rounded-xl p-2.5 -mx-2.5 transition-colors ${
          active ? 'bg-[#00828A]/5' : 'hover:bg-slate-50'
        }`}
      >
        <span className="mt-0.5 shrink-0 text-[#00828A]">{item.icon}</span>
        <span className="min-w-0">
          <span
            className={`block text-base font-semibold leading-tight transition-colors ${
              active ? 'text-[#00828A]' : 'text-slate-900 group-hover:text-[#00828A]'
            }`}
          >
            {item.label}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-slate-500">{item.desc}</span>
        </span>
      </Link>
    );
  };

  // Features: trigger only. The full-width panel is rendered at the bottom of <nav>.
  const renderFeaturesTrigger = () => {
    const open = openDropdown === 'features';
    return (
      <div onMouseEnter={() => { cancelClose(); setOpenDropdown('features'); }} onMouseLeave={scheduleClose}>
        <button
          onClick={() => setOpenDropdown(open ? null : 'features')}
          className={`flex items-center gap-1 ${navLinkClass(sectionActive(FEATURE_LINKS))}`}
          aria-expanded={open}
          aria-haspopup="true"
          aria-controls="features-menu"
        >
          Features
          <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
    );
  };

  const renderMegaMenu = () => {
    const open = openDropdown === 'features';
    return (
      <div
        id="features-menu"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className={`absolute inset-x-0 top-full hidden lg:block transition-all duration-200 ease-out ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
        <div className="relative z-10 border-t border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
          <div className="mx-auto grid max-w-7xl grid-cols-4 gap-y-8 px-6 py-8 lg:divide-x lg:divide-slate-100 lg:py-10">
            {FEATURE_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.title} className="px-2 lg:px-8 lg:first:pl-0 lg:last:pr-0">
                  <div className="mb-5 flex items-center gap-3">
                    {GroupIcon && (
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00828A]/10 text-[#00828A]">
                        <GroupIcon size={22} strokeWidth={2.25} />
                      </span>
                    )}
                    <span className="text-lg font-extrabold tracking-tight text-slate-900" >
                      {group.title}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <MegaItem key={item.href} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 bg-slate-50">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3.5 text-sm">
              <span className="font-medium text-slate-600">
                Free plan, or Pro with everything · <span className="font-semibold text-slate-900">unlimited users</span>
              </span>
              <span className="flex items-center gap-5">
                <Link
                  href="/how-it-works"
                  onClick={() => setOpenDropdown(null)}
                  className="font-semibold text-slate-700 hover:text-slate-900"
                >
                  How it works
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setOpenDropdown(null)}
                  className="inline-flex items-center gap-1 font-semibold text-[#00828A] hover:text-[#006e75]"
                >
                  See pricing <ArrowRight size={14} />
                </Link>
              </span>
            </div>
          </div>
        </div>

        {/* Dims the page behind the open menu (clicks still pass through to close it) */}
        <div aria-hidden className="pointer-events-none h-screen bg-slate-900/20 backdrop-blur-[1px]" />
      </div>
    );
  };

  const renderDesktopDropdown = (key: 'industries' | 'tools', label: string, links: NavItem[]) => {
    const open = openDropdown === key;
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
            key === 'tools' ? 'w-[340px]' : 'w-[320px]'
          } ${open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'}`}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="grid grid-cols-1 gap-1 p-2">
              {links.map((item) => (
                <DropdownItem key={item.href} item={item} />
              ))}
            </div>

            {key === 'tools' ? (
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600">Free, no sign-up</div>
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

  const renderMobileAccordion = (key: Exclude<DropdownKey, null>, label: string, groups: NavGroup[]) => {
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

        <div className={`overflow-hidden transition-all duration-300 ease-out ${open ? 'max-h-[1600px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="space-y-0.5 pb-2 pl-2">
            {groups.map((group, gi) => (
              <div key={group.title ?? gi}>
                {group.title && (
                  <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#5EC4C9]">{group.title}</p>
                )}
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors ${
                      isActive(item.href) && !item.href.includes('#') ? 'bg-white/10' : 'hover:bg-white/10'
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">{item.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-white">{item.label}</span>
                      <span className="block truncate text-xs text-white/70">{item.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            ))}
            {key === 'industries' && (
              <Link
                href={PARTNER_LINK.href}
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10"
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
          solid ? 'border-b border-slate-200 bg-white/95 py-3 shadow-sm backdrop-blur-md' : 'bg-slate-900 py-4'
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
              className={`h-7 w-7 transition-all ${solid ? '' : 'brightness-0 invert'}`}
            />
            <span
              className={`text-lg font-extrabold tracking-tight transition-colors sm:text-xl ${solid ? 'text-slate-900' : 'text-white'}`}
              
            >
              Lead2Project
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 lg:flex xl:gap-8">
            {renderFeaturesTrigger()}
            {renderDesktopDropdown('industries', 'Industries', INDUSTRY_LINKS)}
            <Link href="/pricing" className={navLinkClass(isActive('/pricing'))}>
              Pricing
            </Link>
            <Link href="/how-it-works" className={navLinkClass(isActive('/how-it-works'))}>
              How it works
            </Link>
            {renderDesktopDropdown('tools', 'Free tools', TOOL_LINKS)}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {PHONE && (
              <a
                href={`tel:${PHONE.replace(/[^\d+]/g, '')}`}
                className={`hidden items-center gap-1.5 px-2 py-2 text-sm font-semibold transition-colors lg:inline-flex ${linkTone(false)}`}
              >
                <Phone size={15} className="text-[#00828A]" />
                {PHONE}
              </a>
            )}
            <Link
              href="/login"
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                solid ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-white/20 text-white/85 hover:bg-white/10'
              }`}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00828A] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#00828A]/20 transition-all hover:bg-[#006e75] active:scale-[0.98]"
              
            >
              Start free
              <ArrowRight size={15} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <Link href="/signup" className="rounded-xl bg-[#00828A] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#006e75]">
              Start free
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className={`rounded-lg p-2 ${solid ? 'text-slate-700' : 'text-white'}`}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={24} strokeWidth={2.25} />
            </button>
          </div>
        </div>

        {renderMegaMenu()}
      </nav>

      {/* Overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed right-0 top-0 z-[70] flex h-full w-[85%] max-w-[340px] flex-col bg-slate-900 transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between px-6 pb-6 pt-6">
          <div className="flex items-center gap-2">
            <img src="/Lead2ProjectLogo.webp" width={24} height={24} className="h-6 w-6 brightness-0 invert" alt="" />
            <span className="text-base font-extrabold text-white" >
              Lead2Project
            </span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 text-white/70 hover:text-white" aria-label="Close menu">
            <X size={22} strokeWidth={2.25} />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4">
          {renderMobileAccordion('features', 'Features', FEATURE_GROUPS)}
          {renderMobileAccordion('industries', 'Industries', [{ items: INDUSTRY_LINKS }])}
          <Link href="/pricing" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isActive('/pricing'))}>
            Pricing
            <ChevronRight size={18} className="text-white/40" />
          </Link>
          <Link href="/how-it-works" onClick={() => setMobileOpen(false)} className={mobileLinkClass(isActive('/how-it-works'))}>
            How it works
            <ChevronRight size={18} className="text-white/40" />
          </Link>
          {renderMobileAccordion('tools', 'Free tools', [{ items: TOOL_LINKS }])}
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 border-t border-white/10 px-4 pb-8 pt-4">
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#00828A] py-3.5 font-bold text-white shadow-sm hover:bg-[#006e75]"
            
          >
            Start free
            <ArrowRight size={17} strokeWidth={2.5} />
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center rounded-xl border border-white/20 py-3 font-semibold text-white/90 transition-colors hover:bg-white/10"
          >
            Log in
          </Link>
          {PHONE && (
            <a
              href={`tel:${PHONE.replace(/[^\d+]/g, '')}`}
              className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-white/85 hover:text-white"
            >
              <Phone size={15} /> {PHONE}
            </a>
          )}
        </div>
      </div>
    </>
  );
}