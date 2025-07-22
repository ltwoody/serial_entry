import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function to handle authentication and authorization.
 * It checks for 'auth', 'user', and 'role' cookies to determine if a user is logged in
 * and their role for specific page access, aligning with the /api/me/route.ts.
 *
 * @param request The incoming Next.js request.
 * @returns A NextResponse allowing the request to proceed or redirecting it.
 */
export function middleware(request: NextRequest) {
  // Get the current path of the request
  const pathname = request.nextUrl.pathname;

  // Retrieve the authentication and user data cookies.
  // These cookies are expected to be set upon successful login.
  const authCookie = request.cookies.get('auth');
  const usernameCookie = request.cookies.get('user');
  const roleCookie = request.cookies.get('role');

  // Define paths that are publicly accessible without authentication.
  // Users will always be allowed to visit these pages.
  const publicPaths = ['/login', '/unauthorized'];

  // --- 1. Authentication Check ---
  // If the 'auth' cookie is missing, the user is considered unauthenticated.
  if (!authCookie) {
    // If the user is trying to access a path that is NOT public,
    // redirect them to the login page.
    if (!publicPaths.includes(pathname)) {
      console.log(`Middleware: Unauthenticated user (no 'auth' cookie) redirected from '${pathname}' to '/login'.`);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If the user is unauthenticated but trying to access a public path,
    // allow the request to proceed.
    return NextResponse.next();
  }

  // --- 2. Authorization Check (if user is authenticated via 'auth' cookie) ---
  let user: { username: string; role: string; } | null = null;

  // If 'auth' cookie exists, but 'user' or 'role' cookies are missing,
  // it indicates an incomplete or unauthorized session.
  if (!usernameCookie || !roleCookie) {
    console.error('Middleware: Authenticated but missing username or role cookie. Treating as unauthorized.');
    // Redirect to login or unauthorized page, depending on desired strictness.
    // For now, redirect to login to ensure proper session setup.
    if (!publicPaths.includes(pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next(); // Allow public paths even with incomplete session
  }

  // Construct the user object from the separate cookies.
  user = {
    username: usernameCookie.value,
    role: roleCookie.value,
  };

  // If the user is authenticated and tries to access the '/login' page,
  // redirect them to the home page or a dashboard, as they are already logged in.
  if (pathname === '/login') {
    console.log(`Middleware: Authenticated user redirected from '/login' to '/'.`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // --- 3. Role-Based Access Control for specific pages ---
  // Check if the user is trying to access the '/signup' page.
  if (pathname === '/signup') {
    // If the user's role is not 'admin', redirect them to the '/unauthorized' page.
    if (user?.role !== 'admin') {
      console.log(`Middleware: Non-admin user redirected from '/signup' to '/unauthorized'. User role: '${user?.role}'.`);
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    // If the user is an 'admin', allow them to access '/signup'.
  }

  // If all checks pass (user is authenticated and authorized for the requested page),
  // allow the request to proceed to its destination.
  console.log(`Middleware: Allowing access to '${pathname}' for user '${user?.username}' with role '${user?.role}'.`);
  return NextResponse.next();
}

/**
 * Configuration object for the middleware.
 * The 'matcher' array specifies which paths the middleware should run on.
 *
 * This matcher will apply the middleware to all incoming requests
 * except for:
 * - API routes (`/api/:path*`)
 * - Next.js static files (`_next/static/:path*`)
 * - Next.js image optimization files (`_next/image/:path*`)
 * - The favicon (`/favicon.ico`)
 *
 * All other paths will be processed by the middleware for authentication and authorization.
 */
export const config = {
  matcher: [
    // Match all paths except API routes, static files, and images.
    // The logic inside the middleware function will then handle specific public paths
    // like /login and /unauthorized based on authentication status.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
