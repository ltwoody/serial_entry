import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Invalid credentials or user not found.' }, { status: 401 });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials or user not found.' }, { status: 401 });
    }

    // ✅ Set auth cookie if login is successful
    const response = NextResponse.json({ message: 'Login successful' });

    response.cookies.set({
      name: 'auth',
      value: 'true',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    response.cookies.set({
  name: 'user',
  value: encodeURIComponent(user.username), // encode just in case
  httpOnly: false, // must be accessible by client JS
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24,
});

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
