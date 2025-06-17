import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { rowuid: string } }) {
  const { rowuid } = params;

  try {
    const client = await pool.connect();
    await client.query('DELETE FROM serial_job WHERE rowuid = $1', [rowuid]);
    client.release();
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}
