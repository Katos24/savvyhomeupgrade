'use client';

import { useState } from 'react';
import { Save, Check, Loader2, Star, Send, ToggleRight, Building2 } from 'lucide-react';
import StandaloneUpgradeOverlay from '@/components/StandaloneUpgradeOverlay';

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

const features = [
  {
    icon: Star,
    title: 'Auto-request on job completion',
    desc: 'When you mark a job complete, your customer gets a branded email asking for a Google review while the experience is still fresh.',
  },
  {
    icon: Send,
    title: 'One-click, fully branded',
    desc: 'The review request goes out under your name with no manual steps — same as your other one-click emails.',
  },
  {
    icon: ToggleRight,
    title: 'One setting, always on',
    desc: 'Paste your Google review link once and toggle it on. Every completed job triggers the request automatically.',
  },
  {
    icon: Building2,
    title: 'Works with any Google Business Profile',
    desc: 'Just grab your review link from your Google Business Profile and paste it below.',
  },
];

// Bare tab content, same pattern as CategoriesTab / PaymentsTab / FormTab —
// no StandalonePageShell here. GoogleReviewsPageClient wraps this for the
// standalone route; the Home sidebar imports it directly, unwrapped.
export default function GoogleReviewsTab({ company, locked }: { company: any; locked?: boolean }) {
  const [url, setUrl] = useState(company.google_review_url || '');
  const [enabled, setEnabled] = useState(company.google_review_enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-google-reviews',
          data: { google_review_url: url, google_review_enabled: enabled },
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(data?.error || `Save failed (${res.status}). Check that the settings API handles 'update-google-reviews'.`);
      }
    } catch (e) {
      setError('Network error — request never reached the server.');
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-8">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[11px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            <GoogleG size={13} /> Google reviews
          </div>
          <h1 className="text-[22px] font-semibold text-slate-900 leading-snug mb-3">
            Turn completed jobs into 5-star reviews
          </h1>
          <p className="text-[14px] text-slate-700 leading-relaxed">
            When a job wraps up, your customer automatically gets a branded email asking for a Google review.
            No manual follow-up, no chasing — just more reviews from customers who are already happy.
          </p>
        </div>

        <div className="relative flex justify-center items-center min-h-[220px]">
          <div className="absolute left-0 top-2 w-[170px] sm:w-[190px] bg-white border border-slate-200 rounded-xl shadow-md p-3.5 z-10">
            <p className="text-[10px] text-slate-500 mb-1">To: Sarah M.</p>
            <p className="text-[13px] font-semibold text-slate-900 mb-2">Hi Sarah</p>
            <p className="text-[11px] text-slate-700 leading-relaxed mb-3">
              Thanks for choosing us. We'd love to hear how your project went.
            </p>
            <p className="text-[11.5px] font-semibold text-blue-600">Leave a Google review →</p>
          </div>

          <div className="absolute right-0 bottom-0 w-[160px] sm:w-[175px] bg-white border border-slate-200 rounded-xl shadow-md p-3.5 z-20">
            <div className="flex justify-center mb-1.5">
              <GoogleG size={24} />
            </div>
            <div className="flex justify-center gap-0.5 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-center text-[12px] font-semibold text-slate-900">Your Company</p>
            <p className="text-center text-[10px] text-slate-600 mb-2">4.9 · 47 reviews</p>
            <div className="border-t border-slate-200 pt-2">
              <p className="text-[10.5px] font-semibold text-slate-800">Mike T. left a review</p>
              <p className="text-[10px] text-slate-600 italic leading-snug mt-0.5">
                "Incredibly professional. Would hire again."
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 min-w-0">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide mb-1.5 block">
              Google review link
            </label>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              onBlur={() => {
                const val = url.trim();
                if (val && !val.startsWith('http')) setUrl(`https://${val}`);
              }}
              placeholder="https://g.page/r/your-review-link"
              className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 ring-blue-100 transition placeholder:text-slate-500 placeholder:font-normal"
            />
          </div>

          <label className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-lg px-4 py-2.5 cursor-pointer hover:border-slate-300 transition-colors shrink-0">
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              className="w-4 h-4 accent-blue-600 shrink-0"
            />
            <span className="text-sm font-medium text-slate-900 whitespace-nowrap">Auto-send on completion</span>
          </label>
        </div>

        <p className="text-[12px] text-slate-600">
          Find your review link in your Google Business Profile under "Get more reviews." Once saved and toggled on, every completed job triggers the request automatically.
        </p>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
        </button>
        {error && (
          <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-0.5">{title}</p>
              <p className="text-[12.5px] text-slate-700 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (locked) {
    return (
      <div className="relative">
        <div className="blur-[3px] pointer-events-none select-none opacity-60" aria-hidden>
          {content}
        </div>
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <StandaloneUpgradeOverlay feature="google_reviews" companySlug={company.slug} requiredPlan="basic" />
        </div>
      </div>
    );
  }

  return content;
}