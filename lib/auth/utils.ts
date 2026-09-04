import * as argon2 from 'argon2';

/**
 * Hash un password avec Argon2
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

/**
 * Vérifie un password contre un hash Argon2
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (error) {
    console.error('Erreur vérification password:', error);
    return false;
  }
}

/**
 * Génère un code 6 chiffres aléatoire
 * - Pas de 0
 * - Pas de chiffres consécutifs identiques (ex: pas 933912)
 */
export function generateVerificationCode(): string {
  const validDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let code = '';

  for (let i = 0; i < 6; i++) {
    let digit: string;
    do {
      digit = validDigits[Math.floor(Math.random() * validDigits.length)];
    } while (i > 0 && code[i - 1] === digit);
    code += digit;
  }

  return code;
}

/**
 * Détermine le nom du groupe par défaut
 * - Si companyName existe → companyName
 * - Sinon → email
 */
export function getDefaultGroupName(
  companyName: string | null | undefined,
  email: string
): string {
  if (companyName && companyName.trim()) {
    return companyName.trim();
  }
  return email;
}

/**
 * Vérifie si un code de vérification est expiré
 */
export function isVerificationCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Vérifie si un compte est bloqué (3 tentatives échouées)
 */
export function isVerificationCodeBlocked(attemptsCount: number): boolean {
  return attemptsCount >= 3;
}