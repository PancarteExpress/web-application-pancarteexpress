import { Prisma } from '@prisma/client';

/**
 * Types Prisma réexportés
 */
export type Product = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

export type CartItem = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

export type Category = Prisma.CategoriesGetPayload<{}>;

/**
 * CartItem formaté pour la réponse API
 */
export type CartItemResponse = {
  productId: number;
  quantity: number;
  price: number;
  name_fr: string;
  name_en: string | null;
  image_url: string | null;
};

/**
 * Réponse pour lister le panier
 */
export type CartListResponse = {
  success: boolean;
  items: CartItemResponse[];
};

/**
 * Input pour ajouter au panier
 */
export type AddToCartInput = {
  productId: number;
  quantity: number;
};