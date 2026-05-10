'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, ChevronRight, ChevronDown, QrCode, LayoutDashboard, Zap } from 'lucide-react';

const FEATURE_LINKS = [
  { label: 'Lead Capture', desc: 'QR codes, forms, photo intake', href: '/features/lead-capture', icon: <QrCode size={18} /> },
  { label: 'Operations', desc: 'Board, quotes, scheduling, payments', href: '/features/operations', icon: <LayoutDashboard size={18} /> },
  { label: 'Tools & Exports', desc: 'Outbox, CSV, digest, AI briefs', href: '/features/tools', icon: <Zap size={18} /> },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-4 sm:px-6 ${
          scrolled
            ? 'py-3 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 shadow-lg'
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
''
              }`}
            />
            <span
              className={`text-lg sm:text-xl font-black transition-colors ${
scrolled ? 'text-slate-900' : 'text-slate-900'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Lead2Project
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#how-it-works"
              className={`text-sm font-bold transition-colors ${
scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              How it works
            </Link>

            {/* Features Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setFeaturesOpen(!featuresOpen)}
                onMouseEnter={() => setFeaturesOpen(true)}
                className={`flex items-center gap-1 text-sm font-bold transition-colors ${
scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Features
                <ChevronDown size={14} className={`transition-transform duration-200 ${featuresOpen ? 'rotate-180' : ''}`} />
              </button>

              <div
                onMouseLeave={() => setFeaturesOpen(false)}
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[300px] transition-all duration-200 ${
                  featuresOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="bg-white border-2 border-slate-200 shadow-2xl rounded-2xl p-2 overflow-hidden">
                  {FEATURE_LINKS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setFeaturesOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-emerald-500 text-white flex items-center justify-center rounded-xl shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-500 font-bold">{item.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="#pricing"
              className={`text-sm font-bold transition-colors ${
scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-bold px-4 py-2 transition-colors ${
scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="flex items-center gap-2 text-sm font-black px-6 py-3 rounded-2xl transition-all active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl border-2 border-slate-900"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start Free
              <ArrowRight size={16} strokeWidth={3} />
            </Link>
          </div>

          {/* MOBILE */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/signup"
              className="text-xs font-black px-4 py-2 rounded-xl bg-emerald-500 text-white shadow-lg"
            >
              Start Free
            </Link>

            <button
              onClick={() => setMobileOpen(true)}
              className={`p-2 ${scrolled ? 'text-slate-700' : 'text-slate-700'}`}
              aria-label="Open menu"
            >
              <Menu size={24} strokeWidth={2.5} />
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
        className={`fixed top-0 right-0 z-[70] h-full w-[80%] max-w-[320px] bg-slate-900 border-l-4 border-slate-800 transition-transform md:hidden flex flex-col ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-8">
          <div className="flex items-center gap-2">
            <img src="/Lead2ProjectLogo.png" className="h-6 brightness-0 invert" alt="" />
            <span 
              className="text-base font-black text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Lead2Project
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 text-white/50 hover:text-white"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col px-4 gap-1 flex-1 overflow-y-auto">
          <Link
            href="#how-it-works"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between px-4 py-4 rounded-xl text-white font-black hover:bg-white/10 transition-colors"
          >
            How it works
            <ChevronRight size={18} className="text-white/40" />
          </Link>

          {/* Features accordion */}
          <button
            onClick={() => setMobileFeaturesOpen(!mobileFeaturesOpen)}
            className="flex items-center justify-between px-4 py-4 rounded-xl text-white font-black hover:bg-white/10 w-full text-left transition-colors"
          >
            Features
            <ChevronDown size={18} className={`text-white/40 transition-transform duration-200 ${mobileFeaturesOpen ? 'rotate-180' : ''}`} />
          </button>

          {mobileFeaturesOpen && (
            <div className="ml-2 space-y-1 mb-2">
              {FEATURE_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-9 h-9 bg-emerald-500 text-white flex items-center justify-center shrink-0 rounded-xl shadow-lg">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{item.label}</p>
                    <p className="text-xs text-white/50 font-bold">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between px-4 py-4 rounded-xl text-white font-black hover:bg-white/10 transition-colors"
          >
            Pricing
            <ChevronRight size={18} className="text-white/40" />
          </Link>
        </div>

        {/* Actions */}
        <div className="px-4 pb-8 pt-4 flex flex-col gap-3 border-t-2 border-white/10">
          <Link
            href="/signup"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-500 text-white font-black shadow-xl"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Sign Up Today
            <ArrowRight size={18} strokeWidth={3} />
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center py-3.5 text-white/70 font-bold border-2 border-white/20 rounded-2xl hover:bg-white/10 transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}