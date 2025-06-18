import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';


export async function POST(req: NextRequest) {
  const u_id = uuidv4();
  const timecreate = new Date();
  const { username, password, firstname, lastname } = await req.json();
  const client = await pool.connect();

  try {
    const exists = await client.query('SELECT 1 FROM user_table WHERE username = $1', [username]);
    if ((exists.rowCount as number) > 0) {
      return NextResponse.json({ message: 'Username already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.query(
      `INSERT INTO user_table (u_id,username,password,firstname,lastname, createdat,role)
       VALUES ($1, $2, $3, $4, $5, $6 ,$7)`,
      [u_id, username, hashedPassword, firstname, lastname, timecreate, 'users']
    );

    return NextResponse.json({ message: 'User created' });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
