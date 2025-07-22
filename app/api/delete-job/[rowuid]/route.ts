// app/api/update-job/[rowuid]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct

export async function PUT(req: NextRequest) {
  try {
    // Get the 'rowuid' from the URL itself, avoiding the problematic second argument
    const pathname = new URL(req.url).pathname;
    const rowuid = pathname.split('/').pop();

    if (!rowuid) {
      return NextResponse.json(
        { error: 'Invalid URL: Could not find the rowuid.' },
        { status: 400 }
      );
    }

    // Get the update data from the request body
    const body = await req.json();

    // Update the record in the database
    const updatedJob = await prisma.serialJob.update({
      where: { rowuid },
      data: body,
    });

    return NextResponse.json(updatedJob);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Update error:', error);

    // Handle cases where the record to update doesn't exist
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record to update not found.' },
        { status: 404 }
      );
    }
    
    // Handle JSON parsing errors from an empty or invalid body
    if (error instanceof SyntaxError) {
        return NextResponse.json(
            { error: 'Invalid JSON in request body.'},
            { status: 400 }
        );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}