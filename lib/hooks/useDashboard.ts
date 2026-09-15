'use client';

import { useMemo, useState } from 'react';
import { useUser } from './useUser';
import { useOrders } from './useOrders';
import { OrderStats } from '@/lib/types/order';
import { UserRole } from '@/lib/types/auth';

type DashboardMode = 'user' | 'groupAdmin';

export interface DashboardState {
  // User & Orders
  user: ReturnType<typeof useUser>['user'];
  loadingUser: boolean;
  errorUser: string | null;
  
  orders: ReturnType<typeof useOrders>['orders'];
  loadingOrders: boolean;
  errorOrders: string | null;
  refetchOrders: () => Promise<void>;

  // UI State
  updateProfileOpen: boolean;
  makePaymentOpen: boolean;
  selectedOrderId: string | null;
  selectedOrderIdForPayment: string | null;
  cancelOrderId: string | null;
  changeMode: DashboardMode;

  // Computed
  orderStats: OrderStats;
  isGroupAdmin: boolean;
}

export interface DashboardActions {
  setUpdateProfileOpen: (open: boolean) => void;
  setMakePaymentOpen: (open: boolean) => void;
  setSelectedOrderId: (orderId: string | null) => void;
  setCancelOrderId: (orderId: string | null) => void;
  setSelectedOrderIdForPayment: (orderId: string | null) => void;
  setChangeMode: (mode: DashboardMode) => void;
  handleMakePayment: (orderId: string) => void;
  handleCancelOrder: (orderId: string) => Promise<void>;
}

export function useDashboard(): [DashboardState, DashboardActions] {
  // Données
  const { user, loadingUser, errorUser } = useUser();
  const { orders, loadingOrders, error: errorOrders, refetch: refetchOrders } = useOrders();

  // State local
  const [updateProfileOpen, setUpdateProfileOpen] = useState(false);
  const [makePaymentOpen, setMakePaymentOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [changeMode, setChangeMode] = useState<DashboardMode>('user');
  const [selectedOrderIdForPayment, setSelectedOrderIdForPayment] = useState<string | null>(null);

  // Computed values
  const orderStats = useMemo<OrderStats>(() => ({
    pending: orders.filter(o => o.status === 'pending').length,
    done: orders.filter(o => o.status === 'done').length,
    canceled: orders.filter(o => o.status === 'canceled').length,
  }), [orders]);

  const isGroupAdmin = user?.role === UserRole.GROUP_ADMIN;

  // Handlers
  const handleMakePayment = (orderId: string) => {
    //setSelectedOrderId(orderId);
    setSelectedOrderIdForPayment(orderId);
    setMakePaymentOpen(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/fr/orders/${orderId}/cancel`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        alert('Erreur annulation');
        return;
      }

      setCancelOrderId(null);
      await refetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const state: DashboardState = {
    user,
    loadingUser,
    errorUser,
    orders,
    loadingOrders,
    errorOrders,
    refetchOrders,
    updateProfileOpen,
    makePaymentOpen,
    selectedOrderId,
    selectedOrderIdForPayment,
    cancelOrderId,
    changeMode,
    orderStats,
    isGroupAdmin,
  };

  const actions: DashboardActions = {
    setUpdateProfileOpen,
    setMakePaymentOpen,
    setSelectedOrderId,
    setCancelOrderId,
    setChangeMode,
    setSelectedOrderIdForPayment,
    handleMakePayment,
    handleCancelOrder,
  };

  return [state, actions];
}