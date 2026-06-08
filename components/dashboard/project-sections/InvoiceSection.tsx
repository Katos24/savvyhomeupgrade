'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, FileText, Download, Loader2, Send, Lock
} from 'lucide-react';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';
import { can, type PlanTier } from '@/lib/permissions';

type InvoiceSectionProps = {
  lead: any;
  company: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

function generateInvoiceNumber(projectNumber?: number): string {
  const base = projectNumber ? String(projectNumber).padStart(3, '0') : '001';
  return `INV-${base}`;
}

export default function InvoiceSection({
  lead,
  company,
  currentUser,
  onRefresh,
  hasProject,
}: InvoiceSectionProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const planTier = (company?.plan_tier || 'free') as PlanTier;
  const canSendInvoice = can(planTier, 'send_invoice_email');

  // Pull line items from quote_data silently
  const lineItems = (() => {
    try {
      const raw = lead?.invoice_data || lead?.quote_data;
      if (!raw) return [];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      return [];
    }
  })();

  const total = lineItems.reduce((s: number, i: any) => s + (i.amount || 0), 0);

  useEffect(() => {
    setInvoiceNumber(
      lead?.invoice_number || generateInvoiceNumber(lead?.project_number)
    );
    setDueDate(
      lead?.payment_due_date
        ? String(lead.payment_due_date).split('T')[0]
        : ''
    );
    setNotes(lead?.invoice_notes || '');
  }, [lead?.id]);

  const handleSave = async () => {
    if (!hasProject) { toast.error('Convert to project first'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'save_invoice',
          invoice_number: invoiceNumber,
          invoice_data: lineItems,
          invoice_status: 'draft',
           due_date: dueDate || null, 
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Invoice saved');
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to save invoice');
      }
    } catch {
      toast.error('Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (lineItems.length === 0) { toast.error('No line items — save a quote first'); return; }
    setDownloading(true);
    try {
      let address = lead?.address_line_1 || '';
      if (lead?.address_line_2) address += `, ${lead.address_line_2}`;
      if (lead?.city) address += `, ${lead.city}`;
      if (lead?.zip_code) address += ` ${lead.zip_code}`;

      await generateInvoicePDF({
        invoiceNumber,
        invoiceDate: new Date().toLocaleDateString('en-US', {
          month: 'long', day: 'numeric', year: 'numeric',
        }),
        dueDate: dueDate
          ? new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })
          : undefined,
        companyName: company?.name || '',
        companyPhone: company?.phone || undefined,
        companyEmail: company?.email || undefined,
        companyLogoUrl: company?.logo_url || undefined,
        customerName: lead?.name || '',
        customerEmail: lead?.email || undefined,
        customerPhone: lead?.phone || undefined,
        customerAddress: address || undefined,
        lineItems,
        total,
        notes: notes || undefined,
      });
      toast.success('Invoice downloaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleSendInvoice = async () => {
    setSending(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          action: 'send_invoice_to_customer',
          invoice_number: invoiceNumber,
          invoice_data: lineItems,
          due_date: dueDate || null,
          notes: notes || null,
          user_name: currentUser?.name || 'Unknown',
          user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Invoice sent to customer!');
        setShowSendConfirm(false);
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to send invoice');
      }
    } catch {
      toast.error('Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const hasExistingInvoice = !!lead?.invoice_number;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4">

        {/* HEADER */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-none">
                Invoice
              </h3>
              {hasExistingInvoice ? (
                <p className="text-[9px] font-bold text-emerald-600 mt-0.5">
                  {lead.invoice_number} · {lead.invoice_status || 'draft'}
                </p>
              ) : (
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                  {total > 0 ? fmt(total) : 'Not generated yet'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {total > 0 && (
              <span className="text-sm font-black text-slate-900">{fmt(total)}</span>
            )}
            {open ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>

        {/* BODY */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">

                {/* Invoice # and Due Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Invoice #
                    </label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white outline-none focus:border-blue-300 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none focus:border-blue-300 focus:bg-white transition-colors"
                      style={{ fontSize: '13px', WebkitAppearance: 'none' }}
                    />
                  </div>
                </div>

                {/* Line items summary — read only */}
                {lineItems.length > 0 && (
                  <div className="flex items-center justify-between px-3 py-2.5 bg-slate-900 rounded-xl">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {lineItems.length} line item{lineItems.length !== 1 ? 's' : ''} from quote
                    </span>
                    <span className="text-sm font-black text-white">{fmt(total)}</span>
                  </div>
                )}

                {lineItems.length === 0 && (
                  <div className="px-3 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-xs font-bold text-amber-700">
                      No quote saved yet — save a quote first to generate an invoice
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment terms, thank you message..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white outline-none focus:border-blue-300 transition-colors resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving || lineItems.length === 0}
                    className="flex items-center justify-center gap-1.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors disabled:opacity-40"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Save
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={downloading || lineItems.length === 0}
                    className="flex items-center justify-center gap-1.5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors disabled:opacity-40"
                  >
                    {downloading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    PDF
                  </button>

                 {canSendInvoice ? (
    <button
      onClick={() => setShowSendConfirm(true)}
      disabled={lineItems.length === 0 || lead?.payment_status === 'paid'}
      title={lead?.payment_status === 'paid' ? 'Job is already paid in full' : ''}
      className="flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors disabled:opacity-40"
    >
      <Send className="w-3.5 h-3.5" />
      {lead?.payment_status === 'paid' ? 'Paid' : 'Send'}
    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = `/${company?.slug}/admin/settings#billing`}
                      className="flex items-center justify-center gap-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-colors"
                    >
                      <Lock className="w-3 h-3" />
                      Pro
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SEND CONFIRM MODAL */}
      <AnimatePresence>
        {showSendConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !sending && setShowSendConfirm(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl"
            >
              <div className="flex justify-center mb-6 sm:hidden">
                <div className="w-12 h-1.5 rounded-full bg-slate-200" />
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <Send className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Send Invoice?</h3>
                <p className="text-sm text-slate-500 mb-2 leading-relaxed">
                  Send <span className="font-bold text-slate-800">{invoiceNumber}</span> to{' '}
                  <span className="font-bold text-slate-800">{lead?.name}</span>
                </p>
<p className="text-sm font-black text-blue-600 mb-4">{fmt(total)}</p>
{lead?.payment_status === 'partial' && lead?.payment_amount && (
  <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl mb-6 text-left">
    <p className="text-xs font-black text-amber-700">
      Customer has already paid {fmt(parseFloat(lead.payment_amount))}. The invoice will show the full amount of {fmt(total)}.
    </p>
  </div>
)}
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSendInvoice}
                    disabled={sending}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:opacity-60"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Send className="w-3.5 h-3.5" /> Send Now</>
                    )}
                  </motion.button>
                  <button
                    onClick={() => setShowSendConfirm(false)}
                    disabled={sending}
                    className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}