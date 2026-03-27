'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Sparkles, Loader2, Plus, Info, CheckCircle2, ImageIcon, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type AIQuoteItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  selected: boolean;
};

type JobStatus = 'idle' | 'starting' | 'pending' | 'processing' | 'complete' | 'failed';

type AIQuoteGeneratorProps = {
  leadDescription:   string;
  leadInternalNotes: string;
  leadCategory:      string;
  leadPhotos?:       string[];
  leadId?:           number;
  companySlug:       string;
  onAddItems:        (items: any[]) => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS  = 1500;   // poll every 1.5s
const MAX_POLL_ATTEMPTS = 60;     // give up after 90s (60 × 1.5s)

const STATUS_MESSAGES: Record<string, string> = {
  starting:   'Starting up...',
  pending:    'Waiting to start...',
  processing: 'Analyzing your project...',
};

// ─── Error message cleaner — strips raw JSON / SDK noise ─────────────────────
function cleanErrorMessage(raw: string): string {
  if (!raw) return 'Something went wrong. Please try again.';

  // If it looks like JSON, try to extract a human-readable message
  if (raw.includes('{') && raw.includes('"message"')) {
    try {
      // Find the first JSON object in the string
      const start = raw.indexOf('{');
      const end   = raw.lastIndexOf('}');
      const match = start !== -1 && end !== -1 ? [raw.slice(start, end + 1)] : null;
      if (match) {
        const parsed = JSON.parse(match[0]);
        const msg =
          parsed?.error?.message ??
          parsed?.error?.error?.message ??
          parsed?.message;
        if (msg && typeof msg === 'string') return msg;
      }
    } catch { /* fall through */ }
  }

  // Map known technical messages to friendly ones
  if (raw.toLowerCase().includes('overload')) {
    return 'Claude is currently overloaded. Please wait a moment and try again.';
  }
  if (raw.toLowerCase().includes('rate limit') || raw.toLowerCase().includes('too many')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (raw.toLowerCase().includes('timeout') || raw.toLowerCase().includes('timed out')) {
    return 'The request timed out. Please try again.';
  }
  if (raw.toLowerCase().includes('network') || raw.toLowerCase().includes('fetch')) {
    return 'Network error. Check your connection and try again.';
  }

  // If it's short and readable, show it; otherwise show a generic message
  if (raw.length < 120 && !raw.startsWith('{')) return raw;
  return 'Quote generation failed. Please add more detail and try again.';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AIQuoteGenerator({
  leadDescription,
  leadInternalNotes,
  leadCategory,
  leadPhotos   = [],
  leadId,
  companySlug,
  onAddItems,
}: AIQuoteGeneratorProps) {
  const [jobStatus,      setJobStatus]      = useState<JobStatus>('idle');
  const [jobId,          setJobId]          = useState<string | null>(null);
  const [suggestedItems, setSuggestedItems] = useState<AIQuoteItem[]>([]);
  const [showSuggestions,setShowSuggestions]= useState(false);
  const [errorMessage,   setErrorMessage]   = useState<string>('');
  const [usedPhotos,     setUsedPhotos]     = useState(0);

  const pollRef       = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef  = useRef(0);

  // ── Derived state ──────────────────────────────────────────────────────────
  const effectiveDescription = leadDescription?.trim() || leadInternalNotes?.trim() || '';
  const validPhotos = leadPhotos.filter(
    u => typeof u === 'string' && u.startsWith('https://')
  );
  const isGenerating = ['starting', 'pending', 'processing'].includes(jobStatus);

  // ── Cleanup polling on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, []);

  // ── Start polling once we have a jobId ────────────────────────────────────
  useEffect(() => {
    if (!jobId || jobStatus === 'complete' || jobStatus === 'failed') return;

    const poll = async () => {
      pollCountRef.current++;

      // Safety: give up after MAX_POLL_ATTEMPTS
      if (pollCountRef.current > MAX_POLL_ATTEMPTS) {
        setJobStatus('failed');
        setErrorMessage('Quote generation timed out. Please try again.');
        return;
      }

      try {
        const res = await fetch(
          `/api/ai/quote-status?jobId=${jobId}&company_slug=${encodeURIComponent(companySlug)}`
        );
        const data = await res.json();

        if (!res.ok) {
          // 422 = job failed with a real error message
          if (res.status === 422) {
            setJobStatus('failed');
            setErrorMessage(data.error || 'Quote generation failed. Please try again.');
            return;
          }
          // Other errors — keep polling
          pollRef.current = setTimeout(poll, POLL_INTERVAL_MS);
          return;
        }

        if (data.status === 'complete') {
          // Build selectable items
          const items: AIQuoteItem[] = (data.items || []).map((item: any, i: number) => ({
            id:          Date.now() + i,
            description: item.description,
            quantity:    item.quantity || 1,
            unitPrice:   item.unitPrice,
            amount:      (item.quantity || 1) * item.unitPrice,
            selected:    true,
          }));

          setSuggestedItems(items);
          setUsedPhotos(data.usedPhotos || 0);
          setJobStatus('complete');
          setShowSuggestions(true);

        } else if (data.status === 'failed') {
          setJobStatus('failed');
          setErrorMessage(data.error || 'Quote generation failed. Please try again.');

        } else {
          // Still pending or processing — update message and keep polling
          setJobStatus(data.status as JobStatus);
          pollRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        }

      } catch {
        // Network hiccup — keep polling
        pollRef.current = setTimeout(poll, POLL_INTERVAL_MS * 2);
      }
    };

    pollRef.current = setTimeout(poll, POLL_INTERVAL_MS);
  }, [jobId, jobStatus, companySlug]);

  // ── Start generation ───────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!effectiveDescription) {
      toast.error('Add a description or internal notes first');
      return;
    }

    // Reset state
    setJobStatus('starting');
    setErrorMessage('');
    setSuggestedItems([]);
    setShowSuggestions(false);
    pollCountRef.current = 0;
    if (pollRef.current) clearTimeout(pollRef.current);

    try {
      const res = await fetch('/api/ai/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description:    leadDescription?.trim()     || '',
          internal_notes: leadInternalNotes?.trim()   || '',
          category:       leadCategory,
          company_slug:   companySlug,
          lead_id:        leadId ?? null,
          photos:         validPhotos.slice(0, 6),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.upgrade_required) {
          toast.error('AI quote generator requires a Pro plan');
        } else if (data.rate_limited) {
          toast.error('Too many requests — wait a moment and try again');
        } else {
          toast.error(data.error || 'Failed to start quote generation');
        }
        setJobStatus('idle');
        return;
      }

      // Set jobId — polling useEffect will take over
      setJobId(data.jobId);
      setJobStatus('pending');

    } catch {
      toast.error('Network error — please try again');
      setJobStatus('idle');
    }
  };

  // ── Toggle item selection ──────────────────────────────────────────────────
  const toggleItem = (id: number) => {
    setSuggestedItems(items =>
      items.map(item => item.id === id ? { ...item, selected: !item.selected } : item)
    );
  };

  const reset = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setJobStatus('idle');
    setJobId(null);
    setSuggestedItems([]);
    setShowSuggestions(false);
    setErrorMessage('');
    pollCountRef.current = 0;
  };

  const selectedItems  = suggestedItems.filter(i => i.selected);
  const totalSelected  = selectedItems.reduce((sum, i) => sum + i.amount, 0);
  const statusMessage  = STATUS_MESSAGES[jobStatus] || '';

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* ── Missing context warning ── */}
      {jobStatus === 'idle' && !effectiveDescription && (
        <div className="p-5 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-center">
          <Info className="w-5 h-5 text-slate-300 mx-auto mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Missing Context</p>
          <p className="text-xs text-slate-400 mt-1">
            Add a job description or internal notes to enable AI quoting.
          </p>
        </div>
      )}

      {/* ── Generate button ── */}
      {!showSuggestions && (
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !effectiveDescription}
          className="group relative w-full overflow-hidden inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white disabled:text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] py-5 px-4 rounded-[1.5rem] transition-all active:scale-[0.98] disabled:active:scale-100"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
              <span>{statusMessage}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform shrink-0" />
              <span>Generate Smart Quote</span>
              {validPhotos.length > 0 && (
                <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[9px] lowercase tracking-normal">
                  <ImageIcon className="w-3 h-3" />
                  {validPhotos.length} photo{validPhotos.length !== 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </button>
      )}

      {/* ── Error state ── */}
      {jobStatus === 'failed' && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-red-700 mb-0.5">Quote generation failed</p>
            <p className="text-[11px] text-red-400 leading-relaxed">
              {cleanErrorMessage(errorMessage)}
            </p>
          </div>
          <button
            onClick={reset}
            className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest shrink-0 mt-0.5"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Results ── */}
      {showSuggestions && suggestedItems.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                AI Drafted Items
              </p>
              <p className="text-[10px] text-slate-400">
                {usedPhotos > 0 ? `Based on ${usedPhotos} photo${usedPhotos !== 1 ? 's' : ''} + description` : 'Based on description'}
                {' · '}Tap to toggle
              </p>
            </div>
            <button
              onClick={reset}
              className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Line items */}
          <div className="space-y-2 mb-5">
            {suggestedItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                  item.selected
                    ? 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    : 'bg-slate-50/50 border-transparent opacity-40 grayscale'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-tight mb-1">
                      {item.description}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {item.quantity} × ${item.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black transition-colors ${item.selected ? 'text-indigo-600' : 'text-slate-400'}`}>
                      ${item.amount.toLocaleString()}
                    </p>
                    {item.selected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total + CTA */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Selected Total
              </span>
              <span className="text-xl font-black">
                ${totalSelected.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onAddItems(selectedItems)}
              disabled={selectedItems.length === 0}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add {selectedItems.length > 0 ? `${selectedItems.length} Item${selectedItems.length !== 1 ? 's' : ''}` : 'Items'} to Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}