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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; productId: string }> }
) {
  try {
    const { productId } = await params;

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

    // Supprimer l'item du panier
    await prisma.cartItem.deleteMany({
      where: { productId, userId },
    });

    // Retourner le panier mis à jour
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const items = (cartItems as CartItemWithProduct[]).map((item) => ({
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
    console.error('Erreur DELETE cart:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}