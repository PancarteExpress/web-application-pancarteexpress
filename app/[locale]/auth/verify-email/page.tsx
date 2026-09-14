'use client';

import styles from '../signin/page.module.css';
import { useLocale } from 'next-intl';
import { FaHouseChimney } from 'react-icons/fa6';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useVerifyEmail } from '@/lib/hooks/auth/useVerifyEmail';

function VerifyEmailClient() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  // ✅ NOUVEAU: Utiliser le hook
  const [state, actions] = useVerifyEmail(email);

  // ✅ NOUVEAU: Wrapper pour redirection
  const handleSubmitWrapper = async (e: React.FormEvent) => {
    const result = await actions.handleSubmit(e);
    if (result.success) {
      setTimeout(() => {
        router.push(`/${locale}/auth/signin`);
      }, 500);
    }
  };

  const handleBackToSignup = () => {
    router.push(`/${locale}/auth/signup`);
  };

  if (state.shouldRedirect) return <div>Redirection...</div>;

  return (
    <form className={styles.connectionForm} onSubmit={handleSubmitWrapper}>
      <fieldset className={styles.credentials}>
        <div className={styles.connectionHeader}>
          <FaHouseChimney size={30} style={{ color: '#0E4D9A' }} />
          <label>Vérifier votre email</label>
        </div>

        <p style={{ textAlign: 'center', color: '#5F7FA8', fontSize: '14px', marginBottom: '20px' }}>
          Entrez le code 6 chiffres envoyé à :
          <br />
          <strong>{state.email}</strong>
        </p>

        <div className={styles.inputs}>
          <label htmlFor="code">Code de vérification</label>
          <input
            id="code"
            type="text"
            placeholder="123456"
            value={state.code}
            onChange={(e) => actions.setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            disabled={state.isFetching}
          />
        </div>

        <div className={styles.submit}>
          <div className={styles.feedback}>
            {state.error && <p className={styles.error}>{state.error}</p>}
            {state.isFetching && <p className={styles.loading}>Vérification en cours...</p>}
          </div>

          <button type="submit" disabled={state.isFetching}>
            Vérifier
          </button>

          <button
            type="button"
            onClick={handleBackToSignup}
            disabled={state.isFetching}
            style={{
              all: 'unset',
              color: '#0E4D9A',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: state.isFetching ? 0.5 : 1,
            }}
          >
            Retour
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyEmailClient />
    </Suspense>
  );
}