"use client";

// Utils
import styles from "./page.module.css";
import { useState } from "react";

// Translation
import { useLocale, useTranslations } from 'next-intl';

// React icons
import { FaPhoneAlt } from "react-icons/fa";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { MdMail } from "react-icons/md";
import { MdLocationPin } from "react-icons/md";

export default function Contact() {

    // Variables
    const [prenom, setPrenom] = useState('');
    const [nom, setNom] = useState('');
    const [telephone, setTelephone] = useState('');
    const [bureau, setBureau] = useState('');
    const [entreprise, setEntreprise] = useState('');
    const [courriel, setCourriel] = useState('');
    const [raison, setRaison] = useState('');
    
    // Control the language
    const t = useTranslations('contact');
    const feedbackMessages = useTranslations('contact.feedbackMessages');

    const locale = useLocale();

    // Form validation
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setError(null);
        setSuccess(null);
        
        if (!prenom.trim()) {
            setError(feedbackMessages('missingFirstName'));
            return;
        }
        
        if (!nom.trim()) {
            setError(feedbackMessages('missingLastName'));
            return;
        }
        
        if (!telephone.trim()) {
            setError(feedbackMessages('missingPhoneNumber'));
            return;
        }
        
        if (!courriel.trim()) {
            setError(feedbackMessages('missingEmail'));
            return;
        }
        
        if (!raison.trim()) {
            setError(feedbackMessages('missingRequest'));
            return;
        }

        setLoading(feedbackMessages('loadingSendingMessage'));
        try {
            const clientEmailHTML = `
            <h2>Bonjour ${prenom} ${nom},</h2>
            <p>Nous avons bien reçu votre demande et vous répondrons dans les plus brefs délais.</p>
            <p><strong>Raison :</strong> ${raison}</p>
            <br/>
            <p>L'équipe Pancarte Express</p>
            `;

            const adminEmailHTML = `
            <h2>Nouvelle demande de contact</h2>
            <p><strong>Nom :</strong> ${prenom} ${nom}</p>
            <p><strong>Téléphone :</strong> ${telephone}</p>
            ${bureau ? `<p><strong>Bureau :</strong> ${bureau}</p>` : ''}
            <p><strong>Courriel :</strong> ${courriel}</p>
            ${entreprise ? `<p><strong>Entreprise :</strong> ${entreprise}</p>` : ''}
            <p><strong>Raison :</strong> ${raison}</p>
            `;

            const res = await fetch(`/api/${locale}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: courriel,
                clientEmailHTML,
                adminEmailHTML,
            }),
            });

            const data = await res.json();

            if (!res.ok) {
            setError(data.error || feedbackMessages('errorSendingMessage'));
            return;
            }

            setSuccess(feedbackMessages('successMessageSent'));
        } catch (err) {
            setError(feedbackMessages('errorNetwork'));
        } finally {
            setLoading(null);
        }
        };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.hero}>
                <label>{t('title')}</label>
            </div>

            <div className={styles.container}>
                <div className={styles.about}>
                    <div>
                        <h3>{t('ourCooronates')}</h3>

                        <div className={styles.contact}>
                            <div className={styles.imageContainer}>
                                <FaPhoneAlt size={25} color="#0E4D9A"/>
                            </div>
                    
                            <div className={styles.infos}>
                                <label className={styles.contactLabel}>{t('officePhone')}</label>
                                <label className={styles.contactValue}>514-825-2709</label>
                            </div>
                        </div>

                        <div className={styles.contact}>
                            <div className={styles.imageContainer}>
                                <MdOutlinePhoneAndroid size={25} color="#0E4D9A"/>
                            </div>
                            
                            <div className={styles.infos}>
                                <label className={styles.contactLabel}>{t('representativeMobile')}</label>
                                <label className={styles.contactValue}>438-543-0912</label>
                            </div>
                        </div>

                        <div className={styles.contact}>
                            <div className={styles.imageContainer}>
                                <MdMail size={25} color="#0E4D9A"/>
                            </div>
                            <div className={styles.infos}>
                                <label className={styles.contactLabel}>{t('email')}</label>
                                <label className={styles.contactValue}>info@pancarteexpress.com</label>
                            </div>
                        </div>
                
                        <div className={styles.contact}>
                            <div className={styles.imageContainer}>
                                <MdLocationPin size={25} color="#0E4D9A"/>
                            </div>
                            <div className={styles.infos}>
                                <label className={styles.contactLabel}>{t('ourAddress')}</label>
                                <label className={styles.contactValue}>2160 Rue Léger, Lasalle, QC H8N 2L8</label>
                            </div>
                        </div>
                    </div>
                </div>
                
                <form className={styles.contactForm} onSubmit={handleSubmit}>
                    <div className={styles.formHead}>
                        <h2 className={styles.formTitle}>{t('contactUs')}</h2>
                    </div>

                    <div className={styles.formBody}>

                        <h2>{t('fullName')} <span className={styles.req}>*</span></h2>

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="prenom">{t('firstName')}</label>
                                <input id="prenom" type="text" placeholder="Jean" onChange={(e) => setPrenom(e.target.value)}/>
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="nom">{t('lastName')}</label>
                                <input id="nom" type="text" placeholder="Tremblay" onChange={(e) => setNom(e.target.value)}/>
                            </div>
                        </div>
                        
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="telephone">{t('phone')} <span className={styles.req}>*</span></label>
                                <input id="telephone" type="text" placeholder="(514) 825-2709" onChange={(e) => setTelephone(e.target.value)}/>
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="bureau">{t('office')}</label>
                                <input id="bureau" type="text" onChange={(e) => setBureau(e.target.value)}/>
                            </div>
                        </div>
                        
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label htmlFor="courriel">{t('email')} <span className={styles.req}>*</span></label>
                                <input id="courriel" type="text" placeholder="pancarteexpress@gmail.com" onChange={(e) => setCourriel(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="company">{t('companyName')}</label>
                                <input id="company" type="text" onChange={(e) => setEntreprise(e.target.value)}/>
                            </div>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="raison">{t('reason')} <span className={styles.req}>*</span></label>
                            <textarea
                                id="raison"
                                rows={4}
                                className={styles.textarea}
                                onChange={(e) => setRaison(e.target.value)}
                            />
                        </div>
                        
                        <div className={styles.field}>
                            {error && <p className={styles.error}>{error}</p>}
                            {success && <p className={styles.success}>{success}</p>}
                            {loading && <p className={styles.loading}>{loading}</p>}
                            {!success &&
                            <button type="submit">
                                {t('send')}
                            </button>}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}