import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { SerialNo } = await req.json();

  if (!SerialNo) {
    return NextResponse.json({ message: 'Serial number is required' }, { status: 400 });
  }

  const normalizedSerial = SerialNo.toLowerCase();

  try {
    // 🔍 Check if already used as `serial_number`
    const existsAsSerial = await prisma.serialJob.findFirst({
      where: {
        serial_number: {
          equals: normalizedSerial,
          mode: 'insensitive',
        },
      },
    });

    if (existsAsSerial) {
      return NextResponse.json(
        { message: 'serial_no already in use', isValid: false },
        { status: 400 }
      );
    }

    // 🔍 Check if exists as `replace_serial`
    const existsAsReplace = await prisma.serialJob.findFirst({
      where: {
        replace_serial: {
          equals: normalizedSerial,
          mode: 'insensitive',
        },
      },
    });

    if (existsAsReplace) {
      return NextResponse.json(
        {
          message: 'This serial number can be used but it is a replace serial number',
          isValid: true,
          isReplaceSerial: true,
        },
        { status: 200 }
      );
    }

    // ✅ If not found anywhere
    return NextResponse.json(
      { message: 'This serial number can be used', isValid: true },
      { status: 200 }
    );

  } catch (err) {
    console.error('Error checking serial number:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
