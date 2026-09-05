import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/utils';

export async function POST(
  _req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await _req.json();
    const { email, password } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // Vérifier que le code existe (a été validé)
    const forgotPasswordCode = await prisma.forgotPasswordCode.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!forgotPasswordCode) {
      return NextResponse.json(
        { error: 'Code non valide ou expiré' },
        { status: 401 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Hash le nouveau password
    const passwordHash = await hashPassword(password);

    // Mettre à jour le password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Supprimer le code
    await prisma.forgotPasswordCode.delete({
      where: { email: email.toLowerCase() },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé',
      redirect: '/auth/signin',
    });
  } catch (error) {
    console.error('Erreur reset-password:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}