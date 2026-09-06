import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Setter le cookie de session
    const response = NextResponse.json({
      success: true,
      message: 'Session créée',
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24h
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Erreur signup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}