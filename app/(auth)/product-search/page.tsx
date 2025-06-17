'use client';

import { useState, useMemo } from 'react';

type Product = {
  product_code: string;
  brand_name: string;
  product_name: string;
};

const RECORDS_PER_PAGE = 10;

export default function ProductSearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredQuery, setFilteredQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search term.');
      setProducts([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/product-search?query=${encodeURIComponent(query.trim())}`);
      if (!res.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await res.json();
      setProducts(data.products);
      setFilteredQuery('');
      setCurrentPage(1);
    } catch (err) {
      setError((err as Error).message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filtering on fetched data
  const filteredProducts = useMemo(() => {
    if (!filteredQuery.trim()) return products;
    const lower = filteredQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.product_code.toLowerCase().includes(lower) ||
        p.brand_name.toLowerCase().includes(lower) ||
        p.product_name.toLowerCase().includes(lower)
    );
  }, [filteredQuery, products]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / RECORDS_PER_PAGE);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + RECORDS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Product Search</h1>

      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Search by product code, name or brand"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-gray-500 text-white px-6 py-2 rounded-r-md hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {products.length > 0 && (
        <input
          type="text"
          placeholder="Quick filter results..."
          value={filteredQuery}
          onChange={(e) => {
            setFilteredQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="mb-4 w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      )}

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {currentData.length > 0 ? (
        <>
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Product Code</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Brand</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map(({ product_code, brand_name, product_name }) => (
                <tr key={product_code} className="hover:bg-blue-50">
                  <td className="border border-gray-300 px-4 py-2">{product_code}</td>
                  <td className="border border-gray-300 px-4 py-2">{brand_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{product_name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        !loading && products.length > 0 && <p>No products match the filter.</p>
      )}
    </div>
  );
}
