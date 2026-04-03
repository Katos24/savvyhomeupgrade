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
const [serverStatusCounts, setServerStatusCounts] = useState<Record<string, number>>({});  const [isInitialLoad, setIsInitialLoad] = useState(true);
const [globalStats, setGlobalStats] = useState<any>(null); // ← add here

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');

  // UI state
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('cards');
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

  // Setup checklist
  const setupItems = [
    !!company.logo_url,
    (company.form_categories?.length || 0) >= 3,
    !!company.phone,
    !!company.website,
  ];
  const setupDoneCount = setupItems.filter(Boolean).length;
  const setupComplete = setupDoneCount === setupItems.length;

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
  className={`min-h-screen relative selection:bg-indigo-500/30 ${
  isDark ? 'bg-[#1e293b]' : 'bg-gray-50'
}`}
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
        <PaymentReminderBanner
  slug={company.slug}
  onSelectLead={setSelectedLead}
  allLeads={allLeads}
/>
      </div>

      {/* Onboarding banner */}
{!setupComplete && (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 relative z-10">
    <div
      className="rounded-2xl border border-indigo-500/20 px-5 py-4 flex items-center gap-4"
      style={{ background: 'rgba(99,102,241,0.08)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white leading-snug">
          Your booking link isn't live yet —{' '}
          <span className="text-indigo-300">customers can't find you.</span>
        </p>
        <div className="flex items-center gap-3 mt-2.5">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(setupDoneCount / setupItems.length) * 100}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              }}
            />
          </div>
          <p className="text-[11px] font-black text-white/30 shrink-0 tabular-nums">
            {setupDoneCount}/{setupItems.length} done
          </p>
        </div>
      </div>
            <a
                      
              href={`/${company.slug}/admin/settings`}
              className="shrink-0 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white rounded-xl transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
               Complete Setup
      </a>
    </div>
  </div>
)}

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                         */}
      {/* ------------------------------------------------------------------ */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 relative z-10">

        {/* Top bar */}
        <header className={`backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] px-4 py-3 sm:p-5 mb-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center justify-between gap-3">

            {/* Left: hamburger + brand */}
            <div className="flex items-center gap-3 min-w-0">
              <button
  onClick={() => setSidebarOpen(true)}
  aria-label="Open navigation"
  className={`p-2.5 rounded-xl transition border shrink-0 ${
    isDark
      ? 'bg-white/5 hover:bg-indigo-600/20 border-white/10'
      : 'bg-gray-100 hover:bg-indigo-50 border-gray-200'
  }`}
>
  <Menu className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-700'}`} aria-hidden />
</button>

              {company.logo_url ? (
                <div className="p-1.5 bg-white rounded-xl shadow-sm shrink-0">
                  <img
                    src={company.logo_url}
                    alt={`${company.name} logo`}
className="h-9 w-auto max-w-[120px] sm:max-w-[160px] object-contain"
                    width={130}
                    height={28}
                  />
                </div>
              ) : (
                <div
                  className="w-11 h-11 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20 shrink-0"
                  aria-hidden
                >
                  {company.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0 border-l border-white/10 pl-3">
                <h1 className={`text-sm sm:text-base font-black tracking-tight truncate leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
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

{/* Stats bar — desktop full, mobile slim */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-6">
  {(() => {
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
    const gs = globalStats;
   return [
  { label: 'Total Leads',      value: gs?.total_leads ?? allLeads.length,        color: isDark ? 'text-white' : 'text-gray-900' },
  { label: 'Active Jobs',      value: gs?.active_jobs ?? allLeads.filter(l => !['completed','cancelled','lost'].includes(l.status)).length, color: 'text-blue-500' },
  { label: 'Total Revenue',    value: fmt(gs?.revenue ?? 0),                     color: 'text-emerald-500' },
  { label: 'Total Pending',    value: fmt(gs?.pending ?? 0),                     color: 'text-amber-500'   },
].map((s, i) => (
      <div key={i} className={`border rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-4 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-200'}`}>
  <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 md:mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{s.label}</p>
<p className={`text-lg md:text-2xl font-black ${s.color}`}>{s.value}</p>
      </div>
    ));
  })()}
</div>
      

        {/* Error state */}
        {loadError && (
          <div role="alert" className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm font-semibold flex items-center justify-between gap-3">
            <span>{loadError}</span>
            <button onClick={() => fetchLeads(1)} className="text-xs font-black text-red-300 hover:text-white underline">Retry</button>
          </div>
        )}

   {/* Search + filters */}
