import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // this replaces `pool`
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials or user not found.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials or user not found.' }, { status: 401 });
    }

    // ✅ Set auth cookie if login is successful
    const response = NextResponse.json({ message: 'Login successful', role: user.role });

    response.cookies.set({
      name: 'auth',
      value: 'true',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24*30,
    });

    response.cookies.set({
      name: 'user',
      value: encodeURIComponent(user.username),
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24*30,
    });

    response.cookies.set({
      name: 'role',
      value: encodeURIComponent(user.role || ''), // default empty string if null
      httpOnly: false,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24*30,
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
