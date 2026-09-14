'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { resetPasswordSchema } from '@/lib/validations/password';

export interface UseResetPasswordState {
  password: string;
  confirmPassword: string;
  email: string | null;
  isFetching: boolean;
  error: string | null;
  csrfToken: string | null;
}

export interface UseResetPasswordActions {
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<{ success: boolean }>;
}

export function useResetPassword(
  emailParam: string | null
): [UseResetPasswordState, UseResetPasswordActions] {
  const locale = useLocale();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
        console.error('[useResetPassword] Erreur CSRF:', err);
        setError('Erreur sécurité: token manquant');
      }
    };

    fetchCsrfToken();
  }, [locale]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<{ success: boolean }> => {
      e.preventDefault();
      setError(null);

      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
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

        // Valider avec Zod
        resetPasswordSchema.parse({
          email: emailParam,
          password,
          code: '', // On a déjà vérifié le code, pas besoin ici
        });

        const response = await fetch(`/api/${locale}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            email: emailParam.toLowerCase(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur réinitialisation');
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
    [password, confirmPassword, emailParam, csrfToken, locale]
  );

  const state: UseResetPasswordState = {
    password,
    confirmPassword,
    email: emailParam,
    isFetching,
    error,
    csrfToken,
  };

  const actions: UseResetPasswordActions = {
    setPassword,
    setConfirmPassword,
    handleSubmit,
  };

  return [state, actions];
}