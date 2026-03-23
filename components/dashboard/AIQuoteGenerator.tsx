'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Loader2, Plus, X, Image } from 'lucide-react';

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
  leadCategory: string;
  leadPhotos?: string[];           // ← NEW: photo URLs from lead.file_urls
    companySlug: string;

  onAddItems: (items: any[]) => void;
};

export default function AIQuoteGenerator({
  leadDescription,
  leadCategory,
  leadPhotos = [],
  companySlug,
  onAddItems,
}: AIQuoteGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState<AIQuoteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const validPhotos = leadPhotos.filter(
    (url) => typeof url === 'string' && url.startsWith('http')
  );

  const handleGenerateQuote = async () => {
    if (!leadDescription?.trim()) {
      toast.error('No description to analyze');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: leadDescription,
          category: leadCategory,
          company_slug: companySlug,
          photos: validPhotos.slice(0, 6), // send up to 6 photos
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
      toast.success('Quote generated!');
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

  const handleAddSelected = () => {
    const selectedItems = suggestedItems.filter((item) => item.selected);
    if (selectedItems.length === 0) { toast.error('Select at least one item'); return; }

    onAddItems(
      selectedItems.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      }))
    );
    toast.success(`${selectedItems.length} item(s) added to quote`);
    setShowSuggestions(false);
    setSuggestedItems([]);
  };

  const totalSelected = suggestedItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-3">
      {/* ── Generate button ── */}
      {!showSuggestions && (
        <button
          onClick={handleGenerateQuote}
          disabled={generating || !leadDescription?.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 text-white font-black text-xs uppercase tracking-widest py-3.5 px-4 rounded-2xl transition shadow-lg shadow-violet-100"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {validPhotos.length > 0 ? 'Analyzing photos & description...' : 'Generating quote...'}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate with AI
              {validPhotos.length > 0 && (
                <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                  <Image className="w-3 h-3" />
                  {validPhotos.length} photo{validPhotos.length > 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </button>
      )}

      {/* ── AI Suggestions panel ── */}
      {showSuggestions && (
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              AI Suggested Quote
              {validPhotos.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full flex items-center gap-1">
                  <Image className="w-3 h-3" /> photo-informed
                </span>
              )}
            </h4>
            <button
              onClick={() => setShowSuggestions(false)}
              className="p-1.5 hover:bg-violet-100 rounded-xl transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {suggestedItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3 rounded-xl border-2 transition cursor-pointer ${
                  item.selected
                    ? 'bg-white border-violet-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItem(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{item.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>Qty: {item.quantity}</span>
                      <span>×</span>
                      <span>${item.unitPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-sm font-black text-violet-600 shrink-0">
                    ${item.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total row */}
          <div className="flex items-center justify-between py-3 border-t-2 border-violet-200 mb-3">
            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Selected Total</span>
            <span className="text-lg font-black text-violet-600">${totalSelected.toFixed(2)}</span>
          </div>

          <button
            onClick={handleAddSelected}
            disabled={suggestedItems.filter((i) => i.selected).length === 0}
            className="w-full inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            Add {suggestedItems.filter((i) => i.selected).length} Item(s) to Quote
          </button>

          <p className="text-xs text-gray-400 mt-2 text-center">
            You can edit prices and add more items after adding these
          </p>
        </div>
      )}
    </div>
  );
}