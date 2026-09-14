import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth/jwt';
import { getOrders } from '@/lib/orders/server/order.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  try {
    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // Appeler le service
    const orders = await getOrders(payload.email);

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[GET /api/orders]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}