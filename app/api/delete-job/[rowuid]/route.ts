// File: /app/api/delete-job/[rowuid]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this path if needed

export async function DELETE(
  req: NextRequest,
  params: { rowuid: string } // Changed: The 'params' object is now the second argument directly
) {
  const { rowuid } = params; // Access rowuid directly from the 'params' argument

  // Validate if rowuid is provided and not empty
  if (!rowuid || rowuid.trim() === '') {
    return NextResponse.json({ error: 'rowuid is required' }, { status: 400 });
  }

  try {
    // Attempt to delete the record using Prisma's delete method
    const deleted = await prisma.serialJob.delete({
      where: { rowuid }, // Specify the record to delete by its rowuid
    });

    // If deletion is successful, return a success message and the deleted record
    return NextResponse.json({ message: 'Deleted successfully', deleted }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Log the error for debugging purposes
    console.error('Delete error:', error);

    // Check if the error is a Prisma P2025 code, which indicates a record not found error
    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'No job found with that rowuid' }, { status: 404 });
    }

    // For any other unexpected errors, return a generic internal server error
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
