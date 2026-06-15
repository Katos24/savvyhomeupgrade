'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  X, Trash2, Lock, Sparkles, LayoutGrid,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectSection from '@/components/dashboard/ProjectSection';
import AiBriefTab from '@/components/dashboard/AiBriefTab';
import LeadModalHeader from '@/components/dashboard/LeadModalHeader';
import LeadOverviewTab from '@/components/dashboard/LeadOverviewTab';
import LeadActivityTab from '@/components/dashboard/LeadActivityTab';
import CompletionSummaryModal from './CompletionSummaryModal';
import { canDeleteLead, can, type PlanTier } from '@/lib/permissions';
import LockedTabsPreview from '@/components/dashboard/LockedTabsPreview';


type TopTab = 'overview' | 'schedule' | 'quote' | 'payment' | 'tasks' | 'photos' | 'activity' | 'reminders' | 'ai';

type LeadModalProps = {
  lead: any;
  onClose: () => void;
  onUpdateStatus: (id: number, status: string, oldStatus: string) => Promise<boolean>;
  onAddNote: (id: number, noteText: string) => Promise<boolean>;
  onDeleteLead: (id: number) => Promise<boolean>;
  onRefresh: () => Promise<void>;
  currentUser: any;
  statusOptions: any[];
  categories: any[];
  company?: any;
  companySlug: string;
  teamMembers?: any[];
};

