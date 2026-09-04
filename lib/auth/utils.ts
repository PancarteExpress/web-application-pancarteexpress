import bcryptjs from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcryptjs.compare(password, hash);
  } catch (error) {
    console.error('Erreur vérification password:', error);
    return false;
  }
}

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

export function getDefaultGroupName(
  companyName: string | null | undefined,
  email: string
): string {
  if (companyName && companyName.trim()) {
    return companyName.trim();
  }
  return email;
}

export function isVerificationCodeExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

export function isVerificationCodeBlocked(attemptsCount: number): boolean {
  return attemptsCount >= 3;
}