'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useCart } from './useCart';
import type { Product } from '@/lib/types/shop';

export interface UseShopState {
  products: Product[];
  categories: any[];
  selected: string;
  addedItems: number[];
  isHydrated: boolean;
  isLoading: boolean;
}

export interface UseShopActions {
  handleSelect: (key: string) => void;
  handleAddToCart: (product: Product) => Promise<void>;
}

export function useShop(): [UseShopState, UseShopActions] {
  const locale = useLocale();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('all');
  const [addedItems, setAddedItems] = useState<number[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    const cachedProducts = localStorage.getItem('products');
    const cachedCategories = localStorage.getItem('categories');

    if (cachedProducts && cachedCategories) {
      setProducts(JSON.parse(cachedProducts));
      setCategories(JSON.parse(cachedCategories));
    }

    Promise.all([
      fetch(`/api/${locale}/shop/products`).then((res) => res.json()),
      fetch(`/api/${locale}/shop/categories`).then((res) => res.json()),
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);

        const categoriesArray = Array.isArray(categoriesData)
          ? categoriesData
          : Object.entries(categoriesData || {}).map(([key, label]) => ({
              id: key,
              slug: key,
              name: label,
            }));

        setCategories(categoriesArray);
        localStorage.setItem('products', JSON.stringify(productsData));
        localStorage.setItem('categories', JSON.stringify(categoriesArray));
      })
      .catch((err) => {
        console.error('[useShop] Erreur:', err);
      });
  }, [locale]);

  const handleSelect = useCallback((key: string) => {
    setSelected(key);
  }, []);

  // ✅ MODIFIÉ: Passer tous les 6 paramètres requis
  const handleAddToCart = useCallback(
    async (product: Product) => {
      try {
        setIsLoading(true);
        
        const price = typeof product.price === 'string' 
          ? parseFloat(product.price) 
          : Number(product.price);

        await addToCart(
          product.id,
          1,
          price,
          product.name_fr,
          product.name_en || null,
          product.image_url || null
        );

        setAddedItems((prev) => [...prev, product.id]);
        setTimeout(() => {
          setAddedItems((prev) => prev.filter((id) => id !== product.id));
        }, 500);
      } catch (err) {
        console.error('[useShop] Erreur ajout panier:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [addToCart]
  );

  const state: UseShopState = {
    products,
    categories,
    selected,
    addedItems,
    isHydrated,
    isLoading,
  };

  const actions: UseShopActions = {
    handleSelect,
    handleAddToCart,
  };

  return [state, actions];
}