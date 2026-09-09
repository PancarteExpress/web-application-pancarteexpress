import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth/jwt';

export async function GET(
  req: NextRequest,
  //{ params }: { params: Promise<{ locale: string }> }
  { params: params }: { params: Promise<{ locale: string }> }
) {
  try {
    const token = req.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const session = await verifyJWT(token);

    if (!session) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
    }

    // ✅ Fetch les données complètes de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        shippingAddress: true,
        groupId: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[GET /auth/me/profile]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}