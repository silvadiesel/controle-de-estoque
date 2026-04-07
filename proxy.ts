import { NextRequest, NextResponse } from 'next/server';

// Rotas públicas que não precisam de autenticação
const publicRoutes = ['/login', '/register'];

// Rotas da API de autenticação
const authApiRoutes = ['/api/auth'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rotas da API de autenticação
  if (authApiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir rotas públicas
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar se existe cookie de sessão do Better Auth
  const sessionCookie =
    request.cookies.get('better-auth.session_token') ||
    request.cookies.get('__Secure-better-auth.session_token');

  // Se não há sessão e está tentando acessar rota protegida, redirecionar para login
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
