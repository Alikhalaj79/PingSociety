"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
  status?: string;
  location?: string;
  vicinity?: string;
  image?: string;
  eventType?: "physical" | "online";
  paymentType?: "free" | "paid";
  payment_type?: "free" | "paid";
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
  const searchParams = useSearchParams();
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
  const [hasAttemptedAutoRegister, setHasAttemptedAutoRegister] =
    useState(false);
  // Local state to track if user has purchased - resets immediately on user change
  const [localHasPurchased, setLocalHasPurchased] = useState(false);

  // RTK hooks
  const { isAuthenticated, user: reduxUser } = useAppSelector(
    (state) => state.auth
  );

  // Get full user data from API to check role
  const [fullUser, setFullUser] = useState<User | null>(null);

  // Use fullUser if available, otherwise create a basic user from reduxUser
  // This needs to be defined early so it can be used in other hooks
  const user =
    fullUser ||
    (reduxUser
      ? ({ id: Number(reduxUser.id), phone: reduxUser.phone, role: "" } as User)
      : null);

  // Fetch user data to check admin role
  useEffect(() => {
    if (isAuthenticated && reduxUser?.id) {
      fetch("/api/user/me", {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) {
            setFullUser(data.user);
          }
        })
        .catch(() => {
          // Ignore errors
        });
    } else {
      setFullUser(null);
    }
  }, [isAuthenticated, reduxUser?.id]);

  // Check if user is admin
  const isAdmin = user?.role === "admin" || user?.role === "Admin";

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

  const isEventCompleted = (event?.status || "").toLowerCase() === "completed";

  const createOrder = useCallback(async () => {
    if (!eventId) return false;
    try {
      const ticketId =
        event?.tickets && event.tickets[0] ? event.tickets[0].id : undefined;

      // Check if event is free
      const isFreeEvent =
        (event?.paymentType || event?.payment_type) === "free" ||
        (event?.tickets &&
          event.tickets.length > 0 &&
          event.tickets[0]?.price === 0);

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
        // Refresh orders and tickets after creating order
        refreshOrders();
        refreshTickets();

        // For free events, redirect to dashboard instead of showing modal
        if (isFreeEvent) {
          toast.success("ثبت نام شما موفق بود");
          // Wait a bit for tickets to be created on backend
          setTimeout(() => {
            router.push(`/dashboard?eventId=${eventId}`);
          }, 500);
          return true;
        }

        // For paid events, show order modal
        toast.success("سفارش با موفقیت ایجاد شد");
        const newOrder = (payload?.order || payload) as Order | null;
        setCurrentOrder(newOrder);
        setIsOrderCardOpen(true);
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

      // Check if event is free
      const isFreeEvent =
        (event?.paymentType || event?.payment_type) === "free" ||
        (event?.tickets &&
          event.tickets.length > 0 &&
          event.tickets[0]?.price === 0);

      // Check authentication first
      const authRes = await fetch("/api/auth/check-auth", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const authData = await authRes.json();

      if (!authRes.ok || !authData.isAuthenticated) {
        // User is not logged in
        // For free events, include a flag to auto-register after login
        const returnTo = isFreeEvent
          ? encodeURIComponent(`/events/${eventId}?autoRegister=true`)
          : encodeURIComponent(`/events/${eventId}`);
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

        // For free events, don't show pending order modal, just create order
        if (pendingOrder && !isFreeEvent) {
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
  }, [eventId, event, createOrder, checkEvent, router]);

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

  const fetchEventDetail = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Check if refresh parameter is in URL or force refresh
        const shouldRefresh =
          forceRefresh ||
          searchParams.get("refresh") === "true" ||
          searchParams.get("nocache") === "true";

        // Use Next.js API proxy to avoid CORS issues
        // Add timestamp to bypass browser cache when refreshing
        const url = shouldRefresh
          ? `/api/event/${eventId}?refresh=true&_t=${Date.now()}`
          : `/api/event/${eventId}`;

        const res = await fetch(url, {
          method: "GET",
          // Bypass cache if refresh parameter is present
          ...(shouldRefresh
            ? {
                cache: "no-store",
                headers: {
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                  Pragma: "no-cache",
                },
              }
            : {
                cache: "default",
              }),
        });

        const json = await res.json();

        if (res.ok && json?.success && json?.event) {
          setEvent(json.event);
          if (forceRefresh) {
            toast.success("داده‌ها به‌روزرسانی شد");
          }
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
    },
    [eventId, searchParams]
  );

  // Track previous user ID to detect user changes
  const prevUserIdRef = useRef<number | undefined>(undefined);

  // Initialize with current user ID
  if (user?.id !== undefined && prevUserIdRef.current === undefined) {
    prevUserIdRef.current = user.id;
  }
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

  // Check event status when page loads (independent of Redux auth state)
  // This ensures that if user قبلا ثبت‌نام کرده، دکمه از همون لحظه ورود غیرفعال و متن مناسب نمایش داده شود
  useEffect(() => {
    if (eventId && !hasCheckedEventStatus) {
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

      // Small delay to avoid racing with initial auth/order fetching
      const timeoutId = setTimeout(() => {
        checkStatus();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [eventId, hasCheckedEventStatus, checkEvent]);

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

  // Handle auto-register for free events after login
  useEffect(() => {
    const autoRegister = searchParams.get("autoRegister");
    const canAttempt =
      autoRegister === "true" &&
      event &&
      eventId &&
      !orderLoading &&
      !hasAttemptedAutoRegister;

    if (!canAttempt) return;

    const runAutoRegister = async () => {
      // Prevent duplicate attempts if effect re-runs
      setHasAttemptedAutoRegister(true);
      setOrderLoading(true);

      try {
        // Ensure session is authenticated even if Redux auth state hasn't hydrated yet
        const authRes = await fetch("/api/auth/check-auth", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const authData = await authRes.json().catch(() => ({}));
        if (!authRes.ok || !authData?.isAuthenticated) {
          // If not authenticated, allow future retries (e.g., after token refresh)
          setHasAttemptedAutoRegister(false);
          return;
        }

        // Verify current status to avoid duplicate tickets
        const result = await checkEvent(eventId);
        const payload = unwrapResult(result);
        const { ticket } = payload;

        // If user already has a ticket, just redirect to dashboard
        if (ticket) {
          toast("شما قبلا این ایونت رو تهیه کردید", {
            icon: "ℹ️",
            duration: 4000,
          });
          router.push(`/dashboard?eventId=${eventId}`);
          return;
        }

        // Only auto-register for free events
        const isFreeEvent =
          (event.paymentType || event.payment_type) === "free" ||
          (event.tickets &&
            event.tickets.length > 0 &&
            event.tickets[0]?.price === 0);

        if (!isFreeEvent) {
          return;
        }

        const success = await createOrder();
        if (success) {
          // createOrder handles redirect for free events; remove autoRegister flag
          const newUrl = window.location.pathname;
          router.replace(newUrl);
        }
      } catch (error) {
        console.error("Error in auto-register:", error);
        toast.error("خطا در ثبت نام خودکار");
        // Allow re-attempt if something transient failed
        setHasAttemptedAutoRegister(false);
      } finally {
        setOrderLoading(false);
      }
    };

    const timeoutId = setTimeout(runAutoRegister, 400);
    return () => clearTimeout(timeoutId);
  }, [
    searchParams,
    event,
    eventId,
    checkEvent,
    createOrder,
    router,
    orderLoading,
    hasAttemptedAutoRegister,
  ]);

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return { date: "", time: "" };
    const trimmed = dateString.trim();

    // اگر تاریخ/ساعت به‌صورت شمسی از بک‌اند آمده (مثلاً "1404/09/07 23:30:00")
    // بدون تبدیل تقویم استفاده می‌کنیم تا سال و ساعت جابه‌جا نشود
    const jalaliMatch = trimmed.match(
      /^(\d{3,4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\s+(\d{1,2}:\d{2})(?::\d{2})?)?$/
    );

    if (jalaliMatch) {
      const year = parseInt(jalaliMatch[1], 10);
      if (year >= 1300 && year <= 1600) {
        const month = jalaliMatch[2].padStart(2, "0");
        const day = jalaliMatch[3].padStart(2, "0");
        const datePart = `${year}/${month}/${day}`;
        const timePart = jalaliMatch[4] || "";
        return { date: datePart, time: timePart };
      }
    }

    try {
      const date = new Date(trimmed);
      if (isNaN(date.getTime())) {
        return { date: dateString, time: "" };
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return {
        date: `${year}/${month}/${day}`,
        time: `${hours}:${minutes}`,
      };
    } catch {
      return { date: dateString, time: "" };
    }
  };

  const formatDate = (dateString?: string) => {
    return formatDateTime(dateString).date;
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

        {/* Main Content Skeleton - Unified */}
        <section className="relative bg-gradient-to-b from-[#080358] to-[#0a0440]">
          <div className="py-12 sm:py-16 md:py-20">
            <Container>
              <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
                {/* Left Side - Image and Details */}
                <div className="space-y-8">
                  {/* Image Skeleton */}
                  <div className="w-full aspect-square bg-[#080358]/40 rounded-2xl"></div>

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

                {/* Right Side - Event Info Card */}
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
          </div>
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

      {/* Main Content - Unified Section */}
      <section className="relative bg-gradient-to-b from-[#080358] to-[#0a0440]">
        <div className="py-12 sm:py-16 md:py-20">
          <Container>
            <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
              {/* Left Side - Image and Details */}
              <div className="space-y-8">
                {/* Event Image */}
                <div className="relative w-full aspect-square lg:aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                  {event.image &&
                  isValidImageUrl(event.image) &&
                  !imageError ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-contain"
                      onError={() => setImageError(true)}
                      unoptimized
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
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
                </div>

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
                      <p
                        className="text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-line text-right text-justify"
                        dir="rtl"
                      >
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

              {/* Right Side - Event Info Card */}
              <div className="lg:col-span-1 lg:pt-2">
                <div className="sticky top-20 space-y-6">
                  {/* Event Info Card */}
                  <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-lg shadow-black/20">
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
                            <p className="text-gray-400 text-sm">
                              تاریخ برگزاری
                            </p>
                            <p className="text-white font-semibold">
                              {formatDateTime(event.startDate).date}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Time */}
                      {event.startDate &&
                        formatDateTime(event.startDate).time && (
                          <div className="flex items-start gap-3 flex-row-reverse">
                            <svg
                              className="w-6 h-6 text-gray-300 flex-shrink-0 mt-1"
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
                            <div className="text-right">
                              <p className="text-gray-400 text-sm">
                                ساعت برگزاری
                              </p>
                              <p className="text-white font-semibold">
                                {formatDateTime(event.startDate).time}
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Event Type */}
                      {event.eventType && (
                        <div className="flex items-start gap-3 flex-row-reverse">
                          <svg
                            className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {event.eventType === "online" ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            )}
                          </svg>
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">نوع رویداد</p>
                            <p className="text-white font-semibold">
                              {event.eventType === "online"
                                ? "آنلاین"
                                : "حضوری"}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Location & Vicinity - Only show for physical events */}
                      {event.vicinity && event.eventType !== "online" && (
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
                            <p className="text-gray-400 text-sm">محدوده</p>
                            <p className="text-white font-semibold">
                              {event.vicinity}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Price */}
                      {((event.tickets &&
                        event.tickets.length > 0 &&
                        event.tickets[0]?.price !== undefined &&
                        event.tickets[0]?.price !== null) ||
                        event.paymentType ||
                        event.payment_type) && (
                        <div className="flex items-start gap-3 flex-row-reverse">
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">هزینه</p>
                            <p className="text-white font-semibold font-vazirmatn">
                              {(event.paymentType || event.payment_type) ===
                                "free" ||
                              (event.tickets &&
                                event.tickets.length > 0 &&
                                event.tickets[0]?.price === 0)
                                ? "رایگان"
                                : event.tickets &&
                                  event.tickets.length > 0 &&
                                  event.tickets[0]?.price
                                ? `${event.tickets[0].price.toLocaleString(
                                    "fa-IR"
                                  )} ریال`
                                : "رایگان"}
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
                  {isEventCompleted ? (
                    <button
                      disabled
                      className="w-full bg-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl cursor-not-allowed text-sm"
                    >
                      این رویداد به اتمام رسیده است
                    </button>
                  ) : event.tickets &&
                    event.tickets.length > 0 &&
                    event.tickets[0]?.isAvailable === false ? (
                    <button
                      disabled
                      className="w-full bg-gray-700 text-gray-400 font-bold py-3 px-6 rounded-xl cursor-not-allowed text-sm"
                    >
                      ثبت نام در رویداد
                    </button>
                  ) : hasPurchased ? (
                    <button
                      disabled
                      className="w-full bg-gray-700 text-gray-400 font-bold py-3 px-6 rounded-xl cursor-not-allowed text-sm"
                    >
                      شما قبلا این ایونت رو تهیه کردید
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={orderLoading}
                      className="w-full bg-[#f84920] hover:bg-[#e63e1a] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-[#f84920]/20 disabled:opacity-60 text-sm"
                    >
                      {orderLoading ? "در حال ثبت..." : "ثبت نام در رویداد"}
                    </button>
                  )}

                  {/* Refresh Button - Only for Admin */}
                  {isAdmin && (
                    <button
                      onClick={() => fetchEventDetail(true)}
                      disabled={loading}
                      className="w-full border border-blue-500/50 hover:border-blue-400 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 text-sm disabled:opacity-50"
                    >
                      {loading
                        ? "در حال به‌روزرسانی..."
                        : "🔄 به‌روزرسانی داده‌ها"}
                    </button>
                  )}

                  {/* Back Button */}
                  <button
                    onClick={() => router.back()}
                    className="w-full border border-white/20 hover:border-white/40 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 text-sm"
                  >
                    بازگشت
                  </button>
                </div>
              </div>
            </div>
          </Container>
        </div>
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
