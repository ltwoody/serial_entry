import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
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

  try {
    // 1. Check for duplicate serial_number
    const serialExists = await prisma.serialJob.findUnique({
      where: { serial_number },
    });

    if (serialExists) {
      return NextResponse.json({ message: 'Serial number already in use' }, { status: 400 });
    }

    // 2. Check if serial number exists as replace_serial and reuse its u_id
    const replaceRecord = await prisma.serialJob.findFirst({
      where: { replace_serial: serial_number },
      select: { u_id: true },
    });

    let u_id = replaceRecord?.u_id;
    if (!u_id) {
      // Generate a new unique u_id
      let isUnique = false;
      while (!isUnique) {
        const tempId = uuidv4();
        const check = await prisma.serialJob.findFirst({ where: { u_id: tempId } });
        if (!check) {
          u_id = tempId;
          isUnique = true;
        }
      }
    }

    // 3. Generate unique rowuid
    let rowuid = '';
    let isRowUidUnique = false;
    while (!isRowUidUnique) {
      const candidate = uuidv4();
      const check = await prisma.serialJob.findUnique({ where: { rowuid: candidate } });
      if (!check) {
        rowuid = candidate;
        isRowUidUnique = true;
      }
    }

    // 4. Insert the new record
    await prisma.serialJob.create({
      data: {
        u_id,
        rowuid,
        serial_number,
        date_receipt: date_receipt ? new Date(date_receipt) : null,
        supplier,
        received_date: received_date ? new Date(received_date) : null,
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
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
