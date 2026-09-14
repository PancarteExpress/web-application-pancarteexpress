'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useSignUp } from '@/lib/hooks/auth/useSignUp';
import AddressAutocomplete from '@/app/global-components/address-autocomplete/address-autocomplete';
import styles from './page.module.css';

export default function SignupPage() {
  const t = useTranslations('becomeMember');
  const locale = useLocale();
  const router = useRouter();

  const [state, actions] = useSignUp();

  const handleSubmitWrapper = async (e: React.FormEvent) => {
    const result = await actions.handleSubmit(e);
    if (result.success && result.redirect && result.email) {
      // ✅ MODIFIÉ: Ajouter check result.email
      sessionStorage.setItem('pendingVerificationEmail', result.email);
      setTimeout(() => {
        window.location.href = `/${locale}${result.redirect}`;
      }, 1000);
    }
  };

  useEffect(() => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.hero}>
        <label>{t('title')}</label>
      </div>

      <div className={styles.container}>
        <div className={styles.about}>
          <h2 className={styles.aboutTitle}>{t('subTitle')}</h2>

          <div className={styles.ctaSolo}>
            <span className={styles.ctaText}>{t('paymentSolo')}</span>
            <span className={styles.ctaPrice}>89.99$ {t('year')}</span>
          </div>

          <div className={styles.ctaGroup}>
            <span className={styles.ctaText}>{t('paymentGroup')}</span>
            <span className={styles.ctaPrice}>119.99$ {t('year')}</span>
          </div>

          <div className={styles.aboutBlock}>
            <span className={styles.blockLabel}>{t('warehouseTitle')}</span>
            <p className={styles.blockText}>{t('warehouseDesc')}</p>
          </div>

          <div className={styles.aboutBlock}>
            <span className={styles.blockLabel}>{t('ratesTitle')}</span>
            <div className={styles.priceRows}>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>{t('ratesNotMember')}</span>
                <span className={styles.priceValue}>45 $</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>{t('ratesMember')}</span>
                <span className={`${styles.priceValue} ${styles.priceHighlight}`}>30 $</span>
              </div>
            </div>
          </div>

          <div className={styles.aboutBlock}>
            <span className={styles.blockLabel}>{t('placementTitle')}</span>
            <p className={styles.blockText}>{t('placementDesc')}</p>
          </div>

          <div className={styles.aboutBlock}>
            <span className={styles.blockLabel}>{t('urgencyTitle')}</span>
            <p className={styles.blockText}>
              {t('urgencyDesc')}
              <br />
              <em>{t('urgencyConditions')}</em>
            </p>
          </div>

          <div className={styles.aboutBlock}>
            <span className={styles.blockLabel}>{t('andMoreTitle')}</span>
            <p className={styles.blockText}>
              {t('andMoreDesc1')}
              <br />
              <br />
              {t('andMoreDesc2')}
            </p>
          </div>
        </div>

        <form className={styles.contactForm} onSubmit={handleSubmitWrapper}>
          <div className={styles.formHead}>
            <h2 className={styles.formTitle}>{t('subSubTitle')}</h2>
          </div>

          <div className={styles.formBody}>
            <h2>
              {t('groupAlone')} <span className={styles.req}>*</span>
            </h2>

            <div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="radio"
                  id="groupYes"
                  name="group"
                  checked={state.isGroup === true}
                  onChange={() => actions.setIsGroup(true)}
                  disabled={state.isLoading}
                />
                <label htmlFor="groupYes">{t('group')}</label>
              </div>

              {state.isGroup && (
                <div className={styles.field}>
                  <label htmlFor="groupName">{t('groupName')}</label>
                  <input
                    id="groupName"
                    type="text"
                    placeholder="Pancarte Express"
                    value={state.groupName}
                    onChange={(e) => actions.setGroupName(e.target.value)}
                    disabled={state.isLoading}
                  />
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <input
                  type="radio"
                  id="groupNo"
                  name="group"
                  checked={state.isGroup === false}
                  onChange={() => actions.setIsGroup(false)}
                  disabled={state.isLoading}
                />
                <label htmlFor="groupNo">{t('alone')}</label>
              </div>
            </div>

            <h2>
              {t('fullName')} <span className={styles.req}>*</span>
            </h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="firstName">{t('firstName')}</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={state.firstName}
                  onChange={(e) => actions.setFirstName(e.target.value)}
                  disabled={state.isLoading}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="lastName">{t('lastName')}</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Tremblay"
                  value={state.lastName}
                  onChange={(e) => actions.setLastName(e.target.value)}
                  disabled={state.isLoading}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="phone">
                  {t('phone')} <span className={styles.req}>*</span>
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="(514) 825-2709"
                  value={state.phone}
                  onChange={(e) => actions.setPhone(e.target.value)}
                  disabled={state.isLoading}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="companyName">{t('companyName')}</label>
                <input
                  id="companyName"
                  type="text"
                  value={state.companyName}
                  onChange={(e) => actions.setCompanyName(e.target.value)}
                  disabled={state.isLoading}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="email">
                  {t('email')} <span className={styles.req}>*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="pancarteexpress@gmail.com"
                  value={state.email}
                  onChange={(e) => actions.setEmail(e.target.value)}
                  disabled={state.isLoading}
                />
              </div>
            </div>

            <h2>
              {t('password')} <span className={styles.req}>*</span>
            </h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="password">{t('firstPassword')}</label>
                <input
                  id="password"
                  type="password"
                  placeholder="*********"
                  value={state.password}
                  onChange={(e) => actions.setPassword(e.target.value)}
                  disabled={state.isLoading}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="*********"
                  value={state.confirmPassword}
                  onChange={(e) => actions.setConfirmPassword(e.target.value)}
                  disabled={state.isLoading}
                />
              </div>
            </div>

            <h2>
              {t('pickupMaterial')} <span className={styles.req}>*</span>
            </h2>

            <div>
              <div style={{ marginBottom: '10px' }}>
                <input
                  type="radio"
                  id="pickupYes"
                  name="pickup"
                  checked={state.needsPickup === true}
                  onChange={() => actions.setNeedsPickup(true)}
                  disabled={state.isLoading}
                />
                <label htmlFor="pickupYes">{t('yesPickup')}</label>
              </div>

              {state.needsPickup && (
                <div className={styles.field}>
                  <label htmlFor="pickupAddress">{t('pickupAddress')}</label>
                  <AddressAutocomplete
                    id="pickupAddress"
                    value={state.pickupAddress}
                    onChange={actions.setPickupAddress}
                    //disabled={state.isLoading}
                  />
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <input
                  type="radio"
                  id="pickupNo"
                  name="pickup"
                  checked={state.needsPickup === false}
                  onChange={() => actions.setNeedsPickup(false)}
                  disabled={state.isLoading}
                />
                <label htmlFor="pickupNo">{t('noPickup')}</label>
              </div>
            </div>

            <div className={styles.field}>
              {state.error && <p className={styles.error}>{state.error}</p>}
              {state.success && <p className={styles.success}>{state.success}</p>}
              {state.isLoading && <p className={styles.loading}>{state.isLoading}</p>}
              <button type="submit">
                {state.isLoading ? t('feedbackMessages.loadingUserCreation') : t('join')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}