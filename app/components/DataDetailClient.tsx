'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DataRecord {
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
  replace_code: string;
  replace_product: string;
  rowuid: string;
}



export default function DataDetailClient({
  record,
  jobRecords,
}: {
  record: DataRecord;
  jobRecords: DataRecord[];
}) {
  const router = useRouter();



  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl mx-auto p-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 bg-gray-200 hover:bg-blue-500 active:scale-95 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            📊 Job Detail - <span className="text-blue-600">ID {record.u_id}</span>
          </h1>
        </div>

        <table className="w-full table-auto text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
          <tbody className="divide-y divide-gray-200">
            {Object.entries(record).map(([key, value]) =>
              key !== 'reportid' ? (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-700 capitalize w-1/3 bg-gray-100">{key}</td>
                  <td className="px-4 py-3 text-gray-900">{value}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow-lg max-w-6xl mx-auto p-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          🔄 Other Records in Relation: <span className="text-blue-600">{record.u_id}</span>
        </h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Job Claim</th>
                <th className="px-4 py-2">Round</th>
                <th className="px-4 py-2">Serial</th>
                <th className="px-4 py-2">Replace Serial</th>
                <th className="px-4 py-2">S Code</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Replace Code</th>
                <th className="px-4 py-2">Replace Name</th>
                <th className="px-4 py-2">Received</th>
              </tr>
            </thead>
            <tbody>
              {jobRecords.map(rec => (
                <tr key={rec.rowuid} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{rec.job_no}</td>
                  <td className="px-4 py-2">{rec.count_round}</td>
                  <td className="px-4 py-2">{rec.serial_number}</td>
                  <td className="px-4 py-2">{rec.replace_serial}</td>
                  <td className="px-4 py-2">{rec.product_code}</td>
                  <td className="px-4 py-2">{rec.product_name}</td>
                  <td className="px-4 py-2">{rec.replace_code}</td>
                  <td className="px-4 py-2">{rec.replace_product}</td>
                  <td className="px-4 py-2">{rec.received_date.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
