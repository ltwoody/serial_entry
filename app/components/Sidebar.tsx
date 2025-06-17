'use client';
import Link from "next/link";
import { useEffect, useState } from "react";

// Utility to read cookie
function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Sidebar() {
  const [user, setUser] = useState({ username: '', role: '' });

  useEffect(() => {
    const username = getCookieValue('user') || '';
    const role = getCookieValue('role') || '';
    setUser({ username, role });
  }, []);

  const isAdmin = user.role === "admin" || user.username === "wdadmin";

  return (
    <aside className="w-64 bg-gray-300 shadow-lg p-10 h-screen fixed top-10 left-0 overflow-hidden">
      <h2 className="text-2xl font-extrabold mb-8 text-blue-50 tracking-wide">
        
      </h2>
      <ul className="flex flex-col gap-5 ">
        {isAdmin && (
          <li>
            <Link href="/signup" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition">
              <UserIcon />
              <span className="font-medium">Create User</span>
            </Link>
          </li>
        )}

        <li>
          <Link href="/checking" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition">
            <SearchIcon />
            <span className="font-medium">Serial Check</span>
          </Link>
        </li>

        <li>
          <Link href="/create-job" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition">
            <AddIcon />
            <span className="font-medium">Add New</span>
          </Link>
        </li>

        <li>
          <Link href="/job-report" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition">
            <MenuIcon />
            <span className="font-medium">Report</span>
          </Link>
        </li>

        <li>
          <Link href="/product-search" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition">
            <MagnifierIcon />
            <span className="font-medium">Product Search</span>
          </Link>
        </li>

        {isAdmin && (
          <li>
            <Link href="/product-master" className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition">
              <UploadIcon />
              <span className="font-medium">Product Master</span>
            </Link>
          </li>
        )}
      </ul>
    </aside>
  );
}

// Icons
function UserIcon() {
  return (
    <svg className="w-5 h-5 mr-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M16 21v-2a4 4 0 00-8 0v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5 mr-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function AddIcon() {
  return (
    <svg className="w-5 h-5 mr-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-5 h-5 mr-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}

function MagnifierIcon() {
  return (
    <svg className="w-5 h-5 mr-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-5 h-5 mr-3 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}
