import { Prisma } from '@prisma/client';

/**
 * Enum des rôles utilisateur
 * USER: utilisateur standard
 * GROUP_ADMIN: administrateur d'un groupe
 * SUPER_ADMIN: administrateur système
 */
export enum UserRole {
  USER = 'user',
  GROUP_ADMIN = 'groupAdmin',
  SUPER_ADMIN = 'superAdmin',
}

/**
 * Types Prisma réexportés
 */
export type User = Prisma.UserGetPayload<{
  include: { group: true };
}>;

export type UserWithoutPassword = Omit<User, 'passwordHash'>;

export type SuperAdmin = Prisma.SuperAdminGetPayload<{}>;

export type SuperAdminWithoutPassword = Omit<SuperAdmin, 'passwordHash'>;

export type Group = Prisma.GroupGetPayload<{}>;

/**
 * Payload du JWT (ce qu'on encode dans le token)
 */
export type JWTPayload = {
  userId: string;
  email: string;
  role: UserRole;
  groupId?: string;
};

/**
 * Utilisateur dans la session (après décodage du JWT)
 */
export type SessionUser = JWTPayload;

/**
 * Réponse standard après signin/signup
 */
export type AuthResponse = {
  success: boolean;
  error?: string;
  message?: string;
  token?: string;
  redirect?: string;
};

/**
 * Input pour signin
 */
export type SignInInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

/**
 * Input pour signup (défini dans signup.ts actuellement)
 */
export type SignUpInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  companyName?: string;
  isGroup: boolean;
  groupName?: string;
};