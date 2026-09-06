"use client";

// Utils
import styles from "./page.module.css";
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Translation
import { useLocale, useTranslations } from 'next-intl';

// React icons
import { FaShoppingCart, FaCheck } from 'react-icons/fa';
import { useCart } from "@/lib/hooks/useCart";

// Interfaces
interface Product {
    id: number;
    name_fr: string;
    name_en: string | null;
    price: string;
    image_url: string;
    category_id: number;
    category_name: string;
}

interface NavOption {
    key: string;
    label: string;
}

export default function Shop() {

    // Variables
    const [addedItems, setAddedItems] = useState<number[]>([]);
    const [selected, setSelected] = useState<string>('all');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>(() => {
        if (typeof window === 'undefined') return [];
        const cached = localStorage.getItem('categories');
        return cached ? JSON.parse(cached) : [];
    });

    // Hook pour le panier
    const { addToCart, isLoading } = useCart();

    const filteredProducts = selected === 'all' ? products : products.filter(p => p.category_id === parseInt(selected));
    
    // Hydrated = True when cache is being read
    const [isHydrated, setIsHydrated] = useState(false);
    
    // Control the language
    const t = useTranslations('shop');
    const locale = useLocale();
    const categoryTranslations: { [key: string]: string } = {
        'all': t('categories.all'),
        'poles': t('categories.poles'),
        'anchors': t('categories.anchors'),
        'keyboxes': t('categories.keyboxes'),
        'hardware': t('categories.hardware'),
        'commercial': t('categories.commercial'),
    };

    const categoryOrder = ['poles', 'anchors', 'keyboxes', 'hardware', 'purchase', 'commercial'];

    const navOptions: NavOption[] = [
    { key: 'all', label: t('categories.all') },
    ...categories
        .sort((a, b) => categoryOrder.indexOf(a.slug) - categoryOrder.indexOf(b.slug))
        .map((cat: any) => ({
        key: cat.id.toString(),
        label: categoryTranslations[cat.slug] || cat.name
        }))
    ];

    const handleSelect = (key: string) => {
        setSelected(key);
    };

    const handleAddToCart = async (product: Product) => {
        const productId = product.id.toString();
        const price = parseFloat(product.price);
        const name = locale === 'en' ? product.name_en || product.name_fr : product.name_fr;

        await addToCart(productId, 1, price, name);
        
        setAddedItems([...addedItems, product.id]);
        setTimeout(() => {
            setAddedItems(prev => prev.filter(id => id !== product.id));
        }, 2000);
    };

    // UseEffect to fetch data from DB
    useEffect(() => {
        setIsHydrated(true);
        
        // Charge cache
        const cachedProducts = localStorage.getItem('products');
        const cachedCategories = localStorage.getItem('categories');
        
        if (cachedProducts && cachedCategories) {
            setProducts(JSON.parse(cachedProducts));
            setCategories(JSON.parse(cachedCategories));
        }

        // Otherwise fetch data
        Promise.all([
            fetch(`/api/${locale}/shop/products`).then(res => res.json()),
            fetch(`/api/${locale}/shop/categories`).then(res => res.json())
        ])
        .then(([productsData, categoriesData]) => {
            setProducts(productsData);
            
            // Convertis en array AVANT de setter
            const categoriesArray = Array.isArray(categoriesData) 
                ? categoriesData 
                : Object.entries(categoriesData || {}).map(([key, label]) => ({
                    id: key,
                    slug: key,
                    name: label
                }));
            
            setCategories(categoriesArray);
            localStorage.setItem('products', JSON.stringify(productsData));
            localStorage.setItem('categories', JSON.stringify(categoriesArray));
        })
        .catch(err => {
            console.error('Erreur:', err);
        });
    }, []);

    // Nothing is displayed if not hydrated
    if (!isHydrated) {
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
                    {navOptions.map(option => (
                        <div key={option.key} className={styles.navItem}>
                            <button
                                className={selected === option.key ? styles.active : ''}
                                onClick={() => handleSelect(option.key)}
                            >
                                {option.label}
                            </button>

                            
                        </div>
                    ))}
                </nav>

            {/* Navigation Mobile + Grille */}
            <div className={styles.gridContainer}>
                <div className={styles.responsiveNav}>
                    {navOptions.map(option => (
                        <div key={option.key} className={styles.navItem}>
                            <button
                                className={selected === option.key ? styles.active : ''}
                                onClick={() => handleSelect(option.key)}
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
                                className={`${styles.goToCart} ${addedItems.includes(product.id) ? styles.added : ''}`} 
                                onClick={() => handleAddToCart(product)}
                            >
                                <div className={styles.logoContainer}>
                                    {addedItems.includes(product.id) ? (
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
                                <Image 
                                    src={product.image_url} 
                                    className={styles.image} 
                                    alt={product.name_fr} 
                                    fill 
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    style={{ objectFit: 'contain', objectPosition: 'top' }} 
                                />
                            </div>

                            <div className={styles.content}>
                                <h3>{locale === 'en' ? product.name_en : product.name_fr}</h3>
                                <p>{parseFloat(product.price).toFixed(2)}$</p>
                            </div>
                        </div>    
                    ))}        
                </div>
            </div>
        </div>
    </div>
);
}