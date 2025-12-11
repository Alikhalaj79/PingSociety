"use client";

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";

export default function Header() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const [navigationLoading, setNavigationLoading] = useState(false);

  // Instagram icon SVG - matches the design
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
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" />
    </svg>
  );

  // Ticket icon SVG - with perforations like in the image
  const TicketIcon = () => (
    <svg
      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Main ticket rectangle */}
      <rect x="5" y="7" width="14" height="10" rx="1" />
      {/* Left semi-circle cutouts */}
      <path d="M5 10 A1.5 1.5 0 0 1 5 7" fill="none" />
      <path d="M5 14 A1.5 1.5 0 0 0 5 17" fill="none" />
      {/* Right semi-circle cutouts */}
      <path d="M19 10 A1.5 1.5 0 0 0 19 7" fill="none" />
      <path d="M19 14 A1.5 1.5 0 0 1 19 17" fill="none" />
      {/* Three dots in center (perforations) */}
      <circle cx="12" cy="9.5" r="0.6" fill="currentColor" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
      <circle cx="12" cy="14.5" r="0.6" fill="currentColor" />
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
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=input"
        />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings:
              'FILL' 0,
              'wght' 400,
              'GRAD' 0,
              'opsz' 24;
          }
        `}</style>
      </Head>
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

            {/* Action Buttons - Right side - Fixed to top */}
            <div className="flex items-start gap-0 z-50 pt-0">
              {/* Buttons in horizontal layout - matching the image design */}
              <div className="bg-transparent flex flex-row gap-0 items-start rounded-bl-lg overflow-hidden">
                {/* Event Button - Dark blue background, white icon, orange-red text */}
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
                  className="flex flex-col items-center justify-center bg-[#080358] hover:bg-[#0a0448] p-1 sm:p-1.5 md:p-2 transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px] cursor-pointer rounded-bl-lg"
                >
                  <div className="text-white">
                    <TicketIcon />
                  </div>
                  <span className="text-[#F84920] text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5">
                    Event
                  </span>
                </button>

                {/* Log in Button - White background, orange-red icon and text - Fixed to top */}
                {isLoading || navigationLoading ? (
                  <div className="flex flex-col items-center justify-center bg-white p-1 sm:p-1.5 md:p-2 min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px]">
                    <div className="text-[#F84920] flex items-center justify-center animate-spin">
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
                      <span className="text-[#F84920] text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5">
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
                    className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 p-1 sm:p-1.5 md:p-2 transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[48px] md:min-h-[57px] cursor-pointer"
                  >
                    <div className="text-[#F84920] flex items-center justify-center">
                      <UserIcon />
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setNavigationLoading(true);
                      router.push("/register");
                    }}
                    className="flex flex-col items-center justify-center bg-white hover:bg-gray-50 p-1 sm:p-1.5 md:p-2 transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px] cursor-pointer"
                  >
                    <div className="text-[#F84920] flex items-center justify-center">
                      <span className="material-symbols-outlined text-base sm:text-lg md:text-xl">
                        input
                      </span>
                    </div>
                    <span className="text-[#F84920] text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5">
                      Log in
                    </span>
                  </button>
                )}

                {/* Follow/Instagram Button - Dark blue background, white icon, orange-red text */}
                <a
                  href="https://www.instagram.com/thepingsociety"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center bg-[#080358] hover:bg-[#0a0448] p-1 sm:p-1.5 md:p-2 transition-colors min-w-[40px] sm:min-w-[50px] md:min-w-[65px] min-h-[40px] sm:min-h-[44px] md:min-h-[56px] relative group"
                >
                  <div className="text-white">
                    <InstagramIcon />
                  </div>
                  <span className="text-[#F84920] text-[9px] sm:text-[10px] md:text-xs font-medium mt-0.5">
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
    </>
  );
}
