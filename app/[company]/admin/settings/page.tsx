import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import CompanySettingsClient from './CompanySettingsClient';

const sql = neon(process.env.DATABASE_URL!);

export default async function CompanySettingsPage({ 
  params 
}: { 
  params: Promise<{ company: string }> 
}) {
  const resolvedParams = await params;
  const companySlug = resolvedParams.company;

  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;

    // Get current user
    const users = await sql`
      SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    const currentUser = users[0];

    if (!currentUser) {
      redirect('/login');
    }

    // Get company
    const companies = await sql`
      SELECT * FROM companies WHERE slug = ${companySlug} LIMIT 1
    `;
    const company = companies[0];

    if (!company) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Company not found: {companySlug}</p>
          <a href="/dashboard" className="text-blue-600 underline mt-4 inline-block">Go to Dashboard</a>
        </div>
      </div>;
    }

    // Check if user belongs to this company
    if (currentUser.company_id !== company.id) {
      return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600">Access denied</p>
          <a href={`/${companySlug}/dashboard`} className="text-blue-600 underline mt-4 inline-block">Go to Dashboard</a>
        </div>
      </div>;
    }

    // Only owner and admin can access settings
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      redirect(`/${companySlug}/dashboard`);
    }

    return (
      <CompanySettingsClient 
        company={company}
        currentUser={currentUser}
      />
    );
  } catch (error) {
    console.error('Settings page error:', error);
    redirect('/login');
  }
}
