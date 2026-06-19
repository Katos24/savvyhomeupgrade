// Replace the entire "RIGHT — preview" column in EmailTemplatesTab with this component.
// It calls the real server-side render endpoint so the preview matches the actual sent email.

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Eye, RefreshCw } from 'lucide-react';

type TemplateKey = 'quote' | 'schedule' | 'payment' | 'invoice' | 'lead_confirmation' | 'job_completion';

interface Props {
  activeTemplate: TemplateKey;
  subject: string;
  body: string;
  companySlug: string;
}

export default function EmailPreviewPane({ activeTemplate, subject, body, companySlug }: Props) {
  const iframeRef   = useRef<HTMLIFrameElement>(null);
  const [html, setHtml]         = useState<string>('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [renderedSubject, setRenderedSubject] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/company/${companySlug}/email-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateKey: activeTemplate, subject, body }),
      });
      if (!res.ok) throw new Error('Preview failed');
      const data = await res.json();
      setHtml(data.html);
      setRenderedSubject(data.subject);
    } catch {
      setError('Could not render preview');
    } finally {
      setLoading(false);
    }
  }, [activeTemplate, subject, body, companySlug]);

  // Debounce re-render as user types — 600ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPreview();
    }, 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchPreview]);

  // Write HTML into iframe
  useEffect(() => {
    if (!iframeRef.current || !html) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <div className="lg:sticky lg:top-6 lg:self-start">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-xs font-bold text-gray-700">Live preview</p>
          </div>
          <div className="flex items-center gap-2">
            {loading && <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />}
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              Real email layout
            </span>
          </div>
        </div>

        {/* Subject line */}
        {renderedSubject && (
          <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50">
            <p className="text-[10px] font-bold text-gray-400 mb-0.5">Subject</p>
            <p className="text-sm font-bold text-gray-900 leading-snug">{renderedSubject}</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 py-3 text-xs text-red-500 font-medium">{error}</div>
        )}

        {/* iframe — renders the actual email HTML */}
        <div className="relative" style={{ minHeight: 400 }}>
          {loading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            title="Email preview"
            className="w-full border-0"
            style={{ minHeight: 600, display: 'block' }}
            sandbox="allow-same-origin"
          />
        </div>

        <p className="text-[10px] text-gray-300 text-center py-2 font-medium border-t border-gray-50">
          Preview uses sample data — variables replaced with real customer info on send
        </p>
      </div>
    </div>
  );
}