
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ locale: string; groupId: string }> }
) {
  try {
    const { locale, groupId } = await params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            companyName: true,
            shippingAddress: true,
            role: true,
          },
        },
      },
    });

    if (!group) {
      return Response.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      );
    }

    return Response.json(group);
  } catch (err) {
    return Response.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}