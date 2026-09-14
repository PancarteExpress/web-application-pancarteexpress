import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/checkout/server/checkout.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const body = await req.json();
    const { orderId, total, email } = body;

    if (!orderId || !total) {
      return NextResponse.json(
        { error: 'orderId et total requis' },
        { status: 400 }
      );
    }

    // Appeler le service avec metadata
    const result = await createPaymentIntent(total, {
      orderId,
      email: email || '',
    });

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
    console.error('[POST /api/checkout/create]', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}