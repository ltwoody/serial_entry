// app/api/create-job/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path is correct
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const {
      serial_number,
      date_receipt,
      supplier,
      received_date,
      product_code,
      brand_name,
      job_no,
      product_name,
      count_round,
      condition,
      remark,
    } = await req.json();

    // 🔐 Get username from cookie
    const cookieUser = req.cookies.get('user')?.value;
    const username = cookieUser ? decodeURIComponent(cookieUser) : 'unknown';

    // 1. Check for duplicate serial_number
    if (serial_number) {
      const serialExists = await prisma.serialJob.findUnique({
        where: { serial_number },
      });

      if (serialExists) {
        return NextResponse.json({ message: 'Serial number already in use' }, { status: 400 });
      }
    }

    // 2. Determine the u_id
    let u_id: string; // Declare u_id, ensuring it will be a string.

    const replaceRecord = serial_number ? await prisma.serialJob.findFirst({
      where: { replace_serial: serial_number },
      select: { u_id: true },
    }) : null;

    if (replaceRecord) {
      // If the serial number was a replacement, reuse the existing u_id
      u_id = replaceRecord.u_id;
    } else {
      // Otherwise, generate a new unique u_id
      while (true) {
        const tempId = uuidv4();
        const check = await prisma.serialJob.findFirst({ where: { u_id: tempId } });
        if (!check) {
          u_id = tempId;
          break; // Exit loop once a unique ID is found
        }
      }
    }

    // 3. Generate a unique rowuid
    let rowuid: string;
    while (true) {
      const candidate = uuidv4();
      const check = await prisma.serialJob.findUnique({ where: { rowuid: candidate } });
      if (!check) {
        rowuid = candidate;
        break; // Exit loop once a unique ID is found
      }
    }

    // 4. Insert the new record
    await prisma.serialJob.create({
      data: {
        u_id, // This is now guaranteed to be a string
        rowuid,
        serial_number,
        date_receipt,
        supplier,
        received_date,
        product_code,
        brand_name,
        job_no,
        product_name,
        count_round,
        condition,
        remark,
        create_by: username,
        create_time: new Date(),
      },
    });

    return NextResponse.json({ message: 'Created', u_id, rowuid }, { status: 201 });

  } catch (err) {
    console.error('Error inserting serial job:', err);
    // Handle potential JSON parsing errors
    if (err instanceof SyntaxError) {
      return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
