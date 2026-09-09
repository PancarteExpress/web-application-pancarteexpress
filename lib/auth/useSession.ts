import { useEffect, useState, useCallback } from 'react';
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

  // Fonction pour vérifier la session
  const checkSession = useCallback(async () => {
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
  }, [locale]);

  // Vérifier au montage
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // ✅ Ajouter un listener pour les changements
  useEffect(() => {
    // Écouter les changements de session
    const handleSessionChange = () => {
      checkSession();
    };

    // Dispatcher custom event au logout
    window.addEventListener('session-changed', handleSessionChange);
    
    // Aussi vérifier avant de quitter la page
    window.addEventListener('focus', handleSessionChange);

    return () => {
      window.removeEventListener('session-changed', handleSessionChange);
      window.removeEventListener('focus', handleSessionChange);
    };
  }, [checkSession]);

  return { session, loading };
}