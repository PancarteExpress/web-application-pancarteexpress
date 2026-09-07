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

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    // Vérifier JWT
    const token = req.cookies.get('session')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }
    const userId = payload.userId as string;

    const body = await req.json();
    const { cartItems } = body; // Array de { productId, quantity }

    if (!Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: 'cartItems doit être un array' },
        { status: 400 }
      );
    }

    // Fusionner le panier localStorage avec la BD
    for (const item of cartItems) {
      const { productId, quantity } = item;
      const productIdNum = parseInt(productId, 10); // ← Convertir en number

      if (!productIdNum || !quantity) continue;

      const existing = await prisma.cartItem.findUnique({
        where: { productId_userId: { productId: productIdNum, userId } }, // ← Utilise productIdNum
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: { productId: productIdNum, userId, quantity }, // ← Utilise productIdNum
        });
      }
    }

    // Retourner le panier complet
    const allItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const items = allItems.map((item): CartItem => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name_fr,
      name_fr: item.product.name_fr,
      name_en: item.product.name_en,
      image_url: item.product.image_url,
    }));

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('Erreur sync cart:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}