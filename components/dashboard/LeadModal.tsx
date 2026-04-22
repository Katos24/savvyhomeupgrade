'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import {
  Mail, Phone, MessageSquare, Navigation, X, Calendar, Edit2, MoreVertical,
  Trash2, ChevronDown, FileText, CheckSquare, Bell, CreditCard, Image,
  FileIcon, Clock, MapPin, User, Hash, ArrowLeft, History,
  UserCircle, MessageCircle, Lock, NotebookPen, Sparkles, Activity, AlertTriangle, LayoutGrid,
} from 'lucide-react';
import ProjectSection from '@/components/dashboard/ProjectSection';
import PhotoGallery from '@/components/dashboard/PhotoGallery';
import ConvertToProjectButton from '@/components/dashboard/ConvertToProjectButton';
import { parseNotes } from '@/lib/utils';
import { canDeleteLead, can, type PlanTier } from '@/lib/permissions';
import CompletionSummaryModal from './CompletionSummaryModal';
import LeadLightbox from '@/components/dashboard/LeadLightbox';
import AiBriefButton from '@/components/dashboard/AiBriefButton';
import AiBriefTab from '@/components/dashboard/AiBriefTab';
import { motion, AnimatePresence } from 'framer-motion';


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
};

type TopTab = 'overview' | 'schedule' | 'quote' | 'payment' | 'tasks' | 'photos' | 'activity' | 'reminders' | 'ai';
type TabDef = { id: TopTab; label: string; icon: React.ElementType; show: boolean; locked?: boolean };

