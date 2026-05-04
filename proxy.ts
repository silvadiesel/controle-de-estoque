import { NextResponse, type NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/register'];

// Rotas da API de autenticação (better-auth handler)
const authApiRoutes = ['/api/auth'];

// Rotas de cron — autenticadas via Bearer CRON_SECRET na própria route
const cronApiRoutes = ['/api/cron'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (authApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (cronApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verifica presença do cookie de sessão do better-auth.
  // A validação real + permissions continua em requireRoutePermission (defesa em profundidade).
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token');

  if (!sessionCookie) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
