'use client';

import { useState } from 'react';
import { Check, Copy, Link2, ArrowRight, Sparkles, ChevronRight, FileText, DollarSign, BarChart2, Mail, Users, Bell } from 'lucide-react';

interface Props {
  company: any;
}

export default function DoneStep({ company }: Props) {
  const [copied, setCopied] = useState(false);
  const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/${company.slug}` : `/${company.slug}`;
  const settingsBase = `/${company.slug}/admin/settings`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const settingsItems = [
    { icon: FileText, title: 'Customer Form', desc: 'Toggle fields on/off, add custom questions, preview what customers see', tab: 'form' },
    { icon: DollarSign, title: 'Quote Templates', desc: 'Pre-fill quotes for each job type so you send them in seconds', tab: 'quote-templates' },
    { icon: BarChart2, title: 'Pipeline Stages', desc: 'Add custom stages like "Awaiting Permit" or "Follow Up"', tab: 'pipeline' },
    { icon: Mail, title: 'Email Templates', desc: 'Customize the emails customers get for quotes, scheduling, and payments', tab: 'email-templates' },
    { icon: Users, title: 'Team Members', desc: 'Invite crew or office staff to assign leads and get notified', tab: 'team' },
    { icon: Bell, title: 'Notifications', desc: 'Set up daily digest emails and follow-up reminders', tab: 'notifications' },
  ];

  return (
    <div className="space-y-6">

      {/* Success card */}
      <div className="bg-white border border-gray-200 overflow-hidden rounded-xl text-center">
        <div className="px-6 py-10">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Your account is ready. Share your booking link to start receiving leads. You can fine-tune everything else in Settings whenever you want.
          </p>
        </div>
      </div>

      {/* Booking link card */}
      <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Booking Link</span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-400">Customers use this link to submit leads directly to your dashboard</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono truncate">
              {publicLink}
            </div>
            <button
              onClick={copyLink}
              className={`px-4 py-3 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
                copied
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}>
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
        </div>
      </div>

     {/* Customize in Settings */}
<div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
  <div className="px-5 py-4 border-b border-gray-100">
    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
      Customize Anytime in Settings
    </span>
    <p className="text-xs text-gray-400 mt-1">
      These are all optional — your account works great out of the box.
    </p>
  </div>

  <div className="divide-y divide-gray-50">
    {settingsItems.map((item) => {
      const Icon = item.icon;
      return (
        <a
          key={item.tab}
          href={`${settingsBase}?tab=${item.tab}`}
          className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-indigo-500" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition">
              {item.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
          </div>

          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition shrink-0" />
        </a>
      );
    })}
  </div>
</div>

{/* Go to dashboard button */}
<a
  href={`/${company.slug}/dashboard`}
  className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 transition hover:opacity-90"
  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
>
  Go to Your Dashboard <ArrowRight className="w-5 h-5" />
</a>
</div>
);
}