'use client';

import styles from '../signin/page.module.css';
import { useLocale, useTranslations } from 'next-intl';
import { FaHouseChimney } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useForgotPassword } from '@/lib/hooks/auth/useForgotPassword';

export default function ForgotPasswordPage() {
  const t = useTranslations('connection');
  const locale = useLocale();
  const router = useRouter();

  const [state, actions] = useForgotPassword();

  const handleSubmitWrapper = async (e: React.FormEvent) => {
  const result = await actions.handleSubmit(e);
  // ✅ NOUVEAU: Vérifier que result.email existe avant redirection
  if (result.success && result.email) {
    setTimeout(() => {
      router.push(`/${locale}/auth/verify-forgot-password?email=${encodeURIComponent(result.email!)}`);
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
            value={state.email}
            onChange={(e) => actions.setEmail(e.target.value)}
            disabled={state.isFetching}
          />
        </div>

        <div className={styles.submit}>
          <div className={styles.feedback}>
            {state.error && <p className={styles.error}>{state.error}</p>}
            {state.isFetching && <p className={styles.loading}>Tentative d'envoi en cours...</p>}
          </div>

          <button type="submit" disabled={state.isFetching}>
            Envoyer le code
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