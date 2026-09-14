import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from '@/lib/auth/server/csrf';
import { verifyEmailCode } from '@/lib/auth/server/auth.service';

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
    const { email, code } = body;

    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      );
    }

    // 3. Appeler le service
    const result = await verifyEmailCode(email, code, locale);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // 4. Créer response
    const response = NextResponse.json({
      success: true,
      message: result.message,
      redirect: result.redirect,
    });

    response.cookies.delete('csrf-secret');

    return response;
  } catch (error) {
    console.error('[POST /api/auth/verify-email]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}