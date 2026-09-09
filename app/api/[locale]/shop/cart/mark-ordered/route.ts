import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

export async function PATCH(
  req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const userId = payload.userId as string;

    // Marquer tous les items actifs comme commandés
    await prisma.cartItem.updateMany({
      where: { userId, isInCart: true },
      data: { isInCart: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /mark-ordered]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}