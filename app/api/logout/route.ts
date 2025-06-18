import { NextResponse } from 'next/server';


export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });

  // Clear the 'auth' cookie
  response.cookies.set('auth', '', {
    path: '/',               // Important: apply to the root path
    expires: new Date(0),    // Expire immediately
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
