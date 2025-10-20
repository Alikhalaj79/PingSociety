"use client";

import Link from "next/link";

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
  moderatedEvents: any[];
  tickets: any[];
  orders: any[];
  payments: any[];
  sponsor?: any;
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

interface OverviewTabProps {
  tickets: Ticket[];
}

export default function OverviewTab({ tickets }: OverviewTabProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "used":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
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
      case "confirmed":
        return "تایید شده";
      case "pending":
        return "در انتظار";
      default:
        return "نامشخص";
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-6">نمای کلی</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">بلیط‌های فعال</p>
              <p className="text-3xl font-bold text-white">
                {tickets.filter((t) => t.status === "active").length}
              </p>
            </div>
            <div className="text-[#F84920] text-3xl">🎫</div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">کل بلیط‌ها</p>
              <p className="text-3xl font-bold text-white">{tickets.length}</p>
            </div>
            <div className="text-[#F84920] text-3xl">📋</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">بلیط‌های اخیر</h3>
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-white/60 text-lg">
              هنوز بلیطی خریداری نکرده‌اید
            </p>
            <Link
              href="/"
              className="inline-block mt-4 bg-[#F84920] text-white px-6 py-2 rounded-lg hover:bg-[#e63e1a] transition-colors"
            >
              مشاهده رویدادها
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{ticket.eventTitle}</p>
                  <p className="text-white/60 text-sm">
                    {new Date(ticket.eventDate).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {getStatusText(ticket.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
