"use client";

import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Link from "next/link";
import TicketsTab from "./components/TicketsTab";
import OrdersTab from "./components/OrdersTab";
import UserInfoSidebar from "./components/UserInfoSidebar";

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
  const [error, setError] = useState("");
  // Tabs removed; show combined content in main area
  // const _router = useRouter();

  const fetchTicketsAndOrders = useCallback(async () => {
    try {
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
  }, [initialUser, fetchUserData, fetchTicketsAndOrders]);

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

  const activeTab =
    (typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("tab")) ||
    "tickets";

  const setTab = (tab: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    } catch {}
  };

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

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setTab("tickets")}
            className={`px-4 py-2 rounded-lg text-sm border ${
              activeTab === "tickets"
                ? "bg-white/20 text-white border-white/30"
                : "text-white/70 border-white/20 hover:bg-white/10"
            }`}
          >
            بلیط‌ها
          </button>
          <button
            onClick={() => setTab("orders")}
            className={`px-4 py-2 rounded-lg text-sm border ${
              activeTab === "orders"
                ? "bg-white/20 text-white border-white/30"
                : "text-white/70 border-white/20 hover:bg-white/10"
            }`}
          >
            سفارش‌ها
          </button>
        </div>

        {/* Content + Right Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-80 lg:shrink-0">
            <UserInfoSidebar user={user} />
          </div>
          <div className="flex-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              {activeTab === "orders" ? (
                <OrdersTab orders={orders} />
              ) : (
                <TicketsTab tickets={tickets} />
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