<section aria-label="Search and filter leads" className="flex flex-col gap-3 mb-6">

  {/* Row 1 — Search + Views */}
  <div className="flex items-center gap-2">
    <div className="relative flex-1 group">
      {isSearching
        ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
        : <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-indigo-400 transition-colors" aria-hidden />
      }
      <input
        type="search"
        placeholder="Search by name, email or phone..."
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
        aria-label="Search leads"
        className={`w-full pl-11 pr-10 py-3.5 rounded-xl focus:border-indigo-500 focus:outline-none text-sm font-medium transition-all ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-white/30' : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400'}`}
      />
      {searchQuery && (
        <button
          onClick={() => { setSearchQuery(''); fetchLeads(1, true, { search: '' }); }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded-full text-white/40 transition"
        >
          <X className="w-3.5 h-3.5" aria-hidden />
        </button>
      )}
    </div>

    <button
      onClick={() => setIsDark(v => !v)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2.5 rounded-xl border transition ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>

    <div className={`flex rounded-xl p-1 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`} role="group" aria-label="View mode">
      <button onClick={() => setCurrentView('cards')} className={`p-2.5 rounded-lg transition ${currentView === 'cards' ? 'bg-indigo-600 text-white' : isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
        <LayoutGrid className="w-4 h-4" aria-hidden />
      </button>
      <button onClick={() => setCurrentView('table')} className={`p-2.5 rounded-lg transition ${currentView === 'table' ? 'bg-indigo-600 text-white' : isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
        <List className="w-4 h-4" aria-hidden />
      </button>
      <button onClick={() => setCurrentView('calendar')} className={`p-2.5 rounded-lg transition ${currentView === 'calendar' ? 'bg-indigo-600 text-white' : isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}>
        <Calendar className="w-4 h-4" aria-hidden />
      </button>
    </div>
  </div>

  {/* Row 2 — Smart pills + Filters dropdown */}
<div className="relative">
<div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
    {/* Scheduled Today */}
    <button
      onClick={() => {
        const isActive = timeFilter === 'today' && filterStatus === 'scheduled';
        setTimeFilter(isActive ? 'all' : 'today');
        setFilterStatus(isActive ? 'all' : 'scheduled');
      }}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
        timeFilter === 'today' && filterStatus === 'scheduled'
          ? 'bg-indigo-600 text-white border-indigo-500'
          : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Clock className="w-3 h-3" />
      <span className="hidden sm:inline">Scheduled Today</span>
      <span className="sm:hidden">Today</span>
    </button>

    {/* Unpaid */}
    <button
      onClick={() => setFilterPayment(filterPayment === 'unpaid' ? 'all' : 'unpaid')}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
        filterPayment === 'unpaid'
          ? 'bg-indigo-600 text-white border-indigo-500'
          : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <DollarSign className="w-3 h-3" />
      Unpaid
    </button>

    {/* New */}
    <button
      onClick={() => setFilterStatus(filterStatus === 'new' ? 'all' : 'new')}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
        filterStatus === 'new'
          ? 'bg-indigo-600 text-white border-indigo-500'
          : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Sparkles className="w-3 h-3" />
      New {(serverStatusCounts['new'] || 0) > 0 && `(${serverStatusCounts['new']})`}
    </button>

    {/* Filters button */}
    <button
      onClick={() => setShowAdvancedFilters(v => !v)}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
        showAdvancedFilters || filterCategory !== 'all' || filterAssignee !== 'all' || startDate || endDate || (timeFilter !== 'all' && !(timeFilter === 'today' && filterStatus === 'scheduled')) || (filterStatus !== 'all' && filterStatus !== 'new') || filterPayment === 'paid'
          ? 'bg-indigo-600 text-white border-indigo-500'
          : isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Filter className="w-3 h-3" />
      Filters
      <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
    </button>

    {/* Clear — only when active */}
    {hasActiveFilters && (
      <button
        onClick={clearFilters}
        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
      >
        <X className="w-3 h-3" />
        Clear
      </button>
      
    )}

</div>
    {/* Filters dropdown — desktop */}
    {showAdvancedFilters && (
      <>
        {/* Click outside */}
        <div className="fixed inset-0 z-40" onClick={() => setShowAdvancedFilters(false)} />

        {/* Desktop dropdown */}
        <div className={`hidden sm:block absolute top-full left-0 mt-2 z-50 rounded-2xl border shadow-2xl p-4 w-80 animate-in fade-in slide-in-from-top-2 duration-150 ${
          isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'
        }`}>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Assignee</label>
              <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold outline-none transition ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                <option value="all">Everyone</option>
                <option value="unassigned">Unassigned</option>
                {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Category</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold outline-none transition ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                <option value="all">All</option>
{categories.map(c => (
  <option key={c} value={c}>
    {String(c).replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
  </option>
))}
              </select>
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Start date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold outline-none transition ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`} />
            </div>
            <div>
              <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>End date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 text-xs font-bold outline-none transition ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`} />
            </div>
          </div>

          {/* Time */}
          <div className="mb-3">
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Time period</label>
            <div className="flex gap-1.5">
              {(['all', 'today', 'week', 'month'] as const).map(t => (
                <button key={t} onClick={() => setTimeFilter(t)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                    timeFilter === t ? 'bg-indigo-600 text-white border-indigo-500'
                    : isDark ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}>
                  {t === 'all' ? 'All' : t === 'today' ? 'Today' : t === 'week' ? 'Week' : 'Month'}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mb-3">
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Status</label>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map(s => (
                <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                    filterStatus === s.value ? 'bg-indigo-600 text-white border-indigo-500'
                    : isDark ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}>
                  {s.label} {(serverStatusCounts[s.value] || 0) > 0 && `(${serverStatusCounts[s.value]})`}
                </button>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="mb-4">
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Payment</label>
            <div className="flex gap-1.5">
              {['all', 'paid', 'unpaid'].map(p => (
                <button key={p} onClick={() => setFilterPayment(p)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition capitalize ${
                    filterPayment === p ? 'bg-indigo-600 text-white border-indigo-500'
                    : isDark ? 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                  }`}>
                  {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={`flex gap-2 pt-3 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <button onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition">
              Clear all
            </button>
            <button onClick={() => setShowAdvancedFilters(false)}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition">
              Done
            </button>
          </div>
        </div>

        {/* Mobile bottom sheet */}
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdvancedFilters(false)} />
          <div className={`relative rounded-t-3xl p-5 pb-8 max-h-[80vh] overflow-y-auto ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="flex justify-center mb-4">
              <div className={`w-10 h-1 rounded-full ${isDark ? 'bg-white/20' : 'bg-gray-200'}`} />
            </div>
            <p className={`text-sm font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Filters</p>

            <div className="space-y-4">
              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Assignee</label>
                <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)}
                  className={`w-full rounded-xl px-3 py-3 text-sm font-bold outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  <option value="all">Everyone</option>
                  <option value="unassigned">Unassigned</option>
                  {teamMembers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Category</label>
                <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
                  className={`w-full rounded-xl px-3 py-3 text-sm font-bold outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}>
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Time period</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['all', 'today', 'week', 'month'] as const).map(t => (
                    <button key={t} onClick={() => setTimeFilter(t)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                        timeFilter === t ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}>
                      {t === 'all' ? 'All' : t === 'today' ? 'Today' : t === 'week' ? 'Week' : 'Month'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Status</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(s => (
                    <button key={s.value} onClick={() => setFilterStatus(filterStatus === s.value ? 'all' : s.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        filterStatus === s.value ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}>
                      {s.label} {(serverStatusCounts[s.value] || 0) > 0 && `(${serverStatusCounts[s.value]})`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Payment</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['all', 'paid', 'unpaid'].map(p => (
                    <button key={p} onClick={() => setFilterPayment(p)}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition capitalize ${
                        filterPayment === p ? 'bg-indigo-600 text-white border-indigo-500'
                        : isDark ? 'bg-white/5 border-white/10 text-white/50' : 'bg-gray-50 border-gray-200 text-gray-500'
                      }`}>
                      {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Start date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2.5 text-sm font-bold outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`} />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-widest mb-1.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>End date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2.5 text-sm font-bold outline-none ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-gray-50 border border-gray-200 text-gray-900'}`} />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { clearFilters(); setShowAdvancedFilters(false); }}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                Clear all
              </button>
              <button onClick={() => setShowAdvancedFilters(false)}
                className="flex-1 py-3.5 rounded-xl text-sm font-bold bg-indigo-600 text-white">
                Done
              </button>
            </div>
          </div>
        </div>
      </>
    )}
  </div>

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
          ) : currentView === 'calendar' ? (
  <CalendarView
    leads={allLeads}
    onSelectLead={setSelectedLead}
    statusOptions={statusOptions}
    isDark={isDark}
  />
) : currentView === 'cards' ? (
            <div className="space-y-10">
              {groups.map(({ title, leads }) => leads.length > 0 && (
                <section key={title} aria-label={`${title} leads`}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">{title}</h2>
<div className={`h-px flex-1 ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} aria-hidden />
<span className={`text-[10px] font-black px-2 py-1 rounded-md ${isDark ? 'bg-white/5 text-slate-500' : 'bg-gray-100 text-gray-400'}`}>{leads.length}</span>
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
            <div key={`table-${refreshKey}`} className="animate-in fade-in duration-300">
              <div className="mb-4 flex items-center justify-between px-1">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                  Database View <span className="text-slate-500 ml-2">{filteredLeads.length} records</span>
                </h2>
{can((company.plan_tier || 'basic') as PlanTier, 'csv_export') ? (
  <a
href={`/api/company/${company.slug}/export-csv`}
    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700"
  >
    Export CSV
  </a>
) : (
  <button
    onClick={() => router.push(`/${company.slug}/admin/settings#billing`)}
    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-400 text-xs font-bold rounded-xl border border-slate-700"
  >
    <Lock className="w-3.5 h-3.5" />
    Export CSV
  </button>
)}
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
                  isDark={isDark} 
                />
              </div>
            </div>
          )}
        </section>

        {/* Load more */}
        {pagination.page < pagination.pages && (
          <div className="flex justify-center pt-8">
            <button
  onClick={() => fetchLeads(pagination.page + 1, false)}
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