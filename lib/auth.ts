import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this') as any;
    return decoded;
  } catch (error) {
    return null;
  }
}
