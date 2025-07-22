export const dynamic = 'force-dynamic';



import { notFound } from 'next/navigation';

import { pool } from '@/lib/db';

import DataDetailClient from '@/app/components/DataDetailClient';



// Define the exact type for the props of this page component

// IMPORTANT: params is now a Promise<...>

interface DataDetailProps {

params: Promise<{

u_id: string;

}>;

// If you also use searchParams, they would also be Promises:

// searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;

}



export default async function DataDetail({ params }: DataDetailProps) {

// Await the params object to get the actual u_id

const resolvedParams = await params;

const u_id = resolvedParams.u_id;



const client = await pool.connect();



try {

const res = await client.query(

'SELECT * FROM serial_job WHERE u_id = $1',

[u_id]

);



if (res.rowCount === 0) {

notFound();

}



const formatDate = (date?: Date | string | null): string | null => {

if (!date) return null;

const d = typeof date === 'string' ? new Date(date) : date;

if (isNaN(d.getTime())) return null;

return d.toISOString().split('T')[0];

};



const record = {

...res.rows[0],

date_receipt: formatDate(res.rows[0].date_receipt),

received_date: formatDate(res.rows[0].received_date),

update_time: formatDate(res.rows[0].update_time),

};



const jobRes = await client.query(

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