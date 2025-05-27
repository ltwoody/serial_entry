import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { BU, Branch, Name, Quarter, Week, Traffic, SerialNo } = await req.json(); // must match client-side field name exactly
  const client = await pool.connect();

  try {
    // Check for duplicate SerialNo
    const dup = await client.query('SELECT 1 FROM traffictable WHERE "SerialNo" = $1', [SerialNo]);
    if (dup.rowCount > 0) {
      return NextResponse.json({ message: 'SerialNo already in use' }, { status: 400 });
    }

    // Insert new record
    await client.query(
      'INSERT INTO traffictable ("BU", "Branch", "Name", "Quarter", "Week", "Traffic", "SerialNo") VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [BU, Branch, Name, Quarter, Week, Traffic, SerialNo]
    );

    return NextResponse.json({ message: 'Created' }, { status: 201 });

  } catch (err) {
    console.error('Error inserting traffic record:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
