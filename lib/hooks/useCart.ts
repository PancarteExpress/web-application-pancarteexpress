'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from '@/lib/auth/useSession';

export type CartItem = {
  productId: number;
  quantity: number;
  price: number;
  name: string;
  name_fr: string;
  name_en: string | null;
  image_url: string | null;
};

const CART_STORAGE_KEY = 'cart';

export function useCart() {
  const locale = useLocale();
  const { session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        if (session.authenticated) {
          localStorage.removeItem(CART_STORAGE_KEY);
          await loadCartFromDB();
        } else {
          const stored = localStorage.getItem(CART_STORAGE_KEY);
          setCart(stored ? JSON.parse(stored) : []);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur init panier';
        setError(msg);
        console.error('[useCart init]', err);
        setCart([]); 
      }
    };

    init();
  }, [session.authenticated, locale]);

  // Charger le panier depuis la BD
  const loadCartFromDB = async () => {
    try {
      const res = await fetch(`/api/${locale}/shop/cart`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setCart(data.items || []);
      }
    } catch (err) {
      console.error('[loadCartFromDB]', err);
      throw err;
    }
  };

  const addToCart = useCallback(
    async (
      productId: string | number,
      quantity: number,
      price: number,
      name: string,
      name_fr: string,
      name_en: string | null,
      image_url: string | null
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const productIdNum = typeof productId === 'string' 
          ? parseInt(productId, 10) 
          : productId;

        if (session.authenticated) {
          const res = await fetch(`/api/${locale}/shop/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: productIdNum, quantity }),
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Erreur ajout');
          }

          const data = await res.json();
          if (data.success) {
            setCart(data.items || []);
          }
        } else {
          setCart(prevCart => {
            const existing = prevCart.find(item => item.productId === productIdNum);
            let updated: CartItem[];

            if (existing) {
              updated = prevCart.map(item =>
                item.productId === productIdNum
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
            } else {
              updated = [...prevCart, { 
                productId: productIdNum, 
                quantity, 
                price, 
                name, 
                name_fr, 
                name_en, 
                image_url 
              }];
            }

            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur ajout panier';
        setError(msg);
        console.error('[addToCart]', err);
      } finally {
        setIsLoading(false);
      }
    },
    [session.authenticated, locale]
  );

  const removeFromCart = useCallback(
    async (productId: string | number) => {
      setIsLoading(true);
      setError(null);
      try {
        const productIdNum = typeof productId === 'string' 
          ? parseInt(productId, 10) 
          : productId;

        if (session.authenticated) {
          const res = await fetch(`/api/${locale}/shop/cart/${productIdNum}`, {
            method: 'DELETE',
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Erreur suppression');
          }

          const data = await res.json();
          if (data.success) {
            setCart(data.items || []);
          }
        } else {
          setCart(prevCart => {
            const updated = prevCart.filter(item => item.productId !== productIdNum);
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur suppression';
        setError(msg);
        console.error('[removeFromCart]', err);
      } finally {
        setIsLoading(false);
      }
    },
    [session.authenticated, locale]
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    isLoading,
    error,
  };
}