'use client';

import { useState } from 'react';
import { Save, Check, Loader2, CheckCircle2, Mail, Zap, Link } from 'lucide-react';
import StandaloneUpgradeOverlay from '@/components/StandaloneUpgradeOverlay';

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-slate-700">
      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
      <span className="text-[14px] leading-relaxed">{children}</span>
    </div>
  );
}

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
        setError(data?.error || 'Failed to save changes.');
      }
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 1. Hero Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-12 shadow-sm">
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          <div>
            <div className="inline-block bg-indigo-600 text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-md mb-4">
              Reviews
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Seamless feedback collection from your customers</h1>
            <div className="space-y-4">
              <FeatureItem>Automatically dispatch review requests when you mark a job as <strong>Completed</strong>.</FeatureItem>
              <FeatureItem>Collect and manage ratings from your preferred customers.</FeatureItem>
              <FeatureItem>Elevate your business reputation with more Google Reviews.</FeatureItem>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 w-full max-w-[300px] mx-auto transform rotate-2">
              <div className="flex justify-center mb-6"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-10 h-10" alt="Google" /></div>
              <h3 className="text-center font-bold text-md text-slate-900 mb-1">{company.name || 'Your Company'}</h3>
              <p className="text-center text-[11px] text-slate-500 mb-4">4.8 based on 100 reviews</p>
              <div className="border-t pt-4">
                <p className="font-semibold text-[13px] text-slate-900">"Fantastic experience. The team was extremely professional..."</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Middle Setup Section */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full flex items-center gap-3">
          <Link className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste your Google review link here..."
            className="w-full bg-white border border-indigo-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-200"
          />
        </div>
        <label className="flex items-center gap-3 px-4 py-3 bg-white border border-indigo-200 rounded-lg cursor-pointer hover:border-indigo-300 w-full md:w-auto">
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">Auto-send</span>
        </label>
        <button
            onClick={handleSave}
            disabled={saving}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-all"
        >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save'}
        </button>
      </div>

      {/* 3. Details/Workflow Grid */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold text-sm">
                <Mail className="w-4 h-4 text-indigo-600" /> Customer Email Preview
            </div>
            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 text-sm text-slate-700 italic">
                <p className="mb-3">Hi [Customer Name],</p>
                <p className="mb-4">"Thanks for choosing us! Could you spare a moment to leave us a Google review?"</p>
                <div className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-medium text-[13px] px-4 py-2 rounded shadow-sm cursor-default">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" className="w-4 h-4" alt="Google" />
                    Leave a Google review
                </div>
            </div>
            <p className="text-[11px] text-indigo-600 font-medium mt-3">Pro Tip: Customise this template in Email Settings.</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 text-slate-900 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Trigger: Mark Job Complete
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-[200px] md:h-[300px]">
              <img 
                src="/images/mark-job-complete.png" 
                alt="Mark job as complete" 
                className="w-full h-full object-cover object-top" 
              />
            </div>
        </div>
      </div>
    </div>
  );

  return locked ? (
    <div className="relative">
      <div className="blur-[3px] pointer-events-none select-none opacity-60">{content}</div>
      <div className="absolute inset-0 flex items-center justify-center px-4">
        <StandaloneUpgradeOverlay feature="google_reviews" companySlug={company.slug} requiredPlan="basic" />
      </div>
    </div>
  ) : content;
}