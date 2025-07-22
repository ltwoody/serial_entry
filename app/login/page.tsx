'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link component

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Clear any previous error messages when trying to log in again
    setError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`An unexpected error occurred. Please try again. Error: ${err.message || err}`);
      console.error(err); // Use console.error for errors
    }
  };

  // New function to handle key presses
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-100 px-4">
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-8 text-center">Welcome Back</h1>

        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="Your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md shadow-sm transition"
        >
          Log In
        </button>

        {error && (
          <p className="text-red-600 mt-4 text-center font-medium">
            {error}
          </p>
        )}

        {/* Forgot Password Link */}
        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}