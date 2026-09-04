import Tokens from 'csrf';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isVerificationCodeExpired, isVerificationCodeBlocked } from '@/lib/auth/utils';

const tokens = new Tokens();

export async function POST(
  req: NextRequest,
  { params: params }: { params: { locale: string } }
) {
  try {
    // 1. Vérifier CSRF token
    const csrfToken = req.headers.get('X-CSRF-Token');
    const csrfSecret = req.cookies.get('csrf-secret')?.value;

    if (!csrfToken || !csrfSecret) {
      return NextResponse.json(
        { error: 'Token CSRF manquant' },
        { status: 403 }
      );
    }

    if (!tokens.verify(csrfSecret, csrfToken)) {
      return NextResponse.json(
        { error: 'Token CSRF invalide' },
        { status: 403 }
      );
    }

    // 2. Récupérer le body
    const body = await req.json();
    const { email, code } = body;

    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      );
    }

    // 3. Trouver le VerificationCode
    const verificationCode = await prisma.verificationCode.findFirst({
      where: { email: email.toLowerCase() },
      include: { user: true },
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Code de vérification non trouvé' },
        { status: 404 }
      );
    }

    // 4. Vérifier si bloqué
    if (isVerificationCodeBlocked(verificationCode.attemptsCount ?? 0)) {
      return NextResponse.json(
        { error: 'Compte bloqué. Contactez l\'administrateur.' },
        { status: 403 }
      );
    }

    // 5. Vérifier si expiré
    if (isVerificationCodeExpired(verificationCode.expiresAt)) {
      return NextResponse.json(
        { error: 'Code expiré. Demandez un nouveau code.' },
        { status: 401 }
      );
    }

    // 6. Vérifier le code
    if (verificationCode.code !== code.trim()) {
      // Incrémenter les tentatives échouées
      const newAttemptsCount = (verificationCode.attemptsCount ?? 0) + 1;
      const isNowBlocked = newAttemptsCount >= 3;

      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: {
          attemptsCount: newAttemptsCount,
          isBlocked: isNowBlocked,
        },
      });

      if (isNowBlocked) {
        return NextResponse.json(
          { error: 'Compte bloqué après 3 tentatives. Contactez l\'administrateur.' },
          { status: 403 }
        );
      }

      const remainingAttempts = 3 - newAttemptsCount;
      return NextResponse.json(
        { error: `Code incorrect. ${remainingAttempts} tentative(s) restante(s).` },
        { status: 401 }
      );
    }

    // 7. Code correct ! Marquer l'email comme vérifié
    await prisma.user.update({
      where: { id: verificationCode.userId },
      data: {
        emailVerified: new Date(),
      },
    });

    // 8. Supprimer le code de vérification
    await prisma.verificationCode.delete({
      where: { id: verificationCode.id },
    });

    // 9. Créer response
    const response = NextResponse.json({
      success: true,
      redirect: '/auth/signin',
    });

    // Supprimer le cookie CSRF après utilisation
    response.cookies.delete('csrf-secret');

    return response;
  } catch (error) {
    console.error('Erreur verify-email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}