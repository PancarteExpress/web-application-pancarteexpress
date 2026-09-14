import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/auth/server/auth.service';
import { resetPasswordSchema } from '@/lib/validations/password';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const { locale } = await params;
    const body = await req.json();

    // Valider avec Zod
    const validatedInput = resetPasswordSchema.parse(body);

    // Appeler le service
    const result = await resetPassword(
      validatedInput.email,
      validatedInput.password,
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
      redirect: result.redirect,
    });
  } catch (error) {
    console.error('[POST /api/auth/reset-password]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}