import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { sendPaymentReminderEmail } from '@/lib/email';

type Props = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const companies = await sql`SELECT id FROM companies WHERE slug = ${slug}`;
    if (!companies[0]) return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    const companyId = companies[0].id;

    const reminders = await sql`
      SELECT
        l.id as lead_id,
        l.name as customer_name,
        l.email as customer_email,
        l.phone as customer_phone,
        p.id as project_id,
        p.project_number,
        p.payment_due_date::text as payment_due_date,
        p.payment_status,
        p.payment_amount,
        p.quote_total,
        p.reminder_sent_at
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      WHERE l.company_id = ${companyId}
        AND l.deleted = false
        AND p.payment_due_date IS NOT NULL
        AND (p.payment_status IS NULL OR p.payment_status NOT IN ('paid'))
        AND p.payment_due_date <= NOW() + INTERVAL '7 days'
      ORDER BY p.payment_due_date ASC
    `;

    const now = new Date();
    const result = reminders.map(r => ({
      ...r,
      is_overdue: new Date(r.payment_due_date) < now,
      reminder_sent_recently: r.reminder_sent_at
        ? (now.getTime() - new Date(r.reminder_sent_at).getTime()) < 24 * 60 * 60 * 1000
        : false,
    }));

    return NextResponse.json({ success: true, reminders: result });
  } catch (error) {
    console.error('❌ Error fetching payment reminders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reminders' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { lead_id, project_id } = body;

    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      SELECT
        l.name as customer_name,
        l.email as customer_email,
        p.payment_due_date::text as payment_due_date,
        p.payment_amount,
        p.quote_total,
        c.name as company_name,
        c.phone as company_phone
      FROM projects p
      JOIN leads l ON p.lead_id = l.id
      JOIN companies c ON l.company_id = c.id
      WHERE p.id = ${project_id}
        AND l.id = ${lead_id}
        AND c.slug = ${slug}
      LIMIT 1
    `;

    if (!result[0]) return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });

    const r = result[0];
const quoteTotal = parseFloat(r.quote_total || '0');
const paid = parseFloat(r.payment_amount || '0');
const amountDue = paid > 0 ? Math.max(quoteTotal - paid, 0) : quoteTotal;
    const isOverdue = new Date(r.payment_due_date) < new Date();

    await sendPaymentReminderEmail({
      customerEmail: r.customer_email,
      customerName: r.customer_name,
      companyName: r.company_name,
      companyPhone: r.company_phone,
      amountDue,
      dueDate: r.payment_due_date,
      isOverdue,
    });

    await sql`
      UPDATE projects
      SET reminder_sent_at = NOW(), updated_at = NOW()
      WHERE id = ${project_id}
    `;

    return NextResponse.json({ success: true, message: 'Reminder sent!' });
  } catch (error) {
    console.error('❌ Error sending payment reminder:', error);
    return NextResponse.json({ success: false, error: 'Failed to send reminder' }, { status: 500 });
  }
}