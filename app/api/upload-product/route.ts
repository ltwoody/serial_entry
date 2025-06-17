import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import * as xlsx from 'xlsx';
import { pool } from '@/lib/db';

const EXPECTED_HEADERS = ['oid','product_code', 'brand_name', 'product_name'];

function validateHeaders(actualHeaders: string[]) {
  // Check that both arrays have same length and same values (case sensitive)
  if (actualHeaders.length !== EXPECTED_HEADERS.length) return false;

  return EXPECTED_HEADERS.every((header, idx) => header === actualHeaders[idx]);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rows: any[] = [];
    let actualHeaders: string[] = [];

    if (file.name.endsWith('.csv')) {
      const text = buffer.toString('utf-8');
      rows = parse(text, {
        columns: true,
        skip_empty_lines: true,
      });

      if (rows.length > 0) {
        actualHeaders = Object.keys(rows[0]);
      }
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      rows = xlsx.utils.sheet_to_json(sheet, { defval: null });

      // Get headers from the first row keys
      if (rows.length > 0) {
        actualHeaders = Object.keys(rows[0]);
      }
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Validate headers
    if (!validateHeaders(actualHeaders)) {
      return NextResponse.json({
        error: `Invalid file headers. Expected: ${EXPECTED_HEADERS.join(
          ', '
        )}. Received: ${actualHeaders.join(', ')}`,
      }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete all existing rows before insert
      await client.query('DELETE FROM product_master');

      // Insert new rows
      for (const row of rows) {
        await client.query(
          `INSERT INTO product_master (oid,product_code, brand_name, product_name)
           VALUES ($1, $2, $3 , $4)`,
          [row.oid ,row.product_code, row.brand_name, row.product_name]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: 'Upload and import successful', count: rows.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
