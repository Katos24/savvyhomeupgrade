import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const pathname = request.nextUrl.pathname;

  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];

  const isApiRoute = pathname.startsWith('/api/');

  // ✅ Stripe + public API bypass
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
    pathname.startsWith('/api/leads/update');
  

  const isPublicRoute = publicRoutes.some(route =>
    pathname.startsWith(route)
  );

  const isProtectedRoute =
    pathname.includes('/dashboard') ||
    pathname.includes('/admin') ||
    pathname.includes('/profile') ||
    pathname.includes('/settings');

  if (isApiRoute) {
    if (isPublicApiRoute) {
      return NextResponse.next();
    }

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