import Tokens from 'csrf';
import { NextRequest, NextResponse } from 'next/server';

const tokens = new Tokens();

export async function GET(_req: NextRequest, { params: _params }: { params: Promise<{ locale: string }> } ) {
  try {
    const secret = tokens.secretSync();
    const token = tokens.create(secret);

    const response = NextResponse.json({ token });

    response.cookies.set('csrf-secret', secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur génération CSRF:', error);
    return NextResponse.json(
      { error: 'Erreur génération token' },
      { status: 500 }
    );
  }
}