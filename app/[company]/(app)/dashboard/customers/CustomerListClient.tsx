'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, Mail, MapPin, Briefcase, ArrowRight, User, Phone, Search, CalendarDays, Sun, Moon } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTeamMembers } from '@/hooks/useTeamMembers';

const LeadModal = dynamic(() => import('@/components/dashboard/LeadModal'), { ssr: false });

interface Project {
  id: number;
  lead_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_address: string | null;
  status: string;
  category: string;
  updated_at: string;
  quote_total?: number | null;
  payment_status?: string | null;
}

interface CustomerGroup {
  name: string;
  email: string;
  phone: string;
  projects: Project[];
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const formatPhoneNumber = (value: string) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value;
};

export default function CustomerListClient({
  projects = [],
  companySlug,
  company, // NEW — full company object, needed by LeadModal (status_options, form_categories, etc.)
  accentColor,
}: {
  projects?: Project[];
  companySlug: string;
  company: any;
  accentColor?: string;
}) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: currentUser } = useCurrentUser();
  const { data: teamMembers } = useTeamMembers(companySlug);

  // Same lead-modal pattern as CompanyDashboardClient's openLead — fetches
  // the full lead by id and opens it in-place, instead of this page
  // previously navigating away to /dashboard?lead=X entirely.
  const [selectedLead, setSelectedLead] = useState<any>(null);
