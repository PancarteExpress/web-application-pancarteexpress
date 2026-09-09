import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from '@/lib/auth/useSession';

type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  companyName?: string;
  shippingAddress? : string;
  groupId: string;
  role: string;
};

export function useUser() {
  const locale = useLocale();
  const { session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    if (!session.authenticated) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const res = await fetch(`/api/${locale}/auth/me/profile`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('[useUser]', err);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [session.authenticated, locale]);

  return { user, loadingUser };
}