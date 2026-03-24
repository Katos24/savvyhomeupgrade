import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const pathname = request.nextUrl.pathname;

  const isApiRoute = pathname.startsWith('/api/');

  const isPublicApiRoute =
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/api/signup') ||
    pathname.startsWith('/api/stripe/webhook') ||
    pathname.startsWith('/api/webhooks/stripe') ||
    pathname.startsWith('/api/cron/') ||
    pathname.startsWith('/api/quotes/respond') ||
    pathname.startsWith('/api/leads/preview-email') ||
    pathname.startsWith('/api/subscription/status') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/blob-upload') ||
    pathname.startsWith('/api/get-upload-url') ||
    pathname.startsWith('/api/onboarding') ||
    pathname.startsWith('/api/db');

  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/accept-invite') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/subscribe') ||
    pathname.startsWith('/success') ||
    pathname.startsWith('/demo') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/contractor-software') ||
    pathname.startsWith('/solutions') ||
    pathname.startsWith('/onboarding');

  const isProtectedRoute =
    pathname.includes('/dashboard') ||
    pathname.includes('/admin') ||
    pathname.includes('/profile') ||
    pathname.includes('/settings') ||
    pathname.includes('/outbox');

  if (isApiRoute) {
    if (isPublicApiRoute) return NextResponse.next();
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};