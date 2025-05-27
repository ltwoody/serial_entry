'use client';

import { useRouter } from 'next/navigation';

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
    <div className="p-10 max-w-3xl mx-auto">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6">Traffic Detail - ID {record.id}</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <tbody>
          <tr className="border border-gray-300">
            <td className="p-2 font-semibold border border-gray-300">BU</td>
            <td className="p-2 border border-gray-300">{record.BU}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-2 font-semibold border border-gray-300">Branch</td>
            <td className="p-2 border border-gray-300">{record.Branch}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-2 font-semibold border border-gray-300">Name</td>
            <td className="p-2 border border-gray-300">{record.Name}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-2 font-semibold border border-gray-300">Quarter</td>
            <td className="p-2 border border-gray-300">{record.Quarter}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-2 font-semibold border border-gray-300">Week</td>
            <td className="p-2 border border-gray-300">{record.Week}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-2 font-semibold border border-gray-300">Traffic</td>
            <td className="p-2 border border-gray-300">{record.Traffic}</td>
          </tr>
          <tr className="border border-gray-300">
            <td className="p-2 font-semibold border border-gray-300">SerialNo</td>
            <td className="p-2 border border-gray-300">{record.SerialNo}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
