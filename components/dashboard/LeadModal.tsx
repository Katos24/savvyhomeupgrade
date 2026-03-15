'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Mail,
  Phone,
  MessageSquare,
  Navigation,
  X,
  Calendar,
  Edit2,
  MoreVertical,
  Trash2,
  ChevronDown,
  FileText,
  CheckSquare,
  Bell,
  CreditCard,
  Image,
  FileIcon,
  Clock,
  MapPin,
  User,
  Hash,
  ArrowLeft,
  History,
} from 'lucide-react';
import ProjectSection from '@/components/dashboard/ProjectSection';
import PhotoGallery from '@/components/dashboard/PhotoGallery';
import ConvertToProjectButton from '@/components/dashboard/ConvertToProjectButton';
import { parseNotes } from '@/lib/utils';
import { canDeleteLead } from '@/lib/permissions';
import CompletionSummaryModal from './CompletionSummaryModal';

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

type TopTab = 'overview' | 'schedule' | 'quote' | 'payment' | 'tasks' | 'photos' | 'docs' | 'activity' | 'reminders';

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
  const [aiSummary, setAiSummary] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const getTimeAgo = (dateStr: string) => {
    const months = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (months < 1) return 'This month';
    if (months === 1) return '1 month ago';
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  };

  const handleAiSummary = async () => {
    if (aiSummary || loadingAi) return;
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          customer_name: lead.name,
          description: lead.description,
          category: lead.category,
          status: lead.status,
          project_id: lead.project_id,
          scheduled_date: lead.scheduled_date || null,
          scheduled_time: lead.scheduled_time || null,
          assigned_to: lead.assigned_to || null,
          quote_total: lead.quote_total || null,
          payment_amount: lead.payment_amount || null,
          payment_status: lead.payment_status || null,
          internal_notes: lead.project_internal_notes || null,
          company_name: company?.name || null,
          repeat_customer: relatedLeads.length > 0,
          past_jobs: relatedLeads.map(r => ({
            category: r.category,
            status: r.status,
            quote_total: r.quote_total,
            payment_status: r.payment_status,
            created_at: r.created_at,
            description: r.description,
          })),
photos: customerPhotos.filter((url: string) => typeof url === 'string' && url.startsWith('http')).slice(0, 4),
        }),
      });
      const data = await res.json();
      if (data.success) setAiSummary(data.brief);
    } catch (e) {
      console.error('AI summary error:', e);
    } finally {
      setLoadingAi(false);
    }
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

  const notesArray = parseNotes(lead.notes);
  const isProject = !!lead.project_id;

  // Fetch related leads (repeat customer detection)
  useEffect(() => {
    if (!lead.name || !lead.city || !lead.company_id) return;
    const params = new URLSearchParams({
      name: lead.name,
      city: lead.city,
      company_id: String(lead.company_id),
      exclude: String(lead.id),
      ...(lead.email ? { email: lead.email } : {}),
    });
    fetch(`/api/leads/related?${params}`)
      .then(r => r.json())
      .then(data => { if (data.leads?.length) setRelatedLeads(data.leads); })
      .catch(() => {});
  }, [lead.id]);
  const userRole = currentUser?.role || 'member';
  const canDelete = canDeleteLead(userRole);
