import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  const { rowuid } = await req.json();
  const client = await pool.connect();

  try {
    await client.query('DELETE FROM serial_job WHERE rowuid = $1', [rowuid]);
    return NextResponse.json({ message: 'Job deleted' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: 'Delete failed', error: err }, { status: 500 });
  } finally {
    client.release();
  }
}
