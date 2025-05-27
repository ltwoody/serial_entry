import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';


export async function POST(req: NextRequest) {
  const { name, username, password } = await req.json();
  const client = await pool.connect();

  try {
    const exists = await client.query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (exists.rowCount > 0) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO users (name, username, password, role, access_right)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, username, hashedPassword, 'users', true]
    );

    return NextResponse.json({ message: 'User created' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
