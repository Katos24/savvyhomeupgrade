'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Sparkles, Loader2, Plus, X } from 'lucide-react';

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
  onAddItems: (items: any[]) => void;
};

export default function AIQuoteGenerator({ 
  leadDescription, 
  leadCategory,
  onAddItems 
}: AIQuoteGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [suggestedItems, setSuggestedItems] = useState<AIQuoteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quote');
      }

      // Format AI response into quote items
      const items = data.items.map((item: any, index: number) => ({
        id: Date.now() + index,
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice,
        amount: (item.quantity || 1) * item.unitPrice,
        selected: true, // All selected by default
      }));

      setSuggestedItems(items);
      setShowSuggestions(true);
      toast.success('Quote generated!');
      
    } catch (error) {
      console.error('Generate quote error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate quote');
    } finally {
      setGenerating(false);
    }
  };

  const toggleItem = (id: number) => {
    setSuggestedItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleAddSelected = () => {
    const selectedItems = suggestedItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error('Select at least one item');
      return;
    }

    // Convert to quote format
    const quoteItems = selectedItems.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
    }));

    onAddItems(quoteItems);
    toast.success(`${quoteItems.length} item(s) added to quote`);
    setShowSuggestions(false);
    setSuggestedItems([]);
  };

  const totalSelected = suggestedItems
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-3">
      {/* Generate Button */}
      {!showSuggestions && (
        <button
          onClick={handleGenerateQuote}
          disabled={generating || !leadDescription?.trim()}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition shadow-lg hover:shadow-xl"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Quote...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Quote with AI
            </>
          )}
        </button>
      )}

      {/* AI Suggestions */}
      {showSuggestions && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              AI Suggested Quote
            </h4>
            <button
              onClick={() => setShowSuggestions(false)}
              className="p-1 hover:bg-purple-100 rounded transition"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {suggestedItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border-2 transition cursor-pointer ${
                  item.selected
                    ? 'bg-white border-purple-300'
                    : 'bg-gray-50 border-gray-200 opacity-50'
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleItem(item.id)}
                    className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-600">Qty: {item.quantity}</span>
                      <span className="text-xs text-gray-600">×</span>
                      <span className="text-xs text-gray-600">${item.unitPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-600">
                      ${item.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-purple-200 pt-3 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                Selected Total:
              </span>
              <span className="text-lg font-bold text-purple-600">
                ${totalSelected.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={handleAddSelected}
            disabled={suggestedItems.filter(i => i.selected).length === 0}
            className="w-full inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition"
          >
            <Plus className="w-4 h-4" />
            Add {suggestedItems.filter(i => i.selected).length} Item(s) to Quote
          </button>

          <p className="text-xs text-gray-600 mt-2 text-center">
            You can edit prices and add more items after adding these
          </p>
        </div>
      )}
    </div>
  );
}