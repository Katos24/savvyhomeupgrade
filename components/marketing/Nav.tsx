'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features',     href: '#features'     },
    { label: 'Pricing',      href: '#pricing'      },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 ${
          scrolled
            ? 'py-3 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5'
            : 'py-4 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/Lead2ProjectLogo.png"
              alt="Lead2Project"
              className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-lg sm:text-xl font-black tracking-tighter text-white">
              Lead2Project
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl bg-[#1a6645] text-white transition-all hover:bg-[#144d34] active:scale-95"
            >
              Start Free
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile: CTA + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/signup"
              className="text-xs font-black px-4 py-2 rounded-lg bg-[#1a6645] text-white"
            >
              Start Free
            </Link>
            <button
              className="p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>

        </div>
      </nav>

      {/* ── Mobile drawer overlay ── */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* ── Mobile drawer ── */}
      <div
        className={`fixed top-0 right-0 z-[70] h-full w-[80%] max-w-[320px] bg-[#0d0d1a] border-l border-white/5 transition-transform duration-300 ease-out md:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          <div className="flex items-center gap-2">
            <img src="/Lead2ProjectLogo.png" alt="" className="h-6 w-auto" />
            <span className="text-base font-black tracking-tighter text-white">Lead2Project</span>
          </div>
          <button
            className="p-2 text-white/50 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex flex-col px-4 gap-1 flex-1">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-4 py-4 rounded-xl text-white font-bold text-base hover:bg-white/5 transition-colors"
            >
              {item.label}
              <ChevronRight size={18} className="text-white/20" />
            </a>
          ))}
        </div>

        {/* Bottom CTAs */}
        <div className="px-4 pb-8 pt-4 flex flex-col gap-3 border-t border-white/5">
          <Link
            href="/signup"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-[#1a6645] text-white font-black text-base"
          >
            Start Free — No Card Needed
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center w-full py-3.5 text-white/50 font-semibold border border-white/10 rounded-xl text-sm"
          >
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}