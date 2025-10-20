"use client";

import Link from "next/link";

interface Ticket {
  id: string;
  eventTitle: string;
  eventDate: string;
  status: "active" | "used" | "cancelled";
  qrCode?: string;
}

interface TicketsTabProps {
  tickets: Ticket[];
}

export default function TicketsTab({ tickets }: TicketsTabProps) {
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

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-6">بلیط‌های من</h2>

      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎫</div>
          <p className="text-white/60 text-lg">هنوز بلیطی خریداری نکرده‌اید</p>
          <Link
            href="/"
            className="inline-block mt-4 bg-[#F84920] text-white px-6 py-2 rounded-lg hover:bg-[#e63e1a] transition-colors"
          >
            مشاهده رویدادها
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  {ticket.eventTitle}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    ticket.status
                  )}`}
                >
                  {getStatusText(ticket.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-white/60 mb-4">
                <p>
                  📅 {new Date(ticket.eventDate).toLocaleDateString("fa-IR")}
                </p>
                <p>🎫 کد بلیط: {ticket.id}</p>
              </div>

              {ticket.status === "active" && (
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#F84920] text-white py-2 px-4 rounded-lg hover:bg-[#e63e1a] transition-colors text-sm">
                    نمایش QR Code
                  </button>
                  <button className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors text-sm">
                    دانلود
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
