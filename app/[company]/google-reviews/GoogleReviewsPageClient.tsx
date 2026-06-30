'use client';

import { useState } from 'react';
import { Save, Check, Loader2, Star } from 'lucide-react';
import StandalonePageShell from '@/components/StandalonePageShell';
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

export default function GoogleReviewsPageClient({ company, locked }: { company: any; locked?: boolean }) {
  const [url, setUrl] = useState(company.google_review_url || '');
  const [enabled, setEnabled] = useState(company.google_review_enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-google-reviews',
          data: { google_review_url: url, google_review_enabled: enabled }
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // keep it simple, no error UI for now
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <GoogleG size={20} />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-slate-900">Collect Google reviews</h2>
          <p className="text-[12.5px] text-slate-500">
            Automatically ask happy customers to leave you a review when a job is marked complete.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
            Your Google review link
          </label>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onBlur={() => {
              const val = url.trim();
              if (val && !val.startsWith('http')) setUrl(`https://${val}`);
            }}
            placeholder="https://g.page/r/your-review-link"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:ring-2 ring-blue-100 transition placeholder:text-slate-400 placeholder:font-normal"
          />
          <p className="text-[11.5px] text-slate-400 mt-1.5">
            Don't have one? Find it in your Google Business Profile under "Get more reviews."
          </p>
        </div>

        <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
          <input
            type="checkbox"
            checked={enabled}
            onChange={e => setEnabled(e.target.checked)}
            className="w-4 h-4 accent-blue-600"
          />
          <div>
            <span className="text-sm font-medium text-slate-700 block">Auto-send when job is marked completed</span>
            <span className="text-[11.5px] text-slate-400">
              Customers get a one-click email asking for a review right after the work's done.
            </span>
          </div>
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
        </button>
      </div>
    </>
  );

  return (
    <StandalonePageShell companySlug={company.slug} title="Google Reviews">
      {locked ? (
        <div className="relative">
          <div className="blur-[3px] pointer-events-none select-none opacity-60" aria-hidden>
            {content}
          </div>
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <StandaloneUpgradeOverlay feature="google_reviews" companySlug={company.slug} requiredPlan="basic" />
          </div>
        </div>
      ) : content}
    </StandalonePageShell>
  );
}