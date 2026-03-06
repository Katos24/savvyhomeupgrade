import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const sql = neon(process.env.DATABASE_URL!);

    const companies = await sql`
     SELECT 
  id, name, slug, email, phone, website, business_type, logo_url,
  status_options, created_at,
  subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id,
  plan_tier
FROM companies
WHERE slug = ${slug}
    `;

    if (companies.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    const company = companies[0];

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        email: company.email,
        phone: company.phone,
        website: company.website,
        business_type: company.business_type,
        logo_url: company.logo_url,
        status_options: company.status_options,
        created_at: company.created_at,
        subscription_status: company.subscription_status,
        trial_ends_at: company.trial_ends_at,
        stripe_customer_id: company.stripe_customer_id,
        stripe_subscription_id: company.stripe_subscription_id,
        plan_tier: company.plan_tier,  // 👈 'basic' | 'pro'
      }
    });
  } catch (error) {
    console.error('Error fetching company info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company' },
      { status: 500 }
    );
  }
}