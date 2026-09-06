'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, getDefaultGroupName } from '@/lib/auth/utils';
import { signJWT } from '@/lib/auth/jwt';

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
  token?: string;
  redirect?: string;
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

    // Créer user directement (sans verification)
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
        emailVerified: new Date(), // ← Email vérifié immédiatement
      },
    });

    // Générer JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role as 'user' | 'groupAdmin' | 'superAdmin',
      groupId: user.groupId,
    });

    return {
      success: true,
      message: 'Compte créé avec succès',
      token,
      redirect: '/dashboard',
    };
  } catch (error) {
    console.error('Erreur signup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}