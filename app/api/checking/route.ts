import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { SerialNo } = await req.json();
  const client = await pool.connect();

  try {
    const normalizedSerial = SerialNo.toLowerCase();

    // Check if the serial number is already used as serial_number
    const dup = await client.query(
      'SELECT 1 FROM serial_job WHERE LOWER("serial_number") = $1',
      [normalizedSerial]
    );

    if (dup.rowCount > 0) {
      return NextResponse.json(
        { message: 'serial_no already in use', isValid: false },
        { status: 400 }
      );
    }

    // Check if it exists as a replace_serial
    const replaceCheck = await client.query(
      'SELECT 1 FROM serial_job WHERE LOWER("replace_serial") = $1',
      [normalizedSerial]
    );

    if (replaceCheck.rowCount > 0) {
      return NextResponse.json(
        {
          message: 'This serial number can be used but it is a replace serial number',
          isValid: true,
          isReplaceSerial: true,
        },
        { status: 200 }
      );
    }

    // If not found anywhere
    return NextResponse.json(
      { message: 'This serial number can be used', isValid: true },
      { status: 200 }
    );

  } catch (err) {
    console.error('Error checking serial number:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
