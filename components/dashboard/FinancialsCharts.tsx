'use client';

import { Star, TrendingUp, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ThemeTokens } from '@/lib/financialsTheme';

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const CARD_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#60a5fa', '#34d399', '#fb923c'];

/* ── STAT CARDS ── */
export function StatCards({ t, totalRevenue, totalCollected, totalOutstanding, taxReadyPct, taxReadyCount, filtered }: {
  t: ThemeTokens;
  totalRevenue: number;
  totalCollected: number;
  totalOutstanding: number;
  taxReadyPct: number;
  taxReadyCount: number;
  filtered: any[];
}) {
  const cards = [
    { label: 'Revenue', value: fmt(totalRevenue), color: t.text.primary },
    { label: 'Collected', value: fmt(totalCollected), color: '#10b981' },
    { label: 'Outstanding', value: fmt(totalOutstanding), color: '#f59e0b' },
    {
      label: 'Tax ready', value: `${taxReadyPct}%`,
      sub: `${taxReadyCount} of ${filtered.length} jobs`,
      color: taxReadyPct === 100 ? '#10b981' : taxReadyPct > 50 ? '#60a5fa' : '#f59e0b',
      progress: taxReadyPct,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="rounded-2xl p-4 sm:p-5" style={{ background: t.cardBg2, border: t.cardBorder }}>
          <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: t.text.muted }}>{card.label}</p>
          <p className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: card.color }}>{card.value}</p>
          {card.sub && <p className="text-xs mt-1" style={{ color: t.text.faint }}>{card.sub}</p>}
          {card.progress !== undefined && (
            <div className="mt-3 h-0.5 rounded-full" style={{ background: t.trackBg2 }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${card.progress}%`, background: card.color }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── OUTSTANDING WIDGET ── */
export function OutstandingWidget({ t, totalOutstanding, unpaidJobs, partialJobs, onSendReminders }: {
  t: ThemeTokens;
  totalOutstanding: number;
  unpaidJobs: any[];
  partialJobs: any[];
  onSendReminders: () => void;
}) {
  return (
    <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: t.cardBorder }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold" style={{ color: t.text.primary }}>Money waiting to be collected</p>
        <TrendingUp className="w-4 h-4" style={{ color: '#f59e0b' }} />
      </div>
      <p className="text-3xl font-bold tracking-tight mb-1" style={{ color: '#f59e0b' }}>{fmt(totalOutstanding)}</p>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        <div>
          <p className="text-xs mb-0.5" style={{ color: t.text.muted }}>Unpaid jobs</p>
          <p className="text-sm font-bold" style={{ color: t.text.primary }}>{unpaidJobs.length}</p>
        </div>
        <div className="w-px h-8" style={{ background: t.dividerStrong }} />
        <div>
          <p className="text-xs mb-0.5" style={{ color: t.text.muted }}>Partial payments</p>
          <p className="text-sm font-bold" style={{ color: t.text.primary }}>{partialJobs.length}</p>
        </div>
        <div className="w-px h-8" style={{ background: t.dividerStrong }} />
        <div>
          <p className="text-xs mb-0.5" style={{ color: t.text.muted }}>Total jobs</p>
          <p className="text-sm font-bold" style={{ color: t.text.primary }}>{unpaidJobs.length + partialJobs.length}</p>
        </div>
      </div>
      {(unpaidJobs.length > 0 || partialJobs.length > 0) && (
       <button onClick={onSendReminders}
  className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; }}>
  Send reminders →
</button>
      )}
    </div>
  );
}

/* ── QBO SCORE ── */
export function QBOScore({ t, filtered }: { t: ThemeTokens; filtered: any[] }) {
  function getReceiptCount(project: any): number {
    try {
      const docs = typeof project.documents === 'string' ? JSON.parse(project.documents) : project.documents || [];
      return docs.filter((d: any) => d.type === 'receipt').length;
    } catch { return 0; }
  }

  const score = (() => {
    if (filtered.length === 0) return 0;
    const paidPct = filtered.filter(p => p.payment_status === 'paid').length / filtered.length;
    const invoicePct = filtered.filter(p => p.invoice_number).length / filtered.length;
    const categoryPct = filtered.filter(p => p.category).length / filtered.length;
    const receiptPct = filtered.filter(p => getReceiptCount(p) > 0).length / filtered.length;
    return Math.round(paidPct * 40 + invoicePct * 30 + categoryPct * 20 + receiptPct * 10);
  })();

  const scoreColor = score >= 80 ? '#10b981' : score >= 50 ? '#60a5fa' : '#f59e0b';

  const bars = [
    { label: 'Paid invoices', pct: Math.round(filtered.filter(p => p.payment_status === 'paid').length / Math.max(filtered.length, 1) * 100) },
    { label: 'Invoice numbers', pct: Math.round(filtered.filter(p => p.invoice_number).length / Math.max(filtered.length, 1) * 100) },
    { label: 'Categories set', pct: Math.round(filtered.filter(p => p.category).length / Math.max(filtered.length, 1) * 100) },
    { label: 'Receipts attached', pct: Math.round(filtered.filter(p => getReceiptCount(p) > 0).length / Math.max(filtered.length, 1) * 100) },
  ];

  return (
    <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: t.cardBorder }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold" style={{ color: t.text.primary }}>QuickBooks readiness score</p>
        <Star className="w-4 h-4" style={{ color: scoreColor }} />
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke={t.trackBg2} strokeWidth="8" />
            <circle cx="40" cy="40" r="32" fill="none" stroke={scoreColor} strokeWidth="8"
              strokeDasharray={`${(score / 100) * 201} 201`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black" style={{ color: t.text.primary }}>{score}</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          {bars.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs" style={{ color: t.text.muted }}>{item.label}</span>
                <span className="text-xs font-bold" style={{ color: t.text.primary }}>{item.pct}%</span>
              </div>
              <div className="h-1 rounded-full" style={{ background: t.trackBg }}>
                <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.pct === 100 ? '#10b981' : item.pct > 50 ? '#60a5fa' : '#f59e0b' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CATEGORY LEADERBOARD ── */
export function CategoryLeaderboard({ t, revenueByCategory }: { t: ThemeTokens; revenueByCategory: { name: string; value: number }[] }) {
  return (
    <div className="rounded-2xl p-5 lg:col-span-2" style={{ background: t.cardBg, border: t.cardBorder }}>
      <p className="text-sm font-semibold mb-6" style={{ color: t.text.primary }}>Most profitable services</p>
      {revenueByCategory.length === 0 ? (
        <p className="text-sm" style={{ color: t.text.muted }}>No data</p>
      ) : (
        <div className="space-y-3">
          {revenueByCategory.map((cat, i) => {
            const pct = revenueByCategory[0].value > 0 ? (cat.value / revenueByCategory[0].value) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black" style={{ color: t.text.muted }}>#{i + 1}</span>
                    <span className="text-xs font-medium" style={{ color: t.text.secondary }}>{cat.name}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: t.text.primary }}>{fmt(cat.value)}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: t.trackBg }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: CARD_COLORS[i % CARD_COLORS.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── PAYMENT BREAKDOWN ── */
export function PaymentBreakdown({ t, paymentBreakdown }: { t: ThemeTokens; paymentBreakdown: { name: string; value: number; color: string }[] }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: t.cardBorder }}>
      <p className="text-sm font-semibold mb-6" style={{ color: t.text.primary }}>Payment status</p>
      {paymentBreakdown.length === 0 ? (
        <p className="text-sm" style={{ color: t.text.muted }}>No data</p>
      ) : (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={paymentBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                {paymentBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: t.dropdownBg, border: t.dropdownBorder, borderRadius: 12, color: t.text.primary, fontSize: 12 }}
                formatter={(v: any) => [v + ' jobs']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {paymentBreakdown.map((entry, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                  <span className="text-xs font-medium" style={{ color: t.text.secondary }}>{entry.name}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: t.text.primary }}>{entry.value} jobs</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TOP CUSTOMERS ── */
export function TopCustomers({ t, topCustomers }: { t: ThemeTokens; topCustomers: { name: string; total: number }[] }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: t.cardBorder }}>
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-4 h-4" style={{ color: t.text.secondary }} />
        <p className="text-sm font-semibold" style={{ color: t.text.primary }}>Top customers</p>
      </div>
      {topCustomers.length === 0 ? (
        <p className="text-sm" style={{ color: t.text.muted }}>No data</p>
      ) : (
        <div className="space-y-3">
          {topCustomers.map((customer, i) => {
            const pct = topCustomers[0].total > 0 ? (customer.total / topCustomers[0].total) * 100 : 0;
            return (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs font-black w-4 shrink-0" style={{ color: t.text.muted }}>#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold truncate" style={{ color: t.text.secondary }}>{customer.name}</span>
                    <span className="text-xs font-bold ml-2 shrink-0" style={{ color: t.text.primary }}>{fmt(customer.total)}</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: t.trackBg }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#6366f1' }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}