"use client";

// interface User {
//   id: number;
//   phone: string;
//   fullname?: string;
//   email?: string;
//   company?: string;
//   fieldOfActivity?: string;
//   source?: string;
//   role: string;
//   created_at: string;
//   updated_at: string;
//   moderatedEvents: unknown[];
//   tickets: unknown[];
//   orders: unknown[];
//   payments: unknown[];
//   sponsor?: unknown;
// }

interface Ticket {
  id: string;
  eventTitle: string;
  eventDate: string;
  status: "active" | "used" | "cancelled";
  qrCode?: string;
}

// interface Order {
//   id: string;
//   eventTitle: string;
//   totalAmount: number;
//   status: "pending" | "confirmed" | "cancelled";
//   createdAt: string;
// }

interface OverviewTabProps {
  tickets: Ticket[];
}

export default function OverviewTab({ tickets }: OverviewTabProps) {
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
    </div>
  );
}
