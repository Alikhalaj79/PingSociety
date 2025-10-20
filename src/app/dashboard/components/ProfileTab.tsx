"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface ProfileTabProps {
  user: User;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      // Redirect to home
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage("خطا در خروج از حساب کاربری");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const formData = new FormData(e.currentTarget);
      const profileData = {
        fullname: formData.get("fullname"),
        email: formData.get("email"),
        company: formData.get("company"),
        fieldOfActivity: formData.get("fieldOfActivity"),
      };

      // TODO: Implement profile update API
      console.log("Profile update data:", profileData);

      setMessage("پروفایل با موفقیت به‌روزرسانی شد");
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("خطا در به‌روزرسانی پروفایل");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-6">پروفایل</h2>

      {/* User Info Display */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">اطلاعات کاربری</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-white/60">شماره موبایل:</span>
            <span className="text-white mr-3">{user?.phone || "نامشخص"}</span>
          </div>
          <div>
            <span className="text-white/60">نام کامل:</span>
            <span className="text-white mr-3">
              {user?.fullname || "وارد نشده"}
            </span>
          </div>
          <div>
            <span className="text-white/60">ایمیل:</span>
            <span className="text-white mr-3">
              {user?.email || "وارد نشده"}
            </span>
          </div>
          <div>
            <span className="text-white/60">شرکت:</span>
            <span className="text-white mr-3">
              {user?.company || "وارد نشده"}
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-white/60">زمینه فعالیت:</span>
            <span className="text-white mr-3">
              {user?.fieldOfActivity || "وارد نشده"}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">
              شماره موبایل
            </label>
            <input
              type="text"
              value={user?.phone || ""}
              disabled
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white/60"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              نام کامل (اختیاری)
            </label>
            <input
              type="text"
              name="fullname"
              defaultValue={user?.fullname || ""}
              placeholder="نام کامل خود را وارد کنید"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              ایمیل (اختیاری)
            </label>
            <input
              type="email"
              name="email"
              defaultValue={user?.email || ""}
              placeholder="ایمیل خود را وارد کنید"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              شرکت (اختیاری)
            </label>
            <input
              type="text"
              name="company"
              defaultValue={user?.company || ""}
              placeholder="نام شرکت خود را وارد کنید"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">
              زمینه فعالیت (اختیاری)
            </label>
            <input
              type="text"
              name="fieldOfActivity"
              defaultValue={user?.fieldOfActivity || ""}
              placeholder="زمینه فعالیت خود را وارد کنید"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.includes("موفقیت")
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#F84920] text-white py-3 px-4 rounded-lg hover:bg-[#e63e1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              className="px-6 py-3 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              خروج
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
