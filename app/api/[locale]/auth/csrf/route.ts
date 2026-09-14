import Tokens from 'csrf';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_CONFIG } from '@/lib/constants/auth';

const tokens = new Tokens();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);

    const response = NextResponse.json({ token });

    // Utiliser config centralisée pour le CSRF cookie
    response.cookies.set('csrf-secret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 heure
    });

    return response;
  } catch (error) {
    console.error('[GET /api/auth/csrf]', error);
    return NextResponse.json(
      { error: 'Erreur génération token' },
      { status: 500 }
    );
  }
}