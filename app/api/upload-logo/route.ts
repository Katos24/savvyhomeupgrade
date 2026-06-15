import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try { jwt.verify(token, process.env.JWT_SECRET!); }
    catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

    const formData = await request.formData();
    const file = formData.get('logo') as File;
    const companySlug = formData.get('companySlug') as string;

    if (!file || !companySlug) {
      return NextResponse.json(
        { success: false, error: 'Missing file or company slug' },
        { status: 400 }
      );
    }

    // Convert any image format (webp, jpg, heic, etc.) to PNG
    const sharp = await import('sharp');
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const pngBuffer = await sharp.default(inputBuffer).png().toBuffer();
    // Upload PNG to Vercel Blob
const blob = await put(`logos/${companySlug}-logo.png`, pngBuffer, {
  access: 'public',
  contentType: 'image/png',
  allowOverwrite: true,
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