'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DataRecord {
  u_id: string;
  serial_number: string;
  replace_serial: string;
  received_date: string | null;
  supplier: string;
  date_receipt: string | null;
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
  update_time: string | null;
  reportid?: string; // Optional as it's excluded from display
}

// Helper to format date strings for display (e.g., "Jan 15, 2023, 10:30:00 AM")
const formatDisplayDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; // Invalid date

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // Use 12-hour clock with AM/PM
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Error formatting display date/time:", error);
    return 'N/A';
  }
};

// Helper to format date strings for display (e.g., "Jan 15, 2023")
const formatDisplayShortDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A'; // Invalid date

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error("Error formatting short display date:", error);
    return 'N/A';
  }
};


export default function DataDetailClient({
  record,
  jobRecords,
}: {
  record: DataRecord;
  jobRecords: DataRecord[];
}) {
  const router = useRouter();

  // Define the fields for each column
  const column1Fields: (keyof DataRecord)[] = ['date_receipt', 'create_by', 'update_by', 'count_round'];
  const column2Fields: (keyof DataRecord)[] = ['supplier', 'brand_name', 'job_no', 'remark', 'condition'];
  const column3Fields: (keyof DataRecord)[] = ['received_date', 'serial_number', 'product_code', 'product_name'];
  const column4Fields: (keyof DataRecord)[] = ['replace_serial', 'replace_code', 'replace_product', 'update_time'];

  const allColumnsFields = [column1Fields, column2Fields, column3Fields, column4Fields];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto p-8 mb-10"> {/* Increased max-w and shadow */}
        <div className="flex items-center justify-between mb-8"> {/* Increased bottom margin */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 bg-gray-200 hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg" // Slightly larger padding, bolder font, darker hover
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <h1 className="text-2xl font-extrabold text-gray-800"> {/* Larger and bolder heading */}
            📊 Job Detail - <span className="text-blue-600">ROWUID: {record.rowuid}</span>
          </h1>
        </div>

        {/* New Grid View for main record details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6 p-6 border border-gray-200 rounded-xl bg-gray-50"> {/* Increased gaps, padding, rounded, added light background */}
          {allColumnsFields.map((fieldsInColumn, colIndex) => (
            <div key={colIndex} className="flex flex-col"> {/* Removed space-y from here to manage spacing within field groups */}
              {fieldsInColumn.map(fieldKey => {
                const label = String(fieldKey).replace(/_/g, ' ');
                let displayValue: string;
                const rawValue = record[fieldKey];

                if (fieldKey === 'date_receipt' || fieldKey === 'received_date') {
                  displayValue = formatDisplayShortDate(rawValue as string | null | undefined);
                } else if (fieldKey === 'update_time') {
                  displayValue = formatDisplayDateTime(rawValue as string | null | undefined);
                } else {
                  displayValue = rawValue !== null ? String(rawValue) : 'N/A';
                }

                return (
                  <div key={fieldKey} className="mb-5 last:mb-0"> {/* Increased bottom margin for each field, removed for last item */}
                    <span className="block text-gray-500 text-sm font-bold  capitalize mb-1"> {/* Label: Subtler color, smaller, medium weight, block for new line */}
                      {label}
                    </span>
                    <span className="block text-gray-800 text-sm font-bold break-words bg-amber-100"> {/* Value: Larger, bolder, darker */}
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

     <div className="bg-white rounded-2xl shadow-xl max-w-7xl mx-auto p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          🔄 Other Records in same u_id: <span className="text-blue-600">{record.u_id}</span>
        </h2>
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
          {/* Pay close attention to this block below for whitespace */}
          <table className="min-w-full table-auto text-base text-center">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Job Claim</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Round</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Serial</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Replace Serial</th>
                <th className="px-6 py-3 font-semibold text-gray-700">S Code</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Replace Code</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Replace Name</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Received</th>
              </tr>
            </thead>
            <tbody>
              {jobRecords.map(rec => (
                <tr key={rec.rowuid} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3" >{rec.job_no}</td>
                  <td className="px-6 py-3">{rec.count_round}</td>
                  <td className="px-6 py-3">{rec.serial_number}</td>
                  <td className="px-6 py-3">{rec.replace_serial}</td>
                  <td className="px-6 py-3">{rec.product_code}</td>
                  <td className="px-6 py-3">{rec.product_name}</td>
                  <td className="px-6 py-3">{rec.replace_code}</td>
                  <td className="px-6 py-3">{rec.replace_product}</td>
                  <td className="px-6 py-3">{formatDisplayShortDate(rec.received_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* End of critical block */}
        </div>
      </div>
    </div>
  );
}