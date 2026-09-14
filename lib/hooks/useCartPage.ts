'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCart } from './useCart';
import type { CartItemResponse } from '@/lib/types/shop';

export interface UseCartPageState {
  quantities: Record<number, number>;
  subtotal: number;
  tax: number;
  total: number;
  isHydrated: boolean;
  isLoading: boolean;
  cart: CartItemResponse[];
}

export interface UseCartPageActions {
  handleQuantityChange: (productId: number, newQuantity: number) => void;
  removeFromCart: (productId: number) => Promise<void>;
}

export function useCartPage(): [UseCartPageState, UseCartPageActions] {
  const { cart, removeFromCart, isLoading } = useCart();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // ✅ MODIFIÉ: Initialiser quantities avec productId (pas product_id)
  useEffect(() => {
    setIsHydrated(true);
    const newQuantities: Record<number, number> = {};
    cart.forEach((item) => {
      newQuantities[item.productId] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [cart]);

  // ✅ MODIFIÉ: Utiliser productId (pas product_id)
  const { subtotal, tax, total } = useMemo(() => {
    const sub = cart.reduce(
      (sum, item) =>
        sum + (item.price * (quantities[item.productId] || item.quantity)),
      0
    );
    const t = sub * 0.15;
    return {
      subtotal: sub,
      tax: t,
      total: sub + t,
    };
  }, [cart, quantities]);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const state: UseCartPageState = {
    quantities,
    subtotal,
    tax,
    total,
    isHydrated,
    isLoading,
    cart,
  };

  const actions: UseCartPageActions = {
    handleQuantityChange,
    removeFromCart,
  };

  return [state, actions];
}