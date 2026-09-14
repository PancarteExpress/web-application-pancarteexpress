import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/checkout/server/checkout.service';
import { createOrderPaymentSchema } from '@/lib/validations/checkout';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();

    // Valider avec Zod
    const validatedInput = createOrderPaymentSchema.parse(body);

    // Appeler le service
    const result = await createOrder(
      validatedInput.email,
      validatedInput.items,
      validatedInput.subtotal,
      validatedInput.tax,
      validatedInput.total,
      validatedInput.shippingAddress
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.order!.id,
      orderNumber: result.order!.orderNumber,
    });
  } catch (error) {
    console.error('[POST /api/checkout/create-payment]', error);
    const msg = error instanceof Error ? error.message : 'Erreur serveur';
    return NextResponse.json(
      { error: msg },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
}