import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
   
      
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <nav className="w-64 bg-white shadow-lg rounded-r-lg p-6 flex flex-col">
        <h2 className="text-2xl font-extrabold mb-8 text-blue-700 tracking-wide">
          Serial Checking
        </h2>

        <ul className="flex flex-col gap-4">
          <SidebarLink href="/signup" label="Create User" icon={
            <svg
              className="w-5 h-5 mr-3 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M16 21v-2a4 4 0 00-8 0v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          } />

          <SidebarLink href="/checking" label="Serial Check" icon={
            <svg
              className="w-5 h-5 mr-3 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          } />

          <SidebarLink href="/create-branch-traffic" label="Add New" icon={
            <svg
              className="w-5 h-5 mr-3 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          } />

          <SidebarLink href="/traffic-list" label="Report" icon={
            <svg
              className="w-5 h-5 mr-3 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          } />

           <SidebarLink href="/product-search" label="Product Search" icon={
            <svg
              className="w-5 h-5 mr-3 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M8.25 10.875a2.625 2.625 0 1 1 5.25 0 2.625 2.625 0 0 1-5.25 0Z" />
              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.125 4.5a4.125 4.125 0 1 0 2.338 7.524l2.007 2.006a.75.75 0 1 0 1.06-1.06l-2.006-2.007a4.125 4.125 0 0 0-3.399-6.463Z" clip-rule="evenodd" />
            </svg>
          } />

          


          <SidebarLink href="/product-master" label="Product Master" icon={
            <svg
            xmlns="http://www.w3.org/2000/svg" 
              className="w-5 h-5 mr-3 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path   d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          } />
        </ul>
      </nav>

     


   


      {/* Main content */}
      <main className="flex-1 p-0 relative flex items-center justify-center">
  {/* Background Image */}
  <Image
    src="/images/marnie003.jpg"
    alt="Background"
    fill
    className="object-cover z-0"
    priority
  />

  {/* Overlay */}
 
</main>
    </div>
    

    
  );
}

function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-600 hover:text-white transition"
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
}
