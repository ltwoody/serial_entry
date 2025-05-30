'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DataRecord {
  reportid: number;
  job_no: string;
  job_date: Date;
  received_date: string;
  supplier_name: string;
  brand: string;
  product_code: string;
  product_name: string;
  status: string;
  round: number;
  serial_no: string;
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
            📊 Job Detail - <span className="text-blue-600">ID {record.reportid}</span>
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
          🔄 Other Records in Job No: <span className="text-blue-600">{record.job_no}</span>
        </h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Report ID</th>
                <th className="px-4 py-2">Round</th>
                <th className="px-4 py-2">Serial</th>
                <th className="px-4 py-2">Product Name</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Received</th>
              </tr>
            </thead>
            <tbody>
              {jobRecords.map(rec => (
                <tr key={rec.reportid} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{rec.reportid}</td>
                  <td className="px-4 py-2">{rec.round}</td>
                  <td className="px-4 py-2">{rec.serial_no}</td>
                  <td className="px-4 py-2">{rec.product_name}</td>
                  <td className="px-4 py-2">{rec.status}</td>
                  <td className="px-4 py-2">{rec.received_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
