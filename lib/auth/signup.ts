'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, generateVerificationCode, getDefaultGroupName } from '@/lib/auth/utils';
import { sendEmail } from '../sendEmail';

type SignupInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  companyName?: string;
  isGroup: boolean;
  groupName?: string;
};

type SignupResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function signup(input: SignupInput): Promise<SignupResult> {
  try {
    // Validation
    if (!input.firstName?.trim() || !input.lastName?.trim() || !input.phone?.trim() || !input.email?.trim() || !input.password?.trim()) {
      return { success: false, error: 'Tous les champs obligatoires doivent être remplis' };
    }

    // Vérifier si email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: 'Cet email est déjà utilisé' };
    }

    // Déterminer le groupe
    let group;

    if (input.isGroup && input.groupName?.trim()) {
      // Chercher groupe existant (exact match)
      group = await prisma.group.findFirst({
        where: {
          name: {
            equals: input.groupName.trim(),
            mode: 'insensitive',
          },
        },
      });

      // Si n'existe pas, créer
      if (!group) {
        group = await prisma.group.create({
          data: {
            name: input.groupName.trim(),
          },
        });
      }
    } else {
      // Groupe solo : utiliser companyName ou email
      const groupName = getDefaultGroupName(input.companyName, input.email);

      group = await prisma.group.create({
        data: {
          name: groupName,
        },
      });
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Créer user
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        companyName: input.companyName?.trim() || null,
        groupId: group.id,
        role: input.isGroup && input.groupName ? 'user' : 'groupAdmin',
      },
    });

    // Générer code 6 chiffres
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Créer VerificationCode
    await prisma.verificationCode.create({
      data: {
        code,
        email: user.email,
        userId: user.id,
        expiresAt,
      },
    });

    // Envoyer email avec code
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Vérifiez votre email - Code de confirmation',
      html: `
        <h2>Bienvenue ${user.firstName} ${user.lastName},</h2>
        <p>Entrez ce code pour activer votre compte:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center;">${code}</h1>
        <p>Le code expire dans 15 minutes.</p>
        <p>Pancarte Express</p>
      `,
    });

    if (!emailResult.success) {
      // Supprimer l'user s'il y a erreur email
      await prisma.user.delete({ where: { id: user.id } });
      return { success: false, error: 'Erreur lors de l\'envoi de l\'email' };
    }

    return {
      success: true,
      message: 'Compte créé. Vérifiez votre email pour le code de confirmation',
    };
  } catch (error) {
    console.error('Erreur signup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}