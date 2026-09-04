import Tokens from 'csrf';
import { NextRequest, NextResponse } from 'next/server';

const tokens = new Tokens();

export async function POST(
  req: NextRequest,
  { params: params }: { params: { locale: string } }
) {
  try {
    // 1. Vérifier CSRF token
    const csrfToken = req.headers.get('X-CSRF-Token');
    const csrfSecret = req.cookies.get('csrf-secret')?.value;

    if (!csrfToken || !csrfSecret) {
      return NextResponse.json(
        { error: 'Token CSRF manquant' },
        { status: 403 }
      );
    }

    if (!tokens.verify(csrfSecret, csrfToken)) {
      return NextResponse.json(
        { error: 'Token CSRF invalide' },
        { status: 403 }
      );
    }

    // 2. Créer response
    const response = NextResponse.json({
      success: true,
      redirect: '/',
    });

    // 3. Supprimer les cookies
    response.cookies.delete('session');
    response.cookies.delete('csrf-secret');

    return response;
  } catch (error) {
    console.error('Erreur signout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}