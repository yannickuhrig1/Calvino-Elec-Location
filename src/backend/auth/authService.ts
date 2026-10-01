import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import prisma from '@/backend/db/prisma';

function getJwtKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ SÉCURITÉ : La variable JWT_SECRET est absente des variables d\'environnement. Configurez un secret cryptographique fort dans le dashboard Vercel.');
    }
    return new TextEncoder().encode(
      process.env.NODE_ENV === 'production'
        ? 'calvino-prod-fallback-key-strictly-change-in-env-dashboard'
        : 'calvino-dev-local-jwt-secret-key-32chars-min'
    );
  }
  return new TextEncoder().encode(secret);
}

export const COOKIE_NAME = 'calvino_session';

export interface SessionPayload {
  userId: string;
  email: string;
  role: 'CLIENT' | 'ADMIN';
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getJwtKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getJwtKey();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        address: true,
        city: true,
        postalCode: true,
      },
    });
    return user;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
}
