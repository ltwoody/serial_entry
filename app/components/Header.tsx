'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type HeaderProps = {
  onMenuClick: () => void;
};

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me');
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
        } else {
          setUsername(null);
        }
      } catch {
        setUsername(null);
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
    <header className="sticky top-0 z-50 w-full p-4 bg-blue-400  flex justify-between items-center">
      <div className="flex items-center space-x-4">
       

        {/* Menu button always shown */}
        <button
  onClick={onMenuClick}
  className="text-white text-2xl" // ← removed md:hidden
  aria-label="Toggle sidebar"
>
  ☰
</button>

        {pathname !== '/' && (
          <button
            onClick={handleBack}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-400 transition text-black-100 font-bold"
            aria-label="Go back" 
          >
            ← Back
          </button>
        )}
        <h1 className="text-xl font-semibold text-cyan-50">Serial Entry Application</h1>
      </div>

      <div className="flex items-center space-x-4">
        {username && (
          <span className="text-black-100">Hello, <strong>{username}</strong></span>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white font-bold px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
