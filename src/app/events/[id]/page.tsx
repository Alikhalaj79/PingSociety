"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Footer from "@/components/homePage/Footer";
import EditProfileModal from "@/components/EditProfileModal";
import OrderCardModal from "@/components/OrderCardModal";
import toast from "react-hot-toast";
import { useOrdersRTK } from "@/hooks/useOrdersRTK";
import { useAppSelector } from "@/store/hooks";
import { unwrapResult } from "@reduxjs/toolkit";

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

interface User {
  id: number;
  phone: string;
  fullname?: string;
  email?: string;
  company?: string;
  fieldOfActivity?: string;
  source?: string;
  role: string;
  created_at: string;
  updated_at: string;
  moderatedEvents: unknown[];
  tickets: unknown[];
  orders: unknown[];
  payments: unknown[];
  sponsor?: unknown;
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
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasCheckedEventStatus, setHasCheckedEventStatus] = useState(false);
  // Local state to track if user has purchased - resets immediately on user change
  const [localHasPurchased, setLocalHasPurchased] = useState(false);

  // RTK hooks
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const {
    checkEvent,
    getTicketForEvent,
    getPendingOrderForEvent,
    refreshOrders,
    refreshTickets,
    orders,
    tickets,
    isLoading: ordersLoading,
  } = useOrdersRTK();

  // Check if user has ticket or pending order for this event
  // Only check if we have a current user to avoid using stale data from previous user
  const ticket = eventId && user?.id ? getTicketForEvent(eventId) : null;
  // pendingOrder is used in useEffect hooks below
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pendingOrder =
    eventId && user?.id ? getPendingOrderForEvent(eventId) : null;

  // Update local hasPurchased state based on ticket and user
  // This ensures immediate update when user changes, before Redux store updates
  useEffect(() => {
    // Only update if we have a user (to avoid stale data from previous user)
    if (!user?.id) {
      setLocalHasPurchased(false);
      return;
    }

    // If we have a ticket for current user, set to true
    if (ticket) {
      setLocalHasPurchased(true);
    }
    // If no ticket and not loading, set to false
    else if (!ordersLoading) {
      setLocalHasPurchased(false);
    }
    // If loading, keep current state (don't change during loading)
  }, [user?.id, ticket, ordersLoading]);

  // Use local state for hasPurchased to avoid stale data during user transitions
  const hasPurchased = localHasPurchased;

  const createOrder = useCallback(async () => {
    if (!eventId) return false;
    try {
      const ticketId =
        event?.tickets && event.tickets[0] ? event.tickets[0].id : undefined;
      type OrderResponse = {
        success?: boolean;
        status?: string;
        statusCode?: number;
        message?: string | string[];
        error?: string;
        order?: unknown;
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
        const newOrder = (payload?.order || payload) as Order | null;
        setCurrentOrder(newOrder);
        setIsOrderCardOpen(true);
        // Refresh orders and tickets after creating order
        refreshOrders();
        refreshTickets();
        return true;
      } else {
        // Handle already purchased case (400)
        if (res.status === 400) {
          const message = payload?.message;
          const isAlreadyPurchased =
            (Array.isArray(message) &&
              message.some((msg: string) =>
                msg.toLowerCase().includes("already purchased")
              )) ||
            (typeof message === "string" &&
              message.toLowerCase().includes("already purchased")) ||
            (typeof payload?.error === "string" &&
              payload.error.toLowerCase().includes("already purchased"));

          if (isAlreadyPurchased) {
            toast("شما قبلا این ایونت رو تهیه کردید", {
              icon: "ℹ️",
              duration: 4000,
            });
            // Refresh orders and tickets to get the latest data
            refreshOrders();
            refreshTickets();
            // Check event status again to update UI
            if (eventId) {
              checkEvent(eventId).then((result) => {
                try {
                  const payload = unwrapResult(result);
                  // Update localHasPurchased based on checkEvent result
                  setLocalHasPurchased(!!payload.ticket);
                  if (payload.ticket) {
                    // User has ticket, button will be disabled automatically
                  } else if (payload.pendingOrder) {
                    // User has pending order, show modal
                    setCurrentOrder(payload.pendingOrder);
                    setIsOrderCardOpen(true);
                  }
                } catch (error) {
                  console.error("Error refreshing event status:", error);
                  setLocalHasPurchased(false);
                }
              });
            }
            return false;
          }
        }

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
          // Handle other errors
          const errMsg =
            (Array.isArray(payload?.message)
              ? payload.message.join(", ")
              : payload?.message) ||
            payload?.error ||
            "ایجاد سفارش ناموفق بود";
          toast.error(errMsg);
          return false;
        }
      }
    } catch {
      toast.error("خطا در ایجاد سفارش");
      return false;
    }
  }, [eventId, event, refreshOrders, refreshTickets, checkEvent]);

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

      // User is authenticated, check for existing pending order first
      // checkEvent will fetch the latest orders and tickets from the server
      try {
        const result = await checkEvent(eventId);
        const payload = unwrapResult(result);
        const { ticket, pendingOrder } = payload;

        // If user already has a ticket, show message and don't proceed
        if (ticket) {
          toast("شما قبلا این ایونت رو تهیه کردید", {
            icon: "ℹ️",
            duration: 4000,
          });
          setLocalHasPurchased(true);
          return;
        }

        // If there's a pending order, show it instead of creating a new one
        if (pendingOrder) {
          setCurrentOrder(pendingOrder);
          setIsOrderCardOpen(true);
          return;
        }
      } catch (error) {
        console.error("Error checking event status:", error);
        // If check fails, proceed with creating order
      }

      // No pending order found, create new order
      await createOrder();
    } catch (error) {
      console.error("Error in handleRegister:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setOrderLoading(false);
    }
  }, [eventId, createOrder, checkEvent]);

  const handleProfileSaveSuccess = useCallback(async () => {
    setIsEditProfileOpen(false);
    // Retry creating order after profile is saved
    setOrderLoading(true);
    try {
      // Check for existing pending order first
      if (eventId) {
        try {
          const result = await checkEvent(eventId);
          const payload = unwrapResult(result);
          const { ticket, pendingOrder } = payload;

          // If user already has a ticket, show message and don't proceed
          if (ticket) {
            toast("شما قبلا این ایونت رو تهیه کردید", {
              icon: "ℹ️",
              duration: 4000,
            });
            setLocalHasPurchased(true);
            return;
          }

          // If there's a pending order, show it instead of creating a new one
          if (pendingOrder) {
            setCurrentOrder(pendingOrder);
            setIsOrderCardOpen(true);
            return;
          }
        } catch (error) {
          console.error("Error checking event status:", error);
          // If check fails, proceed with creating order
        }
      }

      // No pending order found, create new order
      await createOrder();
    } catch (error) {
      console.error("Error retrying order creation:", error);
      toast.error("خطا در ایجاد سفارش");
    } finally {
      setOrderLoading(false);
    }
  }, [createOrder, eventId, checkEvent]);

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

  // Track previous user ID to detect user changes
  const prevUserIdRef = useRef<string | undefined>(user?.id);
  // Track previous orders/tickets length to detect data changes
  const prevOrdersLengthRef = useRef(orders.length);
  const prevTicketsLengthRef = useRef(tickets.length);

  // Reset state and check event status when user changes
  useEffect(() => {
    const currentUserId = user?.id;
    const prevUserId = prevUserIdRef.current;

    // If user changed (different user logged in)
    if (currentUserId && prevUserId && currentUserId !== prevUserId) {
      setHasCheckedEventStatus(false);
      setIsOrderCardOpen(false);
      setCurrentOrder(null);
      // Immediately reset hasPurchased for new user
      setLocalHasPurchased(false);
      // Reset refs for new user
      prevOrdersLengthRef.current = 0;
      prevTicketsLengthRef.current = 0;
      // Refresh orders and tickets for new user
      refreshOrders();
      refreshTickets();
    }
    // If user logged in (was null, now has ID)
    else if (currentUserId && !prevUserId) {
      setHasCheckedEventStatus(false);
      // Reset hasPurchased for new user
      setLocalHasPurchased(false);
      // Reset refs for new user
      prevOrdersLengthRef.current = 0;
      prevTicketsLengthRef.current = 0;
    }
    // If user logged out (had ID, now null)
    else if (!currentUserId && prevUserId) {
      setHasCheckedEventStatus(false);
      setIsOrderCardOpen(false);
      setCurrentOrder(null);
      // Reset hasPurchased
      setLocalHasPurchased(false);
      // Reset refs
      prevOrdersLengthRef.current = 0;
      prevTicketsLengthRef.current = 0;
    }

    prevUserIdRef.current = currentUserId;
  }, [user?.id, refreshOrders, refreshTickets]);

  // Check event status when page loads and user is authenticated
  // Also re-check when orders/tickets are loaded (after login)
  useEffect(() => {
    if (eventId && isAuthenticated && user?.id && !hasCheckedEventStatus) {
      const checkStatus = async () => {
        try {
          const result = await checkEvent(eventId);
          const payload = unwrapResult(result);
          const { ticket, pendingOrder } = payload;

          // Update localHasPurchased based on checkEvent result
          setLocalHasPurchased(!!ticket);

          // If ticket exists, show toast and disable button
          if (ticket) {
            toast("شما قبلا این ایونت رو تهیه کردید", {
              icon: "ℹ️",
              duration: 4000,
            });
          }
          // If pending order exists, open modal
          else if (pendingOrder) {
            setCurrentOrder(pendingOrder);
            setIsOrderCardOpen(true);
          }
        } catch (error) {
          console.error("Error checking event status:", error);
          // On error, assume no purchase
          setLocalHasPurchased(false);
        } finally {
          setHasCheckedEventStatus(true);
        }
      };

      // Wait a bit for orders/tickets to be fetched after login
      const timeoutId = setTimeout(() => {
        checkStatus();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [eventId, isAuthenticated, user?.id, hasCheckedEventStatus, checkEvent]);

  // Re-check event status when orders/tickets change (e.g., after new user login)
  // This only runs if we already checked once and now have new data
  useEffect(() => {
    const ordersChanged = orders.length !== prevOrdersLengthRef.current;
    const ticketsChanged = tickets.length !== prevTicketsLengthRef.current;

    // Update refs
    prevOrdersLengthRef.current = orders.length;
    prevTicketsLengthRef.current = tickets.length;

    // Only re-check if:
    // 1. User is authenticated
    // 2. We already checked once (hasCheckedEventStatus is true)
    // 3. Orders or tickets actually increased (new data loaded, not cleared)
    // 4. We have some data (not empty)
    if (
      eventId &&
      isAuthenticated &&
      user?.id &&
      hasCheckedEventStatus &&
      (ordersChanged || ticketsChanged) &&
      (orders.length > 0 || tickets.length > 0)
    ) {
      const checkStatus = async () => {
        try {
          const result = await checkEvent(eventId);
          const payload = unwrapResult(result);
          const { ticket, pendingOrder } = payload;

          // Update localHasPurchased based on checkEvent result
          setLocalHasPurchased(!!ticket);

          // If ticket exists, show toast and disable button
          if (ticket) {
            toast("شما قبلا این ایونت رو تهیه کردید", {
              icon: "ℹ️",
              duration: 4000,
            });
          }
          // If pending order exists, open modal
          else if (pendingOrder) {
            setCurrentOrder(pendingOrder);
            setIsOrderCardOpen(true);
          }
        } catch (error) {
          console.error("Error re-checking event status:", error);
          // On error, assume no purchase
          setLocalHasPurchased(false);
        }
      };

      // Small delay to ensure data is fully loaded
      const timeoutId = setTimeout(() => {
        checkStatus();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [
    eventId,
    isAuthenticated,
    user?.id,
    orders.length,
    tickets.length,
    checkEvent,
    hasCheckedEventStatus,
  ]);

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
      <div className="min-h-screen bg-[#080358] text-white">
        <Header />
        
        {/* Hero Section Skeleton */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <div className="w-full h-full bg-[#080358]/40 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080358] via-[#080358]/50 to-transparent"></div>
        </section>

        {/* Main Content Skeleton */}
        <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#080358] to-[#0a0440]">
          <Container>
            <div className="grid lg:grid-cols-3 gap-8 animate-pulse">
              {/* Main Content - Left Side */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title, Description Section */}
                <div className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
                  {/* Title */}
                  <div className="h-10 bg-[#080358]/40 rounded w-3/4"></div>
                  
                  {/* Description Section */}
                  <div className="space-y-4">
                    <div className="h-6 bg-[#080358]/40 rounded w-1/3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-[#080358]/40 rounded w-full"></div>
                      <div className="h-4 bg-[#080358]/40 rounded w-full"></div>
                      <div className="h-4 bg-[#080358]/40 rounded w-5/6"></div>
                      <div className="h-4 bg-[#080358]/40 rounded w-4/5"></div>
                    </div>
                  </div>

                  {/* Moderators Section */}
                  <div className="space-y-4">
                    <div className="h-6 bg-[#080358]/40 rounded w-1/4"></div>
                    <div className="flex flex-wrap gap-3 justify-end">
                      <div className="h-8 bg-[#080358]/40 rounded-full w-24"></div>
                      <div className="h-8 bg-[#080358]/40 rounded-full w-32"></div>
                    </div>
                  </div>
                </div>

                {/* Sponsors Section */}
                <div className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
                  <div className="h-6 bg-[#080358]/40 rounded w-1/4 mb-4"></div>
                  <div className="flex flex-wrap gap-3 justify-end">
                    <div className="h-6 bg-[#080358]/40 rounded w-20"></div>
                    <div className="h-6 bg-[#080358]/40 rounded w-28"></div>
                    <div className="h-6 bg-[#080358]/40 rounded w-24"></div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Right Side */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Event Info Card */}
                  <div className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <div className="h-6 bg-[#080358]/40 rounded w-1/2 mb-6"></div>
                    
                    <div className="space-y-4">
                      {/* Date */}
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="w-6 h-6 bg-[#080358]/40 rounded flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-[#080358]/40 rounded w-20"></div>
                          <div className="h-5 bg-[#080358]/40 rounded w-32"></div>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="w-6 h-6 bg-[#080358]/40 rounded flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-[#080358]/40 rounded w-16"></div>
                          <div className="h-5 bg-[#080358]/40 rounded w-40"></div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-start gap-3 flex-row-reverse">
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-[#080358]/40 rounded w-16"></div>
                          <div className="h-5 bg-[#080358]/40 rounded w-24"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Register Button */}
                  <div className="h-14 bg-[#080358]/40 rounded-xl"></div>

                  {/* Back Button */}
                  <div className="h-12 bg-[#080358]/30 rounded-xl border border-white/10"></div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#080358] text-white">
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
    <div className="min-h-screen bg-[#080358] text-white">
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
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-[#080358] to-[#0a0440]">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title, Description and Moderators Section */}
              <div className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6">
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
                <div className="bg-gradient-to-br from-[#080358]/60 to-[#0a0440]/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
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
                            <p className="text-white font-semibold font-vazirmatn">
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
                ) : hasPurchased ? (
                  <button
                    disabled
                    className="w-full bg-gray-600 text-gray-400 font-bold py-4 px-6 rounded-xl cursor-not-allowed"
                  >
                    شما قبلا این ایونت رو تهیه کردید
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
