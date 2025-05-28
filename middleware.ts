// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')?.value;
  const { pathname } = request.nextUrl;

  // Allow requests to /login and /signup without authentication
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return NextResponse.next();
  }

  // If no auth cookie and trying to access any other page, redirect to /login
  if (!authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Otherwise, allow the request
  return NextResponse.next();
}

// Apply middleware to all paths except _next (static files) and api routes if you want
export const config = {
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
