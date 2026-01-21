import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const pathname = request.nextUrl.pathname;

  // Public routes that don't need auth
  const publicRoutes = [
    '/login',
    '/forgot-password',
    '/reset-password',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Protected routes that require authentication
  const isProtectedRoute = 
    pathname.includes('/dashboard') || 
    pathname.includes('/admin');

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access login page, redirect to dashboard
  if (pathname === '/login' && token) {
    // Can't decode JWT in edge runtime, so just redirect to a generic page
    // The actual auth check will happen on the page itself
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
