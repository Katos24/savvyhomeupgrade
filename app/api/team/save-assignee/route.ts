import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const companyId = decoded.companyId;
    if (!companyId) return NextResponse.json({ success: false }, { status: 401 });

    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ success: false }, { status: 400 });

    const sql = neon(process.env.DATABASE_URL!);

    // Append name if not already in the array
    await sql`
      UPDATE companies
      SET saved_assignees = (
        CASE 
          WHEN saved_assignees @> ${JSON.stringify([name.trim()])}::jsonb 
          THEN saved_assignees
          ELSE saved_assignees || ${JSON.stringify([name.trim()])}::jsonb
        END
      )
      WHERE id = ${companyId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('save-assignee error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}