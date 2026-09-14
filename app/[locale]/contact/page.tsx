'use client';

import styles from './page.module.css';
import { useTranslations } from 'next-intl';
import { FaPhoneAlt } from 'react-icons/fa';
import { MdOutlinePhoneAndroid, MdMail, MdLocationPin } from 'react-icons/md';
import { useContact } from '@/lib/hooks/useContact';

export default function Contact() {
  const t = useTranslations('contact');

  // ✅ NOUVEAU: Utiliser le hook
  const [state, actions] = useContact();

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
                <FaPhoneAlt size={25} color="#0E4D9A" />
              </div>

              <div className={styles.infos}>
                <label className={styles.contactLabel}>{t('officePhone')}</label>
                <label className={styles.contactValue}>514-825-2709</label>
              </div>
            </div>

            <div className={styles.contact}>
              <div className={styles.imageContainer}>
                <MdOutlinePhoneAndroid size={25} color="#0E4D9A" />
              </div>

              <div className={styles.infos}>
                <label className={styles.contactLabel}>{t('representativeMobile')}</label>
                <label className={styles.contactValue}>438-543-0912</label>
              </div>
            </div>

            <div className={styles.contact}>
              <div className={styles.imageContainer}>
                <MdMail size={25} color="#0E4D9A" />
              </div>
              <div className={styles.infos}>
                <label className={styles.contactLabel}>{t('email')}</label>
                <label className={styles.contactValue}>info@pancarteexpress.com</label>
              </div>
            </div>

            <div className={styles.contact}>
              <div className={styles.imageContainer}>
                <MdLocationPin size={25} color="#0E4D9A" />
              </div>
              <div className={styles.infos}>
                <label className={styles.contactLabel}>{t('ourAddress')}</label>
                <label className={styles.contactValue}>
                  2160 Rue Léger, Lasalle, QC H8N 2L8
                </label>
              </div>
            </div>
          </div>
        </div>

        <form className={styles.contactForm} onSubmit={actions.handleSubmit}>
          <div className={styles.formHead}>
            <h2 className={styles.formTitle}>{t('contactUs')}</h2>
          </div>

          <div className={styles.formBody}>
            <h2>
              {t('fullName')} <span className={styles.req}>*</span>
            </h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="prenom">{t('firstName')}</label>
                <input
                  id="prenom"
                  type="text"
                  placeholder="Jean"
                  value={state.prenom}
                  onChange={(e) => actions.setPrenom(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="nom">{t('lastName')}</label>
                <input
                  id="nom"
                  type="text"
                  placeholder="Tremblay"
                  value={state.nom}
                  onChange={(e) => actions.setNom(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="telephone">
                  {t('phone')} <span className={styles.req}>*</span>
                </label>
                <input
                  id="telephone"
                  type="text"
                  placeholder="(514) 825-2709"
                  value={state.telephone}
                  onChange={(e) => actions.setTelephone(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="bureau">{t('office')}</label>
                <input
                  id="bureau"
                  type="text"
                  value={state.bureau}
                  onChange={(e) => actions.setBureau(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="courriel">
                  {t('email')} <span className={styles.req}>*</span>
                </label>
                <input
                  id="courriel"
                  type="text"
                  placeholder="pancarteexpress@gmail.com"
                  value={state.courriel}
                  onChange={(e) => actions.setCourriel(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="company">{t('companyName')}</label>
                <input
                  id="company"
                  type="text"
                  value={state.entreprise}
                  onChange={(e) => actions.setEntreprise(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="raison">
                {t('reason')} <span className={styles.req}>*</span>
              </label>
              <textarea
                id="raison"
                rows={4}
                className={styles.textarea}
                value={state.raison}
                onChange={(e) => actions.setRaison(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              {state.error && <p className={styles.error}>{state.error}</p>}
              {state.success && <p className={styles.success}>{state.success}</p>}
              {state.loading && <p className={styles.loading}>{state.loading}</p>}
              {!state.success && <button type="submit">{t('send')}</button>}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}