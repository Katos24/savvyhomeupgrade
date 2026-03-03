'use client';

import { useState } from 'react';
import { Check, Copy, Link2, ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  company: any;
}

export default function DoneStep({ company }: Props) {
  const [copied, setCopied] = useState(false);
  const publicLink = typeof window !== 'undefined' ? `${window.location.origin}/${company.slug}` : `/${company.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            Your account is configured and ready to go. Share your booking link with customers to start receiving leads.
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
            <button onClick={copyLink}
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

      {/* Quick tips */}
      <div className="bg-white border border-gray-200 overflow-hidden rounded-xl">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">What's Next</span>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { emoji: '🔗', title: 'Share your booking link', desc: 'Add it to your website, social media, or email signature' },
            { emoji: '👥', title: 'Invite your team', desc: 'Add team members in Settings → Team to assign leads' },
            { emoji: '⚙️', title: 'Fine-tune in Settings', desc: 'Adjust categories, pipeline, email templates, and more anytime' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4">
              <span className="text-xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{tip.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Go to dashboard button */}
      <a href={`/${company.slug}/dashboard`}
        className="w-full py-4 rounded-xl text-white font-bold text-base flex items-center justify-center gap-3 transition hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        Go to Your Dashboard <ArrowRight className="w-5 h-5" />
      </a>
    </div>
  );
}