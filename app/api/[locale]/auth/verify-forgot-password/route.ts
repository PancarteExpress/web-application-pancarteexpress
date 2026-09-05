import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isVerificationCodeExpired, isVerificationCodeBlocked } from '@/lib/auth/utils';

export async function POST(
  _req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await _req.json();
    const { email, code } = body;

    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json(
        { error: 'Email et code requis' },
        { status: 400 }
      );
    }

    // Trouver le code
    const forgotPasswordCode = await prisma.forgotPasswordCode.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!forgotPasswordCode) {
      return NextResponse.json(
        { error: 'Code non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si bloqué
    if (isVerificationCodeBlocked(forgotPasswordCode.attemptsCount ?? 0)) {
      return NextResponse.json(
        { error: 'Compte bloqué. Demandez un nouveau code.' },
        { status: 403 }
      );
    }

    // Vérifier si expiré
    if (isVerificationCodeExpired(forgotPasswordCode.expiresAt)) {
      return NextResponse.json(
        { error: 'Code expiré' },
        { status: 401 }
      );
    }

    // Vérifier le code
    if (forgotPasswordCode.code !== code.trim()) {
      const newAttemptsCount = (forgotPasswordCode.attemptsCount ?? 0) + 1;
      const isNowBlocked = newAttemptsCount >= 3;

      await prisma.forgotPasswordCode.update({
        where: { email: email.toLowerCase() },
        data: {
          attemptsCount: newAttemptsCount,
          isBlocked: isNowBlocked,
        },
      });

      if (isNowBlocked) {
        return NextResponse.json(
          { error: 'Compte bloqué après 3 tentatives' },
          { status: 403 }
        );
      }

      const remainingAttempts = 3 - newAttemptsCount;
      return NextResponse.json(
        { error: `Code incorrect. ${remainingAttempts} tentative(s) restante(s).` },
        { status: 401 }
      );
    }

    // Code correct !
    return NextResponse.json({
      success: true,
      message: 'Code vérifié',
    });
  } catch (error) {
    console.error('Erreur verify-forgot-password:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}