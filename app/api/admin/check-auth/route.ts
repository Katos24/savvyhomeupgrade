import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // Check for admin-token cookie (from /admin/login)
    const adminToken = cookieStore.get('admin-token');
    
    if (adminToken && adminToken.value === 'authenticated') {
      return NextResponse.json({ authenticated: true });
    }

    // ALSO check if they have a company token with super_admin role
    const authToken = cookieStore.get('auth-token');
    
    if (authToken) {
      try {
        const decoded: any = jwt.verify(authToken.value, process.env.JWT_SECRET || 'your-secret-key-change-this');
        
        // Only allow super_admin role
        if (decoded.role === 'super_admin') {
          return NextResponse.json({ authenticated: true });
        }
      } catch (error) {
        // Invalid token, continue to return false
      }
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}