import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log('📋 GET quote-templates for slug:', resolvedParams.slug);
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      console.log('❌ No auth token');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    console.log('✅ Token verified for user:', decoded.userId);
    
    // Get company
    const companies = await sql`
      SELECT id, quote_templates 
      FROM companies 
      WHERE slug = ${resolvedParams.slug}
      LIMIT 1
    `;

    if (companies.length === 0) {
      console.log('❌ Company not found');
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];
    console.log('✅ Company found:', company.id);
    
    // Parse quote_templates if it's a string
    let templates = company.quote_templates || [];
    if (typeof templates === 'string') {
      templates = JSON.parse(templates);
    }
    
    console.log('✅ Returning templates:', templates.length);

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
    console.log('📋 POST quote-templates for slug:', resolvedParams.slug);
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      console.log('❌ No auth token');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    console.log('✅ Token verified for user:', decoded.userId);
    
    // Get user and verify permissions
    const users = await sql`SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1`;
    const user = users[0];

    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found:', user.email, 'role:', user.role);

    // Only owner, admin, and manager can manage templates
    if (!['owner', 'admin', 'manager'].includes(user.role)) {
      console.log('❌ Insufficient permissions');
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get company
    const companies = await sql`
      SELECT id, quote_templates 
      FROM companies 
      WHERE slug = ${resolvedParams.slug}
      LIMIT 1
    `;

    if (companies.length === 0) {
      console.log('❌ Company not found');
      return NextResponse.json({ success: false, error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];
    console.log('✅ Company found:', company.id);
    
    // Verify user belongs to this company
    if (user.company_id !== company.id) {
      console.log('❌ User does not belong to company');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, template, templateId } = body;
    console.log('📋 Action:', action);

    // Parse current templates
    let currentTemplates = company.quote_templates || [];
    if (typeof currentTemplates === 'string') {
      currentTemplates = JSON.parse(currentTemplates);
    }
    
    if (!Array.isArray(currentTemplates)) {
      currentTemplates = [];
    }

    if (action === 'create') {
      console.log('➕ Creating template:', template.name);
      currentTemplates.push(template);
      
      await sql`
        UPDATE companies 
        SET quote_templates = ${JSON.stringify(currentTemplates)}
        WHERE id = ${company.id}
      `;

      console.log('✅ Template created');
      return NextResponse.json({ 
        success: true, 
        message: 'Template created',
        templates: currentTemplates
      });
    }

    if (action === 'update') {
      console.log('✏️ Updating template:', template.id);
      const index = currentTemplates.findIndex((t: any) => t.id === template.id);
      
      if (index === -1) {
        console.log('❌ Template not found');
        return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
      }

      currentTemplates[index] = template;
      
      await sql`
        UPDATE companies 
        SET quote_templates = ${JSON.stringify(currentTemplates)}
        WHERE id = ${company.id}
      `;

      console.log('✅ Template updated');
      return NextResponse.json({ 
        success: true, 
        message: 'Template updated',
        templates: currentTemplates
      });
    }

    if (action === 'delete') {
      console.log('🗑️ Deleting template:', templateId);
      currentTemplates = currentTemplates.filter((t: any) => t.id !== templateId);
      
      await sql`
        UPDATE companies 
        SET quote_templates = ${JSON.stringify(currentTemplates)}
        WHERE id = ${company.id}
      `;

      console.log('✅ Template deleted');
      return NextResponse.json({ 
        success: true, 
        message: 'Template deleted',
        templates: currentTemplates
      });
    }

    console.log('❌ Invalid action');
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