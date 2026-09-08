"use client";

// Utils
import styles from "./page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Translater
import { useLocale, useTranslations } from "next-intl";

// Access to the Cart (Globally)
import { useCart } from "@/lib/hooks/useCart";

// React icons
import { TiDeleteOutline } from "react-icons/ti";

export default function Cart() {

  // Traducteur
  const t = useTranslations('cart');

  // Redirection
  const locale = useLocale();
  const router = useRouter();

  // Access to the Cart (Globally)
  const { cart, removeFromCart, isLoading } = useCart();
  
  // Control quantities if they change in the cart
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Control the prices
  const subtotal = cart.reduce((sum, item) => 
    sum + (item.price * (quantities[item.productId] || item.quantity)), 0
  );
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
  };

  // Initialise product quantities in cart
  useEffect(() => {
    setIsHydrated(true);
    const newQuantities: { [key: string]: number } = {};
    cart.forEach(item => {
      newQuantities[item.productId] = item.quantity;
    });
    setQuantities(newQuantities);
  }, [cart]);

  if (!isHydrated) return <div></div>;

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
              {cart.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                    {t('emptyCart')}
                  </td>
                </tr>
              ) : (
                cart.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className={styles.product}>
                        <button 
                          type="button" 
                          onClick={() => removeFromCart(item.productId)} // ← item.productId
                          className={styles.deleteButton}
                        >
                          <TiDeleteOutline size={25}/>
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
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f0f0' }}>
                                Pas d'image
                              </div>
                            )}
                          </div>
                        </div>

                        <label>
                          {locale === 'en' ? item.name_en : item.name_fr}
                        </label>
                      </div>
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="1" 
                        value={quantities[item.productId] || item.quantity} 
                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                        onFocus={(e) => e.target.select()}
                        style={{ width: '60px', textAlign: 'center' }}
                      />
                    </td>
                    <td>
                      ${(item.price * (quantities[item.productId] || item.quantity)).toFixed(2)}
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
                <span className={styles.value}>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.label}>TPS/TVQ (15%)</span>
                <span className={styles.value}>${tax.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Total</span>
                <span className={styles.value}>${total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={() => router.push(`/${locale}/cart/checkout`)}
              disabled={cart.length === 0}
            >
              {t('validateCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}