import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'calvino_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(COOKIE_NAME)?.value;

  // 1. Protection défensive des routes API Admin (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentification requise pour accéder aux ressources d\'administration.' },
        { status: 401 }
      );
    }
  }

  // 2. Protection défensive des pages Admin (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/connexion', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protection défensive de l'espace client (/compte/*)
  if (pathname.startsWith('/compte')) {
    if (!sessionToken) {
      const loginUrl = new URL('/connexion', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/compte/:path*',
  ],
};
