"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";

export default function Header() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [navigationLoading, setNavigationLoading] = useState(false);

  // Instagram icon SVG
  const InstagramIcon = () => (
    <svg
      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );

  // Ticket icon SVG
  const TicketIcon = () => (
    <svg
      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );

  // User icon SVG
  const UserIcon = () => (
    <svg
      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
      <div className="w-full">
        <div className="flex justify-between items-start">
          {/* Logo - Left side */}
          <Link
            href="/"
            className="flex items-start flex-shrink-0 z-50 m-0 p-0 -mt-4 sm:-mt-3 md:-mt-4"
          >
            <Image
              src="/logo1.png"
              alt="PingSociety Logo"
              width={600}
              height={180}
              className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-30 w-auto object-contain drop-shadow-lg"
              priority
            />
          </Link>

          {/* Action Buttons - Right side */}
          <div className="flex items-start gap-0 z-50 pt-0">
            {/* Buttons in horizontal layout */}
            <div className="bg-transparent flex flex-row gap-0 items-center">
              {/* Ticket Button */}
              <button
                onClick={() => {
                  const eventsSection = document.getElementById("events");
                  if (eventsSection) {
                    eventsSection.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className="flex flex-col items-center justify-center bg-[#080358] hover:bg-[#0a0448] rounded-md p-1 sm:p-1.5 md:p-2 transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px] shadow-md cursor-pointer"
              >
                <div className="text-white">
                  <TicketIcon />
                </div>
                <span className="text-red-400 text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5">
                  Ticket
                </span>
              </button>

              {/* Log in / User Button */}
              {isLoading || navigationLoading ? (
                <div className="flex flex-col items-center justify-center bg-white/30 rounded-md p-1 sm:p-1.5 md:p-2 min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px] shadow-md">
                  <div className="text-orange-600 flex items-center justify-center animate-spin">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" opacity="0.25" />
                      <path d="M12 2a10 10 0 0 1 10 10" />
                    </svg>
                  </div>
                  {!isAuthenticated && !isLoading && (
                    <span className="text-orange-600 text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5">
                      Log in
                    </span>
                  )}
                </div>
              ) : isAuthenticated ? (
                <button
                  onClick={() => {
                    setNavigationLoading(true);
                    router.push("/dashboard");
                  }}
                  className="flex flex-col items-center justify-center bg-white hover:bg-gray-100 rounded-md p-1 sm:p-1.5 md:p-2 transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px] shadow-md cursor-pointer"
                >
                  <div className="text-orange-600 flex items-center justify-center">
                    <UserIcon />
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setNavigationLoading(true);
                    router.push("/register");
                  }}
                  className="flex flex-col items-center justify-center bg-white hover:bg-gray-100 rounded-md p-1 sm:p-1.5 md:p-2 transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px] shadow-md cursor-pointer"
                >
                  <div className="text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-base sm:text-lg md:text-xl">
                      input
                    </span>
                  </div>
                  <span className="text-orange-600 text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5">
                    Log in
                  </span>
                </button>
              )}

              {/* Follow/Instagram Button */}
              <a
                href="https://www.instagram.com/thepingsociety"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-[#080358] hover:bg-[#0a0448] rounded-md p-1 sm:p-1.5 md:p-2 transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px] shadow-md relative group"
              >
                <div className="text-white">
                  <InstagramIcon />
                </div>
                <span className="text-red-400 text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5">
                  Follow
                </span>
                {/* Tooltip showing URL on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white text-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                  https://www.instagram.com/thepingsociety
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
