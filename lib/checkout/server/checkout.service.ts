import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail';
import { Order } from '@/lib/types/order';

// Initialiser Stripe une seule fois
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

/**
 * Créer un PaymentIntent Stripe
 */
export async function createPaymentIntent(
  amount: number,
  metadata?: Record<string, string>
): Promise<{ success: boolean; clientSecret?: string; error?: string }> {
  try {
    if (amount <= 0) {
      return {
        success: false,
        error: 'Montant invalide',
      };
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en cents
      currency: 'cad',
      metadata: metadata || {},
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
    };
  } catch (error) {
    console.error('[createPaymentIntent]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur Stripe',
    };
  }
}

/**
 * Créer une commande dans la BD
 */
export async function createOrder(
  email: string,
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
  }>,
  subtotal: number,
  tax: number,
  total: number,
  shippingAddress: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
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

      // 3. Créer la commande avec les items
      return await tx.order.create({
        data: {
          email: email.toLowerCase(),
          subtotal,
          tax,
          total,
          shippingAddress,
          status: 'pending',
          orderNumber: nextNumber,
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });
    });

    return {
      success: true,
      order: order as Order,
    };
  } catch (error) {
    console.error('[createOrder]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur création commande',
    };
  }
}

/**
 * Envoyer email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderId: string,
  clientEmailHTML: string,
  adminEmailHTML?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email || !orderId || !clientEmailHTML) {
      return {
        success: false,
        error: 'Données manquantes',
      };
    }

    // Envoyer au client
    const clientResult = await sendEmail({
      to: email,
      subject: `Confirmation de commande #${orderId}`,
      html: clientEmailHTML,
    });

    if (!clientResult.success) {
      return {
        success: false,
        error: 'Erreur envoi email client',
      };
    }

    // Attendre un peu avant d'envoyer à l'admin
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Envoyer à l'admin si fourni
    if (adminEmailHTML) {
      await sendEmail({
        to: process.env.EMAIL_FROM || '',
        subject: `Nouvelle commande #${orderId}`,
        html: adminEmailHTML,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('[sendOrderConfirmationEmail]', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur envoi email',
    };
  }
}