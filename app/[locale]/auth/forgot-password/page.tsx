'use client';

import styles from '../signin/page.module.css';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FaHouseChimney } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const t = useTranslations('connection');
  const locale = useLocale();
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!email.trim()) {
      setError('Email requis');
      return;
    }

    if (!csrfToken) {
      setError('Erreur sécurité: token manquant');
      return;
    }

    try {
      setIsFetching(true);

      const response = await fetch(`/api/${locale}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur envoi email');
        return;
      }

      setTimeout(() => {
        router.push(`/${locale}/auth/verify-forgot-password?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      }, 1500);
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setIsFetching(false);
    }
  };

  const handleBackToSignin = () => {
    router.push(`/${locale}/auth/signin`);
  };

  return (
    <form className={styles.connectionForm} onSubmit={handleSubmit}>
      <fieldset className={styles.credentials}>
        <div className={styles.connectionHeader}>
          <FaHouseChimney size={30} style={{ color: '#0E4D9A' }} />
          <label>Mot de passe oublié</label>
        </div>

        <p style={{ textAlign: 'center', color: '#5F7FA8', fontSize: '14px', marginBottom: '20px' }}>
          Entrez votre email pour recevoir un code de réinitialisation.
        </p>

        <div className={styles.inputs}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="votremail@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.submit}>
          <div className={styles.feedback}>
            {error && <p className={styles.error}>{error}</p>}
            {isFetching && <p className={styles.loading}>Envoi en cours...</p>}
          </div>

          <button type="submit" disabled={isFetching}>
            Envoyer le code
          </button>

          <button
            type="button"
            onClick={handleBackToSignin}
            style={{
              all: 'unset',
              color: '#0E4D9A',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Retour à la connexion
          </button>
        </div>
      </fieldset>
    </form>
  );
}