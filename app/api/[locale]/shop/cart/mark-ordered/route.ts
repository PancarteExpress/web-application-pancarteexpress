import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';
import { markCartAsOrdered } from '@/lib/shop/server/shop.service';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
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

    // Appeler le service
    await markCartAsOrdered(payload.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PATCH /api/shop/cart/mark-ordered]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}