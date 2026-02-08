import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import CompanySettingsClient from './CompanySettingsClient';

const sql = neon(process.env.DATABASE_URL!);

export default async function SettingsPage({ params }: { params: Promise<{ company: string }> }) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    // Verify JWT and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    
    const users = await sql`
      SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1
    `;
    
    const currentUser = users[0];

    if (!currentUser) {
      redirect('/login');
    }

    // Get company with ALL fields including brand colors AND reminder_settings
    const companies = await sql`
      SELECT 
        id, 
        name, 
        slug, 
        email, 
        phone, 
        business_type, 
        logo_url, 
        status_options, 
        form_categories, 
        email_templates,
        email_brand_color_1,
        email_brand_color_2,
        reminder_settings, 
        address_enabled,
        address_required,
        cta_heading,
        cta_button_text,
        cta_success_message,
        custom_questions
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

    // Only owner and admin can access settings
    if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
      redirect(`/${resolvedParams.company}/dashboard`);
    }

    console.log('Company data loaded:', {
      id: company.id,
      name: company.name,
      email_brand_color_1: company.email_brand_color_1,
      email_brand_color_2: company.email_brand_color_2,
      reminder_settings: company.reminder_settings,
    });

    return <CompanySettingsClient company={company} currentUser={currentUser} />;
  } catch (error) {
    console.error('Settings page error:', error);
    redirect('/login');
  }
}
