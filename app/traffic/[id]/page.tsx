import { notFound } from 'next/navigation';
import { pool } from '@/lib/db';
import TrafficDetailClient from '@/app/components/TrafficDetailClient';


interface TrafficRecord {
  id: number;
  BU: string;
  Branch: string;
  Name: string;
  Quarter: string;
  Week: string;
  Traffic: number;
  SerialNo: string;
}

interface Props {
  params: { id: string };
}

export default async function TrafficDetail({ params }: Props) {
  const client = await pool.connect();

  try {
    const res = await client.query<TrafficRecord>(
      'SELECT * FROM traffictable WHERE id = $1',
      [params.id]
    );

    if (res.rowCount === 0) {
      notFound();
    }

    const record = res.rows[0];

    // Pass fetched record to client component
    return <TrafficDetailClient record={record} />;
  } finally {
    client.release();
  }
}
