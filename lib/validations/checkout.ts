import { z } from 'zod';
import { createOrderSchema } from './order';

/**
 * Validation pour créer un PaymentIntent simple
 */
export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('Montant invalide'),
});

export type CreatePaymentIntentData = z.infer<typeof createPaymentIntentSchema>;

/**
 * Validation pour créer une commande avec paiement
 * Réutilise le schema de commande
 */
export const createOrderPaymentSchema = createOrderSchema;

export type CreateOrderPaymentData = z.infer<typeof createOrderPaymentSchema>;

/**
 * Validation pour envoyer email de confirmation
 */
export const sendOrderEmailSchema = z.object({
  email: z.string().email('Email invalide'),
  orderId: z.string().min(1, 'ID commande requis'),
  clientEmailHTML: z.string().min(1, 'HTML email requis'),
  adminEmailHTML: z.string().optional(),
});

export type SendOrderEmailData = z.infer<typeof sendOrderEmailSchema>;