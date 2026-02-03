import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { CATEGORY_MAP, DEFAULT_STATUSES, ADDRESS_CONFIG } from '@/lib/formCategories';
import { sendWelcomeEmail } from '@/lib/email';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(req: NextRequest) {
  try {
    const { 
      companyName, 
      slug, 
      email, 
      phone, 
      password, 
      businessType,
      ownerName 
    } = await req.json();

    // Validation
    if (!companyName || !slug || !email || !password || !ownerName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCompany = await sql`
      SELECT id FROM companies WHERE slug = ${slug}
    `;

    if (existingCompany.length > 0) {
      return NextResponse.json(
        { error: 'Company URL already taken. Please choose a different name.' },
        { status: 400 }
      );
    }

    // Check if email already exists in users table
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password for user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default categories for business type
    const defaultCategories = CATEGORY_MAP[businessType] || CATEGORY_MAP.general;

    // Get address config for business type
    const addressConfig = ADDRESS_CONFIG[businessType] || { show: false, required: false };

    // Create company - NO TRIAL YET
    const [newCompany] = await sql`
      INSERT INTO companies (
        name,
        slug,
        email,
        phone,
        business_type,
        status_options,
        form_categories,
        subscription_status,
        email_notifications_enabled,
        address_enabled,
        address_required
      ) VALUES (
        ${companyName},
        ${slug},
        ${email},
        ${phone || null},
        ${businessType},
        ${JSON.stringify(DEFAULT_STATUSES)},
        ${JSON.stringify(defaultCategories)},
        'inactive',
        true,
        ${addressConfig.show},
        ${addressConfig.required}
      )
      RETURNING id, slug
    `;

    // Create owner user
    const [newUser] = await sql`
      INSERT INTO users (
        name,
        email,
        password,
        company_id,
        role
      ) VALUES (
        ${ownerName},
        ${email},
        ${hashedPassword},
        ${newCompany.id},
        'owner'
      )
      RETURNING id
    `;

// After creating user, BEFORE creating JWT token
try {
  await sendWelcomeEmail({
    userEmail: email,
    userName: ownerName,
    companyName: companyName,
    subscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe`
  });
} catch (emailError) {
  console.error('Failed to send welcome email:', emailError);
  // Don't block signup if email fails
}

    // Create JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: email,
        role: 'owner',
        companyId: newCompany.id,
        companySlug: newCompany.slug,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      companySlug: newCompany.slug,
      message: 'Account created! Complete your subscription.'
    });

    // Set auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}