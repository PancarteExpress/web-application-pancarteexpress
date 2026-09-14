'use client';

import styles from './page.module.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';
import { useLocale, useTranslations } from 'next-intl';
import { FaRegCheckCircle } from 'react-icons/fa';
import AddressAutocomplete from '@/app/global-components/address-autocomplete/address-autocomplete';
import { useSession } from '@/lib/auth/useSession';
import { useCheckout } from '@/lib/hooks/useCheckout';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

function CheckoutForm() {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const { session } = useSession();

  // ✅ NOUVEAU: Utiliser le hook
  const [state, actions] = useCheckout();

  if (!state.isHydrated) return <div></div>;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.hero}>
        <label>{t('title')}</label>
      </div>

      <div className={styles.container}>
        <div className={styles.items}>
          <h3>{t('cartSummary')}</h3>
          {state.cart.map((item, i) => (
            <div key={i} className={styles.item}>
              <span>{locale === 'en' ? item.name_en : item.name_fr}</span>
              <span>×{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          {state.success && (
            <div className={styles.completedPayment}>
              <div>
                <FaRegCheckCircle />
              </div>
              <p>
                Votre achat à été confirmée
                <br />
                Vous allez recevoir une confirmation à l'adresse suivante
                <br />
                <strong>{state.email}</strong>
              </p>
            </div>
          )}
        </div>

        <form className={styles.form} onSubmit={actions.handleSubmit}>
          <div className={styles.section}>
            <h3>{t('paymentData')}</h3>
            <div className={styles.name}>
              <div className={styles.formGroup}>
                <label htmlFor="prenom">{t('firstname')}</label>
                <input
                  id="prenom"
                  value={state.prenom}
                  onChange={(e) => actions.setPrenom(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="nom">{t('lastname')}</label>
                <input
                  id="nom"
                  value={state.nom}
                  onChange={(e) => actions.setNom(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                value={state.email}
                onChange={(e) => actions.setEmail(e.target.value)}
              />
            </div>
          </div>

          {state.clientSecret && !session.authenticated && (
            <div className={styles.section}>
              <div className={styles.formGroup}>
                <div className={styles.formGroup}>
                  <label>{t('cardNumber')}</label>
                  <CardNumberElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': { color: '#9ca3af' },
                        },
                        invalid: { color: '#fa755a' },
                      },
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className={styles.formGroup}>
                    <label>Expiration</label>
                    <CardExpiryElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#9ca3af' },
                          },
                          invalid: { color: '#fa755a' },
                        },
                      }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CVC</label>
                    <CardCvcElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#9ca3af' },
                          },
                          invalid: { color: '#fa755a' },
                        },
                      }}
                    />
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
                  checked={state.deliveryMode === 'pickup'}
                  onChange={(e) => actions.setDeliveryMode('pickup')}
                />
                <div className={styles.radioButton} style={{ borderRadius: '10px 0 0 10px' }}>
                  Ramassage
                </div>
              </label>

              <label className={styles.radioLabel}>
                <input
                  className={styles.radioInput}
                  type="radio"
                  name="deliveryMode"
                  value="delivery"
                  checked={state.deliveryMode === 'delivery'}
                  onChange={(e) => actions.setDeliveryMode('delivery')}
                />
                <div className={styles.radioButton} style={{ borderRadius: '0 10px 10px 0' }}>
                  Livraison
                </div>
              </label>
            </div>

            {state.deliveryMode === 'pickup' && (
              <div className={styles.formGroup}>
                <label htmlFor="shipping">Adresse de ramassage</label>
                Nous vous enverrons un courriel lorsque votre article sera pret a etre ramasser
              </div>
            )}

            {state.deliveryMode === 'delivery' && (
              <div className={styles.formGroup}>
                <label htmlFor="shipping">{t('address')} de livraison</label>

                <AddressAutocomplete
                  key="delivery-address"
                  id="delivery-address"
                  value={state.shippingAddress}
                  onChange={actions.setShippingAddress}
                />
              </div>
            )}
          </div>

          <div className={styles.section}>
            {state.error && <p className={styles.error}>{state.error}</p>}
            {state.loading && <p className={styles.loading}>{state.loading}</p>}
            {state.success && <p className={styles.success}>{state.success}</p>}
            {!state.success && (
              <button type="submit" disabled={state.cart.length === 0}>
                {session.authenticated ? 'Envoyer la commande' : t('makePay')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}