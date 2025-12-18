"use client";

import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Link from "next/link";
import OverviewTab from "./components/OverviewTab";
import UserInfoSidebar from "./components/UserInfoSidebar";
import toast from "react-hot-toast";

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

interface Ticket {
  id: string;
  eventTitle: string;
  eventDate: string;
  status: "active" | "used" | "cancelled";
  qrCode?: string;
}

interface Order {
  id: string;
  eventTitle: string;
  totalAmount: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

interface UserDashboardProps {
  initialUser?: User;
}

export default function UserDashboard({ initialUser }: UserDashboardProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(!initialUser);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelingOrders, setCancelingOrders] = useState<Set<string | number>>(
    new Set()
  );
  const [cancelConfirmOrderId, setCancelConfirmOrderId] = useState<
    string | number | null
  >(null);
  // Tabs removed; show combined content in main area
  // const _router = useRouter();

  const fetchTicketsAndOrders = useCallback(async () => {
    try {
      setDataLoading(true);
      const loadTickets = async () => {
        const params = new URLSearchParams(
          typeof window !== "undefined" ? window.location.search : ""
        );
        const eventId = params.get("eventId");
        const ticketNumber = params.get("ticketNumber");
        const query = new URLSearchParams();
        if (eventId) query.set("eventId", eventId);
        if (ticketNumber) query.set("ticketNumber", ticketNumber);
        const url = query.toString()
          ? `/api/user/tickets?${query.toString()}`
          : "/api/user/tickets";
        const ticketsResponse = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (ticketsResponse.ok) {
          const ticketsData = await ticketsResponse.json();
          return (ticketsData && ticketsData.tickets) || [];
        }
        return [];
      };

      // Initial tickets fetch
      let fetchedTickets = await loadTickets();
      // If empty (e.g., right after order creation), retry once after a brief delay
      if (Array.isArray(fetchedTickets) && fetchedTickets.length === 0) {
        await new Promise((r) => setTimeout(r, 1200));
        fetchedTickets = await loadTickets();
      }
      setTickets(fetchedTickets);

      // Fetch user orders (kept as-is)
      const ordersResponse = await fetch("/api/user/orders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders || []);
      }
    } catch (error) {
      console.error("Error fetching tickets and orders:", error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch user profile using /api/user/me
      const userResponse = await fetch("/api/user/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        if (userData.isAuthenticated && userData.user) {
          setUser(userData.user);
        }
      }

      // Fetch tickets and orders
      await fetchTicketsAndOrders();
    } catch (error) {
      setError("خطا در دریافت اطلاعات کاربر");
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchTicketsAndOrders]);

  useEffect(() => {
    // Only fetch if we don't have initial user data
    if (!initialUser) {
      fetchUserData();
    } else {
      // Sync local state with updated initialUser after refresh
      setUser(initialUser);
      // Still fetch tickets and orders
      fetchTicketsAndOrders();
    }

    // Listen for refresh event (e.g., after successful payment)
    const handleRefresh = () => {
      console.log("🔄 Refreshing dashboard data...");
      fetchTicketsAndOrders();
    };

    window.addEventListener("refresh-dashboard", handleRefresh);

    return () => {
      window.removeEventListener("refresh-dashboard", handleRefresh);
    };
  }, [initialUser, fetchUserData, fetchTicketsAndOrders]);

  const handleCancelClick = (orderId: string | number) => {
    setCancelConfirmOrderId(orderId);
  };

  const handleCancelConfirm = async () => {
    if (!cancelConfirmOrderId) return;

    const orderId = cancelConfirmOrderId;
    setCancelConfirmOrderId(null);

    try {
      setCancelingOrders((prev) => new Set(prev).add(orderId));
      const response = await fetch(`/api/order/${orderId}/cancel`, {
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
        // Reload the page to refresh orders
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
      setCancelingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  const handleCancelCancel = () => {
    setCancelConfirmOrderId(null);
  };

  if (loading) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F84920] mx-auto"></div>
            <p className="text-white/80 mt-4">در حال بارگذاری...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="py-12">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#F84920] text-white px-6 py-2 rounded-lg hover:bg-[#e63e1a] transition-colors"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8" dir="rtl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-end mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <span>بازگشت به صفحه اصلی</span>
              <span>→</span>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">پنل کاربری</h1>
          <p className="text-white/80">
            خوش آمدید {user?.fullname || user?.phone}
          </p>
        </div>

        {/* Content + Right Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-80 lg:shrink-0">
            <UserInfoSidebar user={user} />
          </div>
          <div className="flex-1">
            <div className="bg-[#080358]/60 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <OverviewTab
                tickets={tickets}
                orders={orders}
                loading={dataLoading}
                onCancelClick={handleCancelClick}
                cancelingOrders={cancelingOrders}
              />
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {cancelConfirmOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                  disabled={cancelingOrders.has(cancelConfirmOrderId)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  انصراف
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelingOrders.has(cancelConfirmOrderId)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelingOrders.has(cancelConfirmOrderId)
                    ? "در حال لغو..."
                    : "بله، لغو کن"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
