'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

export interface UseVerifyEmailState {
  code: string;
  email: string | null;
  isFetching: boolean;
  error: string | null;
  csrfToken: string | null;
  shouldRedirect: boolean;
}

export interface UseVerifyEmailActions {
  setCode: (code: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<{ success: boolean }>;
}

export function useVerifyEmail(
  emailParam: string | null,
  onRedirect?: (path: string) => void
): [UseVerifyEmailState, UseVerifyEmailActions] {
  const locale = useLocale();

  const [code, setCode] = useState('');
  const [email, setEmail] = useState<string | null>(emailParam);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('pendingVerificationEmail');

    if (!emailParam) {
      if (storedEmail) {
        setEmail(storedEmail);
      } else if (onRedirect) {
        setShouldRedirect(true);
        onRedirect(`/${locale}/auth/signup`);
      }
    }
  }, [emailParam, locale, onRedirect]);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch(`/api/${locale}/auth/csrf`);
        const data = await res.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error('[useVerifyEmail] Erreur CSRF:', err);
        setError('Erreur sécurité: token manquant');
      }
    };

    fetchCsrfToken();
  }, [locale]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<{ success: boolean }> => {
      e.preventDefault();
      setError(null);

      if (!code.trim()) {
        setError('Code requis');
        return { success: false };
      }

      if (code.trim().length !== 6) {
        setError('Le code doit contenir 6 chiffres');
        return { success: false };
      }

      if (!csrfToken) {
        setError('Erreur sécurité: token manquant');
        return { success: false };
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
            email: email!.toLowerCase(),
            code: code.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur vérification');
          return { success: false };
        }

        return { success: true };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        setError(msg);
        return { success: false };
      } finally {
        setIsFetching(false);
      }
    },
    [code, emailParam, csrfToken, locale]
  );

  const state: UseVerifyEmailState = {
    code,
    email,
    isFetching,
    error,
    csrfToken,
    shouldRedirect,
  };

  const actions: UseVerifyEmailActions = {
    setCode,
    handleSubmit,
  };

  return [state, actions];
}