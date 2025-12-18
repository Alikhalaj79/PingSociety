"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "../Container";
// import { apiService } from "@/services/api";

interface Event {
  id: string | number;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  image?: string;
  price?: number;
  capacity?: number;
  registered?: number;
  status?: "upcoming" | "ongoing" | "completed" | "cancelled";
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string | number>>(
    new Set()
  );

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use Next.js API proxy to avoid CORS/mixed-content
      const res = await fetch("/api/event", {
        method: "GET",
        cache: "no-store",
      });
      const json = await res.json();
      if (res.ok && json?.success) {
        // Ensure events is always an array
        let eventsData: Event[] = [];
        if (Array.isArray(json.events)) {
          eventsData = json.events;
        } else if (json.events && typeof json.events === "object") {
          // If events is an object, try to extract array from it
          eventsData = [];
        } else {
          eventsData = [];
        }
        setEvents(eventsData);
      } else {
        setError(json?.error || "خطا در دریافت رویدادها");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const trimmed = dateString.trim();

    // اگر تاریخ به‌صورت شمسی از بک‌اند آمده (مثلاً "1404/09/07 23:30:00")
    // همان تاریخ را بدون تبدیل تقویم نمایش می‌دهیم تا سال اشتباه (۷۸۳) نشود
    const jalaliMatch = trimmed.match(
      /^(\d{3,4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\s+(\d{1,2}:\d{2})(?::\d{2})?)?$/
    );

    if (jalaliMatch) {
      const year = parseInt(jalaliMatch[1], 10);
      if (year >= 1300 && year <= 1600) {
        const month = jalaliMatch[2].padStart(2, "0");
        const day = jalaliMatch[3].padStart(2, "0");
        return `${year}/${month}/${day}`;
      }
    }

    try {
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) return dateString;

      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const handleImageError = (eventId: string | number) => {
    setImageErrors((prev) => new Set(prev).add(eventId));
  };

  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    // Check if URL is not a placeholder/test URL
    const invalidDomains = ["example.com", "localhost", "127.0.0.1"];
    try {
      const urlObj = new URL(url);
      return !invalidDomains.some((domain) => urlObj.hostname.includes(domain));
    } catch {
      // If URL is relative or invalid format, return true (let Next.js handle it)
      return true;
    }
  };

  if (loading) {
    return (
      <section
        id="events"
        className="py-12 sm:py-16 md:py-20 bg-[#080358]"
      >
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              رویدادهای ما
            </h2>
          </div>
          <div className="flex flex-wrap justify-end gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] bg-gray-800/30 rounded-2xl p-6 animate-pulse"
              >
                <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="events"
        className="py-12 sm:py-16 md:py-20 bg-[#080358]"
      >
        <Container>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              رویدادهای ما
            </h2>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-300">{error}</p>
              <button
                onClick={fetchEvents}
                className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors border border-red-500/30"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Safety check: ensure events is always an array before using .map()
  const safeEvents = Array.isArray(events) ? events : [];

  if (safeEvents.length === 0) {
    return (
      <section
        id="events"
        className="py-12 sm:py-16 md:py-20 bg-[#080358]"
      >
        <Container>
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              رویدادهای ما
            </h2>
            <p className="text-gray-400 text-lg">هنوز رویدادی ثبت نشده است</p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      id="events"
      className="py-12 sm:py-16 md:py-20 bg-[#080358] relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <Container className="relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            رویدادهای ما
          </h2>
        </div>

        <div className="flex flex-wrap justify-end gap-6 sm:gap-8">
          {safeEvents.map((event) => (
            <div
              key={event.id}
              className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)]"
            >
              <Link href={`/events/${event.id}`} className="group block h-full">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative w-full h-48 sm:h-56 overflow-hidden flex-shrink-0">
                    {event.image &&
                    isValidImageUrl(event.image) &&
                    !imageErrors.has(event.id) ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={() => handleImageError(event.id)}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-white/30"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white line-clamp-2 text-right">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-gray-400 text-sm mb-4 text-right line-clamp-2 overflow-hidden text-ellipsis">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {event.date && (
                        <div className="flex items-center text-gray-300 text-sm flex-row-reverse">
                          <svg
                            className="w-5 h-5 ml-2 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-right font-vazirmatn">
                            {formatDate(event.date)}
                            {event.time && ` - ${event.time}`}
                          </span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center text-gray-300 text-sm flex-row-reverse">
                          <svg
                            className="w-5 h-5 ml-2 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="text-right">{event.location}</span>
                        </div>
                      )}

                      {event.price !== undefined && event.price !== null && (
                        <div className="flex items-center text-gray-300 text-sm flex-row-reverse">
                          <svg
                            className="w-5 h-5 ml-2 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-right font-vazirmatn">
                            {event.price === 0
                              ? "رایگان"
                              : `${event.price.toLocaleString()} تومان`}
                          </span>
                        </div>
                      )}
                    </div>

                    {event.capacity && event.registered !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-400 mb-1 text-right">
                          <span className="font-vazirmatn">
                            {event.registered} / {event.capacity}
                          </span>
                          <span>ظرفیت</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                (event.registered / event.capacity) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div
                      className="flex items-center text-sm font-semibold transition-colors mt-auto"
                      style={{ color: "#f84920" }}
                    >
                      مشاهده جزئیات
                      <svg
                        className="w-4 h-4 mr-2 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: "#f84920" }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
