'use client';

import styles from './page.module.css';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FaHouseChimney } from 'react-icons/fa6';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const t = useTranslations('connection');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!code.trim()) {
      setError('Code requis');
      return;
    }

    if (code.trim().length !== 6) {
      setError('Le code doit contenir 6 chiffres');
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

      const response = await fetch(`/api/${locale}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur vérification');
        
        // Mettre à jour les tentatives restantes si disponible
        if (data.remainingAttempts !== undefined) {
          setAttemptsLeft(data.remainingAttempts);
        }
        return;
      }

      // Succès - redirect vers signin
      setTimeout(() => {
        router.push(`/${locale}/auth/signin`);
      }, 1000);
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
          <label>Vérifier votre email</label>
        </div>

        <p style={{ textAlign: 'center', color: '#5F7FA8', fontSize: '14px', marginBottom: '20px' }}>
          Entrez le code 6 chiffres envoyé à :
          <br />
          <strong>{email}</strong>
        </p>

        <div className={styles.inputs}>
          <label htmlFor="code">Code de vérification</label>
          <input
            id="code"
            type="text"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
          />
        </div>

        {attemptsLeft < 3 && (
          <p style={{ color: '#FF6B6B', fontSize: '12px', textAlign: 'center', marginTop: '-10px' }}>
            {attemptsLeft} tentative(s) restante(s)
          </p>
        )}

        <div className={styles.submit}>
          <div className={styles.feedback}>
            {error && <p className={styles.error}>{error}</p>}
            {isFetching && <p className={styles.loading}>Vérification en cours...</p>}
          </div>

          <button type="submit" disabled={isFetching}>
            Vérifier
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