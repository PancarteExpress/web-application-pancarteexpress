'use client';

import styles from './page.module.css';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FaHouseChimney } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
 
  // Ajoute ça juste après pour déboguer
  useEffect(() => {
    console.log('Error state:', error);
  }, [error]);

  const [success, setSuccess] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const t = useTranslations('connection');
  const feedbackMessages = useTranslations('connection.feedbackMessages');

  const locale = useLocale();
  const router = useRouter();

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch(`/api/${locale}/auth/csrf`);
        const data = await res.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error('Erreur récupération CSRF:', err);
      }
    };

    fetchCsrfToken();
  }, [locale]);

  const handleBecomeMember = () => {
    router.push(`/${locale}/auth/signup`);
  };

  const handleNewPassword = () => {
    router.push(`/${locale}/auth/forgot-password`);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      console.log('Email vide, setError appelé');
      setError(feedbackMessages('missingEmail'));
      
      return;
    }

    if (!password.trim()) {
      setError(feedbackMessages('missingPassword'));
      return;
    }

    if (!csrfToken) {
      setError('Erreur sécurité: token manquant');
      return;
    }

    try {
      setIsFetching(true);

      const response = await fetch(`/api/${locale}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur de connexion');
        return;
      }

      setSuccess('Connexion réussie. Redirection...');

      // Redirection après connexion réussie
      setTimeout(() => {
        window.location.href = `/${locale}${data.redirect}`;
      }, 1000);
    } catch (err) {
      setError(feedbackMessages('errorNetwork'));
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <form className={styles.connectionForm} onSubmit={handleSubmit}>
      <fieldset className={styles.credentials}>
        <div className={styles.connectionHeader}>
          <FaHouseChimney size={30} style={{ color: '#0E4D9A' }} />
          <label>{t('title')}</label>
        </div>

        <div className={styles.inputs}>
          <label htmlFor="email">{t('identifier')}</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputs}>
          <label htmlFor="password">{t('password')}</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '15px', marginTop: '-5px' }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe" style={{ marginLeft: '8px', fontSize: '14px', fontFamily: 'Inter, sans-serif', color: '#5F7FA8' }}>
            Se souvenir de moi
          </label>
        </div>

        <div className={styles.lostPassword}>
          <button
            type="button"
            className={styles.newPassword}
            onClick={handleNewPassword}
          >
            {t('passwordForgotten')}
          </button>
        </div>

        <div className={styles.submit}>
          <div className={styles.feedback}>
            {error && <p className={styles.error}>{error}</p>}
            {isFetching && <p className={styles.loading}>Connexion en cours...</p>}
          </div>

          <button type="submit" disabled={isFetching}>
            {t('connect')}
          </button>

          <label>{t('noAccount')}</label>

          <button
            type="button"
            className={styles.becomeMember}
            onClick={handleBecomeMember}
          >
            {t('createOne')}
          </button>
        </div>
      </fieldset>
    </form>
  );
}