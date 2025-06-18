import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { QueryResult } from 'pg'; // Don't forget this import

export async function POST(req: NextRequest) {
  const {
    serial_number,
    date_receipt,
    supplier,
    received_date,
    product_code,
    brand_name,
    job_no,
    product_name,
    count_round,
    condition,
    remark,
  } = await req.json();

  // 🔒 Get username securely from cookies
  const cookieUser = req.cookies.get('user')?.value;
  const username = cookieUser ? decodeURIComponent(cookieUser) : 'unknown';

  const client = await pool.connect();

  try {
    // 1. Check for duplicate serial_number in main column
    const dupSerial: QueryResult = await client.query(
      'SELECT 1 FROM serial_job WHERE serial_number = $1',
      [serial_number]
    );

    if ((dupSerial.rowCount as number) > 0) {
      return NextResponse.json({ message: 'Serial number already in use' }, { status: 400 });
    }

    // 2. Check if serial_number is in replace_serial field
    const replaceCheck: QueryResult = await client.query(
      'SELECT u_id FROM serial_job WHERE replace_serial = $1 LIMIT 1',
      [serial_number]
    );

    let u_id: string;
    if ((replaceCheck.rowCount as number) > 0) {
      // Reuse u_id from matched replace_serial
      u_id = replaceCheck.rows[0].u_id;
    } else {
      // Generate new unique u_id
      // ✅ FIX: Initialize newUid directly
      let newUid: string = uuidv4(); // Initialize with the first UUID
      let isUnique = false;

      // If it's already unique (very likely), the loop won't run on the first check
      while (!isUnique) {
        const uidCheck: QueryResult = await client.query(
          'SELECT 1 FROM serial_job WHERE u_id = $1',
          [newUid]
        );
        if ((uidCheck.rowCount as number) === 0) {
          isUnique = true;
        } else {
          // If not unique, generate a new one for the next iteration
          newUid = uuidv4();
        }
      }
      u_id = newUid; // newUid is guaranteed to be assigned
    }

    // 3. Generate unique rowuid
    let rowuid: string = uuidv4(); // Initialize with the first UUID
    let isRowUidUnique = false;

    while (!isRowUidUnique) {
      const rowUidCheck: QueryResult = await client.query(
        'SELECT 1 FROM serial_job WHERE rowuid = $1',
        [rowuid]
      );
      if ((rowUidCheck.rowCount as number) === 0) {
        isRowUidUnique = true;
      } else {
        rowuid = uuidv4();
      }
    }

    // 4. Insert data
    const insertQuery = `
      INSERT INTO serial_job (
        u_id, rowuid, serial_number, date_receipt, supplier,
        received_date, product_code, brand_name,
        job_no, product_name, count_round,
        condition, remark, create_by, create_time
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8,
        $9, $10, $11,
        $12, $13, $14, NOW()
      )
    `;

    const values = [
      u_id,
      rowuid,
      serial_number,
      date_receipt,
      supplier,
      received_date,
      product_code,
      brand_name,
      job_no,
      product_name,
      count_round,
      condition,
      remark,
      username || 'unknown',
    ];

    await client.query(insertQuery, values);

    return NextResponse.json({ message: 'Created', u_id, rowuid }, { status: 201 });
  } catch (err) {
    console.error('Error inserting serial job:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}