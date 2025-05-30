import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

interface ResultData {
  brand?: string;
  product_name?: string;
  round?: number;
}

export async function POST(req: NextRequest) {
  const { product_code, job_no } = await req.json();

  try {
    const client = await pool.connect();

    const resultData: ResultData = {};
  

    if (product_code) {
      const productResult = await client.query(
        'SELECT brand, product_name FROM product_master WHERE product_code = $1 LIMIT 1',
        [product_code]
      );
      if (productResult.rows.length > 0) {
        resultData.brand = productResult.rows[0].brand;
        resultData.product_name = productResult.rows[0].product_name;
      }
    }

    if (job_no) {
      const jobResult = await client.query(
  'SELECT MAX(round) AS max_round FROM job_report WHERE job_no = $1',
  [job_no]
);

      if (jobResult.rows.length > 0 ) {
        resultData.round = jobResult.rows[0].max_round;
      }
    }

    client.release();

    if (Object.keys(resultData).length === 0) {
      return NextResponse.json({ message: 'No matching data found' }, { status: 404 });
    }

    return NextResponse.json(resultData, { status: 200 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
