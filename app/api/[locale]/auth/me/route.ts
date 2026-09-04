import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';

export async function GET(
  req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = await verifyJWT(token);

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      userId: session.userId,
      email: session.email,
      role: session.role,
      groupId: session.groupId,
    });
  } catch (error) {
    console.error('Erreur vérification session:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}