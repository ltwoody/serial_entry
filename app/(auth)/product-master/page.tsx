'use client';

import { useState, useEffect } from 'react';

function Notification({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}) {
  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  const icons = {
    success: (
      <svg
        className="w-6 h-6 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg
        className="w-6 h-6 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  };

  return (
    <div
      className={`flex items-center justify-between ${colors[type]} px-4 py-3 rounded-md shadow-md max-w-md mx-auto mt-6 animate-fadeIn`}
      role="alert"
    >
      <div className="flex items-center">
        {icons[type]}
        <p className="font-semibold">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-current hover:text-gray-700 focus:outline-none"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}

export default function UploadProductPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setMessage('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      setMessage('');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-product', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Upload failed');
        setMessage('');
      } else {
        setMessage(result.message || 'Upload complete');
        setError('');
      }
    } catch {
      setError('Network error. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-200 via-blue-300 to-blue-400 p-6">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-blue-700">
          Upload Product Master
        </h1>

        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-blue-500 rounded-lg cursor-pointer py-12 text-blue-600 hover:border-blue-700 transition"
        >
          {file ? (
            <span className="font-medium">{file.name}</span>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 8v4m0 0l-4-4m4 4l4-4"
                />
              </svg>
              <span className="text-lg font-semibold">Click to select or drag your file</span>
              <span className="text-sm text-blue-500 mt-2">Accepted: .csv, .xlsx, .xls</span>
            </>
          )}
          <input
            id="file-upload"
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          onClick={handleUpload}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition"
        >
          Upload
        </button>

        {message && (
          <Notification
            type="success"
            message={message}
            onClose={() => setMessage('')}
          />
        )}

        {error && (
          <Notification
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}
      </div>
    </div>
  );
}
