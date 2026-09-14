import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ project_id?: string; session_id?: string }>;
}) {
  const { project_id, session_id } = await searchParams;

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

  // FIXED: previously always fell back to "most recent payment on this
  // project" — the lifetime-most-recent transaction, not necessarily the
  // one that just happened. That guess was wrong whenever the webhook
  // inserting the real payment row hadn't finished processing yet when
  // this page loaded (a real, observed case: a balance payment went
  // through correctly in Stripe, but this page still showed the older
  // deposit payment, since the balance row hadn't landed yet).
  //
  // getOrCreateCheckoutSession now passes the real Stripe checkout
  // session ID through success_url, so when it's present, this looks up
  // the EXACT transaction directly instead of guessing. The old
  // most-recent query is kept as a fallback only for checkout links
  // created before this change went live, so nothing already sitting in
  // someone's inbox breaks.
  const paymentRows = session_id
    ? await sql`
        SELECT amount, kind
        FROM payments
        WHERE project_id = ${parseInt(project_id)}
          AND stripe_checkout_session_id = ${session_id}
        LIMIT 1
      `
    : await sql`
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