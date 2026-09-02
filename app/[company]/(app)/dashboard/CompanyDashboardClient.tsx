'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, ArrowRight, Sun, Moon } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import LeadModal from '@/components/dashboard/LeadModal';
import CreateLeadModal from '@/components/dashboard/CreateLeadModal';
import { AiChatWidget, LockedFeatureModal } from '@/components/dashboard/DashboardModals';
import { Toaster } from 'sonner';
import TrialBanner from '@/components/TrialBanner';
import PaymentReminderBanner from '@/components/PaymentReminderBanner';
import PaymentToastPoller from '@/components/dashboard/PaymentToastPoller';
import { type PlanTier } from '@/lib/permissions';

// This file was previously the combined leads+stats dashboard. The leads
// list, filters, search, and bulk actions now live at app/[company]/(app)/leads
// (LeadsClient.tsx) — this file is Dashboard-only: a daily overview that
// deep-links into Leads/a specific lead, not a place to work leads directly.
//
// Two things from the reference design are deliberately NOT here — see
// the comments in dashboard-stats/route.ts for why: "New Requests" (no
// corresponding feature exists in this codebase) and the "Route" panel
// under Today's Schedule (no route-sequencing system exists either).

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  phone?: string | null;
  website?: string | null;
  email?: string;
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
  status_options?: any[];
  form_categories?: any[];
  form_field_config?: any;
  custom_questions?: any[];
  subscription_status?: string;
  trial_ends_at?: string | null;
  plan_tier?: string;
  onboarding_completed?: boolean;
  onboarding_steps?: Record<string, boolean>;
  cancel_at_period_end?: boolean;
  subscription_cancel_at?: string | null;
};

type DashboardStats = {
  leads: { new_this_week: number };
  estimates: { open: number; accepted: number };
  jobs: { active: number; active_value: number };
  invoices: { awaiting_payment: number; draft: number; past_due: number };
  todays_schedule: Array<{
    lead_id: number;
    project_id: number;
    customer_name: string;
    category: string | null;
    scheduled_time: string | null;
    scheduled_end_time: string | null;
    job_status: string;
    quote_total: string | number | null;
  }>;
  revenue_this_month: number;
  ready_to_invoice: { count: number; value: number };
  recent_payments: Array<{
    id: number;
    amount: string | number;
    kind: string;
    method: string;
    paid_on: string;
    customer_name: string;
    payment_status: string | null;
  }>;
};

const fmtMoney = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtTime = (t: string | null) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
};

