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
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        diversity_3
      </span>
    ),
  },
  {
    text: "گفتگو",
    icon: (
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        communication
      </span>
    ),
  },
  {
    text: "اشتراک تجربه",
    icon: (
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        ear_sound
      </span>
    ),
  },
  {
    text: "مسیر شغلی",
    icon: (
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        beenhere
      </span>
    ),
  },
  {
    text: "ارتباط",
    icon: (
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        cell_tower
      </span>
    ),
  },
  {
    text: "چالش و بازی",
    icon: (
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        extension
      </span>
    ),
  },
  {
    text: "توسعه فردی",
    icon: (
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        autorenew
      </span>
    ),
  },
  {
    text: "فضای دوستانه",
    icon: (
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        diversity_3
      </span>
    ),
  },
  {
    text: "فرصت سازی",
    icon: (
      <span className="material-symbols-outlined text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
        conversion_path
      </span>
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
    <div
      className={`w-full bg-white overflow-hidden border-4 border-[#080358] ${className}`}
    >
      <div className="py-2 sm:py-2.5 md:py-3 relative">
        <div className="flex items-center gap-1 sm:gap-1 md:gap-1 animate-subtitle-scroll whitespace-nowrap">
          {duplicatedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-baseline gap-1 flex-shrink-0"
            >
              <div className="text-[#f84920] flex-shrink-0 translate-y-1">
                {item.icon}
              </div>
              <span className="text-[#080358] text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold whitespace-nowrap">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
