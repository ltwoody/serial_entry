import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Get individual filter params, all lowercase keys (match your frontend)

  const serial_no = url.searchParams.get('serial_number');
  const received_date = url.searchParams.get('received_date');
  const supplier = url.searchParams.get('supplier');
  const date_receipt = url.searchParams.get('date_receipt');
  const product_code = url.searchParams.get('product_code');
  const brand = url.searchParams.get('brand_name');
  const job_no = url.searchParams.get('job_no');
  const product_name = url.searchParams.get('product_name');
  const replace_serial = url.searchParams.get('replace_serial');
  const round = url.searchParams.get('count_round');
  const rowid = url.searchParams.get('rowuid');


  const client = await pool.connect();
  try {
    let baseQuery = 'SELECT * FROM serial_job';
    const conditions: string[] = [];
    const values: (string | number)[] = [];

    if (received_date) {
      conditions.push(`LOWER("received_date") = $${values.length + 1}`);
      values.push(received_date.toLowerCase());
    }

    if (supplier) {
      conditions.push(`LOWER("supplier") = $${values.length + 1}`);
      values.push(supplier.toLowerCase());
    }

    if (date_receipt) {
      conditions.push(`LOWER("date_receipt") = $${values.length + 1}`);
      values.push(date_receipt.toLowerCase());
    }
    if (product_code) {
      conditions.push(`LOWER("product_code") = $${values.length + 1}`);
      values.push(product_code.toLowerCase());
    }
    if (brand) {
      conditions.push(`LOWER("brand_name") = $${values.length + 1}`);
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
    if (replace_serial) {
      conditions.push(`LOWER("replace_serial") = $${values.length + 1}`);
      values.push(replace_serial.toLowerCase());
    }
    if (round) {
      conditions.push(`"count_round" = $${values.length + 1}`);
      values.push(Number(round));
    }

    if (serial_no) {
      conditions.push(`"serial_number" ILIKE '%' || $${values.length + 1} || '%'`);
      values.push(serial_no);
    }
    if (rowid) {
      conditions.push(`"rowuid" ILIKE '%' || $${values.length + 1} || '%'`);
      values.push(rowid);
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
