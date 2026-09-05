"use client";

// Utils
import styles from './header.module.css';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

// Translater
import LanguageSwitcher from '../languageSwitcher/languageSwitcher';
import { useLocale, useTranslations } from 'next-intl';

// React icons
import { FaPhoneAlt } from "react-icons/fa";
import { MdMail } from "react-icons/md";
import { IoMenuOutline } from "react-icons/io5";
import { IoCartOutline } from "react-icons/io5";
import { FaPaperPlane } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
//import { useAuth } from '@/app/context/AuthContext';
import { getActivePath } from '@/app/utils/getActivePath';
import { useSession } from '@/lib/auth/useSession';


export default function Header() {

    // Control the language
    const locale = useLocale();
    const t = useTranslations('header');

    // Toggle de responsive Navbar
    const [isOpen, setIsOpen] = useState(false);

    // Get the current pathname
    const pathname = usePathname();
    const activePath = getActivePath(pathname);
    const isActive = (path: string) => activePath === path;

    const { session, loading } = useSession();

    // Fonction de déconnexion
    const handleLogout = async () => {
        try {
            // 1. Récupérer le CSRF token
            const csrfRes = await fetch(`/api/${locale}/auth/csrf`);
            const csrfData = await csrfRes.json();
            const csrfToken = csrfData.token;

            // 2. Envoyer signout avec le token
            await fetch(`/api/${locale}/auth/signout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
            },
            });

            // 3. Redirect
            window.location.href = `/${locale}`;
        } catch (err) {
            console.error('Erreur déconnexion:', err);
        }
    };

    // Ne pas afficher d'erreur si session n'est pas disponible
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <header>
            <div className={styles.topHeader}>
                <div className={styles.container}>
                    <div className={styles.contactInfo}>
                        <Link href="tel:5148252709"><FaPhoneAlt size={15}/> 514-825-2709</Link>
                        <Link href="mailto:info@pancarteexpress.com"><MdMail size={20} /> info@pancarteexpress.com</Link>
                        <LanguageSwitcher />
                    </div>

                    <div className={styles.account}>
                        {!session.authenticated && <Link href={`/${locale}/auth/signup`}>{t('becomeMember')}</Link>}
                        <Link href={`/${locale}/auth/signin`}>{t('myAccount')}</Link>
                        {session.authenticated && 
                            <button onClick={handleLogout}>
                            Déconnexion
                            </button>
                        }
                    </div>
                </div>
            </div>

            <div className={styles.bottomHeader}>
                <div className={styles.container}>
                    <Image src="/header/Logo_PancarteExpress.svg" className={styles.logo} loading="eager" alt="Logo Pancarte Express" width={300} height={100} />

                    <div className={styles.infos}>
                        <div className={styles.schedule}>
                            <div>
                                <h1>{t('fastService')}</h1>
                                <h5>{t('schedule')}</h5>
                            </div>
                            <Image src="/header/icon-horaire.png" alt="icon horaire" className={styles.icon} width={40} height={40} />
                        </div>
                        <div className={styles.area}>
                            <div>
                                <h1>{t('givenService')}</h1>
                                <h5>{t('location')}</h5>
                            </div>
                            <Image src="/header/icon-maps.png" alt="icon maps" className={styles.icon} width={30} height={35} />
                        </div>
                    </div>

                    <div className={styles.navbar}>
                        <Link href={`/${locale}/`} className={styles.navItem} style={{ color: isActive('/') ? '#0E4D98' : 'black' }}>{t('navbar.home')}</Link>
                        <Link href={`/${locale}/residential`} className={styles.navItem} style={{ color: isActive('/residential') ? '#0E4D98' : 'black' }}>{t('navbar.residential')}</Link>
                        <Link href={`/${locale}/commercial`} className={styles.navItem} style={{ color: isActive('/commercial') ? '#0E4D98' : 'black' }}>{t('navbar.commercial')}</Link>
                        <Link href={`/${locale}/shop`} className={styles.navItem} style={{ color: isActive('/shop') ? '#0E4D98' : 'black' }}>{t('navbar.shop')}</Link>
                        <Link href={`/${locale}/contact`} className={styles.navItem} style={{ color: isActive('/contact') ? '#0E4D98' : 'black' }}>{t('navbar.contact')}</Link>
                        <Link href={`/${locale}/cart`} className={styles.navItem} style={{ color: isActive('/cart') ? '#0E4D98' : 'black' }}>
                            <IoCartOutline size={22} />
                        </Link>
                        <Link href={`/${locale}/service-request`} className={styles.navItem}><FaPaperPlane /> {t('navbar.onlineApplication')}</Link>        
                    </div>

                    {/* Responsive Navigation Toggle - Appears on screens of width 1000px and smaller */}
                    <div className={styles.toggleResponsiveNav} onClick={() => setIsOpen(!isOpen)}>
                        <IoMenuOutline size={50}/>
                    </div>

                </div>
            </div>

            <div className={`${styles.responsiveNav} ${isOpen ? styles.visible : ""}`}>
                <div className={styles.closeBtn} >
                <IoClose onClick={() => setIsOpen(!isOpen)} />
                </div>

                <div className={styles.responsiveNavbar} >
                    <Link href="/" className={styles.navItem} style={{ color: isActive('/') ? '#0E4D98' : 'black' }}>{t('navbar.home')}</Link>
                    <Link href="/residential" className={styles.navItem} style={{ color: isActive('/residential') ? '#0E4D98' : 'black' }}>{t('navbar.residential')}</Link>
                    <Link href="/commercial" className={styles.navItem} style={{ color: isActive('/commercial') ? '#0E4D98' : 'black' }}>{t('navbar.commercial')}</Link>
                    <Link href="/shop" className={styles.navItem} style={{ color: isActive('/shop') ? '#0E4D98' : 'black' }}>{t('navbar.shop')}</Link>
                    <Link href="/contact" className={styles.navItem} style={{ color: isActive('/contact') ? '#0E4D98' : 'black' }}>{t('navbar.contact')}</Link>
                    <Link href="/cart" className={styles.navItem} style={{ color: isActive('/cart') ? '#0E4D98' : 'black' }}>
                        {t('navbar.cart')}
                    </Link>
                    <Link href="/demande-service" className={styles.navItem}><FaPaperPlane /> {t('navbar.onlineApplication')}</Link>   
                </div>
            </div>
        </header>
    );
}