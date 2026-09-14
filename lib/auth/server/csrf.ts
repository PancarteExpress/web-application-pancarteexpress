import Tokens from 'csrf';
import { NextRequest } from 'next/server';

const tokens = new Tokens();

export type CsrfVerifyResult = {
  valid: boolean;
  error?: string;
};

/**
 * Vérifie le CSRF token depuis la requête
 */
export async function verifyCsrfToken(req: NextRequest): Promise<CsrfVerifyResult> {
  const csrfToken = req.headers.get('X-CSRF-Token');
  const csrfSecret = req.cookies.get('csrf-secret')?.value;

  if (!csrfToken || !csrfSecret) {
    return {
      valid: false,
      error: 'Token CSRF manquant',
    };
  }

  if (!tokens.verify(csrfSecret, csrfToken)) {
    return {
      valid: false,
      error: 'Token CSRF invalide',
    };
  }

  return { valid: true };
}