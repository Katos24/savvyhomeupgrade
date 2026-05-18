'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Mail, Copy, RotateCcw, Eye, Check, Sparkles,
  Save, AlertCircle, Calendar, CreditCard, FileText
} from 'lucide-react';
import SettingsUpgradeBanner from '@/components/SettingsUpgradeBanner';


const spring = { type: 'spring' as const, damping: 28, stiffness: 320 };

const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
};


export default function EmailTemplatesTab({ company, currentUser }: { company: any; currentUser: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copiedVar, setCopiedVar] = useState('');

  const defaultTemplates = {
    quote: {
      subject: 'Your Quote from {{company_name}}',
      body: `Hi {{customer_name}},

Thank you for your inquiry! We've prepared a quote for your project.

Quote Total: ${'{{quote_total}}'}

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

Amount Due: ${'{{payment_amount}}'}
Due Date: {{due_date}}

Please contact us if you have any questions.

Best regards,
{{company_name}}
{{company_phone}}`,
    },
  };

  const [templates, setTemplates] = useState(company.email_templates || defaultTemplates);
  const [activeTemplate, setActiveTemplate] = useState<'quote' | 'schedule' | 'payment'>('quote');

  const availableVariables = {
    quote: ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{quote_total}}', '{{project_description}}'],
    schedule: ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{scheduled_date}}', '{{scheduled_time}}', '{{customer_address}}'],
    payment: ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{payment_amount}}', '{{due_date}}'],
  };

  const handleUpdateTemplate = (type: 'quote' | 'schedule' | 'payment', field: 'subject' | 'body', value: string) => {
    setTemplates({ ...templates, [type]: { ...templates[type], [field]: value } });
  };

  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(''), 2000);
  };

  const handleSave = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-email-templates', data: { email_templates: templates } }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Templates saved!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setError(data.error || 'Failed to save email templates');
      }
    } catch {
      setError('Failed to save email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Reset this template to default?')) {
      setTemplates({ ...templates, [activeTemplate]: defaultTemplates[activeTemplate] });
    }
  };

  const getPreviewText = () => {
    const template = templates[activeTemplate];
    let subject = template.subject;
    let body = template.body;
    const replacements: Record<string, string> = {
      '{{company_name}}': company.name,
      '{{company_phone}}': formatPhone(company.phone || '5551234567'),
      '{{customer_name}}': 'John Smith',
      '{{customer_address}}': '123 Main St, Anytown, USA',
      '{{quote_total}}': '2,500',
      '{{project_description}}': 'Kitchen renovation',
      '{{scheduled_date}}': 'March 15, 2024',
      '{{scheduled_time}}': '10:00 AM',
      '{{payment_amount}}': '1,250',
      '{{due_date}}': 'March 30, 2024',
    };
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[{}]/g, '\\$&'), 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });
    return { subject, body };
  };

  const preview = getPreviewText();

  const templateConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    quote:    { icon: <FileText className="w-3.5 h-3.5" />,   label: 'Quote',    color: 'text-emerald-500' },
    schedule: { icon: <Calendar className="w-3.5 h-3.5" />,   label: 'Schedule', color: 'text-blue-500'    },
    payment:  { icon: <CreditCard className="w-3.5 h-3.5" />, label: 'Payment',  color: 'text-amber-500'   },
  };

  return (
    <div className="pb-8">

      {/* Header */}
       {(company.plan_tier === 'free' || company.plan_tier === 'basic') && (
       <SettingsUpgradeBanner
         planLabel="Pro"
         price="$79.99/mo"
         message="customize your email templates now, then upgrade to send quotes, schedules, and payment reminders."
         companySlug={company.slug}
       />
     )}
      <div className="mb-6">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Email templates</h2>
        <p className="text-sm text-black mt-1">Customize what customers receive when you send a quote, schedule, or payment reminder.</p>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" /> {success}
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Template tabs */}
      <div className="flex gap-1.5 mb-5 p-1 bg-gray-100 rounded-xl w-fit">
        {Object.entries(templateConfig).map(([key, config]) => (
          <motion.button
            key={key}
            whileTap={{ scale: 0.96 }}
            onClick={() => setActiveTemplate(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTemplate === key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className={activeTemplate === key ? config.color : 'text-gray-400'}>
              {config.icon}
            </span>
            {config.label}
          </motion.button>
        ))}
      </div>

      {/* Main grid */}
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
              <AnimatePresence mode="popLayout">
                {availableVariables[activeTemplate].map((variable) => (
                  <motion.button
                    key={variable}
                    layout
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyVariable(variable)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition-all border ${
                      copiedVar === variable
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-400'
                    }`}
                  >
                    {variable}
                    {copiedVar === variable
                      ? <Check className="w-2.5 h-2.5" />
                      : <Copy className="w-2.5 h-2.5" />
                    }
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Editor */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-xs font-bold text-gray-700">Edit template</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleResetToDefault}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg text-[11px] font-bold transition"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </motion.button>
            </div>

            <div className="px-4 py-4 space-y-3">
              {/* Subject */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Subject line</label>
                <input
                  type="text"
                  value={templates[activeTemplate].subject}
                  onChange={e => handleUpdateTemplate(activeTemplate, 'subject', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-300"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Email body</label>
                <textarea
                  value={templates[activeTemplate].body}
                  onChange={e => handleUpdateTemplate(activeTemplate, 'body', e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="px-4 pb-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-black disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-sm"
              >
                {loading
                  ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Save className="w-3.5 h-3.5" />
                }
                {loading ? 'Saving...' : 'Save templates'}
              </motion.button>
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

            {/* Email mockup */}
            <div className="p-4">
              <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">

                {/* Branded header */}
                <div
                  className="px-5 py-6 text-center"
                  style={{ background: `linear-gradient(135deg, ${company.email_brand_color_1 || '#2563eb'}, ${company.email_brand_color_2 || '#1d4ed8'})` }}
                >
                  {company.logo_url && (
                    <img src={company.logo_url} alt={company.name} className="h-10 w-auto object-contain mx-auto mb-3" />
                  )}
                  <p className="text-white font-black text-base">{company.name}</p>
                </div>

                {/* Meta */}
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

                {/* Subject */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">Subject</p>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{preview.subject}</p>
                </div>

                {/* Body */}
                <div className="px-4 py-4 bg-white">
                  <pre className="whitespace-pre-wrap text-xs text-gray-600 font-sans leading-relaxed">{preview.body}</pre>
                </div>

                {/* Line items note for quote */}
                {activeTemplate === 'quote' && (
                  <div className="px-4 py-3 border-t border-gray-100 bg-blue-50/50">
                    <p className="text-[12px] font-bold text-blue-500 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      Itemized quote breakdown and accept/decline buttons are automatically included when sent.
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400">Powered by Lead2Project</p>
                </div>
              </div>

              <p className="text-[10px] text-gray-300 text-center mt-3 font-medium">
                Variables replaced with real customer data on send
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}