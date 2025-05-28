'use client';

import { useState } from 'react';

type Product = {
  product_code: string;
  brand: string;
  product_name: string;
};

export default function ProductSearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    } catch (err) {
      setError((err as Error).message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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
          className="bg-blue-600 text-white px-6 py-2 rounded-r-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {products.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Product Code</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Brand</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Product Name</th>
            </tr>
          </thead>
          <tbody>
            {products.map(({ product_code, brand, product_name }) => (
              <tr key={product_code} className="hover:bg-blue-50">
                <td className="border border-gray-300 px-4 py-2">{product_code}</td>
                <td className="border border-gray-300 px-4 py-2">{brand}</td>
                <td className="border border-gray-300 px-4 py-2">{product_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>No products found.</p>
      )}
    </div>
  );
}
