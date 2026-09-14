'use client';

import styles from '../signin/page.module.css';
import { useLocale, useTranslations } from 'next-intl';
import { FaHouseChimney } from 'react-icons/fa6';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useResetPassword } from '@/lib/hooks/auth/useResetPassword';

function ResetPasswordClient() {
  const t = useTranslations('connection');
  const locale = useLocale();
  const router = useRouter();

  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [state, actions] = useResetPassword(email);

  const handleSubmitWrapper = async (e: React.FormEvent) => {
    const result = await actions.handleSubmit(e);
    if (result.success) {
      setTimeout(() => {
        router.push(`/${locale}/auth/signin`);
      }, 500);
    }
  };

  const handleBackToSignin = () => {
    router.push(`/${locale}/auth/signin`);
  };

  return (
    <form className={styles.connectionForm} onSubmit={handleSubmitWrapper}>
      <fieldset className={styles.credentials}>
        <div className={styles.connectionHeader}>
          <FaHouseChimney size={30} style={{ color: '#0E4D9A' }} />
          <label>Réinitialiser le mot de passe</label>
        </div>

        <p style={{ textAlign: 'center', color: '#5F7FA8', fontSize: '14px', marginBottom: '20px' }}>
          Entrez votre nouveau mot de passe pour :
          <br />
          <strong>{state.email}</strong>
        </p>

        <div className={styles.inputs}>
          <label htmlFor="password">Nouveau mot de passe</label>
          <input
            id="password"
            type="password"
            placeholder="*********"
            value={state.password}
            onChange={(e) => actions.setPassword(e.target.value)}
            disabled={state.isFetching}
          />
        </div>

        <div className={styles.inputs}>
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="*********"
            value={state.confirmPassword}
            onChange={(e) => actions.setConfirmPassword(e.target.value)}
            disabled={state.isFetching}
          />
        </div>

        <div className={styles.submit}>
          <div className={styles.feedback}>
            {state.error && <p className={styles.error}>{state.error}</p>}
            {state.isFetching && <p className={styles.loading}>Sauvegarde en cours...</p>}
          </div>

          <button type="submit" disabled={state.isFetching}>
            Réinitialiser
          </button>

          <button
            type="button"
            onClick={handleBackToSignin}
            disabled={state.isFetching}
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