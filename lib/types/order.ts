import { Prisma } from '@prisma/client';

/**
 * Enum des statuts de commande
 */
export enum OrderStatus {
  PENDING = 'pending',
  DONE = 'done',
  CANCELED = 'canceled',
}

/**
 * Types Prisma réexportés
 */
export type Order = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export type OrderWithoutItems = Omit<Order, 'items'>;

export type OrderItem = Prisma.OrderItemGetPayload<{
  include: { product: true };
}>;

export type OrderItemWithoutProduct = Omit<OrderItem, 'product'>;

export type Product = Prisma.ProductGetPayload<{}>;

/**
 * Statistiques des commandes (pour le dashboard)
 */
export type OrderStats = {
  pending: number;
  done: number;
  canceled: number;
};

/**
 * Réponse pour lister les commandes
 */
export type OrderListResponse = {
  orders: Order[];
  stats: OrderStats;
};

/**
 * Input pour créer/mettre à jour une commande
 */
export type CreateOrderInput = {
  email: string;
  shippingAddress: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
};