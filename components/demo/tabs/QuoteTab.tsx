'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, DollarSign, ArrowRight } from 'lucide-react';
import { Lead, QuoteItem, fmt } from '@/components/demo/types';

const noSpinners = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function QuoteTab({ lead, onUpdate, tourStep, onTourAdvance }: {
  lead: Lead;
  onUpdate: (u: Partial<Lead>) => void;
  tourStep?: string;
  onTourAdvance?: (step: any) => void;
}) {
  const [items, setItems] = useState<QuoteItem[]>(lead.quote_items || []);
  const [desc, setDesc]   = useState('');
  const [qty, setQty]     = useState('1');
  const [price, setPrice] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const total = items.reduce((s, i) => s + i.amount, 0);

  const addItem = () => {
    if (!desc.trim()) { setError('Enter a description'); return; }
    if (!price || isNaN(parseFloat(price))) { setError('Enter a valid price'); return; }
    const q = parseFloat(qty) || 1;
    const p = parseFloat(price);
    setItems(prev => [...prev, { id: `item_${Date.now()}`, description: desc.trim(), quantity: q, unitPrice: p, amount: q * p }]);
    setDesc(''); setQty('1'); setPrice(''); setError('');
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const handleSave = () => {
    onUpdate({ quote_items: items, quote_total: total > 0 ? total.toFixed(2) : null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (tourStep === 'save-quote') onTourAdvance?.('send-quote');
  };

  return (
    <div className="space-y-4">

      {/* ── TOUR TIP — rendered here only, NOT in LeadModal ── */}
      {(tourStep === 'save-quote' || tourStep === 'send-quote') && onTourAdvance && (
        <div
          className="flex items-center gap-3 px-4 py-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #312e81, #4338ca)',
            border: '2px solid #818cf8',
            boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
          }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />
          <p className="text-sm font-black text-white flex-1 leading-snug">
            {tourStep === 'save-quote'
              ? 'Quote pre-loaded — hit Save Quote to lock it in.'
              : "Saved! Now send it to Michael — he'll get an email to Accept / Decline."}
          </p>
          <ArrowBounce />
        </div>
      )}

      {/* ── LINE ITEMS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-gray-800">Line items</span>
          </div>
          {items.length > 0 && (
            <span className="text-xs font-bold text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {items.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-300 font-medium">No items yet</p>
            <p className="text-xs text-gray-200 mt-1">Add your first line item below</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="divide-y divide-gray-50">
            {items.map(item => (
              <div key={item.id} className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.description}</p>
                  <p className="text-[10px] text-gray-400">${item.unitPrice.toLocaleString()} × {item.quantity}</p>
                </div>
                <p className="text-sm font-black text-gray-900 shrink-0">{fmt(item.amount)}</p>
                <button
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add row */}
        <div className={`px-4 py-3 border-t-2 border-dashed ${error ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50/40'}`}>
          <div className="flex gap-2 mb-2">
            <input
              value={desc}
              onChange={e => { setDesc(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Item description..."
              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-300"
            />
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden flex-1 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition">
              <span className="pl-3 text-gray-400 text-sm font-bold">$</span>
              <input
                type="number"
                value={price}
                onChange={e => { setPrice(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="0.00"
                className={`flex-1 px-2 py-2 bg-transparent text-sm font-bold text-gray-900 outline-none border-none ${noSpinners}`}
              />
            </div>
            <input
              type="number"
              value={qty}
              onChange={e => setQty(e.target.value)}
              className={`w-14 px-2 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-center text-gray-900 outline-none focus:border-indigo-400 transition ${noSpinners}`}
            />
            <button
              onClick={addItem}
              className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition active:scale-90 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-500 font-bold mt-1.5">{error}</p>}
        </div>
      </div>

      {/* ── TOTAL + ACTION BAR ── */}
      <div className="bg-gray-900 rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Quote total</p>
            <p className="text-2xl font-black text-white">{fmt(total)}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Step 1: Save — white on dark so it pops */}
            {tourStep !== 'send-quote' && (
              <button
                onClick={handleSave}
                disabled={items.length === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
                  saved ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-gray-100 text-gray-900'
                }`}
              >
                {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : 'Save Quote →'}
              </button>
            )}
            {/* Step 2: Send — only shows after save, clearly different */}
            {(saved || tourStep === 'send-quote') && (
              <button
                onClick={() => {
                  onUpdate({ status: 'quoted' });
                  onTourAdvance?.('accepted');
                  setTimeout(() => onTourAdvance?.('mark-paid'), 2200);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-white transition animate-in fade-in duration-300 shadow-lg shadow-emerald-900/40 active:scale-95"
              >
                <ArrowRight className="w-3.5 h-3.5" /> Send to Michael
              </button>
            )}
          </div>
        </div>
        {tourStep === 'send-quote' && (
          <p className="text-[10px] font-bold text-indigo-400 mt-3 text-right animate-pulse">
            ↑ Send it — Michael gets an email to Accept / Decline
          </p>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        In your real account, you can email this quote to the customer with one click.
      </p>
    </div>
  );
}

function ArrowBounce() {
  return (
    <svg className="w-4 h-4 text-indigo-300 shrink-0 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
    </svg>
  );
}