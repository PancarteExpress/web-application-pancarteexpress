'use client';

import styles from './page.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCartPage } from '@/lib/hooks/useCartPage';
import { TiDeleteOutline } from 'react-icons/ti';

export default function Cart() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('cart');

  // ✅ NOUVEAU: Utiliser le hook
  const [state, actions] = useCartPage();

  if (!state.isHydrated) return <div></div>;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.hero}>
        <label>{t('title')}</label>
      </div>

      <div className={styles.cartContainer}>
        <div className={styles.products}>
          <table>
            <colgroup>
              <col style={{ width: '70%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>{t('column1')}</th>
                <th>{t('column2')}</th>
                <th>{t('column3')}</th>
              </tr>
            </thead>
            <tbody>
              {state.cart.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                    {t('emptyCart')}
                  </td>
                </tr>
              ) : (
                state.cart.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className={styles.product}>
                        <button
                          type="button"
                          onClick={() => actions.removeFromCart(item.productId)}
                          className={styles.deleteButton}
                        >
                          <TiDeleteOutline size={25} />
                        </button>

                        <div className={styles.imageContainer}>
                          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                            {item.image_url && item.image_url.trim() !== '' ? (
                              <Image
                                src={item.image_url}
                                alt={locale === 'en' ? (item.name_en || item.name_fr) : item.name_fr}
                                fill
                                style={{ objectFit: 'contain' }}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            ) : (
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  height: '100%',
                                  background: '#f0f0f0',
                                }}
                              >
                                Pas d'image
                              </div>
                            )}
                          </div>
                        </div>

                        <label>{locale === 'en' ? item.name_en : item.name_fr}</label>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={state.quantities[item.productId] || item.quantity}
                        onChange={(e) =>
                          actions.handleQuantityChange(item.productId, parseInt(e.target.value))
                        }
                        onFocus={(e) => e.target.select()}
                        style={{ width: '60px', textAlign: 'center' }}
                      />
                    </td>
                    <td>
                      ${(item.price * (state.quantities[item.productId] || item.quantity)).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.purchase}>
          <div className={styles.left}></div>

          <div className={styles.right}>
            <label>{t('cartTotal')}</label>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span className={styles.label}>{t('subTotal')}</span>
                <span className={styles.value}>${state.subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.label}>TPS/TVQ (15%)</span>
                <span className={styles.value}>${state.tax.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Total</span>
                <span className={styles.value}>${state.total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => router.push(`/${locale}/cart/checkout`)}
              disabled={state.cart.length === 0}
            >
              {t('validateCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}