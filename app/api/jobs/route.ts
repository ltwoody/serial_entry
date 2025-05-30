import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Get individual filter params, all lowercase keys (match your frontend)
  
  const serial_no = url.searchParams.get('serial_no');
  const job_date = url.searchParams.get('job_date');
  const supplier_name = url.searchParams.get('supplier_name');
  const received_date = url.searchParams.get('received_date');
  const product_code = url.searchParams.get('product_code');
  const brand = url.searchParams.get('brand');
  const job_no = url.searchParams.get('job_no');
  const product_name = url.searchParams.get('product_name');
  const status = url.searchParams.get('status');
  const round = url.searchParams.get('round');


  const client = await pool.connect();
  try {
    let baseQuery = 'SELECT * FROM job_report';
    const conditions: string[] = [];
    const values: any[] = [];

    if (job_date) {
      conditions.push(`LOWER("job_date") = $${values.length + 1}`);
      values.push(job_date.toLowerCase());
    }

    if (supplier_name) {
      conditions.push(`LOWER("supplier_name") = $${values.length + 1}`);
      values.push(supplier_name.toLowerCase());
    }

    if (received_date) {
      conditions.push(`LOWER("received_date") = $${values.length + 1}`);
      values.push(received_date.toLowerCase());
    }
    if (product_code) {
      conditions.push(`LOWER("product_code") = $${values.length + 1}`);
      values.push(product_code.toLowerCase());
    }
    if (brand) {
      conditions.push(`LOWER("brand") = $${values.length + 1}`);
      values.push(brand.toLowerCase());
    }
    if (job_no) {
      conditions.push(`LOWER("job_no") = $${values.length + 1}`);
      values.push(job_no.toLowerCase());
    }
    if (product_name) {
      conditions.push(`LOWER("product_name") = $${values.length + 1}`);
      values.push(product_name.toLowerCase());
    }
    if (status) {
      conditions.push(`LOWER("status") = $${values.length + 1}`);
      values.push(status.toLowerCase());
    }
    if (round) {
      conditions.push(`LOWER("round") = $${values.length + 1}`);
      values.push(round.toLowerCase());
    }
    
    if (serial_no) {
  conditions.push(`"serial_no" ILIKE '%' || $${values.length + 1} || '%'`);
  values.push(serial_no);
}



    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await client.query(baseQuery, values);
    return NextResponse.json(result.rows);
  } finally {
    client.release();
  }
}
