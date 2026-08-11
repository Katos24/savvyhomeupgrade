'use client';

import { useState, useEffect } from 'react';
import { Calendar, FileText, CreditCard, CheckSquare, Bell, Image, AlertCircle } from 'lucide-react';
import SchedulingSection from './project-sections/SchedulingSection';
import QuoteSection from './project-sections/QuoteSection';
import BillingSection from './project-sections/BillingSection';
import MediaSection from './project-sections/MediaSection';
import TasksSection from './project-sections/TasksSection';
import RemindersSection from './project-sections/RemindersSection';

type ProjectSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  statusOptions: any[];
  onUpdateStatus: (id: number, status: string, oldStatus: string) => Promise<boolean>;
  companySlug: string;
  company: any;
  defaultTab?: string;
  teamMembers?: any[];
  /** From /api/leads/[id], passed straight to BillingSection. */
  payments?: any[];
  activity?: any[];
};

export default function ProjectSection({
  lead,
  company,
  currentUser,
  onRefresh,
  statusOptions,
  onUpdateStatus,
  companySlug,
  defaultTab,
  teamMembers = [],
  payments,
  activity,
}: ProjectSectionProps) {
  const hasProject = !!lead?.project_id;

  const resolveTab = (tab?: string) => {
    if (tab === 'schedule') return { section: 'planning', tab: 'schedule' };
    if (tab === 'tasks') return { section: 'planning', tab: 'tasks' };
    if (tab === 'reminders') return { section: 'planning', tab: 'reminders' };
    if (tab === 'quote') return { section: 'financials', tab: 'quote' };
    if (tab === 'payment') return { section: 'financials', tab: 'payment' };
    if (tab === 'photos') return { section: 'financials', tab: 'media' };
    if (tab === 'docs') return { section: 'financials', tab: 'media' };
    return { section: 'planning', tab: 'schedule' };
  };

  const resolved = resolveTab(defaultTab);
  const hideTabs = !!defaultTab;

  const [planningTab, setPlanningTab] = useState<'schedule' | 'tasks' | 'reminders'>(
    resolved.section === 'planning' ? resolved.tab as any : 'schedule'
  );
  const [financialsTab, setFinancialsTab] = useState<'quote' | 'payment' | 'media'>(
    resolved.section === 'financials' ? resolved.tab as any : 'quote'
  );
  const [activeSection, setActiveSection] = useState<'planning' | 'financials'>(
    resolved.section as 'planning' | 'financials'
  );

  useEffect(() => {
    const r = resolveTab(defaultTab);
    setActiveSection(r.section as any);
    if (r.section === 'planning') setPlanningTab(r.tab as any);
    if (r.section === 'financials') setFinancialsTab(r.tab as any);
  }, [defaultTab]);

  if (!lead) return null;

  if (!hasProject) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p className="text-amber-900 font-bold text-sm">Convert to Project First</p>
          <p className="text-amber-700 text-xs mt-1">
            To use scheduling, quotes, and payments, convert this lead to a project.
          </p>
        </div>
      </div>
    );
  }

  const planningTabs = [
    {
      id: 'schedule' as const,
      label: 'Schedule',
      icon: Calendar,
      color: '#22c55e',
      count: lead?.scheduled_date ? 1 : 0,
    },
    {
      id: 'tasks' as const,
      label: 'Tasks',
      icon: CheckSquare,
      color: '#8b5cf6',
      count: Array.isArray(lead?.tasks) ? lead.tasks.filter((t: any) => !t.completed).length : 0,
    },
    {
      id: 'reminders' as const,
      label: 'Reminders',
      icon: Bell,
      color: '#ef4444',
      count: lead?.follow_up_date ? 1 : 0,
    },
  ];

  const mediaCount = (() => {
    const before = lead?.before_photos ? (typeof lead.before_photos === 'string' ? JSON.parse(lead.before_photos) : lead.before_photos) : [];
    const after = lead?.after_photos ? (typeof lead.after_photos === 'string' ? JSON.parse(lead.after_photos) : lead.after_photos) : [];
    const docs = lead?.documents ? (typeof lead.documents === 'string' ? JSON.parse(lead.documents) : lead.documents) : [];
    return before.length + after.length + docs.length;
  })();

  const financialsTabs = [
    {
      id: 'quote' as const,
      label: 'Quote',
      icon: FileText,
      color: '#3b82f6',
      count: lead?.quote_data?.length || 0,
    },
    {
  id: 'payment' as const,
  label: 'Billing',
  icon: CreditCard,
  color: '#f59e0b',
  count: lead?.payment_amount ? 1 : 0,
},
    {
      id: 'media' as const,
      label: 'Media',
      icon: Image,
      color: '#ec4899',
      count: mediaCount,
    },
  ];

  return (
    <div className="space-y-4">

      {/* ── PLANNING SECTION ─────────────────────────── */}
      {(activeSection === 'planning' || !hideTabs) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!hideTabs && (
            <div className="px-5 py-4 border-b border-gray-50"
              style={{ background: 'linear-gradient(to right, #f0fdf4, #f0fdf9)' }}>
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5" />
                Project Planning
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                {planningTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = planningTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setPlanningTab(tab.id)}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      style={isActive ? {
                        background: '#6366f1', color: 'white',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.25)', border: '1px solid transparent',
                      } : { background: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? 'white' : tab.color }} />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                          style={isActive
                            ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                            : { background: '#eef2ff', color: '#6366f1' }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {planningTab === 'schedule' && (
            <SchedulingSection
              lead={lead}
              company={company}
              currentUser={currentUser}
              onRefresh={onRefresh}
              hasProject={hasProject}
              companySlug={companySlug}
              teamMembers={teamMembers}
            />
          )}
          {planningTab === 'tasks' && (
            <TasksSection lead={lead} currentUser={currentUser} onRefresh={onRefresh} hasProject={hasProject} />
          )}
          {planningTab === 'reminders' && (
            <RemindersSection lead={lead} currentUser={currentUser} onRefresh={onRefresh} hasProject={hasProject} />
          )}
        </div>
      )}

      {/* ── FINANCIALS SECTION ───────────────────────── */}
      {(activeSection === 'financials' || !hideTabs) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {!hideTabs && (
            <div className="px-5 py-4 border-b border-gray-50"
              style={{ background: 'linear-gradient(to right, #faf5ff, #fdf4ff)' }}>
              <h3 className="text-xs font-bold text-purple-800 uppercase tracking-widest flex items-center gap-2 mb-3">
                <CreditCard className="w-3.5 h-3.5" />
                Financials & Deliverables
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                {financialsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = financialsTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFinancialsTab(tab.id)}
                      className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      style={isActive ? {
                        background: '#7c3aed', color: 'white',
                        boxShadow: '0 4px 12px rgba(124,58,237,0.25)', border: '1px solid transparent',
                      } : { background: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: isActive ? 'white' : tab.color }} />
                      {tab.label}
                      {tab.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                          style={isActive
                            ? { background: 'rgba(255,255,255,0.2)', color: 'white' }
                            : { background: '#f5f3ff', color: '#7c3aed' }}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {financialsTab === 'quote' && (
            <QuoteSection
              lead={lead}
              currentUser={currentUser}
              onRefresh={onRefresh}
              hasProject={hasProject}
              companySlug={companySlug}
            />
          )}
          {financialsTab === 'payment' && (
  <BillingSection
    lead={lead}
    company={company}
    currentUser={currentUser}
    onRefresh={onRefresh}
    hasProject={hasProject}
    companySlug={companySlug}
    payments={payments}
    activity={activity}
  />
)}
          {financialsTab === 'media' && (
            <MediaSection lead={lead} currentUser={currentUser} onRefresh={onRefresh} hasProject={hasProject} />
          )}
        </div>
      )}

    </div>
  );
}