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

  const navLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 ${
          scrolled 
            ? 'py-3 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm' 
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* LOGO + NAME SECTION */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/Lead2ProjectLogo.png" 
              alt="Lead2Project Logo" 
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900">
              Lead2Project
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-bold text-slate-600 transition-colors hover:text-[#1a6645]"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:block text-sm font-bold px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-xl bg-[#1a6645] text-white transition-all hover:bg-[#144d34] hover:shadow-lg hover:shadow-green-900/20 active:scale-95"
            >
              Start Free
              <ArrowRight size={16} />
            </Link>

            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-slate-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-[40] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Drawer Content */}
      <div 
        className={`fixed top-0 right-0 z-[60] w-[85%] max-w-sm h-full bg-white transition-transform duration-300 ease-out md:hidden shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-8 pt-20">
          {/* Mobile Logo inside Drawer */}
          <div className="flex items-center gap-2 mb-12">
            <img src="/Lead2ProjectLogo.png" alt="" className="h-7 w-auto" />
            <span className="text-xl font-black tracking-tighter text-slate-900">Lead2Project</span>
          </div>

          <div className="space-y-6">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-2xl font-black text-slate-900 group"
              >
                {item.label}
                <ChevronRight size={24} className="text-slate-300" />
              </a>
            ))}
          </div>

          <div className="mt-auto space-y-4">
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-[#1a6645] text-white font-black text-xl shadow-xl shadow-green-900/10"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-4 text-slate-500 font-bold border-2 border-slate-100 rounded-2xl"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}