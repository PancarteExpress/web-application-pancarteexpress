import { prisma } from '@/lib/prisma';
import { signJWT, verifyJWT } from '@/lib/auth/jwt';
import { hashPassword, verifyPassword, generateVerificationCode, getDefaultGroupName, isVerificationCodeExpired, isVerificationCodeBlocked } from '@/lib/auth/utils';
import { sendEmail } from '@/lib/sendEmail';
import { signInSchema, signUpSchema } from '@/lib/validations/auth';
import { UserRole, type AuthResponse, type UserWithoutPassword, type SuperAdminWithoutPassword } from '@/lib/types/auth';
import { AUTH_ERRORS } from '@/lib/constants/auth';

const VERIFICATION_CODE_EXPIRY_MINUTES = 15;

/**
 * Génère le HTML pour l'email de vérification
 */
function generateVerificationEmailHTML(code: string, locale: string): string {
  const message = locale === 'fr' 
    ? `Votre code de vérification est: <strong>${code}</strong>. Ce code expire dans 15 minutes.`
    : `Your verification code is: <strong>${code}</strong>. This code expires in 15 minutes.`;

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>${locale === 'fr' ? 'Vérification email' : 'Email Verification'}</h2>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Sign in utilisateur ou SuperAdmin
 */
export async function signInUser(
  input: unknown,
  locale: string = 'fr'
): Promise<AuthResponse> {
  try {
    // Validation avec Zod
    const validatedInput = signInSchema.parse(input);
    const { email, password, rememberMe } = validatedInput;

    // Chercher SuperAdmin d'abord
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (superAdmin) {
      const isPasswordValid = await verifyPassword(password, superAdmin.passwordHash);
      if (!isPasswordValid) {
        return {
          success: false,
          error: AUTH_ERRORS.INVALID_CREDENTIALS,
        };
      }

      const token = await signJWT({
        userId: superAdmin.id,
        email: superAdmin.email,
        role: UserRole.SUPER_ADMIN,
      });

      return {
        success: true,
        token,
        redirect: '/dashboard',
      };
    }

    // Chercher User standard
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { group: true },
    });

    if (!user) {
      return {
        success: false,
        error: AUTH_ERRORS.INVALID_CREDENTIALS,
      };
    }

    // Vérifier email vérifié
    if (!user.emailVerified) {
      return {
        success: false,
        error: AUTH_ERRORS.EMAIL_NOT_VERIFIED,
      };
    }

    // Vérifier password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: AUTH_ERRORS.INVALID_CREDENTIALS,
      };
    }

    // Créer JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: (user.role as UserRole) || UserRole.USER,
      groupId: user.groupId || undefined,
    });

    return {
      success: true,
      token,
      redirect: '/dashboard',
    };
  } catch (error) {
    console.error('[signInUser]', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: AUTH_ERRORS.MISSING_CREDENTIALS,
      };
    }
    return {
      success: false,
      error: AUTH_ERRORS.SERVER_ERROR,
    };
  }
}

/**
 * Sign up nouvel utilisateur
 */
export async function signUpUser(
  input: unknown,
  locale: string = 'fr'
): Promise<AuthResponse> {
  try {
    // Validation avec Zod
    const validatedInput = signUpSchema.parse(input);
    const { email, password, firstName, lastName, phone, companyName, isGroup, groupName } = validatedInput;

    // Vérifier si email existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: AUTH_ERRORS.EMAIL_ALREADY_EXISTS,
      };
    }

    // Déterminer le groupe
    let group;
    let isNewGroup = false;

    if (isGroup && groupName?.trim()) {
      group = await prisma.group.findFirst({
        where: {
          name: {
            equals: groupName.trim(),
            mode: 'insensitive',
          },
        },
      });

      if (!group) {
        group = await prisma.group.create({
          data: { name: groupName.trim() },
        });
        isNewGroup = true;
      }
    } else {
      // Groupe solo
      const defaultGroupName = getDefaultGroupName(companyName, email);
      group = await prisma.group.create({
        data: { name: defaultGroupName },
      });
      isNewGroup = true;
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Créer user (emailVerified: null pour forcer vérification)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        companyName: companyName?.trim() || null,
        groupId: group.id,
        role: isNewGroup ? UserRole.GROUP_ADMIN : UserRole.USER,
        emailVerified: null, // Pas vérifié au départ
      },
      include: { group: true },
    });

    // Générer code de vérification
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    // Sauvegarder code
    await prisma.verificationCode.upsert({
      where: { userId: user.id },
      update: {
        code: verificationCode,
        expiresAt,
        attemptsCount: 0,
        isBlocked: false,
      },
      create: {
        code: verificationCode,
        email: user.email,
        userId: user.id,
        expiresAt,
      },
    });

    // Envoyer email
    const emailHTML = generateVerificationEmailHTML(verificationCode, locale);
    await sendEmail({
      to: user.email,
      subject: locale === 'fr' ? 'Vérifiez votre email' : 'Verify your email',
      html: emailHTML,
    });

    return {
      success: true,
      message: locale === 'fr' 
        ? 'Compte créé. Vérifiez votre email pour confirmer.'
        : 'Account created. Check your email to verify.',
      redirect: '/auth/verify-email',
    };
  } catch (error) {
    console.error('[signUpUser]', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        success: false,
        error: AUTH_ERRORS.MISSING_CREDENTIALS,
      };
    }
    return {
      success: false,
      error: AUTH_ERRORS.SERVER_ERROR,
    };
  }
}

