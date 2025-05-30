'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RECORDS_PER_PAGE = 10;

interface JobRecord {
  reportid: string;
  serial_no: string;
  job_date: Date;
  supplier_name: string;
  received_date: Date;
  product_code: string;
  brand: string;
  job_no: string;
  product_name: string;
  status: string;
  round: string;
}

export default function JobReport() {

  
  const router = useRouter();

  // States
  const [records, setRecords] = useState<JobRecord[]>([]);
  const [filters, setFilters] = useState({
    reportid: '',
    serial_no: '',
    job_date: '',
    supplier_name: '',
    received_date: '',
    product_code: '',
    brand: '',
    jobno: '',
    product_name: '',
    status: '',
    round: '',
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
      const res = await fetch(`/api/jobs${query ? `?${query}` : ''}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecords(data);
      setCurrentPage(1);
      setHasQueried(true);
      setSearchTerm('');  // reset search when new data loaded
    } catch (err) {
      console.error('Fetch Jobs error:', err);
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
      rec.reportid?.toLowerCase().includes(term) ||
      rec.serial_no?.toLowerCase().includes(term) ||

      rec.supplier_name?.toLowerCase().includes(term) ||

      rec.product_code?.toString().toLowerCase().includes(term) ||
      rec.brand?.toString().toLowerCase().includes(term) ||
      rec.job_no?.toLowerCase().includes(term) ||
      rec.product_name?.toLowerCase().includes(term) ||
      rec.status?.toLowerCase().includes(term) 
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
      <h1 className="text-3xl font-extrabold mb-6">Job Report</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {['job_no', 'serial_no', 'supplier_name'].map((field) => (
          <input
            key={field}
            type="text"
            name={field}
            placeholder={`Filter by ${field}`}
            value={filters[field] ?? ''}
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
            setFilters({ reportid:'',
              serial_no: '',
    job_date: '',
    supplier_name: '',
    received_date: '',
    product_code: '',
    brand: '',
    jobno: '',
    product_name: '',
    status: '',
    round: '' });
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
            <table className="min-w-full divide-y divide-gray-200 text-xs table-auto">
              <thead className="bg-gray-500 text-center text-nowrap">
                <tr 
                >
                  {['Job No.', 'Serial', 'Job Date', 'Received Date', 'Supplier', 'Brand', 'S Code','Product Name','Status','Round'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs  text-gray-100 font-extrabold uppercase tracking-wider"
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
                      className="hover:bg-blue-50 cursor-pointer first:bg-blue-100 odd:bg-white even:bg-gray-200 text-center"
                      onClick={() => 
                      { console.log('Navigating to: ', rec.reportid)
                        router.push(`/detail_data/${rec.reportid}`)}
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap">{rec.job_no}</td>
                       {/*px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]*/}
                      <td className="px-6 py-4 whitespace-normal break-words max-w-sm">{rec.serial_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
  {rec.job_date ? new Date(rec.job_date).toLocaleDateString('en-CA') : ''}
</td>
                      <td className="px-6 py-4 whitespace-nowrap">
  {rec.received_date ? new Date(rec.received_date).toLocaleDateString('en-CA') : ''}
</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rec.supplier_name}</td>
                      <td className="px-6 py-4">{rec.brand}</td>
                      <td className="px-6 py-4">{rec.product_code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rec.product_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{rec.status}</td>
                      <td className="px-6 py-4">{rec.round}</td>
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

  {/* First page */}
  {currentPage > 2 && (
    <>
      <button
        onClick={() => goToPage(1)}
        className="px-3 py-2 border rounded-md text-gray-700 border-gray-300 hover:bg-gray-100"
      >
        1
      </button>
      {currentPage > 3 && <span className="px-2 py-2">...</span>}
    </>
  )}

  {/* Page window around current */}
  {[-1, 0, 1].map((offset) => {
    const page = currentPage + offset;
    if (page > 0 && page <= totalPages) {
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
    }
    return null;
  })}

  {/* Last page */}
  {currentPage < totalPages - 1 && (
    <>
      {currentPage < totalPages - 2 && <span className="px-2 py-2">...</span>}
      <button
        onClick={() => goToPage(totalPages)}
        className="px-3 py-2 border rounded-md text-gray-700 border-gray-300 hover:bg-gray-100"
      >
        {totalPages}
      </button>
    </>
  )}

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
