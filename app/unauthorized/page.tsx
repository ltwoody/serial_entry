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

 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-100 px-4">
      <div className="bg-white shadow-lg rounded-lg max-w-md w-full p-8">
        <h1 className="text-3xl font-extrabold text-red-700 mb-8 text-center">Not Allow for this Page</h1>
         <h3 className="text-xl font-extrabold text-red-700 mb-8 text-center">Please Go Back to HOME</h3>

        

        {/* Forgot Password Link */}
        <div className="mt-4 text-center text-xl">
          <Link href="/" className="text-blue-600 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}