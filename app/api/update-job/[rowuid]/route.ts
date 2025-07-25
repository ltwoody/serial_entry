// File: /app/api/update-job/[rowuid]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this path if needed

export async function PUT(req: NextRequest) {
  try {
    // Get the 'rowuid' from the URL itself, bypassing the problematic second argument.
    const pathname = new URL(req.url).pathname;
    const rowuid = pathname.split('/').pop();

    if (!rowuid || rowuid.trim() === '') {
      return NextResponse.json({ message: 'Missing or invalid rowuid in URL' }, { status: 400 });
    }

    const body = await req.json();

    const {
      serial_number,
      date_receipt,
      received_date,
      supplier,
      replace_serial,
      job_no,
      condition,
      remark,
      replace_code,
      replace_product,
      count_round,
      update_by,
    } = body;

    // Basic validation for required fields
    if (!update_by) {
      return NextResponse.json({ message: 'Missing update_by in request body' }, { status: 400 });
    }

    // --- Start of Date Conversion ---
    // Convert date strings (YYYY-MM-DD) to Date objects for Prisma
    let parsedDateReceipt: Date | null = null;
    if (date_receipt) {
        try {
            // Using new Date() with YYYY-MM-DD format correctly parses to UTC midnight for that date
            parsedDateReceipt = new Date(date_receipt);
            // Optional: If you want to ensure it's a valid date and not "Invalid Date"
            if (isNaN(parsedDateReceipt.getTime())) {
                parsedDateReceipt = null; // Treat as null if invalid
            }
        } catch (e) {
            console.warn(`Could not parse date_receipt: ${date_receipt}`, e);
            parsedDateReceipt = null; // Set to null if parsing fails
        }
    }

    let parsedReceivedDate: Date | null = null;
    if (received_date) {
        try {
            parsedReceivedDate = new Date(received_date);
            if (isNaN(parsedReceivedDate.getTime())) {
                parsedReceivedDate = null;
            }
        } catch (e) {
            console.warn(`Could not parse received_date: ${received_date}`, e);
            parsedReceivedDate = null;
        }
    }
    // --- End of Date Conversion ---



    // Use Prisma to update the record
    const updatedJob = await prisma.serialJob.update({
      where: {
        rowuid: rowuid, // Identify the record to update by its unique rowuid
      },
      data: {
        serial_number,
        // Use the parsed Date objects here
        date_receipt: parsedDateReceipt,
        received_date: parsedReceivedDate,
        supplier,
        replace_serial,
        job_no,
        condition,
        remark,
        replace_code,
        replace_product,
        count_round: Number(count_round),
        update_by,
        update_time: new Date(), // Set update_time to current timestamp
      },
    });

    return NextResponse.json(
      { message: 'Job updated successfully', data: updatedJob },
      { status: 200 }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Update error:', error);

    // Handle Prisma-specific error for record not found (P2025)
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'Record not found' }, { status: 404 });
    }
    
    // Handle cases where the request body is not valid JSON
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
    }

    // Generic internal server error for other issues
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
