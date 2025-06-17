'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [firstname, setName] = useState('');
  const [lastname, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("❌ Passwords don't match");
      setSuccess('');
      return;
    }

    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password ,firstname,lastname}),
    });

    const data = await res.json();
    if (res.ok) {
      setSuccess('🎉 User registered successfully! Redirecting to login...');
      setError('');
      setTimeout(() => router.push('/login'), 2000);
    } else {
      setError(`❌ ${data.message}`);
      setSuccess('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">📝 Sign Up</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Firstname</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              value={firstname}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lastname</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          className="mt-6 w-full bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
          onClick={handleSignup}
        >
          Create Account
        </button>

        <button
          className="mt-3 w-full bg-gray-300 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
          onClick={() => router.back()}
        >
          ← Back
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center bg-red-100 py-2 rounded-lg">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-4 text-sm text-green-700 text-center bg-green-100 py-2 rounded-lg">
            {success}
          </p>
        )}
      </div>
    </div>
  );
}
