'use client';

import {
  useState, useEffect, useRef, useMemo, useCallback, useTransition,
} from 'react';
import {
  Search, X, Plus, Menu, Filter, ChevronDown, Download,
  Loader2, Inbox, Send, Sparkles, LayoutGrid, List, ArrowUp,
  Check, ChevronRight, Lock, Calendar, DollarSign, Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import CardsView from '@/components/dashboard/views/CardsView';
import TableView from '@/components/dashboard/views/TableView';
import CalendarView from '@/components/dashboard/views/CalendarView';
import LeadModal from '@/components/dashboard/LeadModal';
import Sidebar from '@/components/dashboard/Sidebar';
import { Toaster } from 'sonner';
import TrialBanner from '@/components/TrialBanner';
import { can, type PlanTier } from '@/lib/permissions';
import PaymentReminderBanner from '@/components/PaymentReminderBanner';
import CreateLeadModal from '@/components/dashboard/CreateLeadModal';
import { Sun, Moon } from 'lucide-react';
import DashboardTour, { useShouldShowTour } from '@/components/dashboard/DashboardTour';



// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type StatusOption = { value: string; label: string; color: string; emoji?: string };

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url?: string | null;
  phone?: string | null;
  website?: string | null;
  email_brand_color_1?: string | null;
  email_brand_color_2?: string | null;
  status_options?: StatusOption[];
  form_categories?: any[];
  form_field_config?: any;
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
type ViewMode = 'cards' | 'table' | 'calendar';

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
              <span className="text-blue-400 shrink-0 mt-0.5" aria-hidden></span>
              <span>{renderInline(line.replace(/^[-*]\s/, ''))}</span>
            </div>
          );
        if (/^\d+\.\s/.test(line))
          return (
            <div key={j} className="flex gap-2">
              <span className="text-blue-400 shrink-0 font-bold">{line.match(/^\d+/)![0]}.</span>
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
const [serverStatusCounts, setServerStatusCounts] = useState<Record<string, number>>({});  const [isInitialLoad, setIsInitialLoad] = useState(true);
const [globalStats, setGlobalStats] = useState<any>(null); // ← add here

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  // UI state
  const [selectedLead, setSelectedLead] = useState<any>(null);
const [currentView, setCurrentView] = useState<ViewMode>(() => {
  if (typeof window === 'undefined') return 'cards';
  return (localStorage.getItem('dashboard-view') as ViewMode) || 'cards';
});

useEffect(() => {
  localStorage.setItem('dashboard-view', currentView);
}, [currentView]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDark, setIsDark] = useState<boolean>(() => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem('dashboard-theme') !== 'light';
});

