import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from '@/lib/checkout/server/checkout.service';
import { sendOrderEmailSchema } from '@/lib/validations/checkout';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();

    // Valider avec Zod
    const validatedInput = sendOrderEmailSchema.parse(body);

    // Appeler le service
    const result = await sendOrderConfirmationEmail(
      validatedInput.email,
      validatedInput.orderId,
      validatedInput.clientEmailHTML,
      validatedInput.adminEmailHTML
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/checkout/sendEmail]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}