"use client";

import { useState, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Link from "next/link";
import OverviewTab from "./components/OverviewTab";
import TicketsTab from "./components/TicketsTab";
import ProfileTab from "./components/ProfileTab";

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
  const [, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "tickets" | "profile"
  >("overview");
  // const _router = useRouter();

  const fetchTicketsAndOrders = useCallback(async () => {
    try {
      // Fetch user tickets
      const ticketsResponse = await fetch("/api/user/tickets", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (ticketsResponse.ok) {
        const ticketsData = await ticketsResponse.json();
        setTickets(ticketsData.tickets || []);
      }

      // Fetch user orders
      const ordersResponse = await fetch("/api/user/orders", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
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

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[
            { id: "overview", label: "نمای کلی" },
            { id: "tickets", label: "بلیط‌های من" },
            { id: "profile", label: "پروفایل" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as "overview" | "tickets" | "profile")
              }
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#F84920] text-white"
                  : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {activeTab === "overview" && <OverviewTab tickets={tickets} />}
          {activeTab === "tickets" && <TicketsTab tickets={tickets} />}
          {activeTab === "profile" && user && <ProfileTab user={user} />}
        </div>
      </div>
    </Container>
  );
}
