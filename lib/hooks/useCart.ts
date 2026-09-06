'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from '@/lib/auth/useSession';

export type CartItem = {
  productId: string;
  quantity: number;
  price: number;
  name: string;
};

export function useCart() {
  const locale = useLocale();
  const { session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session.authenticated) {
      // L'utilisateur vient de se connecter
      // Synchroniser le panier localStorage avec la BD
      syncCartOnLogin();
    } else {
      // Charger depuis localStorage
      const stored = localStorage.getItem('cart');
      setCart(stored ? JSON.parse(stored) : []);
    }
  }, [session.authenticated]);

  const syncCartOnLogin = async () => {
    try {
      const stored = localStorage.getItem('cart');
      const localCart = stored ? JSON.parse(stored) : [];

      if (localCart.length > 0) {
        // Envoyer le panier localStorage à la BD
        const res = await fetch(`/api/${locale}/shop/cart/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItems: localCart }),
        });

        const data = await res.json();
        if (data.success) {
          setCart(data.items || []);
          // Effacer localStorage
          localStorage.removeItem('cart');
        }
      } else {
        // Charger directement depuis la BD
        const res = await fetch(`/api/${locale}/shop/cart`);
        const data = await res.json();
        if (data.success) {
          setCart(data.items || []);
        }
      }
    } catch (err) {
      console.error('Erreur sync panier:', err);
    }
  };

  const addToCart = useCallback(
    async (productId: string, quantity: number, price: number, name: string) => {
      setIsLoading(true);
      try {
        if (session.authenticated) {
          // Ajouter à la BD
          const res = await fetch(`/api/${locale}/shop/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
          });
          const data = await res.json();
          if (data.success) {
            setCart(data.items || []);
          }
        } else {
          // Ajouter à localStorage
          const existing = cart.find((item) => item.productId === productId);
          let updated;
          if (existing) {
            updated = cart.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            updated = [...cart, { productId, quantity, price, name }];
          }
          setCart(updated);
          localStorage.setItem('cart', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Erreur ajout panier:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [session.authenticated, locale, cart]
  );

  const removeFromCart = useCallback(
    async (productId: string) => {
      setIsLoading(true);
      try {
        if (session.authenticated) {
          // Supprimer de la BD
          const res = await fetch(`/api/${locale}/shop/cart/${productId}`, {
            method: 'DELETE',
          });
          const data = await res.json();
          if (data.success) {
            setCart(data.items || []);
          }
        } else {
          // Supprimer de localStorage
          const updated = cart.filter((item) => item.productId !== productId);
          setCart(updated);
          localStorage.setItem('cart', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('Erreur suppression panier:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [session.authenticated, locale, cart]
  );

  return {
    cart,
    addToCart,
    removeFromCart,
    isLoading,
  };
}