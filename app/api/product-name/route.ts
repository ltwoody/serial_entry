import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { product_code } = await req.json();
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT product_name FROM product_master WHERE product_code = $1 LIMIT 1',
      [product_code]
    );

    if (result.rows.length > 0) {
      return NextResponse.json({ product_name: result.rows[0].product_name });
    } else {
      return NextResponse.json({ product_name: '' });
    }
  } catch (err) {
    console.error('Error fetching product_name:', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  } finally {
    client.release();
  }
}
