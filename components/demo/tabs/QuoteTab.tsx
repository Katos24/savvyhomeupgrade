'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, DollarSign } from 'lucide-react';
import { Lead, QuoteItem, fmt } from '@/components/demo/types'

const noSpinners = '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function QuoteTab({ lead, onUpdate }: { lead: Lead; onUpdate: (u: Partial<Lead>) => void }) {
  const [items, setItems]   = useState<QuoteItem[]>(lead.quote_items || []);
  const [desc, setDesc]     = useState('');
  const [qty, setQty]       = useState('1');
  const [price, setPrice]   = useState('');
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');

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
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Line items */}
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
                  <p className="text-[10px] text-gray-400">
                    ${item.unitPrice.toLocaleString()} × {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-black text-gray-900 shrink-0">{fmt(item.amount)}</p>
                <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all">
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
            <button onClick={addItem} className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition active:scale-90 shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {error && <p className="text-xs text-red-500 font-bold mt-1.5">{error}</p>}
        </div>
      </div>

      {/* Total + save */}
      <div className="bg-gray-900 rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Quote total</p>
          <p className="text-2xl font-black text-white">{fmt(total)}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={items.length === 0}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed ${
            saved ? 'bg-emerald-500 text-white' : 'bg-indigo-500 hover:bg-indigo-400 text-white'
          }`}
        >
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : 'Save quote'}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        In your real account, you can email this quote to the customer with one click.
      </p>
    </div>
  );
}