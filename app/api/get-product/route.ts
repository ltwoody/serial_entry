// app/api/get-product/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface ResultData {
  brand_name?: string;
  product_name?: string;
  count_round?: number;
  u_id?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  const { product_code, serial_number } = await req.json();

  const resultData: ResultData = {};

  try {
    if (product_code) {
      const product = await prisma.productMaster.findUnique({
        where: { product_code },
      });

      if (product) {
        // Use the nullish coalescing operator (??) to convert null to undefined.
        // This ensures the type matches the `ResultData` interface.
        resultData.brand_name = product.brand_name ?? undefined;
        resultData.product_name = product.product_name ?? undefined;
      }
    }

    if (serial_number) {
      const duplicate = await prisma.serialJob.findUnique({
        where: { serial_number },
      });

      if (duplicate) {
        resultData.message = 'Serial number is already used';
        return NextResponse.json(resultData, { status: 400 });
      }

      const replace = await prisma.serialJob.findMany({
        where: { replace_serial: serial_number },
        orderBy: { count_round: 'desc' },
        take: 1,
      });

      if (replace.length > 0) {
        resultData.count_round = (replace[0].count_round ?? 0) + 1;
        resultData.u_id = replace[0].u_id;
      } else {
        resultData.count_round = 1;
      }
    }

    return Object.keys(resultData).length > 0
      ? NextResponse.json(resultData, { status: 200 })
      : NextResponse.json({ message: 'No matching data found' }, { status: 404 });

  } catch (error) {
    console.error('Prisma error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
