import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

type CartItemWithProduct = {
  productId: string;
  quantity: number;
  product: {
    price: number;
    name: string;
  };
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

      if (!productId || !quantity) continue;

      const existing = await prisma.cartItem.findUnique({
        where: { productId_userId: { productId, userId } },
      });

      if (existing) {
        // Si existe déjà en BD, ajouter la quantité
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        });
      } else {
        // Créer un nouvel item
        await prisma.cartItem.create({
          data: { productId, userId, quantity },
        });
      }
    }

    // Retourner le panier complet
    const allItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const items = (allItems as CartItemWithProduct[]).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name,
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