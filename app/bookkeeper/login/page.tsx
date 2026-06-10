'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookkeeperLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/bookkeeper/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/bookkeeper/dashboard');
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0a0f' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/">
            <img src="/Lead2ProjectLogo.png" alt="Lead2Project" className="h-8 w-auto mx-auto mb-4 brightness-0 invert" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Partner sign in</h1>
          <p className="text-slate-500 text-sm mt-2">Access your clients' financial dashboards</p>
        </div>

        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {error}
            </div>
          )}

          {[
            { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Your password' },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-black text-white transition-all active:scale-95 mt-2"
            style={{ background: loading ? 'rgba(16,185,129,0.5)' : '#10b981' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Don't have an account?{' '}
          <Link href="/bookkeeper/signup" className="text-emerald-400 font-bold hover:text-emerald-300">
            Create one
          </Link>
        </p>

        <p className="text-center text-xs text-slate-700 mt-3">
          Are you a contractor?{' '}
          <Link href="/login" className="text-slate-500 hover:text-slate-400">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}