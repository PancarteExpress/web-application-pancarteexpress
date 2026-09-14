import { z } from 'zod';
import { OrderStatus } from '@/lib/types/order';

/**
 * Validation pour un item de commande
 */
export const orderItemSchema = z.object({
  productId: z.number().int().positive('ID produit invalide'),
  quantity: z.number().int().min(1, 'Quantité minimum: 1'),
  price: z.number().positive('Prix invalide'),
});

/**
 * Validation pour créer une commande
 */
export const createOrderSchema = z.object({
  email: z.string().email('Email invalide'),
  shippingAddress: z.string().min(1, 'Adresse de livraison requise'),
  items: z.array(orderItemSchema).min(1, 'Au moins un article requis'),
  subtotal: z.number().positive('Subtotal invalide'),
  tax: z.number().nonnegative('Taxe invalide'),
  total: z.number().positive('Total invalide'),
});

export type CreateOrderData = z.infer<typeof createOrderSchema>;

/**
 * Validation pour marquer une commande comme payée
 */
export const markOrderPaidSchema = z.object({
  orderId: z.string().min(1, 'ID commande requis'),
});

/**
 * Validation pour annuler une commande
 */
export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, 'ID commande requis'),
});

/**
 * Validation pour mettre à jour le statut
 */
export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'ID commande requis'),
  status: z.enum([OrderStatus.PENDING, OrderStatus.DONE, OrderStatus.CANCELED], {
    message: 'Statut invalide',
  }),
});
export type UpdateOrderStatusData = z.infer<typeof updateOrderStatusSchema>;

/**
 * Validation pour orderId dans l'URL
 */
export const orderIdSchema = z.object({
  orderId: z.string().min(1, 'ID commande requis'),
});

export type OrderIdData = z.infer<typeof orderIdSchema>;