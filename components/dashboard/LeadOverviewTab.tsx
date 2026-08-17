'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Mail, Phone, MessageSquare, Navigation, Edit2,
  Calendar, Clock, Image, Lock, History, UserCircle,
  MessageCircle, NotebookPen, ChevronDown, ChevronUp,
  Sparkles, MapPin, Tag
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
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showCustomQuestions, setShowCustomQuestions] = useState(true);
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
    { icon: <Mail className="w-3.5 h-3.5" />, label: 'Email', action: () => window.location.href = `mailto:${lead.email}`, color: '#3b82f6' },
    { icon: <Phone className="w-3.5 h-3.5" />, label: 'Call', action: () => window.location.href = `tel:${lead.phone}`, color: '#22c55e' },
    { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Text', action: () => window.location.href = `sms:${lead.phone}`, color: '#a855f7' },
    ...(fullAddress ? [{ icon: <Navigation className="w-3.5 h-3.5" />, label: 'Directions', action: () => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, '_blank'), color: '#ef4444' }] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
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
          className="rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4"
          style={{ background: '#0f172a' }}
        >
          <div>
            <p className="text-sm font-semibold text-white">Ready to start this job?</p>
            <p className="text-xs mt-0.5 text-slate-300">Convert to a project to unlock scheduling, quotes, and tasks.</p>
          </div>
          <ConvertToProjectButton lead={lead} currentUser={currentUser} onRefresh={onRefresh} planTier={company?.plan_tier} />
        </motion.div>
      )}

      {/* SLIM COLLAPSIBLE CLIENT BAR */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden transition-all">
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white">
          
          {/* Left: Quick Client Summary */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm">
              {lead.name ? lead.name.charAt(0).toUpperCase() : <UserCircle className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-900 truncate">{lead.name || 'Unnamed Client'}</span>
                {lead.category && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[11px] font-medium shrink-0">
                    {formatCategory(lead.category)}
                  </span>
                )}
                {relatedLeads.length > 0 && (
                  <button
                    onClick={onShowHistory}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md hover:bg-amber-100 transition"
                  >
                    <History className="w-3 h-3 text-amber-500" />
                    {relatedLeads.length} past job{relatedLeads.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {formatPhoneNumber(lead.phone)} {lead.phone && lead.email && '•'} {lead.email}
              </p>
            </div>
          </div>

          {/* Right: Quick Actions & Toggle Expand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5">
              {actionButtons.map(btn => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition"
                  title={btn.label}
                >
                  <span style={{ color: btn.color }}>{btn.icon}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowClientDetails(!showClientDetails)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition"
            >
              <span>{showClientDetails ? 'Hide Info' : 'Client Info'}</span>
              {showClientDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Extended Client Details / Edit Form */}
        <AnimatePresence>
          {showClientDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5"
            >
              {isEditingDetails ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
                      <input type="text" value={editedDetails.name}
                        onChange={e => setEditedDetails({ ...editedDetails, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
                      <input type="tel" value={editedDetails.phone}
                        onChange={e => setEditedDetails({ ...editedDetails, phone: formatPhoneNumber(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white" maxLength={14} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                      <input type="email" value={editedDetails.email}
                        onChange={e => setEditedDetails({ ...editedDetails, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                      <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white">
                        {categories.map((cat: any) => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Address</label>
                    <input type="text" value={editedDetails.address_line_1}
                      onChange={e => setEditedDetails({ ...editedDetails, address_line_1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Apt/Suite</label>
                      <input type="text" value={editedDetails.address_line_2}
                        onChange={e => setEditedDetails({ ...editedDetails, address_line_2: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                      <input type="text" value={editedDetails.city}
                        onChange={e => setEditedDetails({ ...editedDetails, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white" />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveDetails} disabled={saving}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition">
                      {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <button onClick={() => setIsEditingDetails(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl text-xs transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                        <span className="text-gray-500 font-medium">Full Name</span>
                        <span className="text-gray-900 font-semibold">{lead.name || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                        <span className="text-gray-500 font-medium">Email</span>
                        <span className="text-blue-600 font-medium break-all">{lead.email || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                        <span className="text-gray-500 font-medium">Phone</span>
                        <span className="text-gray-900 font-semibold">{formatPhoneNumber(lead.phone) || '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                        <span className="text-gray-500 font-medium">Category</span>
                        <span className="text-gray-900 font-semibold">{formatCategory(lead.category)}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/60 pb-1.5">
                        <span className="text-gray-500 font-medium">Address</span>
                        <span className="text-gray-800 font-medium text-right">{fullAddress || '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Mobile */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <div className="flex sm:hidden gap-1.5 w-full">
                      {actionButtons.map(btn => (
                        <button
                          key={btn.label}
                          onClick={btn.action}
                          className="flex-1 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 flex items-center justify-center gap-1"
                        >
                          <span style={{ color: btn.color }}>{btn.icon}</span>
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setIsEditingDetails(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition shrink-0 ml-auto"
                    >
                      <Edit2 className="w-3 h-3" /> Edit Info
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HERO SECTION: CUSTOMER REQUEST (FULL WIDTH & EASY TO READ) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-gray-100 bg-emerald-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              Customer Request
            </h3>
          </div>

          {(lead.preferred_date || lead.preferred_time) && (
            <div className="flex items-center gap-2 text-xs text-blue-700 font-medium bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>
                {lead.preferred_date && (() => { const d = new Date(lead.preferred_date); return isNaN(d.getTime()) ? lead.preferred_date : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); })()}
                {lead.preferred_time && ` @ ${lead.preferred_time}`}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-5">
          {/* Main Message Box */}
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Message</span>
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 text-sm text-gray-800 leading-relaxed font-normal whitespace-pre-line">
              {lead.description || <span className="text-gray-400 italic">No message submitted by customer.</span>}
            </div>
          </div>

          {/* Attached Photos */}
          {customerPhotos.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Image className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Submitted Photos ({customerPhotos.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {customerPhotos.map((url: string, i: number) => (
                  <motion.button key={i} whileTap={{ scale: 0.95 }}
                    onClick={() => setLightbox({ photos: customerPhotos, index: i })}
                    className="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border border-gray-200 hover:border-blue-500 transition rounded-xl shadow-xs">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition duration-200" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Answers */}
          {lead.custom_answers && Object.keys(lead.custom_answers).length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <button onClick={() => setShowCustomQuestions(!showCustomQuestions)}
                className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 hover:text-blue-600 transition mb-3">
                <span>Additional Details ({Object.keys(lead.custom_answers).length})</span>
                {showCustomQuestions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              
              <AnimatePresence>
                {showCustomQuestions && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-hidden">
                    {Object.entries(lead.custom_answers).map(([qId, answer]: [string, any]) => {
                      const qDef = (company?.custom_questions || []).find((q: any) => q.id === qId);
                      return (
                        <div key={qId} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs gap-2">
                          <span className="text-gray-500 font-medium truncate">{qDef?.label || qId}</span>
                          <span className="text-gray-900 font-bold shrink-0">
                            {typeof answer === 'boolean' ? (answer ? 'Yes' : 'No') : answer || '—'}
                          </span>
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

      {/* INTERNAL TEAM NOTES */}
      {isProject && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-gray-100 bg-amber-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Internal Notes (Team Only)
              </h3>
            </div>
            {lead.project_internal_notes && !isEditingNotes && (
              <button onClick={() => setIsEditingNotes(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Edit Notes
              </button>
            )}
          </div>

          <div className="p-4">
            <AnimatePresence mode="wait">
              {isEditingNotes ? (
                <div className="space-y-2">
                  <textarea value={internalNotesText} onChange={e => setInternalNotesText(e.target.value)}
                    rows={4} placeholder="Add private notes for your team..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:border-blue-400 bg-white" />
                  <div className="flex gap-2">
                    <button onClick={handleSaveInternalNotes} disabled={saving}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition">
                      {saving ? 'Saving...' : 'Save Notes'}
                    </button>
                    <button onClick={() => { setIsEditingNotes(false); setInternalNotesText(lead.project_internal_notes || ''); }}
                      className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : lead.project_internal_notes ? (
                <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-100 text-xs text-gray-800 leading-relaxed font-normal whitespace-pre-line">
                  {lead.project_internal_notes}
                </div>
              ) : (
                <button onClick={() => setIsEditingNotes(true)}
                  className="w-full py-3 border border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 hover:text-blue-600">
                  <NotebookPen className="w-3.5 h-3.5" />
                  Add internal note
                </button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Category Change Confirmation Modal */}
      <AnimatePresence>
        {pendingCategoryChange && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Update quote too?</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-5">
                <span className="font-semibold text-gray-800">{pendingCategoryChange?.newLabel}</span> has a pricing template. Replace your current quote items with it?
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={async () => { setPendingCategoryChange(null); await executeSaveDetails(null); }}
                  className="py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition text-xs">
                  Keep current
                </button>
                <button onClick={async () => {
                    const items = pendingCategoryChange?.template.items.map((item: any, i: number) => ({ ...item, id: `item_${Date.now()}_${i}` }));
                    setPendingCategoryChange(null);
                    await executeSaveDetails(items);
                  }}
                  className="py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition text-xs">
                  Use template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}