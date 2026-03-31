import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { can, type PlanTier } from '@/lib/permissions';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    
    // Get company
   const companies = await sql`
      SELECT id, quote_templates, plan_tier
      FROM companies 
      WHERE slug = ${resolvedParams.slug}
      LIMIT 1
    `;

    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];

    // Server-side plan check
    if (!can((company.plan_tier ?? 'basic') as PlanTier, 'quote_templates')) {
      return NextResponse.json({
        success: false,
        error: 'Quote templates are available on the Pro plan',
        upgrade_required: true,
      }, { status: 403 });
    }
    
    // Parse quote_templates if it's a string
    let templates = company.quote_templates || [];
    if (typeof templates === 'string') {
      templates = JSON.parse(templates);
    }
    

    return NextResponse.json({ 
      success: true, 
      templates 
    });

  } catch (error) {
    console.error('❌ Get quote templates error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load templates',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    
    // Get user and verify permissions
    const users = await sql`SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1`;
    const user = users[0];

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }


    // Only owner, admin, and manager can manage templates
    if (!['owner', 'admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get company
   const companies = await sql`
      SELECT id, quote_templates, plan_tier
      FROM companies 
      WHERE slug = ${resolvedParams.slug}
      LIMIT 1
    `;

    if (companies.length === 0) {
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];

    // Server-side plan check
    if (!can((company.plan_tier ?? 'basic') as PlanTier, 'quote_templates')) {
      return NextResponse.json({
        success: false,
        error: 'Quote templates are available on the Pro plan',
        upgrade_required: true,
      }, { status: 403 });
    }
    
    // Verify user belongs to this company
    if (user.company_id !== company.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, template, templateId } = body;

    // Parse current templates
    let currentTemplates = company.quote_templates || [];
    if (typeof currentTemplates === 'string') {
      currentTemplates = JSON.parse(currentTemplates);
    }
    
    if (!Array.isArray(currentTemplates)) {
      currentTemplates = [];
    }

    if (action === 'create') {
      currentTemplates.push(template);
      
     await sql`
  UPDATE companies 
  SET quote_templates = ${JSON.stringify(currentTemplates)}::jsonb
  WHERE id = ${company.id}
`;

      return NextResponse.json({ 
        success: true, 
        message: 'Template created',
        templates: currentTemplates
      });
    }

    if (action === 'update') {
      const index = currentTemplates.findIndex((t: any) => t.id === template.id);
      
      if (index === -1) {
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }

      currentTemplates[index] = template;
      
      await sql`
  UPDATE companies 
  SET quote_templates = ${JSON.stringify(currentTemplates)}::jsonb
  WHERE id = ${company.id}
`;

      return NextResponse.json({ 
        success: true, 
        message: 'Template updated',
        templates: currentTemplates
      });
    }

    if (action === 'delete') {
      currentTemplates = currentTemplates.filter((t: any) => t.id !== templateId);
      
     await sql`
  UPDATE companies 
  SET quote_templates = ${JSON.stringify(currentTemplates)}::jsonb
  WHERE id = ${company.id}
`;

      return NextResponse.json({ 
        success: true, 
        message: 'Template deleted',
        templates: currentTemplates
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('❌ Quote templates API error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}