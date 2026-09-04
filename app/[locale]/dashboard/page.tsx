"use client";

import styles from "./dashboard.module.css";
import { useState } from "react";
import UpdateProfile from "./components/updateProfile";

export default function Dashboard() {

    const [updateProfile, setUpdateProfile] = useState<boolean>(false);

    //const initials = userData.prenom.charAt(0).toUpperCase() + userData.nom.charAt(0).toUpperCase();
  
    return ( 
        <>
        <div className={styles.mainContainer}>
            <div className={styles.hero}>
                <label>Tableau de bord</label>
            </div>

            <div className={styles.welcome}>
                <div className={styles.welcomeAvatar}>CFL</div>
                <div>
                    <p className={styles.welcomeTitle}>Bonjour, Cristian 👋</p>
                    <p className={styles.welcomeSub}>
                        Bienvenue dans votre espace personnel. Gérez vos commandes, adresses et informations de compte.
                    </p>
                </div>
            </div>

            <div className={styles.quickGrid}>
                <div className={styles.qcard} onClick={() => setUpdateProfile(true)}>
                    <div className={styles.qcardIcon}>👤</div>
                    <div>
                        <p className={styles.qcardTitle}>Mon profil</p>
                        <p className={styles.qcardValue} style={{ fontSize: '13px' }}>Cristian Fermin Lopez</p>
                        <p className={styles.qcardDesc}> ferminlopez_@hotmail.com </p>
                    </div>
                    <span className={styles.qcardLink}>Modifier mon compte →</span>
                </div>
                <div className={styles.qcard}>
                    <div className={styles.qcardIcon}>📦</div>
                    <div>
                        <p className={styles.qcardTitle}>Commandes</p>
                        <p className={styles.qcardValue}>121</p>
                        <p className={styles.qcardDesc}>108 en cours · 9 terminées · 3 annulées</p>
                    </div>
                    <span className={styles.qcardLink}>Voir mes commandes →</span>
                </div>

                {/*<div className={styles.qcard}>
                    <div className={styles.qcardIcon}>📍</div>
                    <div>
                        <p className={styles.qcardTitle}>Adresses</p>
                        <p className={styles.qcardValue}>1</p>
                        <p className={styles.qcardDesc}>Facturation enregistrée · Livraison manquante</p>
                    </div>
                    <span className={styles.qcardLink}>Gérer mes adresses →</span>
                </div>*/}
            </div>  

            <div className={styles.sectionCard}>
                <div className={styles.sectionHead}>
                    <h3 className={styles.sectionTitle}>Commandes récentes</h3>
                    <a className={styles.sectionLink}>Voir toutes →</a>
                </div>

                <div className={`${styles.orderRow} ${styles.orderRowHead}`}>
                    <span>Commande</span>
                    <span>Adresse</span>
                    <span>Date</span>
                    <span>État</span>
                    <span>Action</span>
                </div>

                <div className={styles.orderRow}>
                    <span className={styles.orderNum}>n°49368</span>
                    <span className={styles.orderAddr}>8368 13e avenue, Montréal</span>
                    <span className={styles.orderDate}>14 juin 2026</span>
                    <span className={`${styles.badge} ${styles.encours}`}>En cours</span>
                    <button className={styles.voirBtn}>Voir</button>
                </div>

                <div className={styles.orderRow}>
                    <span className={styles.orderNum}>n°48537</span>
                    <span className={styles.orderAddr}>8368 13e avenue, Montréal</span>
                    <span className={styles.orderDate}>3 juin 2026</span>
                    <span className={`${styles.badge} ${styles.encours}`}>En cours</span>
                    <button className={styles.voirBtn}>Voir</button>
                </div>

                <div className={styles.orderRow}>
                    <span className={styles.orderNum}>n°48535</span>
                    <span className={styles.orderAddr}>8368 13e avenue, Montréal</span>
                    <span className={styles.orderDate}>3 juin 2026</span>
                    <span className={`${styles.badge} ${styles.termine}`}>Terminée</span>
                    <button className={styles.voirBtn}>Voir</button>
                </div>
            </div>
        </div>
        
        {updateProfile && <UpdateProfile onClose={() => setUpdateProfile(false)} />}
        </>
    );
}