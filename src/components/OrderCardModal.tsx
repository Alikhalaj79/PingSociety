"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ModalPortal from "@/components/ModalPortal";
import toast from "react-hot-toast";

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
  payments?: Array<{ id: number; status: string; amount: number }>;
}

interface OrderCardModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderCardModal({
  order,
  isOpen,
  onClose,
}: OrderCardModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      document.body.style.overflow = "hidden";
    } else {
      setShowModal(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!order || !isOpen) return null;

  // Debug: Log order status
  console.log("Order status:", order.status, "Order ID:", order.id);

  const event = order.event;
  const eventTitle = event?.title || `سفارش #${order.id}`;
  const eventDescription = event?.description;
  const eventStartDate = event?.startDate;
  const eventImage = event?.image;

  // Calculate price
  const price =
    order.totalAmount ??
    (order.ticketPrice && order.quantity
      ? order.ticketPrice * order.quantity
      : null) ??
    order.ticketPrice ??
    order.ticket?.price ??
    0;

  // Check if image exists and is valid
  const hasImageData =
    eventImage && typeof eventImage === "string" && eventImage.trim() !== "";

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

  const hasValidImage =
    hasImageData && isValidImageUrl(eventImage) && !imageError;

  const handleFinalizeOrder = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("Payment initiate response:", data);

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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    if (!order?.id) return;

    setShowCancelConfirm(false);
    try {
      setIsCanceling(true);
      const response = await fetch(`/api/order/${order.id}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();
      console.log("Cancel order response:", data);

      if (response.ok || response.status === 200) {
        toast.success(data.message || "سفارش با موفقیت لغو شد");
        closeModal();
        // Reload the page or refresh orders list
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        toast.error(data.error || data.message || "خطا در لغو سفارش");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleCancelCancel = () => {
    setShowCancelConfirm(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
      document.body.style.overflow = "";
    }, 200);
  };

  return (
    <ModalPortal>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
          showModal ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={closeModal}
        ></div>
        <div
          className={`relative z-10 w-full max-w-2xl p-0 overflow-hidden transition-all duration-200 ${
            showModal ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-card-title"
        >
          <div className="p-[1px] rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
            <div className="rounded-2xl bg-[#080358] text-white border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080358]/95">
                <h4 id="order-card-title" className="text-xl font-bold">
                  سفارش شما
                </h4>
                <button
                  onClick={closeModal}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                  aria-label="بستن"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="relative w-full md:w-48 lg:w-56 h-48 md:h-full md:min-h-[12rem] flex-shrink-0 overflow-hidden">
                    {hasValidImage ? (
                      <Image
                        src={eventImage!}
                        alt={eventTitle}
                        fill
                        className="object-cover"
                        onError={() => {
                          setImageError(true);
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
                      <h4 className="text-xl sm:text-2xl font-bold text-white line-clamp-2 text-right flex-1">
                        {eventTitle}
                      </h4>
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
                          <span className="text-right font-vazirmatn">
                            {eventStartDate}
                          </span>
                        </div>
                      )}

                      {price > 0 && (
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
                          <span className="text-right font-vazirmatn">
                            {price.toLocaleString("fa-IR")} ریال
                          </span>
                        </div>
                      )}

                      {order.orderNumber && (
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
                            شماره سفارش: {order.orderNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end mt-auto pt-4 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        {(() => {
                          const status = order.status?.toUpperCase();
                          const hasPayments =
                            order.payments && order.payments.length > 0;
                          const isPending = status === "PENDING";
                          const isFailed = status === "FAILED";
                          const isCancelledWithPayments =
                            status === "CANCELLED" && hasPayments;

                          const canCancel =
                            isPending || (!status && !hasPayments);

                          const canRetryPayment =
                            isPending || isFailed || isCancelledWithPayments;

                          return (
                            <>
                              {canCancel && (
                                <button
                                  onClick={handleCancelClick}
                                  disabled={isCanceling || isProcessing}
                                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-all font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  لغو سفارش
                                </button>
                              )}
                              {canRetryPayment && (
                                <button
                                  onClick={handleFinalizeOrder}
                                  disabled={isProcessing || isCanceling}
                                  className="bg-[#F84920] hover:bg-[#e63e1a] text-white px-6 py-3 rounded-lg transition-all font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isProcessing
                                    ? "در حال پردازش..."
                                    : isPending
                                    ? "نهایی کردن سفارش"
                                    : "تلاش مجدد پرداخت"}
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
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div
            className="bg-gradient-to-br from-[#080358] to-[#0a0440] rounded-2xl border border-white/20 p-6 max-w-md w-full relative"
            dir="rtl"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              تأیید لغو سفارش
            </h3>
            <p className="text-white/80 mb-6">
              آیا مطمئن هستید که می‌خواهید این سفارش را لغو کنید؟
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleCancelCancel}
                disabled={isCanceling}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                انصراف
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={isCanceling}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceling ? "در حال لغو..." : "بله، لغو کن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalPortal>
  );
}
