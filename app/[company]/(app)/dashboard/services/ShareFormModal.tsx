'use client';

// "Share your form" — two clear choices:
//   1. Link + QR code: text it, Google profile, truck, cards.
//   2. Embed: the form shows up on the contractor's own website.

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { X, Link2, Code, Check, Copy, Download, ExternalLink, QrCode } from 'lucide-react';

type Tab = 'link' | 'embed';

function tokens(isDark: boolean) {
  return isDark
    ? {
        panel: 'border-white/10 bg-[#0b0f17] text-slate-100',
        text: 'text-white',
        sub: 'text-slate-300',
        faint: 'text-slate-400',
        border: 'border-white/10',
        soft: 'border-white/10 bg-white/[0.04]',
        code: 'border-white/10 bg-black/30 text-slate-200',
        btn: 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        primary: 'bg-white text-slate-900 hover:bg-slate-100',
        tabOn: 'bg-white text-slate-900',
        tabOff: 'text-slate-300 hover:bg-white/5',
      }
    : {
        panel: 'border-slate-200 bg-white text-slate-900',
        text: 'text-slate-900',
        sub: 'text-slate-600',
        faint: 'text-slate-500',
        border: 'border-slate-200',
        soft: 'border-slate-200 bg-slate-50',
        code: 'border-slate-200 bg-slate-50 text-slate-800',
        btn: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        tabOn: 'bg-slate-900 text-white',
        tabOff: 'text-slate-600 hover:bg-slate-100',
      };
}

export default function ShareFormModal({
  open,
  onClose,
  publicUrl,
  companyName,
  isDark,
  initialTab = 'link',
}: {
  open: boolean;
  onClose: () => void;
  publicUrl: string;
  companyName?: string;
  isDark: boolean;
  initialTab?: Tab;
}) {
  const c = tokens(isDark);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  // Reset to the starting tab each time it opens; Esc closes.
  useEffect(() => {
    if (!open) return;
    setTab(initialTab);
    setCopied(null);
    setCopyFailed(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, initialTab, onClose]);

  // Embed code uses the same site the link points to (works on dev and prod).
  let origin = 'https://lead2project.com';
  try {
    origin = new URL(publicUrl).origin;
  } catch {}
  const embedUrl = `${publicUrl}${publicUrl.includes('?') ? '&' : '?'}embed=1`;
  const embedCode = `<iframe src="${embedUrl}" data-l2p-form
  style="width:100%;border:0;min-height:720px" title="Request a quote"></iframe>
<script src="${origin}/embed.js" async></script>`;

  const copy = async (what: 'link' | 'embed') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? publicUrl : embedCode);
      setCopyFailed(false);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopyFailed(true);
    }
  };

  const downloadQr = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    const safeName = (companyName || 'booking').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    a.download = `${safeName}-qr-code.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-label="Share your booking form"
            className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:max-w-lg sm:rounded-2xl ${c.panel}`}
          >
            {/* Header */}
            <div className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${c.border}`}>
              <div>
                <p className={`text-lg font-semibold ${c.text}`}>Share your form</p>
                <p className={`mt-0.5 text-[13px] ${c.faint}`}>Two ways for customers to reach you. Use one or both.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-transparent transition ${c.btn}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-5 pt-4">
              <div className={`grid grid-cols-2 gap-1 rounded-xl border p-1 ${c.border}`}>
                {([
                  { key: 'link', label: 'Link & QR code', Icon: Link2 },
                  { key: 'embed', label: 'On your website', Icon: Code },
                ] as const).map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    aria-pressed={tab === key}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${tab === key ? c.tabOn : c.tabOff}`}
                  >
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              {tab === 'link' ? (
                <div className="space-y-4">
                  <p className={`text-sm ${c.sub}`}>
                    <strong className={c.text}>Best for:</strong> texting customers, your Google Business Profile, Facebook and Instagram, and anywhere you can paste a link. The QR code goes on your truck, yard signs and business cards.
                  </p>

                  {/* Link */}
                  <div>
                    <p className={`mb-1.5 text-xs font-semibold ${c.faint}`}>Your link</p>
                    <code className={`block truncate rounded-lg border px-3 py-2.5 font-mono text-xs ${c.code}`} title={publicUrl}>
                      {publicUrl}
                    </code>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => copy('link')}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition ${c.primary}`}
                      >
                        {copied === 'link' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied === 'link' ? 'Copied' : 'Copy link'}
                      </button>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${c.btn}`}
                      >
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* QR */}
                  <div className={`flex items-center gap-4 rounded-xl border p-4 ${c.soft}`}>
                    <div className="shrink-0 rounded-lg bg-white p-2">
                      <QRCodeSVG value={publicUrl} size={112} level="M" marginSize={1} />
                    </div>
                    <div className="min-w-0">
                      <p className={`flex items-center gap-1.5 text-sm font-semibold ${c.text}`}>
                        <QrCode className="h-4 w-4" /> QR code
                      </p>
                      <p className={`mt-0.5 text-[13px] ${c.faint}`}>
                        Customers point their phone camera at it and land on your form. Download a large copy for printing.
                      </p>
                      <button
                        type="button"
                        onClick={downloadQr}
                        className={`mt-2.5 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${c.btn}`}
                      >
                        <Download className="h-3.5 w-3.5" /> Download PNG
                      </button>
                    </div>
                    {/* Large, hidden copy used only for the download */}
                    <div className="hidden" aria-hidden="true">
                      <QRCodeCanvas ref={qrCanvasRef} value={publicUrl} size={1024} level="M" marginSize={2} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className={`text-sm ${c.sub}`}>
                    <strong className={c.text}>Best for:</strong> if you have your own website. The form shows up right on your page, so customers request a quote without leaving your site. Requests still land in Leads.
                  </p>

                  <div>
                    <p className={`mb-1.5 text-xs font-semibold ${c.faint}`}>Paste this where you want the form</p>
                    <pre className={`max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg border p-3 font-mono text-[11px] leading-relaxed ${c.code}`}>
                      {embedCode}
                    </pre>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => copy('embed')}
                        className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition ${c.primary}`}
                      >
                        {copied === 'embed' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied === 'embed' ? 'Copied' : 'Copy code'}
                      </button>
                      <a
                        href="/features/lead-capture/embed"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${c.btn}`}
                      >
                        See it <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className={`rounded-xl border p-4 ${c.soft}`}>
                    <p className={`text-sm font-semibold ${c.text}`}>How to add it</p>
                    <ol className={`mt-2 list-decimal space-y-1 pl-4 text-[13px] ${c.sub}`}>
                      <li>In your website builder (Wix, Squarespace, WordPress, GoDaddy…), add an &ldquo;Embed&rdquo; or &ldquo;Custom HTML&rdquo; block.</li>
                      <li>Paste the code and publish.</li>
                      <li>Send yourself a test request from your site.</li>
                    </ol>
                    <p className={`mt-2.5 text-xs ${c.faint}`}>
                      Some website builders only allow custom code on paid plans. If yours doesn&rsquo;t, add a &ldquo;Request a quote&rdquo; button that opens your link instead.
                    </p>
                  </div>
                </div>
              )}

              {copyFailed && (
                <p className="mt-3 text-xs font-medium text-rose-500">Couldn&rsquo;t copy. Press and hold the text to copy it.</p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}