import { getJwtSecret } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';
import { notFound, redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import AnalyticsClient from '@/components/dashboard/AnalyticsClient';

type PageProps = {
  params: Promise<{ company: string }>;
};

type Company = {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
};

async function getCompany(slug: string): Promise<Company | null> {
  const sql = neon(process.env.DATABASE_URL!);
  
  const companies = await sql`
    SELECT 
      id,
      name,
      slug,
      logo_url
    FROM companies 
    WHERE slug = ${slug}
  `;
  
  if (companies.length === 0) return null;
  
  return companies[0] as Company;
}

async function verifyAuth(companySlug: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      redirect('/login');
    }

    // Verify JWT
    const decoded = jwt.verify(
      token.value,
      getJwtSecret()
    ) as any;

    // Check if user belongs to this company
    const sql = neon(process.env.DATABASE_URL!);
    const userAccess = await sql`
      SELECT u.id, u.company_id, c.slug
      FROM users u
      JOIN companies c ON u.company_id = c.id
      WHERE u.id = ${decoded.userId}
      AND c.slug = ${companySlug}
    `;

    if (userAccess.length === 0) {
      const userCompany = await sql`
        SELECT c.slug
        FROM users u
        JOIN companies c ON u.company_id = c.id
        WHERE u.id = ${decoded.userId}
      `;
      
      if (userCompany.length > 0) {
        redirect(`/${userCompany[0].slug}/dashboard`);
      } else {
        redirect('/login');
      }
    }

    return decoded;
  } catch (error) {
    console.error('Auth verification failed:', error);
    redirect('/login');
  }
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { company: companySlug } = await params;
  
  // Verify authentication and authorization
  await verifyAuth(companySlug);
  
  const company = await getCompany(companySlug);
  
  if (!company) {
    notFound();
  }

  return <AnalyticsClient company={company} />;
}
