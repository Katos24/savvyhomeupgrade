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
  ChevronRight,
  ArrowLeft,
  Eye,
  CheckCircle2,
  Info,
} from 'lucide-react';

import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';
import EmailPreviewPane from '@/components/dashboard/EmailPreviewPane';
import { defaultEmailTemplates as defaultTemplates } from '@/lib/emailTemplateDefaults';

type TemplateKey =
  | 'quote'
  | 'schedule'
  | 'payment'
  | 'invoice'
  | 'lead_confirmation'
  | 'job_completion';

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
    '{{amount_label}}',
    '{{amount_value}}',
    '{{project_total}}',
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
  { icon: React.ReactNode; label: string; description: string }
> = {
  lead_confirmation: {
    icon: <MessageSquare className="h-4 w-4" />,
    label: 'Lead Confirmation',
    description: 'Auto-reply sent immediately when a lead submits your form',
  },
  schedule: {
    icon: <Calendar className="h-4 w-4" />,
    label: 'Schedule',
    description: 'Sent when an appointment or job date is confirmed',
  },
  quote: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Quote',
    description: 'Sent when delivering an estimate or quote to a customer',
  },
  invoice: {
    icon: <Receipt className="h-4 w-4" />,
    label: 'Deposit / Balance / Invoice',
    description:
      'Sent when billing a customer — shows deposit or balance due automatically, whichever applies',
  },
  payment: {
    icon: <CreditCard className="h-4 w-4" />,
    label: 'Payment Reminder',
    description: 'Sent to remind customers about pending balances or overdue bills',
  },
  job_completion: {
    icon: <Star className="h-4 w-4" />,
    label: 'Job Completion',
    description: 'Sent upon job wrap-up to thank clients and collect reviews',
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
  const [showConfirmationInfo, setShowConfirmationInfo] = useState(false);
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

  const stripeActive = !!company?.stripe_connect_onboarded && company?.stripe_payment_status === 'active';

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
    <div className="w-full text-[#1c1917]">
      <div className="w-full space-y-6">
        {(company.plan_tier === 'free' || company.plan_tier === 'basic') && (
          <SettingsUpgradeBanner
            planLabel="Pro"
            price="$79.99/mo"
            message="Customize your automated email templates — upgrade to Pro to start sending."
            companySlug={company.slug}
          />
        )}

        <div className="flex flex-col justify-between gap-4 border-b border-[#e7e2d8] pb-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#1c1917]">Emails</h2>
            <p className="mt-0.5 text-xs font-medium text-[#78716c]">
              Every automated email customers can receive — which ones you can customize, and which you can&apos;t.
            </p>
          </div>

          {activeTemplate && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c1917] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#292524] disabled:opacity-50 sm:text-sm"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          )}
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 shadow-xs sm:text-sm"
            >
              <Check className="h-4 w-4 shrink-0 text-emerald-600" /> {success}
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-700 shadow-xs sm:text-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {!activeTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springTransition}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(templateConfig) as TemplateKey[]).map((key) => {
                const config = templateConfig[key];
                const customized = isCustomized(key);
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTemplate(key)}
                    className="group flex flex-col justify-between rounded-2xl border border-[#e7e2d8] bg-white p-4 text-left transition-colors hover:border-[#d6d3d1]"
                  >
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f1e8] text-[#57534e]">
                          {config.icon}
                        </div>
                        <div className="flex items-center gap-2">
                          {customized ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                              Customized
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f1e8] px-2 py-0.5 text-[10px] font-medium text-[#78716c]">
                              Default
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-[#d6d3d1] transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                      <h3 className="text-sm font-semibold text-[#1c1917]">{config.label}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#78716c]">{config.description}</p>
                    </div>

                    <div className="mt-3 border-t border-[#f0ece1] pt-2.5">
                      <p className="truncate font-mono text-[11px] text-[#a8a29e]">
                        <span className="font-medium text-[#78716c]">Subj:</span> {templates[key].subject}
                      </p>
                    </div>
                  </button>
                );
              })}

              <button
                onClick={() => setShowConfirmationInfo((v) => !v)}
                className="flex flex-col justify-between rounded-2xl border border-dashed border-[#e7e2d8] bg-[#faf9f5] p-4 text-left transition-colors hover:border-[#d6d3d1]"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f5f1e8] text-[#57534e]">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    {stripeActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        Automatic (Stripe)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        Not sent
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-[#1c1917]">Payment Confirmation</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#78716c]">
                    {stripeActive
                      ? "Stripe emails the customer a receipt automatically when they pay by card."
                      : 'Nothing is sent when a payment is recorded manually — no template exists for this yet.'}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 border-t border-[#f0ece1] pt-2.5 text-[11px] font-medium text-[#78716c]">
                  <Info className="h-3 w-3" />
                  {showConfirmationInfo ? 'Hide details' : 'Why isn\u2019t this editable?'}
                </div>
              </button>
            </div>

            <AnimatePresence>
              {showConfirmationInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-2xl border border-[#e7e2d8] bg-white p-4 text-xs leading-relaxed text-[#57534e]">
                    {stripeActive ? (
                      <p>
                        When a customer pays a Stripe checkout link, Stripe emails them its own
                        receipt directly — that email isn&apos;t branded to your business and can&apos;t be
                        edited here, since it&apos;s generated and sent by Stripe, not by this app.
                      </p>
                    ) : (
                      <p>
                        When you record a cash, check, or manual payment, the customer currently
                        receives no confirmation from this app. If they need to know it was
                        received, that&apos;s worth a personal follow-up for now.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

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
              <div className="flex items-center justify-between border-b border-[#e7e2d8] pb-4">
                <button
                  onClick={() => setActiveTemplate(null)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#f5f1e8] px-3 py-1.5 text-xs font-semibold text-[#57534e] transition hover:bg-[#e7e2d8]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> All Emails
                </button>

                <div className="inline-flex items-center gap-2 rounded-full bg-[#f5f1e8] px-3 py-1 text-xs font-semibold text-[#57534e]">
                  {templateConfig[activeTemplate].icon}
                  <span>{templateConfig[activeTemplate].label}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-5">
                  <div className="rounded-2xl border border-[#e7e2d8] bg-white">
                    <div className="flex items-center justify-between border-b border-[#e7e2d8] bg-[#faf9f5] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <p className="text-xs font-semibold text-[#1c1917]">Dynamic Variables</p>
                      </div>
                      <span className="text-[10px] font-medium text-[#a8a29e]">Click to copy</span>
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
                              : 'border-[#e7e2d8] bg-[#faf9f5] text-[#57534e] hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600'
                          }`}
                        >
                          {variable}
                          {copiedVar === variable ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-[#a8a29e]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-[#e7e2d8] bg-white">
                    <div className="flex items-center justify-between border-b border-[#e7e2d8] bg-[#faf9f5] px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-indigo-500" />
                        <p className="text-xs font-semibold text-[#1c1917]">Email Content</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7e2d8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#57534e] transition hover:bg-[#f5f1e8]"
                      >
                        <RotateCcw className="h-3 w-3 text-[#a8a29e]" /> Reset Default
                      </button>
                    </div>

                    <div className="space-y-4 p-4">
                      <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#78716c]">
                          Subject Line
                        </label>
                        <input
                          type="text"
                          value={templates[activeTemplate].subject}
                          onChange={(e) => handleUpdateTemplate('subject', e.target.value)}
                          className="w-full rounded-xl border border-[#e7e2d8] bg-[#faf9f5] px-3.5 py-2.5 text-sm font-medium text-[#1c1917] outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-[#78716c]">
                          Email Body
                        </label>
                        <textarea
                          value={templates[activeTemplate].body}
                          onChange={(e) => handleUpdateTemplate('body', e.target.value)}
                          rows={12}
                          className="w-full rounded-xl border border-[#e7e2d8] bg-[#faf9f5] p-3.5 font-mono text-xs leading-relaxed text-[#292524] outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>
                    </div>

                    <div className="border-t border-[#e7e2d8] bg-[#faf9f5] p-4">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c1917] py-3 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-[#292524] disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {loading ? 'Saving...' : 'Save Template'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wide text-[#78716c]">
                    <Eye className="h-3.5 w-3.5 text-[#a8a29e]" /> Live Preview
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
    </div>
  );
}