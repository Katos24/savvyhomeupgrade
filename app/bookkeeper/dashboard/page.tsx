import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { neon } from '@neondatabase/serverless';
import BookkeeperDashboardClient from './BookkeeperDashboardClient';

export default async function BookkeeperDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('bookkeeper-auth-token')?.value;
  if (!token) redirect('/bookkeeper/login');

  let bookkeeper: any;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const sql = neon(process.env.DATABASE_URL!);
    const accounts = await sql`
      SELECT id, name, email, partner_code, created_at
      FROM bookkeeper_accounts
      WHERE id = ${decoded.bookkeeperAccountId}
    `;
    if (!accounts.length) redirect('/bookkeeper/login');
    bookkeeper = accounts[0];
  } catch {
    redirect('/bookkeeper/login');
  }

  return <BookkeeperDashboardClient bookkeeper={bookkeeper} />;
}