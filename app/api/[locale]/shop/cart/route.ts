import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';
import { getCart, addToCart } from '@/lib/shop/server/shop.service';
import { addToCartSchema } from '@/lib/validations/shop';

export async function GET(
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

    const items = await getCart(payload.userId);

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('[GET /api/shop/cart]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const body = await req.json();

    // Valider avec Zod
    const validatedInput = addToCartSchema.parse(body);

    // Appeler le service
    const items = await addToCart(
      payload.userId,
      validatedInput.productId,
      validatedInput.quantity
    );

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('[POST /api/shop/cart]', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: msg },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}