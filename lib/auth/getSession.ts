import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth/jwt';

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return null;
    }

    return {
      authenticated: true,
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      groupId: payload.groupId,
    };
  } catch (err) {
    console.error('[getSession]', err);
    return null;
  }
}