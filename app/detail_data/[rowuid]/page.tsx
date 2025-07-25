// app/(auth)/detail_data/[rowuid]/page.tsx

// ✅ This ensures the page is always rendered dynamically, fetching fresh data on each request.
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import DataDetailClient from '@/app/components/DataDetailClient'; // Adjust path if necessary

// This is the standard pattern to prevent multiple Prisma Client instances in development.
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

// Defines the props type, now correctly expecting 'rowuid' directly in params.
// update to use promise
interface DataDetailProps {
  params: Promise<{rowuid: string}>
}

export default async function DataDetail({ params }: DataDetailProps) {
  // Destructure 'rowuid' directly from params.
  const rowuid  = (await params).rowuid;

  // Helper function to ensure dates are consistently passed as ISO strings or null.
  // The DataDetailClient component will then format these strings for display.
  const ensureDateToISOStringOrNull = (date?: Date | string | null): string | null => {
    if (!date) return null;
    const d = new Date(date);
    // Return ISO string if valid date, otherwise null
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  try {
    // 1. Fetch the specific record matching the 'rowuid' from the URL.
    // We use findUnique because 'rowuid' is expected to be a unique identifier.
    const record = await prisma.serialJob.findUnique({
      where: { rowuid }, // IMPORTANT: Changed to fetch by 'rowuid'
    });

    // If no record is found for the given rowuid, render the 404 page.
    if (!record) {
      notFound();
    }

    // 2. Format the primary record data before passing it to the client component.
    // This ensures consistency and handles nullable fields.
    const formattedRecord = {
      ...record,
      // Convert Date objects to ISO strings, allowing DataDetailClient to format them.
      received_date: ensureDateToISOStringOrNull(record.received_date),
      update_time: ensureDateToISOStringOrNull(record.update_time),
      date_receipt: ensureDateToISOStringOrNull(record.date_receipt),
      // Ensure all nullable string fields default to an empty string.
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
      // Convert nullable number to string, as DataDetailClient expects 'count_round' as string.
      count_round: (record.count_round ?? 0).toString(),
    };

    // 3. Fetch all related records using the 'u_id' from the *specifically fetched record*.
    // This ensures the "Other Records" table displays all entries associated with the same 'u_id'.
    const jobRecords = await prisma.serialJob.findMany({
      where: { u_id: record.u_id }, // Use the 'u_id' from the 'record' we just fetched
      orderBy: {
        count_round: 'asc', // Keep the ordering for consistency
      },
    });

    // 4. Format all related job records using the same logic as the primary record.
    const formattedJobRecords = jobRecords.map(r => ({
      ...r,
      received_date: ensureDateToISOStringOrNull(r.received_date),
      update_time: ensureDateToISOStringOrNull(r.update_time),
      date_receipt: ensureDateToISOStringOrNull(r.date_receipt),
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
