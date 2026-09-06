"use client";

// Utils
import styles from "./page.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Translation
import { useLocale, useTranslations } from 'next-intl';

export default function Residential() {
    
    // Control the language
    const locale = useLocale();
    const t = useTranslations('residential');
    const cards = t.raw('cards');

    // Redirection
    const router = useRouter();

    // Associating images, logos, titles and descriptions for each cards
    const installationTypes = cards.map((card: any, i: number) => ({
        image: `/residential/thumbnails/image${i + 1}.jpg`,
        logo: `/residential/logos/logo${i + 1}.png`,
        title: card.title,
        description: card.description,
    }));

    return (
        <div className={styles.mainContainer}>
            <div className={styles.hero}>
                <label>{t('title')}</label>
            </div>

            <div className={styles.redirections}>
                <p>
                    {t('Paragraph1')}
                    <br />
                    {t('Paragraph2')}
                </p>

                <div className={styles.buttons}>
                    <button onClick={() => router.push(`/${locale}/shop`)}>{t('Redirection1')}</button>
                    <button onClick={() => router.push(`/${locale}/demande-service`)}>{t('Redirection2')}</button>
                </div>
            </div>

            <div className={styles.grid}>
                {installationTypes.map((type: any, i: number) => (
                    <div key={i} className={styles.card}>

                        <div className={styles.image}>
                            <Image src={type.image} alt="test" fill style={{ objectFit: 'cover' }} sizes="(max-width: 500px) 100vw, (max-width: 1500px) 50vw, 33vw"/>
                        </div>

                        <div className={styles.content}>
                            <div className={styles.logoWrapper}>
                                <div className={styles.logoInner}>
                                    <Image src={type.logo} alt="test" fill style={{ objectFit: 'contain' }} sizes="42px" />
                                </div>
                            </div>

                            <div className={styles.description}>
                                <h3>{type.title}</h3>
                                <div className={styles.text}>
                                    <p>{type.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>    
                ))}        
            </div>
        </div>
    );
}