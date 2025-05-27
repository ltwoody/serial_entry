import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return NextResponse.json({ message: 'Database connection successful!' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Database connection failed', error: error.message }, { status: 500 });
  }
}
