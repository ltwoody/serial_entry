'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import Sidebar from '@/app/components/Sidebar';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header with menu toggle */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (always toggleable) */}
        <div
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-blue-400 shadow-lg p-6
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <Sidebar />
        </div>

        {/* Transparent backdrop on toggle */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-transparent z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto bg-gray-50  transition-all duration-300`}>
          {children}
        </main>
      </div>
    </div>
  );
}
