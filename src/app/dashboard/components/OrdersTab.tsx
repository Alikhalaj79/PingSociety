"use client";

interface Order {
  id: number | string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  quantity?: number;
  createdAt?: string;
  event?: { id?: number | string; title?: string };
}

interface OrdersTabProps {
  orders: Order[];
}

const statusClass = (status?: string) => {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "CONFIRMED":
    case "PAID":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "CANCELLED":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
};

export default function OrdersTab({ orders }: OrdersTabProps) {
  // Filter orders: only show PENDING orders (not PAID, CONFIRMED, or COMPLETED)
  // Orders that are paid and converted to tickets should not be shown
  const pendingOrders = orders.filter(
    (order) => order.status && order.status.toUpperCase() === "PENDING"
  );

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-6">سفارش‌های من</h2>

      {!pendingOrders || pendingOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧾</div>
          <p className="text-white/60 text-lg">سفارشی ثبت نکرده‌اید</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingOrders.map((order) => (
            <div
              key={String(order.id)}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  {order.event?.title ||
                    order.orderNumber ||
                    `سفارش #${order.id}`}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${statusClass(
                    order.status
                  )}`}
                >
                  {order.status || "نامشخص"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-white/60 mb-2">
                {order.orderNumber && <p>شماره سفارش: {order.orderNumber}</p>}
                {order.quantity != null && <p>تعداد: {order.quantity}</p>}
                {order.totalAmount != null && (
                  <p>مبلغ: {order.totalAmount.toLocaleString("fa-IR")} ریال</p>
                )}
                {order.createdAt && <p>تاریخ ثبت: {order.createdAt}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}