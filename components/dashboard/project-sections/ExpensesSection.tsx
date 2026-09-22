'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, X, Receipt, Loader2 } from 'lucide-react';

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'materials', label: 'Materials' },
  { value: 'labor', label: 'Labor' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'travel', label: 'Travel' },
  { value: 'permits', label: 'Permits' },
  { value: 'other', label: 'Other' },
];

const CATEGORY_COLOR: Record<string, string> = {
  materials: '#3b82f6',
  labor: '#8b5cf6',
  subcontractor: '#f59e0b',
  equipment: '#10b981',
  travel: '#ec4899',
  permits: '#6b7280',
  other: '#a8a29e',
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  // Same root cause as the export route's crash, showing up differently
  // here: expense_date travels through this component via the API's
  // JSON response, where JSON serialization turns the database's native
  // Date object into a full ISO string with a spurious midnight-UTC time
  // component (e.g. "2026-09-10T00:00:00.000Z"). Splitting that on '-'
  // left "10T00:00:00.000Z" as the day, which Number() can't parse — so
  // this silently fell back to '—' for every single expense instead of
  // showing the real date. Reading UTC parts from a proper Date object
  // instead handles the ISO string correctly.
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

type Expense = {
  id: number;
  project_id: number | null;
  category: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  vendor: string | null;
  expense_date: string;
  payment_method: string | null;
  created_by: string | null;
};

type FormState = {
  id: number | null;
  category: string;
  description: string;
  quantity: string;
  unit_price: string;
  vendor: string;
  expense_date: string;
};

const emptyForm = (): FormState => ({
  id: null,
  category: 'materials',
  description: '',
  quantity: '1',
  unit_price: '',
  vendor: '',
  expense_date: new Date().toISOString().split('T')[0],
});

export default function ExpensesSection({
  lead,
  companySlug,
  hasProject,
}: {
  lead: any;
  companySlug: string;
  hasProject: boolean;
}) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const projectId = lead?.project_id;

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/company/${companySlug}/expenses?project_id=${projectId}`);
      const data = await res.json();
      if (data.success) setExpenses(data.expenses);
    } catch {
      toast.error('Could not load expenses');
    } finally {
      setLoading(false);
    }
  }, [companySlug, projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const openAdd = () => {
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (e: Expense) => {
    setForm({
      id: e.id,
      category: e.category,
      description: e.description,
      quantity: String(e.quantity),
      unit_price: String(e.unit_price),
      vendor: e.vendor || '',
      expense_date: e.expense_date,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const description = form.description.trim();
    if (!description) {
      toast.error('Enter a description.');
      return;
    }
    const unitPrice = parseFloat(form.unit_price);
    if (Number.isNaN(unitPrice) || unitPrice <= 0) {
      toast.error('Enter a unit price greater than zero.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/company/${companySlug}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(form.id ? { update_id: form.id } : {}),
          project_id: projectId,
          category: form.category,
          description,
          quantity: form.quantity,
          unit_price: form.unit_price,
          vendor: form.vendor.trim() || undefined,
          expense_date: form.expense_date,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(form.id ? 'Expense updated' : 'Expense added');
        setShowForm(false);
        await load();
      } else {
        toast.error(data.error || 'Could not save expense');
      }
    } catch {
      toast.error('Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/company/${companySlug}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delete_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Expense deleted');
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      } else {
        toast.error(data.error || 'Could not delete expense');
      }
    } catch {
      toast.error('Could not delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  if (!hasProject) return null;

  const previewAmount = (() => {
    const q = parseFloat(form.quantity) || 0;
    const p = parseFloat(form.unit_price) || 0;
    return q * p;
  })();

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total spent on this job</p>
          <p className="text-2xl font-bold text-gray-900 tabular-nums mt-0.5">{fmt(total)}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Expense
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-14 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-14 bg-gray-50 rounded-xl border border-gray-100">
          <Receipt className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No expenses logged for this job yet.</p>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
          {expenses.map((e) => (
            <div
              key={e.id}
              onClick={() => openEdit(e)}
              className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    style={{
                      color: CATEGORY_COLOR[e.category] || '#a8a29e',
                      background: `${CATEGORY_COLOR[e.category] || '#a8a29e'}18`,
                    }}
                  >
                    {CATEGORIES.find((c) => c.value === e.category)?.label || e.category}
                  </span>
                  <p className="text-sm font-medium text-gray-900 truncate">{e.description}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {e.vendor ? `${e.vendor} · ` : ''}
                  {fmtDate(e.expense_date)}
                  {e.quantity !== 1 ? ` · ${e.quantity} × ${fmt(e.unit_price)}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold text-gray-900 tabular-nums">{fmt(e.amount)}</span>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleDelete(e.id);
                  }}
                  disabled={deletingId === e.id}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label="Delete expense"
                >
                  {deletingId === e.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4"
          onClick={() => !saving && setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {form.id ? 'Edit expense' : 'Add expense'}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-3">
              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setForm((f) => ({ ...f, category: c.value }))}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={
                        form.category === c.value
                          ? { background: CATEGORY_COLOR[c.value], color: 'white' }
                          : { background: '#f3f4f6', color: '#6b7280' }
                      }
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Shingles & underlayment"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.quantity}
                    onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Unit Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.unit_price}
                      onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-200 pl-6 pr-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500"                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Vendor (optional)</label>
                <input
                  value={form.vendor}
                  onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
                  placeholder="Home Depot"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => setForm((f) => ({ ...f, expense_date: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-base font-semibold text-gray-900 tabular-nums">{fmt(previewAmount)}</span>
              </div>
            </div>

            <div className="px-5 pb-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-xl transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : form.id ? 'Save changes' : 'Add expense'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}