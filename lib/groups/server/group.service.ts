import { prisma } from '@/lib/prisma';
import { GroupWithUsers } from '@/lib/types/group';

/**
 * Récupérer un groupe avec ses utilisateurs
 * ✅ À utiliser après vérification que l'utilisateur a accès
 */
export async function getGroupById(groupId: string): Promise<GroupWithUsers | null> {
  try {
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

    return group as GroupWithUsers | null;
  } catch (error) {
    console.error('[getGroupById]', error);
    return null;
  }
}

/**
 * Vérifier que l'utilisateur a accès au groupe
 * ✅ SÉCURITÉ: accès si GROUP_ADMIN du groupe OU membre du groupe
 */
export async function canAccessGroup(
  userId: string,
  groupId: string
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { groupId: true, role: true },
    });

    if (!user) {
      return false;
    }

    // L'utilisateur est du même groupe OU admin du groupe
    return user.groupId === groupId;
  } catch (error) {
    console.error('[canAccessGroup]', error);
    return false;
  }
}