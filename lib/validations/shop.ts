import { z } from 'zod';

/**
 * Validation pour ajouter au panier
 */
export const addToCartSchema = z.object({
  productId: z.number().int().positive('ID produit invalide'),
  quantity: z.number().int().min(1, 'Quantité minimum: 1'),
});

export type AddToCartData = z.infer<typeof addToCartSchema>;

/**
 * Validation pour productId dans l'URL
 */
export const productIdSchema = z.object({
  productId: z.coerce.number().int().positive('ID produit invalide'),
});

export type ProductIdData = z.infer<typeof productIdSchema>;