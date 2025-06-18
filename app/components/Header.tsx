'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';



export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
          setRole(data.role);
        } else {
          setUsername(null);
          setRole(null);
        }
      } catch {
        setUsername(null);
        setRole(null);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const usernameFromCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='))
      ?.split('=')[1];
    if (usernameFromCookie) setUsername(decodeURIComponent(usernameFromCookie));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-50 w-full p-4 bg-gray-300  flex justify-between items-center">
      <div className="flex items-center space-x-4">


        {/* Menu button always shown */}
        <button
          onClick={onMenuClick}
          className="text-gray-700 text-2xl" // ← removed md:hidden
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {pathname !== '/' && (
          <button
            onClick={handleBack}
            className="px-3 py-1 bg-gray-500 rounded hover:bg-gray-400 transition text-gray-200 font-bold"
            aria-label="Go back"
          >
            ← Back
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-700">Serial Entry Application</h1>
      </div>

      <div className="flex items-center space-x-4">
        {username && (
          <div className="flex flex-col text-sm leading-tight">
            <span className="text-black">
              Hello, <strong>{username}</strong>
            </span>
            <span className="text-gray-600 text-xs">
              (<strong>{role}</strong>)
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-400 text-white font-bold px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
