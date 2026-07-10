import { NextRequest, NextResponse } from 'next/server';
import { adminDb as sql } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { CATEGORY_MAP, DEFAULT_STATUSES, ADDRESS_CONFIG } from '@/lib/formCategories';
import { isReservedSlug } from '@/lib/reservedSlugs';

// ── sendWelcomeEmail intentionally removed ──
// Welcome email now fires from the Stripe webhook after payment confirms,
// so only paying customers receive it and ghost accounts don't.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
      plan = 'free',
      referred_by_code,
    } = await req.json();

    if (!companyName || !slug || !email || !password || !ownerName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Same shape check as the frontend, but this is the copy that actually
    // matters — the frontend one can be bypassed by anyone posting to this
    // route directly. Trimmed and lowercased before validating and storing
    // so "Test@Example.com " and "test@example.com" aren't treated as two
    // different accounts.
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Enter a valid email address' },
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
      SELECT id FROM users WHERE email = ${normalizedEmail}
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

const defaultFieldConfig = JSON.stringify({
  address: { enabled: addressConfig.show, required: addressConfig.required },
  file_upload: { enabled: true },
  lead_source: { enabled: true },
  preferred_date: { enabled: true },
  preferred_time: { enabled: false },
});

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
        plan_tier,
        form_field_config,
        referred_by_code
      ) VALUES (
        ${companyName},
        ${slug},
        ${normalizedEmail},
        ${phone || null},
        ${businessType},
        ${JSON.stringify(DEFAULT_STATUSES)},
        ${JSON.stringify(defaultCategories)},
        ${plan === 'free' ? 'free' : 'inactive'},
        true,
        ${addressConfig.show},
        ${addressConfig.required},
        ${plan},
        ${defaultFieldConfig}::jsonb,
        ${referred_by_code || null}
      )
      RETURNING id, slug
    `;

    if (plan === 'free') {
  await sql`
    UPDATE companies 
    SET onboarding_completed = true, onboarding_completed_at = NOW()
    WHERE id = ${newCompany.id}
  `;
}

    const [newUser] = await sql`
      INSERT INTO users (
        name,
        email,
        password,
        company_id,
        role
      ) VALUES (
        ${ownerName},
        ${normalizedEmail},
        ${hashedPassword},
        ${newCompany.id},
        'owner'
      )
      RETURNING id
    `;

    // Create sample lead for free-plan users so dashboard isn't empty
if (plan === 'free') {
  try {
    const cats = defaultCategories;
    const firstCat = Array.isArray(cats) && cats.length > 0
      ? (cats[0].label || cats[0].value || 'General')
      : 'General';

    const sampleTasks = JSON.stringify([
      { id: 't1', label: 'Call customer to confirm details', done: false },
      { id: 't2', label: 'Send quote for approval', done: false },
      { id: 't3', label: 'Schedule job date', done: false },
      { id: 't4', label: 'Complete the work', done: false },
      { id: 't5', label: 'Collect payment', done: false },
    ]);

    const sampleQuote = JSON.stringify({
      items: [
        { id: 'q1', description: 'Labor (8 hours)', quantity: 8, unitPrice: 150, amount: 1200 },
        { id: 'q2', description: 'Materials & Supplies', quantity: 1, unitPrice: 800, amount: 800 },
        { id: 'q3', description: 'Travel & Equipment', quantity: 1, unitPrice: 500, amount: 500 },
      ],
      total: 2500,
    });

    await sql`
      INSERT INTO leads (
        company_id, name, email, phone,
        category, status, description,
        address_line_1, city, zip_code,
        quote_total, quote_data, payment_status,
        assigned_to, tasks, origin, created_at
      ) VALUES (
        ${newCompany.id},
        'Sarah Johnson',
        'sarah.j@email.com',
        '5551234567',
        ${firstCat},
        'new',
        'This is a sample lead so you can see how everything works. Open it to explore tasks, quotes, scheduling, and more. Delete it whenever you''re ready.',
        '123 Main Street',
        'New York',
        '10001',
        2500.00,
        ${sampleQuote},
        'unpaid',
        'You',
        ${sampleTasks},
        'sample',
        NOW()
      )
    `;
  } catch (sampleErr) {
    console.error('Sample lead creation failed (non-blocking):', sampleErr);
  }
}

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: normalizedEmail,
        role: 'owner',
        companyId: newCompany.id,
        companySlug: newCompany.slug,
      },
  process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

// If referred by a bookkeeper, notify them and send contractor the connected email
    if (referred_by_code) {
      try {
        const bookkeeperAccounts = await sql`
          SELECT name, email FROM bookkeeper_accounts WHERE partner_code = ${referred_by_code}
        `;
        if (bookkeeperAccounts.length > 0) {
          const bk = bookkeeperAccounts[0];
          const { sendBookkeeperNewClientEmail, sendContractorReferredWelcomeEmail } = await import('@/lib/email');
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lead2project.com';
          await Promise.all([
            sendBookkeeperNewClientEmail({
              bookkeepName: bk.name,
              bookkeepEmail: bk.email,
              clientName: companyName,
              partnerCode: referred_by_code,
            }),
            sendContractorReferredWelcomeEmail({
              contractorName: ownerName,
              contractorEmail: normalizedEmail,
              bookkeeperName: bk.name,
              dashboardUrl: `${baseUrl}/${newCompany.slug}/dashboard`,
            }),
          ]);
        }
      } catch (referralEmailErr) {
        console.error('Referral emails failed (non-blocking):', referralEmailErr);
      }
    }

  if (plan === 'free' && !referred_by_code) {
      try {
        const { sendFreeWelcomeEmail } = await import('@/lib/email');
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lead2project.com';
        await sendFreeWelcomeEmail({
          userEmail: normalizedEmail,
          userName: ownerName,
          companyName,
          companySlug: newCompany.slug,
          dashboardUrl: `${baseUrl}/${newCompany.slug}/dashboard`,
          formUrl: `${baseUrl}/${newCompany.slug}`,
        });
      } catch (emailErr) {
        console.error('Welcome email failed (non-blocking):', emailErr);
      }
    }

    const response = NextResponse.json({
      success: true,
      companySlug: newCompany.slug,
      plan,
      message: plan === 'free' ? 'Account created!' : 'Account created! Complete your subscription.',
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