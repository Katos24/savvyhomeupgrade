'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Plus, Trash2, Save, X, Edit2, Mail,
  Loader2, Sparkles, Eye, Receipt,
  ArrowRightLeft, FileText, CheckCircle2, Send,
} from 'lucide-react';
import SendEmailModal from '@/components/dashboard/SendEmailModal';
import AIQuoteGenerator from '../AIQuoteGenerator';
import { motion, AnimatePresence } from 'framer-motion';
import StickyActionBar from '@/components/dashboard/StickyActionBar';


type QuoteSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
  companySlug: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const noSpinners =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function QuoteSection({
  lead,
  currentUser,
  onRefresh,
  hasProject,
  companySlug,
}: QuoteSectionProps) {
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState(lead?.quote_data || []);
  const [isEditing, setIsEditing] = useState(false);
  const [showAI, setShowAI] = useState(false);
const [outboxLog, setOutboxLog] = useState<any[]>([]);
const [showEmailModal, setShowEmailModal] = useState(false);
const [lastHtmlBody, setLastHtmlBody] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [pendingAiItems, setPendingAiItems] = useState<any[] | null>(null);
  const [categoryTemplate, setCategoryTemplate] = useState<any | null>(null);
  const [templateBannerDismissed, setTemplateBannerDismissed] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);


  // Load category template
  useEffect(() => {
    if (!lead?.category || !companySlug) return;
    fetch(`/api/company/${companySlug}/quote-templates`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const match = (data.templates || []).find((t: any) => t.category === lead.category);
          setCategoryTemplate(match || null);
        }
      })
      .catch(() => {});
  }, [lead?.category, companySlug]);

  // Sync with lead data
  useEffect(() => {
    setQuoteData(lead?.quote_data || []);
    setTemplateBannerDismissed(false);
  }, [lead?.quote_data]);

  const fetchOutbox = async () => {
  if (!lead?.id || !companySlug) return;
  try {
    const res = await fetch(`/api/company/${companySlug}/outbox-preview?lead_id=${lead.id}&type=quote`);
    const data = await res.json();
    if (data.entries) {
      setOutboxLog(data.entries);
      const latest = data.entries.find((e: any) => e.html_body);
      if (latest) setLastHtmlBody(latest.html_body);
    }
  } catch {}
};

  useEffect(() => { fetchOutbox(); }, [lead?.id, companySlug]);

  const leadPhotos: string[] = useMemo(() => {
    const parse = (val: any): string[] => {
      if (!val) return [];
      const arr = typeof val === 'string' ? JSON.parse(val) : val;
      if (!Array.isArray(arr)) return [];
      return arr.map((f: any) => (typeof f === 'string' ? f : f?.url || f?.path || '')).filter(Boolean);
    };
    return [...parse(lead?.file_urls), ...parse(lead?.before_photos)];
  }, [lead?.file_urls, lead?.before_photos]);

  const handleLoadTemplate = () => {
    const items = categoryTemplate.items.map((item: any, i: number) => ({ ...item, id: Date.now() + i }));
    setQuoteData(items);
    setIsEditing(true);
    setTemplateBannerDismissed(true);
    toast.success('Template loaded — review and save when ready');
  };

  const handleAddItems = (items: any[]) => {
    if (quoteData.length > 0) {
      setPendingAiItems(items);
    } else {
      setQuoteData(items);
      setIsEditing(true);
      setShowAI(false);
    }
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    setQuoteData(
      quoteData.map((item: any) => {
        if (item.id !== id) return item;
        const updated = { ...item };
        if (field === 'description') {
          updated[field] = value;
        } else {
          updated[field] = value === '' ? 0 : parseFloat(value) || 0;
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount =
              parseFloat(String(updated.quantity || 0)) *
              parseFloat(String(updated.unitPrice || 0));
          }
        }
        return updated;
      })
    );
  };

  const handleRemoveRow = (id: number) =>
    setQuoteData(quoteData.filter((item: any) => item.id !== id));

  const handleDoneEditing = () => {
  setQuoteData((prev: any[]) =>
    prev.map((item) => (item.id === editingItem.id ? editingItem : item))
  );
  setEditingItem(null);
};

  const handleSave = async () => {
    if (!hasProject) { toast.error('Convert to project first'); return; }
    const totalAmount = quoteData.reduce((s: number, i: any) => s + i.amount, 0);
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_quote',
          quote_data: quoteData,
          quote_total: totalAmount,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      if (res.ok) {
        toast.success('Quote saved');
        setIsEditing(false);
        await onRefresh();
      }
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);

  return (
    <>
      {/* ── EMAIL PREVIEW MODAL ── */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10"
              style={{ height: '88vh' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Preview</p>
                    <p className="text-sm font-bold text-slate-800">Client Proposal</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden bg-slate-50 p-3" style={{ minHeight: 0 }}>
                <iframe
                  title="Email Preview"
                  srcDoc={`${previewHtml}<style>a,button{pointer-events:none!important;cursor:default!important;}</style>`}
                  className="w-full h-full border-0 rounded-2xl bg-white"
                  sandbox="allow-same-origin"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      >

        {/* HEADER */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-200 shrink-0">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-widest leading-none">Quote Sheet</h3>
              {lead?.quote_accepted_at ? (
                <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-tight mt-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Accepted
                </span>
              ) : lead?.quote_declined_at ? (
                <span className="text-[9px] font-black text-red-500 uppercase tracking-tight mt-0.5">✗ Declined</span>
              ) : (
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">Line item breakdown</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAI(v => !v)}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
                showAI
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                  : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI
              {leadPhotos.length > 0 && !showAI && (
                <span className="bg-violet-200 text-violet-700 px-1.5 rounded-full text-[9px]">
                  {leadPhotos.length}📷
                </span>
              )}
            </motion.button>

        {/* edit pencil only — save/cancel live in sticky bar */}
{!isEditing && (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={() => setIsEditing(true)}
    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-indigo-600 transition-colors"
  >
    <Edit2 className="w-4 h-4" />
  </motion.button>
)}
          </div>
        </div>

        {/* TEMPLATE BANNER */}
        <AnimatePresence>
          {categoryTemplate && quoteData.length === 0 && !templateBannerDismissed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-4 mt-3 flex items-center justify-between gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs font-black text-indigo-800 truncate">Template: {categoryTemplate.name}</p>
                  <p className="text-[10px] text-indigo-500">
                    {categoryTemplate.items?.length || 0} pre-filled items for {lead.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLoadTemplate}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg hover:bg-indigo-700 transition uppercase tracking-wider"
                  >
                    Load
                  </motion.button>
                  <button
                    onClick={() => setTemplateBannerDismissed(true)}
                    className="w-6 h-6 flex items-center justify-center text-indigo-400 hover:text-indigo-600 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

    {/* QUOTE TABLE — desktop / CARDS — mobile */}

{/* ── DESKTOP TABLE ── */}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full border-collapse text-sm">
    <thead>
      <tr className="border-b border-gray-100">
        <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Line item</th>
        <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 w-28">Unit price</th>
        <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 w-16">Qty</th>
        <th className="text-right px-5 py-3 text-xs font-medium text-gray-400 w-28">Amount</th>
        {isEditing && <th className="w-9" />}
      </tr>
    </thead>
    <tbody>
     {quoteData.length === 0 ? (
  <tr>
    <td colSpan={isEditing ? 5 : 4}>
      <button
        onClick={() => { setIsEditing(true); setQuoteData([{ id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 }]); }}
        className="w-full py-16 flex flex-col items-center justify-center gap-3 group"
      >
        <div className="w-12 h-12 rounded-full bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center transition-all shadow-lg shadow-indigo-200 group-hover:scale-110">
          <Plus className="w-5 h-5 text-white stroke-[3px]" />
        </div>
        <span className="text-xs font-bold text-indigo-500 group-hover:text-indigo-600 transition-colors">Add line item</span>
      </button>
    </td>
  </tr>
      ) : (
        <>
          {quoteData.map((item: any) => (
            <tr
              key={item.id}
className={`border-b transition-colors group ${
  isEditing
    ? 'border-gray-100 bg-slate-50/40 hover:bg-slate-50'
    : 'border-gray-50 hover:bg-gray-50/60'
}`}            >
              <td className="px-5 py-2.5">
               <input
  type="text"
  disabled={!isEditing}
  value={item.description}
  onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
  placeholder="Item description…"
  className={`w-full outline-none text-sm font-medium text-gray-900 placeholder-gray-300 disabled:cursor-default rounded-lg transition-all ${
    isEditing
      ? 'bg-white border border-slate-200 px-3 py-1.5 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
      : 'bg-transparent'
  }`}
/>
              </td>
             <td className="px-5 py-2.5">
  {isEditing ? (
    <input
  type="number"
  value={item.unitPrice || ''}
  onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
  className={`w-full outline-none text-sm text-right text-gray-900 rounded-lg transition-all border border-slate-200 bg-white px-2 py-1.5 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${noSpinners}`}
/>
  ) : (
    <div className="flex items-center justify-end gap-0.5">
      <span className="text-xs text-gray-400">$</span>
      <span className="text-sm font-medium text-gray-900">
        {(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  )}
</td>
              <td className="px-5 py-2.5">
               <input
  type="number"
  disabled={!isEditing}
  value={item.quantity || ''}
  onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
  className={`w-full outline-none text-sm text-right text-gray-900 disabled:cursor-default rounded-lg transition-all ${noSpinners} ${
    isEditing
      ? 'bg-white border border-slate-200 px-2 py-1.5 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
      : 'bg-transparent'
  }`}
/>
              </td>
              <td className="px-5 py-2.5 text-right text-sm font-medium text-gray-900">
                ${(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              {isEditing && (
                <td className="pr-3 py-2.5">
                  <button
                    onClick={() => handleRemoveRow(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
          {isEditing && (
  <tr>
    <td colSpan={5} className="px-5 py-3 border-t border-dashed border-gray-200">
      <button
        onClick={() => setQuoteData([...quoteData, { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 }])}
        className="flex items-center gap-2 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
      >
        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
          <Plus className="w-3 h-3" />
        </div>
        Add line item
      </button>
    </td>
  </tr>
)}
        </>
      )}
    </tbody>
  </table>
</div>

{/* ── MOBILE CARDS ── */}
<div className="md:hidden">
 {quoteData.length === 0 ? (
  <button
    onClick={() => { setIsEditing(true); setQuoteData([{ id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 }]); }}
    className="w-full py-16 flex flex-col items-center justify-center gap-3 group"
  >
    <div className="w-12 h-12 rounded-full bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center transition-all shadow-lg shadow-indigo-200 group-hover:scale-110">
      <Plus className="w-5 h-5 text-white stroke-[3px]" />
    </div>
    <span className="text-xs font-bold text-indigo-500 group-hover:text-indigo-600 transition-colors">Add line item</span>
  </button>
  ) : (
    <div className="p-3 flex flex-col gap-2">
      {quoteData.map((item: any) => (
        <div
          key={item.id}
          onClick={() => isEditing && setEditingItem(item)}
          className={`bg-white border border-gray-200 rounded-2xl p-4 transition-all ${
            isEditing ? 'cursor-pointer active:scale-[0.98] active:bg-gray-50' : ''
          }`}
        >
          {/* Title */}
          <p className="text-sm font-semibold text-gray-900 mb-3">
            {item.description || <span className="text-gray-300 font-normal">No description</span>}
          </p>
          {/* Fields row */}
          <div className="flex items-center gap-3">
            {/* Amount */}
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Amount</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-bold text-gray-500">$</span>
                <span className="text-lg font-bold text-gray-900">
                  {(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            {/* Divider */}
            <div className="w-px h-8 bg-gray-100" />
            {/* Unit price */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Unit price</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-xs font-bold text-gray-400">$</span>
                <span className="text-sm font-semibold text-gray-700">
                  {(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            {/* Divider */}
            <div className="w-px h-8 bg-gray-100" />
            {/* Qty */}
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-0.5">Qty</p>
              <span className="text-sm font-semibold text-gray-700">{item.quantity}</span>
            </div>
            {/* Delete — only in edit mode */}
            {isEditing && (
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveRow(item.id); }}
                className="ml-auto p-2 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Add card */}
      {isEditing && (
        <button
  onClick={() => {
    setIsEditing(true);
    const newItem = { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 };
    setQuoteData([...quoteData, newItem]);
    setEditingItem(newItem);
  }}
  className="w-full border-2 border-dashed border-indigo-200 rounded-2xl py-4 flex items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group"
>
          <div className="w-5 h-5 rounded-full border border-gray-300 group-hover:border-indigo-400 flex items-center justify-center transition-colors">
            <Plus className="w-3 h-3 text-gray-400 group-hover:text-indigo-500" />
          </div>
          <span className="text-xs font-semibold text-gray-400 group-hover:text-indigo-500 transition-colors">Add line item</span>
        </button>
      )}
    </div>
  )}
</div>

{/* ── BOTTOM SHEET EDITOR ── */}
<AnimatePresence>
  {editingItem && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setEditingItem(null)}
        className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm md:hidden"
      />
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-[500] bg-white rounded-t-3xl md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-gray-900">Edit item</p>
          <div className="flex items-center gap-2">
            <button
  onClick={() => {
    if (!editingItem.description && !editingItem.unitPrice) {
      handleRemoveRow(editingItem.id);
    }
    setEditingItem(null);
  }}
  className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
>
  Cancel
</button>
            <button
  onClick={handleDoneEditing}
  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl transition-colors hover:bg-indigo-700"
>
  Done
</button>
          </div>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Description</label>
            <input
              type="text"
              value={editingItem.description}
              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
              placeholder="Item name or description…"
              autoFocus
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-300 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="flex gap-3">
            {/* Unit price */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Unit price</label>
              <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                <span className="text-sm font-bold text-gray-400">$</span>
                <input
                  type="number"
                  value={editingItem.unitPrice || ''}
                  onChange={(e) => {
                    const unitPrice = parseFloat(e.target.value) || 0;
                    setEditingItem({ ...editingItem, unitPrice, amount: unitPrice * editingItem.quantity });
                  }}
                  placeholder="0.00"
                  className={`flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder-gray-300 ${noSpinners}`}
                />
              </div>
            </div>
            {/* Qty */}
            <div className="w-24">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Qty</label>
              <input
                type="number"
                value={editingItem.quantity || ''}
                onChange={(e) => {
                  const quantity = parseInt(e.target.value) || 0;
                  setEditingItem({ ...editingItem, quantity, amount: editingItem.unitPrice * quantity });
                }}
                placeholder="1"
                className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 text-center outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all ${noSpinners}`}
              />
            </div>
          </div>

          {/* Live amount preview */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
            <span className="text-xs font-bold text-gray-500">Line total</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xs font-bold text-gray-500">$</span>
              <span className="text-base font-bold text-gray-900">
                {((editingItem.unitPrice || 0) * (editingItem.quantity || 0)).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>



{/* Replace the entire total bar + save section with: */}
<div className="sticky bottom-0 z-10 bg-white border-t border-slate-100">
  <div className="px-4 py-3 flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Total</p>
      <motion.p key={total} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
        className="text-xl font-black text-slate-900">
        {fmt(total)}
      </motion.p>
    </div>
<div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
      {isEditing ? (
        <>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => { setQuoteData(lead?.quote_data || []); setIsEditing(false); }}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-500 text-[11px] font-black uppercase tracking-widest transition hover:border-slate-300"
          >
            Cancel
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={handleSave} disabled={saving || quoteData.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white text-[11px] font-black uppercase tracking-widest transition disabled:opacity-40 shadow-lg shadow-slate-200"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Quote
          </motion.button>
        </>
      ) : (
        <>
          <motion.button whileTap={{ scale: 0.97 }}
            onClick={() => setIsEditing(true)}
            className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest transition hover:border-slate-300"
          >
            Edit
          </motion.button>
         <motion.button whileTap={{ scale: 0.97 }}
  onClick={() => setShowEmailModal(true)}
  disabled={!hasProject || quoteData.length === 0}
  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 text-[11px] font-black uppercase tracking-widest transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed"
>
  <Send className="w-3.5 h-3.5" />
  Send Quote
</motion.button>
        </>
      )}
    </div>
  </div>
</div>

{/* LAST SENT BADGE */}
{outboxLog[0] && !isEditing && (
  <div className="mx-4 mb-4 mt-2 flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl">
    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${outboxLog[0].status === 'failed' ? 'bg-red-400' : 'bg-emerald-400'}`} />
    <p className="text-xs text-gray-500 flex-1">
      {outboxLog[0].status === 'failed' ? 'Last send failed' : 'Last sent'}{' '}
      <span className="font-semibold text-gray-700">
        {new Date(outboxLog[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
      {outboxLog[0].sent_by_email && (
        <span className="text-gray-400"> · {outboxLog[0].sent_by_email}</span>
      )}
    </p>
    {outboxLog[0].html_body && (
      <button
        onClick={() => setPreviewHtml(outboxLog[0].html_body)}
        className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-indigo-500 transition-colors shrink-0"
      >
        <Eye className="w-3 h-3" /> View
      </button>
    )}
  </div>
)}

        {/* EMAIL HISTORY */}
{outboxLog.length > 1 && (
          <div className="px-4 pb-4 pt-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Proposal History
            </p>
            <div className="space-y-2">
              {outboxLog.map((entry: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl gap-3 hover:border-indigo-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${entry.status === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-slate-800">
                          {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {entry.sent_by_email && <p className="text-[10px] text-slate-400 truncate">{entry.sent_by_email}</p>}
                      {entry.status === 'failed' && entry.error_message && (
                        <p className="text-[10px] text-rose-500 font-bold truncate">{entry.error_message}</p>
                      )}
                    </div>
                  </div>
                  {entry.html_body && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreviewHtml(entry.html_body)}
                      className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition"
                    >
                      <Eye className="w-3 h-3" /> View
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── AI MODAL ── */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAI(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white w-full sm:max-w-md sm:mx-4 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
              style={{ maxHeight: '90vh' }}
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 leading-tight">AI Quote Draft</p>
                    <p className="text-[10px] text-gray-400">
                      {leadPhotos.length > 0
                        ? `Description + ${leadPhotos.length} photo${leadPhotos.length > 1 ? 's' : ''}`
                        : 'Using job description'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAI(false)}
                  className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
                <AIQuoteGenerator
                  leadDescription={lead?.description || ''}
                  leadCategory={lead?.category || ''}
                  leadInternalNotes={lead?.project_internal_notes || ''}
                  leadPhotos={leadPhotos}
                  onAddItems={handleAddItems}
                  companySlug={companySlug}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PENDING AI ITEMS MODAL ── */}
      <AnimatePresence>
        {pendingAiItems && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                <ArrowRightLeft className="w-8 h-8 text-violet-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Sync AI Items?</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed px-2">
                You already have{' '}
                <span className="font-bold text-gray-800">{quoteData.length} line item{quoteData.length > 1 ? 's' : ''}</span>.
                Add AI items to existing, or replace everything?
              </p>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setQuoteData((prev: any[]) => [...prev, ...pendingAiItems]); setPendingAiItems(null); setIsEditing(true); setShowAI(false); }}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-xl shadow-slate-200"
                >
                  Add to Existing
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setQuoteData(pendingAiItems); setPendingAiItems(null); setIsEditing(true); setShowAI(false); }}
                  className="w-full py-4 bg-white border-2 border-slate-100 text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition"
                >
                  Replace All
                </motion.button>
                <button
                  onClick={() => setPendingAiItems(null)}
                  className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SendEmailModal
  open={showEmailModal}
  onClose={() => setShowEmailModal(false)}
  onSuccess={async () => { await onRefresh(); await fetchOutbox(); }}
  type="quote"
  leadId={lead.id}
  currentUser={currentUser}
  customerName={lead.name}
  customerEmail={lead.email}
  contextLine={quoteData.length > 0 ? fmt(total) : null}
  lastSentAt={outboxLog[0]?.created_at || null}
  lastHtmlBody={lastHtmlBody}
/>

      <style jsx>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </>
  );
}