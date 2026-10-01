import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/backend/auth/authService';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
