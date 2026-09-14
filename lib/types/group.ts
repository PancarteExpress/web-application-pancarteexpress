import { Prisma } from '@prisma/client';

/**
 * Types Prisma réexportés
 */
export type Group = Prisma.GroupGetPayload<{
  include: { users: true };
}>;

export type GroupWithoutUsers = Omit<Group, 'users'>;

export type GroupWithUsers = Group;

/**
 * Input pour créer un groupe
 */
export type CreateGroupInput = {
  name: string;
};

/**
 * Statistiques d'un groupe (pour l'admin)
 */
export type GroupStats = {
  totalUsers: number;
  totalOrders: number;
  totalSpent: number;
};