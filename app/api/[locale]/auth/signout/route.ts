import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfToken } from '@/lib/auth/server/csrf';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    // Vérifier CSRF
    const csrfResult = await verifyCsrfToken(req);
    if (!csrfResult.valid) {
      return NextResponse.json(
        { error: csrfResult.error },
        { status: 403 }
      );
    }

    // Créer response et supprimer cookies
    const response = NextResponse.json({
      success: true,
      redirect: '/',
    });

    response.cookies.delete('session');
    response.cookies.delete('csrf-secret');

    return response;
  } catch (error) {
    console.error('[POST /api/auth/signout]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}