'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const RECORDS_PER_PAGE = 10;

export default function TrafficList() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch('/api/traffic')
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`API error: ${errorText}`);
        }
        return res.json();
      })
      .then(data => setRecords(data))
      .catch(err => {
        console.error('Fetch traffic error:', err);
      });
  }, []);

  const filtered = records.filter((record: any) =>
    Object.values(record).some((val) =>
      val != null && val.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = filtered.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Traffic List</h1>
        <button
          onClick={() => router.push('/create-branch-traffic')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-md shadow-md transition"
          aria-label="Add Branch Traffic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Branch Traffic
        </button>
      </div>

      <input
        type="search"
        placeholder="Search traffic..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full mb-6 rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
      />

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 table-auto">
          <thead className="bg-gray-50">
            <tr>
              {['BU', 'Branch', 'Name', 'Quarter', 'Week', 'Traffic'].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentRecords.length > 0 ? (
              currentRecords.map((rec: any, id) => (
                <tr
                  key={id}
                  className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => router.push(`/traffic/${rec.id}`)} // Example if you want to go to details
                >{/* <td>{rec.id}</td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{rec.BU}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{rec.Branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{rec.Name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{rec.Quarter}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{rec.Week}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{rec.Traffic}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <nav
        aria-label="Pagination"
        className="flex justify-center items-center mt-6 space-x-2"
      >
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-md border ${
            currentPage === 1
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-blue-600 text-blue-600 hover:bg-blue-100'
          } transition`}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          return (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`px-3 py-2 rounded-md border ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              } transition`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md border ${
            currentPage === totalPages
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-blue-600 text-blue-600 hover:bg-blue-100'
          } transition`}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
