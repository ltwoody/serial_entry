import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { rowuid: string } }) {
  const { rowuid } = params;

  if (!rowuid) {
    return NextResponse.json({ message: 'Missing rowuid parameter' }, { status: 400 });
  }

  const body = await req.json();

  // Destructure only the editable fields + update_by
  const {
    replace_serial,
    job_no,
    condition,
    remark,
    replace_code,
    replace_product,
    update_by,
  } = body;

  if (!update_by) {
    return NextResponse.json({ message: 'Missing update_by' }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    const query = `
      UPDATE serial_job
      SET
        replace_serial = $1,
        job_no = $2,
        condition = $3,
        remark = $4,
        replace_code = $5,
        replace_product = $6,
        update_by = $7,
        update_time = NOW()
      WHERE rowuid = $8
      RETURNING *;
    `;

    const values = [
      replace_serial,
      job_no,
      condition,
      remark,
      replace_code,
      replace_product,
      update_by,
      rowuid,
    ];

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Job updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
  }
}
