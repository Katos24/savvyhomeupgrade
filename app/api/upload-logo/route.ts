// Save as: app/api/upload-logo/route.ts

import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const companySlug = formData.get('companySlug') as string;

    if (!file || !companySlug) {
      return NextResponse.json(
        { success: false, error: 'Missing file or company slug' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`logos/${companySlug}-${file.name}`, file, {
  access: 'public',
  allowOverwrite: true, // This tells Vercel: "I know it exists, do it anyway"
});

    // Update database with logo URL
    const sql = neon(process.env.DATABASE_URL!);
    await sql`
      UPDATE companies 
      SET logo_url = ${blob.url}
      WHERE slug = ${companySlug}
    `;

    return NextResponse.json({
      success: true,
      logoUrl: blob.url,
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
}