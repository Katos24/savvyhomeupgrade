import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import jwt from 'jsonwebtoken';
import BookkeeperClientView from './BookkeeperClientView';

export default async function BookkeeperClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('bookkeeper-auth-token')?.value;
  if (!token) redirect('/bookkeeper/login');

  let bookkeeper: any;
  try {
    bookkeeper = jwt.verify(token, process.env.JWT_SECRET!) as any;
  } catch {
    redirect('/bookkeeper/login');
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bookkeeper/clients/${slug}`,
    { headers: { Cookie: `bookkeeper-auth-token=${token}` }, cache: 'no-store' }
  );

  if (!res.ok) notFound();
  const data = await res.json();
  if (!data.success) notFound();

  return (
    <BookkeeperClientView
      company={data.company}
      projects={data.projects}
      bookkeeper={bookkeeper}
    />
  );
}