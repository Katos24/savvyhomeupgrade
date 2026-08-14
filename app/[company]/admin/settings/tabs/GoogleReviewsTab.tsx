'use client';

import { useState } from 'react';
import {
  Save,
  Check,
  Loader2,
  CheckCircle2,
  Mail,
  Zap,
  Link as LinkIcon,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import StandaloneUpgradeOverlay from '@/components/StandaloneUpgradeOverlay';

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-slate-700">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span className="text-xs font-medium leading-relaxed sm:text-sm">{children}</span>
    </div>
  );
}

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
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* 1. HERO BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8 lg:p-10">
        <div className="grid items-center gap-8 md:grid-cols-12">
          <div className="space-y-5 md:col-span-7">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Google Reviews
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Automate customer feedback & grow your local reputation
            </h1>

            <div className="space-y-3 pt-1">
              <FeatureItem>
                Automatically send review requests the moment a job is marked as{' '}
                <strong className="text-slate-900">Completed</strong>.
              </FeatureItem>
              <FeatureItem>
                Direct happy clients straight to your official Google Business profile.
              </FeatureItem>
              <FeatureItem>
                Build social proof, improve SEO rankings, and win more local quotes.
              </FeatureItem>
            </div>
          </div>

          {/* Phone Showcase Image */}
          <div className="flex justify-center md:col-span-5">
            <div className="relative w-full max-w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-md transition-transform duration-300 hover:scale-[1.02]">
              <img
                src="/images/GoogleReview.png"
                alt="Automated Google Review Requests mockup on phone"
                className="block h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SETUP FORM SECTION */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="mb-4">
          <label
            htmlFor="google-review-url"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Google Review Link
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Need help finding your link?{' '}
            <a
              href="https://support.google.com/business/answer/7035772"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-semibold text-blue-600 hover:underline"
            >
              Google&apos;s guide <ExternalLink className="h-3 w-3" />
            </a>{' '}
            or tap <strong>Share review form</strong> inside your Google Business app.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <LinkIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              id="google-review-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://g.page/r/your-business-id/review"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 font-mono text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 transition hover:bg-slate-100/80 active:scale-[0.99]">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-bold text-slate-900 whitespace-nowrap">
              Auto-send on complete
            </span>
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Link'}
          </button>
        </div>

        {error && (
          <p className="mt-2.5 text-xs font-semibold text-rose-600">{error}</p>
        )}
      </div>

      {/* 3. DETAILS & WORKFLOW GRID */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Preview */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <Mail className="h-4 w-4 text-blue-600" /> Email Preview
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs leading-relaxed text-slate-700">
              <p className="mb-2 font-medium">Hi [Customer Name],</p>
              <p className="mb-4 text-slate-600 italic">
                &quot;Thanks for choosing us! Could you spare a quick moment to leave us a
                Google review? It helps us out immensely.&quot;
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                  className="h-3.5 w-3.5"
                  alt="Google Logo"
                />
                Leave a Google Review
              </div>
            </div>
          </div>

          <p className="mt-4 text-[11px] font-semibold text-blue-600">
            Pro Tip: Customize this email copy anytime under Email Settings.
          </p>
        </div>

        {/* Workflow Trigger Showcase */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Automatic Trigger
            </div>
            <p className="mb-3 text-xs text-slate-500">
              When you or your crew tap <strong>Mark Complete</strong> on any job card,
              the request email is dispatched automatically.
            </p>
          </div>

          <div className="h-[180px] overflow-hidden rounded-xl border border-slate-200 shadow-xs">
            <img
              src="/images/mark-job-complete.webp"
              alt="Mark job as complete interface"
              className="h-full w-full object-cover object-top"
            />
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