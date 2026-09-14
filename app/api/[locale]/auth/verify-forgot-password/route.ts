import { NextRequest, NextResponse } from 'next/server';
import { verifyForgotPasswordCode } from '@/lib/auth/server/auth.service';
import { verifyForgotPasswordSchema } from '@/lib/validations/password';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;
    const body = await req.json();

    // Valider avec Zod
    const validatedInput = verifyForgotPasswordSchema.parse(body);

    // Appeler le service
    const result = await verifyForgotPasswordCode(
      validatedInput.email,
      validatedInput.code,
      locale
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('[POST /api/auth/verify-forgot-password]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}