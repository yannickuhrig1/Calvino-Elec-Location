import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/backend/db/prisma';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/backend/auth/authService';
import { checkRateLimit, getClientIp } from '@/backend/security/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const limit = checkRateLimit(`login:${clientIp}`, 5, 60);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Trop de tentatives de connexion. Veuillez réessayer dans ${limit.resetInSeconds} secondes.` },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.resetInSeconds) },
        }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'CLIENT' | 'ADMIN',
      name: `${user.firstName} ${user.lastName}`,
    });

    // Configuration du cookie HttpOnly
    cookies().set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (err: any) {
    console.error('Erreur API login:', err);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}
