import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

type Session = {
  authenticated: boolean;
  userId?: string;
  email?: string;
  role?: string;
  groupId?: string;
};

export function useSession() {
  const locale = useLocale();
  const [session, setSession] = useState<Session>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(`/api/${locale}/auth/me`);
        const data = await res.json();
        setSession(data);
      } catch (err) {
        console.error('Erreur vérification session:', err);
        setSession({ authenticated: false });
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [locale]);

  return { session, loading };
}