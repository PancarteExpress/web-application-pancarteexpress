import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/checkout/server/checkout.service';
import { createPaymentIntentSchema } from '@/lib/validations/checkout';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();

    // Valider avec Zod
    const validatedInput = createPaymentIntentSchema.parse(body);

    // Appeler le service
    const result = await createPaymentIntent(validatedInput.amount);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
    });
  } catch (error) {
    console.error('[POST /api/checkout]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}