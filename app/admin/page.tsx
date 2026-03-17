import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import AdminPageContent from './AdminPageContent';

async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    if (!authToken) return false;
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;
    const decoded: any = jwt.verify(authToken.value, secret);
    return decoded.role === 'super_admin';
  } catch {
    return false;
  }
}

export default async function AdminPage() {
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) redirect('/admin/login');
  return <AdminPageContent />;
}