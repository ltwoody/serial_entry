'use client';

import Navbar from '../components/Navbar';


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  

  return (
    <>
      <Navbar />
        <main className={`flex-1 overflow-y-auto   transition-all duration-300`}>
          {children}
        </main>
        
     
     </>
  );
}
