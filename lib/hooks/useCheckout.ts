'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useCart } from './useCart';
import { useUser } from './useUser';
import { useSession } from '@/lib/auth/useSession';
import { useStripe, useElements, CardNumberElement } from '@stripe/react-stripe-js';
import type { PaymentMethod } from '@stripe/stripe-js';

export interface UseCheckoutState {
  prenom: string;
  nom: string;
  email: string;
  shippingAddress: string;
  deliveryMode: 'pickup' | 'delivery';
  error: string | null;
  success: string | null;
  loading: string | null;
  isHydrated: boolean;
  clientSecret: string;
  subtotal: number;
  tax: number;
  total: number;
  cart: any[];
}

export interface UseCheckoutActions {
  setPrenom: (value: string) => void;
  setNom: (value: string) => void;
  setEmail: (value: string) => void;
  setShippingAddress: (value: string) => void;
  setDeliveryMode: (mode: 'pickup' | 'delivery') => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useCheckout(): [UseCheckoutState, UseCheckoutActions] {
  const locale = useLocale();
  const { cart, clearCart } = useCart();
  const { user } = useUser();
  const { session } = useSession();
  const stripe = useStripe();
  const elements = useElements();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('delivery');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  // Calculer prix
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  // Charger le clientSecret au départ
  useEffect(() => {
    if (total > 0) {
      fetch(`/api/${locale}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => console.error('[useCheckout] Erreur clientSecret:', err));
    }
  }, [total, locale]);

  // Charger user data
  useEffect(() => {
    if (user) {
      setPrenom(user.firstName);
      setNom(user.lastName);
      setEmail(user.email);
      if (user.shippingAddress) {
        setShippingAddress(user.shippingAddress);
      }
    }
  }, [user]);

  // Réinitialiser adresse si pickup
  useEffect(() => {
    if (deliveryMode === 'pickup') {
      setShippingAddress('');
    }
  }, [deliveryMode]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      // Validation
      if (!prenom.trim()) {
        setError('Prénom requis');
        return;
      }
      if (!nom.trim()) {
        setError('Nom requis');
        return;
      }
      if (!email.trim()) {
        setError('Email requis');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Email invalide');
        return;
      }

      let paymentMethod: PaymentMethod | null = null;

      // Créer le paiement si visiteur
      if (!session.authenticated) {
        if (!stripe || !elements) {
          setError('Erreur: Stripe non chargé');
          return;
        }

        const cardNumber = elements.getElement(CardNumberElement);
        if (!cardNumber) {
          setError('Numéro de carte requis');
          return;
        }

        if (deliveryMode === 'delivery' && !shippingAddress.trim()) {
          setError('Adresse de livraison requise');
          return;
        }

        setLoading('Payment in progress...');

        const { error: stripeError, paymentMethod: pm } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardNumber,
        });

        if (stripeError) {
          setError(stripeError.message ?? 'Carte invalide');
          setLoading(null);
          return;
        }

        paymentMethod = pm;
      }

      try {
        setLoading('Sending order...');

        // 1. Créer la commande
        const orderRes = await fetch(`/api/${locale}/checkout/create-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            items: cart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
            subtotal,
            tax,
            total,
            shippingAddress,
          }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok) {
          setError(orderData.error || 'Erreur commande');
          setLoading(null);
          return;
        }

        // Si connecté: pas de Stripe
        if (session.authenticated) {
          await clearCart();

          const clientEmailHTML = `
            <h2>Confirmation de commande</h2>
            <p>Bonjour ${prenom} ${nom},</p>
            <p>Votre commande #${orderData.orderId} a été confirmée.</p>
            <p>
            ${
              shippingAddress
                ? `
              <h5>Adresse de livraison :</h5>
              - ${shippingAddress}
            `
                : '<h3>Nous communiquerons avec vous lorsque les articles seront prêts</h3>'
            }
            <h5>Produits :</h5>
            ${cart.map((item) => `<p>${item.name_fr} x${item.quantity}</p>`).join('')}
            </p>
            <h5>Merci !</h5>
          `;

          const adminEmailHTML = `
            <h2>Confirmation de commande</h2>
            <p>
            Commande #${orderData.orderId} a été confirmée
            <br />
            Information du client : <br />
            - ${prenom} ${nom} <br />
            - ${email} <br />
            - ${shippingAddress}
            </p>
            <p>
            <h5>Produits :</h5>
            ${cart.map((item) => `<p>${item.name_fr} x${item.quantity}</p>`).join('')}
            </p>
          `;

          await fetch(`/api/${locale}/checkout/sendEmail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              orderId: orderData.orderId,
              clientEmailHTML,
              adminEmailHTML,
            }),
          });

          setSuccess('Success');
          setLoading(null);
          return;
        }

        // Si visiteur: faire Stripe
        const payRes = await fetch(`/api/${locale}/checkout/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            total,
            email,
          }),
        });

        const payData = await payRes.json();

        if (!payRes.ok) {
          setError(payData.error);
          setLoading(null);
          return;
        }

        const result = await stripe!.confirmCardPayment(payData.clientSecret, {
          payment_method: paymentMethod!.id,
        });

        if (result.error) {
          setError(result.error.message ?? 'Erreur de paiement');
        } else if (result.paymentIntent?.status === 'succeeded') {
          const clientEmailHTML = `<h2>Paiement confirmé</h2>`;
          const adminEmailHTML = `<h2>Paiement reçu pour commande #${orderData.orderId}</h2>`;

          await fetch(`/api/${locale}/checkout/sendEmail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              orderId: orderData.orderId,
              clientEmailHTML,
              adminEmailHTML,
            }),
          });

          localStorage.removeItem('cart');
          setSuccess('Success');
        } else {
          setError('Paiement non confirmé');
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur';
        setError(msg);
      } finally {
        setLoading(null);
      }
    },
    [
      prenom,
      nom,
      email,
      shippingAddress,
      deliveryMode,
      cart,
      subtotal,
      tax,
      total,
      stripe,
      elements,
      session.authenticated,
      locale,
      clearCart,
    ]
  );

  const state: UseCheckoutState = {
    prenom,
    nom,
    email,
    shippingAddress,
    deliveryMode,
    error,
    success,
    loading,
    isHydrated,
    clientSecret,
    subtotal,
    tax,
    total,
    cart,
  };

  const actions: UseCheckoutActions = {
    setPrenom,
    setNom,
    setEmail,
    setShippingAddress,
    setDeliveryMode,
    handleSubmit,
  };

  return [state, actions];
}