"use client";

import { useState } from "react";
import Image from "next/image";
import Container from "./Container";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          {/* Login/Register buttons - Right side */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-[#f84920] text-white px-6 py-2 rounded-lg hover:bg-[#e63e1a] transition-colors duration-200 font-medium">
              ثبت نام /  ورورد
            </button>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#f84920] transition-colors duration-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#080358] border-t border-[#f84920]/20">
              <a
                href="/events"
                className="block px-3 py-2 text-white hover:text-[#f84920] transition-colors duration-200 font-medium"
              >
                ایونت‌ها
              </a>
              <a
                href="/tickets"
                className="block px-3 py-2 text-white hover:text-[#f84920] transition-colors duration-200 font-medium"
              >
                بلیط
              </a>
              <div className="px-3 py-2 space-y-2">
                <button className="block w-full text-left text-white hover:text-[#f84920] transition-colors duration-200 font-medium">
                  ورود
                </button>
                <button className="block w-full bg-[#f84920] text-white px-4 py-2 rounded-lg hover:bg-[#e63e1a] transition-colors duration-200 font-medium text-center">
                  ثبت نام
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
