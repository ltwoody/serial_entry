'use client';

import { useState } from 'react';

export default function CheckingPage() {
  const [serialNo, setSerialNo] = useState('');
  const [message, setMessage] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!serialNo.trim()) {
      setMessage('Please enter a Serial Number.');
      setIsValid(false);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsValid(null);

    try {
      const res = await fetch('/api/checking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SerialNo: serialNo.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setIsValid(true);
      } else {
        setMessage(data.message);
        setIsValid(false);
      }
    } catch (error) {
      setMessage('Error checking serial number.');
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Check Serial Number</h1>

      <input
        type="text"
        placeholder="Enter Serial Number"
        value={serialNo}
        onChange={(e) => setSerialNo(e.target.value)}
        className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
      />

      <button
        onClick={handleCheck}
        disabled={loading}
        className={`w-full py-2 rounded text-white ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Checking...' : 'Check'}
      </button>

      {message && (
        <p
          className={`mt-4 text-center font-semibold ${
            isValid ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
    </main>
  );
}
