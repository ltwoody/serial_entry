'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState(''); // Could be username or email
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!identifier) {
      setError('Please enter your username or email.');
      return;
    }

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'If an account with that username or email exists, a password reset link has been sent.');
        // Optionally, redirect after a delay or just show the message
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password request error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-100 px-4">
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">Forgot Password</h1>
        <p className="text-gray-600 mb-6 text-center">
          Enter your username or email address and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
          <input
            id="identifier"
            type="text"
            placeholder="Your username or email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md shadow-sm transition"
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p className="text-green-600 mt-4 text-center font-medium">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 mt-4 text-center font-medium">
            {error}
          </p>
        )}

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}