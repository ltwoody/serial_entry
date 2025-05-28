import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.trim();

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const client = await pool.connect();
    try {
      // Use ILIKE for case-insensitive pattern matching in Postgres
      const result = await client.query(
        `
          SELECT product_code, brand, product_name
          FROM product_master
          WHERE product_code ILIKE $1
             OR product_name ILIKE $1
             OR brand ILIKE $1
          ORDER BY product_code
          LIMIT 50
        `,
        [`%${query}%`]
      );

      return NextResponse.json({ products: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
