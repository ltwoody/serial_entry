// app/api/update-job/[rowuid]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct

export async function DELETE(req: NextRequest) {
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

    // Delete the record from the database
    const deletedJob = await prisma.serialJob.delete({
      where: { rowuid },
    });

    return NextResponse.json(deletedJob);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Delete error:', error); // Changed log message to "Delete error"

    // Handle cases where the record to delete doesn't exist
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record to delete not found.' }, // Changed error message
        { status: 404 }
      );
    }
    
    // Removed the SyntaxError handling block as req.json() is no longer called

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