// ── Main Component ────────────────────────────────────────────────────────────
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
}: LeadModalProps) {
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showClientActions, setShowClientActions] = useState(false);
  const [showCustomQuestions, setShowCustomQuestions] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [internalNotesText, setInternalNotesText] = useState(lead.project_internal_notes || '');
  const [selectedCategory, setSelectedCategory] = useState(lead.category || '');
  const [selectedStatus, setSelectedStatus] = useState(lead.status || statusOptions[0]?.value);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<TopTab>('overview');
  const [relatedLeads, setRelatedLeads] = useState<any[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number; label?: string } | null>(null);

  const [quoteTemplates, setQuoteTemplates] = useState<any[]>([]);
  const [pendingCategoryChange, setPendingCategoryChange] = useState<{
    newCategory: string;
    newLabel: string;
    template: any | null;
  } | null>(null);

  const getTimeAgo = (dateStr: string) => {
    const months = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'This month';
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  };

 



  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    address_line_1: lead.address_line_1 || '',
    address_line_2: lead.address_line_2 || '',
    city: lead.city || '',
  });

  const isProject = !!lead.project_id;

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

  useEffect(() => {
    fetch(`/api/company/${companySlug}/quote-templates`)
      .then(r => r.json())
      .then(data => { if (data.success) setQuoteTemplates(data.templates || []); })
      .catch(() => {});
  }, [companySlug]);

  const userRole = currentUser?.role || 'member';
  const canDelete = canDeleteLead(userRole);

  const customerPhotos = useMemo(() =>
    Array.isArray(lead.file_urls)
      ? lead.file_urls.map((f: any) => typeof f === 'string' ? f : f?.url || f?.path || '').filter(Boolean)
      : [],
    [lead.file_urls]);

  const notesArray = useMemo(() => parseNotes(lead.notes), [lead.notes]);

  useEffect(() => {
    setSelectedCategory(lead.category || '');
    setSelectedStatus(lead.status || statusOptions[0]?.value);
    setInternalNotesText(lead.project_internal_notes || '');
    setEditedDetails({
      name: lead.name || '', email: lead.email || '', phone: lead.phone || '',
      address_line_1: lead.address_line_1 || '', address_line_2: lead.address_line_2 || '', city: lead.city || '',
    });
  }, [lead.id, lead.category, lead.status, lead.project_internal_notes]);

  const getStatusColor = (colorName: string) => {
    const colorMap: Record<string, string> = {
      blue: '#3b82f6', yellow: '#eab308', purple: '#a855f7',
      orange: '#f97316', green: '#22c55e', red: '#ef4444',
      gray: '#6b7280', indigo: '#6366f1', pink: '#ec4899',
    };
    return colorMap[colorName] || '#3b82f6';
  };

  const getStatusConfig = (statusValue: string) =>
    statusOptions.find((s: any) => s.value === statusValue) || statusOptions[0];

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
    if (!phoneNumber.length) return '';
    if (phoneNumber.length <= 3) return `(${phoneNumber}`;
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  };

  const formatCategory = (category: string) => {
    if (!category) return 'No category';
    if (lead.category_label) return lead.category_label;
    const cat = categories.find((c: any) => c.value === category);
    return cat ? cat.label : category.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getFullAddress = () => {
    const addr = isEditingDetails ? editedDetails.address_line_1 : lead.address_line_1;
    if (!addr) return null;
    const line2 = isEditingDetails ? editedDetails.address_line_2 : lead.address_line_2;
    const city = isEditingDetails ? editedDetails.city : lead.city;
    return `${addr}${line2 ? ', ' + line2 : ''}${city ? ', ' + city : ''}`;
  };

  const fullAddress = getFullAddress();

  const formatScheduledDate = () => {
    if (!lead.scheduled_date) return null;
    const parts = lead.scheduled_date.split('T')[0].split('-');
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatScheduledTime = () => {
    if (!lead.scheduled_time) return null;
    const [h, m] = lead.scheduled_time.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const handleStatusChange = async (newStatus: string) => {
    const oldStatus = lead.status || statusOptions[0]?.value;
    if (isUpdatingStatus || newStatus === oldStatus) return;
    setIsUpdatingStatus(true);
    setSelectedStatus(newStatus);
    try {
      const success = await onUpdateStatus(lead.id, newStatus, oldStatus);
      if (success) {
        const oldStatusLabel = getStatusConfig(oldStatus)?.label || oldStatus;
        const newStatusLabel = getStatusConfig(newStatus)?.label || newStatus;
        await onAddNote(lead.id, `Status changed from "${oldStatusLabel}" to "${newStatusLabel}"`);
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

  const handleSaveInternalNotes = async () => {
    if (!lead.project_id) { toast.error('Project not found'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id, action: 'update_internal_notes',
          internal_notes: internalNotesText,
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });
      if (res.ok) { toast.success('Notes saved!'); setIsEditingNotes(false); await onRefresh(); }
      else toast.error('Failed to save notes');
    } catch { toast.error('Failed to save notes'); }
    finally { setSaving(false); }
  };

  const executeSaveDetails = async (overrideQuote?: any[] | null) => {
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id, action: 'update_details',
          ...editedDetails, category: selectedCategory,
          description: lead.description,
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });
      if (!res.ok) { toast.error('Failed to update details'); return; }

      if (selectedCategory !== lead.category && lead.project_id) {
        const newCat = categories.find((c: any) => c.value === selectedCategory);
        const newTasks = (newCat?.task_templates || []).map((t: any, i: number) => ({
          id: `task_${Date.now()}_${i}`, label: t.label, completed: false, order: i,
        }));
        await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id, action: 'update_tasks', tasks: newTasks,
            user_name: currentUser?.name || currentUser?.email,
            user_email: currentUser?.email,
          }),
        });
      }

      if (overrideQuote) {
        const total = overrideQuote.reduce((s: number, i: any) => s + i.amount, 0);
        await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id, action: 'save_quote',
            quote_data: overrideQuote, quote_total: total,
            user_name: currentUser?.name || currentUser?.email,
            user_email: currentUser?.email,
          }),
        });
      }

      toast.success('Details updated!');
      setIsEditingDetails(false);
      await onRefresh();
    } catch { toast.error('Failed to update details'); }
    finally { setSaving(false); }
  };

  const handleSaveDetails = async () => {
    const categoryChanged = selectedCategory !== lead.category;
    if (categoryChanged) {
      const template = quoteTemplates.find((t: any) => t.category === selectedCategory) || null;
      const hasExistingQuote = (lead.quote_data || []).length > 0;
      if (template && hasExistingQuote) {
        const newCat = categories.find((c: any) => c.value === selectedCategory);
        setPendingCategoryChange({ newCategory: selectedCategory, newLabel: newCat?.label || selectedCategory, template });
        return;
      }
      if (template && !hasExistingQuote) {
        const items = template.items.map((item: any, i: number) => ({ ...item, id: `item_${Date.now()}_${i}` }));
        await executeSaveDetails(items);
        return;
      }
    }
    await executeSaveDetails(null);
  };

  const handleDelete = async () => {
    setSaving(true);
    const success = await onDeleteLead(lead.id);
    setSaving(false);
    if (success) { toast.success('Lead deleted!'); onClose(); }
    else toast.error('Failed to delete lead');
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    const success = await onAddNote(lead.id, newNote);
    setSaving(false);
    if (success) { setNewNote(''); toast.success('Note added!'); }
    else toast.error('Failed to add note');
  };

  const currentStatusConfig = getStatusConfig(selectedStatus);
  const statusHex = getStatusColor(currentStatusConfig?.color);
  const hasSavedBrief =
  isProject && !!(lead.ai_brief && (
    typeof lead.ai_brief === 'string'
      ? lead.ai_brief !== '{}' && lead.ai_brief !== ''
      : Object.keys(lead.ai_brief).length > 0
  ));

