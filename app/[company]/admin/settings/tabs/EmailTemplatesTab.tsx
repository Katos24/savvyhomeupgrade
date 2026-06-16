'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Copy, RotateCcw, Eye, Check, Sparkles,
  Save, AlertCircle, Calendar, CreditCard, FileText,
  Receipt, MessageSquare, Star, X, ChevronRight,
} from 'lucide-react';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';

type TemplateKey = 'quote' | 'schedule' | 'payment' | 'invoice' | 'lead_confirmation' | 'job_completion';

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  return phone;
};

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
  quote:             ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{quote_total}}', '{{project_description}}'],
  schedule:          ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{scheduled_date}}', '{{scheduled_time}}', '{{customer_address}}'],
  payment:           ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{payment_amount}}', '{{due_date}}'],
  invoice:           ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{invoice_number}}', '{{invoice_total}}', '{{due_date}}'],
  lead_confirmation: ['{{company_name}}', '{{company_phone}}', '{{customer_name}}'],
  job_completion:    ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{google_review_link}}'],
};

const templateConfig: Record<TemplateKey, { icon: React.ReactNode; label: string; description: string; color: string; bg: string }> = {
  lead_confirmation: { icon: <MessageSquare className="w-5 h-5" />, label: 'Lead Confirmation', description: 'Auto-reply when a customer submits your booking form', color: 'text-pink-600',    bg: 'bg-pink-50'    },
  schedule:          { icon: <Calendar className="w-5 h-5" />,      label: 'Schedule',          description: 'Sent when you confirm a job appointment',            color: 'text-blue-600',    bg: 'bg-blue-50'    },
  quote:             { icon: <FileText className="w-5 h-5" />,      label: 'Quote',             description: 'Sent when you send a quote to a customer',           color: 'text-emerald-600', bg: 'bg-emerald-50' },
  invoice:           { icon: <Receipt className="w-5 h-5" />,       label: 'Invoice',           description: 'Sent when you email an invoice to a customer',       color: 'text-purple-600',  bg: 'bg-purple-50'  },
  payment:           { icon: <CreditCard className="w-5 h-5" />,    label: 'Payment Reminder',  description: 'Sent to remind customers about outstanding balance',  color: 'text-amber-600',   bg: 'bg-amber-50'   },
  job_completion:    { icon: <Star className="w-5 h-5" />,          label: 'Job Completion',    description: 'Sent when a job is marked as completed',             color: 'text-orange-600',  bg: 'bg-orange-50'  },
};

