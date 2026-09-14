import { prisma } from '@/lib/prisma';
import { CartItemResponse, Product, Category } from '@/lib/types/shop';

/**
 * Récupérer tous les produits actifs
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: { is_active: true, deletedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    return products as Product[];
  } catch (error) {
    console.error('[getProducts]', error);
    throw new Error('Erreur lors du chargement des produits');
  }
}

/**
 * Récupérer toutes les catégories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { name: 'asc' },
    });

    return categories as Category[];
  } catch (error) {
    console.error('[getCategories]', error);
    throw new Error('Erreur lors du chargement des catégories');
  }
}

/**
 * Récupérer le panier de l'utilisateur
 */
export async function getCart(userId: string): Promise<CartItemResponse[]> {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId, isInCart: true },
      include: { product: true },
    });

    return cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
      name_fr: item.product.name_fr,
      name_en: item.product.name_en,
      image_url: item.product.image_url,
    }));
  } catch (error) {
    console.error('[getCart]', error);
    throw new Error('Erreur lors du chargement du panier');
  }
}

/**
 * Ajouter un produit au panier
 */
export async function addToCart(
  userId: string,
  productId: number,
  quantity: number
): Promise<CartItemResponse[]> {
  try {
    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Produit non trouvé');
    }

    // Chercher un CartItem existant
    const existing = await prisma.cartItem.findUnique({
      where: { productId_userId: { productId, userId } },
    });

    if (existing) {
      // Mettre à jour la quantité et remettre actif
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          isInCart: true,
        },
      });
    } else {
      // Créer un nouveau CartItem
      await prisma.cartItem.create({
        data: {
          productId,
          userId,
          quantity,
          isInCart: true,
        },
      });
    }

    // Retourner le panier mis à jour
    return await getCart(userId);
  } catch (error) {
    console.error('[addToCart]', error);
    throw error instanceof Error 
      ? error 
      : new Error('Erreur lors de l\'ajout au panier');
  }
}

/**
 * Supprimer un produit du panier
 */
export async function removeFromCart(
  userId: string,
  productId: number
): Promise<CartItemResponse[]> {
  try {
    await prisma.cartItem.deleteMany({
      where: { productId, userId },
    });

    // Retourner le panier mis à jour
    return await getCart(userId);
  } catch (error) {
    console.error('[removeFromCart]', error);
    throw new Error('Erreur lors de la suppression du produit');
  }
}

/**
 * Marquer tous les items du panier comme commandés
 */
export async function markCartAsOrdered(userId: string): Promise<boolean> {
  try {
    await prisma.cartItem.updateMany({
      where: { userId, isInCart: true },
      data: { isInCart: false },
    });

    return true;
  } catch (error) {
    console.error('[markCartAsOrdered]', error);
    throw new Error('Erreur lors de la validation du panier');
  }
}