useEffect(() => {
  localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
}, [isDark]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const [isSearching, setIsSearching] = useState(false);
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

  // ── Tour ──
  const [tourActive, setTourActive] = useState(false);
  const showTour = useShouldShowTour(company.slug, company.onboarding_completed);

  useEffect(() => {
    if (!isInitialLoad && showTour) {
      const timer = setTimeout(() => setTourActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad, showTour]);

  const statusOptions: StatusOption[] = company.status_options?.length
    ? company.status_options
    : DEFAULT_STATUSES;

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

const fetchLeads = useCallback(async (page = 1, silent = false, overrides: Record<string, string> = {}) => {
  try {
    if (page === 1 && isInitialLoad) {
    } else if (!silent) {
      setIsRefreshing(true);
    }
    const params = new URLSearchParams({ page: String(page) });
    // Pass all active filters to the server
    const search    = overrides.search    !== undefined ? overrides.search    : searchQuery;
  const status    = overrides.status    !== undefined ? overrides.status    : filterStatus;
  const category  = overrides.category  !== undefined ? overrides.category  : filterCategory;
  const assignee  = overrides.assignee  !== undefined ? overrides.assignee  : filterAssignee;
  const payment   = overrides.payment   !== undefined ? overrides.payment   : filterPayment;
  const tFilter   = overrides.timeFilter!== undefined ? overrides.timeFilter: timeFilter;
  const sDate     = overrides.startDate !== undefined ? overrides.startDate : startDate;
  const eDate     = overrides.endDate   !== undefined ? overrides.endDate   : endDate;

    if (search)                   params.set('search',     search);
    if (status    && status    !== 'all') params.set('status',     status);
    if (category  && category  !== 'all') params.set('category',   category);
    if (assignee  && assignee  !== 'all') params.set('assignee',   assignee);
    if (payment   && payment   !== 'all') params.set('payment',    payment);
    if (tFilter   && tFilter   !== 'all') params.set('timeFilter', tFilter);
    if (sDate) params.set('startDate', sDate);
    if (eDate) params.set('endDate',   eDate);

    const res = await fetch(`/api/company/${company.slug}/leads?${params}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', Pragma: 'no-cache' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const fresh = (data.leads || []).filter((l: any) => !l.deleted);
      setAllLeads(prev => (page === 1 ? fresh : [...prev, ...fresh]));
setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
if (data.statusCounts) setServerStatusCounts(data.statusCounts);
if (data.globalStats) setGlobalStats(data.globalStats); // ← add here

      setRefreshKey(k => k + 1);
      setLoadError('');
    } catch (e) {
      console.error('Failed to fetch leads:', e);
      setLoadError('Could not load leads. Check your connection and try again.');
    } finally {
      setIsInitialLoad(false);
      setIsRefreshing(false);
    }
}, [company.slug, isInitialLoad, searchQuery, filterStatus, filterCategory, filterAssignee, filterPayment, timeFilter, startDate, endDate]);

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

  useEffect(() => {
  if (isInitialLoad) return;
  fetchLeads(1, true);
}, [filterStatus, filterCategory, filterAssignee, filterPayment, timeFilter, startDate, endDate, fetchLeads]);

  // Scroll AI to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  // ADD this useEffect after your existing useEffects:
// REPLACE WITH:
// REPLACE WITH:
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const leadId = params.get('lead');
  if (!leadId) return;

  // Try already-loaded leads first
  const lead = allLeads.find(l => l.id === parseInt(leadId));
  if (lead) {
    setSelectedLead(lead);
    window.history.replaceState({}, '', window.location.pathname);
    return;
  }

  // Only fetch if initial load is done and lead still not found
  if (isInitialLoad) return;

  // Fetch via the company leads endpoint (has full project join)
  // REPLACE WITH:
  fetch(`/api/leads/${leadId}`, { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        window.history.replaceState({}, '', window.location.pathname);
      }
    })
    .catch(() => {});
}, [allLeads, isInitialLoad]);
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
  await fetchLeads(1, true);
  if (!selectedLead) return;
  try {
    const res = await fetch(`/api/leads/${selectedLead.id}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    const data = await res.json();
    if (data.success && data.lead) setSelectedLead(data.lead);
  } catch (e) { console.error('refreshModalLead:', e); }
}, [fetchLeads, selectedLead]);

  const clearFilters = useCallback(() => {
  setSearchQuery('');
  setFilterCategory('all');
  setFilterStatus('all');
  setFilterAssignee('all');
  setFilterPayment('all');
  setTimeFilter('all');
  setStartDate('');
  setEndDate('');
  // Fetch with all filters cleared explicitly so the effect doesn't race
  fetchLeads(1, true, {
    search: '', status: 'all', category: 'all',
    assignee: 'all', payment: 'all', timeFilter: 'all',
    startDate: '', endDate: '',
  });
}, [fetchLeads]);

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
          company_name: company.name, company_slug: company.slug, chat_mode: true,
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

  const filteredLeads = useMemo(() => allLeads, [allLeads]);


  const groups = useMemo(() => [
    { title: 'Today', leads: filteredLeads.filter(l => new Date(l.created_at) >= todayStart) },
    { title: 'Yesterday', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= yesterdayStart && d < todayStart; }) },
    { title: 'Earlier This Week', leads: filteredLeads.filter(l => { const d = new Date(l.created_at); return d >= weekStart && d < yesterdayStart; }) },
    { title: 'Older', leads: filteredLeads.filter(l => new Date(l.created_at) < weekStart) },
  ], [filteredLeads]);

 const statusCounts = serverStatusCounts;


const categories = useMemo(() => 
  company.form_categories?.map((c: any) => c.value || c).filter(Boolean) || 
  [...new Set(allLeads.map(l => l.category).filter(Boolean))],
[company.form_categories, allLeads]);

const hasActiveFilters = filterStatus !== 'all' || filterCategory !== 'all' || filterAssignee !== 'all'
    || filterPayment !== 'all' || timeFilter !== 'all' || startDate || endDate || searchQuery;

 
  // -------------------------------------------------------------------------
  // Loading screen (first load only)
  // -------------------------------------------------------------------------

  if (isInitialLoad) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
style={{ background: isDark ? 'linear-gradient(to bottom right, #1e293b, #0f172a, #020617)' : '#f8fafc' }}    
    role="status"
        aria-label="Loading dashboard"
      >
        <div className="text-center">
<Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" aria-hidden />
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
className={`min-h-screen relative selection:bg-blue-500/30 ${
  isDark ? 'bg-[#1e293b]' : 'bg-gray-50'
}`}
>
      <Toaster position="top-right" richColors />

      {/* Skip nav for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-lg focus:font-bold">
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
        <PaymentReminderBanner
  slug={company.slug}
  onSelectLead={setSelectedLead}
  allLeads={allLeads}
/>
      </div>

     

  {/* --- MAIN --- */}

<main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 relative z-10">

  {/* --- TOP NAVIGATION BAR --- */}
  <header className={`rounded-2xl px-4 py-3 sm:px-6 sm:py-4 mb-8 transition-all ${
    isDark 
      ? 'bg-[#0A0C14] border border-white/10 shadow-2xl' 
      : 'bg-white border border-slate-200 shadow-sm'
  }`}>
    <div className="flex items-center justify-between gap-4">
      {/* Brand & Menu */}
      <div className="flex items-center gap-4 min-w-0">
        <button
        data-tour="sidebar-toggle" 
          onClick={() => setSidebarOpen(true)}
          className={`p-2.5 rounded-xl transition-colors ${
            isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0 border-l border-slate-200/20 pl-4">
          {company.logo_url ? (
            <img src={company.logo_url} alt="Logo" className="h-8 w-auto object-contain shrink-0" />
          ) : (
<div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-lg shadow-blue-500/20">
              {company.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className={`text-sm sm:text-lg font-black tracking-tight truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {company.name}
            </h1>
<p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500">Dashboard</p>          </div>
        </div>
      </div>

     {/* Action Area */}
<div className="flex items-center gap-2 shrink-0">
  {isRefreshing && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
  <button
    data-tour="create-lead"  
    onClick={() => setIsCreateModalOpen(true)}
    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
  >
    <Plus className="w-4 h-4 stroke-[3px]" />
    <span className="hidden sm:inline">New Lead</span>
    <span className="sm:hidden">Add</span>
  </button>
</div>
</div>
</header>

  {/* --- CRISP STATS ENGINE --- */}
<section className="grid grid-cols-4 gap-2 sm:gap-3 mb-8 w-full">
    {[
    { label: 'Leads',   value: globalStats?.total_leads ?? allLeads.length,
      light: 'bg-blue-50 border-blue-100', dark: 'bg-blue-500/15 border-blue-500/20',
      labelLight: 'text-blue-400', labelDark: 'text-blue-300/60',
      valueLight: 'text-blue-900', valueDark: 'text-blue-100' },
    { label: 'Active',  value: globalStats?.active_jobs ?? allLeads.filter(l => !['completed','cancelled','lost'].includes(l.status)).length,
      light: 'bg-blue-50 border-blue-100', dark: 'bg-blue-500/10 border-blue-500/20',
      labelLight: 'text-blue-400', labelDark: 'text-blue-300/60',
      valueLight: 'text-blue-900', valueDark: 'text-blue-100' },
    { label: 'Revenue', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(globalStats?.revenue ?? 0),
      light: 'bg-emerald-50 border-emerald-100', dark: 'bg-emerald-500/10 border-emerald-500/20',
      labelLight: 'text-emerald-500', labelDark: 'text-emerald-300/60',
      valueLight: 'text-emerald-900', valueDark: 'text-emerald-100' },
    { label: 'Pending', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(globalStats?.pending ?? 0),
      light: 'bg-amber-50 border-amber-100', dark: 'bg-amber-500/10 border-amber-500/20',
      labelLight: 'text-amber-500', labelDark: 'text-amber-300/60',
      valueLight: 'text-amber-900', valueDark: 'text-amber-100' },
  ].map((s, i) => (
    <div
      key={i}
      className={`rounded-xl border px-3 py-3 sm:px-5 sm:py-4 transition-all ${isDark ? `${s.dark}` : `${s.light} shadow-sm`}`}
    >
      <p className={`text-[9px] font-bold uppercase tracking-widest truncate mb-1.5 ${isDark ? s.labelDark : s.labelLight}`}>
        {s.label}
      </p>
      <p
        className={`font-black tracking-tight tabular-nums leading-none ${isDark ? s.valueDark : s.valueLight}`}
        style={{ fontSize: String(s.value).length > 7 ? '11px' : String(s.value).length > 5 ? '13px' : '17px' }}
      >
        {s.value}
      </p>
    </div>
  ))}
</section>

  {/* --- ERROR FEEDBACK --- */}
  {loadError && (
    <div className="mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center justify-between">
      <span>{loadError}</span>
      <button onClick={() => fetchLeads(1)} className="uppercase tracking-widest text-[10px] hover:underline">Retry System</button>
    </div>
  )}


{/* ------------------------------------------------------------------ */}
{/* Search & Filter Command Center                                      */}
{/* ------------------------------------------------------------------ */}
<section aria-label="Search and filter leads" className="mb-8 flex flex-col gap-2">
  {/* Row 1: Search + View Switcher + Theme */}
  <div className="flex items-center gap-2">
    {/* Expandable Search */}
    <div className="flex items-center flex-1 min-w-0">
      {searchQuery ? (
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-slate-400'}`} />
          <input
            autoFocus
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => {
              const val = e.target.value;
              setSearchQuery(val);
              if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
              if (val.trim().length >= 2) {
                setIsSearching(true);
                searchTimeoutRef.current = setTimeout(async () => {
                  await fetchLeads(1, true, { search: val.trim() });
                  setIsSearching(false);
                }, 400);
              } else if (val.trim() === '') {
                fetchLeads(1, true, { search: '' });
              }
            }}
            className={`w-full pl-9 pr-8 py-2.5 rounded-xl text-sm font-bold outline-none border transition-all ${
              isDark ? 'bg-[#0A0C14] border-white/10 text-white placeholder-white/20' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          />
          <button onClick={() => { setSearchQuery(''); fetchLeads(1, true, { search: '' }); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setSearchQuery(' ')}
          className={`p-2.5 rounded-xl border transition-all shrink-0 ${
            isDark ? 'bg-[#0A0C14] border-white/5 text-white/40 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm'
          }`}
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Search className="w-4 h-4" />}
        </button>
      )}
    </div>

    {/* View Switcher */}
    <div 
    data-tour="view-switcher" 
    className={`flex p-1 rounded-xl border shrink-0 ${isDark ? 'bg-[#0A0C14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
      {[
        { id: 'cards', icon: LayoutGrid },
        { id: 'table', icon: List },
        { id: 'calendar', icon: Calendar }
      ].map((v) => (
        <button
          key={v.id}
          onClick={() => setCurrentView(v.id as any)}
          className={`p-2 rounded-lg transition-all ${
            currentView === v.id
              ? 'bg-blue-500 text-white shadow-lg'
              : isDark ? 'text-white/30 hover:text-white' : 'text-slate-400 hover:text-slate-900'
          }`}
        >
          <v.icon className="w-4 h-4" />
        </button>
      ))}
    </div>

    {/* Theme Toggle */}
    <button
      data-tour="theme-toggle"  
      onClick={() => setIsDark(v => !v)}
      className={`p-2.5 rounded-xl border transition-all active:scale-95 shrink-0 ${
        isDark ? 'bg-[#0A0C14] border-white/5 text-amber-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
      }`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  </div>

  {/* Row 2: Filter Pills */}
  <div 
  data-tour="filters" 
  className="flex items-center gap-2 overflow-x-auto no-scrollbar">
    
    {/* Advanced Filter Launcher */}
    <button
      onClick={() => setShowAdvancedFilters(v => !v)}
      className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
        showAdvancedFilters || hasActiveFilters
          ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
          : isDark ? 'bg-[#0A0C14] border-white/10 text-white/60' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
      }`}
    >
      <Filter className="w-3.5 h-3.5 stroke-[3px]" />
      Filters
      <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
    </button>

    <div className={`w-px h-4 mx-1 shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />

    {/* Today */}
    <button
      onClick={() => {
        const isActive = timeFilter === 'today' && filterStatus === 'scheduled';
        setTimeFilter(isActive ? 'all' : 'today');
        setFilterStatus(isActive ? 'all' : 'scheduled');
      }}
      className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
        timeFilter === 'today' && filterStatus === 'scheduled'
          ? 'bg-emerald-600 text-white border-emerald-600'
          : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      Today
    </button>

    {/* Unpaid */}
    <button
      onClick={() => setFilterPayment(filterPayment === 'unpaid' ? 'all' : 'unpaid')}
      className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
        filterPayment === 'unpaid'
          ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20'
          : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500'
      }`}
    >
      <DollarSign className="w-3.5 h-3.5" />
      Unpaid
    </button>

    {/* New */}
    <button
      onClick={() => setFilterStatus(filterStatus === 'new' ? 'all' : 'new')}
      className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
        filterStatus === 'new'
          ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
          : isDark ? 'bg-white/5 border-white/5 text-white/40' : 'bg-white border-slate-200 text-slate-500'
      }`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      New {(serverStatusCounts['new'] || 0) > 0 && <span className="opacity-70">({serverStatusCounts['new']})</span>}
    </button>

    {hasActiveFilters && (
      <button
        onClick={clearFilters}
        className="shrink-0 p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
      >
        <X className="w-4 h-4 stroke-[3px]" />
      </button>
    )}

  </div>
  {/* Advanced Filter Dropdown */}
  <div className="relative">
    {showAdvancedFilters && (
 <div>
  {/* 1. Backdrop — desktop too, not just mobile */}
 <div 
    className="fixed inset-0 z-40"
    onClick={() => setShowAdvancedFilters(false)} 
  />

    {/* 2. Desktop Dropdown */}
    <div
      className="hidden sm:block absolute top-full left-0 mt-2 z-[200] w-[380px] rounded-2xl border shadow-2xl p-5"
      style={{
        background: isDark ? '#0D0F17' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Assignee</label>
          <select 
            value={filterAssignee} 
            onChange={e => setFilterAssignee(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all appearance-none cursor-pointer ${
              isDark ? 'bg-white/5 border-white/10 text-white hover:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all">Everyone</option>
            <option value="unassigned">Unassigned</option>
            {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Category</label>
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all appearance-none cursor-pointer ${
              isDark ? 'bg-white/5 border-white/10 text-white hover:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all">All Sectors</option>
            {categories.map(c => (
              <option key={c} value={c}>{String(c).replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Start Date</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={e => setStartDate(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-white invert-calendar' : 'bg-slate-50 border-slate-200'
            }`} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">End Date</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={e => setEndDate(e.target.value)}
            className={`w-full rounded-xl px-4 py-3 text-xs font-bold outline-none border transition-all ${
              isDark ? 'bg-white/5 border-white/10 text-white invert-calendar' : 'bg-slate-50 border-slate-200'
            }`} 
          />
        </div>
      </div>

      <div className="mb-8 space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Lifecycle Status</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(s => (
            <button 
              key={s.value} 
              onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                filterStatus === s.value 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : isDark ? 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-500'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 pt-6 border-t border-white/5">
        <button 
          onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
          className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-all"
        >
          Reset Engine
        </button>
        <button 
          onClick={() => setShowAdvancedFilters(false)}
className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20 transition-all"        >
          Apply Changes
        </button>
      </div>
    </div>

    {/* 3. Mobile Drawer - Redesigned to be Rock Solid */}
<div className="sm:hidden fixed inset-0 z-[300] flex flex-col justify-end">
  <div 
    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
    onClick={() => setShowAdvancedFilters(false)}
  />
        <div className={`relative rounded-t-[3rem] p-8 pb-12 max-h-[90vh] overflow-y-auto shadow-[0_-24px_48px_rgba(0,0,0,0.6)] ${
        isDark ? 'bg-[#0D0F17] border-t border-white/10' : 'bg-white border-t border-slate-200'
      }`}>
        <div className="w-16 h-1.5 bg-blue-500/20 rounded-full mx-auto mb-10" />
        
        <div className="space-y-10">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">Target Segment</label>
            <div className="grid grid-cols-1 gap-3">
              <select 
                value={filterAssignee} 
                onChange={e => setFilterAssignee(e.target.value)}
                className={`w-full rounded-2xl px-5 py-4 text-base font-bold border outline-none appearance-none ${
                  isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">Everyone</option>
                {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-500">Timeline</label>
            <div className="grid grid-cols-2 gap-4">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className={`w-full rounded-2xl px-5 py-4 text-sm font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className={`w-full rounded-2xl px-5 py-4 text-sm font-bold border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mt-12">
          <button 
            onClick={() => setShowAdvancedFilters(false)} 
            className="w-full py-5 rounded-[1.5rem] text-[12px] font-black uppercase tracking-[0.2em] bg-blue-500 text-white shadow-2xl shadow-blue-600/40"
          >
            Apply Filters
          </button>
          <button 
            onClick={() => { clearFilters(); setShowAdvancedFilters(false); }} 
            className="w-full py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  </div>
)}
  </div>
</section>

{/* ---------------------------------------------------------------- */}
        {/* Leads Display Engine                                             */}
        {/* ---------------------------------------------------------------- */}
        <section aria-label="Leads" aria-live="polite" className="relative">
          {filteredLeads.length === 0 ? (
            <div className={`rounded-[3rem] p-16 sm:p-32 text-center border-2 border-dashed transition-all ${
              isDark ? 'bg-white/[0.01] border-white/5' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-500/15 mb-6" aria-hidden>
                <Inbox className="w-10 h-10 text-blue-500/40" />
              </div>
              <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>No leads found</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                {hasActiveFilters ? 'No leads match your filters.' : 'Create your first lead to get started.'}
              </p>
              {hasActiveFilters && (
                <button 
                  onClick={clearFilters} 
                  className="mt-8 px-6 py-3 rounded-xl bg-blue-500 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : currentView === 'calendar' ? (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <CalendarView
                leads={allLeads}
                onSelectLead={setSelectedLead}
                statusOptions={statusOptions}
                isDark={isDark}
              />
            </div>
          ) : currentView === 'cards' ? (
            <div className="space-y-16">
              {groups.map(({ title, leads }) => leads.length > 0 && (
                <section key={title} aria-label={`${title} leads`} className="relative">
                  <div className="flex items-center gap-4 mb-8 sticky top-0 z-10 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {title}
                      </h2>
                    </div>
                    <div className={`h-px flex-1 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} aria-hidden />
                    {title !== 'Older' && (
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${
                        isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                      }`}>
                        {leads.length}
                      </span>
                    )}
                  </div>
                  
                  <CardsView
                    leads={leads}
                    onSelectLead={setSelectedLead}
                    statusOptions={statusOptions}
                    isDark={isDark}
                    planTier={company.plan_tier || 'starter'}
                  />
                </section>
              ))}
            </div>
          ) : (
            <div key={`table-${refreshKey}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                 <h2 className={`text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    All Leads
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {filteredLeads.length} records
                  </p>
                </div>

                {can((company.plan_tier || 'basic') as PlanTier, 'csv_export') ? (
                  <a
                    href={`/api/company/${company.slug}/export-csv`}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${
                      isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                    }`}
                  >
                    Export CSV
                  </a>
                ) : (
                  <button
                    onClick={() => router.push(`/${company.slug}/admin/settings#billing`)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-slate-200 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Export (PRO)
                  </button>
                )}
              </div>

              <div className={`rounded-[2rem] overflow-hidden border shadow-2xl transition-all ${
                isDark ? 'bg-[#0A0C14] border-white/5' : 'bg-white border-slate-200'
              }`}>
                <TableView
                  leads={filteredLeads}
                  onSelectLead={setSelectedLead}
                  statusOptions={statusOptions}
                  onBulkUpdate={handleBulkUpdate}
                  onBulkDelete={handleBulkDelete}
                  teamMembers={teamMembers}
                  categories={company.form_categories || []}
                  customQuestions={company.custom_questions || []}
                  isDark={isDark} 
                />
              </div>
            </div>
          )}
        </section>

        {/* Load More Controller */}
        {pagination.page < pagination.pages && (
          <div className="flex justify-center pt-16 pb-12">
            <button
              onClick={() => fetchLeads(pagination.page + 1, false)}
              className={`group flex flex-col items-center gap-3 transition-all active:scale-95`}
            >
              <div className={`px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] border-2 transition-all ${
                isDark 
                ? 'bg-transparent border-white/10 text-white hover:bg-white hover:text-black hover:border-white' 
                : 'bg-white border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
              }`}>
                Load Next Batch
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {pagination.total - allLeads.length} records remaining
              </span>
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
          company={company}

      />

      {/* ------------------------------------------------------------------ */}
      {/* AI Chat                                                              */}
      {/* ------------------------------------------------------------------ */}
     {!selectedLead && !isCreateModalOpen && (
        can((company.plan_tier || 'basic') as PlanTier, 'ai_chat') ? (
          <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col items-end gap-3">

            {showAiChat && (
              <div
                className="overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-200"
                style={{
                  background: '#0f1a0f',
                  border: '1px solid #1a3a1a',
                  borderRadius: '20px',
                  maxHeight: '72vh',
                  width: 'min(calc(100vw - 32px), 400px)',
                }}
                role="dialog"
                aria-label="AI Assistant"
                aria-modal="true"
              >
                {/* Chat header */}
                <div
                  className="flex items-center justify-between px-4 py-3.5 shrink-0"
                  style={{ background: '#14532d', borderBottom: '1px solid #1a3a1a' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                      <Sparkles className="w-3.5 h-3.5" style={{ color: '#4ade80' }} />
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
                      <p className="text-[10px] font-black uppercase tracking-widest text-center mb-3" style={{ color: '#4ade80' }}>Quick Insights</p>
                      {aiStarterQuestions.map(q => (
                        <button
                          key={q}
                          onClick={() => sendAiMessage(q)}
                          className="w-full text-left px-3.5 py-2.5 text-xs text-slate-300 rounded-xl transition"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(74,222,128,0.3)';
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(74,222,128,0.05)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)';
                            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                          }}
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
                          ? { background: '#16a34a', color: 'white', borderRadius: '12px 12px 3px 12px' }
                          : { background: '#1a2a1a', color: '#e2e8f0', border: '1px solid #1a3a1a', borderRadius: '12px 12px 12px 3px' }
                        }
                      >
                        {msg.role === 'assistant' ? <AiMessageBody content={msg.content} /> : msg.content}
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="px-3 py-2.5 rounded-xl" style={{ background: '#1a2a1a', border: '1px solid #1a3a1a' }}>
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#4ade80' }} aria-label="AI is thinking" />
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
                      className="p-1.5 rounded-full text-white transition"
                      style={{ background: '#16a34a' }}
                    >
                      <ArrowUp className="w-3.5 h-3.5 rotate-180" aria-hidden />
                    </button>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 flex gap-2 shrink-0" style={{ borderTop: '1px solid #1a3a1a' }}>
                  <input
                    type="text"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(aiInput); } }}
                    placeholder="Ask about your leads..."
                    aria-label="Message to AI assistant"
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl text-white placeholder-white/30 outline-none"
                    style={{ background: '#0f1a0f', border: '1px solid #1a3a1a' }}
                  />
                  <button
                    onClick={() => sendAiMessage(aiInput)}
                    disabled={!aiInput.trim() || aiLoading}
                    aria-label="Send message"
                    className="p-2.5 rounded-xl disabled:opacity-40 text-white transition active:scale-95"
                    style={{ background: '#16a34a' }}
                  >
                    <Send className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              </div>
            )}

            <button
              data-tour="ai-chat"
              onClick={() => setShowAiChat(v => !v)}
              aria-label={showAiChat ? 'Close AI assistant' : 'Open AI assistant'}
              aria-expanded={showAiChat}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
              style={{
                background: showAiChat ? '#15803d' : '#16a34a',
                boxShadow: '0 8px 32px rgba(22, 163, 74, 0.35)',
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
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95"
              style={{ background: '#0f1a0f', border: '2px solid #1a3a1a' }}
            >
              <Sparkles className="w-5 h-5" style={{ color: '#2a4a2a' }} aria-hidden />
              <span className="text-[9px] font-black mt-0.5 uppercase" style={{ color: '#4ade80' }}>Pro</span>
            </button>
          </div>
        )
      )}

      {/* ── Dashboard Tour ── */}
      {tourActive && (
        <DashboardTour
          companyName={company.name}
          companySlug={company.slug}
          userName={currentUser?.name}
          isDark={isDark}
          onToggleTheme={() => setIsDark(v => !v)}
          onToggleView={(view) => setCurrentView(view)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onComplete={() => setTourActive(false)}
        />
      )}
    </div>
  );
}