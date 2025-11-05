"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Footer from "@/components/homePage/Footer";
import EditProfileModal from "@/components/EditProfileModal";
import OrderCardModal from "@/components/OrderCardModal";
import toast from "react-hot-toast";

interface Ticket {
  id?: string | number;
  price?: number;
  isAvailable?: boolean;
}

interface Sponsor {
  id?: string | number;
  name?: string;
  logo?: string;
  website?: string;
}

interface Moderator {
  id?: string | number;
  name?: string;
  fullname?: string;
  bio?: string;
  image?: string;
}

interface Event {
  id: string | number;
  title: string;
  description?: string;
  startDate?: string;
  location?: string;
  image?: string;
  tickets?: Ticket[];
  sponsors?: Sponsor[];
  moderators?: Moderator[];
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isOrderCardOpen, setIsOrderCardOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const createOrder = useCallback(async () => {
    if (!eventId) return false;
    try {
      const ticketId =
        event?.tickets && event.tickets[0] ? event.tickets[0].id : undefined;
      type OrderResponse = {
        success?: boolean;
        status?: string;
        message?: string;
        error?: string;
        order?: any;
      };
      const res = await fetch(`/api/order/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ eventId, ticketId }),
        credentials: "include",
      });
      let payload: OrderResponse | undefined;
      try {
        payload = (await res.json()) as OrderResponse;
      } catch {
        payload = undefined;
      }
      
      if (res.ok) {
        toast.success("سفارش با موفقیت ایجاد شد");
        setCurrentOrder(payload?.order || payload);
        setIsOrderCardOpen(true);
        return true;
      } else {
        // Handle profile incomplete case (422)
        if (res.status === 422 && payload?.error === "Profile Incomplete") {
          // Fetch user data for profile modal
          try {
            const userRes = await fetch("/api/user/me", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              if (userData.user) {
                setCurrentUser(userData.user);
                setIsEditProfileOpen(true);
                return false;
              }
            }
          } catch {
            // Fallback
          }
          setIsEditProfileOpen(true);
          return false;
        } else {
          const errMsg =
            payload?.error || payload?.message || "ایجاد سفارش ناموفق بود";
          toast.error(errMsg);
          return false;
        }
      }
    } catch {
      toast.error("خطا در ایجاد سفارش");
      return false;
    }
  }, [eventId, event]);

  const handleRegister = useCallback(async () => {
    if (!eventId) return;
    try {
      setOrderLoading(true);
      
      // Check authentication first
      const authRes = await fetch("/api/auth/check-auth", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      const authData = await authRes.json();
      
      if (!authRes.ok || !authData.isAuthenticated) {
        // User is not logged in
        toast.error("ابتدا وارد حساب کاربری شوید");
        const returnTo = encodeURIComponent(`/events/${eventId}`);
        window.location.href = `/register?returnTo=${returnTo}`;
        return;
      }
      
      // User is authenticated, create order
      await createOrder();
    } catch (error) {
      console.error("Error in handleRegister:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setOrderLoading(false);
    }
  }, [eventId, createOrder]);

  const handleProfileSaveSuccess = useCallback(async () => {
    setIsEditProfileOpen(false);
    // Retry creating order after profile is saved
    setOrderLoading(true);
    try {
      await createOrder();
    } catch (error) {
      console.error("Error retrying order creation:", error);
      toast.error("خطا در ایجاد سفارش");
    } finally {
      setOrderLoading(false);
    }
  }, [createOrder]);

  const fetchEventDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use Next.js API proxy to avoid CORS issues
      const res = await fetch(`/api/event/${eventId}`, {
        method: "GET",
        cache: "no-store",
      });

      const json = await res.json();

      if (res.ok && json?.success && json?.event) {
        setEvent(json.event);
      } else {
        const errorMsg = json?.error || json?.message || "رویداد یافت نشد";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
      const errorMessage = "خطا در ارتباط با سرور";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEventDetail();
    }
  }, [eventId, fetchEventDetail]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}/${month}/${day}`;
    } catch {
      return dateString;
    }
  };

  const isValidImageUrl = (url?: string): boolean => {
    if (!url) return false;
    const invalidDomains = ["example.com", "localhost", "127.0.0.1"];
    try {
      const urlObj = new URL(url);
      return !invalidDomains.some((domain) => urlObj.hostname.includes(domain));
    } catch {
      return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="py-20">
          <Container>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-800 rounded w-1/3 mb-6"></div>
              <div className="h-64 bg-gray-800 rounded mb-6"></div>
              <div className="h-6 bg-gray-800 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-800 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="py-20">
          <Container>
            <div className="text-center">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-8 max-w-md mx-auto">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-bold mb-4 text-red-300">
                  {error || "رویداد یافت نشد"}
                </h2>
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-[#f84920] hover:bg-[#e63e1a] text-white rounded-lg transition-colors font-semibold"
                >
                  بازگشت به صفحه اصلی
                </button>
              </div>
            </div>
          </Container>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero Section with Image */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {/* Background Image */}
        {event.image && isValidImageUrl(event.image) && !imageError ? (
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20"></div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

        {/* Content (hero overlay title removed as requested) */}
        <div className="relative h-full flex flex-col justify-end pb-12"></div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-black to-[#0c0c22]">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title, Description and Moderators Section */}
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-right bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  {event.title}
                </h1>

                {/* Description */}
                {event.description && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-right">
                      درباره رویداد
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-line text-right">
                      {event.description}
                    </p>
                  </div>
                )}

                {/* Moderators - Only show if moderators exist and have items */}
                {event.moderators &&
                  Array.isArray(event.moderators) &&
                  event.moderators.length > 0 && (
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-right">
                        تسهیل‌گران
                      </h2>
                      <div className="flex flex-wrap gap-3 justify-end text-right">
                        {event.moderators.map((moderator, index, arr) => (
                          <span
                            key={moderator.id || index}
                            className="text-white text-base font-medium"
                          >
                            {moderator.fullname || moderator.name}
                            {index < arr.length - 1 && (
                              <span className="text-gray-500 mx-2">•</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Sponsors */}
              {event.sponsors && event.sponsors.length > 0 && (
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                  <h2 className="text-xl sm:text-2xl font-bold mb-4 text-right">
                    اسپانسرها
                  </h2>
                  <div className="flex flex-wrap gap-3 justify-end text-right">
                    {event.sponsors.map((sponsor, index, arr) => (
                      <span
                        key={sponsor.id || index}
                        className="text-white text-base font-medium"
                      >
                        {sponsor.name}
                        {index < arr.length - 1 && (
                          <span className="text-gray-500 mx-2">•</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Right Side */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Event Info Card */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-6 text-right">
                    اطلاعات رویداد
                  </h3>

                  <div className="space-y-4">
                    {/* Date */}
                    {event.startDate && (
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <svg
                          className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1"
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
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">تاریخ برگزاری</p>
                          <p className="text-white font-semibold">
                            {formatDate(event.startDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <svg
                          className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1"
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
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">مکان</p>
                          <p className="text-white font-semibold">
                            {event.location}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    {event.tickets &&
                      event.tickets.length > 0 &&
                      event.tickets[0]?.price !== undefined &&
                      event.tickets[0]?.price !== null && (
                        <div className="flex items-start gap-3 flex-row-reverse">
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">هزینه</p>
                            <p className="text-white font-semibold">
                              {event.tickets[0].price === 0
                                ? "رایگان"
                                : `${event.tickets[0].price.toLocaleString(
                                    "fa-IR"
                                  )} ریال`}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Capacity Full Message */}
                    {event.tickets &&
                      event.tickets.length > 0 &&
                      event.tickets[0]?.isAvailable === false && (
                        <div className="flex items-start gap-3 flex-row-reverse pt-4 border-t border-white/10">
                          <div className="text-right">
                            <p className="text-red-400 text-sm font-semibold">
                              ظرفیت پر شده
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Register Button */}
                {event.tickets &&
                event.tickets.length > 0 &&
                event.tickets[0]?.isAvailable === false ? (
                  <button
                    disabled
                    className="w-full bg-gray-600 text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed"
                  >
                    ثبت نام در رویداد
                  </button>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={orderLoading}
                    className="w-full bg-[#f84920] hover:bg-[#e63e1a] text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#f84920]/20 disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {orderLoading ? "در حال ثبت..." : "ثبت نام در رویداد"}
                  </button>
                )}

                {/* Back Button */}
                <button
                  onClick={() => router.back()}
                  className="w-full border border-white/20 hover:border-white/40 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  بازگشت
                </button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />

      {/* Edit Profile Modal */}
      {currentUser && (
        <EditProfileModal
          user={currentUser}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={handleProfileSaveSuccess}
        />
      )}

      {/* Order Card Modal */}
      <OrderCardModal
        order={currentOrder}
        isOpen={isOrderCardOpen}
        onClose={() => setIsOrderCardOpen(false)}
      />
    </div>
  );
}
