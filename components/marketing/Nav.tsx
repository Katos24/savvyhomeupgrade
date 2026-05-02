'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 ${
          scrolled
            ? 'py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm'
            : 'py-4 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/Lead2ProjectLogo.png"
              alt="Lead2Project"
              className={`h-7 transition-all group-hover:scale-105 ${
                scrolled ? '' : 'brightness-0 invert'
              }`}
            />
            <span
              className={`text-lg sm:text-xl font-black tracking-tighter transition-colors ${
                scrolled ? 'text-slate-900' : 'text-white'
              }`}
            >
              Lead2Project
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-semibold transition-colors ${
                  scrolled
                    ? 'text-slate-500 hover:text-slate-900'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-semibold px-4 py-2 transition-colors ${
                scrolled
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="flex items-center gap-2 text-sm font-black px-6 py-2.5 rounded-xl transition-all active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
            >
              Start Free
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* MOBILE */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/signup"
              className="text-xs font-black px-4 py-2 rounded-lg bg-emerald-500 text-white"
            >
              Start Free
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className={`p-2 ${
                scrolled ? 'text-slate-600' : 'text-white'
              }`}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* OVERLAY */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* MOBILE DRAWER */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[80%] max-w-[320px] bg-slate-900 border-l border-white/5 transition-transform md:hidden flex flex-col ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          <div className="flex items-center gap-2">
            <img src="/Lead2ProjectLogo.png" className="h-6 brightness-0 invert" alt="" />
            <span className="text-base font-black text-white">Lead2Project</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-white/50 hover:text-white"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex flex-col px-4 gap-1 flex-1">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-4 rounded-xl text-white font-bold hover:bg-white/5"
            >
              {item.label}
              <ChevronRight size={18} className="text-white/20" />
            </Link>
          ))}
        </div>

        <div className="px-4 pb-8 pt-4 flex flex-col gap-3 border-t border-white/5">
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 text-white font-black"
          >
            Sign Up Today
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center py-3.5 text-white/50 font-semibold border border-white/10 rounded-xl text-sm"
          >
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}