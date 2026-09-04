import { auth } from '@/lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Routes publiques (accessible sans authentification)
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/',
  ];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Si pas de session et route privée → redirect signin
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // Si session existe
  if (session) {
    // SuperAdmin
    if (session.user?.role === 'superAdmin') {
      // Peut accéder /admin/* et /dashboard/*
      if (pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }

    // User normal ou groupAdmin
    if (session.user?.role === 'user' || session.user?.role === 'groupAdmin') {
      // Peut accéder /dashboard/* mais pas /admin/*
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    // Si sur signin/signup alors connecté → redirect dashboard
    if (pathname.startsWith('/auth/signin') || pathname.startsWith('/auth/signup')) {
      if (session.user?.role === 'superAdmin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

// Matcher : quelles routes le middleware protège
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};