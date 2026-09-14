'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from '@/lib/auth/useSession';
import { UserWithoutPassword } from '@/lib/types/auth';

export function useUser() {
  const locale = useLocale();
  const { session } = useSession();
  const [user, setUser] = useState<UserWithoutPassword | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState<string | null>(null);

  useEffect(() => {
    if (!session.authenticated) {
      setUser(null);
      setErrorUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoadingUser(true);
      setErrorUser(null);
      try {
        const res = await fetch(`/api/${locale}/auth/me/profile`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Réponse non-JSON reçue');
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('[useUser]', msg);
        setErrorUser(msg);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [session.authenticated, locale]);

  return { user, loadingUser, errorUser };
}