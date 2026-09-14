import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';
import { markOrderPaid } from '@/lib/orders/server/order.service';
import { orderIdSchema } from '@/lib/validations/order';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; orderId: string }> }
) {
  try {
    const { locale, orderId } = await params;

    // 1. Valider orderId
    const validatedId = orderIdSchema.parse({ orderId });

    // 2. Vérifier JWT
    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // 3. Appeler le service (avec vérif de propriété)
    const result = await markOrderPaid(validatedId.orderId, payload.email, locale);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      order: result.order,
    });
  } catch (error) {
    console.error('[PATCH /api/orders/[orderId]/mark-paid]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}