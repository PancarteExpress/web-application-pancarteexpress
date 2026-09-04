import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export type JWTPayload = {
  userId: string;
  email: string;
  role: 'superAdmin' | 'user' | 'groupAdmin';
  groupId?: string;
};

/**
 * Signe et crée un JWT token
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);
}

/**
 * Vérifie et décode un JWT token
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as JWTPayload;
  } catch (error) {
    console.error('Erreur JWT verification:', error);
    return null;
  }
}