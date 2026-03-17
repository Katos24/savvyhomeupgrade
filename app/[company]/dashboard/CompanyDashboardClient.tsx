'use client';

import {
  useState, useEffect, useRef, useMemo, useCallback, useTransition,
} from 'react';
import {
  Search, X, Plus, Menu, Filter, ChevronDown, Download,
  Loader2, Inbox, Send, Sparkles, LayoutGrid, List, ArrowUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import LeadModal from '@/components/dashboard/LeadModal';
import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
import TrialBanner from '@/components/TrialBanner';
import { canUseAiChat, PlanTier } from '@/lib/permissions';
import PaymentReminderBanner from '@/components/PaymentReminderBanner';
import CreateLeadModal from '@/components/dashboard/CreateLeadModal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusOption = { value: string; label: string; color: string; emoji?: string };

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  status_options?: StatusOption[];
  form_categories?: any[];
  custom_questions?: any[];
  subscription_status?: string;
  trial_ends_at?: string | null;
  plan_tier?: string;
  onboarding_completed?: boolean;
  cancel_at_period_end?: boolean;
  subscription_cancel_at?: string | null;
};

type AiMessage = { role: 'user' | 'assistant'; content: string };
type TimeFilter = 'today' | 'week' | 'month' | 'all';
type ViewMode = 'cards' | 'table';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_STATUSES: StatusOption[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'quoted', label: 'Quoted', color: 'purple' },
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'in-progress', label: 'In Progress', color: 'orange' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
  { value: 'lost', label: 'Lost', color: 'gray' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDateBoundaries() {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart.getTime() - 86_400_000);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekEnd = new Date(now); weekEnd.setDate(now.getDate() + 7);
  return { now, todayStart, yesterdayStart, weekStart, monthStart, weekEnd };
}