const planTier = (company?.plan_tier || 'starter') as PlanTier;
const isStarter = planTier === 'starter';

const tabs: { id: TopTab; label: string; icon: React.ElementType; show: boolean; locked?: boolean }[] = [
  { id: 'overview',  label: 'Overview',  icon: User,          show: true },
  { id: 'schedule',  label: 'Schedule',  icon: Calendar,      show: isProject, locked: !can(planTier, 'scheduling') },
  { id: 'quote',     label: 'Quote',     icon: FileText,      show: isProject, locked: !can(planTier, 'quotes') },
  { id: 'payment',   label: 'Payment',   icon: CreditCard,    show: isProject, locked: !can(planTier, 'quotes') },
  { id: 'tasks',     label: 'Tasks',     icon: CheckSquare,   show: isProject, locked: !can(planTier, 'custom_tasks') },
  { id: 'photos',    label: 'Media',     icon: Image,         show: isProject, locked: !can(planTier, 'docs_on_card') },
  { id: 'activity',  label: 'Activity',  icon: MessageCircle, show: isProject },
  { id: 'reminders', label: 'Reminders', icon: Bell,          show: isProject, locked: !can(planTier, 'scheduling') },
{ id: 'ai', label: 'AI Brief', icon: Sparkles, show: isProject, locked: !can(planTier, 'ai_brief') },
];

const renderProjectTab = () => {
  if (activeTab === 'overview' || activeTab === 'activity' || activeTab === 'ai' || !isProject) return null;
  const activeTabDef = tabs.find((t: TabDef) => t.id === activeTab);
  if (activeTabDef?.locked) {
    const upgradeMap: Record<string, { title: string; description: string; plan: string }> = {
      schedule:  { title: 'Job Scheduling',      description: 'Schedule jobs, set arrival times, and manage your crew calendar.', plan: 'Basic' },
      quote:     { title: 'Quote Builder',       description: 'Build professional quotes with line items and send them in one click.', plan: 'Basic' },
      payment:   { title: 'Payment Tracking',    description: 'Track payments, send reminders, and mark jobs as paid.', plan: 'Basic' },
      tasks:     { title: 'Task Lists',          description: 'Build task checklists for each job and track completion.', plan: 'Basic' },
      photos:    { title: 'Media & Documents',   description: 'Upload before/after photos and job documents.', plan: 'Basic' },
      reminders: { title: 'Follow-up Reminders', description: 'Set follow-up dates and get reminded to check in on leads.', plan: 'Basic' },
    };
    const info = upgradeMap[activeTab] || { title: 'Upgrade Required', description: 'This feature requires a higher plan.', plan: 'Basic' };
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-8 text-center">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-blue-500" />
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-2">{info.title}</h3>
        <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">{info.description}</p>
        
        <a
      href={`/${companySlug}/admin/settings#billing`}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
    >
      Upgrade to {info.plan} — $49.99/mo
    </a>
      </div>
    );
  }
  return (
    <ProjectSection
      lead={lead}
      currentUser={currentUser}
      onRefresh={onRefresh}
      statusOptions={statusOptions}
      onUpdateStatus={onUpdateStatus}
      companySlug={companySlug}
      defaultTab={activeTab}
    />
  );
};

