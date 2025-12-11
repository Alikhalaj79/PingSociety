"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EditProfileModal from "@/components/EditProfileModal";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: number;
  phone: string;
  fullname?: string;
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

interface UserInfoSidebarProps {
  user: User | null;
}

export default function UserInfoSidebar({ user }: UserInfoSidebarProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => router.push("/"), 800);
    } catch {
      // noop
    }
  };

  const handleOpenModal = () => {
    setIsEditOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditOpen(false);
  };

  const handleSaveSuccess = () => {
    router.refresh();
  };

  if (!user) {
    return null;
  }

  return (
    <aside
      className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-5 lg:p-6"
      dir="rtl"
    >
      <h3 className="text-lg font-bold text-white mb-4">اطلاعات کاربر</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-white/60">نام کامل</span>
          <span className="text-white">{user.fullname || "وارد نشده"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">شماره موبایل</span>
          <span className="text-white">{user.phone || "نامشخص"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/60">زمینه فعالیت</span>
          <span className="text-white">
            {user.fieldOfActivity || "وارد نشده"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleOpenModal}
          className="w-full bg-[#F84920] text-white py-2.5 rounded-lg hover:bg-[#e63e1a] transition-colors"
        >
          تغییر اطلاعات کاربری
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full border border-red-500/30 text-red-400 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors"
        >
          خروج از حساب کاربری
        </button>
      </div>

      {user && (
        <EditProfileModal
          user={user}
          isOpen={isEditOpen}
          onClose={handleCloseModal}
          onSave={handleSaveSuccess}
        />
      )}
    </aside>
  );
}
