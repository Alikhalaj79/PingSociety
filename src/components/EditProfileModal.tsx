"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";
import ModalPortal from "@/components/ModalPortal";

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

interface EditProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function EditProfileModal({
  user,
  isOpen,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [faOptions, setFaOptions] = useState<
    { value: string; label: string }[]
  >([
    { value: "", label: "- انتخاب کنید -" },
    { value: "software_development", label: "Software Development" },
    { value: "frontend_developer", label: "Frontend Developer" },
    { value: "design_ux", label: "Design / UX" },
    { value: "product_management", label: "Product Management" },
    { value: "data_science", label: "Data Science" },
    { value: "devops", label: "DevOps" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "ai_ml", label: "AI / ML" },
    { value: "blockchain", label: "Blockchain" },
    { value: "cloud_computing", label: "Cloud Computing" },
    { value: "mobile_development", label: "Mobile Development" },
    { value: "game_development", label: "Game Development" },
    { value: "qa_testing", label: "QA / Testing" },
    { value: "it_management", label: "IT Management" },
    { value: "sales_marketing", label: "Sales / Marketing" },
    { value: "others", label: "Others" },
  ]);
  const [sourceOptions, setSourceOptions] = useState<
    { value: string; label: string }[]
  >([
    { value: "", label: "- انتخاب کنید -" },
    { value: "website", label: "وب‌سایت" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "instagram", label: "Instagram" },
    { value: "word_of_mouth", label: "دوستان و آشنایان" },
    { value: "others", label: "سایر" },
  ]);
  const router = useRouter();

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const res = await fetch("/api/meta/user-profile-options", {
          cache: "no-store",
        });
        const json = await res.json();
        if (res.ok && json?.success) {
          const toOptions = (
            arr: unknown[]
          ): { value: string; label: string }[] =>
            Array.isArray(arr)
              ? arr.map((x: unknown) => {
                  if (typeof x === "string") return { value: x, label: x };
                  if (x && typeof x === "object") {
                    const obj = x as Record<string, unknown>;
                    const value = String(obj.value ?? obj.key ?? obj.id ?? "");
                    const label = String(
                      obj.label ??
                        obj.name ??
                        obj.value ??
                        obj.key ??
                        obj.id ??
                        ""
                    );
                    return { value, label };
                  }
                  return { value: "", label: "" };
                })
              : [];
          const fa = toOptions(json.fieldOfActivity);
          const src = toOptions(json.source);
          if (fa.length)
            setFaOptions([{ value: "", label: "- انتخاب کنید -" }, ...fa]);
          if (src.length)
            setSourceOptions([{ value: "", label: "- انتخاب کنید -" }, ...src]);
        }
      } catch {
        // keep defaults
      }
    };
    loadOptions();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      document.body.style.overflow = "hidden";
    } else {
      setShowModal(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
      document.body.style.overflow = "";
    }, 200);
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const profileData = {
      fullname: (formData.get("fullname") as string) || "",
      email: (formData.get("email") as string) || "",
      company: (formData.get("company") as string) || "",
      fieldOfActivity: (formData.get("fieldOfActivity") as string) || "",
      source: (formData.get("source") as string) || "",
    };

    if (!profileData.fullname || profileData.fullname.trim() === "") {
      setMessage("نام کامل الزامی است");
      setIsSaving(false);
      return;
    }

    if (
      !profileData.fieldOfActivity ||
      profileData.fieldOfActivity.trim() === ""
    ) {
      setMessage("زمینه فعالیت الزامی است");
      setIsSaving(false);
      return;
    }

    if (!profileData.source || profileData.source.trim() === "") {
      setMessage("منبع الزامی است");
      setIsSaving(false);
      return;
    }

    const cleanProfileData = Object.fromEntries(
      Object.entries(profileData).filter(
        ([, value]) => value && value.trim() !== ""
      )
    );

    try {
      const response = await fetch(`/api/user/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cleanProfileData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setMessage("پروفایل با موفقیت به‌روزرسانی شد");
        setTimeout(() => {
          closeModal();
          if (onSave) {
            onSave();
          } else {
            router.refresh();
          }
        }, 800);
      } else {
        setMessage(result.error || "خطا در به‌روزرسانی پروفایل");
      }
    } catch {
      setMessage("خطا در به‌روزرسانی پروفایل");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${
          showModal ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={closeModal}
        ></div>
        <div
          className={`relative z-10 w-full max-w-xl p-0 overflow-hidden transition-all duration-200 ${
            showModal ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
        >
          <div className="p-[1px] rounded-2xl bg-gradient-to-br from-white/20 via-white/10 to-white/5 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
            <div className="rounded-2xl bg-[#080358] text-white border border-white/10 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080358]/95">
                <h4 id="edit-profile-title" className="text-xl font-bold">
                  ویرایش اطلاعات کاربری
                </h4>
                <button
                  onClick={closeModal}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition"
                  aria-label="بستن"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="space-y-4 p-6 max-h-[80vh] overflow-y-auto"
              >
                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    نام کامل *
                  </label>
                  <input
                    type="text"
                    name="fullname"
                    defaultValue={user.fullname || ""}
                    placeholder="نام کامل خود را وارد کنید"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200"
                    required
                    title="لطفاً نام کامل را وارد کنید"
                    onInvalid={(e) => {
                      e.currentTarget.setCustomValidity(
                        "لطفاً نام کامل را وارد کنید"
                      );
                    }}
                    onInput={(e) => {
                      e.currentTarget.setCustomValidity("");
                    }}
                  />
                </div>

                {/* <div>
                  <label className="block text-white/80 text-sm mb-2">
                    ایمیل *
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={user.email || ""}
                    placeholder="ایمیل خود را وارد کنید"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200"
                    required
                    title="لطفاً ایمیل را وارد کنید"
                    onInvalid={(e) => {
                      const target = e.currentTarget;
                      if (target.validity.valueMissing) {
                        target.setCustomValidity("لطفاً ایمیل را وارد کنید");
                      } else if (target.validity.typeMismatch) {
                        target.setCustomValidity("لطفاً یک ایمیل معتبر وارد کنید");
                      }
                    }}
                    onInput={(e) => {
                      e.currentTarget.setCustomValidity("");
                    }}
                  />
                </div> */}

                {/* <div>
                  <label className="block text-white/80 text-sm mb-2">
                    شرکت (اختیاری)
                  </label>
                  <input
                    type="text"
                    name="company"
                    defaultValue={user.company || ""}
                    placeholder="نام شرکت خود را وارد کنید"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#F84920] focus:border-transparent transition-all duration-200"
                  />
                </div> */}

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    زمینه فعالیت *
                  </label>
                  <Select
                    name="fieldOfActivity"
                    defaultValue={user.fieldOfActivity || ""}
                    options={faOptions}
                    required
                    validationMessage="لطفاً زمینه فعالیت را انتخاب کنید"
                  />
                  <p className="mt-1 text-xs text-white/50">
                    یکی از حوزه‌ها را انتخاب کنید
                  </p>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    محل آشنایی *
                  </label>
                  <Select
                    name="source"
                    defaultValue={user.source || ""}
                    options={sourceOptions}
                    required
                    validationMessage="لطفاً منبع را انتخاب کنید"
                  />
                  <p className="mt-1 text-xs text-white/50">
                    محل آشنایی با سرویس را انتخاب کنید
                  </p>
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

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-[#F84920] text-white py-3 px-4 rounded-lg hover:bg-[#e63e1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 border border-white/20 text-white/80 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    انصراف
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
