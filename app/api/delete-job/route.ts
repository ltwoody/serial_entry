import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this path if needed

export async function DELETE(req: NextRequest) {
  try {
    // Extract rowuid from the request body
    const { rowuid } = await req.json();

    if (!rowuid || typeof rowuid !== 'string' || rowuid.trim() === '') {
      return NextResponse.json(
        { message: 'Invalid or missing rowuid in request body' },
        { status: 400 }
      );
    }

    // Try deleting the record using Prisma
    const deleted = await prisma.serialJob.delete({
      where: { rowuid },
    });

    // If deletion is successful, Prisma returns the deleted record
    return NextResponse.json({ message: 'Job deleted successfully', deleted }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting job:', error);

    // Handle Prisma-specific error for record not found (P2025)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { message: 'No job found with the provided rowuid' },
        { status: 404 }
      );
    }

    // Generic internal server error for other issues
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}