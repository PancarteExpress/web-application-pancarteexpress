import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, items, subtotal, tax, total, shippingAddress } = body;

    if (!email || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // ✅ Chercher une commande pending existante
    const existingOrder = await prisma.order.findFirst({
      where: {
        email,
        status: 'pending',
      },
    });

    let order;

    if (existingOrder) {
      // ✅ Mettre à jour la commande existante
      order = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          subtotal,
          tax,
          total,
          shippingAddress,
          items: {
            // Ajouter les nouveaux items
            create: items.map((item: any) => ({
              productId: parseInt(item.productId, 10),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    } else {
      // ✅ Créer une nouvelle commande
      order = await prisma.order.create({
        data: {
          email,
          subtotal,
          tax,
          total,
          shippingAddress,
          status: 'pending',
          items: {
            create: items.map((item: any) => ({
              productId: parseInt(item.productId, 10),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Erreur create-payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}