import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { verifyPassword } from './utils';
import { prisma } from '../prisma';

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et password requis');
        }

        // Vérifier si c'est un SuperAdmin
        const superAdmin = await prisma.superAdmin.findUnique({
          where: { email: credentials.email as string },
        });

        if (superAdmin) {
          const isPasswordValid = await verifyPassword(
            credentials.password as string,
            superAdmin.passwordHash
          );

          if (!isPasswordValid) {
            throw new Error('Email ou password incorrect');
          }

          return {
            id: `admin-${superAdmin.id}`,
            email: superAdmin.email,
            role: 'superAdmin',
            name: 'Super Admin',
          };
        }

        // Vérifier si c'est un User normal
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { group: true },
        });

        if (!user) {
          throw new Error('Email ou password incorrect');
        }

        // Vérifier si email est vérifié
        if (!user.emailVerified) {
          throw new Error('Email non vérifié. Vérifiez votre email d\'abord.');
        }

        // Vérifier le password
        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error('Email ou password incorrect');
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          groupId: user.groupId,
          name: `${user.firstName} ${user.lastName}`,
        };
      },
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 24 * 60 * 60, // 24 heures
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role as string;
        session.user.groupId = user.groupId as string | undefined;
      }
      return session;
    },
    async signIn({ user }) {
      // Logic supplémentaire au signin si besoin
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
  },
  trustHost: true,
} satisfies NextAuthConfig;