"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/Container";
import Header from "@/components/Header";
import Footer from "@/components/homePage/Footer";
import toast from "react-hot-toast";
import { useOrdersRTK } from "@/hooks/useOrdersRTK";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshOrders, refreshTickets } = useOrdersRTK();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get parameters from URL (Zarinpal sends Authority and Status in query string)
        const authority = searchParams.get("Authority");
        const statusParam = searchParams.get("Status");

        if (!authority) {
          setStatus("error");
          setMessage("اطلاعات پرداخت یافت نشد");
          toast.error("اطلاعات پرداخت یافت نشد");
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
          return;
        }

        // Call callback API (GET endpoint - public, called by Zarinpal)
        const response = await fetch(
          `/api/payment/callback?Authority=${authority}&Status=${
            statusParam || ""
          }`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();
        console.log("Payment verify response:", data);

        if (response.ok && data.success) {
          setStatus("success");
          // نمایش پیام کاملاً فارسی و ثابت، بدون وابستگی به متن بک‌اند
          setMessage(
            "پرداخت شما با موفقیت انجام شد. تا چند لحظه دیگر به داشبورد منتقل می‌شوید."
          );
          toast.success("پرداخت با موفقیت انجام شد");

          // Refresh orders and tickets after successful payment
          refreshOrders();
          refreshTickets();

          // Dispatch event to refresh dashboard data (tickets and orders)
          try {
            window.dispatchEvent(new Event("refresh-dashboard"));
          } catch {}

          setTimeout(() => {
            router.push("/dashboard?tab=overview");
          }, 1500);
        } else {
          setStatus("error");
          // پیام فارسی برای حالت ناموفق / لغو تراکنش
          setMessage(
            "پرداخت انجام نشد یا توسط شما لغو شد. در صورت کسر وجه، حداکثر تا ۷۲ ساعت آینده به حساب شما بازگردانده می‌شود."
          );
          toast.error("پرداخت ناموفق بود");

          // Refresh orders and tickets after failed payment to ensure PENDING order is still available
          // The order should remain in PENDING status after failed payment
          refreshOrders();
          refreshTickets();

          // Dispatch event to refresh dashboard data
          try {
            window.dispatchEvent(new Event("refresh-dashboard"));
          } catch {}

          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      } catch (error) {
        console.error("Payment verify error:", error);
        setStatus("error");
        setMessage("خطا در بررسی وضعیت پرداخت");
        toast.error("خطا در بررسی وضعیت پرداخت");

        // Refresh orders and tickets in case of error to ensure data is up to date
        refreshOrders();
        refreshTickets();

        // Dispatch event to refresh dashboard data
        try {
          window.dispatchEvent(new Event("refresh-dashboard"));
        } catch {}

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    };

    verifyPayment();
  }, [searchParams, router, refreshOrders, refreshTickets]);

  return (
    <div className="min-h-screen bg-[#080358] text-white">
      <Header />
      <div className="py-20">
        <Container>
          <div className="max-w-md mx-auto text-center">
            {status === "loading" && (
              <div className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#F84920]/30">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#F84920]"></div>
                </div>
                <h2 className="text-2xl font-bold">در حال بررسی پرداخت...</h2>
                <p className="text-gray-300">لطفاً چند لحظه صبر کنید</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-6 bg-emerald-500/10 border border-emerald-400/40 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <svg
                  className="w-16 h-16 mx-auto text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-emerald-300">
                  پرداخت موفق
                </h2>
                <p className="text-gray-100 leading-relaxed">{message}</p>
                <p className="text-sm text-gray-300">
                  در حال انتقال خودکار به داشبورد پینگ‌سوسایتی...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-6 bg-red-500/10 border border-red-400/40 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <svg
                  className="w-16 h-16 mx-auto text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-bold text-red-300">
                  پرداخت ناموفق
                </h2>
                <p className="text-gray-100 leading-relaxed">{message}</p>
                <p className="text-sm text-gray-300">
                  در حال بازگشت به داشبورد؛ در صورت نیاز می‌توانید مجدداً برای پرداخت اقدام کنید.
                </p>
              </div>
            )}
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}


export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080358] text-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#F84920] mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold">در حال بارگذاری...</h2>
            <p className="text-gray-400">لطفا صبر کنید</p>
          </div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
