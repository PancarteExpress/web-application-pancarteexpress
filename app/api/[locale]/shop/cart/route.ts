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

export async function GET(
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
    console.error('[GET /cart]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(
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

    const body = await req.json();
    let { productId, quantity } = body;

    // ✅ Normaliser productId en number
    productId = typeof productId === 'string' ? parseInt(productId, 10) : productId;

    if (!productId || !quantity || isNaN(productId)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

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
    console.error('[POST /cart]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}