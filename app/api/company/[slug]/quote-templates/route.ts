import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }  // ← CHANGED
) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    
    // Get company
    const companies = await sql`
      SELECT id, quote_templates 
      FROM companies 
      WHERE slug = ${resolvedParams.slug}  // ← CHANGED
      LIMIT 1
    `;

    if (companies.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];
    const templates = company.quote_templates || [];

    return NextResponse.json({ 
      success: true, 
      templates 
    });

  } catch (error) {
    console.error('Get quote templates error:', error);
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }  // ← CHANGED
) {
  try {
    const resolvedParams = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    
    // Get user and verify permissions
    const users = await sql`SELECT * FROM users WHERE id = ${decoded.userId} LIMIT 1`;
    const user = users[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Only owner, admin, and manager can manage templates
    if (!['owner', 'admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get company
    const companies = await sql`
      SELECT id, quote_templates 
      FROM companies 
      WHERE slug = ${resolvedParams.slug}  // ← CHANGED
      LIMIT 1
    `;

    if (companies.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const company = companies[0];
    
    // Verify user belongs to this company
    if (user.company_id !== company.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { action, template, templateId } = body;

    let currentTemplates = company.quote_templates || [];

    if (action === 'create') {
      // Add new template
      currentTemplates.push(template);
      
      await sql`
        UPDATE companies 
        SET quote_templates = ${JSON.stringify(currentTemplates)}
        WHERE id = ${company.id}
      `;

      return NextResponse.json({ 
        success: true, 
        message: 'Template created',
        templates: currentTemplates
      });
    }

    if (action === 'update') {
      // Update existing template
      const index = currentTemplates.findIndex((t: any) => t.id === template.id);
      
      if (index === -1) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      currentTemplates[index] = template;
      
      await sql`
        UPDATE companies 
        SET quote_templates = ${JSON.stringify(currentTemplates)}
        WHERE id = ${company.id}
      `;

      return NextResponse.json({ 
        success: true, 
        message: 'Template updated',
        templates: currentTemplates
      });
    }

    if (action === 'delete') {
      // Delete template
      currentTemplates = currentTemplates.filter((t: any) => t.id !== templateId);
      
      await sql`
        UPDATE companies 
        SET quote_templates = ${JSON.stringify(currentTemplates)}
        WHERE id = ${company.id}
      `;

      return NextResponse.json({ 
        success: true, 
        message: 'Template deleted',
        templates: currentTemplates
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Quote templates API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}