// ✅ Just do this:
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import DataDetailClient from '@/app/components/DataDetailClient';

// Declare a global variable for PrismaClient to prevent multiple instances
// during development, which can lead to connection issues.
// This pattern is common in Next.js applications.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Initialize PrismaClient. If it's already initialized globally, use that instance.
// Otherwise, create a new one. This ensures a single instance across hot reloads.
const prisma = global.prisma || new PrismaClient();

// In development, assign the PrismaClient instance to the global object
// so it persists across hot module reloads.
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

// Define the exact type for the props of this page component
interface DataDetailProps {
  params: Promise<{
    u_id: string;
  }>;
}

export default async function DataDetail({ params }: DataDetailProps) {
  // Await the params object to get the actual u_id
  const resolvedParams = await params;
  const u_id = resolvedParams.u_id;

  // Helper function to format dates to 'YYYY-MM-DD' string or null
  // Prisma returns Date objects, so this function will receive Date objects directly.
  const formatDate = (date?: Date | string | null): string | null => {
    if (!date) return null;
    // Ensure it's a Date object if it somehow comes as a string (though Prisma typically gives Dates)
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return null; // Check for invalid date
    return d.toISOString().split('T')[0];
  };

  try {
    // Fetch the first serial_job record matching the u_id using Prisma's findFirst
    // This is used when u_id is not necessarily unique, but you need one record to display.
    const record = await prisma.serialJob.findFirst({ // Changed from findUnique to findFirst
      where: {
        u_id: u_id,
      },
    });

    // If no record is found, trigger Next.js's notFound()
    if (!record) {
      notFound();
    }

    // Format date fields for the main record
    const formattedRecord = {
      ...record,
      date_receipt: formatDate(record.date_receipt),
      received_date: formatDate(record.received_date),
      update_time: formatDate(record.update_time),
    };

    // Fetch all serial_job records with the same u_id, ordered by count_round
    const jobRecords = await prisma.serialJob.findMany({
      where: {
        u_id: u_id,
      },
      orderBy: {
        count_round: 'asc', // Order by count_round in ascending order
      },
    });

    // Format date fields for each job record
    const formattedJobRecords = jobRecords.map(r => ({
      ...r,
      date_receipt: formatDate(r.date_receipt),
      received_date: formatDate(r.received_date),
      update_time: formatDate(r.update_time),
    }));

    // Pass the formatted data to the client component
    return <DataDetailClient record={formattedRecord} jobRecords={formattedJobRecords} />;
  } catch (error) {
    // Log any errors that occur during database operations
    console.error("Error fetching data with Prisma:", error);
    // You might want to throw the error or render an error page/component
    // depending on your application's error handling strategy.
    notFound(); // Or handle gracefully, e.g., return <ErrorComponent message="Failed to load data"/>;
  }
}
