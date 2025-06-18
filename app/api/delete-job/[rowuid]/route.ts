import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(req: NextRequest) {
  const client = await pool.connect();

  try {
    const url = new URL(req.url);
    const rowuid = url.pathname.split('/').pop(); // Get the last segment of the URL

    if (!rowuid) {
      return NextResponse.json({ error: 'rowuid is required' }, { status: 400 });
    }

    await client.query('DELETE FROM serial_job WHERE rowuid = $1', [rowuid]);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
