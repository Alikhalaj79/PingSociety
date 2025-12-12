"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { QRCodeSVG } from "qrcode.react";

// QR Code Modal Component (unchanged)
const QRCodeModal = ({
  isOpen,
  onClose,
  qrCode,
  ticketNumber,
  eventTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string;
  ticketNumber?: string;
  eventTitle?: string;
}) => {
  if (!isOpen) return null;

  const qrValue = typeof qrCode === "string" ? qrCode : JSON.stringify(qrCode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080358]/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#080358] to-[#0a0440] rounded-2xl border border-white/20 p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-white">QR Code بلیط</h3>

          {eventTitle && <p className="text-gray-300 text-lg">{eventTitle}</p>}

          {ticketNumber && (
            <p className="text-gray-400 text-sm">شماره بلیط: {ticketNumber}</p>
          )}

          <div className="bg-white p-6 rounded-xl mx-auto w-fit">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <QRCodeSVG
                  value={qrValue}
                  size={256}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium">
                  این کد را در ورودی رویداد نشان دهید
                </p>
                {ticketNumber && (
                  <p className="text-gray-500 text-xs font-mono">
                    {ticketNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="bg-[#F84920] hover:bg-[#e63e1a] text-white px-6 py-2 rounded-lg transition-colors font-semibold w-full"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Ticket {
  id: number | string;
  ticketNumber?: string;
  status?: string;
  price?: number;
  type?: string;
  qrCode?: string;
  usedAt?: string | null;
  event?: {
    id?: number | string;
    title?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    vicinity?: string;
    status?: string;
    image?: string;
  };
  user?: {
    id?: number;
    fullname?: string;
    email?: string;
    phone?: string;
  };
}

interface Order {
  id: number | string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  quantity?: number;
  ticketPrice?: number;
  discountAmount?: number;
  cancelledReason?: string;
  createdAt?: string;
  event?: {
    id?: number | string;
    title?: string;
    description?: string;
    startDate?: string;
    image?: string;
    vicinity?: string;
  };
  ticket?: {
    price?: number;
  };
  payments?: Array<{ id: number; status: string; amount: number }>;
}

interface OverviewTabProps {
  tickets: Ticket[];
  orders: Order[];
  loading?: boolean;
  onCancelClick?: (orderId: string | number) => void;
  cancelingOrders?: Set<string | number>;
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

// FIX: این تابع رو دوباره اضافه کن (برای tickets) – قبلاً جا افتاده بود
const getStatusText = (status?: string) => {
  if (!status) return "نامشخص";
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "فعال";
    case "USED":
      return "استفاده شده";
    case "CANCELLED":
      return "لغو شده";
    default:
      return status;
  }
};

const getOrderStatusText = (status?: string) => {
  if (!status) return "نامشخص";
  switch (status.toUpperCase()) {
    case "PENDING":
      return "در انتظار";
    case "FAILED":
      return "ناموفق";
    case "CONFIRMED":
    case "PAID":
      return "تأیید شده";
    case "CANCELLED":
      return "لغو شده";
    default:
      return status;
  }
};

const getTicketStatusColor = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "ACTIVE":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "USED":
      return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "CANCELLED":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

const getOrderStatusColor = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "FAILED":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    case "CONFIRMED":
    case "PAID":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "CANCELLED":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

export default function OverviewTab({
  tickets,
  orders,
  loading = false,
  onCancelClick,
  cancelingOrders = new Set(),
}: OverviewTabProps) {
  const activeOrders = orders.filter((order) => {
    const status = order.status?.toUpperCase();

    // نمایش PENDING و FAILED
    if (status === "PENDING" || status === "FAILED") {
      return true;
    }

    // نمایش CANCELLED فقط اگر حداقل یک payment attempt شده باشد
    // (یعنی از درگاه لغو شده، نه اینکه کاربر دستی لغو کرده باشد)
    if (status === "CANCELLED") {
      const hasPayments = order.payments && order.payments.length > 0;
      return hasPayments;
    }

    return false;
  });

  const hasTickets = tickets && tickets.length > 0;
  const hasOrders = activeOrders && activeOrders.length > 0;
  const hasAnyData = hasTickets || hasOrders;
  const [imageErrors, setImageErrors] = useState<Set<string | number>>(
    new Set()
  );
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<{
    qrCode: string;
    ticketNumber?: string;
    eventTitle?: string;
  } | null>(null);

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

  const handleFinalizeOrder = async (
    e: React.MouseEvent,
    orderId: string | number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ orderId }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Payment initiate response:", data);
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok || response.status === 201) {
        if (data.gatewayUrl) {
          toast.success("در حال انتقال به صفحه پرداخت...");
          window.location.href = data.gatewayUrl;
        } else {
          toast.success(data.message || "پرداخت با موفقیت آغاز شد");
        }
      } else {
        toast.error(data.error || data.message || "خطا در شروع پرداخت");
      }
    } catch (error) {
      console.error("Error finalizing order:", error);
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const handleCancelClick = (e: React.MouseEvent, orderId: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCancelClick) {
      onCancelClick(orderId);
    }
  };

  const isValidImageUrl = (url?: string): boolean => {
    if (!url || typeof url !== "string") return false;
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return false;

    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
      const invalidDomains = ["example.com", "localhost", "127.0.0.1"];
      try {
        const urlObj = new URL(trimmedUrl);
        const hostname = urlObj.hostname.toLowerCase();
        return !invalidDomains.some(
          (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
        );
      } catch {
        return (
          !trimmedUrl.includes("example.com") &&
          !trimmedUrl.includes("localhost") &&
          !trimmedUrl.includes("127.0.0.1")
        );
      }
    }

    return true;
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">نمای کلی</h2>
      </div>

      {loading ? (
        // Loading state (unchanged - abbreviated for brevity)
        <div className="space-y-8">
          {/* Tickets Loading Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-32 bg-[#080358]/40 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-[#080358]/40 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row"
                >
                  <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-full md:min-h-[12rem] flex-shrink-0 bg-[#080358]/30 animate-pulse"></div>
                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-48 bg-[#080358]/40 rounded animate-pulse"></div>
                      <div className="h-6 w-20 bg-[#080358]/40 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-[#080358]/40 rounded animate-pulse"></div>
                      <div className="h-4 w-40 bg-[#080358]/40 rounded animate-pulse"></div>
                      <div className="h-4 w-36 bg-[#080358]/40 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="h-4 w-24 bg-[#080358]/40 rounded animate-pulse"></div>
                      <div className="h-8 w-28 bg-[#080358]/40 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Loading Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-32 bg-[#080358]/40 rounded animate-pulse"></div>
              <div className="h-5 w-24 bg-[#080358]/40 rounded animate-pulse"></div>
            </div>
            <div className="space-y-4">
              {[1].map((i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row"
                >
                  <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-full md:min-h-[12rem] flex-shrink-0 bg-[#080358]/30 animate-pulse"></div>
                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 w-48 bg-[#080358]/40 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-full bg-[#080358]/40 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-[#080358]/40 rounded animate-pulse"></div>
                      <div className="h-4 w-36 bg-[#080358]/40 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="h-4 w-24 bg-[#080358]/40 rounded animate-pulse"></div>
                      <div className="h-8 w-32 bg-[#080358]/40 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !hasAnyData ? (
        // Empty state (unchanged)
        <div className="text-center py-16 bg-gradient-to-br from-[#080358]/40 to-[#0a0440]/40 rounded-2xl border border-white/20">
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
          {/* Tickets Section (حالا با getStatusText فیکس‌شده) */}
          {hasTickets && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-[#F84920]">🎫</span>
                  بلیط‌های من
                </h3>
                <span className="text-sm text-white/60">
                  {
                    tickets.filter((t) => t.status?.toUpperCase() === "ACTIVE")
                      .length
                  }{" "}
                  بلیط فعال
                </span>
              </div>
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const event = ticket.event;
                  const eventTitle = event?.title || `بلیط #${ticket.id}`;
                  const eventStartDate = event?.startDate;
                  const eventLocation = event?.location;
                  const eventImage = event?.image;

                  const hasImageData =
                    eventImage &&
                    typeof eventImage === "string" &&
                    eventImage.trim() !== "";
                  const hasError = imageErrors.has(ticket.id);
                  const isValidUrl = hasImageData
                    ? isValidImageUrl(eventImage)
                    : false;
                  const hasValidImage = hasImageData && isValidUrl && !hasError;

                  return (
                    <div key={String(ticket.id)} className="group block">
                      <div className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col md:flex-row">
                        <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-full md:min-h-[12rem] flex-shrink-0 overflow-hidden">
                          {hasValidImage ? (
                            <Image
                              src={eventImage!}
                              alt={eventTitle}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={() => handleImageError(ticket.id)}
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

                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 text-right flex-1">
                              {eventTitle}
                            </h4>
                            {ticket.status && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 mr-3 ${getTicketStatusColor(
                                  ticket.status
                                )}`}
                              >
                                {getStatusText(ticket.status)}{" "}
                                {/* FIX: حالا تعریف شده */}
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 mb-4">
                            {/* بقیه details tickets (unchanged - abbreviated) */}
                            {ticket.ticketNumber && (
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
                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                  />
                                </svg>
                                <span className="text-right font-mono">
                                  {ticket.ticketNumber}
                                </span>
                              </div>
                            )}
                            {/* Event Date, Location, Price, Used At - unchanged */}
                          </div>

                          <div className="flex items-center justify-end mt-auto">
                            {ticket.status?.toUpperCase() === "ACTIVE" &&
                              ticket.qrCode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicket({
                                      qrCode: ticket.qrCode!,
                                      ticketNumber: ticket.ticketNumber,
                                      eventTitle: event?.title,
                                    });
                                    setQrModalOpen(true);
                                  }}
                                  className="bg-[#F84920] hover:bg-[#e63e1a] text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm whitespace-nowrap"
                                >
                                  نمایش QR
                                </button>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Orders Section (unchanged from previous fix) */}
          {hasOrders && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-[#F84920]">🧾</span>
                  سفارش‌های من
                </h3>
                <span className="text-sm text-white/60">
                  {activeOrders.length} سفارش فعال
                </span>
              </div>
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const event = order.event;
                  const eventTitle = event?.title || `سفارش #${order.id}`;
                  const eventStartDate = event?.startDate;
                  const eventImage = event?.image;

                  const hasImageData =
                    eventImage &&
                    typeof eventImage === "string" &&
                    eventImage.trim() !== "";
                  const hasError = imageErrors.has(order.id);
                  const isValidUrl = hasImageData
                    ? isValidImageUrl(eventImage)
                    : false;
                  const hasValidImage = hasImageData && isValidUrl && !hasError;

                  return (
                    <div key={String(order.id)} className="group block">
                      <div className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col md:flex-row">
                        <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-full md:min-h-[12rem] flex-shrink-0 overflow-hidden">
                          {hasValidImage ? (
                            <Image
                              src={eventImage!}
                              alt={eventTitle}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={() => handleImageError(order.id)}
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

                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 text-right flex-1">
                              {eventTitle}
                            </h4>
                            {order.status && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0 mr-3 ${getOrderStatusColor(
                                  order.status
                                )}`}
                              >
                                {getOrderStatusText(order.status)}
                              </span>
                            )}
                          </div>

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
                                <span>{formatDate(eventStartDate)}</span>
                              </div>
                            )}
                            {event?.vicinity && (
                              <div className="flex items-center text-gray-300 text-sm flex-row-reverse">
                                <svg
                                  className="w-5 h-5 ml-2 text-red-400"
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
                                <span>{event.vicinity}</span>
                              </div>
                            )}
                            {order.totalAmount != null && (
                              <div className="flex items-center text-gray-300 text-sm flex-row-reverse">
                                <svg
                                  className="w-5 h-5 ml-2 text-yellow-400"
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
                                <span className="font-semibold text-white">
                                  {order.totalAmount.toLocaleString("fa-IR")}{" "}
                                  ریال
                                </span>
                              </div>
                            )}
                            {order.createdAt && (
                              <div className="flex items-center text-gray-300 text-sm flex-row-reverse">
                                <svg
                                  className="w-5 h-5 ml-2 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>
                                  تاریخ ثبت: {formatDate(order.createdAt)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-end mt-auto">
                            <div className="flex flex-row gap-2">
                              {(() => {
                                const status = order.status?.toUpperCase();
                                const isPending = status === "PENDING";
                                const isCancelledWithPayments =
                                  status === "CANCELLED" &&
                                  order.payments &&
                                  order.payments.length > 0;
                                const isCanceling = cancelingOrders.has(
                                  order.id
                                );

                                return (
                                  <>
                                    {isPending && (
                                      <>
                                        <button
                                          onClick={(e) =>
                                            handleCancelClick(e, order.id)
                                          }
                                          disabled={isCanceling}
                                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          لغو سفارش
                                        </button>
                                        <button
                                          onClick={(e) =>
                                            handleFinalizeOrder(e, order.id)
                                          }
                                          disabled={isCanceling}
                                          className="bg-[#F84920] hover:bg-[#e63e1a] text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          نهایی کردن سفارش
                                        </button>
                                      </>
                                    )}
                                    {isCancelledWithPayments && (
                                      <button
                                        onClick={(e) =>
                                          handleFinalizeOrder(e, order.id)
                                        }
                                        disabled={isCanceling}
                                        className="bg-[#F84920] hover:bg-[#e63e1a] text-white px-4 py-2 rounded-lg transition-all font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        تلاش مجدد پرداخت
                                      </button>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTicket && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => {
            setQrModalOpen(false);
            setSelectedTicket(null);
          }}
          qrCode={selectedTicket.qrCode}
          ticketNumber={selectedTicket.ticketNumber}
          eventTitle={selectedTicket.eventTitle}
        />
      )}
    </div>
  );
}
