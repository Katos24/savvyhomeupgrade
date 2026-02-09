'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Copy, RotateCcw, Eye, EyeOff, Check, Sparkles, X } from 'lucide-react';

export default function EmailTemplatesTab({ company, currentUser }: { company: any; currentUser: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [copiedVar, setCopiedVar] = useState('');

  // Default templates
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
  
  // Brand colors
  const [brandColor1, setBrandColor1] = useState(company.email_brand_color_1 || '#667eea');
  const [brandColor2, setBrandColor2] = useState(company.email_brand_color_2 || '#764ba2');
  const [logoUrl, setLogoUrl] = useState(company.logo_url || '');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const availableVariables = {
    quote: ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{quote_total}}', '{{project_description}}'],
    schedule: ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{scheduled_date}}', '{{scheduled_time}}', '{{customer_address}}'],
    payment: ['{{company_name}}', '{{company_phone}}', '{{customer_name}}', '{{payment_amount}}', '{{due_date}}'],
  };

  const handleUpdateTemplate = (type: 'quote' | 'schedule' | 'payment', field: 'subject' | 'body', value: string) => {
    setTemplates({
      ...templates,
      [type]: {
        ...templates[type],
        [field]: value,
      },
    });
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
      const response = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-email-templates',
          data: {
            email_templates: templates,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Email templates saved successfully! Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(data.error || 'Failed to save email templates');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset this template to default?')) {
      setTemplates({
        ...templates,
        [activeTemplate]: defaultTemplates[activeTemplate],
      });
    }
  };

  const getPreviewText = () => {
    const template = templates[activeTemplate];
    let subject = template.subject;
    let body = template.body;

    // Replace variables with sample data
    const replacements: Record<string, string> = {
      '{{company_name}}': company.name,
      '{{company_phone}}': company.phone || '(555) 123-4567',
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

  const templateConfig = {
    quote: { icon: '💰', color: 'emerald', label: 'Quote Email' },
    schedule: { icon: '📅', color: 'blue', label: 'Schedule Confirmation' },
    payment: { icon: '💳', color: 'purple', label: 'Payment Reminder' },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Email Templates</h2>
          <p className="text-sm sm:text-base text-slate-600">Customize automated email notifications sent to customers</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg flex-shrink-0">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-700 hidden sm:inline">Live Preview</span>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base animate-in slide-in-from-top-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span className="flex-1">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      {/* Template Selector - Mobile Optimized */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {Object.entries(templateConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveTemplate(key as any)}
            className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2.5 font-semibold rounded-lg transition text-sm sm:text-base ${
              activeTemplate === key
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className="text-lg">{config.icon}</span>
            <span className="whitespace-nowrap">{config.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content - Split Screen on Desktop, Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* LEFT: Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Edit Template
            </h3>
            <button
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-xs sm:text-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {/* Available Variables */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-bold text-xs sm:text-sm text-blue-900 mb-2 sm:mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Available Variables
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableVariables[activeTemplate].map((variable) => (
                <button
                  key={variable}
                  onClick={() => handleCopyVariable(variable)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                    copiedVar === variable
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                  }`}
                  title="Click to copy"
                >
                  {variable}
                  {copiedVar === variable ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-2 sm:mt-3">
              💡 Click to copy. Variables are replaced with actual data when emails are sent.
            </p>
          </div>

          {/* Subject Line */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Subject Line
            </label>
            <input
              type="text"
              value={templates[activeTemplate].subject}
              onChange={(e) => handleUpdateTemplate(activeTemplate, 'subject', e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm sm:text-base"
              placeholder="Email subject line"
            />
          </div>

          {/* Email Body */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Email Body
            </label>
            <textarea
              value={templates[activeTemplate].body}
              onChange={(e) => handleUpdateTemplate(activeTemplate, 'body', e.target.value)}
              rows={10}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs sm:text-sm transition resize-none"
              placeholder="Email body content"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm sm:text-base"
            >
              {loading ? 'Saving...' : 'Save Email Templates'}
            </button>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 lg:sticky lg:top-4 lg:self-start">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-600" />
              Live Preview
            </h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
              Sample Data
            </span>
          </div>

          {/* Email Preview Card */}
          <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg">
            {/* Branded Email Header with Gradient */}
            <div 
              className="px-4 py-6 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${company.email_brand_color_1 || '#667eea'} 0%, ${company.email_brand_color_2 || '#764ba2'} 100%)`
              }}
            >
              {/* Logo */}
              {company.logo_url && (
                <div className="flex justify-center mb-3">
                  <img 
                    src={company.logo_url} 
                    alt={company.name}
                    className="h-12 w-auto object-contain"
                  />
                </div>
              )}
              
              {/* Company Name */}
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                  {company.name}
                </h2>
                {company.phone && (
                  <p className="text-sm text-white/90 mt-1">
                    {company.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Email Metadata */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-600">From:</p>
                  <p className="text-sm font-bold text-slate-900 truncate">{company.name}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-1">To:</p>
                <p className="text-sm text-slate-700">john.smith@email.com</p>
              </div>
            </div>

            {/* Email Subject */}
            <div className="bg-white px-4 py-3 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-600 mb-1">Subject:</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 break-words">
                {preview.subject}
              </p>
            </div>

            {/* Email Body */}
            <div className="bg-white px-4 py-4 min-h-[300px]">
              <pre className="whitespace-pre-wrap text-xs sm:text-sm text-slate-700 font-sans leading-relaxed break-words">
                {preview.body}
              </pre>
            </div>

            {/* Email Footer */}
            <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 text-center">
                This is a preview using sample data
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>💡 Tip:</strong> Changes appear instantly in the preview. Test your template before saving!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}