return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      {lightbox && (
        <LeadLightbox
          photos={lightbox.photos}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
          label={lightbox.label}
        />
      )}

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '95vh', height: '95vh' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── HERO HEADER ── */}
        <div className="flex-shrink-0 relative overflow-hidden" style={{ background: '#1e3a5f' }}>          <div className="relative z-10 p-4 sm:p-6 pb-0">
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 min-w-0 mr-4"
              >
                {isProject ? (
                  <div className="mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>#{lead.project_number}</span>
                  </div>
                ) : (
                  <div className="mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Lead</span>
                  </div>
                )}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight truncate">{lead.name}</h2>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Submitted {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </motion.div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canDelete && (
                  <div className="relative">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="w-9 h-9 rounded-none flex items-center justify-center transition"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      <MoreVertical className="w-4 h-4 text-white/60" />
                    </motion.button>
                    <AnimatePresence>
                      {showMoreMenu && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 w-44 overflow-hidden"
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
                                  className="w-full bg-red-600 text-white text-xs font-bold py-2 rounded-none mb-1.5 disabled:opacity-50">
                                  {saving ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button onClick={() => { setShowDeleteConfirm(false); setShowMoreMenu(false); }}
                                  className="w-full bg-gray-100 text-gray-700 text-xs font-semibold py-2 rounded-none">
                                  Cancel
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  className="w-9 h-9 rounded-none flex items-center justify-center transition"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <X className="w-4 h-4 text-white/60" />
                </motion.button>
              </div>
            </div>

            {/* Status + meta chips */}
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2 flex-wrap mb-4"
            >
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={e => handleSaveStatusWithCheck(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-none text-xs font-bold cursor-pointer focus:outline-none disabled:opacity-60"
                    style={{ background: `${statusHex}25`, color: statusHex, border: `1px solid ${statusHex}40` }}
                  >
                    {statusOptions.map((o: any) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {isUpdatingStatus
                    ? <span className="text-xs text-white/50 animate-pulse">Saving...</span>
                    : <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: statusHex }} />
                  }
                </div>
              </div>

              {!isStarter && (lead.scheduled_date ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', color: '#7dd3fc' }}>
                  <Calendar className="w-3 h-3" />
                  {formatScheduledDate()}{formatScheduledTime() && ` · ${formatScheduledTime()}`}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)' }}>
                  <Calendar className="w-3 h-3" />
                  Not scheduled
                </div>
              ))}

              {lead.assigned_to && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)' }}>
                  <User className="w-3 h-3" />
                  {lead.assigned_to}
                </div>
              )}

              {!isStarter && lead.quote_total && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-semibold ${
                  lead.payment_status === 'paid' ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                  : lead.payment_status === 'partial' ? 'bg-orange-500/20 border border-orange-500/30 text-orange-300'
                  : 'bg-white/6 border border-white/12 text-white/50'
                }`}>
                  <CreditCard className="w-3 h-3" />
                  {lead.payment_status === 'paid' ? 'Paid in Full'
                    : lead.payment_status === 'partial'
                    ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.payment_amount || 0))} paid`
                    : `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.quote_total))} due`}
                </div>
              )}

           {isProject && (
  <AiBriefButton
    hasSavedBrief={hasSavedBrief}
    onClick={() => setActiveTab('ai')}
  />
)}
            </motion.div>

            {/* Tab bar */}
            <div className="flex items-center overflow-x-auto gap-0" style={{ scrollbarWidth: 'none' }}>
              {tabs.filter(t => t.show).map(tab => {
                const Icon = tab.icon;
                const isAi = tab.id === 'ai';
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.locked) {
                        window.location.href = `/${companySlug}/admin/settings#billing`;
                        return;
                      }
                      setActiveTab(tab.id);
                    }}
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all border-b-2 whitespace-nowrap"
                    style={{
                      color: activeTab === tab.id
                        ? (isAi ? '#93c5fd' : 'white')
                        : (isAi ? 'rgba(147,197,253,0.5)' : 'rgba(255,255,255,0.4)'),
                      borderBottomColor: activeTab === tab.id
                        ? (isAi ? '#93c5fd' : '#60a5fa')
                        : 'transparent',
                      opacity: tab.locked ? 0.5 : 1,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <div className="flex items-center gap-1">
                      {tab.label}
                      {tab.locked && <Lock className="w-3 h-3 opacity-70" />}
                    </div>
                  </button>
                );
              })}
            
            </div>
          </div>
        </div>

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

          {/* ── OVERVIEW TAB ── */}
{activeTab === 'overview' && (
  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
    {/* Convert to Project banner */}
    {!isProject && (
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm flex items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="text-sm font-black text-blue-900">Ready to start this job?</p>
          <p className="text-xs text-blue-500 mt-0.5 truncate">Unlock scheduling, quotes, and tasks.</p>
        </div>
        <ConvertToProjectButton lead={lead} currentUser={currentUser} onRefresh={onRefresh} />
      </motion.div>
    )}

    {/* Client Card */}
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/30">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <UserCircle className="w-3.5 h-3.5 text-blue-500" />
          Client Contact
          {relatedLeads.length > 0 && (
            <button
              onClick={() => setShowHistoryDrawer(true)}
              className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-[#b45309] text-[9px] font-black flex items-center gap-1"
            >
              <History className="w-2.5 h-2.5" /> {relatedLeads.length} PAST
            </button>
          )}
        </h3>
        <button 
          onClick={() => setIsEditingDetails(!isEditingDetails)}
          className="text-blue-600 text-[10px] font-black uppercase tracking-wider hover:underline"
        >
          {isEditingDetails ? 'Cancel' : 'Edit Details'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditingDetails ? (
          <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={editedDetails.name} onChange={e => setEditedDetails({ ...editedDetails, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" />
              <input type="tel" value={editedDetails.phone} onChange={e => setEditedDetails({ ...editedDetails, phone: formatPhoneNumber(e.target.value) })} placeholder="Phone" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" maxLength={14} />
            </div>
            <input type="email" value={editedDetails.email} onChange={e => setEditedDetails({ ...editedDetails, email: e.target.value })} placeholder="Email" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" />
            <input type="text" value={editedDetails.address_line_1} onChange={e => setEditedDetails({ ...editedDetails, address_line_1: e.target.value })} placeholder="Address" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={editedDetails.address_line_2} onChange={e => setEditedDetails({ ...editedDetails, address_line_2: e.target.value })} placeholder="Apt/Suite" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" />
              <input type="text" value={editedDetails.city} onChange={e => setEditedDetails({ ...editedDetails, city: e.target.value })} placeholder="City" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/10 outline-none" />
            </div>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none">
              {categories.map((cat: any) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveDetails} disabled={saving} className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest">
              {saving ? 'Saving...' : 'Update Records'}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm font-bold text-gray-900">{lead.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{lead.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-600">{formatPhoneNumber(lead.phone)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 leading-tight">{fullAddress || 'No address'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="inline-flex px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-md border border-blue-100">
                    {formatCategory(lead.category)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Row */}
            <div className="flex border-t border-gray-50">
              {[
                { icon: <Mail className="w-4 h-4" />, label: 'Email', action: () => window.location.href = `mailto:${lead.email}`, color: 'text-blue-500' },
                { icon: <Phone className="w-4 h-4" />, label: 'Call', action: () => window.location.href = `tel:${lead.phone}`, color: 'text-green-500' },
                { icon: <MessageSquare className="w-4 h-4" />, label: 'Text', action: () => window.location.href = `sms:${lead.phone}`, color: 'text-purple-500' },
                ...(fullAddress ? [{ icon: <Navigation className="w-4 h-4" />, label: 'Map', action: () => window.open(`https://maps.apple.com/?q=${encodeURIComponent(fullAddress)}`, '_blank'), color: 'text-rose-500' }] : []),
              ].map((btn) => (
                <button key={btn.label} onClick={btn.action} className="flex-1 flex flex-col items-center justify-center py-3 hover:bg-gray-50 transition border-r last:border-r-0 border-gray-50">
                  <span className={btn.color}>{btn.icon}</span>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400 mt-1">{btn.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    {/* Request Description & Logic */}
    <div className={`grid gap-4 ${isProject ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 bg-blue-50/20">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
            Project Description
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-700 leading-relaxed italic">
            "{lead.description || "No message provided by customer."}"
          </p>

          {(lead.preferred_date || lead.preferred_time) && (
            <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap gap-4">
              {lead.preferred_date && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  PREFER: {new Date(lead.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
              {lead.preferred_time && (
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  TIME: {lead.preferred_time}
                </div>
              )}
            </div>
          )}

          {customerPhotos.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer Photos ({customerPhotos.length})</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {customerPhotos.map((url: string, i: number) => (
                  <button key={i} onClick={() => setLightbox({ photos: customerPhotos, index: i, label: 'Customer Photos' })} className="w-14 h-14 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                    <img src={url} className="w-full h-full object-cover" alt="Customer site" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Internal Notes */}
      {isProject && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 bg-amber-50/20">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              Office Only Notes
            </h3>
          </div>
          <div className="p-4">
            <AnimatePresence mode="wait">
              {isEditingNotes ? (
                <motion.div key="edit-n" className="space-y-2">
                  <textarea value={internalNotesText} onChange={e => setInternalNotesText(e.target.value)} rows={4} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10" placeholder="Add private project details..." />
                  <div className="flex gap-2">
                    <button onClick={handleSaveInternalNotes} className="flex-1 bg-gray-900 text-white text-[10px] font-black uppercase py-2 rounded-lg transition">Save</button>
                    <button onClick={() => setIsEditingNotes(false)} className="flex-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase py-2 rounded-lg">Cancel</button>
                  </div>
                </motion.div>
              ) : (
                <div onClick={() => setIsEditingNotes(true)} className="cursor-pointer group">
                  <p className="text-sm text-gray-600 leading-relaxed min-h-[60px]">
                    {lead.project_internal_notes || <span className="text-gray-300 italic">Tap to add private notes for the crew...</span>}
                  </p>
                  <span className="text-[10px] font-black text-blue-600 uppercase mt-2 block opacity-0 group-hover:opacity-100 transition">Edit Notes</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  </div>
)}

              {/* ── AI BRIEF TAB ── */}
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
                 <motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white rounded-none border border-gray-100 shadow-sm p-8 text-center"
>
  <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
    <Sparkles className="w-6 h-6 text-blue-500" />
  </div>

  <h3 className="text-base font-bold text-gray-900 mb-2">AI Brief</h3>

  <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto">
    Get an instant AI-generated summary of every lead — upgrade to Pro to unlock.
  </p>

  <a
    href={`/${companySlug}/admin/settings`}
    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
  >
    Upgrade to Pro — $79.99/mo
  </a>
</motion.div>
                )
              )}

              {/* ── PROJECT TABS ── */}
              {renderProjectTab()}

              {/* ── ACTIVITY TAB ── */}
              {activeTab === 'activity' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition"                >
                  <div className="px-5 py-4 border-b border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.12em] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center"><Activity className="w-3 h-3 text-blue-400" /></span>
                      Activity Log
                      {notesArray.length > 0 && (
                        <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-none">{notesArray.length}</span>
                      )}
                    </h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                        placeholder="Add a note..." rows={3}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 focus:outline-none resize-none bg-gray-50 focus:bg-white transition" />
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddNote} disabled={saving || !newNote.trim()}
className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold py-3 text-sm rounded-none transition"                      >
                        {saving ? 'Adding...' : 'Add Note'}
                      </motion.button>
                    </div>
                    {notesArray.length > 0 && (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        <AnimatePresence>
                          {[...notesArray].reverse().map((note: any, idx: number) => {
                            const isOld = typeof note === 'string';
                            const text = isOld ? note : note.text;
                            const user = isOld ? 'Unknown' : (note.user_name || 'System');
                            const ts = isOld ? lead.created_at : note.timestamp;
                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                              >
<div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">                                  {user.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-bold text-gray-800">{user}</span>
                                    <span className="text-xs text-gray-400">
                                      {new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{text}</p>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── FOOTER ── */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
className="flex-1 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-bold text-gray-600 transition"
          >
            Close
          </motion.button>
          <AnimatePresence>
            {newNote.trim() && activeTab === 'activity' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  setSaving(true);
                  const ok = await onAddNote(lead.id, newNote);
                  setSaving(false);
                  if (ok) { setNewNote(''); toast.success('Note saved!'); await onRefresh(); onClose(); }
                }}
                disabled={saving}
                className="flex-[2] py-3 rounded-none text-sm font-bold text-white transition overflow-hidden whitespace-nowrap px-4"
                style={{ background: 'linear-gradient(135deg, #2563eb, #0891b2)' }}
              >
                {saving ? 'Saving...' : 'Save Note'}
              </motion.button>
            )}
          </AnimatePresence>
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
              <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 flex items-center gap-3" style={{ background: '#1e3a5f' }}>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowHistoryDrawer(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-none"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
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
                  <motion.div
                    key={rl.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{rl.category || 'No category'}</p>
                        <p className="text-xs text-gray-400">{new Date(rl.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-none ${
                        rl.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                        : rl.status === 'cancelled' ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-700'
                      }`}>{rl.status}</span>
                    </div>
                    {rl.description && <p className="text-xs text-gray-500 leading-relaxed">{rl.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {rl.quote_total && <span className="font-semibold text-gray-700">${parseFloat(rl.quote_total).toLocaleString()}</span>}
                      {rl.payment_status === 'paid' && <span className="text-emerald-600 font-semibold">Paid</span>}
                      {rl.scheduled_date && <span>{new Date(rl.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                      <span />
                      {rl.project_id
                        ? <span className="text-xs text-gray-400">Project #{rl.project_number || rl.project_id}</span>
                        : <span className="text-xs text-gray-400 italic">No project</span>
                      }
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CATEGORY CHANGE MODAL ── */}
      <AnimatePresence>
        {pendingCategoryChange && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-5 mx-auto">
                <LayoutGrid className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Update Quote Too?</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                <span className="font-bold text-gray-800">{pendingCategoryChange?.newLabel}</span> has a pricing template. Replace your current quote items with it?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={async () => { setPendingCategoryChange(null); await executeSaveDetails(null); }}
                  className="py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition text-sm">
                  Keep Current
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    const items = pendingCategoryChange?.template.items.map((item: any, i: number) => ({ ...item, id: `item_${Date.now()}_${i}` }));
                    setPendingCategoryChange(null);
                    await executeSaveDetails(items);
                  }}
                  className="py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 transition text-sm">
                  Use Template
                </motion.button>
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

function InfoField({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
  <p className={`text-sm font-semibold ${isLink ? 'text-blue-600' : 'text-gray-900'}`}>{value}</p>    </div>
  );
}