export default function EmailTemplatesTab({ company, currentUser }: { company: any; currentUser: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copiedVar, setCopiedVar] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey | null>(null);
  const [templates, setTemplates] = useState<Record<TemplateKey, { subject: string; body: string }>>(
    (() => {
  let saved = {};
  try {
    saved = typeof company.email_templates === 'string'
      ? JSON.parse(company.email_templates)
      : (company.email_templates || {});
  } catch { saved = {}; }
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
    setTemplates(prev => ({ ...prev, [activeTemplate]: { ...prev[activeTemplate], [field]: value } }));
  };

  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(''), 2000);
  };

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-email-templates', data: { email_templates: templates } }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Templates saved!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (!activeTemplate) return;
    if (confirm('Reset this template to default?')) {
      setTemplates(prev => ({ ...prev, [activeTemplate]: defaultTemplates[activeTemplate] }));
    }
  };

  const getPreview = () => {
    if (!activeTemplate) return { subject: '', body: '' };
    const template = templates[activeTemplate];
    const replacements: Record<string, string> = {
      '{{company_name}}': company.name,
      '{{company_phone}}': formatPhone(company.phone || '5551234567'),
      '{{customer_name}}': 'John Smith',
      '{{customer_address}}': '123 Main St, Anytown, USA',
      '{{quote_total}}': '$2,500.00',
      '{{project_description}}': 'Kitchen renovation',
      '{{scheduled_date}}': 'March 15, 2026',
      '{{scheduled_time}}': '10:00 AM',
      '{{payment_amount}}': '$1,250.00',
      '{{due_date}}': 'March 30, 2026',
      '{{invoice_number}}': 'INV-001',
      '{{invoice_total}}': '$2,500.00',
'{{google_review_link}}': '[GOOGLE_REVIEW_BUTTON]',
    };
    let subject = template.subject;
    let body = template.body;
    Object.entries(replacements).forEach(([k, v]) => {
      const re = new RegExp(k.replace(/[{}]/g, '\\$&'), 'g');
      subject = subject.replace(re, v);
      body = body.replace(re, v);
    });
    return { subject, body };
  };

  const preview = getPreview();

  return (
    <div className="pb-8">
      {(company.plan_tier === 'free' || company.plan_tier === 'basic') && (
        <SettingsUpgradeBanner
          planLabel="Pro"
          price="$79.99/mo"
          message="Customize your email templates — upgrade to Pro to send them."
          companySlug={company.slug}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Email templates</h2>
        <p className="text-sm text-gray-500 mt-1">Customize every email your customers receive — all branded to you.</p>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2">
            <Check className="w-4 h-4" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TILES GRID ── */}
      {!activeTemplate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(templateConfig) as TemplateKey[]).map(key => {
            const config = templateConfig[key];
            const customized = isCustomized(key);
            return (
              <motion.button
                key={key}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTemplate(key)}
                className="text-left p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {customized && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
                        Customized
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </div>
                <p className="text-sm font-black text-gray-900 mb-1">{config.label}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{config.description}</p>
                <p className="text-[10px] text-gray-300 mt-3 truncate font-mono">
                  {templates[key].subject}
                </p>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* ── EDITOR ── */}
      <AnimatePresence>
        {activeTemplate && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            {/* Back button */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveTemplate(null)}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X className="w-4 h-4" /> Back to templates
              </button>
              <span className="text-gray-300">/</span>
              <div className={`flex items-center gap-2 ${templateConfig[activeTemplate].color}`}>
                {templateConfig[activeTemplate].icon}
                <span className="text-sm font-bold text-gray-900">{templateConfig[activeTemplate].label}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT — editor */}
              <div className="space-y-4">
                {/* Variables */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <p className="text-xs font-bold text-white">Available variables</p>
                    <p className="text-[10px] text-slate-500 ml-auto">Click to copy</p>
                  </div>
                  <div className="px-4 py-3 flex flex-wrap gap-1.5">
                    {availableVariables[activeTemplate].map(variable => (
                      <button
                        key={variable}
                        onClick={() => handleCopyVariable(variable)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all border ${
                          copiedVar === variable
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400'
                        }`}
                      >
                        {variable}
                        {copiedVar === variable ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor */}
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-xs font-bold text-gray-700">Edit template</p>
                    </div>
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-[11px] font-bold transition"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Subject line</label>
                      <input
                        type="text"
                        value={templates[activeTemplate].subject}
                        onChange={e => handleUpdateTemplate('subject', e.target.value)}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email body</label>
                      <textarea
                        value={templates[activeTemplate].body}
                        onChange={e => handleUpdateTemplate('body', e.target.value)}
                        rows={12}
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none leading-relaxed"
                      />
                   </div>
                  </div>
                <div className="px-4 pb-4">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-full py-3 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2"
                    >
                      {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {loading ? 'Saving...' : 'Save template'}
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT — preview */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-xs font-bold text-gray-700">Live preview</p>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Sample data</span>
                  </div>
                  <div className="p-4">
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <div
                        className="px-5 py-6 text-center"
                        style={{ background: `linear-gradient(135deg, ${company.email_brand_color_1 || '#2563eb'}, ${company.email_brand_color_2 || '#1d4ed8'})` }}
                      >
                        {company.logo_url && (
                          <img src={company.logo_url} alt={company.name} className="h-10 w-auto object-contain mx-auto mb-3" />
                        )}
                        <p className="text-white font-black text-base">{company.name}</p>
                      </div>
                      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 w-10 shrink-0">From</span>
                          <span className="text-xs font-bold text-gray-700">{company.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-400 w-10 shrink-0">To</span>
                          <span className="text-xs text-gray-500">john.smith@email.com</span>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 mb-1">Subject</p>
                        <p className="text-sm font-bold text-gray-900 leading-snug">{preview.subject}</p>
                      </div>
                      <div className="px-4 py-4 bg-white space-y-3">
                     
                        {activeTemplate === 'invoice' && (
                          <>
                            <div className="text-center space-y-2">
                              <div
                                className="inline-block px-4 py-2 rounded-lg text-white text-xs font-black w-full"
                                style={{ backgroundColor: company.email_brand_color_1 || '#667eea' }}
                              >
                                Pay with Venmo — $2,500.00
                              </div>
                              <div className="inline-block px-4 py-2 rounded-lg text-white text-xs font-black bg-gray-900 w-full">
                                Download Invoice PDF
                              </div>
                              <p className="text-[10px] text-gray-400">INV-001 · $2,500.00</p>
                            </div>
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                              <p className="text-xs font-bold text-amber-800">Payment Due: March 30, 2026</p>
                            </div>
                          </>
                        )}
{preview.body.split('[GOOGLE_REVIEW_BUTTON]').map((part, i, arr) => (
                          <span key={i}>
                            <span className="whitespace-pre-wrap text-xs text-gray-600 font-sans leading-relaxed">{part}</span>
                            {i < arr.length - 1 && (
                              <div style={{ margin: '12px 0' }}>
                                <span style={{ display: 'inline-block', backgroundColor: '#ffffff', color: '#1a1a1a', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, fontSize: '13px', border: '2px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                  <img src="https://www.google.com/favicon.ico" alt="G" style={{ width: '14px', height: '14px', verticalAlign: 'middle', marginRight: '8px' }} />
                                  <span style={{ verticalAlign: 'middle' }}>Leave us a Google Review</span>
                                </span>
                              </div>
                            )}
                          </span>
                        ))}
                                              </div>
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400">Powered by Lead2Project</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-300 text-center mt-3 font-medium">
                      Variables replaced with real customer data on send
                    </p>
                    {activeTemplate === 'quote' && (
                      <div className="flex items-start gap-2 mt-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-600 leading-relaxed">
                          Quote line items are automatically included in the email. Use <span className="font-mono font-bold">{'{{line_items}}'}</span> to control where they appear, or leave it out to show them below your message.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}