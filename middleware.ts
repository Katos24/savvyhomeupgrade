import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token');
  const pathname = request.nextUrl.pathname;
  
  console.log('Middleware checking:', { pathname, hasToken: !!token });

  // Public routes that don't need auth
  const publicRoutes = [
    '/login',
    '/forgot-password',
    '/reset-password',
  ];

  // Check if it's an API route
  const isApiRoute = pathname.startsWith('/api/');

  // Public API routes (login, logout, etc.)
  const publicApiRoutes = [
    '/api/auth/login',
    '/api/auth/logout',  // 🔥 IMPORTANT: Allow logout without auth check
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  // Protected routes that require authentication
  const isProtectedRoute = 
    pathname.includes('/dashboard') || 
    pathname.includes('/admin');

  // For API routes, let them through if they have a token OR if they're public API routes
  if (isApiRoute) {
    if (isPublicApiRoute) {
      // Public API routes - allow without token
      return NextResponse.next();
    }
    
    if (!token) {
      // Protected API route without token - return 401
      console.log('Protected API route without token, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Has token - allow the API call through
    return NextResponse.next();
  }

  // For page routes (not API), handle redirects
  if (isProtectedRoute && !token) {
    console.log('No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🔥 REMOVED: Don't redirect logged-in users away from login
  // This allows the logout button to work properly
  // Users can manually navigate to /login if they want

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};