'use client';

// components/marketing/Nav.tsx

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #e5e7eb' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/">
          <img src="/Lead2ProjectLogo.png" alt="Lead2Project" className="h-8 w-auto" />
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Features',     href: '#features'     },
            { label: 'Pricing',      href: '#pricing'      },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold transition-colors hover:text-green-700"
              style={{ color: '#374151' }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-bold px-4 py-2 rounded-xl transition-colors hidden md:block hover:bg-gray-100"
            style={{ color: '#374151' }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-black px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: '#1a6645', color: '#fff' }}
          >
            Start Free
          </Link>
        </div>

      </div>
    </nav>
  );
}