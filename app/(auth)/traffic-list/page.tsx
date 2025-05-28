'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RECORDS_PER_PAGE = 10;

export default function TrafficList() {
  const router = useRouter();

  // States
  const [records, setRecords] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    BU: '',
    Branch: '',
    Quarter: '',
    Week: '',
    SerialNo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hasQueried, setHasQueried] = useState(false);

  // New: real-time search term
  const [searchTerm, setSearchTerm] = useState('');

  // Build query string from filters
  const buildQuery = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key.toLowerCase(), val);  // lowercase keys to API
    });
    return params.toString();
  };

  const fetchData = async () => {
    try {
      const query = buildQuery();
      const res = await fetch(`/api/traffic${query ? `?${query}` : ''}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecords(data);
      setCurrentPage(1);
      setHasQueried(true);
      setSearchTerm('');  // reset search when new data loaded
    } catch (err) {
      console.error('Fetch traffic error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle real-time search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset page when search changes
  };

  // Filter records client-side by search term across all displayed columns
  const filteredRecords = records.filter((rec) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      rec.BU?.toLowerCase().includes(term) ||
      rec.Branch?.toLowerCase().includes(term) ||
      rec.Name?.toLowerCase().includes(term) ||
      rec.Quarter?.toString().toLowerCase().includes(term) ||
      rec.Week?.toString().toLowerCase().includes(term) ||
      rec.Traffic?.toString().toLowerCase().includes(term) ||
      rec.SerialNo?.toLowerCase().includes(term)
    );
  });

  // Pagination calculations based on filteredRecords
  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-extrabold mb-6">Traffic List</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {['BU', 'Branch', 'Quarter', 'Week', 'SerialNo'].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={`Filter by ${field}`}
            value={(filters as any)[field]}
            onChange={handleChange}
            className="flex-1 min-w-[150px] rounded-md border border-gray-300 px-4 py-2"
          />
        ))}
        <button
          onClick={fetchData}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
        >
          Search
        </button>
        <button
          onClick={() => {
            setFilters({ BU: '', Branch: '', Quarter: '', Week: '', SerialNo: '' });
            setRecords([]);
            setHasQueried(false);
            setSearchTerm('');
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
        >
          Clear
        </button>
      </div>

      {/* New: Real-time Search Bar */}
      {hasQueried && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search records on this page..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-md border border-gray-300 px-4 py-2"
          />
        </div>
      )}

      {/* Table */}
      {!hasQueried ? (
        <p className="text-gray-500 text-center py-10">Please filter or show all records.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-50">
                <tr>
                  {['BU', 'Branch', 'Name', 'Quarter', 'Week', 'Traffic', 'SerialNo'].map((header) => (
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
                  currentRecords.map((rec, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => router.push(`/traffic/${rec.id}`)}
                    >
                      <td className="px-6 py-4">{rec.BU}</td>
                      <td className="px-6 py-4">{rec.Branch}</td>
                      <td className="px-6 py-4">{rec.Name}</td>
                      <td className="px-6 py-4">{rec.Quarter}</td>
                      <td className="px-6 py-4">{rec.Week}</td>
                      <td className="px-6 py-4">{rec.Traffic}</td>
                      <td className="px-6 py-4">{rec.SerialNo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border rounded-md disabled:text-gray-400 disabled:border-gray-300"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-2 border rounded-md ${
                    page === currentPage
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border rounded-md disabled:text-gray-400 disabled:border-gray-300"
            >
              Next
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
