'use client';

import { useCallback, useState } from 'react';
import { useLocale } from 'next-intl';
import { useStripe, useElements, CardNumberElement } from '@stripe/react-stripe-js';

export interface UsePaymentState {
  loading: boolean;
  error: string | null;
}

export interface UsePaymentActions {
  handlePayment: (orderId: string, email: string, amount: number) => Promise<{ success: boolean }>;
}

export function usePayment(): UsePaymentState & UsePaymentActions {
  const locale = useLocale();
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = useCallback(
    async (orderId: string, email: string, amount: number) => {  // ✅ orderId: string
      if (!stripe || !elements) {
        setError('Stripe non chargé');
        return { success: false };
      }

      setLoading(true);
      setError(null);

      try {
        const cardNumber = elements.getElement(CardNumberElement);
        if (!cardNumber) {
          setError('Carte invalide');
          return { success: false };
        }

        const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardNumber,
        });

        if (pmError) {
          setError(pmError.message || 'Erreur carte');
          return { success: false };
        }

        const confirmRes = await fetch(`/api/${locale}/checkout/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, total: amount, email }),
        });

        const confirmData = await confirmRes.json();

        if (!confirmRes.ok) {
          setError(confirmData.error || 'Erreur création paiement');
          return { success: false };
        }

        const result = await stripe.confirmCardPayment(confirmData.clientSecret, {
          payment_method: paymentMethod!.id,
        });

        if (result.error) {
          setError(result.error.message || 'Erreur paiement');
          return { success: false };
        }

        if (result.paymentIntent?.status === 'succeeded') {
          const updateRes = await fetch(`/api/${locale}/orders/${orderId}/mark-paid`, {  // ✅ orderId reste string
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          if (!updateRes.ok) {
            setError('Erreur mise à jour commande');
            return { success: false };
          }

          return { success: true };
        }

        setError('Paiement non confirmé');
        return { success: false };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        setError(msg);
        return { success: false };
      } finally {
        setLoading(false);
      }
    },
    [stripe, elements, locale]
  );

  return { 
    loading, 
    error, 
    handlePayment 
  };
}