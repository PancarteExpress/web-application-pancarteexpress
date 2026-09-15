'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

export interface UseSignInState {
  email: string;
  password: string;
  rememberMe: boolean;
  isFetching: boolean;
  error: string | null;
  csrfToken: string | null;
}

export interface UseSignInActions {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setRememberMe: (remember: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<{ success: boolean; redirect?: string }>;
}

export function useSignIn(): [UseSignInState, UseSignInActions] {
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const res = await fetch(`/api/${locale}/auth/csrf`);
        const data = await res.json();
        setCsrfToken(data.token);
      } catch (err) {
        console.error('[useSignIn] Erreur récupération CSRF:', err);
        setError('Erreur sécurité: impossible de charger le token');
      }
    };

    fetchCsrfToken();
  }, [locale]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent): Promise<{ success: boolean; redirect?: string }> => {
      e.preventDefault();
      setError(null);

      // Validation
      if (!email.trim()) {
        setError('Email requis');
        return { success: false };
      }

      if (!password.trim()) {
        setError('Mot de passe requis');
        return { success: false };
      }

      if (!csrfToken) {
        setError('Erreur sécurité: token manquant');
        return { success: false };
      }

      try {
        setIsFetching(true);

        const response = await fetch(`/api/${locale}/auth/signin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            rememberMe,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erreur connexion');
          // ✅ NOUVEAU: Retourner le redirect aussi
          return { 
            success: false, 
            redirect: data.redirect  // ← Capturer ici
          };
        }

        return { success: true, redirect: data.redirect };
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur réseau';
        setError(msg);
        return { success: false };
      } finally {
        setIsFetching(false);
      }
    },
    [email, password, rememberMe, csrfToken, locale]
  );

  const state: UseSignInState = {
    email,
    password,
    rememberMe,
    isFetching,
    error,
    csrfToken,
  };

  const actions: UseSignInActions = {
    setEmail,
    setPassword,
    setRememberMe,
    handleSubmit,
  };

  return [state, actions];
}