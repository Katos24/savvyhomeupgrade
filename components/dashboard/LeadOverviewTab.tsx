'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Mail, Phone, MessageSquare, Navigation, Edit2,
  Image as ImageIcon, Lock, History, NotebookPen,
  Layers, Star, CreditCard, Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConvertToProjectButton from '@/components/dashboard/ConvertToProjectButton';
import LeadLightbox from '@/components/dashboard/LeadLightbox';
import JobProgress from '@/components/dashboard/JobProgress';
import { can, type PlanTier } from '@/lib/permissions';
import { timelineLabel, bestTimesLabel } from '@/lib/timing';

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
  onMarkComplete?: () => void;
};

// Same values as the booking form's "How did you hear about us?" pills.
const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: 'Google Search',
  facebook: 'Facebook',
  instagram: 'Instagram',
  google_ads: 'Google Ads',
  referral: 'Referral',
  yard_sign: 'Yard sign',
  truck: 'Saw your truck',
  other: 'Other',
  dashboard_manual: 'Added by your team',
};

type DetailRow = { key: string; label: string; value: React.ReactNode; long?: boolean };

export default function LeadOverviewTab({
  lead,
  company,
  currentUser,
  categories,
  onRefresh,
  relatedLeads,
  onShowHistory,
   quoteTemplates,
  onMarkComplete,
}: LeadOverviewTabProps) {
  const [saving, setSaving] = useState(false);
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
  const [sendingReview, setSendingReview] = useState(false);
  const [reviewSentAt, setReviewSentAt] = useState<string | null>(lead.review_request_sent_at ?? null);
  useEffect(() => {
    if (lead.review_request_sent_at) setReviewSentAt(lead.review_request_sent_at);
  }, [lead.review_request_sent_at]);

  const isCompletedJob = isProject && lead.status === 'completed';
  const canReview = can(planTier, 'google_reviews');
  // Same math as BillingSection so the two never disagree
  const completedAt = (lead as { job_completed_at?: string | null }).job_completed_at ?? null;
  const jobTotal = parseFloat(String((lead as { quote_total?: number | string | null }).quote_total ?? '0')) || 0;
  const amountPaid = parseFloat(String((lead as { payment_amount?: number | string | null }).payment_amount ?? '0')) || 0;
  const amountLeft = Math.max(jobTotal - amountPaid, 0);
  const paymentStatus: 'paid' | 'partial' | 'unpaid' | null =
    jobTotal > 0 ? (amountLeft <= 0 ? 'paid' : amountPaid > 0 ? 'partial' : 'unpaid') : null;
  const paidPct = jobTotal > 0 ? Math.min((amountPaid / jobTotal) * 100, 100) : 0;
  const money = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n % 1 === 0 ? 0 : 2 });

  const handleSendReview = async () => {
    setSendingReview(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'send_review_request',
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewSentAt(data.review_request_sent_at || new Date().toISOString());
        toast.success('Review request sent');
        await onRefresh();
      } else {
        toast.error(data.error || 'Could not send the review request');
      }
    } catch {
      toast.error('Could not send the review request');
    } finally {
      setSendingReview(false);
    }
  };

  const customerPhotos = useMemo(
    () =>
      Array.isArray(lead.file_urls)
        ? lead.file_urls.map((f: any) => (typeof f === 'string' ? f : f?.url || f?.path || '')).filter(Boolean)
        : [],
    [lead.file_urls]
  );

  // Safely parse custom answers whether stringified or raw object
  const customAnswersObj = useMemo(() => {
    if (!lead.custom_answers) return {};
    if (typeof lead.custom_answers === 'string') {
      try {
        return JSON.parse(lead.custom_answers);
      } catch {
        return {};
      }
    }
    return lead.custom_answers;
  }, [lead.custom_answers]);

  const formatPhoneNumber = (value: string): string => {
    const phoneNumber = (value ?? '').replace(/\D/g, '').slice(0, 10);
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
    const cityZip = [lead.city, lead.zip_code].filter(Boolean).join(' ');
    return `${addr}${lead.address_line_2 ? ', ' + lead.address_line_2 : ''}${cityZip ? ', ' + cityZip : ''}`;
  })();

  const receivedAt = lead.created_at
    ? new Date(lead.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null;

  const handleSaveInternalNotes = async () => {
    if (!lead.project_id) {
      toast.error('Project not found');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_internal_notes',
          internal_notes: internalNotesText,
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });
      if (res.ok) {
        toast.success('Notes saved!');
        setIsEditingNotes(false);
        await onRefresh();
      } else toast.error('Failed to save notes');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setSaving(false);
    }
  };

  const executeSaveDetails = async (overrideQuote?: any[] | null, overrideTaxRate?: number) => {
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'update_details',
          ...editedDetails,
          category: selectedCategory,
          description: lead.description,
          user_name: currentUser?.name || currentUser?.email,
          user_email: currentUser?.email,
        }),
      });
      if (!res.ok) {
        toast.error('Failed to update details');
        return;
      }
      if (overrideQuote) {
        const rate = overrideTaxRate ?? 0;
        const subtotal = overrideQuote.reduce((s: number, i: any) => s + i.amount, 0);
        const total = subtotal + subtotal * (rate / 100);
        await fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id,
            action: 'save_quote',
            quote_data: overrideQuote,
            quote_tax_rate: rate,
            quote_total: total,
            user_name: currentUser?.name || currentUser?.email,
            user_email: currentUser?.email,
          }),
        });
      }
      toast.success('Details updated!');
      setIsEditingDetails(false);
      await onRefresh();
    } catch {
      toast.error('Failed to update details');
    } finally {
      setSaving(false);
    }
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

  // One-tap contact actions — always visible, phone included.
  const actionButtons = [
    ...(lead.phone ? [{ icon: <Phone className="w-4 h-4" />, label: 'Call', href: `tel:${lead.phone}` }] : []),
    ...(lead.phone ? [{ icon: <MessageSquare className="w-4 h-4" />, label: 'Text', href: `sms:${lead.phone}` }] : []),
    ...(lead.email ? [{ icon: <Mail className="w-4 h-4" />, label: 'Email', href: `mailto:${lead.email}` }] : []),
    ...(fullAddress
      ? [{
          icon: <Navigation className="w-4 h-4" />,
          label: 'Directions',
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`,
          external: true,
        }]
      : []),
  ] as { icon: React.ReactNode; label: string; href: string; external?: boolean }[];

  // ── Request details: one list, only what the customer actually answered ──
  const formatAnswer = (answer: any): { text: string; long: boolean } | null => {
    if (answer === null || answer === undefined || answer === '') return null;
    if (typeof answer === 'boolean') return { text: answer ? 'Yes' : 'No', long: false };
    if (Array.isArray(answer)) {
      const parts = answer.map((a) => String(a)).filter(Boolean);
      return parts.length ? { text: parts.join(', '), long: false } : null;
    }
    const s = String(answer).trim();
    if (!s) return null;
    return { text: s, long: s.length > 50 };
  };

  const timeline = timelineLabel(lead.preferred_date);
  const bestTimes = bestTimesLabel(lead.preferred_time);

  const detailRows: DetailRow[] = [];
  if (lead.category) detailRows.push({ key: 'service', label: 'Service', value: formatCategory(lead.category) });
  if (timeline)
    detailRows.push({
      key: 'timeline',
      label: 'How soon',
      value:
        lead.preferred_date === 'asap' ? (
          <span className="inline-flex rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
            {timeline}
          </span>
        ) : (
          timeline
        ),
    });
  if (bestTimes) detailRows.push({ key: 'best_times', label: 'Best times', value: bestTimes });
  if (fullAddress) detailRows.push({ key: 'address', label: 'Address', value: fullAddress });
  if (lead.lead_source)
    detailRows.push({
      key: 'source',
      label: 'Heard about you',
      value: LEAD_SOURCE_LABELS[lead.lead_source] || String(lead.lead_source).replace(/_/g, ' '),
    });
  for (const [qId, answer] of Object.entries(customAnswersObj)) {
    const formatted = formatAnswer(answer);
    if (!formatted) continue;
    const qDef = (company?.custom_questions || []).find((q: any) => q.id === qId);
    detailRows.push({
      key: `q_${qId}`,
      label: qDef?.label || qId.replace(/_/g, ' '),
      value: formatted.text,
      long: formatted.long,
    });
  }

  const inputCls =
    'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400 bg-white';
  const labelCls = 'text-xs font-medium text-slate-500 mb-1 block';

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {lightbox && <LeadLightbox photos={lightbox.photos} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}

      {/* ── 1. Where the job stands ── */}
      {isProject && (
        <JobProgress
          lead={lead}
          canReview={canReview}
          reviewSentAt={reviewSentAt}
          sendingReview={sendingReview}
                  onSendReview={handleSendReview}
          onMarkComplete={onMarkComplete}
        />
      )}

      {/* Job wrap-up (completed jobs) */}
      {isCompletedJob && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Job complete</p>
              <p className="text-xs text-slate-500">
                {completedAt
                  ? `Finished ${new Date(completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · `
                  : ''}
                {paymentStatus === 'paid' && (reviewSentAt || !canReview) ? 'All wrapped up.' : 'A couple of things to close out.'}
              </p>
            </div>
            {jobTotal > 0 && (
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Job total</p>
                <p className="text-base font-bold tabular-nums text-slate-900">{money(jobTotal)}</p>
              </div>
            )}
          </div>

          <div className={`mt-4 grid gap-3 ${paymentStatus && canReview ? 'sm:grid-cols-2' : ''}`}>
            {paymentStatus && (
              <div className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center gap-2">
                  <CreditCard className={`h-4 w-4 ${paymentStatus === 'paid' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Payment</span>
                </div>
                <p
                  className={`mt-2 text-sm font-semibold ${
                    paymentStatus === 'paid' ? 'text-emerald-700' : paymentStatus === 'partial' ? 'text-amber-700' : 'text-slate-700'
                  }`}
                >
                  {paymentStatus === 'paid' ? 'Paid in full' : paymentStatus === 'partial' ? 'Balance due' : 'Not paid yet'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {paymentStatus === 'paid'
                    ? `${money(amountPaid)} collected`
                    : paymentStatus === 'partial'
                    ? `${money(amountPaid)} of ${money(jobTotal)} · ${money(amountLeft)} left`
                    : `${money(jobTotal)} to collect`}
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    style={{ width: `${paidPct}%` }}
                  />
                </div>
              </div>
            )}

            {canReview && (
              <div className="rounded-xl border border-slate-200 p-3.5">
                <div className="flex items-center gap-2">
                  <Star className={`h-4 w-4 ${reviewSentAt ? 'text-amber-400' : 'text-slate-400'}`} fill={reviewSentAt ? 'currentColor' : 'none'} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Google review</span>
                </div>
                {reviewSentAt ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-slate-900">Request sent</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Sent {new Date(reviewSentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {lead.email ? ` to ${lead.email}` : ''}
                    </p>
                  </>
                ) : lead.email ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-slate-700">Not asked yet</p>
                    <button
                      onClick={handleSendReview}
                      disabled={sendingReview}
                      className="mt-2.5 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      {sendingReview ? 'Sending…' : 'Send review request'}
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-semibold text-slate-700">Not asked yet</p>
                    <p className="mt-0.5 text-xs text-slate-500">Add their email to send one.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lead (not converted yet): same status-bar look as JobProgress,
          so the card reads the same before and after converting. */}
      {!isProject && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                New request
                {receivedAt && <span className="ml-1.5 font-normal text-slate-500">· {receivedAt}</span>}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {can(planTier, 'convert_to_project')
                  ? 'Next: convert it to a project to quote, schedule and invoice.'
                  : 'Quoting, scheduling and invoicing are on the Pro plan.'}
              </p>
            </div>
            <ConvertToProjectButton lead={lead} currentUser={currentUser} onRefresh={onRefresh} planTier={company?.plan_tier} />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
            {['Request', 'Quote', 'Deposit', 'Scheduled', 'Paid'].map((label, i) => (
              <div key={label} className="flex min-w-0 flex-1 flex-col gap-1">
                <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-[#00828A]' : 'bg-slate-100'}`} />
                <span className={`truncate ${i === 0 ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 2. Contact — always open, one-tap actions ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 font-bold text-sm">
              {lead.name ? lead.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-900 truncate">{lead.name || 'Unnamed client'}</span>
                {relatedLeads.length > 0 && (
                  <button
                    onClick={onShowHistory}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <History className="w-3 h-3" />
                    {relatedLeads.length} past job{relatedLeads.length > 1 ? 's' : ''}
                  </button>
                )}
              </div>
              {isProject && receivedAt && <p className="text-xs text-slate-500 mt-0.5">Request received {receivedAt}</p>}
            </div>
          </div>
          {!isEditingDetails && (
            <button
              onClick={() => setIsEditingDetails(true)}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          )}
        </div>

        {isEditingDetails ? (
          <div className="border-t border-slate-100 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Name</label>
                <input type="text" value={editedDetails.name} onChange={(e) => setEditedDetails({ ...editedDetails, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input
                  type="tel"
                  value={formatPhoneNumber(editedDetails.phone)}
                  onChange={(e) => setEditedDetails({ ...editedDetails, phone: formatPhoneNumber(e.target.value) })}
                  className={inputCls}
                  maxLength={14}
                />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={editedDetails.email} onChange={(e) => setEditedDetails({ ...editedDetails, email: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Service</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={inputCls}>
                  {categories.map((cat: any) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input type="text" value={editedDetails.address_line_1} onChange={(e) => setEditedDetails({ ...editedDetails, address_line_1: e.target.value })} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Apt / Suite</label>
                <input type="text" value={editedDetails.address_line_2} onChange={(e) => setEditedDetails({ ...editedDetails, address_line_2: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={editedDetails.city} onChange={(e) => setEditedDetails({ ...editedDetails, city: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveDetails}
                disabled={saving}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button
                onClick={() => setIsEditingDetails(false)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <dl className="border-t border-slate-100 divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt className="text-slate-500">Phone</dt>
                <dd className="font-medium text-slate-900 text-right">{formatPhoneNumber(lead.phone) || '—'}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-medium text-slate-900 text-right break-all">{lead.email || '—'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-2.5">
                <dt className="text-slate-500 shrink-0">Address</dt>
                <dd className="font-medium text-slate-900 text-right">{fullAddress || '—'}</dd>
              </div>
            </dl>

            {actionButtons.length > 0 && (
              <div className={`grid gap-2 border-t border-slate-100 p-3 ${actionButtons.length === 4 ? 'grid-cols-4' : actionButtons.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {actionButtons.map((btn) => (
                  <a
                    key={btn.label}
                    href={btn.href}
                    target={btn.external ? '_blank' : undefined}
                    rel={btn.external ? 'noopener noreferrer' : undefined}
                    className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition"
                  >
                    {btn.icon}
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── 3. What they want ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Customer request</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Their message */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {lead.description || <span className="text-slate-400 italic">No message from the customer.</span>}
          </div>

          {/* Photos */}
          {customerPhotos.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <ImageIcon className="w-3.5 h-3.5" />
                Photos ({customerPhotos.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {customerPhotos.map((url: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setLightbox({ photos: customerPhotos, index: i })}
                    className="w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-xl border border-slate-200 hover:border-slate-400 transition"
                  >
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Details: one list — timing, address, source and custom questions */}
        {detailRows.length > 0 && (
          <dl className="border-t border-slate-100 divide-y divide-slate-100 text-sm">
            {detailRows.map((row) =>
              row.long ? (
                <div key={row.key} className="px-4 py-2.5">
                  <dt className="text-slate-500 mb-1">{row.label}</dt>
                  <dd className="text-slate-900 leading-relaxed whitespace-pre-line">{row.value}</dd>
                </div>
              ) : (
                <div key={row.key} className="flex items-start justify-between gap-4 px-4 py-2.5">
                  <dt className="text-slate-500 min-w-0">{row.label}</dt>
                  <dd className="font-medium text-slate-900 text-right shrink-0 max-w-[60%]">{row.value}</dd>
                </div>
              )
            )}
          </dl>
        )}
      </div>

      {/* ── 4. Internal notes (team only) ── */}
      {isProject && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Internal notes
              <span className="text-xs font-normal text-slate-400">· team only</span>
            </h3>
            {lead.project_internal_notes && !isEditingNotes && (
              <button onClick={() => setIsEditingNotes(true)} className="text-xs font-semibold text-slate-600 hover:text-slate-900">
                Edit
              </button>
            )}
          </div>

          <div className="p-4">
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={internalNotesText}
                  onChange={(e) => setInternalNotesText(e.target.value)}
                  rows={4}
                  placeholder="Add private notes for your team…"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-slate-400 bg-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveInternalNotes}
                    disabled={saving}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition"
                  >
                    {saving ? 'Saving…' : 'Save notes'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingNotes(false);
                      setInternalNotesText(lead.project_internal_notes || '');
                    }}
                    className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : lead.project_internal_notes ? (
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{lead.project_internal_notes}</p>
            ) : (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="w-full py-3 border border-dashed border-slate-300 rounded-xl hover:border-slate-400 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-xs font-semibold text-slate-500"
              >
                <NotebookPen className="w-3.5 h-3.5" />
                Add internal note
              </button>
            )}
          </div>
        </div>
      )}

      {/* Category change confirmation */}
      <AnimatePresence>
        {pendingCategoryChange && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Update quote template?</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-5">
                <span className="font-semibold text-slate-800">{pendingCategoryChange?.newLabel}</span> has a preset pricing
                template. Replace the current quote items with it?
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={async () => {
                    setPendingCategoryChange(null);
                    await executeSaveDetails(null);
                  }}
                  className="py-2.5 border border-slate-200 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition text-xs"
                >
                  Keep current
                </button>
                <button
                  onClick={async () => {
                    const items = pendingCategoryChange?.template.items.map((item: any, i: number) => ({
                      ...item,
                      id: `item_${Date.now()}_${i}`,
                    }));
                    const rate = pendingCategoryChange?.template.tax_rate ?? 0;
                    setPendingCategoryChange(null);
                    await executeSaveDetails(items, rate);
                  }}
                  className="py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Use template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}