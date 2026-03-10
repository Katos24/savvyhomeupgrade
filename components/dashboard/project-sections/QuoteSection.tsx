'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FileText, Plus, Trash2, Save, X, Edit2, DollarSign, MoreVertical, Mail, Check, ChevronDown, ChevronUp } from 'lucide-react';
import SendCustomerEmailButtons from '../SendCustomerEmailButtons';

type QuoteSectionProps = {
  lead: any;
  currentUser: any;
  onRefresh: () => Promise<void>;
  hasProject: boolean;
};

export default function QuoteSection({ lead, currentUser, onRefresh, hasProject }: QuoteSectionProps) {
  const [saving, setSaving] = useState(false);
  const [quoteData, setQuoteData] = useState(lead?.quote_data || []);
  const [isEditing, setIsEditing] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [expandedQty, setExpandedQty] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function fetchCustomTemplates() {
      setLoadingTemplates(true);
      try {
        const companySlug = window.location.pathname.split('/')[1];
        const res = await fetch(`/api/company/${companySlug}/quote-templates`);
        const data = await res.json();
        if (data.success) setCustomTemplates(data.templates || []);
      } catch (e) {
        console.error('Failed to fetch templates:', e);
      } finally {
        setLoadingTemplates(false);
      }
    }
    fetchCustomTemplates();
  }, []);

  useEffect(() => {
    if (customTemplates.length === 0 || !lead?.category) return;
    if (quoteData.length > 0 || lead?.quote_total) return;

    const match = customTemplates.find((t: any) => t.category === lead?.category);
    if (match) {
      const items = match.items.map((item: any, i: number) => ({
        id: Date.now() + i,
        description: item.description,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || item.amount / (item.quantity || 1),
        amount: item.amount,
      }));
      setQuoteData(items);

      if (!lead?.quote_total && hasProject && items.length > 0) {
        const total = items.reduce((s: number, i: any) => s + i.amount, 0);
        fetch('/api/leads/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lead.id, action: 'save_quote', quote_data: items, quote_total: total,
            user_name: currentUser?.name || 'Unknown', user_email: currentUser?.email || '',
          }),
        })
          .then(r => r.json())
          .then(result => { if (result.success) { toast.success('Quote auto-saved!'); onRefresh(); } })
          .catch(err => console.error('Auto-save failed:', err));
      }
    } else {
      setQuoteData([]);
    }
  }, [customTemplates, lead?.category, lead?.id, hasProject]);

  const availableTemplates = customTemplates.filter((t: any) => t.category === lead?.category);

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) return;
    const template = availableTemplates.find((t: any) => t.id === templateId);
    if (!template) return;
    const items = template.items.map((item: any, i: number) => ({
      id: Date.now() + i,
      description: item.description,
      quantity: item.quantity || 1,
      unitPrice: item.amount / (item.quantity || 1),
      amount: item.amount,
    }));
    setQuoteData(items);
    toast.success('Template loaded!');
  };

  const handleAddRow = () => {
    setQuoteData([...quoteData, { id: Date.now(), description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleUpdateCell = (id: number, field: string, value: any) => {
    setQuoteData(quoteData.map((item: any) => {
      if (item.id !== id) return item;
      const updated = { ...item };
      if (field === 'description') {
        updated[field] = value;
      } else {
        const num = value === '' ? 0 : parseFloat(value) || 0;
        updated[field] = num;
        if (field === 'quantity' || field === 'unitPrice') {
          updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
        }
      }
      return updated;
    }));
  };

  const handleRemoveRow = (id: number) => setQuoteData(quoteData.filter((item: any) => item.id !== id));

  const handleSave = async () => {
    if (!hasProject) { toast.error('Convert to project first'); return; }
    if (quoteData.length === 0) { toast.error('Add at least one line item'); return; }

    const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);
    setSaving(true);
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id, action: 'save_quote', quote_data: quoteData, quote_total: total,
          user_name: currentUser?.name || 'Unknown', user_email: currentUser?.email || '',
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        toast.success('Quote saved!');
        setIsEditing(false);
        setExpandedQty({});
        await onRefresh();
      } else {
        toast.error(result.error || 'Failed to save quote');
      }
    } catch {
      toast.error('Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const total = quoteData.reduce((s: number, i: any) => s + i.amount, 0);
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const toggleQty = (id: number) => setExpandedQty(prev => ({ ...prev, [id]: !prev[id] }));

  const emailLog: any[] = (() => {
    try {
      const raw = lead?.quote_emails;
      return typeof raw === 'string' ? JSON.parse(raw) : raw || [];
    } catch { return []; }
  })();

  // ── EMPTY STATE ──────────────────────────────────────────────────────────
  if (quoteData.length === 0 && !isEditing && !loadingTemplates) {
    return (
      <div className="overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-50 flex items-center justify-center rounded text-xs">💰</span>
            Quote
          </h3>
        </div>
        <div className="p-10 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">No quote yet</p>
            <p className="text-xs text-gray-400 mt-1">Add line items to build a quote</p>
          </div>
          {availableTemplates.length === 0 && (
            <p className="text-xs text-gray-400 max-w-xs bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              💡 Create a quote template in Settings to auto-populate quotes for this category.
            </p>
          )}
          <button
            onClick={() => { handleAddRow(); setIsEditing(true); }}
            className="mt-1 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 text-sm rounded-xl transition shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Create Quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-5 h-5 bg-blue-50 flex items-center justify-center rounded text-xs">💰</span>
            Quote
          </h3>
          {quoteData.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-extrabold rounded-md">
              {fmt(total)}
            </span>
          )}
          {lead?.quote_accepted_at && (
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md flex items-center gap-1">
              <Check className="w-3 h-3" /> Accepted
            </span>
          )}
          {lead?.quote_declined_at && !lead?.quote_accepted_at && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-md">
              ✗ Declined
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isEditing ? (
            <>
              {availableTemplates.length > 1 && (
                <select
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="hidden sm:block text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 text-gray-600 max-w-[110px]"
                >
                  <option value="">Template...</option>
                  {availableTemplates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => { setQuoteData(lead?.quote_data || []); setIsEditing(false); setExpandedQty({}); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </button>
             <div className="relative">
  <button
    onClick={(e) => {
      e.stopPropagation(); // Prevents the click from hitting parent containers
      setShowMoreActions(!showMoreActions);
    }}
    className="p-3 bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg transition-colors"
  >
    <MoreVertical className="w-5 h-5 sm:w-4 sm:h-4" /> 
    {/* Slightly larger icon for mobile thumb-tap targets */}
  </button>

  {showMoreActions && (
    <>
      {/* Increased Z-Index and added a slight background tint for better mobile UX */}
      <div 
        className="fixed inset-0 z-[80] bg-black/5 sm:bg-transparent" 
        onClick={() => setShowMoreActions(false)} 
      />
      
      {/* Added pointer-events-auto and extra padding for touch targets */}
      <div 
        className="absolute right-0 top-full mt-2 bg-white shadow-2xl border border-gray-100 rounded-xl z-[90] w-64 p-3 pointer-events-auto"
        onClick={(e) => e.stopPropagation()} // CRITICAL: Prevents menu from closing when clicking inside it
      >
        <SendCustomerEmailButtons
          leadId={lead.id}
          type="quote"
          currentUser={currentUser}
          onRefresh={onRefresh}
          hasQuote={quoteData.length > 0}
          quoteSentAt={emailLog.length > 0 ? emailLog[emailLog.length - 1].sent_at : null}
          disabled={!hasProject}
        />
      </div>
    </>
  )}
</div>
            </>
          )}
        </div>
      </div>

      {/* ── LINE ITEMS ──────────────────────────────────────────────────────── */}
      <div className="divide-y divide-gray-50">
        {quoteData.map((item: any, idx: number) => {
          const isQtyExpanded = expandedQty[item.id];
          const showQtyHint = item.quantity > 1 && !isEditing;

          return (
            <div key={item.id} className={`px-4 py-3.5 ${isEditing ? 'bg-blue-50/30' : 'bg-white hover:bg-gray-50/60'} transition`}>

              {isEditing ? (
                /* ── EDIT MODE ── */
                <div className="space-y-2.5">
                  {/* Description input */}
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateCell(item.id, 'description', e.target.value)}
                    placeholder="Item description..."
                    className="w-full px-3 py-2.5 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white placeholder-gray-300"
                    autoFocus={idx === quoteData.length - 1 && !item.description}
                  />

                  {/* Price + Qty row */}
                  <div className="flex gap-2 items-end">
                    {/* Unit Price — hero field */}
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice || ''}
                          onChange={(e) => handleUpdateCell(item.id, 'unitPrice', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2.5 text-sm font-bold border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                          style={{ MozAppearance: 'textfield' } as any}
                        />
                      </div>
                    </div>

                    {/* Qty — secondary */}
                    <div className="w-20">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Qty</label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity || ''}
                        onChange={(e) => handleUpdateCell(item.id, 'quantity', e.target.value)}
                        className="w-full px-3 py-2.5 text-sm font-bold text-center border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
                        style={{ MozAppearance: 'textfield' } as any}
                      />
                    </div>

                    {/* Amount display */}
                    <div className="w-24 text-right pb-0.5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</label>
                      <p className="text-sm font-extrabold text-gray-800 py-2.5">{fmt(item.amount)}</p>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleRemoveRow(item.id)}
                      className="mb-0.5 p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              ) : (
                /* ── VIEW MODE ── */
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.description || '—'}</p>
                    {showQtyHint && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.quantity} × {fmt(item.unitPrice)}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-extrabold text-gray-800 flex-shrink-0">{fmt(item.amount)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── ADD ROW BUTTON (editing) ────────────────────────────────────────── */}
      {isEditing && (
        <div className="px-4 py-3 border-t border-dashed border-blue-200 bg-blue-50/20">
          <button
            onClick={handleAddRow}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition border-2 border-dashed border-blue-200 hover:border-blue-300"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      )}

      {/* ── TOTAL BAR ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t-2 border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total</span>
        <span className="text-lg font-extrabold text-emerald-600">{fmt(total)}</span>
      </div>

      {/* ── EMAIL HISTORY ───────────────────────────────────────────────────── */}
      {!isEditing && emailLog.length > 0 && (
        <div className="px-4 py-4 border-t border-gray-50 space-y-2 bg-gray-50/50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
            <Mail className="w-3 h-3" /> Email History
          </p>
          {[...emailLog].reverse().map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-white border border-blue-100 rounded-xl text-sm gap-2 shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-3 h-3 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-xs">{fmt(entry.quote_total)}</p>
                  <p className="text-[10px] text-gray-400 truncate">{entry.sent_by_email}</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0">
                {new Date(entry.sent_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                })}
              </span>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
}