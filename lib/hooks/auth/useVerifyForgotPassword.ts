'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

export interface UseVerifyForgotPasswordState {
  code: string;
  email: string | null;
  isFetching: boolean;
  error: string | null;
  attemptsLeft: number;
  csrfToken: string | null;
}

export interface UseVerifyForgotPasswordActions {
  setCode: (code: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<{ success: boolean }>;
}

export function useVerifyForgotPassword(
  emailParam: string | null
): [UseVerifyForgotPasswordState, UseVerifyForgotPasswordActions] {
  const locale = useLocale();

  const [code, setCode] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch(`/api/${locale}/auth/csrf`);
        const data = await res.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error('[useVerifyForgotPassword] Erreur CSRF:', err);
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

      if (!emailParam) {
        setError('Email manquant');
        return { success: false };
      }

      try {
        setIsFetching(true);

        const response = await fetch(`/api/${locale}/auth/verify-forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            email: emailParam.toLowerCase(),
            code: code.trim(),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur vérification');
          if (data.attemptsLeft !== undefined) {
            setAttemptsLeft(data.attemptsLeft);
          }
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

  const state: UseVerifyForgotPasswordState = {
    code,
    email: emailParam,
    isFetching,
    error,
    attemptsLeft,
    csrfToken,
  };

  const actions: UseVerifyForgotPasswordActions = {
    setCode,
    handleSubmit,
  };

  return [state, actions];
}