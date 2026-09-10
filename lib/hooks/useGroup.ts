import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from '@/lib/auth/useSession';
import { useUser } from './useUser';

type GroupData = {
  id: string;
  name: string;
  users: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyName?: string;
    shippingAddress?: string;
    role: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export function useGroup() {
  const locale = useLocale();
  const { session } = useSession();
  const { user } = useUser(); // ✅ Dépend du user pour groupId
  
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [errorGroup, setErrorGroup] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Conditions : auth + user chargé + a un groupId
    if (!session.authenticated || !user || !user.groupId) {
      setGroup(null);
      setErrorGroup(null);
      return;
    }

    const fetchGroup = async () => {
      setLoadingGroup(true);
      setErrorGroup(null);
      try {
        const res = await fetch(`/api/${locale}/groups/${user.groupId}`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const contentType = res.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error('Réponse non-JSON reçue');
        }

        const data = await res.json();
        setGroup(data);

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue';
        console.error('[useGroup]', msg);
        setErrorGroup(msg);
        setGroup(null);
      } finally {
        setLoadingGroup(false);
      }
    };

    fetchGroup();
  }, [session.authenticated, locale, user?.groupId]); // ✅ Re-fetch si groupId change

  return { group, loadingGroup, errorGroup };
}