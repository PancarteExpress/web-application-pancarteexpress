import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Extraire la locale du path
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?:\/|$)/, '/');
  const locale = pathname.split('/')[1];

  // Routes publiques (accessible sans session)
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/verify-email',
    '/',
    '/service-request',
    '/store',
  ];

  const isPublicRoute = publicRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  // Récupérer le JWT du cookie
  const token = req.cookies.get('session')?.value;

  // Vérifier la validité du JWT
  let session = null;
  if (token) {
    session = await verifyJWT(token);
    
    // Si JWT invalide, supprimer le cookie
    if (!session) {
      const response = NextResponse.next();
      response.cookies.delete('session');
      return response;
    }
  }

  // Si pas de session et route privée → redirect signin
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL(`/${locale}/auth/signin`, req.url));
  }

  // Si session existe
  if (session) {
    // SuperAdmin : peut aller /admin/* uniquement
    if (session.role === 'superAdmin') {
      if (!pathnameWithoutLocale.startsWith('/admin')) {
        return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
      }
    }

    // User normal ou groupAdmin : peuvent aller /dashboard/* mais pas /admin/*
    if (session.role === 'user' || session.role === 'groupAdmin') {
      if (pathnameWithoutLocale.startsWith('/admin')) {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
      }
    }

    // Si déjà connecté et sur signin/signup → redirect dashboard
    if (pathnameWithoutLocale.startsWith('/auth/signin') || 
        pathnameWithoutLocale.startsWith('/auth/signup')) {
      if (session.role === 'superAdmin') {
        return NextResponse.redirect(new URL(`/${locale}/admin/dashboard`, req.url));
      }
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|static|public).*)',
  ],
};