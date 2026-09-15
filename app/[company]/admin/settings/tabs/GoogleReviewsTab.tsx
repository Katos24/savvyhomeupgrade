'use client';

import { useState } from 'react';
import {
  Save,
  Check,
  Loader2,
  CheckCircle2,
  Mail,
  Link as LinkIcon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import StandaloneUpgradeOverlay from '@/components/StandaloneUpgradeOverlay';

export default function GoogleReviewsTab({
  company,
  locked,
}: {
  company: any;
  locked?: boolean;
}) {
  const [url, setUrl] = useState(company.google_review_url || '');
  const [enabled, setEnabled] = useState(company.google_review_enabled ?? false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const normalizeUrl = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return trimmed;
    if (/^http:\/\//i.test(trimmed)) return trimmed.replace(/^http:\/\//i, 'https://');
    if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
    return trimmed;
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    const normalizedUrl = normalizeUrl(url);
    try {
      const res = await fetch(`/api/company/${company.slug}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-google-reviews',
          data: { google_review_url: normalizedUrl, google_review_enabled: enabled },
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        setUrl(normalizedUrl);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setError(data?.error || 'Failed to save changes.');
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="mx-auto max-w-4xl space-y-4 pb-8 text-slate-900 antialiased">
      {/* 1. UNIFIED SETTINGS CARD */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-stone-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              <Sparkles className="h-3 w-3 text-blue-600" /> Google Reviews
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Automated Review Requests
            </h1>
            <p className="text-xs text-slate-500">
              Automatically prompt customers to leave a Google review when a job is marked completed.
            </p>
          </div>

          <a
            href="https://support.google.com/business/answer/7035772"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline shrink-0"
          >
            Find review link <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Form Controls */}
        <div className="pt-4 space-y-3">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
            <div className="relative flex-1">
              <LinkIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="google-review-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://g.page/r/your-business-id/review"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 font-mono text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3.5 py-2.5 hover:bg-slate-100/80 shrink-0">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-xs font-bold text-slate-900">Auto-send on complete</span>
            </label>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95 disabled:opacity-50 shrink-0"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
            </button>
          </div>

          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
        </div>
      </div>

      {/* 2. UNIFIED WORKFLOW PREVIEW CARD */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          {/* Left: Email Preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Mail className="h-3.5 w-3.5 text-blue-600" /> Client Email Preview
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-3.5 text-xs leading-relaxed text-slate-700">
              <p className="font-medium">Hi [Customer Name],</p>
              <p className="text-slate-600 italic my-1">
                &quot;Thanks for choosing us! Could you spare a quick moment to leave us a Google review?&quot;
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-800 shadow-xs mt-1">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  className="h-3 w-3"
                  alt="Google"
                />
                Leave a Google Review
              </div>
            </div>
          </div>

          {/* Right: Auto Trigger Explanation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Auto-Trigger Flow
            </div>
            <p className="text-xs text-slate-500">
              When a job status changes to <strong className="text-slate-800">Completed</strong> on any job card, the system immediately fires off this review request to your client.
            </p>
            <div className="h-24 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
              <img
                src="/images/mark-job-complete.webp"
                alt="Mark job complete interface"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return locked ? (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[3px] opacity-60">
        {content}
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <StandaloneUpgradeOverlay
          feature="google_reviews"
          companySlug={company.slug}
          requiredPlan="basic"
        />
      </div>
    </div>
  ) : (
    content
  );
}