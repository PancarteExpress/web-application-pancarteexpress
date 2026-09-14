'use client';

import styles from './page.module.css';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useShop } from '@/lib/hooks/useShop';

interface NavOption {
  key: string;
  label: string;
}

const categoryOrder = ['poles', 'anchors', 'keyboxes', 'hardware', 'bigFormatStructure'];

export default function Shop() {
  const locale = useLocale();
  const t = useTranslations('shop');

  // ✅ NOUVEAU: Utiliser le hook
  const [state, actions] = useShop();

  const categoryTranslations: { [key: string]: string } = {
    'all': t('categories.all'),
    'poles': t('categories.poles'),
    'anchors': t('categories.anchors'),
    'keyboxes': t('categories.keyboxes'),
    'hardware': t('categories.hardware'),
    'bigFormatStructure': t('categories.bigFormatStructure'),
  };

  const navOptions: NavOption[] = [
    { key: 'all', label: t('categories.all') },
    ...state.categories
      .sort((a, b) => categoryOrder.indexOf(a.slug) - categoryOrder.indexOf(b.slug))
      .map((cat) => ({
        key: cat.id.toString(),
        label: categoryTranslations[cat.slug] || cat.name,
      })),
  ];

  // ✅ MODIFIÉ: Utiliser state.selected
  const filteredProducts =
    state.selected === 'all'
      ? state.products
      : state.products.filter((p) => p.category.id === parseInt(state.selected));

  // ✅ MODIFIÉ: Pas afficher si pas hydraté
  if (!state.isHydrated) {
    return <div className={styles.mainContainer}></div>;
  }

  return (
    <div className={styles.mainContainer}>
      <div className={styles.hero}>
        <label>{t('title')}</label>
      </div>

      <div className={styles.display}>
        {/* Navigation Desktop */}
        <nav className={styles.navigation}>
          {navOptions.map((option) => (
            <div key={option.key} className={styles.navItem}>
              <button
                className={state.selected === option.key ? styles.active : ''}
                onClick={() => actions.handleSelect(option.key)}
              >
                {option.label}
              </button>
            </div>
          ))}
        </nav>

        {/* Navigation Mobile + Grille */}
        <div className={styles.gridContainer}>
          <div className={styles.responsiveNav}>
            {navOptions.map((option) => (
              <div key={option.key} className={styles.navItem}>
                <button
                  className={state.selected === option.key ? styles.active : ''}
                  onClick={() => actions.handleSelect(option.key)}
                >
                  {option.label}
                </button>
              </div>
            ))}
          </div>

          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <div key={product.id} className={styles.card}>
                <div
                  className={`${styles.goToCart} ${
                    state.addedItems.includes(product.id) ? styles.added : ''
                  }`}
                  onClick={() => actions.handleAddToCart(product)}
                >
                  <div className={styles.logoContainer}>
                    {state.addedItems.includes(product.id) ? (
                      <FaCheck size={18} color="#fff" />
                    ) : (
                      <>
                        <FaShoppingCart size={16} color="#fff" />
                        {t('addToCart')}
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.imageContainer}>
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        className={styles.image}
                        alt={product.name_fr}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'contain', objectPosition: 'top' }}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f0f0f0' }}>
                    Pas d'image
                    </div>
                )}
                </div>

                <div className={styles.content}>
                  <h3>{locale === 'en' ? product.name_en : product.name_fr}</h3>
                  <p>
                    {typeof product.price === 'string'
                      ? parseFloat(product.price).toFixed(2)
                      : product.price.toFixed(2)}
                    $
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}