"use client";

import React from "react";

interface SubtitleItem {
  text: string;
  icon: React.ReactNode;
}

interface SubtitleProps {
  className?: string;
}

// Define subtitle items with text and icons
const subtitleItems: SubtitleItem[] = [
  {
    text: "شبکه سازی",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    text: "گفتگو",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    text: "تجربه",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
        <path d="M9 10l3 3 3-3" />
      </svg>
    ),
  },
  {
    text: "مسیر شغلی",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    text: "ارتباط",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    ),
  },
  {
    text: "چالش و بازی",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    text: "بروزرسانی",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
  {
    text: "کامیونیتی",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    text: "شروع",
    icon: (
      <svg
        className="w-5 h-5 sm:w-6 sm:h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
];

export default function Subtitle({ className = "" }: SubtitleProps) {
  // Duplicate items multiple times for seamless loop (3 copies for smooth transition)
  const duplicatedItems = [
    ...subtitleItems,
    ...subtitleItems,
    ...subtitleItems,
  ];

  return (
    <div className={`w-full bg-white overflow-hidden ${className}`}>
      <div className="py-4 sm:py-5 relative">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 animate-subtitle-scroll whitespace-nowrap">
          {duplicatedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            >
              <div className="text-[#f84920] flex-shrink-0">{item.icon}</div>
              <span className="text-[#080358] text-base sm:text-lg md:text-xl lg:text-2xl font-semibold whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
