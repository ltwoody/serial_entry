// File: /app/api/upload-product/route.ts

import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import * as xlsx from 'xlsx';
import { prisma } from '@/lib/prisma'; // Adjust this path if needed

const EXPECTED_HEADERS = ['oid', 'product_code', 'brand_name', 'product_name'];

interface ProductRow {
  oid: number;
  product_code: string;
  brand_name: string;
  product_name: string;
}

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

    let rows: ProductRow[] = [];
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

    // Use Prisma transaction for atomicity: delete all, then insert new
    try {
      await prisma.$transaction(async (tx) => {
        // Delete all existing rows in product_master
        await tx.productMaster.deleteMany({});

        // Insert new rows using createMany for efficiency
        // Ensure that the 'oid' field is properly handled as a unique identifier if applicable
        // or that your Prisma schema allows for bulk insertion without unique constraint violations
        await tx.productMaster.createMany({
          data: rows.map(row => ({
            oid: row.oid,
            product_code: row.product_code,
            brand_name: row.brand_name,
            product_name: row.product_name,
          })),
          skipDuplicates: true, // Optional: if you want to skip rows that might cause unique constraint errors
        });
      });
    } catch (error: unknown) {
      // If any operation within the transaction fails, it will be rolled back automatically
      console.error('Prisma transaction error during upload:', error);
      // Re-throw to be caught by the outer catch block
      throw new Error('Database transaction failed during product upload.');
    }

    return NextResponse.json({ message: 'Upload and import successful', count: rows.length }, { status: 200 });
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
