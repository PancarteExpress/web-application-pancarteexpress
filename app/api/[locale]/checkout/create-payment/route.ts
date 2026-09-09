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

    // ✅ Transaction atomique
    const order = await prisma.$transaction(async (tx) => {
      // 1. Récupérer le dernier orderNumber
      const lastOrder = await tx.order.findFirst({
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true },
      });

      // 2. Calculer le prochain (avec cyclage)
      let nextNumber = (lastOrder?.orderNumber ?? 39999) + 1;
      if (nextNumber > 79999) {
        nextNumber = 40000;
      }

      // 4. Créer
      return await tx.order.create({
        data: {
          email,
          subtotal,
          tax,
          total,
          shippingAddress,
          status: 'pending',
          orderNumber: nextNumber,
          items: {
            create: items.map((item: any) => ({
              productId: parseInt(item.productId, 10),
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber, // ✅ Retourner le numéro
    });
  } catch (error) {
    console.error('Erreur create-payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}