// Category values are stored as snake_case ("full_roof_replacement") — same
// display fix already applied in FormTab.tsx and BillingSummaryPanel.tsx.
const formatCategoryLabel = (value?: string | null) =>
  (value || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// Same defensive pattern as BillingSection.tsx's fmtDate — splits on 'T'
// before parsing, so it works whether paid_on arrives as a bare
// "2026-09-02" or a full ISO timestamp "2026-09-02T00:00:00.000Z".
// Naively appending 'T00:00:00' onto an already-ISO string is what
// produced "Invalid Date" here.
const fmtShortDate = (d: string | null | undefined) => {
  if (!d) return null;
  const datePart = d.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Maps the project's current payment_status onto a short label + color for
// the Recent Payments list. Reads the field the payments_sync_project
// trigger already maintains — no recomputation here.
const paymentStatusBadge = (status: string | null) => {
  if (status === 'paid') return { label: 'Paid in Full', tint: 'emerald' as const };
  if (status === 'partially_paid') return { label: 'Partial', tint: 'amber' as const };
  if (status === 'refunded') return { label: 'Refunded', tint: 'rose' as const };
  if (status === 'partially_refunded') return { label: 'Partially Refunded', tint: 'rose' as const };
  return null;
};

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lockedDashboardModal, setLockedDashboardModal] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedLeadPayments, setSelectedLeadPayments] = useState<any[]>([]);
  const [selectedLeadActivity, setSelectedLeadActivity] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('dashboard-theme') !== 'light';
  });
  useEffect(() => { localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light'); }, [isDark]);

  const planTier = (company.plan_tier || 'free') as PlanTier;

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${company.slug}/dashboard-stats`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load');
      setStats(data);
      setLoadError('');
    } catch (e) {
      console.error('Failed to fetch dashboard stats:', e);
      setLoadError('Could not load dashboard. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [company.slug]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) setCurrentUser(data.user);
    } catch (e) { console.error('fetchCurrentUser:', e); }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/team/members');
      const data = await res.json();
      if (data.success) {
        const assigneeList = (data.allAssignees || []).map((name: string) => ({ id: name, name }));
        setTeamMembers(assigneeList);
      }
    } catch (e) { console.error('fetchTeamMembers:', e); }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchCurrentUser();
    fetchTeamMembers();
  }, [fetchStats, fetchCurrentUser, fetchTeamMembers]);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    startTransition(() => router.push('/login'));
  }, [router]);

  const userMeta = () => ({
    user_name: currentUser?.name || currentUser?.email || 'Unknown User',
    user_email: currentUser?.email || '',
  });

  const updateLeadStatus = useCallback(async (id: number, status: string, oldStatus: string, sendReview = true) => {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, action: 'update_status', old_status: oldStatus, send_review_request: sendReview, ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        if (selectedLead?.id === id) setSelectedLead((prev: any) => ({ ...prev, status }));
        fetchStats();
        return true;
      }
      return false;
    } catch (e) { console.error('updateLeadStatus:', e); return false; }
  }, [selectedLead, currentUser, fetchStats]);

  const addNote = useCallback(async (id: number, noteText: string) => {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: noteText, action: 'add_note', ...userMeta() }),
      });
      const result = await res.json();
      return res.ok && result.success;
    } catch (e) { console.error('addNote:', e); return false; }
  }, [currentUser]);

  const deleteLead = useCallback(async (id: number) => {
    try {
      const res = await fetch('/api/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) { fetchStats(); return true; }
      return false;
    } catch (e) { console.error('deleteLead:', e); return false; }
  }, [currentUser, fetchStats]);

  const openLead = useCallback(async (leadId: number) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setSelectedLeadPayments(data.payments || []);
        setSelectedLeadActivity(data.activity || []);
      }
    } catch (e) { console.error('openLead:', e); }
  }, []);

  const refreshModalLead = useCallback(async () => {
    if (!selectedLead) return;
    await openLead(selectedLead.id);
    fetchStats();
  }, [selectedLead, openLead, fetchStats]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const accentColor = company.email_brand_color_1 || '#2563eb';

  const bg = isDark ? 'bg-[#0b0f17]' : 'bg-[#faf9f5]';
  const cardBg = isDark ? 'bg-[#0f1420] border border-white/10' : 'bg-white border border-[#e7e2d8]';
  const cardText = isDark ? 'text-white' : 'text-[#1c1917]';
  const subText = isDark ? 'text-slate-400' : 'text-[#78716c]';
  const heading = isDark ? 'text-slate-100' : 'text-[#1c1917]';

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bg}`} role="status" aria-label="Loading dashboard">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: accentColor }} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative transition-colors ${bg}`}>
      <Toaster position="top-right" richColors />

      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 transition-all duration-300 ${sidebarOpen ? 'visible' : 'invisible pointer-events-none'}`}
        style={{ zIndex: sidebarOpen ? 10000 : 100 }}
        aria-hidden={!sidebarOpen}
      >
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ zIndex: sidebarOpen ? 10001 : 110 }}
          aria-label="Navigation sidebar"
        >
          <Sidebar
            companySlug={company.slug}
            companyName={company.name}
            companyLogoUrl={company.logo_url}
            currentUser={currentUser}
            onLogout={handleLogout}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            currentView="cards"
            onViewChange={() => {}}
            brandColor1={company.email_brand_color_1 || '#2563eb'}
            brandColor2={company.email_brand_color_2 || '#4f46e5'}
          />
        </aside>
      </div>

      <div className="relative z-10">
        <TrialBanner
          subscriptionStatus={company.subscription_status || 'inactive'}
          trialEndsAt={company.trial_ends_at || null}
          companySlug={company.slug}
          cancelAtPeriodEnd={company.cancel_at_period_end}
          subscriptionCancelAt={company.subscription_cancel_at}
          planTier={company.plan_tier || 'free'}
        />
        <PaymentReminderBanner
          slug={company.slug}
          planTier={planTier}
          onSelectLead={(lead: any) => openLead(lead.id)}
          allLeads={[]}
        />
        <PaymentToastPoller
          slug={company.slug}
          onSelectLead={(leadId) => openLead(leadId)}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-10 py-6 sm:py-12 relative z-10 font-sans">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between mb-8 gap-4">
          <div className="min-w-0">
            <p className={`text-sm ${subText}`}>{todayLabel}</p>
            <h1 className={`text-4xl sm:text-5xl font-light leading-tight ${heading}`}>
              {greeting}, {currentUser?.name?.split(' ')[0] || 'there'}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {company.logo_url ? (
              <div
                className="inline-flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5"
                style={{ background: `${accentColor}1a`, border: `1px solid ${accentColor}33` }}
              >
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-6 h-6 rounded-full object-contain bg-white"
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  {company.name}
                </span>
              </div>
            ) : (
              <div
                className="inline-flex items-center gap-2 rounded-full pl-2 pr-4 py-1.5"
                style={{ background: `${accentColor}1a`, border: `1px solid ${accentColor}33` }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-black"
                  style={{ background: accentColor }}
                >
                  {company.name?.charAt(0) || 'C'}
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: accentColor }}
                >
                  {company.name}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsDark((v) => !v)}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark ? 'border-white/10 bg-white/5 text-slate-300' : 'border-[#e7e2d8] bg-white text-[#57534e]'
              }`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-[#e7e2d8] bg-white"
              aria-label="Open menu"
            >
              ☰
            </button>
          </div>
        </div>

        {loadError && (
          <div className="mb-8 p-4 sm:p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center justify-between">
            <span>{loadError}</span>
            <button onClick={fetchStats} className="uppercase tracking-widest text-[10px] bg-red-500 text-white px-3 py-2 rounded-lg">Retry</button>
          </div>
        )}

        {stats && (
          <>
            {/* Stat row: Leads / Estimates / Jobs / Invoices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className={`rounded-2xl p-6 ${cardBg}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-lg ${cardText}`}>Leads</p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#1c1917] rounded-full px-3 py-1.5 hover:opacity-90 transition"
                  >
                    <Plus className="w-3 h-3" /> Add lead
                  </button>
                </div>
                <p className={`text-4xl font-semibold tabular-nums ${cardText}`}>{stats.leads.new_this_week}</p>
                <p className={`text-sm font-medium mt-2 ${cardText}`}>New</p>
                <p className={`text-xs ${subText}`}>New this week</p>
              </div>

              <button
                onClick={() => router.push(`/${company.slug}/leads?status=quoted`)}
                className={`text-left rounded-2xl p-6 ${cardBg} hover:opacity-90 transition`}
              >
                <p className={`text-lg ${cardText} mb-3`}>Estimates</p>
                <p className={`text-4xl font-semibold tabular-nums ${cardText}`}>{stats.estimates.open}</p>
                <p className={`text-sm font-medium mt-2 ${cardText}`}>Open</p>
                <p className={`text-xs ${subText}`}>{stats.estimates.accepted} accepted</p>
              </button>

              <button
                onClick={() => router.push(`/${company.slug}/leads`)}
                className={`text-left rounded-2xl p-6 ${cardBg} hover:opacity-90 transition`}
              >
                <p className={`text-lg ${cardText} mb-3`}>Jobs</p>
                <p className={`text-4xl font-semibold tabular-nums ${cardText}`}>{stats.jobs.active}</p>
                <p className={`text-sm font-medium mt-2 ${cardText}`}>Active</p>
                <p className={`text-xs ${subText}`}>{fmtMoney(stats.jobs.active_value)} booked</p>
              </button>

              <button
                onClick={() => router.push(`/${company.slug}/leads?payment=awaiting`)}
                className={`text-left rounded-2xl p-6 ${cardBg} hover:opacity-90 transition`}
              >
                <p className={`text-lg ${cardText} mb-3`}>Invoices</p>
                <p className={`text-4xl font-semibold tabular-nums ${cardText}`}>{stats.invoices.awaiting_payment}</p>
                <p className={`text-sm font-medium mt-2 ${cardText}`}>Awaiting payment</p>
                <p className={`text-xs ${subText}`}>{stats.invoices.draft} draft · {stats.invoices.past_due} past due</p>
              </button>
            </div>

            {/* Today's Schedule + Business Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <div>
                <h2 className={`text-lg font-semibold mb-3 ${heading}`}>Today&rsquo;s Schedule</h2>
                <div className={`rounded-2xl overflow-hidden ${cardBg}`}>
                  <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-[#e7e2d8]'}`}>
                    <p className={`text-2xl font-semibold ${cardText}`}>
                      {fmtMoney(stats.todays_schedule.reduce((s, j) => s + (parseFloat(String(j.quote_total || '0')) || 0), 0))}{' '}
                      <span className={`text-sm font-normal ${subText}`}>booked today</span>
                    </p>
                    <span className={`text-sm ${subText}`}>{stats.todays_schedule.length} job{stats.todays_schedule.length === 1 ? '' : 's'}</span>
                  </div>
                  {stats.todays_schedule.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <p className={`text-sm ${subText}`}>Nothing scheduled for today.</p>
                    </div>
                  ) : (
                    <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-[#e7e2d8]'}`}>
                      {stats.todays_schedule.map((job) => (
                        <button
                          key={job.project_id}
                          onClick={() => openLead(job.lead_id)}
                          className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#faf9f5]'}`}
                        >
                          <div className="min-w-0">
                            <p className={`text-sm font-mono ${subText}`}>{fmtTime(job.scheduled_time) || 'No time set'}</p>
                            <p className={`font-semibold truncate ${cardText}`}>{job.customer_name}</p>
                            <p className={`text-xs truncate ${subText}`}>{formatCategoryLabel(job.category) || 'General'}</p>
                          </div>
                          <ArrowRight className={`w-4 h-4 shrink-0 ${subText}`} />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className={`px-5 py-3 border-t ${isDark ? 'border-white/10' : 'border-[#e7e2d8]'}`}>
                    <button
                      onClick={() => router.push(`/${company.slug}/dashboard/calendar`)}
                      className={`text-sm font-semibold inline-flex items-center gap-1 ${cardText}`}
                    >
                      View full schedule <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className={`text-lg font-semibold mb-3 ${heading}`}>Business Performance</h2>
                <div className="space-y-4">
                  <div className={`rounded-2xl p-5 ${cardBg}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${cardText}`}>Revenue</p>
                      <ArrowRight className={`w-4 h-4 ${subText}`} />
                    </div>
                    <p className={`text-xs ${subText} mb-1`}>This month so far</p>
                    <p className={`text-3xl font-semibold tabular-nums ${cardText}`}>{fmtMoney(stats.revenue_this_month)}</p>
                  </div>

                  <button
                    onClick={() => router.push(`/${company.slug}/leads?status=completed`)}
                    className={`w-full text-left rounded-2xl p-5 ${cardBg} hover:opacity-90 transition`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold ${cardText}`}>Ready to invoice</p>
                      <ArrowRight className={`w-4 h-4 ${subText}`} />
                    </div>
                    <p className={`text-xs ${subText} mb-1`}>Completed jobs not yet billed</p>
                    <p className={`text-3xl font-semibold tabular-nums ${cardText}`}>{fmtMoney(stats.ready_to_invoice.value)}</p>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Payments — unlike the stat cards above, this one goes
                to Financials, not Leads, since a payment ledger belongs
                there, not in the leads-working view. */}
            <div className="mt-8">
              <h2 className={`text-lg font-semibold mb-3 ${heading}`}>Recent Payments</h2>
              <div className={`rounded-2xl overflow-hidden ${cardBg}`}>
                {stats.recent_payments.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <p className={`text-sm ${subText}`}>No payments recorded yet.</p>
                  </div>
                ) : (
                  <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-[#e7e2d8]'}`}>
                    {stats.recent_payments.map((p) => {
                      const badge = paymentStatusBadge(p.payment_status);
                      const badgeTint = badge
                        ? {
                            emerald: isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700',
                            amber: isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-700',
                            rose: isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-50 text-rose-700',
                          }[badge.tint]
                        : '';
                      return (
                        <button
                          key={p.id}
                          onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                          className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#faf9f5]'}`}
                        >
                          <div className="min-w-0">
                            <p className={`font-semibold truncate ${cardText}`}>{p.customer_name}</p>
                            <p className={`text-xs ${subText}`}>
                              {p.kind === 'deposit' ? 'Deposit' : p.kind === 'balance' ? 'Balance' : 'Payment'}
                              {' · '}
                              {fmtShortDate(p.paid_on)}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <p className={`text-sm font-semibold tabular-nums ${cardText}`}>
                              {fmtMoney(parseFloat(String(p.amount)))}
                            </p>
                            {badge && (
                              <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${badgeTint}`}>
                                {badge.label}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className={`px-5 py-3 border-t ${isDark ? 'border-white/10' : 'border-[#e7e2d8]'}`}>
                  <button
                    onClick={() => router.push(`/${company.slug}/dashboard/financials`)}
                    className={`text-sm font-semibold inline-flex items-center gap-1 ${cardText}`}
                  >
                    View all payments <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {selectedLead && (
        <LeadModal
          lead={selectedLead} onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus} onAddNote={addNote}
          onDeleteLead={deleteLead} onRefresh={refreshModalLead}
          payments={selectedLeadPayments} activity={selectedLeadActivity}
          currentUser={currentUser} statusOptions={company.status_options || []}
          categories={company.form_categories || []} company={company}
          companySlug={company.slug}
          teamMembers={teamMembers}
        />
      )}

      <CreateLeadModal
        isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchStats()} companySlug={company.slug}
        companyId={company.id} categories={company.form_categories || []}
        company={company}
      />

      <AiChatWidget
        planTier={planTier}
        allLeads={[]}
        company={company}
        isVisible={!selectedLead && !isCreateModalOpen}
        onLockedFeature={setLockedDashboardModal}
      />

      <LockedFeatureModal
        featureKey={lockedDashboardModal}
        companySlug={company.slug}
        onClose={() => setLockedDashboardModal(null)}
      />
    </div>
  );
}