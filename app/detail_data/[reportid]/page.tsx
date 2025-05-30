export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { pool } from '@/lib/db';
import DataDetailClient from '@/app/components/DataDetailClient';


interface DetailRecord {
  reportid: number;
  job_no: string;
  job_date: Date;
  received_date: Date;
  supplier_name: string;
  brand: string;
  product_code: string;
  product_name: string;
  status: string;
  round: number;
  serial_no: string;
}

interface Props {
  params: { reportid: string };
}

export default async function DataDetail({ params }: Props) {
  const client = await pool.connect();
  const reportid = Number(params.reportid);

  try {
    const res = await client.query<DetailRecord>(
      'SELECT * FROM job_report WHERE reportid = $1',
      [reportid]
    );

    if (res.rowCount === 0) {
      notFound();
    }

    const record = {
      ...res.rows[0],
      job_date: res.rows[0].job_date?.toLocaleDateString('en-UK'),
      received_date: res.rows[0].received_date?.toLocaleDateString('en-UK'),
    };

    // Fetch all records with the same job_no
    const jobRes = await client.query<DetailRecord>(
      'SELECT * FROM job_report WHERE job_no = $1 ORDER BY round',
      [record.job_no]
    );

    const jobRecords = jobRes.rows.map(r => ({
      ...r,
      job_date: r.job_date?.toString().split('T')[0],
      received_date: r.received_date?.toString().split('T')[0],
    }));

    return <DataDetailClient record={record} jobRecords={jobRecords} />;
  } finally {
    client.release();
  }
}
