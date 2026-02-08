import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface SessionData {
  userId: number;
  email: string;
  role: string;
  companyId: number;
  companySlug: string;
  iat?: number;
  exp?: number;
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }
    
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'your-secret-key-change-this'
    ) as SessionData;
    
    // Check if token is expired (extra safety check)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn('⚠️ Expired token detected');
      return null;
    }

    return decoded;
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('⚠️ Token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('⚠️ Invalid token');
    } else {
      console.error('❌ Auth error:', error);
    }
    return null;
  }
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  
  if (!session) {
    throw new Error('Unauthorized');
  }
  
  return session;
}

export async function requireRole(allowedRoles: string[]): Promise<SessionData> {
  const session = await requireAuth();
  
  if (!allowedRoles.includes(session.role)) {
    throw new Error('Forbidden');
  }
  
  return session;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
