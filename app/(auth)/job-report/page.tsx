'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, FileText } from 'lucide-react'; // Import FileText icon

const RECORDS_PER_PAGE = 10;

interface JobRecord {
  u_id: string;
  serial_number: string;
  received_date: Date; // Keep as Date, format for display
  supplier: string;
  date_receipt: Date; // Keep as Date, format for display
  product_code: string;
  brand_name: string;
  job_no: string;
  product_name: string;
  replace_serial: string;
  count_round: number;
  rowuid: string;
}

// Define the type for your filters object
interface JobFilters {
  u_id: string;
  serial_number: string;
  received_date: string; // Filters are usually strings
  supplier: string;
  date_receipt: string; // Filters are usually strings
  product_code: string;
  brand_name: string;
  job_no: string;
  product_name: string;
  replace_serial: string;
  count_round: string; // Filters are usually strings
  rowuid: string;
}

export default function JobReport() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state for role

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setRole(data.role);
        } else {
          setRole(null);
        }
      } catch {
        setRole(null);
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    }
    fetchUser();
  }, []);

  // States
  const [records, setRecords] = useState<JobRecord[]>([]);
  // Use the defined JobFilters type
  const [filters, setFilters] = useState<JobFilters>({
    u_id: '',
    serial_number: '',
    received_date: '',
    supplier: '',
    date_receipt: '',
    product_code: '',
    brand_name: '',
    job_no: '',
    product_name: '',
    replace_serial: '',
    count_round: '',
    rowuid: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [hasQueried, setHasQueried] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Build query string from filters
  const buildQuery = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key.toLowerCase(), val); // lowercase keys to API
    });
    return params.toString();
  };

  const fetchData = async () => {
    try {
      const query = buildQuery();
      const res = await fetch(`/api/jobs${query ? `?${query}` : ''}`);
      if (!res.ok) throw new Error(await res.text());
      const data: JobRecord[] = await res.json(); // Explicitly type data
      // Ensure date fields are Date objects if they come as strings from API
      const processedData = data.map(record => ({
        ...record,
        received_date: record.received_date ? new Date(record.received_date) : record.received_date,
        date_receipt: record.date_receipt ? new Date(record.date_receipt) : record.date_receipt,
      }));
      setRecords(processedData);
      setCurrentPage(1);
      setHasQueried(true);
      setSearchTerm(''); // reset search when new data loaded
    } catch (err) {
      console.error('Fetch Jobs error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async (rowuid: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const res = await fetch(`/api/delete-job/${rowuid}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error(await res.text());

      fetchData(); // Re-fetch data after successful deletion
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete record');
    }
  };

  const handleExport = async () => {
  try {
    const query = buildQuery(); // This will include your current filters
    const response = await fetch(`/api/export-jobs${query ? `?${query}` : ''}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to export data: ${errorText}`);
    }

    // Get the blob (file content) from the response
    const blob = await response.blob();

    // Create a URL for the blob and trigger a download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job_report.xlsx'; // Suggested filename
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url); // Clean up the URL object

    alert('Job report exported successfully!');
  } catch (error) {
    console.error('Export failed:', error);
    alert(`Failed to export data to Excel: ${error instanceof Error ? error.message : String(error)}`);
  }
};

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredRecords = records.filter((rec) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    // Use optional chaining for properties that might be null/undefined for safety
    return (
      rec.u_id?.toLowerCase().includes(term) ||
      rec.serial_number?.toLowerCase().includes(term) ||
      rec.supplier?.toLowerCase().includes(term) ||
      rec.product_code?.toString().toLowerCase().includes(term) ||
      rec.brand_name?.toString().toLowerCase().includes(term) ||
      rec.job_no?.toLowerCase().includes(term) ||
      rec.product_name?.toLowerCase().includes(term) ||
      rec.replace_serial?.toLowerCase().includes(term) ||
      rec.rowuid?.toLowerCase().includes(term) ||
      (rec.received_date ? rec.received_date.toLocaleDateString('en-CA').toLowerCase().includes(term) : false) ||
      (rec.date_receipt ? rec.date_receipt.toLocaleDateString('en-CA').toLowerCase().includes(term) : false) ||
      (rec.count_round ? rec.count_round.toString().toLowerCase().includes(term) : false)
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading user role...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Job Report</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Cast 'field' to a key of JobFilters */}
          {(['serial_number', 'supplier'] as Array<keyof JobFilters>).map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              placeholder={`Filter by ${field}`}
              value={filters[field] ?? ''} // Now TypeScript knows 'field' is a valid key
              onChange={handleChange}
              className="flex-1 min-w-[150px] rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ))}
          <button
            onClick={fetchData}
            className="bg-gray-500 text-white px-5 py-2 rounded-md text-sm hover:bg-gray-700"
          >
            Search
          </button>
          <button
            onClick={() => {
              setFilters({
                u_id: '',
                serial_number: '',
                received_date: '',
                supplier: '',
                date_receipt: '',
                product_code: '',
                brand_name: '',
                job_no: '',
                product_name: '',
                replace_serial: '',
                count_round: '',
                rowuid: '',
              });
              setRecords([]);
              setHasQueried(false);
              setSearchTerm('');
            }}
            className=" bg-red-400 text-white px-5 py-2 rounded-md text-sm hover:bg-red-600"
          >
            Clear
          </button>

          {/* Export Button - Visible only to admin */}
          {role === 'admin' && (
            <button
              onClick={handleExport}
              className="bg-green-500 text-white px-5 py-2 rounded-md text-sm hover:bg-green-700 flex items-center gap-2"
              title="Export data to Excel"
            >
              <FileText size={18} />
              Export
            </button>
          )}
        </div>

        {/* Search Bar */}
        {hasQueried && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search records on this page..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* Table or Message */}
        {!hasQueried ? (
          <p className="text-gray-500 text-center py-12 italic">Please filter or show all records.</p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    {['Job No.', 'Serial', 'Date Receipt', 'Received Date', 'Supplier', 'Brand', 'S Code', 'Product Name', 'Replace Serial', 'Round'].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3  font-semibold text-xs text-center text-gray-700 uppercase tracking-wide"
                      >
                        {header}
                      </th>
                    ))}
                    <th className="px-4 py-3  text-xs text-gray-700 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentRecords.length > 0 ? (
                    currentRecords.map((rec, idx) => (
                      <tr
                        key={idx}
                        className={`text-center cursor-pointer ${idx % 2 === 0
                            ? ' bg-white hover:bg-gray-200'
                            : 'bg-gray-100 hover:bg-gray-300'
                          }`}
                      >
                        <td className="px-4 py-3">{rec.job_no}</td>
                        <td className="px-4 py-3 break-words max-w-sm">{rec.serial_number}</td>
                        {/* Format dates for display */}
                        <td className="px-4 py-3">{rec.date_receipt ? rec.date_receipt.toLocaleDateString('en-CA') : ''}</td>
                        <td className="px-4 py-3">{rec.received_date ? rec.received_date.toLocaleDateString('en-CA') : ''}</td>
                        <td className="px-4 py-3">{rec.supplier}</td>
                        <td className="px-4 py-3">{rec.brand_name}</td>
                        <td className="px-4 py-3">{rec.product_code}</td>
                        <td className="px-4 py-3">{rec.product_name}</td>
                        <td className="px-4 py-3">{rec.replace_serial}</td>
                        <td className="px-4 py-3">{rec.count_round}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3 text-gray-700"> {/* Added justify-center */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/detail_data/${rec.u_id}`);
                              }}
                              className="hover:text-blue-600"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/edit-job/${rec.rowuid}`);
                              }}
                              className="hover:text-yellow-600"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>

                            {role === 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(rec.rowuid);
                                }}
                                className="hover:text-red-600"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="text-center py-8 text-gray-400"> {/* Updated colspan */}
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <nav className="flex justify-center mt-6 space-x-1 text-sm">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:text-gray-400 disabled:border-gray-200"
              >
                Previous
              </button>

              {currentPage > 2 && (
                <>
                  <button onClick={() => goToPage(1)} className="px-3 py-1 border rounded border-gray-300 hover:bg-gray-100">1</button>
                  {currentPage > 3 && <span className="px-2 py-1 text-gray-400">...</span>}
                </>
              )}

              {[-1, 0, 1].map((offset) => {
                const page = currentPage + offset;
                if (page > 0 && page <= totalPages) {
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 border rounded ${page === currentPage
                          ? 'bg-gray-500 text-white border-gray-700'
                          : 'border-gray-300 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  );
                }
                return null;
              })}

              {currentPage < totalPages - 1 && (
                <>
                  {currentPage < totalPages - 2 && <span className="px-2 py-1 text-gray-400">...</span>}
                  <button onClick={() => goToPage(totalPages)} className="px-3 py-1 border rounded border-gray-300 hover:bg-gray-100">
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:text-gray-400 disabled:border-gray-200"
              >
                Next
              </button>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