const [selectedLeadTab] = useState<'overview'>('overview');
  const [selectedLeadPayments, setSelectedLeadPayments] = useState<any[]>([]);
  const [selectedLeadActivity, setSelectedLeadActivity] = useState<any[]>([]);

  const userMeta = useCallback(() => ({
    user_name: currentUser?.name || currentUser?.email || 'Unknown User',
    user_email: currentUser?.email || '',
  }), [currentUser]);

    const openLead = useCallback(async (leadId: number) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.lead) {
        setSelectedLead(data.lead);
        setSelectedLeadPayments(data.payments || []);
        setSelectedLeadActivity(data.activity || []);
      }
    } catch (e) {
      console.error('openLead:', e);
    }
  }, []);

  const refreshModalLead = useCallback(async () => {
    if (!selectedLead) return;
    await openLead(selectedLead.id);
  }, [selectedLead, openLead]);

  const updateLeadStatus = useCallback(
    async (id: number, status: string, oldStatus: string, sendReview = true) => {
      try {
        const res = await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id, status, action: 'update_status', old_status: oldStatus,
            send_review_request: sendReview, ...userMeta(),
          }),
        });
        const result = await res.json();
        if (res.ok && result.success) {
          if (selectedLead?.id === id) setSelectedLead((prev: any) => ({ ...prev, status }));
          return true;
        }
        return false;
      } catch (e) {
        console.error('updateLeadStatus:', e);
        return false;
      }
    },
    [selectedLead, userMeta]
  );

  const addNote = useCallback(
    async (id: number, noteText: string) => {
      try {
        const res = await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, notes: noteText, action: 'add_note', ...userMeta() }),
        });
        const result = await res.json();
        return res.ok && result.success;
      } catch (e) {
        console.error('addNote:', e);
        return false;
      }
    },
    [userMeta]
  );

  const deleteLead = useCallback(
    async (id: number) => {
      try {
        const res = await fetch('/api/leads/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...userMeta() }),
        });
        const result = await res.json();
        return res.ok && result.success;
      } catch (e) {
        console.error('deleteLead:', e);
        return false;
      }
    },
    [userMeta]
  );

  // Same localStorage key and hydration-safe pattern already used on
  // Dashboard, Financials, and Services — default matches server render
  // (dark), corrected after mount from the real stored value.
  const [isDark, setIsDark] = useState<boolean>(true);
  useEffect(() => {
    setIsDark(localStorage.getItem('dashboard-theme') !== 'light');
  }, []);
  const skipFirstThemeWrite = useMemo(() => ({ current: true }), []);
  useEffect(() => {
    if (skipFirstThemeWrite.current) {
      skipFirstThemeWrite.current = false;
      return;
    }
    localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
    window.dispatchEvent(new Event('theme-changed'));
  }, [isDark]);

  const groupedCustomers = useMemo(() => {
    const groups: Record<string, CustomerGroup> = {};
    (projects || []).forEach((p) => {
      const email = p.customer_email || 'no-email@provided.com';
      if (!groups[email]) {
        groups[email] = { name: p.customer_name || 'Unknown Customer', email, phone: p.customer_phone || '', projects: [] };
      }
      groups[email].projects.push(p);
    });
    const list = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    if (!searchTerm) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );
  }, [projects, searchTerm]);

  const totalRevenueAllCustomers = useMemo(
    () => (projects || []).reduce((sum, p) => sum + (parseFloat(String(p.quote_total || 0)) || 0), 0),
    [projects]
  );
  const unpaidCount = useMemo(
    () => (projects || []).filter((p) => p.payment_status && p.payment_status !== 'paid' && parseFloat(String(p.quote_total || 0)) > 0).length,
    [projects]
  );

  if (!projects || projects.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center text-center px-4 transition-colors ${isDark ? 'bg-[#0b0f17]' : 'bg-[#faf9f5]'}`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#e7e2d8]'}`}>
          <User className={`w-7 h-7 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`} />
        </div>
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>Your customer directory</h2>
        <p className={`max-w-[300px] mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#78716c]'}`}>
          When you convert leads into projects, customers automatically appear here with their full job history.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#0b0f17]' : 'bg-[#faf9f5]'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>Customers</h1>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`}>{groupedCustomers.length} total</p>
          </div>
          <button
            onClick={() => setIsDark((v) => !v)}
            className={`shrink-0 rounded-xl border p-2.5 transition-colors ${
              isDark ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10' : 'border-[#e7e2d8] bg-white text-[#57534e] hover:bg-[#f5f1e8]'
            }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Stats strip */}
        <div className={`flex rounded-2xl border overflow-hidden mb-6 ${isDark ? 'border-white/10 bg-[#0f1420]' : 'border-[#e7e2d8] bg-white'}`}>
          {[
            { label: 'Total revenue', value: formatCurrency(totalRevenueAllCustomers), sub: 'Lifetime' },
            { label: 'Customers', value: String(groupedCustomers.length), sub: `${projects.length} job${projects.length === 1 ? '' : 's'} total` },
            { label: 'Unpaid', value: String(unpaidCount), sub: unpaidCount > 0 ? 'Job(s) outstanding' : 'Nothing owed', dot: unpaidCount > 0 },
          ].map((s, i) => (
            <div key={s.label} className={`flex-1 px-5 py-4 min-w-0 ${i > 0 ? (isDark ? 'border-l border-white/10' : 'border-l border-[#e7e2d8]') : ''}`}>
              <div className="flex items-center gap-1.5 mb-1">
                {s.dot && <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />}
                <p className={`text-sm font-medium truncate ${isDark ? 'text-slate-300' : 'text-[#292524]'}`}>{s.label}</p>
              </div>
              <p className={`text-2xl font-semibold tracking-tight truncate ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>{s.value}</p>
              <p className={`text-xs mt-1 truncate ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`} />
          <input
            type="text"
            placeholder="Search name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full rounded-full py-3 pl-11 pr-4 text-sm outline-none transition-colors border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-white/30'
                : 'bg-white border-[#e7e2d8] placeholder:text-[#a8a29e] focus:border-[#1c1917]'
            }`}
          />
        </div>

        {/* Customer list */}
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/10 bg-[#0f1420]' : 'border-[#e7e2d8] bg-white'}`}>
          {groupedCustomers.map((customer, idx) => {
            const isExpanded = expandedEmail === customer.email;
            const jobCount = customer.projects.length;
            const totalRevenue = customer.projects.reduce((sum, p) => sum + (parseFloat(String(p.quote_total || 0)) || 0), 0);
            const formattedPhone = formatPhoneNumber(customer.phone);

            return (
              <div key={customer.email} className={idx > 0 ? (isDark ? 'border-t border-white/10' : 'border-t border-[#e7e2d8]') : ''}>
                <button
                  onClick={() => setExpandedEmail(isExpanded ? null : customer.email)}
                  className={`w-full p-4 sm:p-5 flex items-center gap-4 text-left transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-[#faf9f5]'}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0 border ${
                    isDark ? 'bg-white/5 text-white border-white/10' : 'bg-[#f5f1e8] text-[#1c1917] border-[#e7e2d8]'
                  }`}>
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>{customer.name}</h3>
                    <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#78716c]'}`}>
                      {customer.email !== 'no-email@provided.com' ? customer.email : 'No email provided'}
                      {formattedPhone ? ` • ${formattedPhone}` : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`}>
                        <Briefcase className="w-3 h-3" /> {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                      </span>
                      {totalRevenue > 0 && (
                        <span className="text-xs font-medium text-emerald-500">{formatCurrency(totalRevenue)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`} />
                </button>

                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-1">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <a
                        href={`mailto:${customer.email}`}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          isDark ? 'bg-white text-[#0b0f17] hover:bg-slate-200' : 'bg-[#1c1917] text-white hover:bg-[#292524]'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" /> Email
                      </a>
                      <a
                        href={customer.phone ? `tel:${customer.phone}` : undefined}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          customer.phone
                            ? isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#292524] text-white hover:bg-[#1c1917]'
                            : isDark ? 'bg-white/5 text-slate-600 pointer-events-none' : 'bg-[#f5f1e8] text-[#a8a29e] pointer-events-none'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                    </div>

                    <div className={`flex flex-col gap-1.5 mb-4 text-xs ${isDark ? 'text-slate-400' : 'text-[#78716c]'}`}>
                      <div className="flex items-center gap-1.5">
                        <Mail className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-[#d6d3d1]'}`} />
                        {customer.email !== 'no-email@provided.com' ? customer.email : 'No email provided'}
                      </div>
                      {formattedPhone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-[#d6d3d1]'}`} />
                          {formattedPhone}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-[#d6d3d1]'}`} />
                        Customer since {new Date(customer.projects[customer.projects.length - 1].updated_at).getFullYear()}
                      </div>
                    </div>

                    <p className={`text-[11px] font-mono font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`}>Project history</p>
                    <div className="space-y-1.5">
                      {customer.projects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => openLead(project.lead_id)}
                          className={`w-full flex items-center gap-3 p-3 border rounded-xl transition-colors group text-left ${
                            isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-[#faf9f5] border-[#e7e2d8] hover:border-[#d6d3d1]'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold capitalize ${isDark ? 'text-slate-200' : 'text-[#292524]'}`}>
                                {project.category?.replace(/_/g, ' ') || 'General service'}
                              </span>
                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                  project.status === 'completed'
                                    ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                    : isDark ? 'bg-white/10 text-slate-400' : 'bg-[#e7e2d8] text-[#78716c]'
                                }`}
                              >
                                {project.status || 'Active'}
                              </span>
                            </div>
                            <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`}>
                              <MapPin className="w-3 h-3 shrink-0" />
                              <p className="text-xs truncate">{project.service_address || 'Address not listed'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {project.quote_total ? (
                              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>{formatCurrency(Number(project.quote_total))}</span>
                            ) : null}
                            <ArrowRight className={`w-3.5 h-3.5 transition-colors ${isDark ? 'text-slate-600 group-hover:text-slate-400' : 'text-[#d6d3d1] group-hover:text-[#78716c]'}`} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {groupedCustomers.length === 0 && searchTerm && (
          <div className={`text-center py-16 rounded-2xl border border-dashed mt-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#e7e2d8]'}`}>
            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-[#1c1917]'}`}>No matches found</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-[#a8a29e]'}`}>Try a different name or phone number</p>
            <button
              onClick={() => setSearchTerm('')}
              className={`mt-3 text-xs font-medium underline transition-colors ${isDark ? 'text-white hover:text-slate-300' : 'text-[#1c1917] hover:text-[#78716c]'}`}
            >
              Show all customers
            </button>
          </div>
        )}
      </div>

      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          initialTab={selectedLeadTab}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus}
          onAddNote={addNote}
          onDeleteLead={deleteLead}
          onRefresh={refreshModalLead}
          payments={selectedLeadPayments}
          activity={selectedLeadActivity}
          currentUser={currentUser}
          statusOptions={company?.status_options || []}
          categories={company?.form_categories || []}
          company={company}
          companySlug={companySlug}
          teamMembers={teamMembers}
        />
      )}
    </div>
  );
}