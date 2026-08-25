'use client';

import { useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

type Props = {
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  total: number;
  depositAmount: number;
  depositType: 'percent' | 'fixed' | null;
  depositValue: number;
  depositLocked: boolean;
  taxLocked: boolean;
  onOpenDepositEditor: () => void;
  onOpenTaxEditor: () => void;
  quoteAccepted: boolean;
  hasItems: boolean;
  onMarkAccepted: () => void;
};

const LOCK_MESSAGE =
  'A payment has already been collected against these terms. Refund it in Billing to make changes.';

export default function MobileQuoteSummary({
  subtotal,
  taxAmount,
  taxRate,
  total,
  depositAmount,
  depositType,
  depositValue,
  depositLocked,
  taxLocked,
  onOpenDepositEditor,
  onOpenTaxEditor,
  quoteAccepted,
  hasItems,
  onMarkAccepted,
}: Props) {
  const [lockNoteFor, setLockNoteFor] = useState<'deposit' | 'tax' | null>(null);

  const Row = ({
    label,
    value,
    locked,
    editable,
    onEdit,
    lockKey,
  }: {
    label: string;
    value: string;
    locked?: boolean;
    editable?: boolean;
    onEdit?: () => void;
    lockKey?: 'deposit' | 'tax';
  }) => (
    <div>
      <div className="flex items-center justify-between py-2">
        <button
          type="button"
          disabled={!editable && !locked}
          onClick={() => {
            if (locked && lockKey) {
              setLockNoteFor(lockNoteFor === lockKey ? null : lockKey);
            } else if (editable) {
              onEdit?.();
            }
          }}
          className="flex items-center gap-1.5 text-sm text-slate-600"
        >
          {label}
          {locked && <Lock className="w-3 h-3 text-slate-300" />}
        </button>
        <span className="text-sm font-semibold text-slate-900 tabular-nums">{value}</span>
      </div>
      {locked && lockNoteFor === lockKey && (
        <p className="pb-2 text-[11px] text-slate-400 leading-relaxed">{LOCK_MESSAGE}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-0.5">
      <Row label="Subtotal" value={fmt(subtotal)} />

      {depositAmount > 0 && (
        <Row
          label={`Deposit (${depositType === 'percent' ? `${depositValue}%` : 'Fixed'})`}
          value={fmt(depositAmount)}
          locked={depositLocked}
          editable={!depositLocked}
          onEdit={onOpenDepositEditor}
          lockKey="deposit"
        />
      )}

      <Row
        label={`Tax${taxRate > 0 ? ` (${taxRate}%)` : ''}`}
        value={taxRate > 0 ? fmt(taxAmount) : '—'}
        locked={taxLocked}
        editable={!taxLocked}
        onEdit={onOpenTaxEditor}
        lockKey="tax"
      />

      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
        <span className="text-sm font-bold text-slate-900">Total</span>
        <span className="text-sm font-bold text-slate-900 tabular-nums">{fmt(total)}</span>
      </div>

      {!quoteAccepted && hasItems && (
        <button
          type="button"
          onClick={onMarkAccepted}
          className="w-full mt-3 py-2 px-3 bg-white border border-slate-200 text-xs font-semibold text-slate-700 active:bg-emerald-50 active:border-emerald-200 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark Accepted Manually
        </button>
      )}
    </div>
  );
}