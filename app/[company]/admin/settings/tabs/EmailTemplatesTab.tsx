'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Copy,
  RotateCcw,
  Check,
  Sparkles,
  Save,
  AlertCircle,
  Calendar,
  CreditCard,
  FileText,
  Receipt,
  MessageSquare,
  Star,
  X,
  ChevronRight,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';
import EmailPreviewPane from '@/components/dashboard/EmailPreviewPane';

type TemplateKey =
  | 'quote'
  | 'schedule'
  | 'payment'
  | 'invoice'
  | 'lead_confirmation'
  | 'job_completion';

const defaultTemplates = {
  quote: {
    subject: 'Your Quote from {{company_name}}',
    body: `Hi {{customer_name}},

Thank you for your inquiry! We've prepared a quote for your project.

Quote Total: {{quote_total}}

Please review the attached quote and let us know if you have any questions.

Best regards,
{{company_name}}
{{company_phone}}`,
  },
  schedule: {
    subject: 'Appointment Scheduled - {{company_name}}',
    body: `Hi {{customer_name}},

Your appointment has been scheduled!

Date: {{scheduled_date}}
Time: {{scheduled_time}}
Address: {{customer_address}}

We look forward to serving you!

Best regards,
{{company_name}}
{{company_phone}}`,
  },
  payment: {
    subject: 'Payment Reminder - {{company_name}}',
    body: `Hi {{customer_name}},

This is a friendly reminder about your upcoming payment.

Amount Due: {{payment_amount}}
Due Date: {{due_date}}

Please contact us if you have any questions.

Best regards,
{{company_name}}
{{company_phone}}`,
  },
  invoice: {
    subject: 'Invoice {{invoice_number}} from {{company_name}}',
    body: `Hi {{customer_name}},

Please find your invoice attached for recent work completed.

Invoice #: {{invoice_number}}
Total: {{invoice_total}}
Due Date: {{due_date}}

If you have any questions, don't hesitate to reach out.

Best regards,
{{company_name}}
{{company_phone}}`,
  },
  lead_confirmation: {
    subject: 'We received your request - {{company_name}}',
    body: `Hi {{customer_name}},

Thank you for reaching out to {{company_name}}! We've received your request and will be in touch shortly.

We typically respond within 24 hours.

{{request_summary}}

Best regards,
{{company_name}}
{{company_phone}}`,
  },
  job_completion: {
    subject: 'Job Complete - Thank you, {{customer_name}}!',
    body: `Hi {{customer_name}},

We're happy to let you know that your job has been completed!

It was a pleasure working with you. If you're satisfied with our work, we'd love if you left us a review.

{{google_review_link}}

Thank you for choosing {{company_name}}!

Best regards,
{{company_name}}
{{company_phone}}`,
  },
};

const availableVariables: Record<TemplateKey, string[]> = {
  quote: [
    '{{company_name}}',
    '{{company_phone}}',
    '{{customer_name}}',
    '{{quote_total}}',
    '{{project_description}}',
  ],
  schedule: [
    '{{company_name}}',
    '{{company_phone}}',
    '{{customer_name}}',
    '{{scheduled_date}}',
    '{{scheduled_time}}',
    '{{customer_address}}',
  ],
  payment: [
    '{{company_name}}',
    '{{company_phone}}',
    '{{customer_name}}',
    '{{payment_amount}}',
    '{{due_date}}',
  ],
  invoice: [
    '{{company_name}}',
    '{{company_phone}}',
    '{{customer_name}}',
    '{{invoice_number}}',
    '{{invoice_total}}',
    '{{due_date}}',
  ],
  lead_confirmation: [
    '{{company_name}}',
    '{{company_phone}}',
    '{{customer_name}}',
    '{{request_summary}}',
  ],
  job_completion: [
    '{{company_name}}',
    '{{company_phone}}',
    '{{customer_name}}',
    '{{google_review_link}}',
  ],
};

const templateConfig: Record<
  TemplateKey,
  { icon: React.ReactNode; label: string; description: string; color: string; bg: string }
