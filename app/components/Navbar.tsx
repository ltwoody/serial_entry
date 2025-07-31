'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

// Utility to read cookie - kept from Sidebar.tsx
function getCookieValue(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Navbar() {
  //const pathname = usePathname();
  const router = useRouter();

  // State from Header.tsx
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // State for Navbar dynamic behavior
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [menuOpen, setMenuOpen] = useState(false);

  // User fetching logic from Header.tsx
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

  // Cookie-based username update from Header.tsx and role from Sidebar.tsx
  useEffect(() => {
    const usernameFromCookie = getCookieValue('user');
    const roleFromCookie = getCookieValue('role');
    if (usernameFromCookie) setUsername(usernameFromCookie);
    if (roleFromCookie) setRole(roleFromCookie);
  }, []);

  // Scroll effect logic from Navbar reference
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = 100;
      const progress = Math.min(y / max, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrolled = scrollProgress > 0.95;
  const isAdmin = role === "admin" || username === "wdadmin"; // From Sidebar.tsx

  const handleLogout = useCallback(async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUsername(null);
    setRole(null);
    router.push('/login');
  }, [router]);

  // Back button functionality removed from Navbar for simpler design,
  // but can be re-added if absolutely necessary, perhaps in specific pages.

  const navLinks = (
    <>
      <NavLink href="/checking" label="Serial Check"  />
      <NavLink href="/create-job" label="Add New" />
      <NavLink href="/job-report" label="Report" />
      <NavLink href="/product-search" label="Product Search"  />
      {isAdmin && (
        <>
          <NavLink href="/signup" label="Create User"  />
          <NavLink href="/product-master" label="Product Master"  />
        </>
      )}
    </>
  );

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 shadow transition-all duration-300',
        'flex items-center', // Added for initial flex layout
        scrolled ? 'py-2' : 'py-4' // Adjust padding based on scroll
      )}
      style={{
        paddingTop: `${1 - scrollProgress * 0.4}rem`,
        paddingBottom: `${1 - scrollProgress * 0.4}rem`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 w-full transition-all duration-300 flex justify-between items-center">
        {/* Logo and Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <Logo scrollProgress={scrollProgress} />
          
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-700">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    menuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-4">
          {navLinks}
        </div>

        {/* User Status and Logout Button */}
        <div className="flex items-center text-center space-x-4">
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
          <div className='px-10'>
          <button
            onClick={handleLogout}
            className="bg-gray-700 text-white font-bold px-4 py-2 rounded hover:bg-red-400 transition"
          >
            Logout
          </button>
        </div>
        </div>
      </div>

      {/* Mobile Navigation Links (conditionally rendered) */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/90 shadow-md pb-4 pt-2">
          <ul className="flex flex-col gap-2 px-4">
            {navLinks}
          </ul>
        </div>
      )}
    </nav>
  );
}

function Logo({ scrollProgress }: { scrollProgress: number }) {
  const scale = 1 - scrollProgress * 0.2;
  return (
    <Link
      href="/"
      className="flex items-center gap-2 transition-all duration-300"
      style={{
        transform: `translateX(-${(1 - scrollProgress) * 0}px) scale(${scale})`,
        opacity: 0.5 + scrollProgress * 0.5,
      }}
    >
      <Image
        src="/shokzserial_icon.svg" // Make sure this path is correct for your logo
        alt="Logo"
        width={40}
        height={40}
        className="h-10 w-20 object-contain"
        priority
      />
    </Link>
  );
}

function NavLink({ href, label}: { href: string; label: string;  }) {
  return (
    <Link
      className="flex items-center px-2 py-1 text-sm rounded-lg text-gray-700 hover:text-blue-400  transition"
      href={href}
    >
     
      <span className="font-light">{label}</span>
    </Link>
  );
}

