import { getJwtSecret } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import ProfilePageClient from './ProfilePageClient';

const sql = neon(process.env.DATABASE_URL!);

export default async function ProfilePage({ params }: { params: Promise<{ company: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    // Verify JWT and get user
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    
    const users = await sql`
      SELECT id, name, email, phone, role, company_id, created_at 
      FROM users 
      WHERE id = ${decoded.userId} 
      LIMIT 1
    `;

    const currentUser = users[0];

    if (!currentUser) {
      redirect('/login');
    }

    // Get company info
    const companies = await sql`
      SELECT id, name, slug, logo_url 
      FROM companies 
      WHERE slug = ${resolvedParams.company} 
      LIMIT 1
    `;

    const company = companies[0];

    if (!company) {
      redirect('/login');
    }

    // Check if user belongs to this company
    if (currentUser.company_id !== company.id) {
      redirect('/login');
    }

    return <ProfilePageClient company={company} currentUser={currentUser} />;
  } catch (error) {
    console.error('Profile page error:', error);
    redirect('/login');
  }
}