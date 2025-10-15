"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[#080358] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-18">
          {/* Logo - Left side */}
          <div className="flex-shrink-0">
            <Image
              src="/logo2.png"
              alt="PingSociety Logo"
              width={600}
              height={180}
              className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-30 w-auto object-contain"
              priority
            />
          </div>

          {/* Login/Register button - Right side */}
          <div className="flex items-center">
            <Link href="/register">
              <button className="bg-[#f84920] text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-[#e63e1a] transition-colors duration-200 font-medium cursor-pointer text-sm sm:text-base">
                ثبت نام / ورود
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
