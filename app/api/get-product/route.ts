import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface ResultData {
  brand_name?: string;
  product_name?: string;
  count_round?: number;
  u_id?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  const { product_code, serial_number } = await req.json();

  const resultData: ResultData = {};
  const client = await pool.connect();

  try {
    // 1. Get product info from product_master
    if (product_code) {
      const productResult = await client.query(
        'SELECT brand_name, product_name FROM product_master WHERE product_code = $1 LIMIT 1',
        [product_code]
      );
      if (productResult.rows.length > 0) {
        resultData.brand_name = productResult.rows[0].brand_name;
        resultData.product_name = productResult.rows[0].product_name;
      }
    }

    // 2. Process serial_number
    if (serial_number) {
      // 2.1 Check if serial_number is already used
      const dupCheck = await client.query(
        'SELECT 1 FROM serial_job WHERE serial_number = $1 LIMIT 1',
        [serial_number]
      );
      console.log('Duplicate Check:', dupCheck.rowCount);
      if (dupCheck.rowCount > 0) {
        resultData.message = 'Serial number is already used';
        return NextResponse.json(resultData, { status: 400 });
      }

      // 2.2 Check if serial_number is in replace_serial
      const replaceResult = await client.query(
        'SELECT MAX(count_round) AS max_round, u_id FROM serial_job WHERE replace_serial = $1 GROUP BY u_id LIMIT 1',
        [serial_number]
      );
      console.log('Replace Result:', replaceResult.rows);
      if (replaceResult.rows.length > 0) {
  const maxRound = parseInt(replaceResult.rows[0].max_round ?? '0', 10);
  resultData.count_round = maxRound + 1;
  resultData.u_id = replaceResult.rows[0].u_id;
} else {
  resultData.count_round = 1; // Default round
}
    }

    return Object.keys(resultData).length > 0
      ? NextResponse.json(resultData, { status: 200 })
      : NextResponse.json({ message: 'No matching data found' }, { status: 404 });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
