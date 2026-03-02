import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const pathname = request.nextUrl.pathname;

  console.log('Middleware checking:', { pathname, hasToken: !!token });

  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ];

  const isApiRoute = pathname.startsWith('/api/');

  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/signup',
    '/api/stripe/webhook',
    '/api/cron/check-trials',
    '/api/cron/send-reminders',
    '/api/quotes/respond',

    '/api/upload',
    '/api/leads/preview-email',

  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/api/cron/');

  console.log('DEBUG:', { 
    pathname, 
    isApiRoute, 
    isPublicApiRoute,
    matchesCron: pathname.startsWith('/api/cron/')
  });

  const isProtectedRoute =
    pathname.includes('/dashboard') ||
    pathname.includes('/admin');

  if (isApiRoute) {
    if (isPublicApiRoute) {
      console.log('Public API route - allowing through');
      return NextResponse.next();
    }

    if (!token) {
      console.log('Protected API route without token, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (isProtectedRoute && !token) {
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
