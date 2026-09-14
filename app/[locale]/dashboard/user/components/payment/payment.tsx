"use client";

import styles from "./payment.module.css";
import { useEffect } from "react";

import { CardNumberElement, CardExpiryElement, CardCvcElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

interface PaymentProps {
    onClose: () => void;
}

export default function ProductPayment({ onClose }: PaymentProps) {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  
  return (
    <Elements stripe={stripePromise}>
      <Payment onClose={onClose} />
    </Elements>
  );
}

function Payment({ onClose }: PaymentProps) {

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return ( 
        <div className={styles.mainContainer}>
            <button onClick={onClose}>Fermer</button>

            <div className={styles.section}>
                <div className={styles.sectionHead}>Informations de paiement</div>
                <div className={styles.formGroup}>
                    <label>Numero de carte</label>
                    <CardNumberElement options={{
                        style: {
                            base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#9ca3af' } },
                            invalid: { color: '#fa755a' },
                        },
                    }} />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                    <div className={styles.formGroup}>
                        <label>Expiration</label>
                        <CardExpiryElement options={{
                            style: {
                                base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#9ca3af' } },
                                invalid: { color: '#fa755a' },
                            },
                        }} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>CVC</label>
                        <CardCvcElement options={{
                            style: {
                                base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#9ca3af' } },
                                invalid: { color: '#fa755a' },
                            },
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}