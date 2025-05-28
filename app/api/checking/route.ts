import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { SerialNo } = await req.json();
  const client = await pool.connect();

  try {
    // Normalize input to lowercase
    const normalizedSerial = SerialNo.toLowerCase();

    // Perform case-insensitive comparison using LOWER()
    const dup = await client.query(
      'SELECT 1 FROM traffictable WHERE LOWER("SerialNo") = $1',
      [normalizedSerial]
    );

    if (dup.rowCount > 0) {
      return NextResponse.json(
        { message: 'SerialNo already in use', isValid: false },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { message: 'This serial number can be used', isValid: true },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error('Error checking serial number:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
