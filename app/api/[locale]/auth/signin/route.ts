import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from '@/lib/auth/server/csrf';
import { signInUser } from '@/lib/auth/server/auth.service';
import { SESSION_COOKIE_CONFIG, SESSION_DURATION } from '@/lib/constants/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;

    // 1. Vérifier CSRF
    const csrfResult = await verifyCsrfToken(req);
    if (!csrfResult.valid) {
      return NextResponse.json(
        { error: csrfResult.error },
        { status: 403 }
      );
    }

    // 2. Récupérer et valider body
    const body = await req.json();

    // 3. Appeler le service
    const result = await signInUser(body, locale);

    if (!result.success) {
      return NextResponse.json(
      { 
        error: result.error || 'Erreur authentification',
        redirect: result.redirect  // ← Ajouter ici
      },
      { status: 401 }
    );
    }

    // 4. Créer response avec cookie
    const response = NextResponse.json({
      success: true,
      redirect: result.redirect,
    });

    response.cookies.set('session', result.token!, {
      ...SESSION_COOKIE_CONFIG,
      maxAge: body.rememberMe ? SESSION_DURATION.rememberMe : SESSION_DURATION.default,
    });

    response.cookies.delete('csrf-secret');

    return response;
  } catch (error) {
    console.error('[POST /api/auth/signin]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}