/**
 * Vérifier code email et marquer l'email comme vérifié
 */
export async function verifyEmailCode(
  email: string,
  code: string,
  locale: string = 'fr'
): Promise<AuthResponse> {
  try {
    // Récupérer l'user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { verificationCodes: true },
    });

    if (!user) {
      return {
        success: false,
        error: locale === 'fr' ? 'Utilisateur introuvable' : 'User not found',
      };
    }

    // Récupérer code de vérification
    const verificationRecord = user.verificationCodes[0];

    if (!verificationRecord) {
      return {
        success: false,
        error: locale === 'fr' ? 'Code expiré ou invalide' : 'Code expired or invalid',
      };
    }

    // Vérifier si bloqué
    if (isVerificationCodeBlocked(verificationRecord.attemptsCount)) {
      return {
        success: false,
        error: locale === 'fr' 
          ? 'Trop de tentatives. Demandez un nouveau code.'
          : 'Too many attempts. Request a new code.',
      };
    }

    // Vérifier expiration
    if (isVerificationCodeExpired(verificationRecord.expiresAt)) {
      return {
        success: false,
        error: locale === 'fr' ? 'Code expiré' : 'Code expired',
      };
    }

    // Vérifier code
    if (verificationRecord.code !== code) {
      // Incrémenter tentatives
      await prisma.verificationCode.update({
        where: { id: verificationRecord.id },
        data: { attemptsCount: { increment: 1 } },
      });

      return {
        success: false,
        error: locale === 'fr' ? 'Code incorrect' : 'Incorrect code',
      };
    }

    // Marquer email comme vérifié
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    });

    // Supprimer code de vérification
    await prisma.verificationCode.delete({
      where: { id: verificationRecord.id },
    });

    return {
      success: true,
      message: locale === 'fr' 
        ? 'Email vérifié avec succès'
        : 'Email verified successfully',
      redirect: '/auth/signin',
    };
  } catch (error) {
    console.error('[verifyEmailCode]', error);
    return {
      success: false,
      error: AUTH_ERRORS.SERVER_ERROR,
    };
  }
}

/**
 * Générer le HTML pour l'email de reset password
 */
function generateResetPasswordEmailHTML(code: string, locale: string): string {
  const message = locale === 'fr' 
    ? `Votre code de réinitialisation est: <strong>${code}</strong>. Ce code expire dans 15 minutes.`
    : `Your reset code is: <strong>${code}</strong>. This code expires in 15 minutes.`;

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>${locale === 'fr' ? 'Réinitialisation de mot de passe' : 'Password Reset'}</h2>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Demander réinitialisation de mot de passe
 */
export async function forgotPassword(
  email: string,
  locale: string = 'fr'
): Promise<AuthResponse> {
  try {
    // Validation
    if (!email?.trim()) {
      return {
        success: false,
        error: locale === 'fr' ? 'Email requis' : 'Email required',
      };
    }

    // Vérifier si user existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        success: false,
        error: locale === 'fr' ? "Cet email n'est pas enregistré" : 'Email not found',
      };
    }

    // Générer code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);

    // Supprimer ancien code et créer nouveau
    await prisma.forgotPasswordCode.deleteMany({
      where: { email: email.toLowerCase() },
    });

    await prisma.forgotPasswordCode.create({
      data: {
        code,
        email: email.toLowerCase(),
        expiresAt,
      },
    });

    // Envoyer email
    const emailHTML = generateResetPasswordEmailHTML(code, locale);
    const emailResult = await sendEmail({
      to: user.email,
      subject: locale === 'fr' ? 'Réinitialiser votre mot de passe' : 'Reset your password',
      html: emailHTML,
    });

    if (!emailResult.success) {
      await prisma.forgotPasswordCode.deleteMany({
        where: { email: email.toLowerCase() },
      });
      return {
        success: false,
        error: locale === 'fr' ? 'Erreur envoi email' : 'Email send failed',
      };
    }

    return {
      success: true,
      message: locale === 'fr' ? 'Code envoyé par email' : 'Code sent to email',
    };
  } catch (error) {
    console.error('[forgotPassword]', error);
    return {
      success: false,
      error: AUTH_ERRORS.SERVER_ERROR,
    };
  }
}

