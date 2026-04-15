'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Mail, Clock, DollarSign, Calendar } from 'lucide-react';

type EmailType = 'schedule' | 'quote' | 'payment';

type Props = {
  type: EmailType;
  customerName: string;
  customerEmail?: string;
  amount?: string;
  date?: string;
  onDismiss: () => void;
};

const CONFIGS = {
  schedule: {
    subject: (name: string, date?: string) => `Your appointment is confirmed${date ? ` for ${date}` : ''}`,
    preview: (name: string, date?: string) =>
      `Hi ${name.split(' ')[0]}, your appointment has been confirmed. We'll see you ${date ? `on ${date}` : 'soon'}. Please reply if you need to reschedule.`,
    badge: { label: 'Schedule Confirmed', color: '#3b82f6', bg: '#eff6ff' },
    icon: Calendar,
    cta: 'View Appointment',
    ctaColor: '#3b82f6',
  },
  quote: {
    subject: (name: string) => `Your quote is ready to review`,
    preview: (name: string, amount?: string) =>
      `Hi ${name.split(' ')[0]}, your quote${amount ? ` for ${amount}` : ''} is ready. Please review and let us know if you'd like to move forward.`,
    badge: { label: 'Quote Sent', color: '#8b5cf6', bg: '#f5f3ff' },
    icon: DollarSign,
    cta: 'Accept Quote',
    ctaColor: '#8b5cf6',
    cta2: 'Decline',
  },
  payment: {
    subject: (name: string, amount?: string) => `Payment reminder${amount ? ` — ${amount} due` : ''}`,
    preview: (name: string, amount?: string) =>
      `Hi ${name.split(' ')[0]}, this is a friendly reminder that your balance${amount ? ` of ${amount}` : ''} is due. Please reach out if you have any questions.`,
    badge: { label: 'Reminder Sent', color: '#f59e0b', bg: '#fffbeb' },
    icon: Clock,
    cta: 'View Invoice',
    ctaColor: '#f59e0b',
  },
};

export default function SentEmailPreview({ type, customerName, customerEmail, amount, date, onDismiss }: Props) {
  const config = CONFIGS[type];
  const Icon = config.icon;
  const firstName = customerName.split(' ')[0];

  return (
   <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden" />
        {/* Sent confirmation bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <p className="text-xs font-black text-emerald-800">
              Sent to {customerEmail || `${customerName.toLowerCase().replace(' ', '.')}@gmail.com`}
            </p>
          </div>
          <button onClick={onDismiss} className="p-1 rounded-lg hover:bg-emerald-100 transition text-emerald-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Email mockup */}
        <div className="bg-white p-4">
          {/* Email header */}
          <div className="flex items-start gap-3 mb-3 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0">
              T
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-black text-slate-900">Torres Contracting</p>
                <p className="text-[10px] text-slate-400 shrink-0">Just now</p>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {config.subject(customerName, type === 'schedule' ? date : undefined)}
              </p>
            </div>
          </div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ background: config.badge.bg, color: config.badge.color }}
          >
            <Icon className="w-3 h-3" />
            {config.badge.label}
          </div>

          {/* Body */}
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            {config.preview(customerName, type === 'payment' ? amount : type === 'quote' ? amount : undefined)}
          </p>

          {/* Amount if present */}
          {amount && type === 'quote' && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl mb-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-600">Quote Total</p>
              <p className="text-base font-black text-slate-900">{amount}</p>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-2">
            <button
              className="flex-1 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest transition"
              style={{ background: config.ctaColor }}
            >
              {config.cta}
            </button>
            {(config as any).cta2 && (
              <button className="px-4 py-2.5 rounded-xl border-2 border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest transition hover:border-slate-300">
                {(config as any).cta2}
              </button>
            )}
          </div>

          {/* Footer */}
          <p className="text-[10px] text-slate-400 text-center mt-3">
            Powered by Lead2Project · Sent from Torres Contracting
          </p>
        </div>

        {/* Demo note */}
        <div className="px-4 py-2.5 bg-indigo-50 border-t border-indigo-100">
          <p className="text-[11px] font-bold text-indigo-600 text-center">
            In your real account {firstName} receives this branded email instantly
          </p>
        </div>
    </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}