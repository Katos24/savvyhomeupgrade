import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ project_id?: string }>;
}) {
  const { project_id } = await searchParams;

  if (!project_id) {
    return <SimpleMessage title="Payment received" body="Thank you for your payment." />;
  }

  const projectRows = await sql`
    SELECT c.name as company_name, c.logo_url, c.email_brand_color_1
    FROM projects p
    JOIN companies c ON p.company_id = c.id
    WHERE p.id = ${parseInt(project_id)}
    LIMIT 1
  `;

  const project = projectRows[0];
  const companyName = project?.company_name || 'the company';
  const brandColor = project?.email_brand_color_1 || '#2563eb';

  // The MOST RECENT individual transaction on this project — not
  // projects.payment_amount, which is the lifetime running total across
  // every payment ever made on this job. Using that here was the same bug
  // found and fixed in Financials/Dashboard earlier: if a $300 deposit was
  // already paid last week and this customer just paid a $500 balance,
  // the old query showed "$800" — the cumulative total — instead of the
  // $500 they actually just paid. This is arguably the highest-stakes
  // instance of that bug found this session, since it's shown directly to
  // the customer as their receipt confirmation, not just an internal view.
  //
  // Caveat, stated plainly rather than hidden: with only project_id in the
  // URL (no payment id or Stripe session id), "most recent payment on this
  // project" is the best available proxy for "the payment that just
  // happened," not a guaranteed exact match — if the webhook that inserts
  // this row hasn't finished processing yet when this page loads, or two
  // payments land in very close succession, this could show a stale or
  // wrong row. If the success URL can be extended to carry the actual
  // payment id or Stripe checkout session id, that would let this look up
  // the exact transaction instead of inferring it — worth doing if that's
  // an easy addition to whatever builds this redirect URL.
  const paymentRows = await sql`
    SELECT amount, kind
    FROM payments
    WHERE project_id = ${parseInt(project_id)}
    ORDER BY paid_on DESC, created_at DESC
    LIMIT 1
  `;
  const payment = paymentRows[0];
  const amount = payment?.amount
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(payment.amount))
    : null;
  const kindLabel = payment?.kind === 'deposit' ? 'deposit' : payment?.kind === 'balance' ? 'balance' : 'payment';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'white', borderRadius: 24, padding: '48px 40px', maxWidth: 420, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {project?.logo_url && (
          <img src={project.logo_url} alt={companyName} style={{ height: 40, marginBottom: 24, objectFit: 'contain' }} />
        )}
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Payment received</h1>
        <p style={{ fontSize: 15, color: '#64748b', margin: '0 0 4px', lineHeight: 1.5 }}>
          {amount ? `${amount} ${kindLabel} paid to ${companyName}.` : `Your payment to ${companyName} was successful.`}
        </p>
        <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 16 }}>
          A receipt has been sent to your email.
        </p>
      </div>
    </div>
  );
}

function SimpleMessage({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
    </div>
  );
}