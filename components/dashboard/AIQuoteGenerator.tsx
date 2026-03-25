'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Loader2, Plus, X, Image, Info, CheckCircle2 } from 'lucide-react';

type AIQuoteItem = {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  selected: boolean;
};

type AIQuoteGeneratorProps = {
  leadDescription: string;
  leadInternalNotes: string; // ← NEW: Fallback for AI analysis
  leadCategory: string;
  leadPhotos?: string[];
  companySlug: string;
  onAddItems: (items: any[]) => void;
};

export default function AIQuoteGenerator({
  leadDescription,
  leadInternalNotes,
  leadCategory,
  leadPhotos = [],
  companySlug,
  onAddItems,
}: AIQuoteGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState<AIQuoteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Logic FIX: Use internal notes if public description is missing
  const effectiveDescription = leadDescription?.trim() || leadInternalNotes?.trim() || '';

  const validPhotos = leadPhotos.filter(
    (url) => typeof url === 'string' && url.startsWith('http')
  );

  const handleGenerateQuote = async () => {
    if (!effectiveDescription) {
      toast.error('Add a description or internal notes first');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: effectiveDescription,
          category: leadCategory,
          company_slug: companySlug,
          photos: validPhotos.slice(0, 6),
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate quote');

      const items: AIQuoteItem[] = data.items.map((item: any, index: number) => ({
        id: Date.now() + index,
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        amount: (item.quantity || 1) * item.unitPrice,
        selected: true,
      }));

      setSuggestedItems(items);
      setShowSuggestions(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to generate quote');
    } finally {
      setGenerating(false);
    }
  };

  const toggleItem = (id: number) => {
    setSuggestedItems((items) =>
      items.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const totalSelected = suggestedItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-4">
      {/* ── EMPTY STATE / PROMPT ── */}
      {!showSuggestions && !generating && !effectiveDescription && (
        <div className="p-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-center">
          <Info className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Missing Context</p>
          <p className="text-xs text-slate-500 mt-1">Add a job description or internal notes to enable AI quoting.</p>
        </div>
      )}

      {/* ── GENERATE BUTTON ── */}
      {!showSuggestions && (
        <button
          onClick={handleGenerateQuote}
          disabled={generating || !effectiveDescription}
          className="group relative w-full overflow-hidden inline-flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 text-white disabled:text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] py-5 px-4 rounded-[1.5rem] transition-all active:scale-[0.98]"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing Details...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>Generate Smart Quote</span>
              {validPhotos.length > 0 && (
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-[9px] lowercase tracking-normal">
                  + {validPhotos.length} photos
                </span>
              )}
            </>
          )}
        </button>
      )}

      {/* ── MESH UI SUGGESTIONS ── */}
      {showSuggestions && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">AI Drafted Items</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-tight">Tap to toggle selection</p>
            </div>
            <button onClick={() => setShowSuggestions(false)} className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest">
              Clear
            </button>
          </div>

          <div className="space-y-2 mb-6">
            {suggestedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${
                  item.selected
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-slate-50/50 border-transparent opacity-40 grayscale'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-tight mb-1">{item.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {item.quantity} x ${item.unitPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-black transition-colors ${item.selected ? 'text-indigo-600' : 'text-slate-400'}`}>
                      ${item.amount.toLocaleString()}
                    </p>
                    {item.selected && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto mt-1" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* TOTAL & ACTION - Mosh Style */}
          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Selected Total</span>
              <span className="text-xl font-black">${totalSelected.toLocaleString()}</span>
            </div>
            
            <button
              onClick={() => onAddItems(suggestedItems.filter(i => i.selected))}
              disabled={suggestedItems.filter((i) => i.selected).length === 0}
              className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Items to Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}