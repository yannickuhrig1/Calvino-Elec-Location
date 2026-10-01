import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/backend/db/prisma';
import { hashPassword, createSessionToken, COOKIE_NAME } from '@/backend/auth/authService';

export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, company, address, city, postalCode } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, mot de passe, prénom et nom sont obligatoires.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit comporter au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cette adresse email.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        role: 'CLIENT',
        firstName,
        lastName,
        phone: phone || null,
        company: company || null,
        address: address || null,
        city: city || null,
        postalCode: postalCode || null,
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: 'CLIENT',
      name: `${user.firstName} ${user.lastName}`,
    });

    cookies().set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
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
    console.error('Erreur API register:', err);
    return NextResponse.json({ error: 'Erreur lors de l’inscription' }, { status: 500 });
  }
}
