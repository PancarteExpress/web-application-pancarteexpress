import { prisma } from '@/lib/prisma';
import { Order, OrderStatus } from '@/lib/types/order';
import { ORDER_MESSAGES } from '@/lib/constants/order';

/**
 * Récupérer les commandes de l'utilisateur
 */
export async function getOrders(userEmail: string): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      where: { email: userEmail.toLowerCase() },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders as Order[];
  } catch (error) {
    console.error('[getOrders]', error);
    throw new Error(ORDER_MESSAGES.SERVER_ERROR);
  }
}

/**
 * Marquer une commande comme payée
 * ✅ Vérification de propriété incluse
 */
export async function markOrderPaid(
  orderId: string,
  userEmail: string,
  locale: string = 'fr'
): Promise<{ success: boolean; error?: string; order?: Order }> {
  try {
    // 1. Vérifier que la commande existe ET appartient à l'utilisateur
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: ORDER_MESSAGES.NOT_FOUND,
      };
    }

    // ✅ SÉCURITÉ: Vérifier que la commande appartient à l'utilisateur
    if (order.email !== userEmail.toLowerCase()) {
      console.warn(`[markOrderPaid] Tentative accès non autorisé: ${userEmail} sur ${order.email}`);
      return {
        success: false,
        error: locale === 'fr' ? 'Accès refusé' : 'Access denied',
      };
    }

    // 2. Vérifier que la commande n'est pas déjà payée
    if (order.isPaid) {
      return {
        success: false,
        error: ORDER_MESSAGES.ALREADY_PAID,
      };
    }

    // 3. Mettre à jour
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return {
      success: true,
      order: updatedOrder as Order,
    };
  } catch (error) {
    console.error('[markOrderPaid]', error);
    return {
      success: false,
      error: ORDER_MESSAGES.SERVER_ERROR,
    };
  }
}

/**
 * Annuler une commande
 * ✅ Vérification de propriété + statut incluses
 */
export async function cancelOrder(
  orderId: string,
  userEmail: string,
  locale: string = 'fr'
): Promise<{ success: boolean; error?: string; order?: Order }> {
  try {
    // 1. Vérifier que la commande existe ET appartient à l'utilisateur
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        error: ORDER_MESSAGES.NOT_FOUND,
      };
    }

    // ✅ SÉCURITÉ: Vérifier que la commande appartient à l'utilisateur
    if (order.email !== userEmail.toLowerCase()) {
      console.warn(`[cancelOrder] Tentative accès non autorisé: ${userEmail} sur ${order.email}`);
      return {
        success: false,
        error: locale === 'fr' ? 'Accès refusé' : 'Access denied',
      };
    }

    // 2. Vérifier que la commande peut être annulée (pas déjà done/canceled)
    if (order.status === OrderStatus.DONE || order.status === OrderStatus.CANCELED) {
      return {
        success: false,
        error: ORDER_MESSAGES.CANNOT_CANCEL,
      };
    }

    // 3. Mettre à jour
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELED },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return {
      success: true,
      order: updatedOrder as Order,
    };
  } catch (error) {
    console.error('[cancelOrder]', error);
    return {
      success: false,
      error: ORDER_MESSAGES.SERVER_ERROR,
    };
  }
}