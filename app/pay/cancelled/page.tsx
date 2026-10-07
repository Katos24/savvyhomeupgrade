// Where Stripe sends a customer who backs out of paying.
// (Before, this went to the contractor's dashboard, which asks the customer to log in.)

export const metadata = {
  title: 'Payment not completed',
  robots: { index: false, follow: false },
};

export default function PaymentCancelledPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-[0_4px_32px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M14 8v8M14 20h.01" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Payment not completed</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
          No charge was made. You can pay any time using the link in the invoice email you received.
        </p>
      </div>
      <p className="absolute bottom-6 text-[11px] font-semibold tracking-wide text-slate-300">Powered by Lead2Project</p>
    </main>
  );
}