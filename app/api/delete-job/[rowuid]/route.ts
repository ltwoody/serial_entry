// File: /app/api/delete-job/[rowuid]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust this path if needed

export async function DELETE(
  req: NextRequest,
  { params }: { params: { rowuid: string } }
) {
  const { rowuid } = params;

  if (!rowuid || rowuid.trim() === '') {
    return NextResponse.json({ error: 'rowuid is required' }, { status: 400 });
  }

  try {
    // Try deleting the record using Prisma
    const deleted = await prisma.serialJob.delete({
      where: { rowuid },
    });

    return NextResponse.json({ message: 'Deleted successfully', deleted }, { status: 200 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Delete error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json({ message: 'No job found with that rowuid' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
