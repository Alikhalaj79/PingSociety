import type { Metadata } from "next";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthInitializer } from "@/components/AuthInitializer";

export const metadata: Metadata = {
  title: "PingSociety | دورهمی بچه های Tech",
  description:
    "کامیونیتی تخصصی برای علاقه مندان و فعالان حوزه فناوری. هدف ما ایجاد بستری برای شبکه سازی، به اشتراک گذاری تجربه ها و کشف فرصتهای جدید در جامعهی تکنولوژی است.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa">
      <body className="antialiased">
        <ReduxProvider>
          <AuthProvider>
            <AuthInitializer />
            {children}
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
