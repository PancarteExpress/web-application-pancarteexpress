'use client';

import styles from '../signin/page.module.css';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FaHouseChimney } from 'react-icons/fa6';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordClient() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  const t = useTranslations('connection');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

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

    if (!password.trim()) {
      setError('Mot de passe requis');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!csrfToken) {
      setError('Erreur sécurité: token manquant');
      return;
    }

    if (!email) {
      setError('Email manquant');
      return;
    }

    try {
      setIsFetching(true);

      const response = await fetch(`/api/${locale}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur réinitialisation');
        return;
      }

      setTimeout(() => {
        router.push(`/${locale}/auth/signin`);
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
          <label>Réinitialiser le mot de passe</label>
        </div>

        <p style={{ textAlign: 'center', color: '#5F7FA8', fontSize: '14px', marginBottom: '20px' }}>
          Entrez votre nouveau mot de passe pour :
          <br />
          <strong>{email}</strong>
        </p>

        <div className={styles.inputs}>
          <label htmlFor="password">Nouveau mot de passe</label>
          <input
            id="password"
            type="password"
            placeholder="*********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={styles.inputs}>
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="*********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className={styles.submit}>
          <div className={styles.feedback}>
            {error && <p className={styles.error}>{error}</p>}
            {isFetching && <p className={styles.loading}>Sauvegarde en cours...</p>}
          </div>

          <button type="submit" disabled={isFetching}>
            Réinitialiser
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}