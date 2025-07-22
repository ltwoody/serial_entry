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
      replace_serial,
      job_no,
      condition,
      remark,
      replace_code,
      replace_product,
      update_by,
    } = body;

    // Basic validation for required fields
    if (!update_by) {
      return NextResponse.json({ message: 'Missing update_by in request body' }, { status: 400 });
    }

    // Use Prisma to update the record
    const updatedJob = await prisma.serialJob.update({
      where: {
        rowuid: rowuid, // Identify the record to update by its unique rowuid
      },
      data: {
        replace_serial,
        job_no,
        condition,
        remark,
        replace_code,
        replace_product,
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