// Render assistant markdown-lite messages safely
function AiMessageBody({ content }: { content: string }) {
  const renderInline = (text: string) =>
    text.split(/\*\*(.*?)\*\*/g).map((p, k) =>
      k % 2 === 1 ? <strong key={k}>{p}</strong> : p
    );

  return (
    <div className="space-y-1">
      {content.split('\n').map((line, j) => {
        if (!line.trim()) return null;
        if (/^[-*]\s/.test(line))
          return (
            <div key={j} className="flex gap-2">
              <span className="text-indigo-400 shrink-0 mt-0.5" aria-hidden></span>
              <span>{renderInline(line.replace(/^[-*]\s/, ''))}</span>
            </div>
          );
        if (/^\d+\.\s/.test(line))
          return (
            <div key={j} className="flex gap-2">
              <span className="text-indigo-400 shrink-0 font-bold">{line.match(/^\d+/)![0]}.</span>
              <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
            </div>
          );
        return <p key={j}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CompanyDashboardClient({ company }: { company: Company }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Lead data
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  // UI state
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('cards');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // User / team
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // AI chat
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const statusOptions: StatusOption[] = company.status_options?.length
    ? company.status_options
    : DEFAULT_STATUSES;

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const fetchLeads = useCallback(async (page = 1, silent = false) => {
    try {
      if (page === 1 && isInitialLoad) {
        // Only show full loading screen on very first ever load
      } else if (!silent) {
        setIsRefreshing(true);
      }
      const res = await fetch(`/api/company/${company.slug}/leads?page=${page}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const fresh = (data.leads || []).filter((l: any) => !l.deleted);
      setAllLeads(prev => (page === 1 ? fresh : [...prev, ...fresh]));
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      setRefreshKey(k => k + 1);
      setLoadError('');
    } catch (e) {
      console.error('Failed to fetch leads:', e);
      setLoadError('Could not load leads. Check your connection and try again.');
    } finally {
      setIsInitialLoad(false);
      setIsRefreshing(false);
    }
  }, [company.slug, isInitialLoad]);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success) setCurrentUser(data.user);
    } catch (e) { console.error('fetchCurrentUser:', e); }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/${company.slug}/team`);
      const data = await res.json();
      if (data.success) setTeamMembers(data.teamMembers || []);
    } catch (e) { console.error('fetchTeamMembers:', e); }
  }, [company.slug]);

  useEffect(() => {
    fetchLeads(1);
    fetchCurrentUser();
    fetchTeamMembers();
  }, []);

  // Scroll AI to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const userMeta = () => ({
    user_name: currentUser?.name || currentUser?.email || 'Unknown User',
    user_email: currentUser?.email || '',
  });

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    startTransition(() => router.push('/login'));
  }, [router]);

  const updateLeadStatus = useCallback(async (id: number, status: string, oldStatus: string) => {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, action: 'update_status', old_status: oldStatus, ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        // Update in-place, no refetch needed
        setAllLeads(prev =>
          prev.map(l => l.id === id ? { ...l, status } : l)
        );
        setRefreshKey(k => k + 1);
        if (selectedLead?.id === id) setSelectedLead((prev: any) => ({ ...prev, status }));
        return true;
      }
      return false;
    } catch (e) { console.error('updateLeadStatus:', e); return false; }
  }, [selectedLead, currentUser]);

  const addNote = useCallback(async (id: number, noteText: string) => {
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: noteText, action: 'add_note', ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        await fetchLeads(1, true);
        // Refresh modal lead from fresh data
        return true;
      }
      return false;
    } catch (e) { console.error('addNote:', e); return false; }
  }, [fetchLeads, currentUser]);

  const deleteLead = useCallback(async (id: number) => {
    try {
      const res = await fetch('/api/leads/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...userMeta() }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setAllLeads(prev => prev.filter(l => l.id !== id));
        setRefreshKey(k => k + 1);
        return true;
      }
      return false;
    } catch (e) { console.error('deleteLead:', e); return false; }
  }, [currentUser]);

  const handleBulkUpdate = useCallback(async (leadIds: number[], updates: any) => {
    const res = await fetch('/api/leads/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, updates, ...userMeta() }),
    });
    const result = await res.json();
    if (res.ok && result.success) await fetchLeads(1, true);
    else throw new Error(result.error || 'Bulk update failed');
  }, [fetchLeads, currentUser]);

  const handleBulkDelete = useCallback(async (leadIds: number[]) => {
    const res = await fetch('/api/leads/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, ...userMeta() }),
    });
    const result = await res.json();
    if (res.ok && result.success) {
      setAllLeads(prev => prev.filter(l => !leadIds.includes(l.id)));
      setRefreshKey(k => k + 1);
    } else throw new Error(result.error || 'Bulk delete failed');
  }, [currentUser]);

 const refreshModalLead = useCallback(async () => {
  if (!selectedLead) return;
  try {
    // Fetch just this one lead directly
    const res = await fetch(`/api/leads/${selectedLead.id}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.lead) {
        // Update modal immediately
        setSelectedLead(data.lead);
        // Also update the card in the list
        setAllLeads(prev =>
          prev.map(l => l.id === selectedLead.id ? data.lead : l)
        );
        setRefreshKey(k => k + 1);
        return;
      }
    }
  } catch (e) {
    console.error('refreshModalLead single fetch failed:', e);
  }
  // Fallback — full list refetch
  await fetchLeads(1, true);
  setAllLeads(prev => {
    const updated = prev.find(l => l.id === selectedLead.id);
    if (updated) setSelectedLead(updated);
    return prev;
  });
}, [fetchLeads, selectedLead, company.slug]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterAssignee('all');
    setFilterPayment('all');
    setTimeFilter('all');
    setStartDate('');
    setEndDate('');
  }, []);

  // -------------------------------------------------------------------------
  // AI Chat
  // -------------------------------------------------------------------------

  const aiStarterQuestions = useMemo(() => {
    if (!allLeads.length) return [
      "What's scheduled this week?",
      'Which jobs need payment?',
      'Who are my biggest customers?',
      'What should I prioritize today?',
    ];
    const { now, weekEnd } = getDateBoundaries();
    const unpaid = allLeads.filter(l => l.quote_total && l.payment_status !== 'paid');
    const unpaidTotal = unpaid.reduce((s, l) => s + parseFloat(l.quote_total || 0), 0);
    const thisWeek = allLeads.filter(l => l.scheduled_date && new Date(l.scheduled_date) >= now && new Date(l.scheduled_date) <= weekEnd);
    const unassigned = allLeads.filter(l => !l.assigned_to && l.status !== 'completed' && l.status !== 'cancelled');
    const newLeads = allLeads.filter(l => l.status === 'new');
    const qs: string[] = [];
    if (unpaid.length) qs.push(`${unpaid.length} job${unpaid.length > 1 ? 's' : ''} unpaid ($${unpaidTotal.toLocaleString('en-US', { maximumFractionDigits: 0 })} total)`);
    if (thisWeek.length) qs.push(`${thisWeek.length} job${thisWeek.length > 1 ? 's' : ''} scheduled this week`);
    if (unassigned.length) qs.push(`${unassigned.length} job${unassigned.length > 1 ? 's' : ''} unassigned`);
    if (newLeads.length) qs.push(`${newLeads.length} new lead${newLeads.length > 1 ? 's' : ''} to review`);
    if (qs.length < 4) qs.push('What should I prioritize today?');
    if (qs.length < 4) qs.push('Who are my biggest customers?');
    return qs.slice(0, 4);
  }, [allLeads]);

  const sendAiMessage = useCallback(async (message: string) => {
    if (!message.trim() || aiLoading) return;
    const userMsg: AiMessage = { role: 'user', content: message };
    const updated = [...aiMessages, userMsg];
    setAiMessages(updated);
    setAiInput('');
    setAiLoading(true);

    const { now, weekEnd } = getDateBoundaries();
    const recentLeads = [...allLeads]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);
    const todayJobs = allLeads.filter(l => l.scheduled_date && new Date(l.scheduled_date).toDateString() === now.toDateString());
    const thisWeekJobs = allLeads.filter(l => l.scheduled_date && new Date(l.scheduled_date) >= now && new Date(l.scheduled_date) <= weekEnd);
    const unpaidJobs = allLeads.filter(l => l.quote_total && l.payment_status !== 'paid');
    const unassignedJobs = allLeads.filter(l => !l.assigned_to && l.status !== 'completed' && l.status !== 'cancelled');

    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: null, customer_name: null, description: message,
          category: null, status: null, project_id: null,
          company_name: company.name, chat_mode: true,
          chat_history: updated.slice(-6),
          all_leads_summary: {
            summary: {
              total_leads: allLeads.length,
              new_leads: allLeads.filter(l => l.status === 'new').length,
              unpaid_jobs: unpaidJobs.length,
              unpaid_total: unpaidJobs.reduce((s, l) => s + parseFloat(l.quote_total || 0), 0),
              unassigned_jobs: unassignedJobs.length,
              today_scheduled: todayJobs.length,
              this_week_scheduled: thisWeekJobs.length,
            },
            today_schedule: todayJobs.map(l => ({ name: l.name, category: l.category, time: l.scheduled_time, assigned_to: l.assigned_to })),
            this_week_schedule: thisWeekJobs.map(l => ({ name: l.name, category: l.category, date: l.scheduled_date, assigned_to: l.assigned_to })),
            unpaid: unpaidJobs.map(l => ({ name: l.name, category: l.category, quote_total: l.quote_total, status: l.status })),
            unassigned: unassignedJobs.map(l => ({ name: l.name, category: l.category, status: l.status, created_at: l.created_at })),
            recent_leads: recentLeads.map(l => ({
              name: l.name, category: l.category, status: l.status, city: l.city,
              address_line_1: l.address_line_1 || null, zip_code: l.zip_code || null,
              notes: l.notes || null, description: l.description || null,
              quote_total: l.quote_total || null, payment_status: l.payment_status || null,
              scheduled_date: l.scheduled_date || null, assigned_to: l.assigned_to || null,
              created_at: l.created_at,
            })),
          },
          plan_tier: company.plan_tier || 'basic',
        }),
      });
      const data = await res.json();
      setAiMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.success && data.reply ? data.reply : 'Something went wrong. Please try again.' },
      ]);
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Connection failed. Please try again.' }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiMessages, aiLoading, allLeads, company]);

  // -------------------------------------------------------------------------
  // Derived / filtered leads
  // -------------------------------------------------------------------------

  const { todayStart, yesterdayStart, weekStart, monthStart } = getDateBoundaries();

  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allLeads
      .filter(lead => {
        if (q && !lead.name?.toLowerCase().includes(q) && !lead.email?.toLowerCase().includes(q) && !lead.phone?.includes(q)) return false;
        if (filterStatus !== 'all' && (lead.status || 'new') !== filterStatus) return false;
        if (filterCategory !== 'all' && lead.category !== filterCategory) return false;
        if (filterAssignee !== 'all') {
          if (filterAssignee === 'unassigned' && lead.assigned_to) return false;
          if (filterAssignee !== 'unassigned' && lead.assigned_to !== filterAssignee) return false;
        }
        if (filterPayment !== 'all') {
          if (filterPayment === 'paid' && lead.payment_status !== 'paid') return false;
          if (filterPayment === 'unpaid' && lead.payment_status === 'paid') return false;
        }
        const d = new Date(lead.created_at);
        if (startDate && endDate) {
          const end = new Date(endDate); end.setHours(23, 59, 59, 999);
          if (d < new Date(startDate) || d > end) return false;
        } else if (startDate && d < new Date(startDate)) return false;
        else if (endDate) {
          const end = new Date(endDate); end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        } else if (timeFilter === 'today' && d < todayStart) return false;
        else if (timeFilter === 'week' && d < weekStart) return false;
        else if (timeFilter === 'month' && d < monthStart) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allLeads, searchQuery, filterStatus, filterCategory, filterAssignee, filterPayment, startDate, endDate, timeFilter]);

  const groups = useMemo(() => [
    { title: 'Today', leads: filteredLeads.filter(l => new Date(l.created_at) >= todayStart) },
    { title: 'Yesterday', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= yesterdayStart && d < todayStart; }) },
    { title: 'Earlier This Week', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= weekStart && d < yesterdayStart; }) },
    { title: 'Older', leads: filteredLeads.filter(l => new Date(l.created_at) < weekStart) },
  ], [filteredLeads]);

  const statusCounts = useMemo(() =>
    statusOptions.reduce((acc, s) => {
      acc[s.value] = allLeads.filter(l => (l.status || statusOptions[0].value) === s.value).length;
      return acc;
    }, {} as Record<string, number>),
    [allLeads, statusOptions]
  );

  const categories = useMemo(() => [...new Set(allLeads.map(l => l.category).filter(Boolean))], [allLeads]);

  const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterAssignee !== 'all'
    || filterPayment !== 'all' || timeFilter !== 'all' || startDate || endDate || searchQuery;

  // -------------------------------------------------------------------------
  // Loading screen (first load only)
  // -------------------------------------------------------------------------

  if (isInitialLoad) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' }}
        role="status"
        aria-label="Loading dashboard"
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" aria-hidden />
          <p className="text-white text-lg font-semibold tracking-tight">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div
      className="min-h-screen relative selection:bg-indigo-500/30"
      style={{ background: 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' }}
    >
      <Toaster position="top-right" richColors />

      {/* Skip nav for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:font-bold">
        Skip to main content
      </a>

      {/* ------------------------------------------------------------------ */}
      {/* Sidebar overlay                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 ${sidebarOpen ? 'visible' : 'invisible pointer-events-none'}`}
        aria-hidden={!sidebarOpen}
      >
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 z-[110] w-72 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
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
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </aside>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Banners                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative z-10">
        <TrialBanner
          subscriptionStatus={company.subscription_status || 'inactive'}
          trialEndsAt={company.trial_ends_at || null}
          companySlug={company.slug}
          cancelAtPeriodEnd={company.cancel_at_period_end}
          subscriptionCancelAt={company.subscription_cancel_at}
        />
        <PaymentReminderBanner slug={company.slug} />
      </div>

      {/* Onboarding banner */}
      {!company.onboarding_completed && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 relative z-10">
          <div
            className="rounded-3xl border border-indigo-500/30 overflow-hidden shadow-xl"
            style={{ background: 'linear-gradient(135deg, #312e81, #1e1b4b)' }}
            role="banner"
            aria-label="Onboarding prompt"
          >
            <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                  aria-hidden
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base sm:text-lg">Finish Setting Up Your Account</h2>
                  <p className="text-indigo-300 text-xs sm:text-sm mt-0.5">Set up categories, booking forms, and templates  takes 5 minutes.</p>
                </div>
              </div>
              <a
                href="/onboarding"
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-white font-bold text-sm transition hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                Set Up Now <ChevronDown className="w-4 h-4 -rotate-90" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 relative z-10">

        {/* Top bar */}
        <header className="bg-white/[0.03] backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] px-4 py-3 sm:p-5 mb-6 border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between gap-3">

            {/* Left: hamburger + brand */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
                className="p-2.5 bg-white/5 hover:bg-indigo-600/20 rounded-xl transition border border-white/10 shrink-0"
              >
                <Menu className="w-5 h-5 text-white" aria-hidden />
              </button>

              {company.logo_url ? (
                <div className="p-1.5 bg-white rounded-xl shadow-sm shrink-0">
                  <img
                    src={company.logo_url}
                    alt={`${company.name} logo`}
                    className="h-7 w-auto max-w-[100px] sm:max-w-[130px] object-contain"
                    width={130}
                    height={28}
                  />
                </div>
              ) : (
                <div
                  className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-500/20 shrink-0"
                  aria-hidden
                >
                  {company.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0 border-l border-white/10 pl-3">
                <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate leading-none">
                  {company.name}
                </h1>
                <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold block mt-1">
                  Dashboard
                </span>
              </div>
            </div>

            {/* Right: create button + subtle refresh indicator */}
            <div className="flex items-center gap-2 shrink-0">
              {isRefreshing && (
                <span aria-live="polite" aria-label="Refreshing data" className="text-indigo-400">
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                </span>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                aria-label="Create new lead"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 bg-white text-slate-950 hover:bg-indigo-50 rounded-xl font-bold text-sm transition shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4 stroke-[3px]" aria-hidden />
                <span className="hidden xs:inline">Create</span>
              </button>
            </div>
          </div>
        </header>

        {/* Error state */}
        {loadError && (
          <div role="alert" className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm font-semibold flex items-center justify-between gap-3">
            <span>{loadError}</span>
            <button onClick={() => fetchLeads(1)} className="text-xs font-black text-red-300 hover:text-white underline">Retry</button>
          </div>
        )}

        {/* Search + filters */}
        <section aria-label="Search and filter leads" className="flex flex-col gap-3 mb-6">

          {/* Search row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" aria-hidden />
              <input
                type="search"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search leads"
                className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none text-white placeholder-white/30 text-sm font-medium transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full text-white/40 transition"
                >
                  <X className="w-3.5 h-3.5" aria-hidden />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAdvancedFilters(v => !v)}
              aria-label="Toggle advanced filters"
              aria-expanded={showAdvancedFilters}
              className={`p-3.5 rounded-xl border transition-all relative ${showAdvancedFilters ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
              <Filter className="w-5 h-5 text-white" aria-hidden />
              {hasActiveFilters && !showAdvancedFilters && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-400 rounded-full" aria-hidden />
              )}
            </button>

            {/* View toggle  hidden on mobile */}
            <div className="hidden md:flex bg-white/5 border border-white/10 rounded-xl p-1" role="group" aria-label="View mode">
              <button
                onClick={() => setCurrentView('cards')}
                aria-label="Cards view"
                aria-pressed={currentView === 'cards'}
                className={`p-2.5 rounded-lg transition ${currentView === 'cards' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" aria-hidden />
              </button>
              <button
                onClick={() => setCurrentView('table')}
                aria-label="Table view"
                aria-pressed={currentView === 'table'}
                className={`p-2.5 rounded-lg transition ${currentView === 'table' ? 'bg-indigo-600 text-white' : 'text-white/40 hover:text-white'}`}
              >
                <List className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>

          {/* Quick filter row */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value as TimeFilter)}
                aria-label="Filter by time"
                className="w-full appearance-none pl-3 pr-8 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" aria-hidden />
            </div>

            <div className="relative flex-[1.5]">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                aria-label="Filter by status"
                className="w-full appearance-none pl-3 pr-8 py-3 bg-slate-800/60 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-indigo-500/50 transition cursor-pointer"
              >
                <option value="all">All Statuses ({allLeads.length})</option>
                {statusOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label} ({statusCounts[s.value] || 0})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" aria-hidden />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                aria-label="Clear all filters"
                className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Advanced filters */}
          {showAdvancedFilters && (
            <div
              className="bg-indigo-950/30 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-indigo-500/20 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
              role="region"
              aria-label="Advanced filters"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Category', value: filterCategory, setter: setFilterCategory, options: [{ value: 'all', label: 'All Categories' }, ...categories.map(c => ({ value: c, label: c }))] },
                  { label: 'Assigned To', value: filterAssignee, setter: setFilterAssignee, options: [{ value: 'all', label: 'Everyone' }, { value: 'unassigned', label: 'Unassigned' }, ...teamMembers.map(m => ({ value: m.name, label: m.name }))] },
                  { label: 'Payment', value: filterPayment, setter: setFilterPayment, options: [{ value: 'all', label: 'All' }, { value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }] },
                ].map(({ label, value, setter, options }) => (
                  <div key={label}>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-0.5">{label}</label>
                    <select
                      value={value}
                      onChange={e => setter(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition"
                    >
                      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                ))}

                {[
                  { label: 'Start Date', value: startDate, setter: setStartDate },
                  { label: 'End Date', value: endDate, setter: setEndDate },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-0.5">{label}</label>
                    <input
                      type="date"
                      value={value}
                      onChange={e => setter(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold transition border border-red-500/20 flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" aria-hidden /> Reset All Filters
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Leads display                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Leads" aria-live="polite" aria-atomic="false">
          {filteredLeads.length === 0 ? (
            <div className="bg-white/[0.02] rounded-3xl p-16 sm:p-24 text-center border border-dashed border-white/10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-5" aria-hidden>
                <Inbox className="w-8 h-8 text-white/20" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">No leads found</h2>
              <p className="text-white/40 text-sm">
                {hasActiveFilters ? 'Try adjusting your filters or search query.' : 'Create your first lead to get started.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 text-xs text-indigo-400 font-bold hover:text-indigo-300 underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : currentView === 'cards' ? (
            <div className="space-y-10">
              {groups.map(({ title, leads }) => leads.length > 0 && (
                <section key={title} aria-label={`${title} leads`}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">{title}</h2>
                    <div className="h-px flex-1 bg-white/5" aria-hidden />
                    <span className="text-[10px] font-black bg-white/5 px-2 py-1 rounded-md text-slate-500">{leads.length}</span>
                  </div>
                  <CardsView
                    leads={leads}
                    onSelectLead={setSelectedLead}
                    statusOptions={statusOptions}
                  />
                </section>
              ))}
            </div>
          ) : (
            <div key={`table-${refreshKey}`} className="animate-in fade-in duration-300">
              <div className="mb-4 flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                  Database View <span className="text-slate-500 ml-2">{filteredLeads.length} records</span>
                </h2>
                <a
                  href={`/api/company/${company.slug}/export-csv?${new URLSearchParams({ status: filterStatus, time: timeFilter, category: filterCategory, search: searchQuery })}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg"
                  aria-label="Export leads as CSV"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden /> Export CSV
                </a>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <TableView
                  leads={filteredLeads}
                  onSelectLead={setSelectedLead}
                  statusOptions={statusOptions}
                  onBulkUpdate={handleBulkUpdate}
                  onBulkDelete={handleBulkDelete}
                  teamMembers={teamMembers}
                  categories={company.form_categories || []}
                  customQuestions={company.custom_questions || []}
                />
              </div>
            </div>
          )}
        </section>

        {/* Load more */}
        {pagination.page < pagination.pages && (
          <div className="flex justify-center pt-8">
            <button
              onClick={() => fetchLeads(pagination.page + 1)}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold rounded-2xl transition"
            >
              Load More ({pagination.total - allLeads.length} remaining)
            </button>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Modals                                                               */}
      {/* ------------------------------------------------------------------ */}

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus}
          onAddNote={addNote}
          onDeleteLead={deleteLead}
          onRefresh={refreshModalLead}
          currentUser={currentUser}
          statusOptions={statusOptions}
          categories={company.form_categories || []}
          company={company}
          companySlug={company.slug}
        />
      )}

      <CreateLeadModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchLeads(1, true)}
        companySlug={company.slug}
        companyId={company.id}
        categories={company.form_categories || []}
      />

      {/* ------------------------------------------------------------------ */}
      {/* AI Chat                                                              */}
      {/* ------------------------------------------------------------------ */}
      {!selectedLead && !isCreateModalOpen && (
        canUseAiChat(company.plan_tier as any) ? (
          <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3">

            {showAiChat && (
              <div
                className="border border-indigo-500/30 overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200"
                style={{
                  background: '#0f172a',
                  borderRadius: '20px',
                  maxHeight: '72vh',
                  width: 'min(calc(100vw - 32px), 400px)',
                }}
                role="dialog"
                aria-label="AI Assistant"
                aria-modal="true"
              >
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700 shrink-0" style={{ background: '#312e81' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center" aria-hidden>
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm">AI Assistant</span>
                  </div>
                  <button
                    onClick={() => setShowAiChat(false)}
                    aria-label="Close AI assistant"
                    className="text-white/50 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition"
                  >
                    <X className="w-4 h-4" aria-hidden />
                  </button>
                </div>

                {/* Messages */}
                <div
                  ref={chatScrollRef}
                  onScroll={() => {
                    const el = chatScrollRef.current;
                    if (el) setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 60);
                  }}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                  style={{ minHeight: 0 }}
                  aria-live="polite"
                  aria-label="Chat messages"
                >
                  {aiMessages.length === 0 && (
                    <div className="space-y-2">
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center mb-3">Quick Insights</p>
                      {aiStarterQuestions.map(q => (
                        <button
                          key={q}
                          onClick={() => sendAiMessage(q)}
                          className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 bg-white/5 border border-white/5 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/10 transition"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-[82%] px-3 py-2.5 text-sm leading-relaxed"
                        style={msg.role === 'user'
                          ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', borderRadius: '12px 12px 3px 12px' }
                          : { background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '12px 12px 12px 3px' }
                        }
                      >
                        {msg.role === 'assistant' ? <AiMessageBody content={msg.content} /> : msg.content}
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" aria-label="AI is thinking" />
                      </div>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Scroll to bottom */}
                {showScrollDown && (
                  <div className="flex justify-center pb-1">
                    <button
                      onClick={() => chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                      aria-label="Scroll to latest message"
                      className="p-1.5 bg-indigo-600/80 rounded-full text-white hover:bg-indigo-600 transition"
                    >
                      <ArrowUp className="w-3.5 h-3.5 rotate-180" aria-hidden />
                    </button>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-slate-700 flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(aiInput); } }}
                    placeholder="Ask about your leads..."
                    aria-label="Message to AI assistant"
                    className="flex-1 px-3.5 py-2.5 text-sm bg-slate-900 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-indigo-500 outline-none"
                  />
                  <button
                    onClick={() => sendAiMessage(aiInput)}
                    disabled={!aiInput.trim() || aiLoading}
                    aria-label="Send message"
                    className="p-2.5 rounded-xl bg-indigo-600 disabled:opacity-40 text-white transition hover:bg-indigo-500 active:scale-95"
                  >
                    <Send className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowAiChat(v => !v)}
              aria-label={showAiChat ? 'Close AI assistant' : 'Open AI assistant'}
              aria-expanded={showAiChat}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
              style={{
                background: showAiChat ? '#4f46e5' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
              }}
            >
              {showAiChat
                ? <X className="w-6 h-6 text-white" aria-hidden />
                : <Sparkles className="w-6 h-6 text-white" aria-hidden />
              }
            </button>
          </div>
        ) : (
          <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999]">
            <button
              onClick={() => router.push(`/${company.slug}/admin/settings#billing`)}
              aria-label="Upgrade to Pro for AI features"
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center bg-slate-900 border-2 border-slate-800 shadow-2xl transition-all hover:scale-110 active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-slate-600" aria-hidden />
              <span className="text-[9px] font-black text-amber-500 mt-0.5 uppercase">Pro</span>
            </button>
          </div>
        )
      )}
    </div>
  );
}