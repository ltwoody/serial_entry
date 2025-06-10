'use client';
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <Image
        src="/images/marnie003.jpg"
        alt="Background"
        fill
        className="object-cover z-0"
        priority
      />
    </div>
  );
}
