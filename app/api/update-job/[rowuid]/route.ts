// File: /app/api/update-job/[rowuid]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this path if needed

export async function PUT(
  req: NextRequest,
  { params }: { params: { rowuid: string } } // Extract rowuid from params
) {
  const { rowuid } = params; // Get rowuid from the URL parameters

  if (!rowuid || rowuid.trim() === '') {
    return NextResponse.json({ message: 'Missing rowuid parameter' }, { status: 400 });
  }

  try {
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
    // Assuming 'serial_job' is represented by 'serialJob' model in Prisma schema
    const updatedJob = await prisma.serialJob.update({
      where: {
        rowuid: rowuid, // Identify the record to update by its unique rowuid
      },
      data: {
        replace_serial: replace_serial,
        job_no: job_no,
        condition: condition,
        remark: remark,
        replace_code: replace_code,
        replace_product: replace_product,
        update_by: update_by,
        update_time: new Date(), // Set update_time to current timestamp
      },
    });

    // If the update is successful, Prisma returns the updated record
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

    // Generic internal server error for other issues
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
