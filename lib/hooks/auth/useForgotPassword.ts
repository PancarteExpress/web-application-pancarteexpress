'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

export interface UseForgotPasswordState {
  email: string;
  isFetching: boolean;
  error: string | null;
  csrfToken: string | null;
}

export interface UseForgotPasswordActions {
  setEmail: (email: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<{ success: boolean; email?: string }>;
}

export function useForgotPassword(): [UseForgotPasswordState, UseForgotPasswordActions] {
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch(`/api/${locale}/auth/csrf`);
        const data = await res.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error('[useForgotPassword] Erreur CSRF:', err);
        setError('Erreur sécurité: token manquant');
      }
    };

    fetchCsrfToken();
  }, [locale]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<{ success: boolean; email?: string }> => {
      e.preventDefault();
      setError(null);

      if (!email.trim()) {
        setError('Email requis');
        return { success: false };
      }

      if (!csrfToken) {
        setError('Erreur sécurité: token manquant');
        return { success: false };
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
          return { success: false };
        }

        return { success: true, email: email.trim().toLowerCase() };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        setError(msg);
        return { success: false };
      } finally {
        setIsFetching(false);
      }
    },
    [email, csrfToken, locale]
  );

  const state: UseForgotPasswordState = {
    email,
    isFetching,
    error,
    csrfToken,
  };

  const actions: UseForgotPasswordActions = {
    setEmail,
    handleSubmit,
  };

  return [state, actions];
}