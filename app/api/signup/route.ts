import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { CATEGORY_MAP, DEFAULT_STATUSES, ADDRESS_CONFIG } from '@/lib/formCategories';
import { sendWelcomeEmail } from '@/lib/email';
import { isReservedSlug } from '@/lib/reservedSlugs';

export async function POST(req: NextRequest) {
  try {
    const { 
      companyName, 
      slug, 
      email, 
      phone, 
      password, 
      businessType,
      ownerName,
      plan = 'starter',
    } = await req.json();

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

    if (isReservedSlug(slug)) {
      return NextResponse.json(
        { error: 'That URL is reserved. Please choose a different company name.' },
        { status: 400 }
      );
    }

    const existingCompany = await sql`
      SELECT id FROM companies WHERE slug = ${slug}
    `;

    if (existingCompany.length > 0) {
      return NextResponse.json(
        { error: 'Company URL already taken. Please choose a different name.' },
        { status: 400 }
      );
    }

    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultCategories = CATEGORY_MAP[businessType] || CATEGORY_MAP.general;
    const addressConfig = ADDRESS_CONFIG[businessType] || { show: false, required: false };

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
        address_required,
        plan_tier
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
        ${addressConfig.required},
        ${plan}
      )
      RETURNING id, slug
    `;

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

    try {
      await sendWelcomeEmail({
        userEmail: email,
        userName: ownerName,
        companyName: companyName,
        companySlug: slug,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}/dashboard`,
        formUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${slug}`,
        plan,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

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
      message: 'Account created! Complete your subscription.',
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
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