export default function LeadModal({
  lead,
  onClose,
  onUpdateStatus,
  onAddNote,
  onDeleteLead,
  onRefresh,
  currentUser,
  statusOptions,
  categories = [],
  company,
  companySlug,
  teamMembers = [],
}: LeadModalProps) {
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<TopTab>('overview');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(lead.status || statusOptions[0]?.value);
  const [lockedFeatureModal, setLockedFeatureModal] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [relatedLeads, setRelatedLeads] = useState<any[]>([]);
  const [quoteTemplates, setQuoteTemplates] = useState<any[]>([]);

  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const isProject = !!lead.project_id;
  const userRole = currentUser?.role || 'member';
  const canDelete = canDeleteLead(userRole);

  useEffect(() => {
    setSelectedStatus(lead.status || statusOptions[0]?.value);
  }, [lead.id, lead.status]);

  useEffect(() => {
    if (!lead.name || !lead.city || !lead.company_id) return;
    const params = new URLSearchParams({
      name: lead.name, city: lead.city, company_id: String(lead.company_id),
      exclude: String(lead.id), ...(lead.email ? { email: lead.email } : {}),
    });
    fetch(`/api/leads/related?${params}`)
      .then(r => r.json())
      .then(data => { if (data.leads?.length) setRelatedLeads(data.leads); })
      .catch(() => {});
  }, [lead.id]);



  const customerPhotos = useMemo(() =>
    Array.isArray(lead.file_urls)
      ? lead.file_urls.map((f: any) => typeof f === 'string' ? f : f?.url || f?.path || '').filter(Boolean)
      : [],
    [lead.file_urls]);

  const getStatusConfig = (val: string) => statusOptions.find(s => s.value === val) || statusOptions[0];

  const handleStatusChange = async (newStatus: string) => {
    const oldStatus = lead.status || statusOptions[0]?.value;
    if (isUpdatingStatus || newStatus === oldStatus) return;
    setIsUpdatingStatus(true);
    setSelectedStatus(newStatus);
    try {
      const success = await onUpdateStatus(lead.id, newStatus, oldStatus);
      if (success) {
        const oldLabel = getStatusConfig(oldStatus)?.label || oldStatus;
        const newLabel = getStatusConfig(newStatus)?.label || newStatus;
        await onAddNote(lead.id, `Status changed from "${oldLabel}" to "${newLabel}"`);
        toast.success('Status updated!');
        await onRefresh();
      } else {
        toast.error('Failed to update status');
        setSelectedStatus(oldStatus);
      }
    } catch {
      toast.error('Failed to update status');
      setSelectedStatus(oldStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveStatusWithCheck = (newStatus: string) => {
    const oldStatus = lead.status || statusOptions[0]?.value;
    if (newStatus === 'completed' && newStatus !== oldStatus) {
      setSelectedStatus(newStatus);
      setShowCompletionSummary(true);
      return;
    }
    handleStatusChange(newStatus);
  };

  const handleDelete = async () => {
    setSaving(true);
    const success = await onDeleteLead(lead.id);
    setSaving(false);
    if (success) { toast.success('Lead deleted!'); onClose(); }
    else toast.error('Failed to delete lead');
  };

  {/* Locked preview for free plan non-project leads */}
{!isProject && activeTab !== 'overview' && activeTab !== 'activity' && activeTab !== 'ai' && (
  <LockedTabsPreview companySlug={companySlug} activeTab={activeTab} />
)}

  const renderProjectTab = () => {
    if (activeTab === 'overview' || activeTab === 'activity' || activeTab === 'ai' || !isProject) return null;

    const lockedInfo: Record<string, { title: string; description: string; plan: string }> = {
      schedule:  { title: 'Job Scheduling',      description: 'Schedule jobs, set arrival times, and manage your crew calendar.', plan: 'Basic' },
      quote:     { title: 'Quote Builder',       description: 'Build professional quotes with line items and send them in one click.', plan: 'Basic' },
      payment:   { title: 'Payment Tracking',    description: 'Track payments, send reminders, and mark jobs as paid.', plan: 'Basic' },
      tasks:     { title: 'Task Lists',          description: 'Build task checklists for each job and track completion.', plan: 'Basic' },
      photos:    { title: 'Media & Documents',   description: 'Upload before/after photos and job documents.', plan: 'Basic' },
      reminders: { title: 'Follow-up Reminders', description: 'Set follow-up dates and get reminded to check in.', plan: 'Basic' },
    };

    const tabs: Record<string, { locked: boolean }> = {
      schedule:  { locked: !can(planTier, 'scheduling') },
      quote:     { locked: !can(planTier, 'quotes') },
      payment:   { locked: !can(planTier, 'quotes') },
      tasks:     { locked: !can(planTier, 'custom_tasks') },
      photos:    { locked: !can(planTier, 'docs_on_card') },
      reminders: { locked: !can(planTier, 'scheduling') },
    };

    if (tabs[activeTab]?.locked) {
      const info = lockedInfo[activeTab] || { title: 'Upgrade Required', description: 'This feature requires a higher plan.', plan: 'Basic' };
      return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">{info.title}</h3>
          <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">{info.description}</p>
          <a href={`/${companySlug}/admin/settings#billing`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
            Upgrade to {info.plan} — $49.99/mo
          </a>
        </div>
      );
    }

    return (
      <ProjectSection
        lead={lead}
        company={company}
        currentUser={currentUser}
        onRefresh={onRefresh}
        statusOptions={statusOptions}
        onUpdateStatus={onUpdateStatus}
        companySlug={companySlug}
        defaultTab={activeTab}
        teamMembers={teamMembers}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      {/* ── LOCKED FEATURE MODAL ── */}
      <AnimatePresence>
        {lockedFeatureModal && (() => {
          const featureInfo: Record<string, { title: string; desc: string; plan: string }> = {
            schedule:  { title: 'Job Scheduling',    desc: 'Set job dates, arrival windows, and manage your crew calendar.', plan: 'Basic' },
            quote:     { title: 'Quote Builder',     desc: 'Build professional quotes with line items and send them in one click.', plan: 'Basic' },
            payment:   { title: 'Payment Tracking',  desc: 'Track payments, send reminders, and mark jobs as paid.', plan: 'Basic' },
            tasks:     { title: 'Task Management',   desc: 'Create task checklists for each job type and track completion.', plan: 'Basic' },
            photos:    { title: 'Media & Documents', desc: 'Upload before & after photos and attach job documents.', plan: 'Basic' },
            reminders: { title: 'Follow-up Reminders', desc: 'Set follow-up dates and get reminded to check in.', plan: 'Basic' },
            ai:        { title: 'AI Assistant',      desc: 'Get AI-generated job summaries, scope analysis, and smart suggestions.', plan: 'Pro' },
          };
          const info = featureInfo[lockedFeatureModal] || { title: 'Premium Feature', desc: 'This feature requires a higher plan.', plan: 'Basic' };
          return (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
              onClick={() => setLockedFeatureModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-8 text-center" style={{ background: '#0f172a' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">{info.title}</h3>
                  <p className="text-sm leading-relaxed mb-3 max-w-[260px] mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>{info.desc}</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white ${info.plan === 'Pro' ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    <Sparkles className="w-3 h-3 opacity-70" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{info.plan} Plan</span>
                  </div>
                </div>
                <div className="px-5 pb-6 pt-4 grid grid-cols-2 gap-3">
                  <button onClick={() => setLockedFeatureModal(null)}
                    className="py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition">
                    Maybe Later
                  </button>
                  <a href={`/${companySlug}/admin/settings#billing`}
                    className="py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-xl transition text-center">
                    View Plans
                  </a>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ── MAIN MODAL ── */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '95vh', height: '95vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── HEADER ── */}
        <LeadModalHeader
          lead={{ ...lead, status: selectedStatus }}
          company={company}
          currentUser={currentUser}
          statusOptions={statusOptions}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TopTab)}
          onClose={onClose}
          onMoreMenu={canDelete ? () => setShowMoreMenu(v => !v) : undefined}
          onStatusChange={handleSaveStatusWithCheck}
          isUpdatingStatus={isUpdatingStatus}
          companySlug={companySlug}
          onLockedTab={setLockedFeatureModal}
        />

        {/* ── MORE MENU ── */}
        <AnimatePresence>
          {showMoreMenu && canDelete && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                className="fixed right-4 top-16 bg-white rounded-xl shadow-2xl border border-gray-100 z-[300] w-44 overflow-hidden"
              >
                {!showDeleteConfirm ? (
                  <button onClick={() => setShowDeleteConfirm(true)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition">
                    <Trash2 className="w-4 h-4" /> Delete Lead
                  </button>
                ) : (
                  <div className="p-3">
                    <p className="text-xs font-bold text-gray-700 mb-2">Confirm delete?</p>
                    <button onClick={handleDelete} disabled={saving}
                      className="w-full bg-red-600 text-white text-xs font-bold py-2 rounded-lg mb-1.5 disabled:opacity-50">
                      {saving ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button onClick={() => { setShowDeleteConfirm(false); setShowMoreMenu(false); }}
                      className="w-full bg-gray-100 text-gray-700 text-xs font-semibold py-2 rounded-lg">
                      Cancel
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── BODY ── */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#f6f6fa' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="p-5 sm:p-7 space-y-6"
            >
              {/* Overview */}
              {activeTab === 'overview' && (
                <LeadOverviewTab
                  lead={lead}
                  company={company}
                  statusOptions={statusOptions}

                  currentUser={currentUser}
                  categories={categories}
                  companySlug={companySlug}
                  onRefresh={onRefresh}
                  onAddNote={onAddNote}
                  relatedLeads={relatedLeads}
                  onShowHistory={() => setShowHistoryDrawer(true)}
                  quoteTemplates={quoteTemplates}
                />
              )}

              {/* Activity */}
              {activeTab === 'activity' && (
                <LeadActivityTab
                  lead={lead}
                  currentUser={currentUser}
                  onAddNote={onAddNote}
                  onRefresh={onRefresh}
                />
              )}

              {/* AI Brief */}
              {activeTab === 'ai' && (
                can(company?.plan_tier as PlanTier, 'ai_brief') ? (
                  <AiBriefTab
                    lead={lead}
                    currentUser={currentUser}
                    company={company}
                    customerPhotos={customerPhotos}
                    relatedLeads={relatedLeads}
                    isProject={isProject}
                    onRefresh={onRefresh}
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2">AI Brief</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
                      Get an instant AI-generated summary of every lead — upgrade to Pro to unlock.
                    </p>
                    <a href={`/${companySlug}/admin/settings`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">
                      Upgrade to Pro — $79.99/mo
                    </a>
                  </div>
                )
              )}

              {/* Project tabs */}
              {renderProjectTab()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-gray-200 bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-600 transition"
          >
            Close
          </motion.button>
        </div>
      </motion.div>

      {/* ── REPEAT CUSTOMER HISTORY DRAWER ── */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex"
          >
            <motion.div className="flex-1" onClick={() => setShowHistoryDrawer(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full sm:w-96 bg-white shadow-2xl flex flex-col h-full border-l border-gray-200"
            >
              <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 flex items-center gap-3" style={{ background: '#0f172a' }}>
                <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowHistoryDrawer(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <X className="w-4 h-4 text-white/70" />
                </motion.button>
                <div>
                  <p className="text-xs font-semibold text-white/50">Repeat Customer</p>
                  <p className="text-sm font-bold text-white">{lead.name}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.12em] mb-3">
                  {relatedLeads.length} Previous Job{relatedLeads.length > 1 ? 's' : ''}
                </p>
                {relatedLeads.map((rl: any, i: number) => (
                  <motion.div key={rl.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{rl.category || 'No category'}</p>
                        <p className="text-xs text-gray-400">{new Date(rl.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        rl.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                        : rl.status === 'cancelled' ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-700'}`}>{rl.status}</span>
                    </div>
                    {rl.description && <p className="text-xs text-gray-500 leading-relaxed">{rl.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {rl.quote_total && <span className="font-semibold text-gray-700">${parseFloat(rl.quote_total).toLocaleString()}</span>}
                      {rl.payment_status === 'paid' && <span className="text-emerald-600 font-semibold">Paid</span>}
                      {rl.scheduled_date && <span>{new Date(rl.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COMPLETION SUMMARY MODAL ── */}
      <AnimatePresence>
        {showCompletionSummary && (
          <CompletionSummaryModal
            lead={lead}
            onConfirm={() => { setShowCompletionSummary(false); handleStatusChange(selectedStatus); }}
            onCancel={() => { setShowCompletionSummary(false); setSelectedStatus(lead.status || statusOptions[0]?.value); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}