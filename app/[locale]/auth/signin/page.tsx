'use client';

import styles from './page.module.css';
import { useLocale, useTranslations } from 'next-intl';
import { FaHouseChimney } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@/lib/hooks/auth/useSignIn';

export default function SigninPage() {
  const t = useTranslations('connection');
  const feedbackMessages = useTranslations('connection.feedbackMessages');

  const locale = useLocale();
  const router = useRouter();

  const [state, actions] = useSignIn();

  const handleBecomeMember = () => {
    router.push(`/${locale}/auth/signup`);
  };

  const handleNewPassword = () => {
    router.push(`/${locale}/auth/forgot-password`);
  };

  const handleSubmitWrapper = async (e: React.FormEvent) => {
    const result = await actions.handleSubmit(e);
    if (result.success && result.redirect) {
      setTimeout(() => {
        window.location.href = `/${locale}${result.redirect}`;
      }, 500);
    }
  };

  return (
    <form className={styles.connectionForm} onSubmit={handleSubmitWrapper}>
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
            value={state.email}
            onChange={(e) => actions.setEmail(e.target.value)}
            disabled={state.isFetching}
          />
        </div>

        <div className={styles.inputs}>
          <label htmlFor="password">{t('password')}</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={state.password}
            onChange={(e) => actions.setPassword(e.target.value)}
            disabled={state.isFetching}
          />
        </div>

        <div style={{ marginBottom: '15px', marginTop: '-5px' }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={state.rememberMe}
            onChange={(e) => actions.setRememberMe(e.target.checked)}
            disabled={state.isFetching}
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
            disabled={state.isFetching}
          >
            {t('passwordForgotten')}
          </button>
        </div>

        <div className={styles.submit}>
          <div className={styles.feedback}>
            {state.error && <p className={styles.error}>{state.error}</p>}
            {state.isFetching && (
              <p className={styles.loading}>Tentative de connexion en cours...</p>
            )}
          </div>

          <button type="submit" disabled={state.isFetching}>
            {t('connect')}
          </button>

          <label>{t('noAccount')}</label>

          <button
            type="button"
            className={styles.becomeMember}
            onClick={handleBecomeMember}
            disabled={state.isFetching}
          >
            {t('createOne')}
          </button>
        </div>
      </fieldset>
    </form>
  );
}