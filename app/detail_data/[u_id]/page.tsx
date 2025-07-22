// app/detail_data/[u_id]/page.tsx

// ✅ This ensures the page is always rendered dynamically, fetching fresh data on each request.
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import DataDetailClient from '@/app/components/DataDetailClient';

// update

// This is the standard pattern to prevent multiple Prisma Client instances in development.
declare global {
  // The 'var' keyword is necessary for global declarations.
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

// Defines the props type according to the error message, expecting a Promise for params.
interface DataDetailProps {
  params: Promise<{
    u_id: string;
  }>;
}

export default async function DataDetail({ params }: DataDetailProps) {
  // Await the params object to resolve the Promise and get the u_id.
  const resolvedParams = await params;
  const { u_id } = resolvedParams;

  // Helper function to format dates that can be null.
  const formatDate = (date?: Date | string | null): string | null => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null; // Check for invalid date
    return d.toISOString().split('T')[0];
  };

  try {
    // Fetch the first record matching the u_id.
    const record = await prisma.serialJob.findFirst({
      where: { u_id },
    });

    // If no record is found, render the 404 page.
    if (!record) {
      notFound();
    }

    // Format the record, ensuring all nullable fields from the schema are handled
    // before being passed to the client component.
    const formattedRecord = {
      ...record,
      // Non-nullable dates can be formatted directly.
      received_date: new Date(record.received_date).toISOString().split('T')[0],
      update_time: new Date(record.update_time).toISOString().split('T')[0],
      // Nullable date uses the helper function.
      date_receipt: formatDate(record.date_receipt),
      // Convert all nullable string fields to empty strings.
      replace_serial: record.replace_serial ?? '',
      supplier: record.supplier ?? '',
      brand_name: record.brand_name ?? '',
      product_code: record.product_code ?? '',
      product_name: record.product_name ?? '',
      job_no: record.job_no ?? '',
      condition: record.condition ?? '',
      remark: record.remark ?? '',
      create_by: record.create_by ?? '',
      update_by: record.update_by ?? '',
      replace_code: record.replace_code ?? '',
      replace_product: record.replace_product ?? '',
      // Convert nullable number to string.
      count_round: (record.count_round ?? 0).toString(),
    };

    // Fetch all related records, ordered by count_round.
    const jobRecords = await prisma.serialJob.findMany({
      where: { u_id },
      orderBy: {
        count_round: 'asc',
      },
    });

    // Format all related job records with the same logic.
    const formattedJobRecords = jobRecords.map(r => ({
      ...r,
      received_date: new Date(r.received_date).toISOString().split('T')[0],
      update_time: new Date(r.update_time).toISOString().split('T')[0],
      date_receipt: formatDate(r.date_receipt),
      replace_serial: r.replace_serial ?? '',
      supplier: r.supplier ?? '',
      brand_name: r.brand_name ?? '',
      product_code: r.product_code ?? '',
      product_name: r.product_name ?? '',
      job_no: r.job_no ?? '',
      condition: r.condition ?? '',
      remark: r.remark ?? '',
      create_by: r.create_by ?? '',
      update_by: r.update_by ?? '',
      replace_code: r.replace_code ?? '',
      replace_product: r.replace_product ?? '',
      // Convert nullable number to string.
      count_round: (r.count_round ?? 0).toString(),
    }));

    // Pass the clean, formatted data to the client component.
    return <DataDetailClient record={formattedRecord} jobRecords={formattedJobRecords} />;
  } catch (error) {
    console.error("Error fetching data with Prisma:", error);
    // If any database error occurs, show the not found page as a fallback.
    notFound();
  }
}
