'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, DollarSign, Send, ArrowRight, Mail, ChevronUp, ChevronDown } from 'lucide-react';
import { Lead, QuoteItem, fmt } from '@/components/demo/types';
import SentEmailPreview from '@/components/demo/SentEmailPreview';

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
const [showHistory, setShowHistory] = useState(false);
const [sentHistory, setSentHistory] = useState<{date: string}[]>([]);
const [showPreview, setShowPreview] = useState(false);


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
{/* ── LINE ITEMS — matches real QuoteSection ── */}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  {/* Desktop table */}
  <div className="hidden sm:block overflow-x-auto">
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Line item</th>
        <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 w-24">Unit price</th>
          <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 w-20">Qty</th>
          <th className="text-right px-3 py-3 text-xs font-medium text-gray-400 w-24">Amount</th>
          <th className="w-9" />
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={5}>
              <button
                onClick={() => {
                  setItems(prev => [...prev, { id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
                }}
                className="w-full py-16 flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center transition-all shadow-lg shadow-indigo-200 group-hover:scale-110">
                  <Plus className="w-5 h-5 text-white stroke-[3px]" />
                </div>
                <span className="text-xs font-bold text-indigo-500 group-hover:text-indigo-600 transition-colors">Add line item</span>
              </button>
            </td>
          </tr>
        ) : (
          <>
            {items.map(item => (
<tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60 group">                <td className="px-5 py-2.5">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => setItems(prev => prev.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))}
                    placeholder="Item description…"
className="w-full outline-none text-sm font-medium text-gray-900 placeholder-gray-300 rounded-lg bg-transparent px-1 py-1 focus:bg-white focus:border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:px-3 transition-all"
                  />
                </td>
                <td className="px-5 py-2.5">
                  <input
                    type="number"
                    value={item.unitPrice || ''}
                    onChange={e => {
                      const unitPrice = parseFloat(e.target.value) || 0;
                      setItems(prev => prev.map(i => i.id === item.id ? { ...i, unitPrice, amount: unitPrice * i.quantity } : i));
                    }}
className={`w-full outline-none text-sm text-right text-gray-900 rounded-lg bg-transparent px-1 py-1 focus:bg-white focus:border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all ${noSpinners}`}                  />
                </td>
               <td className="px-3 py-2.5">
                  <input
                    type="number"
                    value={item.quantity || ''}
                    onChange={e => {
                      const quantity = parseFloat(e.target.value) || 1;
                      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity, amount: i.unitPrice * quantity } : i));
                    }}
className={`w-full outline-none text-sm text-right text-gray-900 rounded-lg bg-transparent px-1 py-1 focus:bg-white focus:border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all ${noSpinners}`}                  />
                </td>
                <td className="px-5 py-2.5 text-right text-sm font-medium text-gray-900">
                  ${(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="pr-3 py-2.5">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={5} className="px-5 py-3 border-t border-dashed border-gray-200">
                <button
                  onClick={() => setItems(prev => [...prev, { id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0, amount: 0 }])}
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </div>
                  Add line item
                </button>
              </td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  </div>

{/* Mobile cards */}
  <div className="sm:hidden">
    {items.length === 0 ? (
      <button
        onClick={() => setItems(prev => [...prev, { id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0, amount: 0 }])}
        className="w-full py-12 flex flex-col items-center justify-center gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
          <Plus className="w-5 h-5 text-white stroke-[3px]" />
        </div>
        <span className="text-xs font-bold text-indigo-500">Add first line item</span>
      </button>
    ) : (
      <div className="divide-y divide-slate-100">
        {items.map((item, idx) => (
          <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
           <div className="min-w-0" style={{ maxWidth: '55%' }}>
              <p className="text-sm font-bold text-slate-900 truncate">{item.description || 'Untitled item'}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                {`${item.quantity} × $${item.unitPrice.toLocaleString()}`}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <p className="text-sm font-black text-slate-900">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        <div className="px-4 py-3">
          <button
            onClick={() => setItems(prev => [...prev, { id: `item_${Date.now()}`, description: '', quantity: 1, unitPrice: 0, amount: 0 }])}
            className="w-full border-2 border-dashed border-indigo-200 rounded-xl py-3 flex items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400">Add line item</span>
          </button>
        </div>
      </div>
    )}
  </div>
</div>

      {/* ── TOTAL + ACTION BAR ── */}
  {/* ── STICKY TOTAL BAR — matches real dashboard ── */}
<div className="sticky bottom-0 z-10 bg-white border-t border-slate-100">
  <div className="px-4 py-3 flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Total</p>
      <p className="text-xl font-black text-slate-900">{fmt(total)}</p>
    </div>
   <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={handleSave}
        disabled={items.length === 0}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${
          saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-slate-700 text-white'
        }`}
      >
        {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : 'Save Quote'}
      </button>
      <button
        onClick={() => {
          onUpdate({ status: 'quoted' });
          setSentHistory(prev => [{ date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }, ...prev]);
          setShowPreview(true);
        }}
        disabled={items.length === 0}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-700 font-black text-[11px] uppercase tracking-widest transition hover:border-indigo-300 hover:text-indigo-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send className="w-3.5 h-3.5" />
        Send
      </button>
    </div>
  </div>
  {tourStep === 'send-quote' && (
    <p className="text-[10px] font-bold text-indigo-400 pb-2 text-right pr-4 animate-pulse">
      ↑ Send it — Michael gets an email to Accept / Decline
    </p>
    
  )}

  
</div>

     {sentHistory.length > 0 && (
  <div className="border-t border-slate-100 pt-2">
    <button
      onClick={() => setShowHistory(v => !v)}
      className="flex items-center justify-between w-full py-1"
    >
      <span className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
        <Mail className="w-3 h-3" /> Sent History ({sentHistory.length})
      </span>
      {showHistory
        ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
        : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
    </button>
    {showHistory && (
      <div className="mt-2 space-y-2">
        {sentHistory.map((entry, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-800">{entry.date}</span>
                <p className="text-[10px] text-slate-400 truncate">Sent to Michael Johnson</p>
              </div>
            </div>
            <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 shrink-0 ml-2">
              sent
            </span>
          </div>
        ))}
      </div>
    )}

    {showPreview && (
  <SentEmailPreview
    type="quote"
    customerName={lead.name}
    customerEmail={lead.email}
    amount={lead.quote_total ? `$${parseFloat(lead.quote_total).toLocaleString()}` : undefined}
    onDismiss={() => setShowPreview(false)}
  />
)}
  </div>


)}

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