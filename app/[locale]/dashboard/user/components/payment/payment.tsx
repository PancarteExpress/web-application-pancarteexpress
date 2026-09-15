"use client";

import styles from "./payment.module.css";
import { useEffect } from "react";

import { CardNumberElement, CardExpiryElement, CardCvcElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { usePayment } from "@/lib/hooks/usePayment";

interface PaymentProps {
  onClose: () => void;
  orderId: string;
  email: string;
  amount: number;
  shippingAddress?: string;
}

export default function ProductPayment({ onClose, orderId, email, amount, shippingAddress  }: PaymentProps) {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  
  return (
    <Elements stripe={stripePromise}>
      <Payment 
        onClose={onClose} 
        orderId={orderId} 
        email={email} 
        amount={amount} 
        shippingAddress={shippingAddress}
      />
    </Elements>
  );
}

function Payment({ onClose, orderId, email, amount, shippingAddress }: PaymentProps) {

    const { handlePayment, loading, error } = usePayment();
    
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // ✅ NOUVEAU: Gérer le submit
    const handleSubmit = async () => {
        const result = await handlePayment(orderId, email, amount);
        if (result.success) {
        setTimeout(() => onClose(), 1000);
        }
    };

    return ( 
        <div className={styles.mainContainer}>
            <div className={styles.paymentContainer}>
                <div className={styles.paymentHeader}>
                    <label>Paiement secrurise par Stripe <br /> <span style={{ fontSize: '0.8rem' }}>Vos donnees sont chiffres</span></label>
                    <button onClick={onClose}>Fermer</button>
                </div>

                <div className={styles.orderInfos}>
                    <div className={styles.orderDetails}>
                        <label>Commande #40005</label>
                        <br />
                        <label>Ramassage au 2160 rue léger</label>
                    </div>
                    
                    <div className={styles.orderFinalPrice}>
                        <label>49.99$</label>
                        <br />
                        <label>TPS/TVQ incluses</label>
                    </div>
                </div>

                <div className={styles.paymentSection}>
                    <div className={styles.formGroup}>
                        <label>Numero de carte</label>
                        
                        <CardNumberElement options={{
                            style: {
                                base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#9ca3af' } },
                                invalid: { color: '#fa755a' },
                            },
                        }} />
                        
                    </div>
                    
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
                    
                    {error && <p style={{ color: '#fa755a', textAlign: 'center' }}>{error}</p>}

                    <div className={styles.paymentSecured}>
                        <button onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Paiement en cours...' : `Payer $${amount.toFixed(2)}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}