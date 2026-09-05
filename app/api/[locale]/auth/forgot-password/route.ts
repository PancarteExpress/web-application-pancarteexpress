import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationCode, isVerificationCodeExpired, isVerificationCodeBlocked } from '@/lib/auth/utils';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(
  req: NextRequest,
  { params: _params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si user existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email non trouvé' },
        { status: 404 }
      );
    }

    // Générer code 6 chiffres
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Supprimer ancien code s'il existe
    await prisma.forgotPasswordCode.deleteMany({
      where: { email: email.toLowerCase() },
    });

    // Créer nouveau code
    await prisma.forgotPasswordCode.create({
      data: {
        code,
        email: email.toLowerCase(),
        expiresAt,
      },
    });

    // Envoyer email
    const emailResult = await sendEmail({
      to: user.email,
      subject: 'Réinitialiser votre mot de passe',
      html: `
        <h2>Réinitialisation de mot de passe</h2>
        <p>Entrez ce code pour réinitialiser votre mot de passe:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; text-align: center;">${code}</h1>
        <p>Le code expire dans 15 minutes.</p>
        <p>Pancarte Express</p>
      `,
    });

    if (!emailResult.success) {
      await prisma.forgotPasswordCode.deleteMany({
        where: { email: email.toLowerCase() },
      });
      return NextResponse.json(
        { error: 'Erreur envoi email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Code envoyé par email',
    });
  } catch (error) {
    console.error('Erreur forgot-password:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}