// app/api/me/route.ts
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  const authCookie = req.cookies.get('auth')?.value;

  if (!authCookie) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Optionally decode user id from another cookie or session
  // For example, you might want to store username or userId in a cookie when logging in

  // For demo, assume you store username in 'user' cookie
  const username = req.cookies.get('user')?.value;
  const role = req.cookies.get('role')?.value;

  if (!username) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (!role) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ username ,role});
}