/**
 * Vérifier code de reset password
 */
export async function verifyForgotPasswordCode(
  email: string,
  code: string,
  locale: string = 'fr'
): Promise<AuthResponse> {
  try {
    if (!email?.trim() || !code?.trim()) {
      return {
        success: false,
        error: locale === 'fr' ? 'Email et code requis' : 'Email and code required',
      };
    }

    // Trouver le code
    const forgotPasswordRecord = await prisma.forgotPasswordCode.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!forgotPasswordRecord) {
      return {
        success: false,
        error: locale === 'fr' ? 'Code non trouvé' : 'Code not found',
      };
    }

    // Vérifier si bloqué
    if (isVerificationCodeBlocked(forgotPasswordRecord.attemptsCount)) {
      return {
        success: false,
        error: locale === 'fr' 
          ? 'Trop de tentatives. Demandez un nouveau code.' 
          : 'Too many attempts. Request a new code.',
      };
    }

    // Vérifier si expiré
    if (isVerificationCodeExpired(forgotPasswordRecord.expiresAt)) {
      return {
        success: false,
        error: locale === 'fr' ? 'Code expiré' : 'Code expired',
      };
    }

    // Vérifier le code
    if (forgotPasswordRecord.code !== code.trim()) {
      const newAttemptsCount = forgotPasswordRecord.attemptsCount + 1;
      const isNowBlocked = newAttemptsCount >= 3;

      await prisma.forgotPasswordCode.update({
        where: { email: email.toLowerCase() },
        data: {
          attemptsCount: newAttemptsCount,
          isBlocked: isNowBlocked,
        },
      });

      if (isNowBlocked) {
        return {
          success: false,
          error: locale === 'fr' 
            ? 'Compte bloqué après 3 tentatives' 
            : 'Account blocked after 3 attempts',
        };
      }

      const remainingAttempts = 3 - newAttemptsCount;
      return {
        success: false,
        error: locale === 'fr'
          ? `Code incorrect. ${remainingAttempts} tentative(s) restante(s).`
          : `Incorrect code. ${remainingAttempts} attempt(s) remaining.`,
      };
    }

    return {
      success: true,
      message: locale === 'fr' ? 'Code vérifié' : 'Code verified',
    };
  } catch (error) {
    console.error('[verifyForgotPasswordCode]', error);
    return {
      success: false,
      error: AUTH_ERRORS.SERVER_ERROR,
    };
  }
}

/**
 * Réinitialiser le mot de passe
 */
export async function resetPassword(
  email: string,
  password: string,
  locale: string = 'fr'
): Promise<AuthResponse> {
  try {
    // Validation
    if (!email?.trim() || !password?.trim()) {
      return {
        success: false,
        error: AUTH_ERRORS.MISSING_CREDENTIALS,
      };
    }

    if (password.length < 8) {
      return {
        success: false,
        error: locale === 'fr' 
          ? 'Le mot de passe doit contenir au moins 8 caractères'
          : 'Password must be at least 8 characters',
      };
    }

    // Vérifier que le code a été validé
    const forgotPasswordRecord = await prisma.forgotPasswordCode.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!forgotPasswordRecord) {
      return {
        success: false,
        error: locale === 'fr' ? 'Code non valide ou expiré' : 'Code invalid or expired',
      };
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return {
        success: false,
        error: locale === 'fr' ? 'Utilisateur non trouvé' : 'User not found',
      };
    }

    // Hash nouveau password
    const passwordHash = await hashPassword(password);

    // Mettre à jour le password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Supprimer le code utilisé
    await prisma.forgotPasswordCode.delete({
      where: { email: email.toLowerCase() },
    });

    return {
      success: true,
      message: locale === 'fr' ? 'Mot de passe réinitialisé' : 'Password reset successfully',
      redirect: '/auth/signin',
    };
  } catch (error) {
    console.error('[resetPassword]', error);
    return {
      success: false,
      error: AUTH_ERRORS.SERVER_ERROR,
    };
  }
}

/**
 * Récupérer le profil complet de l'utilisateur
 */
export async function getUserProfile(
  userId: string
): Promise<UserWithoutPassword | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        shippingAddress: true,
        groupId: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user as UserWithoutPassword | null;
  } catch (error) {
    console.error('[getUserProfile]', error);
    return null;
  }
}