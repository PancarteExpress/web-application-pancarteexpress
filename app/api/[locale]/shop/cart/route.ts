import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

type CartItemWithProduct = {
  productId: number;
  quantity: number;
  product: {
    price: number;
    name_fr: string;
    name_en: string | null;
  };
};

export async function GET(
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

    // Récupérer le panier
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      name: item.product.name_fr, // ← Utilise name_fr
    }));

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('Erreur GET cart:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

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
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'productId et quantity requis' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Ajouter ou mettre à jour le panier
    const existing = await prisma.cartItem.findUnique({
      where: { productId_userId: { productId, userId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { productId, userId, quantity },
      });
    }

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
    console.error('Erreur POST cart:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}