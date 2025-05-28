'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

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

export default function TrafficDetailClient({ record }: { record: TrafficRecord }) {
  const router = useRouter();

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 bg-gray-200 hover:bg-blue-500 active:scale-95 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-800">
            📊 Traffic Detail - <span className="text-blue-600">ID {record.id}</span>
          </h1>
        </div>

        <table className="w-full table-auto text-sm text-left border border-gray-300 rounded-lg overflow-hidden">
          <tbody className="divide-y divide-gray-200">
            {Object.entries(record).map(([key, value]) => (
              key !== 'id' && (
                <tr key={key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-700 capitalize w-1/3 bg-gray-100">{key}</td>
                  <td className="px-4 py-3 text-gray-900">{value}</td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
 