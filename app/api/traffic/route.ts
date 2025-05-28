import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Get individual filter params, all lowercase keys (match your frontend)
  const bu = url.searchParams.get('bu');
  const branch = url.searchParams.get('branch');
  const quarter = url.searchParams.get('quarter');
  const week = url.searchParams.get('week');
  const serialNo = url.searchParams.get('serialno'); // note: use 'serial' or 'serialno' to match frontend

  const client = await pool.connect();
  try {
    let baseQuery = 'SELECT * FROM traffictable';
    const conditions: string[] = [];
    const values: any[] = [];

    if (bu) {
      conditions.push(`LOWER("BU") = $${values.length + 1}`);
      values.push(bu.toLowerCase());
    }
    if (branch) {
      conditions.push(`LOWER("Branch") = $${values.length + 1}`);
      values.push(branch.toLowerCase());
    }
    if (quarter) {
      conditions.push(`LOWER("Quarter") = $${values.length + 1}`);
      values.push(quarter.toLowerCase());
    }
    if (week) {
      conditions.push(`LOWER("Week") = $${values.length + 1}`);
      values.push(week.toLowerCase());
    }
    if (serialNo) {
  conditions.push(`"SerialNo" ILIKE '%' || $${values.length + 1} || '%'`);
  values.push(serialNo);
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
