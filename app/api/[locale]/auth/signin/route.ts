import Tokens from 'csrf';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/utils';
import { signJWT } from '@/lib/auth/jwt';

const tokens = new Tokens();

export async function POST(_req: NextRequest, { params: _params }: { params: Promise<{ locale: string }> }) {
  try {
    // 1. Vérifier CSRF token
    const csrfToken = _req.headers.get('X-CSRF-Token');
    const csrfSecret = _req.cookies.get('csrf-secret')?.value;

    if (!csrfToken || !csrfSecret) {
      return NextResponse.json(
        { error: 'Token CSRF manquant' },
        { status: 403 }
      );
    }

    if (!tokens.verify(csrfSecret, csrfToken)) {
      return NextResponse.json(
        { error: 'Token CSRF invalide' },
        { status: 403 }
      );
    }

    // 2. Récupérer le body
    const body = await _req.json();
    const { email, password, rememberMe } = body;

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    // 3. Vérifier si c'est un SuperAdmin
    const superAdmin = await prisma.superAdmin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (superAdmin) {
      const isPasswordValid = await verifyPassword(password, superAdmin.passwordHash);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Email ou mot de passe incorrect' },
          { status: 401 }
        );
      }

      // Créer JWT pour SuperAdmin
      const token = await signJWT({
        userId: superAdmin.id,
        email: superAdmin.email,
        role: 'superAdmin',
      });

      // Créer response avec cookie
      const response = NextResponse.json({
        success: true,
        role: 'superAdmin',
        redirect: '/admin/dashboard',
      });

      // Définir cookie session
      response.cookies.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined, // 30 jours ou session
        path: '/',
      });

      // Supprimer le cookie CSRF après utilisation
      response.cookies.delete('csrf-secret');

      return response;
    }

    // 4. Vérifier si c'est un User normal
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { group: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // 5. Vérifier si email est vérifié
    if (!user.emailVerified) {
      return NextResponse.json(
        { error: 'Email non vérifié. Vérifiez votre email d\'abord.' },
        { status: 401 }
      );
    }

    // 6. Vérifier le password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    // 7. Créer JWT pour User
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role as 'user' | 'groupAdmin',
      groupId: user.groupId,
    });

    // 8. Créer response avec cookie
    const response = NextResponse.json({
      success: true,
      role: user.role,
      redirect: '/dashboard',
    });

    // Définir cookie session
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined, // 30 jours ou session
      path: '/',
    });

    // Supprimer le cookie CSRF après utilisation
    response.cookies.delete('csrf-secret');

    return response;
  } catch (error) {
    console.error('Erreur signin:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}