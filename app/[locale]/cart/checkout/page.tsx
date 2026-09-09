"use client";

import styles from "./page.module.css";

import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/hooks/useCart";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { useEffect, useState } from "react";

// React icons
import { FaRegCheckCircle } from "react-icons/fa";
import AddressAutocomplete from "@/app/global-components/address-autocomplete/address-autocomplete";
import { useSession } from "@/lib/auth/useSession";
import { useUser } from "@/lib/hooks/useUser";

export default function Checkout() {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  return (<>
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    </>
  );
}

function CheckoutForm() {

    // Variables
    const [prenom, setPrenom] = useState("");
    const [nom, setNom] = useState("");
    const [email, setEmail] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [isHydrated, setIsHydrated] = useState(false);
    const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('delivery');
    
    // Traducteur
    const t = useTranslations('checkout');
    const locale = useLocale();

    // Access to the Cart (Globally)
    const { cart } = useCart();

    // Price calculator
    const subtotal = cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0 // ← Plus de parseFloat
    );
    const tax = subtotal * 0.15;
    const total = subtotal + tax;
    
    // Form validation
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loadingString, setLoading] = useState<string | null>(null);

    // Stripe - Credit card
    const stripe = useStripe();
    const elements = useElements();

    const session = useSession();

    const { user } = useUser();
    
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!prenom.trim()) {
            setError("Prénom requis");
            return;
        }

        if (!nom.trim()) {
            setError("Nom requis");
            return;
        }

        if (!email.trim()) {
            setError("Email requis");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Email invalide");
            return;
        }

        // ✅ Validation Stripe SEULEMENT si visiteur
        let paymentMethod = null;
        if (!session.session.authenticated) {
            if (!stripe || !elements) {
            setError("Erreur: Stripe non chargé");
            return;
            }

            const cardNumber = elements.getElement(CardNumberElement);
            if (!cardNumber) {
            setError("Numéro de carte requis");
            return;
            }

            if (deliveryMode === "delivery" && !shippingAddress.trim()) {
            setError("Adresse de livraison requise");
            return;
            }

            setLoading("Payment in progress...");

            const { error, paymentMethod: pm } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardNumber,
            });

            if (error) {
                setError(error.message ?? "Carte invalide");
                setLoading(null);
                return;
            }

            paymentMethod = pm;
        }

        try {
            session.session && setLoading("Sending order...");

            // 1. Créer la commande
            const orderRes = await fetch(`/api/${locale}/checkout/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                items: cart.map(item => ({
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

            // ✅ SI CONNECTÉ : pas de paiement Stripe, juste vider le panier et succès
            if (session.session.authenticated) {
                // Vider le panier
                await fetch(`/api/${locale}/shop/cart/mark-ordered`, {
                    method: 'PATCH',
                });

                const clientEmailHTML = `
                    <h2>Confirmation de commande</h2>
                    <p>Bonjour ${prenom} ${nom},</p>
                    <p>Votre commande #${orderData.orderId} a été confirmée.</p>
                    <p>
                    ${shippingAddress ? `
                        <h5>Adresse de livraison :</h5>
                        - ${shippingAddress}
                    ` : '<h3>Nous communiquerons avec vous lorsque les articles seront prêts</h3>'}
                    <h5>Produits :</h5>
                    ${cart.map(item => `<p>${item.name_fr} x${item.quantity}</p>`).join('')}
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
                    ${cart.map(item => `<p>${item.name_fr} x${item.quantity}</p>`).join('')}
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

                setSuccess("Success");
                setLoading(null);
                return; // ← Stop ici, pas de Stripe
            }

            // ✅ SI VISITEUR : faire le paiement Stripe
            // 2. Créer le clientSecret
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

            // 3. Confirmer le paiement
            const result = await stripe!.confirmCardPayment(payData.clientSecret, {
            payment_method: paymentMethod!.id,
            });

            if (result.error) {
            setError(result.error.message ?? "Erreur de paiement");
            } else if (result.paymentIntent?.status === 'succeeded') {
            const clientEmailHTML = `...`; // même template
            const adminEmailHTML = `...`;

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
            setSuccess("Success");
            } else {
            setError('Paiement non confirmé');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(null);
        }
    }

    // Payment
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        if (deliveryMode == "pickup") {
            setShippingAddress("");
        }
    }, [deliveryMode]);

    useEffect(() => {
        if (user?.shippingAddress) {
            setShippingAddress(user.shippingAddress);
        }
    }, [user?.shippingAddress]);

    useEffect(() => {
        if (total > 0) {
            fetch(`/api/${locale}/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total }),
            })
            .then(res => res.json())
            .then(data => setClientSecret(data.clientSecret));
        }
    }, [total]);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (document.querySelector('script[src*="maps.googleapis.com"]')) return;
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (user) {
            setPrenom(user.firstName);
            setNom(user.lastName);
            setEmail(user.email);
        }
    }, [user]);

    if (!isHydrated) return <div></div>;

    return (
        <div className={styles.mainContainer}>
            <div className={styles.hero}>
                <label>{t('title')}</label>
            </div>

            <div className={styles.container}>
                <div className={styles.items}>
                    <h3>{t('cartSummary')}</h3>
                    {cart.map((item, i) => (
                    <div key={i} className={styles.item}>
                        <span>{locale === 'en' ? item.name_en : item.name_fr}</span>
                        <span>×{item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    ))}
                    {success && 
                    <div className={styles.completedPayment}>
                        <div>
                            <FaRegCheckCircle />
                        </div>
                        <p>
                            Votre achat à été confirmée 
                            <br /> 
                            Vous allez recevoir une confirmation à l'adresse suivante
                            <br /> 
                            <strong>{email}</strong>
                        </p>
                    </div>}
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.section}>
                        <h3>{t('paymentData')}</h3>
                        <div className={styles.name}>
                            <div className={styles.formGroup}>
                                <label htmlFor="prenom">{t('firstname')}</label>
                                <input 
                                    id="prenom" 
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="nom">{t('lastname')}</label>
                                <input 
                                    id="nom" 
                                    value={nom}
                                    onChange={(e) => setNom(e.target.value)}
                                    />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                />
                        </div>
                    </div>
                    
                    {clientSecret && !session.session.authenticated && (                        
                    <div className={styles.section}>
                        <div className={styles.formGroup}>
                            <div className={styles.formGroup}>
                                <label>{t('cardNumber')}</label>
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
                    )}

                    <div className={styles.section}>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input
                                    className={styles.radioInput}
                                    type="radio"
                                    name="deliveryMode"
                                    value="pickup"
                                    checked={deliveryMode === 'pickup'}
                                    onChange={(e) => setDeliveryMode('pickup' as const)}
                                />
                                <div className={styles.radioButton} style={{ borderRadius: '10px 0 0 10px' }}>Ramassage</div>
                            </label>

                            <label className={styles.radioLabel}>
                                <input
                                    className={styles.radioInput}
                                    type="radio"
                                    name="deliveryMode"
                                    value="delivery"
                                    checked={deliveryMode === 'delivery'}
                                    onChange={(e) => setDeliveryMode('delivery' as const)}
                                />
                                <div className={styles.radioButton} style={{ borderRadius: '0 10px 10px 0' }}>Livraison</div>
                            </label>
                        </div>

                        {deliveryMode === 'pickup' &&
                        <div className={styles.formGroup}>
                            <label htmlFor="shipping">Adresse de ramassage</label>
                            Nous vous enverrons un courriel lorsque votre article sera pret a etre ramasser 
                        </div>}


                        {deliveryMode === 'delivery' &&
                        <div className={styles.formGroup}>
                            <label htmlFor="shipping">{t('address')} de livraison</label>
                            
                            <AddressAutocomplete 
                                key="delivery-address"
                                id="delivery-address" 
                                value={shippingAddress} 
                                onChange={setShippingAddress}
                            />
                            
                        </div>}
                    </div>

                    <div className={styles.section}>
                        {error && <p className={styles.error}>{error}</p>}
                        {loadingString && <p className={styles.loading}>{loadingString}</p>}
                        {success && <p className={styles.success}>{success}</p>}
                        {!success &&
                        <button 
                            type="submit"
                            disabled={cart.length === 0}
                            >
                            {session.session ? "Envoyer la commande" : t('makePay')}
                        </button>}
                    </div>
                </form>
            </div>
        </div>
    );
}

