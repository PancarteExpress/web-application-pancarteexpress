'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from '@/lib/auth/useSession';
import { useUser } from './useUser';
import { GroupWithUsers } from '@/lib/types/group';

export function useGroup() {
  const locale = useLocale();
  const { session } = useSession();
  const { user } = useUser();

  const [group, setGroup] = useState<GroupWithUsers | null>(null);
  const [loadingGroup, setLoadingGroup] = useState(false);
  const [errorGroup, setErrorGroup] = useState<string | null>(null);

  useEffect(() => {
    if (!session.authenticated || !user?.groupId) {
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
        setGroup(data as GroupWithUsers);
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
  }, [session.authenticated, locale, user?.groupId]);

  return { group, loadingGroup, errorGroup };
}