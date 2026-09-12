// lib/actions/orders.ts
'use server';

import { prisma } from '@/lib/prisma';

export async function cancelOrder(orderId: string) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'canceled' },
    });

    return { success: true, order };
  } catch (err) {
    console.error('[cancelOrder]', err);
    return { success: false, error: 'Erreur lors de l\'annulation' };
  }
}