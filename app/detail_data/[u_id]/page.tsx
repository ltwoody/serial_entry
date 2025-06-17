export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { pool } from '@/lib/db';
import DataDetailClient from '@/app/components/DataDetailClient';


interface DetailRecord {
  u_id: string;
  serial_number: string;
  replace_serial: string;
  received_date: Date;
  supplier: string;
  date_receipt: Date;
  brand_name: string;
  product_code: string;
  product_name: string;
  job_no: string;
  condition: string;
  remark: string;
  count_round: string;
  create_by: string;
  update_by: string;
  update_time: Date;
  replace_code: string;
  replace_product: string;
  rowuid: string;
}

interface Props {
  params: { u_id: string };
}

export default async function DataDetail({ params }: Props) {
  const client = await pool.connect();
  const u_id =  params.u_id;

  try {
    const res = await client.query<DetailRecord>(
      'SELECT * FROM serial_job WHERE u_id = $1',
      [u_id]
    );

    if (res.rowCount === 0) {
      notFound();
    }

    const formatDate = (date?: Date | null) => {
  if (!date) return null;
  return date.toISOString().split('T')[0]; // or use toLocaleDateString if you want locale format
};

    const record = {
  ...res.rows[0],
  date_receipt: formatDate(res.rows[0].date_receipt),
  received_date: formatDate(res.rows[0].received_date),
  update_time: formatDate(res.rows[0].update_time),
};

    // Fetch all records with the same job_no
    const jobRes = await client.query<DetailRecord>(
      'SELECT * FROM serial_job WHERE u_id = $1 ORDER BY count_round',
      [record.u_id]
    );

    const jobRecords = jobRes.rows.map(r => ({
  ...r,
  date_receipt: formatDate(r.date_receipt),
  received_date: formatDate(r.received_date),
  update_time: formatDate(r.update_time),
}));

    return <DataDetailClient record={record} jobRecords={jobRecords} />;
  } finally {
    client.release();
  }
}
