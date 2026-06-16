'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, RefreshCw, Copy, CheckCircle2, Users, TrendingUp, AlertCircle } from 'lucide-react';

type Client = {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  plan_tier: string;
  total_projects: number;
  unpaid_count: number;
  paid_count: number;
  total_revenue: number;
  total_collected: number;
  last_activity: string | null;
};

type Props = {
  bookkeeper: {
    id: number;
    name: string;
    email: string;
    partner_code: string;
  };
};

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function BookkeeperDashboardClient({ bookkeeper }: Props) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://lead2project.com'}/signup?ref=${bookkeeper.partner_code}`;

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookkeeper/clients');
      const data = await res.json();
      if (data.success) setClients(data.clients);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const handleLogout = async () => {
    await fetch('/api/bookkeeper/logout', { method: 'POST' });
    router.push('/bookkeeper/login');
  };

  const copyReferralUrl = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalRevenue = clients.reduce((s, c) => s + parseFloat(String(c.total_revenue || 0)), 0);
  const totalOutstanding = clients.reduce((s, c) => s + (parseFloat(String(c.total_revenue || 0)) - parseFloat(String(c.total_collected || 0))), 0);
  const totalUnpaid = clients.reduce((s, c) => s + (c.unpaid_count || 0), 0);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f' }}>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: 'rgba(10,10,15,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Lead2ProjectLogo.webp" alt="Lead2Project" className="h-6 w-auto brightness-0 invert opacity-80" />
            <span className="text-slate-600 text-sm">/</span>
            <span className="text-slate-300 text-sm font-medium">Partner Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium hidden sm:block">{bookkeeper.name}</span>
            <button onClick={fetchClients} className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome, {bookkeeper.name.split(' ')[0]}</h1>
          <p className="text-slate-500 text-sm mt-1">Your referred contractor clients and their financial status</p>
        </div>

        {/* Referral code card */}
        <div className="rounded-2xl p-5 mb-8" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Your partner code</p>
              <p className="text-2xl font-black text-white tracking-wider">{bookkeeper.partner_code}</p>
              <p className="text-xs text-slate-500 mt-1">Share your referral link with contractor clients</p>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <p className="text-xs text-slate-500 font-medium truncate max-w-xs">{referralUrl}</p>
              <button
                onClick={copyReferralUrl}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all"
                style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#10b981' : '#94a3b8' }}
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total clients', value: clients.length, color: '#ffffff', icon: Users },
            { label: 'Total revenue', value: fmt(totalRevenue), color: '#10b981', icon: TrendingUp },
            { label: 'Outstanding', value: fmt(totalOutstanding), color: '#f59e0b', icon: AlertCircle },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div key={i} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
              </div>
            );
          })}
        </div>

     

        {/* Clients list */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-sm font-semibold text-white">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
          </div>

          {loading ? (
            <div className="px-6 py-20 text-center text-slate-600 text-sm">Loading clients...</div>
          ) : clients.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="text-slate-500 font-bold text-sm mb-2">No clients yet</p>
              <p className="text-slate-600 text-xs">Share your referral link with contractor clients to get started</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {clients.map(client => {
                const outstanding = parseFloat(String(client.total_revenue || 0)) - parseFloat(String(client.total_collected || 0));
                return (
                  <div key={client.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex items-center gap-4 min-w-0">
                      {client.logo_url ? (
                        <img src={client.logo_url} alt={client.name} className="w-9 h-9 rounded-xl object-contain bg-white/5 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                          {client.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{client.name}</p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {client.total_projects || 0} jobs
                          {client.last_activity && ` · Last active ${new Date(client.last_activity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-600 mb-0.5">Revenue</p>
                        <p className="text-sm font-bold text-white">{fmt(parseFloat(String(client.total_revenue || 0)))}</p>
                      </div>
                      {outstanding > 0 && (
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-slate-600 mb-0.5">Outstanding</p>
                          <p className="text-sm font-bold text-amber-400">{fmt(outstanding)}</p>
                        </div>
                      )}
                     
                     {client.plan_tier === 'free' ? (
                       <span
                          title="This client is on the free plan. Ask them to upgrade to Basic to see their financial data."
                          className="text-xs font-black px-3 py-2 rounded-xl cursor-help"
                          style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}
                        >
                          Free plan
                        </span>
                      ) : (
                        <Link
                          href={`/bookkeeper/client/${client.slug}`}
                          className="text-xs font-black px-3 py-2 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}