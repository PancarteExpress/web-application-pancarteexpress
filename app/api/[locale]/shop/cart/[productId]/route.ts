import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

type CartItem = {
  productId: number;
  quantity: number;
  price: number;
  name: string;
  name_fr: string;
  name_en: string | null;
  image_url: string | null;
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; productId: string }> }
) {
  try {
    const { productId: productIdStr } = await params;
    const productId = parseInt(productIdStr, 10);

    if (isNaN(productId)) {
      return NextResponse.json({ error: 'productId invalide' }, { status: 400 });
    }

    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }
    const userId = payload.userId as string;

    await prisma.cartItem.deleteMany({
      where: { productId, userId },
    });

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const items: CartItem[] = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name_fr,
      name_fr: item.product.name_fr,
      name_en: item.product.name_en,
      image_url: item.product.image_url,
    }));

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('[DELETE /cart/[productId]]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}