const customerPhotos = Array.isArray(lead.file_urls)
  ? lead.file_urls.map((f: any) => typeof f === 'string' ? f : f?.url || f?.path || '').filter(Boolean)
  : [];

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

 const handleStatusChange = async () => {
  const oldStatus = lead.status || statusOptions[0]?.value;
  if (isUpdatingStatus || selectedStatus === oldStatus) return;
  setIsUpdatingStatus(true);
  try {
    const success = await onUpdateStatus(lead.id, selectedStatus, oldStatus);
    if (success) {
      // ✅ Log the status change to activity
      const oldStatusLabel = getStatusConfig(oldStatus)?.label || oldStatus;
      const newStatusLabel = getStatusConfig(selectedStatus)?.label || selectedStatus;
      const statusChangeNote = `Status changed from "${oldStatusLabel}" to "${newStatusLabel}"`;
      
      await onAddNote(lead.id, statusChangeNote);
      
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

  const handleSaveStatusWithCheck = () => {
    const oldStatus = lead.status || statusOptions[0]?.value;
    if (selectedStatus === 'completed' && selectedStatus !== oldStatus) {
      setShowCompletionSummary(true);
      return;
    }
    handleStatusChange();
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

  const handleSaveDetails = async () => {
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
      if (res.ok) { toast.success('Details updated!'); setIsEditingDetails(false); await onRefresh(); }
      else toast.error('Failed to update details');
    } catch { toast.error('Failed to update details'); }
    finally { setSaving(false); }
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

  const tabs: { id: TopTab; label: string; icon: string; show: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: '◉', show: true },
    { id: 'schedule', label: 'Schedule', icon: '📅', show: isProject },
    { id: 'quote', label: 'Quote', icon: '💰', show: isProject },
    { id: 'payment', label: 'Payment', icon: '💳', show: isProject },
    { id: 'tasks', label: 'Tasks', icon: '✅', show: isProject },
    { id: 'photos', label: 'Media', icon: '📷', show: isProject },
{ id: 'activity', label: 'Activity', icon: '💬', show: isProject },
{ id: 'reminders', label: 'Reminders', icon: '🔔', show: isProject },

  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-4xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '95vh', height: '95vh' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── HERO HEADER ───────────────────────────────── */}
        <div
          className="flex-shrink-0 relative overflow-hidden"
          style={{
            background: '#312e81',
  
          }}
        >


          <div className="relative z-10 p-4 sm:p-6 pb-0">
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 mr-4">
                {/* Project number only */}
                {isProject && (
                  <div className="mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      #{lead.project_number}
                    </span>
                  </div>
                )}

                {/* Name */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight truncate">
                  {lead.name}
                </h2>

                {/* Submitted date */}
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Submitted {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Close + more */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {canDelete && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="w-9 h-9 rounded-none flex items-center justify-center transition"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      <MoreVertical className="w-4 h-4 text-white/60" />
                    </button>
                    {showMoreMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-none shadow-2xl border border-gray-100 z-50 w-44 overflow-hidden">
                          {!showDeleteConfirm ? (
                            <button
                              onClick={() => setShowDeleteConfirm(true)}
                              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                            >
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
                        </div>
                      </>
                    )}
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-none flex items-center justify-center transition"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Status + meta chips */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {/* Status selector */}
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-none text-xs font-bold cursor-pointer focus:outline-none"
                    style={{
                      background: `${statusHex}25`,
                      color: statusHex,
                      border: `1px solid ${statusHex}40`,
                    }}
                  >
                    {statusOptions.map((o: any) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: statusHex }} />
                </div>
                {selectedStatus !== lead.status && (
                  <button
                    onClick={handleSaveStatusWithCheck}
                    disabled={isUpdatingStatus}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-none transition"
                  >
                    {isUpdatingStatus ? '...' : 'Save'}
                  </button>
                )}
              </div>

              {/* Schedule chip */}
              {lead.scheduled_date ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-semibold"
                  style={{ background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.25)', color: '#7dd3fc' }}>
                  <Calendar className="w-3 h-3" />
                  {formatScheduledDate()}{formatScheduledTime() && ` · ${formatScheduledTime()}`}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)' }}>
                  <Calendar className="w-3 h-3" />
                  Not scheduled
                </div>
              )}

              {/* Assigned chip */}
              {lead.assigned_to && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.65)' }}>
                  <User className="w-3 h-3" />
                  {lead.assigned_to}
                </div>
              )}

              {/* Payment chip */}
              {lead.quote_total && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-semibold ${
                  lead.payment_status === 'paid'
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                    : lead.payment_status === 'partial'
                    ? 'bg-orange-500/20 border border-orange-500/30 text-orange-300'
                    : 'bg-white/6 border border-white/12 text-white/50'
                }`}>

                  
                  <CreditCard className="w-3 h-3" />
                  {lead.payment_status === 'paid'
                    ? 'Paid in Full'
                    : lead.payment_status === 'partial'
                    ? `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.payment_amount || 0))} paid`
                    : `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(lead.quote_total))} due`}
                </div>
                
              )}
            </div>

            

            {/* Tab bar */}
            <div className="flex overflow-x-auto gap-0" style={{ scrollbarWidth: 'none' }}>
              {tabs.filter(t => t.show).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all border-b-2 whitespace-nowrap"
                  style={{
                    color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
                    borderBottomColor: activeTab === tab.id ? '#a5b4fc' : 'transparent',
                    background: 'transparent',
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── BODY ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto" style={{ background: '#f6f6fa' }}>
          <div className="p-4 sm:p-6 space-y-4">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <>
                {/* Client Card */}
                <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-5 h-5 rounded-none bg-indigo-50 flex items-center justify-center text-xs">👤</span>
                      Client Info
                      {relatedLeads.length > 0 && (
                        <button
                          onClick={() => setShowHistoryDrawer(true)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-none text-xs font-bold transition hover:opacity-80"
                          style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#f59e0b' }}
                        >
                          <History className="w-3 h-3" />
                          {relatedLeads.length} past job{relatedLeads.length > 1 ? 's' : ''}
                        </button>
                      )}
                    </h3>
                    <div className="relative">
                      <button
                        onClick={() => setShowClientActions(!showClientActions)}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-none transition"
                      >
                        Actions ▾
                      </button>
                      {showClientActions && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowClientActions(false)} />
                          <div className="absolute right-0 top-full mt-2 bg-white rounded-none shadow-2xl border border-gray-100 z-50 w-44 overflow-hidden">
                            <button onClick={() => { window.location.href = `mailto:${lead.email}`; setShowClientActions(false); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition">
                              <Mail className="w-4 h-4 text-blue-500" /> Email
                            </button>
                            <button onClick={() => { window.location.href = `tel:${lead.phone}`; setShowClientActions(false); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition">
                              <Phone className="w-4 h-4 text-green-500" /> Call
                            </button>
                            <button onClick={() => {
                              window.location.href = `sms:${lead.phone}?body=${encodeURIComponent(`Hi ${lead.name}, I reviewed your project.`)}`;
                              setShowClientActions(false);
                            }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition">
                              <MessageSquare className="w-4 h-4 text-purple-500" /> Text
                            </button>
                            {fullAddress && (
                              <button onClick={() => {
                                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank');
                                setShowClientActions(false);
                              }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 transition">
                                <Navigation className="w-4 h-4 text-red-500" /> Directions
                              </button>
                            )}
                            <div className="border-t border-gray-100 my-1" />
                            <button onClick={() => { setIsEditingDetails(true); setShowClientActions(false); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
                              <Edit2 className="w-4 h-4 text-gray-400" /> Edit Details
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditingDetails ? (
                    <div className="p-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Name</label>
                          <input type="text" value={editedDetails.name}
                            onChange={(e) => setEditedDetails({ ...editedDetails, name: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-indigo-200 rounded-none text-sm focus:outline-none focus:border-indigo-400" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Phone</label>
                          <input type="tel" value={editedDetails.phone}
                            onChange={(e) => setEditedDetails({ ...editedDetails, phone: formatPhoneNumber(e.target.value) })}
                            className="w-full px-3 py-2 border-2 border-indigo-200 rounded-none text-sm focus:outline-none focus:border-indigo-400" maxLength={14} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Email</label>
                        <input type="email" value={editedDetails.email}
                          onChange={(e) => setEditedDetails({ ...editedDetails, email: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-indigo-200 rounded-none text-sm focus:outline-none focus:border-indigo-400" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Address</label>
                        <input type="text" value={editedDetails.address_line_1} placeholder="123 Main St"
                          onChange={(e) => setEditedDetails({ ...editedDetails, address_line_1: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-indigo-200 rounded-none text-sm focus:outline-none focus:border-indigo-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Apt/Suite</label>
                          <input type="text" value={editedDetails.address_line_2}
                            onChange={(e) => setEditedDetails({ ...editedDetails, address_line_2: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-indigo-200 rounded-none text-sm focus:outline-none focus:border-indigo-400" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">City</label>
                          <input type="text" value={editedDetails.city}
                            onChange={(e) => setEditedDetails({ ...editedDetails, city: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-indigo-200 rounded-none text-sm focus:outline-none focus:border-indigo-400" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Category</label>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-indigo-200 rounded-none text-sm focus:outline-none focus:border-indigo-400">
                          {categories.map((cat: any) => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleSaveDetails} disabled={saving}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-none transition text-sm">
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={() => {
                          setEditedDetails({ name: lead.name || '', email: lead.email || '', phone: lead.phone || '',
                            address_line_1: lead.address_line_1 || '', address_line_2: lead.address_line_2 || '', city: lead.city || '' });
                          setSelectedCategory(lead.category || '');
                          setIsEditingDetails(false);
                        }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-none transition text-sm">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <InfoField label="Name" value={lead.name} />
                        <InfoField label="Email" value={lead.email} isLink />
                        <InfoField label="Phone" value={formatPhoneNumber(lead.phone)} isLink />
                        {lead.address_line_1 && (
                          <div className="col-span-2">
                            <InfoField label="Address" value={fullAddress || ''} />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Category</p>
                          {lead.category ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-none text-xs font-bold text-indigo-600">
                              {formatCategory(lead.category)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs italic">None</span>
                          )}
                        </div>
                      </div>
                      {/* Quick action buttons - horizontal row */}
                      <div className="flex gap-2 px-5 pb-4">
                        {[
                          { icon: <Mail className="w-4 h-4" />, label: 'Email', action: () => window.location.href = `mailto:${lead.email}`, color: '#3b82f6' },
                          { icon: <Phone className="w-4 h-4" />, label: 'Call', action: () => window.location.href = `tel:${lead.phone}`, color: '#22c55e' },
                          { icon: <MessageSquare className="w-4 h-4" />, label: 'Text', action: () => window.location.href = `sms:${lead.phone}`, color: '#a855f7' },
                          ...(fullAddress ? [{ icon: <Navigation className="w-4 h-4" />, label: 'Directions', action: () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank'), color: '#ef4444' }] : []),
                        ].map((btn) => (
                          <button key={btn.label} onClick={btn.action}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-none border border-gray-100 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition group">
                            <span style={{ color: btn.color }}>{btn.icon}</span>
                            <span className="text-xs font-semibold text-gray-600 group-hover:text-indigo-600">{btn.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                 {/* Convert to Project — shown prominently before content cards */}
          {!isProject && (
            <ConvertToProjectButton lead={lead} currentUser={currentUser} onRefresh={onRefresh} />
          )}


                {/* Two-col: Message + Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Message */}
                  <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-5 h-5 rounded-none bg-emerald-50 flex items-center justify-center text-xs">💬</span>
                        Customer's Message
                      </h3>
                    </div>
                    
                    <div className="p-5">
                     {lead.description ? (
  <p className="text-sm text-gray-600 leading-relaxed">{lead.description}</p>
) : (
  <p className="text-sm text-gray-400 italic">No message provided</p>
)}



{(lead.preferred_date || lead.preferred_time) && (
  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
    
    {lead.preferred_date && (
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <span className="font-semibold text-gray-400 uppercase tracking-wide mr-1">Preferred:</span>
{(() => {
  const d = new Date(lead.preferred_date);
  return isNaN(d.getTime()) ? lead.preferred_date : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
})()}      </div>
    )}
    {lead.preferred_time && (
      <div className="flex items-center gap-1.5 text-xs text-gray-600">
        <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        {lead.preferred_time}
      </div>
    )}
  </div>
)}
      {/* Inline photo thumbnails */}
                      {customerPhotos.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Image className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {customerPhotos.length} Photo{customerPhotos.length > 1 ? 's' : ''} Submitted
                            </span>
                          </div>
                     <div className="flex flex-wrap gap-1.5">
  {customerPhotos.slice(0, 6).map((url: string, i: number) => (
    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
      className="w-12 h-12 rounded-none overflow-hidden border border-gray-200 hover:border-indigo-400 transition group flex-shrink-0">
      <img
        src={url}
        alt={`Photo ${i + 1}`}
        className="w-full h-full object-cover group-hover:opacity-80 transition"
      />
    </a>
  ))}
  {customerPhotos.length > 6 && (
    <div className="w-12 h-12 rounded-none border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-gray-400">+{customerPhotos.length - 6}</span>
    </div>
  )}
</div>
                        </div>
                      )}

                      {lead.custom_answers && Object.keys(lead.custom_answers).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button onClick={() => setShowCustomQuestions(!showCustomQuestions)}
                            className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                            {showCustomQuestions ? '▼' : '▶'} Additional ({Object.keys(lead.custom_answers).length})
                          </button>
                          {showCustomQuestions && (
                            <div className="mt-3 space-y-2">
                              {Object.entries(lead.custom_answers).map(([qId, answer]: [string, any]) => {
                                const qDef = (company?.custom_questions || []).find((q: any) => q.id === qId);
                                return (
                                  <div key={qId} className="text-sm">
                                    <div className="text-xs text-gray-400 mb-0.5">{qDef?.label || qId}</div>
                                    <div className="text-gray-800 font-medium">
                                      {typeof answer === 'boolean' ? (answer ? 'Yes' : 'No') : answer || <span className="text-gray-400 italic">No answer</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-50">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-5 h-5 rounded-none bg-amber-50 flex items-center justify-center text-xs">🔒</span>
                        Internal Notes
                      </h3>
                    </div>
                    <div className="p-5">
                      {isEditingNotes ? (
                        <div className="space-y-2">
                          <textarea value={internalNotesText} onChange={(e) => setInternalNotesText(e.target.value)}
                            rows={5} placeholder="Notes visible only to your team..."
                            className="w-full px-3 py-2.5 border-2 border-indigo-200 rounded-none text-sm resize-none focus:outline-none focus:border-indigo-400" />
                          <div className="flex gap-2">
                            <button onClick={handleSaveInternalNotes} disabled={saving}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 rounded-none text-xs transition">
                              {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={() => { setIsEditingNotes(false); setInternalNotesText(lead.project_internal_notes || ''); }}
                              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-none text-xs transition">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : lead.project_internal_notes ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-3">{lead.project_internal_notes}</p>
                          <button onClick={() => setIsEditingNotes(true)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit Notes</button>
                        </div>
                      ) : (
                        <button onClick={() => setIsEditingNotes(true)}
                          className="w-full py-8 border-2 border-dashed border-gray-200 rounded-none hover:border-indigo-300 hover:bg-indigo-50/30 transition flex flex-col items-center gap-2">
                          <span className="text-2xl">📝</span>
                          <span className="text-xs font-semibold text-gray-400 hover:text-indigo-500">Add internal notes</span>
                        </button>
                      )}
                    </div>
                    
                  </div>
                </div>

          

{/* AI Brief */}
<div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
  <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
      <span className="w-5 h-5 bg-violet-50 flex items-center justify-center text-xs">✦</span>
      AI Brief
      {customerPhotos.length > 0 && (
        <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-500 rounded-none">
          includes photo analysis
        </span>
      )}
    </h3>
    {!aiSummary && (
      <button
        onClick={handleAiSummary}
        disabled={loadingAi}
        className="px-3 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 transition rounded-none"
      >
        {loadingAi ? 'Analyzing...' : 'Generate Brief'}
      </button>
    )}
  </div>

  {!aiSummary && !loadingAi && (
    <div className="px-5 py-8 text-center">
      <p className="text-sm text-gray-400">
        {customerPhotos.length > 0
          ? 'Generate a brief — photos will be analyzed automatically.'
          : 'Generate an AI brief for this lead.'}
      </p>
    </div>
  )}

{loadingAi && (
  <div className="px-5 py-10 flex flex-col items-center gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-violet-100" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
      <div className="absolute inset-[6px] rounded-full border-2 border-transparent border-b-violet-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.6s' }} />
      <div className="absolute inset-0 flex items-center justify-center text-sm text-violet-500">✦</div>
    </div>
    <div className="text-center space-y-1">
      <p className="text-sm font-semibold text-gray-700">Analyzing your lead</p>
      <p className="text-xs text-gray-400">
        {customerPhotos.length > 0 ? 'Reading description and photos...' : 'Reading job details...'}
      </p>
    </div>
  </div>
)}

  {aiSummary && (
    <div className="p-5 space-y-4">
      {aiSummary.headline && (
        <div className="text-sm font-bold text-gray-900 border-l-4 border-violet-400 pl-3 leading-snug">
          {aiSummary.headline}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {aiSummary.urgency && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-none ${
            aiSummary.urgency === 'Emergency' ? 'bg-red-500 text-white' :
            aiSummary.urgency === 'High Priority' ? 'bg-orange-500 text-white' :
            aiSummary.urgency === 'Normal' ? 'bg-blue-500 text-white' :
            'bg-gray-400 text-white'
          }`}>{aiSummary.urgency}</span>
        )}
        {aiSummary.customer_score && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-none border ${
            aiSummary.customer_score === 'VIP' ? 'bg-amber-100 text-amber-800 border-amber-300' :
            aiSummary.customer_score === 'Good' ? 'bg-green-100 text-green-800 border-green-300' :
            aiSummary.customer_score === 'Risky' ? 'bg-red-100 text-red-800 border-red-300' :
            'bg-gray-100 text-gray-700 border-gray-300'
          }`}>{aiSummary.customer_score}</span>
        )}
      </div>
      {aiSummary.summary && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-none">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Summary</p>
          <p className="text-sm text-gray-700 leading-relaxed">{aiSummary.summary}</p>
        </div>
      )}
      {aiSummary.photo_observations && aiSummary.photo_observations !== 'null' && (
        <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-none">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">📸 Photo Analysis</p>
          <p className="text-sm text-indigo-900 leading-relaxed">{aiSummary.photo_observations}</p>
        </div>
      )}
      {aiSummary.next_steps?.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-none">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">Next Steps</p>
          <ul className="space-y-2">
            {aiSummary.next_steps.map((step: string, i: number) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                <span className="text-emerald-500 font-bold min-w-[1.25rem]">{i + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {aiSummary.critical_info?.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-none">
          <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">⚠ Critical</p>
          <ul className="space-y-1">
            {aiSummary.critical_info.map((info: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-amber-800">
                <span>•</span><span>{info}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => setAiSummary(null)}
        className="text-xs text-gray-400 hover:text-gray-600 transition"
      >
        Regenerate
      </button>
    </div>
  )}
</div>


              </>
            )}

            {/* ── PROJECT TABS ── */}
            {activeTab !== 'overview' && activeTab !== 'activity' && isProject && (
              <ProjectSection
                lead={lead}
                currentUser={currentUser}
                onRefresh={onRefresh}
                statusOptions={statusOptions}
                onUpdateStatus={onUpdateStatus}
                companySlug={companySlug}
                defaultTab={activeTab}
              />
            )}

            {/* ── ACTIVITY TAB ── */}
            {activeTab === 'activity' && (
              <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-5 h-5 rounded-none bg-blue-50 flex items-center justify-center text-xs">💬</span>
                    Activity Log
                    {notesArray.length > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-none">
                        {notesArray.length}
                      </span>
                    )}
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..." rows={3}
                      className="w-full px-4 py-3 text-sm rounded-none border-2 border-gray-100 focus:border-indigo-300 focus:outline-none resize-none bg-gray-50 focus:bg-white transition" />
                    <button onClick={handleAddNote} disabled={saving || !newNote.trim()}
                      className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold py-3 text-sm rounded-none transition">
                      {saving ? 'Adding...' : 'Add Note'}
                    </button>
                  </div>
                  {notesArray.length > 0 && (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {[...notesArray].reverse().map((note: any, idx: number) => {
                        const isOld = typeof note === 'string';
                        const text = isOld ? note : note.text;
                        const user = isOld ? 'Unknown' : (note.user_name || 'System');
                        const ts = isOld ? lead.created_at : note.timestamp;
                        return (
                          <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-none">
                            <div className="w-7 h-7 rounded-none bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                              {user.charAt(0).toUpperCase()}
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
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────── */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-gray-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-none border-2 border-gray-100 bg-white hover:bg-gray-50 text-sm font-bold text-gray-600 transition">
            Close
          </button>
          {newNote.trim() && activeTab === 'activity' && (
            <button onClick={async () => {
              setSaving(true);
              const ok = await onAddNote(lead.id, newNote);
              setSaving(false);
              if (ok) { setNewNote(''); toast.success('Note saved!'); await onRefresh(); onClose(); }
            }} disabled={saving}
              className="flex-2 flex-[2] py-3 rounded-none text-sm font-bold text-white transition"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          )}
        </div>

      </div>

      {/* ── REPEAT CUSTOMER HISTORY DRAWER ── */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="flex-1" onClick={() => setShowHistoryDrawer(false)} />
          <div className="w-full sm:w-96 bg-white shadow-2xl flex flex-col h-full border-l border-gray-200">
            {/* Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-gray-100 flex items-center gap-3" style={{ background: '#312e81' }}>
              <button onClick={() => setShowHistoryDrawer(false)}
                className="w-8 h-8 flex items-center justify-center rounded-none"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <X className="w-4 h-4 text-white/70" />
              </button>
              <div>
                <p className="text-xs font-semibold text-white/50">Repeat Customer</p>
                <p className="text-sm font-bold text-white">{lead.name}</p>
              </div>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                {relatedLeads.length} Previous Job{relatedLeads.length > 1 ? 's' : ''}
              </p>
              {relatedLeads.map((rl: any) => {
                const confidence = rl.match_confidence === 'high';
                const date = new Date(rl.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <div key={rl.id} className="bg-white border border-gray-200 rounded-none p-4 space-y-2 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{rl.category || 'No category'}</p>
                        <p className="text-xs text-gray-400">{date}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-none ${
                        rl.status === 'completed' ? 'bg-emerald-100 text-emerald-700'
                        : rl.status === 'cancelled' ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                        {rl.status}
                      </span>
                    </div>
                    {rl.description && (
                      <p className="text-xs text-gray-500 leading-relaxed">{rl.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {rl.quote_total && (
                        <span className="font-semibold text-gray-700">
                          ${parseFloat(rl.quote_total).toLocaleString()}
                        </span>
                      )}
                      {rl.payment_status === 'paid' && (
                        <span className="text-emerald-600 font-semibold">Paid</span>
                      )}
                      {rl.scheduled_date && (
                        <span>{new Date(rl.scheduled_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                      <span className={`text-xs font-semibold ${confidence ? 'text-amber-500' : 'text-gray-400'}`}>
                      </span>
                      {rl.project_id ? (
                        <span className="text-xs text-gray-400">Project #{rl.project_number || rl.project_id}</span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No project</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showCompletionSummary && (
        <CompletionSummaryModal
          lead={lead}
          onConfirm={() => { setShowCompletionSummary(false); handleStatusChange(); }}
          onCancel={() => { setShowCompletionSummary(false); setSelectedStatus(lead.status || statusOptions[0]?.value); }}
        />
      )}
    </div>
  );
}

// ── Helper component ──────────────────────────────
function InfoField({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">{label}</p>
      <p className={`text-sm font-semibold ${isLink ? 'text-indigo-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}