'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BookkeeperSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const handleSubmit = async () => {
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookkeeper/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.success) {
        // Auto login after signup
        const loginRes = await fetch('/api/bookkeeper/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
          router.push('/bookkeeper/dashboard');
        }
      } else {
        setError(data.error || 'Failed to create account');
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

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="h-8 w-auto mx-auto mb-4 brightness-0 invert" />
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight">Create your partner account</h1>
          <p className="text-slate-500 text-sm mt-2">Get a referral code and access your clients' financials</p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {error}
            </div>
          )}

          {[
            { label: 'Full name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'jane@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
            { label: 'Confirm password', key: 'confirm', type: 'password', placeholder: 'Repeat password' },
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
            {loading ? 'Creating account...' : 'Create Partner Account'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Already have an account?{' '}
          <Link href="/bookkeeper/login" className="text-emerald-400 font-bold hover:text-emerald-300">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-slate-700 mt-3">
          Are you a contractor?{' '}
          <Link href="/signup" className="text-slate-500 hover:text-slate-400">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}