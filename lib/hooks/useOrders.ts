'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from '@/lib/auth/useSession';

type OrderItem = {
  id: string;
  orderId: string;
  productId: number;
  quantity: number;
  price: number;
  createdAt: string;
};

type Order = {
  id: string;
  orderNumber: number;
  email: string;
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export function useOrders() {
  const locale = useLocale();
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session.authenticated) {
      setOrders([]);
      setError(null);
      return;
    }

    const fetchOrders = async () => {
      setLoadingOrders(true);
      setError(null);
      try {
        const res = await fetch(`/api/${locale}/orders`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Réponse non-JSON reçue');
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('[useOrders]', msg);
        setError(msg);
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();

    // Re-fetch au logout
    const handleSessionChange = () => fetchOrders();
    window.addEventListener('session-changed', handleSessionChange);
    return () => window.removeEventListener('session-changed', handleSessionChange);
  }, [session.authenticated, locale]);

  return { orders, loadingOrders, error };
}