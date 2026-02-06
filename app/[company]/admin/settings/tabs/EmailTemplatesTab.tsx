'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Copy, RotateCcw, Eye } from 'lucide-react';

export default function EmailTemplatesTab({ company, currentUser }: { company: any; currentUser: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
  const [showPreview, setShowPreview] = useState(false);

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
    setSuccess(`Copied ${variable} to clipboard`);
    setTimeout(() => setSuccess(''), 2000);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Templates</h2>
        <p className="text-slate-600">Customize automated email notifications sent to customers</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg">✓</span>
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Template Selector */}
        <div className="flex gap-2 border-b pb-4">
          <button
            onClick={() => setActiveTemplate('quote')}
            className={`px-4 py-2 font-semibold rounded-lg transition ${
              activeTemplate === 'quote'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Quote Email
          </button>
          <button
            onClick={() => setActiveTemplate('schedule')}
            className={`px-4 py-2 font-semibold rounded-lg transition ${
              activeTemplate === 'schedule'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Schedule Confirmation
          </button>
          <button
            onClick={() => setActiveTemplate('payment')}
            className={`px-4 py-2 font-semibold rounded-lg transition ${
              activeTemplate === 'payment'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Payment Reminder
          </button>
        </div>

        {/* Available Variables */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-bold text-sm text-blue-900 mb-2">Available Variables:</h4>
          <div className="flex flex-wrap gap-2">
            {availableVariables[activeTemplate].map((variable) => (
              <button
                key={variable}
                onClick={() => handleCopyVariable(variable)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-lg text-sm text-blue-700 font-mono hover:bg-blue-100 transition"
                title="Click to copy"
              >
                {variable}
                <Copy className="w-3 h-3" />
              </button>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-2">Click any variable to copy. These will be replaced with actual data when emails are sent.</p>
        </div>

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Line</label>
          <input
            type="text"
            value={templates[activeTemplate].subject}
            onChange={(e) => handleUpdateTemplate(activeTemplate, 'subject', e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="Email subject line"
          />
        </div>

        {/* Email Body */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Body</label>
          <textarea
            value={templates[activeTemplate].body}
            onChange={(e) => handleUpdateTemplate(activeTemplate, 'body', e.target.value)}
            rows={12}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition"
            placeholder="Email body content"
          />
        </div>

        {/* Preview Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="border-t pt-4">
            <h4 className="font-bold text-sm text-slate-700 mb-2">Preview (with sample data):</h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-600">SUBJECT:</span>
                <p className="font-semibold text-slate-900">{preview.subject}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-600">BODY:</span>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 mt-1 font-sans">
                  {preview.body}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Email Templates'}
          </button>
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
