import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';


export async function POST(req: NextRequest) {

  const { serial_no,
        job_date, supplier_name, received_date,product_code, brand,
        job_no, product_name, status, round } = await req.json();

  const client = await pool.connect();

  try {
    // Check for duplicate SerialNo
    const dup = await client.query('SELECT 1 FROM job_report WHERE serial_no = $1', [serial_no]);
    if ((dup as { rowCount: number }).rowCount > 0) {
      return NextResponse.json({ message: 'SerialNo already in use' }, { status: 400 });
    }

    // Insert into job_report with default/fixed values for other fields
    const insertQuery = `
      INSERT INTO job_report (
        serial_no, job_date, supplier_name, received_date,product_code, brand,
        job_no, product_name, status, round
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,$8,$9,$10
      )
    `;

    const values = [serial_no,
        job_date, supplier_name, received_date,product_code, brand,
        job_no, product_name, status, round];

    await client.query(insertQuery, values);

    return NextResponse.json({ message: 'Created' }, { status: 201 });

  } catch (err) {
    console.error('Error inserting traffic record:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
