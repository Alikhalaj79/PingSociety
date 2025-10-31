"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Ticket {
  id: string;
  eventTitle: string;
  eventDate: string;
  status: "active" | "used" | "cancelled";
  qrCode?: string;
}

interface Order {
  id: number | string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  quantity?: number;
  ticketPrice?: number;
  createdAt?: string;
  event?: {
    id?: number | string;
    title?: string;
    description?: string;
    startDate?: string;
    image?: string;
  };
  ticket?: {
    price?: number;
  };
}

interface OverviewTabProps {
  tickets: Ticket[];
  orders: Order[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "used":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "cancelled":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "فعال";
    case "used":
      return "استفاده شده";
    case "cancelled":
      return "لغو شده";
    default:
      return "نامشخص";
  }
};

const getOrderStatusColor = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "CONFIRMED":
    case "PAID":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "CANCELLED":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

export default function OverviewTab({ tickets, orders }: OverviewTabProps) {
  const hasTickets = tickets && tickets.length > 0;
  const hasOrders = orders && orders.length > 0;
  const hasAnyData = hasTickets || hasOrders;
  const [imageErrors, setImageErrors] = useState<Set<string | number>>(
    new Set()
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const handleImageError = (orderId: string | number) => {
    setImageErrors((prev) => new Set(prev).add(orderId));
  };

  const isValidImageUrl = (url?: string): boolean => {
    if (!url || typeof url !== "string") return false;
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return false;

    // If URL is absolute (starts with http or https)
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      const invalidDomains = ["example.com", "localhost", "127.0.0.1"];
      try {
        const urlObj = new URL(trimmedUrl);
        // Check if hostname exactly matches or ends with invalid domains
        const hostname = urlObj.hostname.toLowerCase();
        return !invalidDomains.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
        );
      } catch {
        // If URL cannot be parsed, still try to display it (might be valid but malformed)
        // Only reject if it's clearly invalid
        return (
          !trimmedUrl.includes("example.com") &&
          !trimmedUrl.includes("localhost") &&
          !trimmedUrl.includes("127.0.0.1")
        );
      }
    }

    // If URL is relative, return true (Next.js will handle it)
    return true;
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">نمای کلی</h2>
        {hasAnyData && (
          <div className="flex items-center gap-4 text-sm text-white/60">
            {hasTickets && (
              <div className="flex items-center gap-2">
                <span className="text-[#F84920]">🎫</span>
                <span>{tickets.length} بلیط</span>
              </div>
            )}
            {hasOrders && (
              <div className="flex items-center gap-2">
                <span className="text-[#F84920]">🧾</span>
                <span>{orders.length} سفارش</span>
              </div>
            )}
          </div>
        )}
      </div>

      {!hasAnyData ? (
        // Empty state message when there are no tickets or orders
        <div className="text-center py-16 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/20">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-7xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              هنوز فعالیتی نداشته‌اید
            </h3>
            <p className="text-white/70 text-lg leading-relaxed">
              از رویدادهای ما با خبر شوید و در رویدادهای جذاب ما شرکت کنید
            </p>
            <Link
              href="/"
              className="inline-block mt-6 bg-[#F84920] text-white px-8 py-3 rounded-lg hover:bg-[#e63e1a] transition-all transform hover:scale-105 font-medium text-lg shadow-lg shadow-[#F84920]/30"
            >
              مشاهده رویدادها
            </Link>
            <div className="pt-4 border-t border-white/10">
              <p className="text-white/50 text-sm">
                با ثبت‌نام در رویدادها، بلیط‌ها و سفارش‌های شما اینجا نمایش داده
                می‌شوند
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tickets Section */}
          {hasTickets && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-[#F84920]">🎫</span>
                  بلیط‌های من
                </h3>
                <span className="text-sm text-white/60">
                  {tickets.filter((t) => t.status === "active").length} بلیط
                  فعال
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-bold text-white line-clamp-1">
                        {ticket.eventTitle}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 mr-2 ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-white/60 mb-4">
                      <p className="flex items-center gap-2">
                        <span>📅</span>
                        <span>
                          {new Date(ticket.eventDate).toLocaleDateString(
                            "fa-IR"
                          )}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span>🎫</span>
                        <span className="font-mono text-xs">
                          کد: {ticket.id}
                        </span>
                      </p>
                    </div>

                    {ticket.status === "active" && (
                      <div className="flex gap-2 mt-4">
                        <button className="flex-1 bg-[#F84920] text-white py-2 px-3 rounded-lg hover:bg-[#e63e1a] transition-colors text-xs font-medium">
                          نمایش QR
                        </button>
                        <button className="px-3 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors text-xs">
                          دانلود
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Section */}
          {hasOrders && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-[#F84920]">🧾</span>
                  سفارش‌های من
                </h3>
                <span className="text-sm text-white/60">
                  {
                    orders.filter(
                      (o) =>
                        o.status?.toUpperCase() === "CONFIRMED" ||
                        o.status?.toUpperCase() === "PAID"
                    ).length
                  }{" "}
                  سفارش تایید شده
                </span>
              </div>
              <div className="space-y-4">
                {orders.map((order) => {
                  const event = order.event;
                  const eventTitle = event?.title || `سفارش #${order.id}`;
                  const eventDescription = event?.description;
                  const eventStartDate = event?.startDate;
                  const eventImage = event?.image;

                  // Check if image exists and is valid
                  const hasImageData =
                    eventImage &&
                    typeof eventImage === "string" &&
                    eventImage.trim() !== "";

                  // Check if there was a previous error loading the image
                  const hasError = imageErrors.has(order.id);

                  // Validate URL
                  const isValidUrl = hasImageData
                    ? isValidImageUrl(eventImage)
                    : false;

                  // Display image if all conditions are met
                  // Only check for previous error - if image loaded before and failed, don't retry
                  const hasValidImage = hasImageData && isValidUrl && !hasError;

                  // Debug: log image information
                  if (hasImageData) {
                    console.log("🖼️ Order image check", order.id, {
                      imageUrl: eventImage,
                      hasImageData,
                      isValidUrl,
                      hasError,
                      willDisplay: hasValidImage,
                    });
                  }

                  return (
                    <Link
                      href={event?.id ? `/events/${event.id}` : "#"}
                      key={String(order.id)}
                      className="group block"
                    >
                      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col md:flex-row">
                        {/* Image - top on mobile, right side on desktop for RTL */}
                        <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-full md:min-h-[12rem] flex-shrink-0 overflow-hidden">
                          {hasValidImage ? (
                            <Image
                              src={eventImage!}
                              alt={eventTitle}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={() => {
                                console.error(
                                  "Image load error for order:",
                                  order.id,
                                  "Image URL:",
                                  eventImage
                                );
                                handleImageError(order.id);
                              }}
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 224px, 336px"
                              unoptimized
                              priority={false}
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
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-black/60 via-transparent to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 text-right flex-1">
                              {eventTitle}
                            </h4>
                            {/* Show badge only if status exists and is not pending */}
                            {order.status &&
                              order.status.toUpperCase() !== "PENDING" && (
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 mr-3 ${getOrderStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              )}
                          </div>

                          {eventDescription && (
                            <p className="text-gray-400 text-sm mb-4 text-right line-clamp-2 overflow-hidden text-ellipsis">
                              {eventDescription}
                            </p>
                          )}

                          <div className="space-y-2 mb-4">
                            {eventStartDate && (
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
                                <span className="text-right">
                                  {eventStartDate}
                                </span>
                              </div>
                            )}

                            {/* Display price - use totalAmount, ticketPrice * quantity, or ticket.price */}
                            {(() => {
                              const price =
                                order.totalAmount ??
                                (order.ticketPrice && order.quantity
                                  ? order.ticketPrice * order.quantity
                                  : null) ??
                                order.ticketPrice ??
                                order.ticket?.price;

                              return price != null ? (
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
                                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span className="text-right">
                                    {price.toLocaleString("fa-IR")} ریال
                                  </span>
                                </div>
                              ) : null;
                            })()}
                          </div>

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
                  );
                })}
              </div>
            </div>
          )}

          {/* Invitation to explore more events */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="text-center bg-gradient-to-br from-[#F84920]/10 to-purple-500/10 rounded-xl p-6 border border-[#F84920]/20">
              <p className="text-white/80 mb-3">رویدادهای بیشتری کشف کنید</p>
              <Link
                href="/"
                className="inline-block bg-[#F84920] text-white px-6 py-2 rounded-lg hover:bg-[#e63e1a] transition-colors font-medium"
              >
                مشاهده همه رویدادها
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
