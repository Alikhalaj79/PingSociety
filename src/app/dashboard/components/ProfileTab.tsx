"use client";

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

interface ProfileTabProps {
  user: User;
}

export default function ProfileTab({ user }: ProfileTabProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <h2 className="text-2xl font-bold text-white mb-6">پروفایل</h2>
      {/* فرم و خروج به سایدبار منتقل شد */}
    </div>
  );
}