> = {
  lead_confirmation: {
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'Lead Confirmation',
    description: 'Auto-reply sent immediately when a lead submits your form',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  schedule: {
    icon: <Calendar className="h-5 w-5" />,
    label: 'Schedule',
    description: 'Sent when an appointment or job date is confirmed',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  quote: {
    icon: <FileText className="h-5 w-5" />,
    label: 'Quote',
    description: 'Sent when delivering an estimate or quote to a customer',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  invoice: {
    icon: <Receipt className="h-5 w-5" />,
    label: 'Invoice',
    description: 'Sent when delivering an official invoice for payment',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
  },
  payment: {
    icon: <CreditCard className="h-5 w-5" />,
    label: 'Payment Reminder',
    description: 'Sent to remind customers about pending balances or overdue bills',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  job_completion: {
    icon: <Star className="h-5 w-5" />,
    label: 'Job Completion',
    description: 'Sent upon job wrap-up to thank clients and collect reviews',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
};

const springTransition = { type: 'spring' as const, damping: 25, stiffness: 300 };

export default function EmailTemplatesTab({
  company,
  currentUser,
}: {
  company: any;
  currentUser: any;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copiedVar, setCopiedVar] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey | null>(null);
  const [templates, setTemplates] = useState<Record<TemplateKey, { subject: string; body: string }>>(
    (() => {
      let saved = {};
      try {
        saved =
          typeof company.email_templates === 'string'
            ? JSON.parse(company.email_templates)
            : company.email_templates || {};
      } catch {
        saved = {};
      }
      return { ...defaultTemplates, ...saved };
    })()
  );

  const isCustomized = (key: TemplateKey) => {
    const def = defaultTemplates[key];
    const cur = templates[key];
    return cur.subject !== def.subject || cur.body !== def.body;
  };

  const handleUpdateTemplate = (field: 'subject' | 'body', value: string) => {
    if (!activeTemplate) return;
    setTemplates((prev) => ({
      ...prev,
      [activeTemplate]: { ...prev[activeTemplate], [field]: value },
    }));
  };

  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(''), 2000);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-email-templates',
          data: { email_templates: templates },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Template saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save templates');
      }
    } catch {
      setError('Failed to save email templates due to connection issue');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!activeTemplate) return;
    if (confirm('Reset this template back to factory defaults?')) {
      setTemplates((prev) => ({
        ...prev,
        [activeTemplate]: defaultTemplates[activeTemplate],
      }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl pb-12">
      {(company.plan_tier === 'free' || company.plan_tier === 'basic') && (
        <SettingsUpgradeBanner
          planLabel="Pro"
          price="$79.99/mo"
          message="Customize your automated email templates — upgrade to Pro to start sending."
          companySlug={company.slug}
        />
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Email Templates
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Customize every automated email dispatched to customers with your branding.
          </p>
        </div>

        {activeTemplate && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50 sm:text-sm"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {loading ? 'Saving Template...' : 'Save Template'}
          </button>
        )}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 shadow-xs sm:text-sm"
          >
            <Check className="h-4 w-4 shrink-0 text-emerald-600" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-700 shadow-xs sm:text-sm"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GRID OVERVIEW MODE ── */}
      {!activeTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {(Object.keys(templateConfig) as TemplateKey[]).map((key) => {
            const config = templateConfig[key];
            const customized = isCustomized(key);
            return (
              <button
                key={key}
                onClick={() => setActiveTemplate(key)}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-xs transition-all hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bg} ${config.color}`}
                    >
                      {config.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {customized && (
                        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600">
                          Customized
                        </span>
                      )}
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{config.label}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {config.description}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="truncate font-mono text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-500">Subj:</span>{' '}
                    {templates[key].subject}
                  </p>
                </div>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* ── TEMPLATE EDITOR MODE ── */}
      <AnimatePresence mode="wait">
        {activeTemplate && (
          <motion.div
            key={activeTemplate}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={springTransition}
            className="space-y-6"
          >
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
              <button
                onClick={() => setActiveTemplate(null)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> All Templates
              </button>

              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${templateConfig[activeTemplate].bg} ${templateConfig[activeTemplate].color}`}
              >
                {templateConfig[activeTemplate].icon}
                <span>{templateConfig[activeTemplate].label}</span>
              </div>
            </div>

            {/* Split Screen Workspace */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* LEFT — EDITOR */}
              <div className="space-y-5">
                {/* Available Dynamic Tags */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      <p className="text-xs font-bold text-slate-800">
                        Dynamic Variables
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">
                      Click variable to copy
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-4">
                    {availableVariables[activeTemplate].map((variable) => (
                      <button
                        key={variable}
                        type="button"
                        onClick={() => handleCopyVariable(variable)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-medium transition active:scale-95 ${
                          copiedVar === variable
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600'
                        }`}
                      >
                        {variable}
                        {copiedVar === variable ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3 text-slate-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Controls */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-indigo-500" />
                      <p className="text-xs font-bold text-slate-800">Email Content</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      <RotateCcw className="h-3 w-3 text-slate-400" /> Reset Default
                    </button>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Subject Line
                      </label>
                      <input
                        type="text"
                        value={templates[activeTemplate].subject}
                        onChange={(e) => handleUpdateTemplate('subject', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Email Body
                      </label>
                      <textarea
                        value={templates[activeTemplate].body}
                        onChange={(e) => handleUpdateTemplate('body', e.target.value)}
                        rows={12}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 font-mono text-xs leading-relaxed text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/30 p-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {loading ? 'Saving Changes...' : 'Save Template'}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT — PREVIEW PANE */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  <Eye className="h-3.5 w-3.5 text-slate-400" /> Live Preview
                </div>
                <EmailPreviewPane
                  activeTemplate={activeTemplate}
                  subject={templates[activeTemplate].subject}
                  body={templates[activeTemplate].body}
                  companySlug={company.slug}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}