'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signup } from '@/lib/auth/signup';
import AddressAutocomplete from '@/app/global-components/address-autocomplete/address-autocomplete';
import styles from './page.module.css';

export default function SignupPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('becomeMember');

  // Form states
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [groupName, setGroupName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [needsPickup, setNeedsPickup] = useState<boolean>(false);

  // UI states
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (isGroup && !groupName.trim()) {
      setError(t('feedbackMessages.missingGroupName'));
      return;
    }

    if (!firstName.trim()) {
      setError(t('feedbackMessages.missingFirstName'));
      return;
    }

    if (!lastName.trim()) {
      setError(t('feedbackMessages.missingLastName'));
      return;
    }

    if (!phone.trim()) {
      setError(t('feedbackMessages.missingPhoneNumber'));
      return;
    }

    if (!email.trim()) {
      setError(t('feedbackMessages.missingEmail'));
      return;
    }

    if (!password.trim()) {
      setError(t('feedbackMessages.missingPassword'));
      return;
    }

    if (!confirmPassword.trim()) {
      setError(t('feedbackMessages.missingPasswordConfirmation'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('feedbackMessages.errorPasswordsMissmatch'));
      return;
    }

    setLoading(true);

    try {
      // Appeler Server Action
      const result = await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password,
        companyName: companyName.trim() || undefined,
        isGroup,
        groupName: isGroup ? groupName.trim() : undefined,
      });

      if (!result.success) {
        setError(result.error || t('feedbackMessages.errorRegisteringUser'));
        return;
      }

      setSuccess(t('feedbackMessages.successUserCreated'));

      // Redirect vers verify-email après 1.5s
      setTimeout(() => {
        router.push(`/${locale}/auth/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('feedbackMessages.errorNetwork'));
    } finally {
      setLoading(false);
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

        <form className={styles.contactForm} onSubmit={handleSubmit}>
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
                  checked={isGroup === true}
                  onChange={() => setIsGroup(true)}
                />
                <label htmlFor="groupYes">{t('group')}</label>
              </div>

              {isGroup && (
                <div className={styles.field}>
                  <label htmlFor="groupName">{t('groupName')}</label>
                  <input
                    id="groupName"
                    type="text"
                    placeholder="Pancarte Express"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <input
                  type="radio"
                  id="groupNo"
                  name="group"
                  checked={isGroup === false}
                  onChange={() => setIsGroup(false)}
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
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="lastName">{t('lastName')}</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Tremblay"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="companyName">{t('companyName')}</label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="confirmPassword">{t('confirmPassword')}</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="*********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  checked={needsPickup === true}
                  onChange={() => setNeedsPickup(true)}
                />
                <label htmlFor="pickupYes">{t('yesPickup')}</label>
              </div>

              {needsPickup && (
                <div className={styles.field}>
                  <label htmlFor="pickupAddress">{t('pickupAddress')}</label>
                  <AddressAutocomplete
                    id="pickupAddress"
                    value={pickupAddress}
                    onChange={setPickupAddress}
                  />
                </div>
              )}

              <div style={{ marginBottom: '10px' }}>
                <input
                  type="radio"
                  id="pickupNo"
                  name="pickup"
                  checked={needsPickup === false}
                  onChange={() => setNeedsPickup(false)}
                />
                <label htmlFor="pickupNo">{t('noPickup')}</label>
              </div>
            </div>

            <div className={styles.field}>
              {error && <p className={styles.error}>{error}</p>}
              {success && <p className={styles.success}>{success}</p>}
              {loading && <p className={styles.loading}>En cours...</p>}
              <button type="submit" disabled={loading}>
                {loading ? t('feedbackMessages.loadingUserCreation') : t('join')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}