import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filters: any = {};

  // String filters with optional case-insensitive comparison
  const getStringFilter = (param: string) => {
    const value = url.searchParams.get(param);
    return value ? { contains: value, mode: 'insensitive' as const } : undefined;
  };

  // Add filters conditionally
  const received_date = url.searchParams.get('received_date');
  if (received_date) {
    filters.received_date = new Date(received_date);
  }

  const date_receipt = url.searchParams.get('date_receipt');
  if (date_receipt) {
    filters.date_receipt = new Date(date_receipt);
  }

  const round = url.searchParams.get('count_round');
  if (round) {
    filters.count_round = Number(round);
  }

  const serial_number = getStringFilter('serial_number');
  if (serial_number) filters.serial_number = serial_number;

  const supplier = getStringFilter('supplier');
  if (supplier) filters.supplier = supplier;

  const product_code = getStringFilter('product_code');
  if (product_code) filters.product_code = product_code;

  const brand_name = getStringFilter('brand_name');
  if (brand_name) filters.brand_name = brand_name;

  const job_no = getStringFilter('job_no');
  if (job_no) filters.job_no = job_no;

  const product_name = getStringFilter('product_name');
  if (product_name) filters.product_name = product_name;

  const replace_serial = getStringFilter('replace_serial');
  if (replace_serial) filters.replace_serial = replace_serial;

  const rowuid = getStringFilter('rowuid');
  if (rowuid) filters.rowuid = rowuid;

  try {
    const results = await prisma.serialJob.findMany({
      where: filters,
      orderBy: {
        create_time: 'desc', // optional: sort by newest first
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET serialJob error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
