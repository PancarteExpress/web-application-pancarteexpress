import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';
import { removeFromCart } from '@/lib/shop/server/shop.service';
import { productIdSchema } from '@/lib/validations/shop';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; productId: string }> }
) {
  try {
    const { productId: productIdStr } = await params;

    // Valider productId
    const validatedId = productIdSchema.parse({ productId: productIdStr });

    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Appeler le service
    const items = await removeFromCart(payload.userId, validatedId.productId);

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('[DELETE /api/shop/cart/[productId]]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}