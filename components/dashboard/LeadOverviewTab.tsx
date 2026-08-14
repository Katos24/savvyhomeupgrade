'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Mail, Phone, MessageSquare, Navigation, Edit2,
  Calendar, Clock, Image, Lock, History, UserCircle,
  MessageCircle, NotebookPen, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConvertToProjectButton from '@/components/dashboard/ConvertToProjectButton';
import LeadLightbox from '@/components/dashboard/LeadLightbox';
import { can, type PlanTier } from '@/lib/permissions';

type LeadOverviewTabProps = {
  lead: any;
  company?: any;
  currentUser: any;
  categories: any[];
  statusOptions: any[];
  companySlug: string;
  onRefresh: () => Promise<void>;
  onAddNote: (id: number, text: string) => Promise<boolean>;
  relatedLeads: any[];
  onShowHistory: () => void;
  quoteTemplates: any[];
};

export default function LeadOverviewTab({
  lead,
  company,
  currentUser,
  categories,
  companySlug,
  onRefresh,
  onAddNote,
  relatedLeads,
  onShowHistory,
  quoteTemplates,
}: LeadOverviewTabProps) {
  const [saving, setSaving] = useState(false);
  const [showCustomQuestions, setShowCustomQuestions] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [internalNotesText, setInternalNotesText] = useState(lead.project_internal_notes || '');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(lead.category || '');
  const [editedDetails, setEditedDetails] = useState({
    name: lead.name || '',
    email: lead.email || '',
    phone: lead.phone || '',
    address_line_1: lead.address_line_1 || '',
    address_line_2: lead.address_line_2 || '',
    city: lead.city || '',
  });
  const [lightbox, setLightbox] = useState<{ photos: string[]; index: number } | null>(null);
  const [pendingCategoryChange, setPendingCategoryChange] = useState<any>(null);

  // States for expandable text
  const [expandedCustomerMessage, setExpandedCustomerMessage] = useState(false);
  const [expandedInternalNotes, setExpandedInternalNotes] = useState(false);

  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const isProject = !!lead.project_id;

  const customerPhotos = useMemo(() =>
    Array.isArray(lead.file_urls)
      ? lead.file_urls.map((f: any) => typeof f === 'string' ? f : f?.url || f?.path || '').filter(Boolean)
      : [],
    [lead.file_urls]);

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

  const fullAddress = (() => {
    const addr = lead.address_line_1;
    if (!addr) return null;
    return `${addr}${lead.address_line_2 ? ', ' + lead.address_line_2 : ''}${lead.city ? ', ' + lead.city : ''}`;
  })();

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

  const executeSaveDetails = async (overrideQuote?: any[] | null, overrideTaxRate?: number) => {
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
      if (overrideQuote) {
        const rate = overrideTaxRate ?? 0;
        const subtotal = overrideQuote.reduce((s: number, i: any) => s + i.amount, 0);
        const total = subtotal + subtotal * (rate / 100);
        await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id, action: 'save_quote',
            quote_data: overrideQuote, quote_tax_rate: rate, quote_total: total,
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
        await executeSaveDetails(items, template.tax_rate ?? 0);
        return;
      }
    }
    await executeSaveDetails(null);
  };

  const actionButtons = [
    { icon: <Mail className="w-4 h-4" />, label: 'Email', action: () => window.location.href = `mailto:${lead.email}`, color: '#3b82f6' },
    { icon: <Phone className="w-4 h-4" />, label: 'Call', action: () => window.location.href = `tel:${lead.phone}`, color: '#22c55e' },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Text', action: () => window.location.href = `sms:${lead.phone}`, color: '#a855f7' },
    ...(fullAddress ? [{ icon: <Navigation className="w-4 h-4" />, label: 'Directions', action: () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank'), color: '#ef4444' }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {lightbox && (
        <LeadLightbox
          photos={lightbox.photos}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Convert to Project banner */}
      {!isProject && can(planTier, 'convert_to_project') && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 flex items-center justify-between gap-4"
          style={{ background: '#0f172a' }}
        >
          <div>
            <p className="text-sm font-semibold text-white">Ready to start this job?</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.81)' }}>Convert to a project to unlock scheduling, quotes, tasks, and more.</p>
          </div>
          <ConvertToProjectButton lead={lead} currentUser={currentUser} onRefresh={onRefresh} planTier={company?.plan_tier} />
        </motion.div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* LEFT COLUMN: Main Client Details (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <UserCircle className="w-3.5 h-3.5 text-blue-500" />
                </span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Client info
                </h3>
                {relatedLeads.length > 0 && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onShowHistory}
                    className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md hover:bg-amber-100 transition"
                  >
                    <History className="w-3 h-3 text-amber-500" />
                    {relatedLeads.length} past job{relatedLeads.length > 1 ? 's' : ''}
                  </motion.button>
                )}
              </div>

              {!isEditingDetails && (
                <button
                  onClick={() => setIsEditingDetails(true)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3 h-3" /> Edit details
                </button>
              )}
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                {isEditingDetails ? (
                  <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-400 mb-1 block">Name</label>
                        <input type="text" value={editedDetails.name}
                          onChange={e => setEditedDetails({ ...editedDetails, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-400 mb-1 block">Phone</label>
                        <input type="tel" value={editedDetails.phone}
                          onChange={e => setEditedDetails({ ...editedDetails, phone: formatPhoneNumber(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" maxLength={14} />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-1 block">Email</label>
                      <input type="email" value={editedDetails.email}
                        onChange={e => setEditedDetails({ ...editedDetails, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-1 block">Address</label>
                      <input type="text" value={editedDetails.address_line_1}
                        onChange={e => setEditedDetails({ ...editedDetails, address_line_1: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-400 mb-1 block">Apt/Suite</label>
                        <input type="text" value={editedDetails.address_line_2}
                          onChange={e => setEditedDetails({ ...editedDetails, address_line_2: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-400 mb-1 block">City</label>
                        <input type="text" value={editedDetails.city}
                          onChange={e => setEditedDetails({ ...editedDetails, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-400 mb-1 block">Category</label>
                      <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                        {categories.map((cat: any) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveDetails} disabled={saving}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-xl transition text-xs">
                        {saving ? 'Saving...' : 'Save changes'}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={() => setIsEditingDetails(false)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-xl transition text-xs">
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    
                    {/* Structured Row Order: Name | Category -> Email | Phone -> Address */}
                    <div className="space-y-4">
                      {/* Row 1: Name & Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Name</p>
                          <p className="text-sm font-semibold text-gray-900">{lead.name || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Category</p>
                          {lead.category ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-xs font-medium">
                              {formatCategory(lead.category)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">None</span>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Email & Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Email</p>
                          <p className="text-sm font-medium text-blue-600 break-all">{lead.email || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{formatPhoneNumber(lead.phone) || '—'}</p>
                        </div>
                      </div>

                      {/* Row 3: Address */}
                      {fullAddress && (
                        <div>
                          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Address</p>
                          <p className="text-sm font-medium text-gray-800 break-words">{fullAddress}</p>
                        </div>
                      )}
                    </div>

                    {/* Integrated Action Row */}
                    <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {actionButtons.map(btn => (
                        <motion.button
                          key={btn.label}
                          whileTap={{ scale: 0.96 }}
                          onClick={btn.action}
                          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-xs font-medium text-gray-700 shadow-sm transition"
                        >
                          <span style={{ color: btn.color }}>{btn.icon}</span>
                          {btn.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Customer Message OVER Internal Notes (1 col) */}
        <div className="space-y-5">
          {/* Customer Message */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              </span>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Customer's Message
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100/80">
                {lead.description ? (
                  <div>
                    <p className={`text-xs text-gray-700 leading-relaxed ${!expandedCustomerMessage ? 'line-clamp-3' : ''}`}>
                      {lead.description}
                    </p>
                    {lead.description.length > 120 && (
                      <button
                        onClick={() => setExpandedCustomerMessage(!expandedCustomerMessage)}
                        className="mt-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition"
                      >
                        {expandedCustomerMessage ? (
                          <>Show less <ChevronUp className="w-3 h-3" /></>
                        ) : (
                          <>Read more <ChevronDown className="w-3 h-3" /></>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No message provided</p>
                )}
              </div>

              {(lead.preferred_date || lead.preferred_time) && (
                <div className="flex flex-col gap-1.5 text-xs text-gray-600 bg-blue-50/30 px-3.5 py-2.5 rounded-xl border border-blue-100/40">
                  {lead.preferred_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-gray-400">Preferred Date:</span>
                      <span className="font-semibold text-gray-800">
                        {(() => { const d = new Date(lead.preferred_date); return isNaN(d.getTime()) ? lead.preferred_date : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); })()}
                      </span>
                    </div>
                  )}
                  {lead.preferred_time && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="font-medium text-gray-400">Time:</span>
                      <span className="font-semibold text-gray-800">{lead.preferred_time}</span>
                    </div>
                  )}
                </div>
              )}

              {customerPhotos.length > 0 && (
                <div className="pt-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Image className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-medium text-gray-400">
                      {customerPhotos.length} photo{customerPhotos.length > 1 ? 's' : ''} submitted
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customerPhotos.slice(0, 6).map((url: string, i: number) => (
                      <motion.button key={i} whileTap={{ scale: 0.95 }}
                        onClick={() => setLightbox({ photos: customerPhotos, index: i })}
                        className="w-12 h-12 overflow-hidden border border-gray-200 hover:border-blue-400 transition rounded-lg">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover hover:opacity-80 transition" />
                      </motion.button>
                    ))}
                    {customerPhotos.length > 6 && (
                      <motion.button whileTap={{ scale: 0.95 }}
                        onClick={() => setLightbox({ photos: customerPhotos, index: 6 })}
                        className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition">
                        <span className="text-xs font-medium text-gray-400">+{customerPhotos.length - 6}</span>
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {lead.custom_answers && Object.keys(lead.custom_answers).length > 0 && (
                <div className="pt-1">
                  <button onClick={() => setShowCustomQuestions(!showCustomQuestions)}
                    className="text-xs font-medium text-blue-600 flex items-center gap-1 hover:text-blue-700 transition">
                    {showCustomQuestions ? '▼' : '▶'} Additional Details ({Object.keys(lead.custom_answers).length})
                  </button>
                  <AnimatePresence>
                    {showCustomQuestions && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 space-y-2">
                        {Object.entries(lead.custom_answers).map(([qId, answer]: [string, any]) => {
                          const qDef = (company?.custom_questions || []).find((q: any) => q.id === qId);
                          return (
                            <div key={qId} className="text-xs">
                              <div className="text-gray-400 mb-0.5">{qDef?.label || qId}</div>
                              <div className="text-gray-800 font-medium">
                                {typeof answer === 'boolean' ? (answer ? 'Yes' : 'No') : answer || <span className="text-gray-400 italic">No answer</span>}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Internal Notes */}
          {isProject && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                  </span>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Internal Notes
                  </h3>
                </div>
                {lead.project_internal_notes && !isEditingNotes && (
                  <button onClick={() => setIsEditingNotes(true)} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                    Edit
                  </button>
                )}
              </div>
              <div className="p-4">
                <AnimatePresence mode="wait">
                  {isEditingNotes ? (
                    <motion.div key="editing-notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                      <textarea value={internalNotesText} onChange={e => setInternalNotesText(e.target.value)}
                        rows={4} placeholder="Private notes for team..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:border-blue-400" />
                      <div className="flex gap-2">
                        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveInternalNotes} disabled={saving}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-1.5 rounded-lg text-xs transition">
                          {saving ? 'Saving...' : 'Save'}
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.97 }}
                          onClick={() => { setIsEditingNotes(false); setInternalNotesText(lead.project_internal_notes || ''); }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 rounded-lg text-xs transition">
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : lead.project_internal_notes ? (
                    <motion.div key="has-notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
                      <p className={`text-xs text-gray-700 leading-relaxed ${!expandedInternalNotes ? 'line-clamp-3' : ''}`}>
                        {lead.project_internal_notes}
                      </p>
                      {lead.project_internal_notes.length > 120 && (
                        <button
                          onClick={() => setExpandedInternalNotes(!expandedInternalNotes)}
                          className="mt-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition"
                        >
                          {expandedInternalNotes ? (
                            <>Show less <ChevronUp className="w-3 h-3" /></>
                          ) : (
                            <>Read more <ChevronDown className="w-3 h-3" /></>
                          )}
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.button key="empty-notes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      whileTap={{ scale: 0.98 }} onClick={() => setIsEditingNotes(true)}
                      className="w-full py-3 border border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition flex items-center justify-center gap-2 text-xs font-medium text-gray-400 hover:text-blue-600">
                      <NotebookPen className="w-3.5 h-3.5" />
                      Add internal note
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>

      </div>

      {/* Category change modal */}
      <AnimatePresence>
        {pendingCategoryChange && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Update quote too?</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                <span className="font-medium text-gray-800">{pendingCategoryChange?.newLabel}</span> has a pricing template. Replace your current quote items with it?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={async () => { setPendingCategoryChange(null); await executeSaveDetails(null); }}
                  className="py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition text-sm">
                  Keep current
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={async () => {
                    const items = pendingCategoryChange?.template.items.map((item: any, i: number) => ({ ...item, id: `item_${Date.now()}_${i}` }));
                    setPendingCategoryChange(null);
                    await executeSaveDetails(items);
                  }}
                  className="py-3 bg-blue-600 text-white font-medium rounded-xl transition text-sm">
                  Use template
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}